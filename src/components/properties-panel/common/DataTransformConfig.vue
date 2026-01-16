<!--
  DataTransformConfig.vue

  数据转换配置组件

  支持：
  - 基础模式：字段映射配置
  - 高级模式：JavaScript 转换函数

  @component DataTransformConfig
  @author Report Designer Team
  @since 2025-01-16
-->
<template>
  <div class="data-transform-config">
    <el-form-item label="转换模式">
      <el-radio-group v-model="transformMode" @change="handleModeChange">
        <el-radio value="basic">基础模式</el-radio>
        <el-radio value="advanced">高级模式</el-radio>
      </el-radio-group>
    </el-form-item>

    <!-- 基础模式：字段映射 -->
    <template v-if="transformMode === 'basic'">
      <el-form-item label="数据路径">
        <el-input
          v-model="basicConfig.dataPath"
          placeholder="data 或 items 或 result.list"
          @change="handleConfigChange"
        >
          <template #prepend>$.</template>
        </el-input>
        <div class="help-text">API 返回数据所在的路径，使用 . 表示嵌套属性</div>
      </el-form-item>

      <el-form-item label="类别字段">
        <el-input
          v-model="basicConfig.categoryField"
          placeholder="month 或 name 或 date"
          @change="handleConfigChange"
        />
        <div class="help-text">用于 X 轴类别的字段名</div>
      </el-form-item>

      <el-form-item label="系列配置">
        <div class="series-config-list">
          <div
            v-for="(series, index) in basicConfig.seriesFields"
            :key="index"
            class="series-config-item"
          >
            <div class="series-config-header">
              <span>系列 {{ index + 1 }}</span>
              <el-button
                v-if="basicConfig.seriesFields.length > 1"
                link
                type="danger"
                size="small"
                @click="removeSeries(index)"
              >
                删除
              </el-button>
            </div>
            <el-form-item label="系列名称" label-width="80px" size="small">
              <el-input
                v-model="series.name"
                placeholder="如：销售额"
                @input="handleConfigChange"
              />
            </el-form-item>
            <el-form-item label="数据字段" label-width="80px" size="small">
              <el-input
                v-model="series.field"
                placeholder="如：sales 或 value"
                @input="handleConfigChange"
              />
            </el-form-item>
          </div>
          <el-button
            type="primary"
            size="small"
            style="width: 100%; margin-top: 8px"
            @click="addSeries"
          >
            + 添加系列
          </el-button>
        </div>
      </el-form-item>

      <!-- 数据预览 -->
      <el-form-item label="配置预览">
        <el-alert type="info" :closable="false">
          <template #title>
            <div class="config-preview">
              <strong>数据路径：</strong>{{ basicConfig.dataPath || '未配置' }}<br />
              <strong>类别字段：</strong>{{ basicConfig.categoryField || '未配置' }}<br />
              <strong>系列字段：</strong>
              <span v-if="basicConfig.seriesFields.length > 0">
                {{ basicConfig.seriesFields.map((s) => `${s.name}(${s.field})`).join(', ') }}
              </span>
              <span v-else>未配置</span>
            </div>
          </template>
        </el-alert>
      </el-form-item>
    </template>

    <!-- 高级模式：JavaScript 转换函数 -->
    <template v-if="transformMode === 'advanced'">
      <el-form-item label="转换函数">
        <el-alert
          type="info"
          :closable="false"
          style="margin-bottom: 12px"
          show-icon
        >
          编写一个 JavaScript 函数，接收 API 返回的原始数据，返回图表数据格式：
          <code>{ categories: string[], series: Array<{ name: string, data: number[] }> }</code>
        </el-alert>
        <div class="code-editor-container">
          <el-input
            v-model="advancedConfig.transformFunction"
            type="textarea"
            :rows="15"
            placeholder="function transform(response) {
  // response 是 API 返回的原始数据
  const data = response.data || response;

  return {
    categories: data.map(item => item.name),
    series: [
      {
        name: '数值',
        data: data.map(item => item.value)
      }
    ]
  };
}"
            @change="handleConfigChange"
          />
        </div>
        <div class="help-text">
          <strong>可用变量：</strong>
          <code>response</code> - API 返回的原始数据
        </div>
      </el-form-item>

      <el-form-item label="测试转换">
        <div style="display: flex; gap: 8px; align-items: flex-start">
          <el-input
            v-model="testInput"
            type="textarea"
            :rows="5"
            placeholder="输入测试 JSON 数据，点击测试按钮查看转换结果"
            style="flex: 1"
          />
          <el-button type="primary" @click="testTransform">测试</el-button>
        </div>
        <div v-if="testResult" class="test-result">
          <div class="test-result-header">转换结果：</div>
          <pre>{{ formatResult(testResult) }}</pre>
          <el-alert
            v-if="testError"
            type="error"
            :title="testError"
            :closable="false"
            style="margin-top: 8px"
          />
          <el-alert
            v-else-if="testSuccess"
            type="success"
            title="转换成功！"
            :closable="false"
            style="margin-top: 8px"
          />
        </div>
      </el-form-item>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';

interface SeriesField {
  name: string;
  field: string;
}

interface BasicTransformConfig {
  dataPath: string;
  categoryField: string;
  seriesFields: SeriesField[];
}

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits<{
  (e: 'update', value: any): void;
}>();

// 转换模式
const transformMode = ref<'basic' | 'advanced'>('basic');

// 基础模式配置
const basicConfig = reactive<BasicTransformConfig>({
  dataPath: 'data',
  categoryField: '',
  seriesFields: [{ name: '数值', field: 'value' }],
});

// 高级模式配置
const advancedConfig = reactive({
  transformFunction: `function transform(response) {
  // response 是 API 返回的原始数据
  const data = response.data || response;

  return {
    categories: data.map(item => item.name),
    series: [
      {
        name: '数值',
        data: data.map(item => item.value)
      }
    ]
  };
}`,
});

// 测试相关
const testInput = ref('');
const testResult = ref<any>(null);
const testError = ref('');
const testSuccess = ref(false);

// 初始化配置
function initConfig() {
  if (props.modelValue) {
    if (props.modelValue.mode) {
      transformMode.value = props.modelValue.mode;
    }
    if (props.modelValue.mode === 'basic' && props.modelValue.basic) {
      Object.assign(basicConfig, props.modelValue.basic);
    } else if (props.modelValue.mode === 'advanced' && props.modelValue.advanced) {
      advancedConfig.transformFunction = props.modelValue.advanced.transformFunction || advancedConfig.transformFunction;
    }
  }
}

// 监听外部值变化
watch(
  () => props.modelValue,
  () => {
    initConfig();
  },
  { immediate: true }
);

// 处理模式变化
function handleModeChange() {
  emitConfig();
}

// 处理配置变化
function handleConfigChange() {
  emitConfig();
}

// 发出配置更新
function emitConfig() {
  const config: any = {
    mode: transformMode.value,
  };

  if (transformMode.value === 'basic') {
    config.basic = { ...basicConfig };
  } else {
    config.advanced = {
      transformFunction: advancedConfig.transformFunction,
    };
  }

  emit('update', config);
}

// 添加系列
function addSeries() {
  basicConfig.seriesFields.push({
    name: `系列 ${basicConfig.seriesFields.length + 1}`,
    field: '',
  });
  emitConfig();
}

// 删除系列
function removeSeries(index: number) {
  basicConfig.seriesFields.splice(index, 1);
  emitConfig();
}

// 测试转换
function testTransform() {
  testError.value = '';
  testSuccess.value = false;

  if (!testInput.value.trim()) {
    ElMessage.warning('请输入测试数据');
    return;
  }

  let testData: any;
  try {
    testData = JSON.parse(testInput.value);
  } catch (e: any) {
    testError.value = `JSON 解析失败: ${e.message}`;
    return;
  }

  if (transformMode.value === 'basic') {
    testBasicTransform(testData);
  } else {
    testAdvancedTransform(testData);
  }
}

// 测试基础模式转换
function testBasicTransform(data: any) {
  try {
    const result = applyBasicTransform(data, basicConfig);
    testResult.value = result;
    testSuccess.value = true;
  } catch (e: any) {
    testError.value = `转换失败: ${e.message}`;
  }
}

// 测试高级模式转换
function testAdvancedTransform(data: any) {
  try {
    const func = new Function('response', `${advancedConfig.transformFunction}\nreturn transform(response);`);
    const result = func(data);
    testResult.value = result;
    testSuccess.value = true;
  } catch (e: any) {
    testError.value = `执行失败: ${e.message}`;
  }
}

// 应用基础模式转换（导出供外部使用）
function applyBasicTransform(data: any, config: BasicTransformConfig) {
  // 获取数据路径中的数据
  let targetData = data;
  if (config.dataPath && config.dataPath !== 'data' && config.dataPath !== '.') {
    const paths = config.dataPath.split('.');
    for (const path of paths) {
      if (path && targetData) {
        targetData = targetData[path];
      }
    }
  } else {
    targetData = data.data || data;
  }

  if (!Array.isArray(targetData)) {
    throw new Error('数据路径解析结果不是数组');
  }

  // 提取类别
  const categories = targetData.map((item: any) => {
    const value = config.categoryField ? item[config.categoryField] : item;
    return value?.toString() || '';
  });

  // 提取系列数据
  const series = config.seriesFields.map((sf) => ({
    name: sf.name,
    data: targetData.map((item: any) => {
      const value = sf.field ? item[sf.field] : item;
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    }),
  }));

  return { categories, series };
}

// 格式化结果
function formatResult(result: any) {
  return JSON.stringify(result, null, 2);
}

// 导出方法供父组件使用
defineExpose({
  applyTransform: (data: any) => {
    if (transformMode.value === 'basic') {
      return applyBasicTransform(data, basicConfig);
    } else {
      try {
        const func = new Function('response', `${advancedConfig.transformFunction}\nreturn transform(response);`);
        return func(data);
      } catch (e: any) {
        throw new Error(`转换失败: ${e.message}`);
      }
    }
  },
});
</script>

<style scoped>
.data-transform-config {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

.series-config-list {
  width: 100%;
}

.series-config-item {
  border: 1px solid #dcdfe6;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 4px;
  background: #fff;
}

.series-config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
}

.config-preview {
  font-size: 13px;
  line-height: 1.8;
  color: #606266;
}

.code-editor-container {
  font-family: 'Courier New', Courier, monospace;
}

.code-editor-container :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.5;
}

.test-result {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.test-result-header {
  font-weight: 500;
  margin-bottom: 8px;
}

.test-result pre {
  margin: 0;
  padding: 8px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow: auto;
}

code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #e83e8c;
}
</style>
