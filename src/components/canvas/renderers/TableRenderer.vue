<template>
  <BaseRenderer
    :component="component"
    :selected="selected"
    :hovered="hovered"
    @mousedown="$emit('mousedown', $event)"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @update="(id, updates) => $emit('update', id, updates)"
  >
    <div class="table-container" :style="containerStyle">
      <!-- 数据加载状态 -->
      <DataLoadingState
        :loading="loading"
        :error="error"
        :error-details="error"
        :empty="!loading && !error && tableData.length === 0"
        empty-text="暂无数据"
        :fullscreen="false"
        :show-retry="true"
        :show-details="true"
        :custom-style="{ minHeight: 'auto', padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }"
        @retry="refresh"
      >
        <!-- 表格内容 -->
        <el-table
          :data="paginatedData"
          :border="component.border"
          :stripe="component.stripe"
          :show-header="component.showHeader"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          style="width: 100%"
          v-loading="loading"
          element-loading-text="加载中..."
        >
          <el-table-column
            v-for="column in component.columns"
            :key="column.id"
            :prop="column.field"
            :label="column.label"
            :width="column.width === 0 ? undefined : column.width"
            :align="column.align"
          />
        </el-table>
      </DataLoadingState>

      <!-- 分页 - 移到 DataLoadingState 外部 -->
      <div v-if="component.pagination ?? true" class="pagination-container">
        <el-pagination
          :current-page="component.currentPage ?? 1"
          :page-size="component.pageSize ?? 10"
          :total="tableData.length"
          layout="prev, pager, next, sizes, total"
          :page-sizes="[3, 5, 10, 20, 50, 100]"
          small
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </BaseRenderer>
</template>

<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue';
import BaseRenderer from './BaseRenderer.vue';
import DataLoadingState from '../../common/DataLoadingState.vue';
import type { TableComponent } from '../../../types';
import { fetchWithLinkageParams } from '../../../utils/apiHelper';

const props = defineProps<{
  component: TableComponent;
  selected?: boolean;
  hovered?: boolean;
}>();

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void;
  (e: 'mouseenter'): void;
  (e: 'mouseleave'): void;
  (e: 'update', id: string, updates: any): void;
}>();

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  overflow: 'auto',
}));

const headerCellStyle = computed(() => ({
  backgroundColor: props.component.headerBackgroundColor,
  color: props.component.headerColor,
  fontSize: `${props.component.fontSize}px`,
}));

const cellStyle = computed(() => ({
  fontSize: `${props.component.fontSize}px`,
}));

// API数据缓存
const apiData = ref<any[] | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

/**
 * 从API获取数据
 */
async function fetchApiData() {
  const dataSource = props.component.dataSource;
  if (!dataSource || dataSource.type !== 'api') {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const data = await fetchWithLinkageParams(
      dataSource,
      props.component.linkageParams || {},
      props.component.beforeRequest
    );

    apiData.value = Array.isArray(data) ? data : [data];
  } catch (err: any) {
    error.value = err.message || '获取数据失败';
    apiData.value = [];
  } finally {
    loading.value = false;
  }
}

// 表格数据
const tableData = computed(() => {
  // 优先使用API数据
  if (apiData.value !== null) {
    return apiData.value;
  }

  // 使用静态数据
  if (props.component.dataSource?.staticData) {
    return props.component.dataSource.staticData;
  }

  // 返回示例数据（3条）
  const data = Array.from({ length: 3 }, (_, i) => {
    const row: any = {};
    props.component.columns.forEach((col) => {
      row[col.field] = `数据 ${i + 1}`;
    });
    return row;
  });
  return data;
});

/**
 * 刷新数据（供联动调用）
 */
function refresh() {
  fetchApiData();
}

/**
 * 处理联动刷新事件
 */
function handleLinkageRefresh(event: CustomEvent) {
  if (event.detail?.targetComponentId === props.component.id) {
    refresh();
  }
}

// 监听数据源变化
watch(
  () => props.component.dataSource,
  (newDataSource) => {
    if (newDataSource?.type === 'api') {
      fetchApiData();
    } else {
      apiData.value = null;
    }
  },
  { immediate: true }
);

// 监听联动参数变化
watch(
  () => props.component.linkageParams,
  (newParams) => {
    if (props.component.dataSource?.type === 'api') {
      fetchApiData();
    }
  },
  { deep: true }
);

// 挂载时添加事件监听
onMounted(() => {
  window.addEventListener('component-linkage-refresh', handleLinkageRefresh as EventListener);
});

// 卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('component-linkage-refresh', handleLinkageRefresh as EventListener);
});

// 暴露刷新方法供外部调用
defineExpose({
  refresh,
});

// 分页数据
const totalPages = computed(() => {
  const pagination = props.component.pagination ?? true;
  const pageSize = props.component.pageSize ?? 10;

  if (!pagination) return 1;
  return Math.ceil(tableData.value.length / pageSize);
});

const paginatedData = computed(() => {
  const pagination = props.component.pagination ?? true;
  const currentPage = props.component.currentPage ?? 1;
  const pageSize = props.component.pageSize ?? 10;

  if (!pagination) {
    return tableData.value;
  }

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const result = tableData.value.slice(start, end);
  return result;
});

function handlePageChange(page: number) {
  emit('update', props.component.id, { currentPage: page });
}

function handleSizeChange(size: number) {
  emit('update', props.component.id, { pageSize: size, currentPage: 1 });
}

// 监听分页配置变化
watch(
  () => [props.component.pagination, props.component.pageSize, props.component.currentPage],
  () => {
    // 分页配置变化时重新计算
  },
  { immediate: true }
);
</script>

<style scoped>
.table-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 覆盖 DataLoadingState 的默认样式 */
.table-container :deep(.data-loading-state) {
  min-height: 0 !important;
  padding: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
  flex: 1;
}

.table-container :deep(.el-table) {
  font-size: inherit;
  flex: 1;
  min-height: 0;
}

.table-container :deep(.el-table__body-wrapper) {
  flex: 1;
  overflow-y: auto;
}

/* 分页容器 - 固定在底部右对齐 */
.pagination-container {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 12px 0 0 0;
  margin-top: 0;
}

.pagination-container :deep(.el-pagination) {
  justify-content: flex-end;
  margin: 0;
}

.pagination-container :deep(.el-pagination__sizes) {
  margin-right: auto;
}
</style>
