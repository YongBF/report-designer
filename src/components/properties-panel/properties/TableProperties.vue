<template>
  <el-form label-width="100px" size="small">
    <el-divider>表格配置</el-divider>

    <el-form-item label="显示表头">
      <el-switch v-model="localComponent.showHeader" @change="handleChange" />
    </el-form-item>

    <el-form-item label="斑马纹">
      <el-switch v-model="localComponent.stripe" @change="handleChange" />
    </el-form-item>

    <el-form-item label="边框">
      <el-switch v-model="localComponent.border" @change="handleChange" />
    </el-form-item>

    <el-form-item label="表头背景">
      <el-color-picker v-model="localComponent.headerBackgroundColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="表头文字">
      <el-color-picker v-model="localComponent.headerColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="字号">
      <el-input-number
        v-model="localComponent.fontSize"
        :min="10"
        :max="24"
        @change="handleChange"
      />
    </el-form-item>

    <el-divider>数据源配置</el-divider>

    <el-form-item label="数据源类型">
      <el-radio-group v-model="localDataSourceType" @change="handleDataSourceTypeChange">
        <el-radio value="static">静态数据</el-radio>
        <el-radio value="api">API 接口</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- API 配置 -->
    <template v-if="localDataSourceType === 'api'">
      <el-form-item label="API 地址">
        <el-input
          v-model="localApiUrl"
          placeholder="https://api.example.com/table-data"
          @change="handleApiConfigChange"
        />
      </el-form-item>
      <el-form-item label="请求方法">
        <el-select v-model="localApiMethod" @change="handleApiConfigChange">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
        </el-select>
      </el-form-item>

      <!-- 请求拦截器配置 -->
      <RequestInterceptorConfig
        v-model="localComponent.beforeRequest"
        @update="handleChange"
      />
    </template>

    <el-divider>列配置</el-divider>

    <div v-for="(column, index) in localComponent.columns" :key="column.id" class="column-config">
      <el-form-item label="列名">
        <el-input v-model="column.label" @change="handleChange" />
      </el-form-item>
      <el-form-item label="字段">
        <el-input v-model="column.field" @change="handleChange" />
      </el-form-item>
      <el-form-item label="宽度">
        <el-input-number v-model="column.width" :min="50" @change="handleChange" />
      </el-form-item>
      <el-form-item label="对齐">
        <el-select v-model="column.align" @change="handleChange">
          <el-option label="左" value="left" />
          <el-option label="中" value="center" />
          <el-option label="右" value="right" />
        </el-select>
      </el-form-item>
      <el-button type="danger" size="small" @click="removeColumn(index)">删除列</el-button>
      <el-divider />
    </div>

    <el-button type="primary" size="small" @click="addColumn">添加列</el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import type { TableComponent, TableColumn, DataSource } from '../../../types';
import { generateId } from '../../../utils';
import RequestInterceptorConfig from '../common/RequestInterceptorConfig.vue';

const props = defineProps<{
  component: TableComponent;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const localComponent = reactive<TableComponent>({ ...props.component });

// 数据源类型
const localDataSourceType = ref<'static' | 'api'>(
  props.component.dataSource?.type || 'static'
);

// API配置
const localApiUrl = ref(props.component.dataSource?.apiUrl || '');
const localApiMethod = ref<'GET' | 'POST'>(
  props.component.dataSource?.apiMethod || 'POST'
);

watch(
  () => props.component,
  (newComponent) => {
    Object.assign(localComponent, newComponent);
    // 更新本地数据源类型
    localDataSourceType.value = newComponent.dataSource?.type || 'static';
    localApiUrl.value = newComponent.dataSource?.apiUrl || '';
    localApiMethod.value = newComponent.dataSource?.apiMethod || 'POST';
  },
  { deep: true }
);

function handleChange() {
  Object.assign(props.component, localComponent);
  emit('update');
}

// 数据源类型变化处理
function handleDataSourceTypeChange(type: 'static' | 'api') {
  if (type === 'api') {
    // 切换到API，创建API数据源
    localComponent.dataSource = {
      id: generateId(),
      name: 'API数据源',
      type: 'api',
      apiUrl: localApiUrl.value,
      apiMethod: localApiMethod.value,
      apiParams: {},
    } as DataSource;
  } else {
    // 切换到静态数据
    localComponent.dataSource = {
      id: generateId(),
      name: '静态数据源',
      type: 'static',
      staticData: [],
    };
  }
  handleChange();
}

// API配置变化处理
function handleApiConfigChange() {
  if (localComponent.dataSource?.type === 'api') {
    localComponent.dataSource.apiUrl = localApiUrl.value;
    localComponent.dataSource.apiMethod = localApiMethod.value;
    handleChange();
  }
}

function addColumn() {
  const newColumn: TableColumn = {
    id: generateId(),
    field: `field${localComponent.columns.length + 1}`,
    label: `列${localComponent.columns.length + 1}`,
    width: 100,
    align: 'left',
  };
  localComponent.columns.push(newColumn);
  handleChange();
}

function removeColumn(index: number) {
  localComponent.columns.splice(index, 1);
  handleChange();
}
</script>

<style scoped>
.column-config {
  background-color: white;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}
</style>
