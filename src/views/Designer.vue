<!--
  Designer.vue

  报表设计器主布局组件

  整合四个主要区域：
  - 工具栏：新建、撤销、重做、保存、预览
  - 组件库面板：可拖拽的组件列表
  - 画布面板：设计区域
  - 属性面板：配置选中组件

  @component Designer
  @author Report Designer Team
  @since 2026-01-17
-->
<template>
  <div class="report-designer" data-testid="report-designer">
    <!-- 工具栏 -->
    <DesignerToolbar
      :can-undo="canUndo"
      :can-redo="canRedo"
      @new="handleNew"
      @undo="handleUndo"
      @redo="handleRedo"
      @save="handleSave"
      @preview="handlePreview"
    />

    <!-- 主体内容 -->
    <div class="designer-main">
      <!-- 左侧组件库 -->
      <ComponentLibrary @drag-start="handleDragStart" />

      <!-- 中间画布区域 -->
      <CanvasPanel
        :components="orderedComponents"
        :selected-ids="selectedIds"
        :canvas-style="canvasStyle"
        :dragging-component-id="draggingComponentId"
        :drop-index="dropIndex"
        :is-dragging-from-library="isDraggingFromLibrary"
        :form-data="formData"
        @canvas-click="handleCanvasClick"
        @component-click="handleComponentClick"
        @component-drag-start="handleComponentDragStart"
        @component-drag-end="handleComponentDragEnd"
        @resize-start="handleResizeStart"
        @canvas-drag-over="handleCanvasDragOver"
        @canvas-drag-leave="handleCanvasDragLeave"
        @canvas-drop="handleCanvasDropFromLibrary"
        @update="handleUpdate"
        @form-field-change="handleFormFieldChange"
        @form-button-click="handleFormButtonClick"
        @set-chart-ref="setChartRef"
        @canvas-ref-ready="handleCanvasRefReady"
      />

      <!-- 右侧属性面板 -->
      <PropertiesPanel
        :selected-component="selectedComponent"
        :all-components="designerStore.currentDesign.components"
        :linkage-manager="linkageManager"
        @update="handleUpdate"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useDesignerStore } from '@/stores/pinia';
import type { Component } from '@/types';

// 子组件
import DesignerToolbar from './designer/DesignerToolbar.vue';
import ComponentLibrary from './designer/ComponentLibrary.vue';
import CanvasPanel from './designer/CanvasPanel.vue';
import PropertiesPanel from './designer/properties/PropertiesPanel.vue';

// Composables
import { useToolbarActions } from './designer/composables/useToolbarActions';
import { usePanelState } from './designer/composables/usePanelState';
import { useDesignerEvents } from './designer/composables/useDesignerEvents';
import { useDragDrop } from '@/composables/useDragDrop';
import { useComponentCreation } from '@/composables/useComponentCreation';
import { useComponentLinkage } from '@/composables/useComponentLinkage';
import { useChartGenerator } from '@/composables/useChartGenerator';
import { useChartRefManagement } from '@/composables/useChartRefManagement';
import { useWatchers } from '@/composables/useWatchers';
import { useFormData } from '@/composables/useFormData';

// Store
const designerStore = useDesignerStore();

// 工具栏操作
const toolbarActions = useToolbarActions();
const {
  handleNew,
  handleUndo,
  handleRedo,
  handleSave,
  handlePreview,
} = toolbarActions;

// 面板状态
const panelState = usePanelState();
const {
  canvasRef,
  chartRefsMap,
  chartInstancesMap,
  orderedComponents,
  selectedComponent,
  canvasStyle,
  panelCollapseActive,
  selectedIds,
  canUndo,
  canRedo,
} = panelState;

// 事件处理
const designerEvents = useDesignerEvents();
const {
  formData,
  handleComponentClick,
  handleCanvasClick,
  handleComponentUpdate: handleUpdate,
  handleComponentDelete: handleDelete,
  handleFormFieldChange,
  handleFormButtonClick,
} = designerEvents;

// 拖拽和调整大小
const { createComponent } = useComponentCreation();
const dragDrop = useDragDrop(canvasRef, orderedComponents, createComponent);
const {
  draggingComponentId,
  dropIndex,
  isDraggingFromLibrary,
  handleDragStart: handleLibraryDragStart,
  handleCanvasDragOver,
  handleCanvasDragLeave,
  handleCanvasDropFromLibrary,
  handleComponentDragStart,
  handleComponentDragEnd,
  handleResizeStart,
} = dragDrop;

// 图表管理
const chartRefManagement = useChartRefManagement(chartRefsMap);
const { setChartRef } = chartRefManagement;

const chartGenerator = useChartGenerator(orderedComponents, chartRefsMap, chartInstancesMap);
const { initCharts, updateChart } = chartGenerator;

// 组件联动
const linkageManager = useComponentLinkage(designerStore.currentDesign);

// 表单数据
const formDataManager = useFormData();

// 生命周期
onMounted(() => {
  setTimeout(() => {
    initCharts();
  }, 100);
});

// 监听图表组件配置变化，重新渲染图表
const chartTypes = [
  'chart',
  'bar-chart',
  'line-chart',
  'pie-chart',
  'scatter-chart',
  'gauge-chart',
  'funnel-chart',
];

watch(
  () => orderedComponents.value.filter((c) => chartTypes.includes(c.type)),
  (newCharts, oldCharts) => {
    nextTick(() => {
      newCharts.forEach((component) => {
        const oldChart = oldCharts?.find((c) => c.id === component.id);
        let hasChanged = !oldChart;

        if (!hasChanged && oldChart) {
          // Check if config has changed (includes title)
          if (
            JSON.stringify((component as any).config) !==
            JSON.stringify((oldChart as any).config)
          ) {
            hasChanged = true;
          }
          // Check other chart-specific properties
          else if (
            JSON.stringify(component) !== JSON.stringify(oldChart)
          ) {
            hasChanged = true;
          }
        }

        if (hasChanged) {
          updateChart(component);
        }
      });
    });
  },
  { deep: true }
);

// 事件转发
function handleDragStart(item: any, event: DragEvent) {
  handleLibraryDragStart(item, event);
}

// 画布元素就绪
function handleCanvasRefReady(element: HTMLElement) {
  canvasRef.value = element;
}
</script>

<style scoped>
.report-designer {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.designer-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
