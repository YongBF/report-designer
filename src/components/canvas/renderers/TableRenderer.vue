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

        <!-- 分页 -->
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
      </DataLoadingState>
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
    console.log('[TableRenderer] 开始获取API数据:', {
      url: dataSource.apiUrl,
      linkageParams: props.component.linkageParams,
    });

    const data = await fetchWithLinkageParams(
      dataSource,
      props.component.linkageParams || {},
      props.component.beforeRequest
    );

    console.log('[TableRenderer] API数据获取成功:', data);
    apiData.value = Array.isArray(data) ? data : [data];
  } catch (err: any) {
    console.error('[TableRenderer] API数据获取失败:', err);
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
    console.log('[TableRenderer] 使用API数据:', apiData.value.length, '条');
    return apiData.value;
  }

  // 使用静态数据
  if (props.component.dataSource?.staticData) {
    console.log('[TableRenderer] 使用静态数据:', props.component.dataSource.staticData.length, '条');
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
  console.log('[TableRenderer] 使用示例数据:', data.length, '条');
  return data;
});

/**
 * 刷新数据（供联动调用）
 */
function refresh() {
  console.log('[TableRenderer] 刷新数据');
  fetchApiData();
}

/**
 * 处理联动刷新事件
 */
function handleLinkageRefresh(event: CustomEvent) {
  console.log('[TableRenderer] 收到联动刷新事件:', event.detail);
  if (event.detail?.targetComponentId === props.component.id) {
    refresh();
  }
}

// 监听数据源变化
watch(
  () => props.component.dataSource,
  (newDataSource) => {
    console.log('[TableRenderer] 数据源变化:', newDataSource);
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
    console.log('[TableRenderer] 联动参数变化:', newParams);
    if (props.component.dataSource?.type === 'api') {
      fetchApiData();
    }
  },
  { deep: true }
);

// 挂载时添加事件监听
onMounted(() => {
  console.log('[TableRenderer] 挂载，添加联动刷新事件监听');
  window.addEventListener('component-linkage-refresh', handleLinkageRefresh as EventListener);
});

// 卸载时移除事件监听
onUnmounted(() => {
  console.log('[TableRenderer] 卸载，移除联动刷新事件监听');
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

  console.log('分页配置:', {
    pagination,
    currentPage,
    pageSize,
    totalData: tableData.value.length,
  });

  if (!pagination) {
    return tableData.value;
  }

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const result = tableData.value.slice(start, end);
  console.log('分页结果:', { start, end, displayCount: result.length }, result);
  return result;
});

function handlePageChange(page: number) {
  console.log('页码变化:', page);
  emit('update', props.component.id, { currentPage: page });
}

function handleSizeChange(size: number) {
  console.log('每页条数变化:', size);
  emit('update', props.component.id, { pageSize: size, currentPage: 1 });
}

// 监听分页配置变化
watch(
  () => [props.component.pagination, props.component.pageSize, props.component.currentPage],
  () => {
    console.log('分页配置更新:', {
      pagination: props.component.pagination,
      pageSize: props.component.pageSize,
      currentPage: props.component.currentPage,
    });
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
}

.table-container :deep(.el-table) {
  font-size: inherit;
  flex: 1;
}

.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}
</style>
