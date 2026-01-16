<!--
  DataLoadingState.vue

  数据加载状态组件

  用于显示数据加载中的状态、错误信息和空数据提示
  支持多种显示模式和自定义样式

  @component DataLoadingState
  @author Report Designer Team
  @since 2025-01-16
-->
<template>
  <div class="data-loading-state" :class="{ fullscreen: fullscreen }" :style="containerStyle">
    <!-- Loading 状态 -->
    <div v-if="loading" class="state-loading">
      <el-icon class="is-loading" :size="iconSize">
        <Loading />
      </el-icon>
      <p class="state-text">{{ loadingText }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="state-error">
      <el-icon :size="iconSize" color="#f56c6c">
        <CircleClose />
      </el-icon>
      <p class="state-text error-text">{{ errorText }}</p>
      <div v-if="showDetails && errorDetails" class="error-details">
        <el-text type="info" size="small">{{ errorDetails }}</el-text>
      </div>
      <el-button
        v-if="showRetry"
        type="primary"
        size="small"
        @click="handleRetry"
        style="margin-top: 12px"
      >
        重试
      </el-button>
    </div>

    <!-- 空数据状态 -->
    <div v-else-if="empty" class="state-empty">
      <el-icon :size="iconSize" color="#909399">
        <Document />
      </el-icon>
      <p class="state-text">{{ emptyText }}</p>
    </div>

    <!-- 自定义插槽 -->
    <slot v-if="!loading && !error && !empty" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Loading, CircleClose, Document } from '@element-plus/icons-vue';

const props = defineProps<{
  /** 是否显示loading状态 */
  loading?: boolean;
  /** loading提示文本 */
  loadingText?: string;
  /** 错误信息 */
  error?: string | null;
  /** 错误详情（技术信息） */
  errorDetails?: string;
  /** 错误提示文本 */
  errorText?: string;
  /** 是否为空数据 */
  empty?: boolean;
  /** 空数据提示文本 */
  emptyText?: string;
  /** 是否全屏显示（覆盖整个容器） */
  fullscreen?: boolean;
  /** 图标大小 */
  iconSize?: number;
  /** 是否显示重试按钮 */
  showRetry?: boolean;
  /** 是否显示错误详情 */
  showDetails?: boolean;
  /** 自定义容器样式 */
  customStyle?: Record<string, any>;
}>();

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

// 容器样式
const containerStyle = computed(() => {
  if (props.customStyle) {
    return props.customStyle;
  }
  return props.fullscreen
    ? {
        position: 'absolute' as const,
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
      }
    : {
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      };
});

// 默认文本
const defaultLoadingText = computed(() => props.loadingText || '正在加载数据...');
const defaultErrorText = computed(() => props.errorText || '数据加载失败');
const defaultEmptyText = computed(() => props.emptyText || '暂无数据');

function handleRetry() {
  emit('retry');
}
</script>

<style scoped>
.data-loading-state {
  width: 100%;
  height: 100%;
}

.data-loading-state.fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.state-loading,
.state-error,
.state-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}

.state-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.error-text {
  color: #f56c6c;
}

.error-details {
  max-width: 400px;
  padding: 8px;
  background-color: #fef0f0;
  border-radius: 4px;
  margin-top: 8px;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
