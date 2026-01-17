<template>
  <Teleport to="body">
    <Transition name="preview-fade">
      <div v-if="visible" class="preview-mode" @click.self="handleClose">
        <!-- 顶部工具栏 -->
        <div class="preview-toolbar">
          <div class="preview-title">预览模式</div>
          <div class="preview-actions">
            <el-button :icon="FullScreen" circle @click="toggleFullscreen" />
            <el-button :icon="Close" circle @click="handleClose" />
          </div>
        </div>

        <!-- 预览内容区域 -->
        <div class="preview-viewport">
          <div ref="previewRef" class="preview-canvas" :style="canvasStyle">
            <!-- 渲染所有组件 -->
            <template v-for="component in sortedComponents" :key="component.id">
              <component
                :is="getComponentRenderer(component.type)"
                :component="component"
                :selected="false"
                :hovered="false"
              />
            </template>
          </div>
        </div>

        <!-- 底部提示 -->
        <div class="preview-footer">
          <span>按 ESC 或点击空白区域退出预览</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { FullScreen, Close } from '@element-plus/icons-vue';
import { currentDesign } from '../stores/designer';
import type { Component } from '../types';
import TextRenderer from './canvas/renderers/TextRenderer.vue';
import ImageRenderer from './canvas/renderers/ImageRenderer.vue';
import TableRenderer from './canvas/renderers/TableRenderer.vue';
import ChartRenderer from './canvas/renderers/ChartRenderer.vue';
import RectangleRenderer from './canvas/renderers/RectangleRenderer.vue';
import LineRenderer from './canvas/renderers/LineRenderer.vue';
import BarChartRenderer from './canvas/renderers/BarChartRenderer.vue';
import LineChartRenderer from './canvas/renderers/LineChartRenderer.vue';
import PieChartRenderer from './canvas/renderers/PieChartRenderer.vue';
import ScatterChartRenderer from './canvas/renderers/ScatterChartRenderer.vue';
import GaugeChartRenderer from './canvas/renderers/GaugeChartRenderer.vue';
import FunnelChartRenderer from './canvas/renderers/FunnelChartRenderer.vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

const previewRef = ref<HTMLElement>();
const isFullscreen = ref(false);

// 按 zIndex 排序的组件
const sortedComponents = computed(() => {
  return [...currentDesign.value.components].sort((a, b) => a.zIndex - b.zIndex);
});

// 预览画布样式
const canvasStyle = computed(() => ({
  width: `${currentDesign.value.width}px`,
  minHeight: `${currentDesign.value.height}px`,
  backgroundColor: currentDesign.value.backgroundColor,
  margin: '0 auto',
  position: 'relative',
  transform: isFullscreen.value ? 'scale(1)' : 'scale(0.8)',
  transformOrigin: 'top center',
  transition: 'transform 0.3s ease',
}));

// 获取组件渲染器
function getComponentRenderer(type: Component['type']) {
  const renderers: Record<Component['type'], any> = {
    text: TextRenderer,
    image: ImageRenderer,
    table: TableRenderer,
    chart: ChartRenderer,
    'bar-chart': BarChartRenderer,
    'line-chart': LineChartRenderer,
    'pie-chart': PieChartRenderer,
    'scatter-chart': ScatterChartRenderer,
    'gauge-chart': GaugeChartRenderer,
    'funnel-chart': FunnelChartRenderer,
    rectangle: RectangleRenderer,
    line: LineRenderer,
  };
  return renderers[type];
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen().catch(() => {
      // 如果全屏API不可用，仅使用CSS全屏
    });
  } else {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
}

function handleClose() {
  emit('update:visible', false);
  emit('close');
  // 退出全屏
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
  isFullscreen.value = false;
}

// 监听ESC键退出预览
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    handleClose();
  }
}

// 监听visible变化，控制body的class
watch(() => props.visible, (newValue) => {
  if (newValue) {
    document.body.classList.add('preview');
  } else {
    document.body.classList.remove('preview');
  }
}, { immediate: true });

// 组件挂载时添加键盘监听
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

// 组件卸载时移除键盘监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.classList.remove('preview');
});
</script>

<style scoped>
.preview-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: rgba(255, 255, 255, 0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.preview-actions {
  display: flex;
  gap: 12px;
}

.preview-viewport {
  flex: 1;
  width: 100%;
  overflow: auto;
  padding: 80px 40px 60px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.preview-canvas {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.preview-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #606266;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

/* 过渡动画 */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 0.3s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

/* 预览模式下禁用选择和交互 */
.preview-mode :deep(.base-renderer) {
  pointer-events: none;
}

.preview-mode :deep(.selection-handle),
.preview-mode :deep(.selection-border),
.preview-mode :deep(.drag-handle) {
  display: none !important;
}
</style>
