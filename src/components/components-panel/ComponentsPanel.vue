<template>
  <div class="components-panel">
    <div class="panel-header">
      <h3>组件库</h3>
    </div>

    <div class="panel-content">
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
import {
  Document,
  Picture,
  Grid,
  DataAnalysis,
  Histogram,
  PieChart,
  Coin,
  Crop,
} from '@element-plus/icons-vue'
import type { ComponentType } from '../../types'

interface ComponentItem {
  type: ComponentType
  label: string
  icon: any
}

const basicComponents: ComponentItem[] = [
  { type: 'text', label: '文本', icon: Document },
  { type: 'image', label: '图片', icon: Picture },
  { type: 'table', label: '表格', icon: Grid },
]

const chartComponents: ComponentItem[] = [
  { type: 'chart', label: '图表', icon: DataAnalysis },
]

const shapeComponents: ComponentItem[] = [
  { type: 'rectangle', label: '矩形', icon: Histogram },
  { type: 'line', label: '线条', icon: Coin },
]

function handleDragStart(item: ComponentItem, e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('componentType', item.type)
    e.dataTransfer.effectAllowed = 'copy'
  }
}
</script>

<style scoped>
.components-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.component-group {
  margin-bottom: 24px;
}

.component-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 12px;
}

.component-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s ease;
}

.component-item:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  transform: translateX(4px);
}

.component-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 4px;
  margin-right: 12px;
  color: #409eff;
}

.component-icon .el-icon {
  font-size: 20px;
}

.component-label {
  font-size: 14px;
  color: #303133;
}
</style>
