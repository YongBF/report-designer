<!--
  ComponentLibrary.vue

  组件库面板

  左侧面板，包含所有可拖拽的组件：
  - 基础组件：文本、图片、表格、表单
  - 图表组件：柱状图、折线图、饼图、散点图、仪表盘
  - 形状组件：矩形、线条

  @component ComponentLibrary
  @author Report Designer Team
  @since 2026-01-17
-->
<template>
  <div class="left-panel">
    <div class="panel-header">
      <h3>组件库</h3>
    </div>

    <div class="panel-content">
      <!-- 基础组件 -->
      <div class="component-group">
        <div class="group-title">基础组件</div>
        <div
          v-for="item in basicComponents"
          :key="item.type"
          class="component-item"
          draggable="true"
          @dragstart="handleDragStart(item, $event)"
        >
          <div class="component-icon">
            <component :is="item.icon" />
          </div>
          <div class="component-label">{{ item.label }}</div>
        </div>
      </div>

      <!-- 图表组件 -->
      <div class="component-group">
        <div class="group-title">图表组件</div>
        <div
          v-for="item in chartComponents"
          :key="item.type"
          class="component-item"
          draggable="true"
          @dragstart="handleDragStart(item, $event)"
        >
          <div class="component-icon">
            <component :is="item.icon" />
          </div>
          <div class="component-label">{{ item.label }}</div>
        </div>
      </div>

      <!-- 形状组件 -->
      <div class="component-group">
        <div class="group-title">形状组件</div>
        <div
          v-for="item in shapeComponents"
          :key="item.type"
          class="component-item"
          draggable="true"
          @dragstart="handleDragStart(item, $event)"
        >
          <div class="component-icon">
            <component :is="item.icon" />
          </div>
          <div class="component-label">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { basicComponents, chartComponents, shapeComponents } from '@/utils/componentData';

// Emits
const emit = defineEmits<{
  'drag-start': [item: any, event: DragEvent];
}>();

/**
 * 处理组件拖拽开始
 */
function handleDragStart(item: any, event: DragEvent) {
  emit('drag-start', item, event);
}
</script>

<style scoped>
.left-panel {
  width: 240px;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.component-group {
  margin-bottom: 16px;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
  padding-left: 4px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 6px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: grab;
  transition: all 0.2s;
}

.component-item:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  transform: translateX(2px);
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 18px;
}

.component-label {
  font-size: 13px;
  color: #303133;
  user-select: none;
}
</style>
