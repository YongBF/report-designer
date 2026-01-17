<template>
  <div class="preview-view" data-testid="preview-view">
    <!-- 顶部导航栏 -->
    <div class="preview-header" data-testid="preview-header">
      <div class="header-left">
        <h1 class="preview-title" data-testid="preview-title">{{ currentDesign.name }}</h1>
        <span class="preview-info" data-testid="preview-info">{{ currentDesign.width }} × {{ currentDesign.height }}</span>
      </div>
      <div class="header-right">
        <el-button data-testid="btn-back" @click="goBack">返回编辑</el-button>
        <el-button type="primary" :icon="Download" data-testid="btn-export" @click="handleExport">导出</el-button>
      </div>
    </div>

    <!-- 预览内容区域 -->
    <div class="preview-container" data-testid="preview-container">
      <div class="preview-canvas" data-testid="preview-canvas" :style="canvasStyle">
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
    <div class="preview-footer" data-testid="preview-footer">
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        预览模式 - 所有编辑功能已禁用。点击"返回编辑"可继续修改设计。
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import { useDesignerStore } from '@/stores/pinia';
import type { Component } from '@/types';
import TextRenderer from '@/components/canvas/renderers/TextRenderer.vue';
import ImageRenderer from '@/components/canvas/renderers/ImageRenderer.vue';
import TableRenderer from '@/components/canvas/renderers/TableRenderer.vue';
import ChartRenderer from '@/components/canvas/renderers/ChartRenderer.vue';
import RectangleRenderer from '@/components/canvas/renderers/RectangleRenderer.vue';
import LineRenderer from '@/components/canvas/renderers/LineRenderer.vue';
import BarChartRenderer from '@/components/canvas/renderers/BarChartRenderer.vue';
import LineChartRenderer from '@/components/canvas/renderers/LineChartRenderer.vue';
import PieChartRenderer from '@/components/canvas/renderers/PieChartRenderer.vue';
import ScatterChartRenderer from '@/components/canvas/renderers/ScatterChartRenderer.vue';
import GaugeChartRenderer from '@/components/canvas/renderers/GaugeChartRenderer.vue';
import FunnelChartRenderer from '@/components/canvas/renderers/FunnelChartRenderer.vue';

const router = useRouter();
const designerStore = useDesignerStore();

// 按 zIndex 排序的组件
const sortedComponents = computed(() => {
  return [...designerStore.currentDesign.components].sort((a, b) => a.zIndex - b.zIndex);
});

// 预览画布样式
const canvasStyle = computed(() => ({
  width: `${designerStore.currentDesign.width}px`,
  minHeight: `${designerStore.currentDesign.height}px`,
  backgroundColor: designerStore.currentDesign.backgroundColor,
  margin: '0 auto',
  position: 'relative',
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

function goBack() {
  router.push('/');
}

function handleExport() {
  ElMessage.info('导出功能开发中...');
}

// 组件挂载时添加preview class到body
onMounted(() => {
  document.body.classList.add('preview');
  document.title = `预览 - ${designerStore.currentDesign.name}`;
});

// 组件卸载时移除preview class
onUnmounted(() => {
  document.body.classList.remove('preview');
  document.title = 'report-designer';
});
</script>

<style scoped>
.preview-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.preview-info {
  font-size: 14px;
  color: #909399;
  background-color: #f5f7fa;
  padding: 4px 12px;
  border-radius: 4px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.preview-container {
  flex: 1;
  padding: 40px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.preview-canvas {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 20px;
  background-color: #ffffff;
}

.preview-footer {
  padding: 16px 24px;
  background-color: #ffffff;
  border-top: 1px solid #e4e7ed;
}

/* 预览模式下禁用所有编辑功能 */
.preview-view :deep(.base-renderer) {
  pointer-events: none;
}

.preview-view :deep(.selection-handle),
.preview-view :deep(.selection-border),
.preview-view :deep(.drag-handle),
.preview-view :deep(.resize-handle) {
  display: none !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-right {
    justify-content: stretch;
  }

  .header-right .el-button {
    flex: 1;
  }

  .preview-container {
    padding: 20px;
  }
}
</style>
