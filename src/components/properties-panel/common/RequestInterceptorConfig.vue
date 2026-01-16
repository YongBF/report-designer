<!--
  RequestInterceptorConfig.vue

  请求拦截器配置组件

  用于配置API请求拦截器，支持在发送请求前修改请求配置
  可以添加认证token、修改参数、转换数据格式等

  @component RequestInterceptorConfig
  @author Report Designer Team
  @since 2025-01-16
-->
<template>
  <div class="request-interceptor-config">
    <el-form-item label="请求拦截器" v-if="showLabel">
      <el-button size="small" @click="dialogVisible = true">
        {{ interceptorButtonText }}
      </el-button>
      <el-tooltip
        content="在发送API请求前执行的自定义代码，可用于添加token、修改参数等"
        placement="top"
      >
        <el-icon class="help-icon"><QuestionFilled /></el-icon>
      </el-tooltip>
    </el-form-item>

    <!-- 拦截器配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="配置请求拦截器"
      width="900px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <div class="interceptor-editor-container">
        <!-- 使用说明 -->
        <el-alert
          title="使用说明"
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
        >
          <div class="help-content">
            <p>请求拦截器是一个异步函数，在发送API请求前执行。你可以使用它来：</p>
            <ul>
              <li>添加认证 token 或其他请求头</li>
              <li>修改请求参数</li>
              <li>转换数据格式</li>
              <li>添加时间戳等固定参数</li>
            </ul>
            <p>函数签名：</p>
            <pre class="code-snippet">async function intercept(config, linkageParams) {
  // config: 请求配置对象，包含 url, method, headers, body
  // linkageParams: 联动参数对象

  // 修改配置...
  // config.headers['Authorization'] = 'Bearer xxx';

  return config; // 必须返回修改后的配置
}</pre>
          </div>
        </el-alert>

        <!-- 示例模板 -->
        <el-form-item label="快速模板">
          <el-select
            v-model="selectedTemplate"
            placeholder="选择示例模板"
            @change="handleTemplateSelect"
            style="width: 100%"
          >
            <el-option label="自定义" value="" />
            <el-option label="添加认证Token" value="auth" />
            <el-option label="日期范围处理" value="dateRange" />
            <el-option label="参数转换" value="transform" />
          </el-select>
        </el-form-item>

        <!-- 代码编辑器 -->
        <el-form-item label="拦截器代码">
          <div class="code-editor-wrapper">
            <el-input
              v-model="interceptorCode"
              type="textarea"
              :rows="15"
              placeholder="在此编写拦截器代码..."
              class="code-editor"
            />
          </div>
        </el-form-item>

        <!-- 参数说明 -->
        <el-collapse style="margin-top: 12px">
          <el-collapse-item title="可用的全局对象和参数" name="1">
            <div class="param-doc">
              <h4>config 对象：</h4>
              <ul>
                <li><code>url</code>: string - 请求URL</li>
                <li><code>method</code>: string - 请求方法 (GET/POST等)</li>
                <li><code>headers</code>: Record&lt;string, string&gt; - 请求头</li>
                <li><code>body</code>: string | null - 请求体（JSON字符串）</li>
              </ul>

              <h4>linkageParams 对象：</h4>
              <ul>
                <li>从联动源组件传递过来的参数对象</li>
                <li>包含所有映射后的参数</li>
              </ul>

              <h4>全局对象：</h4>
              <ul>
                <li><code>console</code>: 对象 - 控制台API，用于调试</li>
                <li><code>window</code>: 对象 - 浏览器window对象</li>
                <li><code>localStorage</code>: 对象 - 本地存储</li>
                <li><code>sessionStorage</code>: 对象 - 会话存储</li>
              </ul>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <template #footer>
        <el-button @click="handleClear">清空</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { QuestionFilled } from '@element-plus/icons-vue';
import { interceptorExamples } from '../../../utils/apiHelper';

const props = defineProps<{
  modelValue: string;
  showLabel?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const dialogVisible = ref(false);
const interceptorCode = ref(props.modelValue || '');
const selectedTemplate = ref('');

// 按钮文本
const interceptorButtonText = computed(() => {
  if (props.modelValue) {
    return '已配置拦截器';
  }
  return '配置拦截器';
});

// 选择模板
function handleTemplateSelect(templateKey: string) {
  if (templateKey && interceptorExamples[templateKey as keyof typeof interceptorExamples]) {
    // 提取函数体
    const template = interceptorExamples[templateKey as keyof typeof interceptorExamples];
    const match = template.match(/async function intercept\([\s\S]*?\n([\s\S]*?)\n`\)/);
    if (match && match[1]) {
      interceptorCode.value = match[1].trim();
    }
  }
}

// 保存
function handleSave() {
  emit('update:modelValue', interceptorCode.value);
  dialogVisible.value = false;
}

// 清空
function handleClear() {
  interceptorCode.value = '';
}

// 关闭对话框
function handleClose() {
  // 重置为当前值
  interceptorCode.value = props.modelValue || '';
  selectedTemplate.value = '';
}
</script>

<style scoped>
.request-interceptor-config {
  width: 100%;
}

.help-icon {
  margin-left: 8px;
  color: var(--el-color-info);
  cursor: help;
}

.interceptor-editor-container {
  padding: 8px 0;
}

.help-content {
  font-size: 14px;
  line-height: 1.6;
}

.help-content p {
  margin: 8px 0;
}

.help-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.help-content li {
  margin: 4px 0;
}

.code-snippet {
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  margin: 8px 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  overflow-x: auto;
}

.code-editor-wrapper {
  width: 100%;
}

.code-editor {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.code-editor :deep(textarea) {
  font-family: 'Courier New', monospace;
  line-height: 1.5;
}

.param-doc {
  font-size: 14px;
  line-height: 1.8;
}

.param-doc h4 {
  margin: 12px 0 8px 0;
  color: #303133;
}

.param-doc ul {
  margin: 8px 0;
  padding-left: 20px;
}

.param-doc li {
  margin: 4px 0;
}

.param-doc code {
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #e6a23c;
}
</style>
