<!--
  CanvasPanel.vue

  画布面板组件

  中间区域，用于设计和预览报表：
  - 渲染所有组件
  - 处理拖拽和选中
  - 显示拖拽和调整大小手柄

  @component CanvasPanel
  @author Report Designer Team
  @since 2026-01-17
-->
<template>
  <div class="canvas-panel" data-testid="canvas-panel">
    <div
      ref="localCanvasRef"
      class="canvas-content"
      data-testid="canvas-content"
      :class="{ 'drag-over': isDragging }"
      :style="canvasStyle"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click.self="handleCanvasClick"
    >
      <div class="canvas-content-inner" data-testid="canvas-content-inner">
        <!-- 渲染所有组件 -->
        <template v-for="(component, index) in components" :key="component.id">
          <div
            :data-component-id="component.id"
            class="canvas-component-wrapper"
            :class="`width-${component.widthPercent}`"
          >
            <!-- 拖拽手柄 -->
            <div
              v-if="selectedIds.includes(component.id)"
              class="drag-handle"
              draggable="true"
              title="按住拖拽移动组件"
              @dragstart="handleComponentDragStart(component, $event)"
              @dragend="handleComponentDragEnd"
            >
              <el-icon><Rank /></el-icon>
              <span class="drag-handle-tip">拖拽</span>
            </div>

            <!-- 组件内容 -->
            <div
              class="canvas-component"
              :class="[
                { selected: selectedIds.includes(component.id) },
                { dragging: draggingComponentId === component.id },
              ]"
              :style="getComponentStyle(component)"
              @click.stop="handleComponentClick(component)"
            >
              <!-- 文本组件 -->
              <template v-if="component.type === 'text'">
                <div class="text-content" :style="getTextStyle(component)">
                  {{ component.content }}
                </div>
              </template>

              <!-- 图片组件 -->
              <template v-else-if="component.type === 'image'">
                <div class="image-container">
                  <div v-if="!component.src" class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                    <span>图片</span>
                  </div>
                  <img v-else :src="component.src" alt="" class="image-content" />
                </div>
              </template>

              <!-- 表格组件 -->
              <template v-else-if="component.type === 'table'">
                <TableRenderer
                  :component="component"
                  :selected="selectedIds.includes(component.id)"
                  @update="handleUpdate"
                />
              </template>

              <!-- 图表组件 -->
              <template v-if="['chart', 'bar-chart', 'line-chart', 'pie-chart', 'scatter-chart', 'gauge-chart', 'funnel-chart'].includes(component.type)">
                <div :ref="(el) => setChartRef(component.id, el)" class="chart-container"></div>
              </template>

              <!-- 矩形组件 -->
              <template v-else-if="component.type === 'rectangle'">
                <div class="rectangle-content" :style="getRectangleStyle(component)"></div>
              </template>

              <!-- 线条组件 -->
              <template v-else-if="component.type === 'line'">
                <div class="line-content" :style="getLineStyle(component)"></div>
              </template>

              <!-- 表单组件 -->
              <template v-else-if="component.type === 'form'">
                <SimpleFormRenderer
                  :component="component"
                  :form-data="formData"
                  @field-change="handleFormFieldChange"
                  @button-click="handleFormButtonClick"
                />
              </template>

              <!-- 选中时显示调整手柄 -->
              <template v-if="selectedIds.includes(component.id) && !draggingComponentId">
                <div
                  class="resize-handle bottom-right"
                  @mousedown.stop="handleResizeStart(component, $event)"
                ></div>
              </template>
            </div>

            <!-- 插入指示器 -->
            <div
              v-if="isDragging && dropIndex === index"
              class="insert-indicator insert-left"
            ></div>
          </div>
        </template>

        <!-- 最后位置的插入指示器 -->
        <div
          v-if="isDragging && dropIndex === components.length"
          class="insert-indicator insert-end"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Rank, Picture } from '@element-plus/icons-vue';
import type { Component as ComponentType, FormComponent } from '@/types';
import TableRenderer from '@/components/canvas/renderers/TableRenderer.vue';
import SimpleFormRenderer from './SimpleFormRenderer.vue';

// Props
interface Props {
  components: ComponentType[];
  selectedIds: string[];
  canvasStyle: Record<string, any>;
  draggingComponentId: string | null;
  dropIndex: number | null;
  isDraggingFromLibrary: boolean;
  formData: Record<string, Record<string, any>>;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'canvas-click': [];
  'component-click': [component: ComponentType];
  'component-drag-start': [component: ComponentType, event: DragEvent];
  'component-drag-end': [];
  'resize-start': [component: ComponentType, event: MouseEvent];
  'canvas-drag-over': [event: DragEvent];
  'canvas-drag-leave': [event: DragEvent];
  'canvas-drop': [event: DragEvent];
  'update': [id: string, data: any];
  'form-field-change': [formId: string, field: string, value: any];
  'form-button-click': [component: FormComponent, item: any];
  'set-chart-ref': [id: string, el: any];
  'canvas-ref-ready': [element: HTMLElement];
}>();

// Local ref for canvas element
const localCanvasRef = ref<HTMLElement | null>(null);

// Watch for canvas ref changes and emit to parent
watch(localCanvasRef, (newVal) => {
  if (newVal) {
    emit('canvas-ref-ready', newVal);
  }
}, { immediate: true });

// Computed
const isDragging = computed(() =>
  props.draggingComponentId || props.isDraggingFromLibrary
);

// Methods
function getComponentStyle(component: ComponentType) {
  return {
    width: component.widthPercent !== undefined ? `${component.widthPercent}%` : 'auto',
    height: component.height ? `${component.height}px` : 'auto',
    position: 'relative',
  };
}

function getTextStyle(component: any) {
  return {
    fontSize: component.fontSize ? `${component.fontSize}px` : '14px',
    fontFamily: component.fontFamily || 'Arial',
    color: component.color || '#303133',
    fontWeight: component.fontWeight || 400,
    fontStyle: component.fontStyle || 'normal',
  };
}

function getRectangleStyle(component: any) {
  return {
    width: '100%',
    height: '100%',
    backgroundColor: component.backgroundColor || '#409eff',
    border: component.border || 'none',
    borderRadius: component.borderRadius || '0px',
  };
}

function getLineStyle(component: any) {
  return {
    width: '100%',
    height: component.lineWidth || '2px',
    backgroundColor: component.color || '#409eff',
  };
}

// Event handlers
function handleCanvasClick() {
  emit('canvas-click');
}

function handleComponentClick(component: ComponentType) {
  emit('component-click', component);
}

function handleComponentDragStart(component: ComponentType, event: DragEvent) {
  emit('component-drag-start', component, event);
}

function handleComponentDragEnd() {
  emit('component-drag-end');
}

function handleResizeStart(component: ComponentType, event: MouseEvent) {
  emit('resize-start', component, event);
}

function handleDragOver(event: DragEvent) {
  emit('canvas-drag-over', event);
}

function handleDragLeave(event: DragEvent) {
  emit('canvas-drag-leave', event);
}

function handleDrop(event: DragEvent) {
  emit('canvas-drop', event);
}

function handleUpdate(id: string, data: any) {
  emit('update', id, data);
}

function handleFormFieldChange(formId: string, field: string, value: any) {
  emit('form-field-change', formId, field, value);
}

function handleFormButtonClick(component: FormComponent, item: any) {
  emit('form-button-click', component, item);
}

function setChartRef(id: string, el: any) {
  emit('set-chart-ref', id, el);
}
</script>

<style scoped>
.canvas-panel {
  flex: 1;
  background-color: #f5f7fa;
  overflow: auto;
  position: relative;
}

.canvas-content {
  min-height: 100%;
  padding: 20px;
  /* 右侧减少内边距，为属性面板留出空间 */
  padding-right: 20px;
  display: flex;
  justify-content: center;
  transition: background-color 0.2s;
  overflow-x: hidden; /* 防止水平滚动 */
  box-sizing: border-box;
}

.canvas-content.drag-over {
  background-color: #ecf5ff;
}

.canvas-content-inner {
  position: relative;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
  /* 确保不与右侧面板重叠 */
}

.canvas-component-wrapper {
  position: relative;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.canvas-component-wrapper.width-100 {
  width: 100%;
}

.canvas-component-wrapper.width-50 {
  width: 50%;
  display: inline-block;
}

.canvas-component-wrapper.width-33 {
  width: 33.33%;
  display: inline-block;
}

.drag-handle {
  position: absolute;
  top: -24px;
  left: 0;
  background-color: #409eff;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 4px 4px 0 0;
  cursor: grab;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  z-index: 100;
  user-select: none;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle-tip {
  font-size: 12px;
}

.canvas-component {
  position: relative;
  background-color: #ffffff;
  border: 2px solid transparent;
  border-radius: 4px;
  min-height: 60px;
  cursor: pointer;
  transition: all 0.2s;
}

.canvas-component:hover {
  border-color: #c0c4cc;
}

.canvas-component.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.canvas-component.dragging {
  opacity: 0.5;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #409eff;
  border: 1px solid #ffffff;
  border-radius: 2px;
  z-index: 10;
}

.resize-handle.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

.insert-indicator {
  position: absolute;
  background-color: #409eff;
  z-index: 50;
}

.insert-indicator.insert-left {
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
}

.insert-indicator.insert-end {
  left: 0;
  right: 0;
  height: 4px;
  bottom: -8px;
}

.text-content {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
}

.image-placeholder .el-icon {
  font-size: 48px;
}

.image-content {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.rectangle-content {
  width: 100%;
  height: 100%;
}

.form-container {
  width: 100%;
}

.form-bordered {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
}
</style>
