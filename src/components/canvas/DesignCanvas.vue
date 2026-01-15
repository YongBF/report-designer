<template>
  <div
    ref="canvasRef"
    class="design-canvas"
    :class="{ 'show-grid': showGrid }"
    :style="canvasStyle"
    @mousedown.self="handleCanvasMouseDown"
    @mousemove.self="handleCanvasMouseMove"
    @mouseup.self="handleCanvasMouseUp"
    @contextmenu.self.prevent
  >
    <!-- 画布内容 -->
    <div
      class="canvas-content"
      :style="contentStyle"
      @dragover.prevent
      @drop="handleDrop"
    >
      <!-- 渲染所有组件 -->
      <template v-for="component in sortedComponents" :key="component.id">
        <component
          :is="getComponentRenderer(component.type)"
          :component="component"
          :selected="selectedIds.includes(component.id)"
          :hovered="hoveredId === component.id"
          @update="handleUpdateComponent"
          @mousedown="handleComponentMouseDown(component, $event)"
          @mouseenter="setHoveredId(component.id)"
          @mouseleave="setHoveredId(null)"
        />
      </template>

      <!-- 选择框 - 多选 -->
      <div
        v-if="selectionBox"
        class="selection-box"
        :style="selectionBoxStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import VueDraggable from 'vue-draggable-plus'
import {
  currentDesign,
  selectedIds,
  hoveredId,
  scale,
  gridSize,
  showGrid,
  snapToGrid,
  updateComponent,
  selectComponent,
  clearSelection,
  selectAll,
  setHoveredId,
} from '../../stores/designer'
import type { Component } from '../../types'
import TextRenderer from './renderers/TextRenderer.vue'
import ImageRenderer from './renderers/ImageRenderer.vue'
import TableRenderer from './renderers/TableRenderer.vue'
import ChartRenderer from './renderers/ChartRenderer.vue'
import RectangleRenderer from './renderers/RectangleRenderer.vue'
import LineRenderer from './renderers/LineRenderer.vue'
import BarChartRenderer from './renderers/BarChartRenderer.vue'
import LineChartRenderer from './renderers/LineChartRenderer.vue'
import PieChartRenderer from './renderers/PieChartRenderer.vue'
import ScatterChartRenderer from './renderers/ScatterChartRenderer.vue'
import GaugeChartRenderer from './renderers/GaugeChartRenderer.vue'
import FunnelChartRenderer from './renderers/FunnelChartRenderer.vue'

const canvasRef = ref<HTMLElement>()

// 按 zIndex 排序的组件
const sortedComponents = computed(() => {
  return [...currentDesign.value.components].sort(
    (a, b) => a.zIndex - b.zIndex
  )
})

// 画布样式
const canvasStyle = computed(() => ({
  width: '100%',
  height: '100%',
  overflow: 'auto',
  backgroundColor: '#f5f5f5',
}))

// 画布内容样式
const contentStyle = computed(() => ({
  width: `${currentDesign.value.width}px`,
  height: `${currentDesign.value.height}px`,
  backgroundColor: currentDesign.value.backgroundColor,
  transform: `scale(${scale.value})`,
  transformOrigin: 'top left',
  position: 'relative',
  transition: 'transform 0.1s ease',
}))

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
  }
  return renderers[type]
}

// 拖拽相关
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const componentStartPos = ref<Map<string, { x: number; y: number }>>(new Map())

// 选择框相关
const selectionBox = ref(false)
const selectionStartPos = ref({ x: 0, y: 0 })
const selectionBoxStyle = ref({
  left: '0px',
  top: '0px',
  width: '0px',
  height: '0px',
})

// 画布鼠标事件
function handleCanvasMouseDown(e: MouseEvent) {
  // 清除选择
  clearSelection()
}

function handleCanvasMouseMove(e: MouseEvent) {
  if (selectionBox.value) {
    updateSelectionBox(e)
  }
}

function handleCanvasMouseUp(e: MouseEvent) {
  if (selectionBox.value) {
    finishSelectionBox()
  }
}

// 组件鼠标事件 - 开始拖拽
function handleComponentMouseDown(component: Component, e: MouseEvent) {
  e.stopPropagation()

  const isMultiSelect = e.ctrlKey || e.metaKey
  selectComponent(component.id, isMultiSelect)

  isDragging.value = true
  dragStartPos.value = { x: e.clientX, y: e.clientY }

  // 记录初始位置
  componentStartPos.value.clear()
  selectedIds.value.forEach((id) => {
    const comp = currentDesign.value.components.find((c) => c.id === id)
    if (comp) {
      componentStartPos.value.set(id, { x: comp.x, y: comp.y })
    }
  })

  // 添加全局事件监听
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)
}

// 拖拽移动
function handleDragMove(e: MouseEvent) {
  if (!isDragging.value) return

  const dx = (e.clientX - dragStartPos.value.x) / scale.value
  const dy = (e.clientY - dragStartPos.value.y) / scale.value

  selectedIds.value.forEach((id) => {
    const startPos = componentStartPos.value.get(id)
    if (!startPos) return

    const component = currentDesign.value.components.find((c) => c.id === id)
    if (!component) return

    let newX = startPos.x + dx
    let newY = startPos.y + dy

    // 吸附到网格
    if (snapToGrid.value) {
      newX = Math.round(newX / gridSize.value) * gridSize.value
      newY = Math.round(newY / gridSize.value) * gridSize.value
    }

    // 边界限制
    newX = Math.max(0, Math.min(newX, currentDesign.value.width - component.width))
    newY = Math.max(0, Math.min(newY, currentDesign.value.height - component.height))

    updateComponent(id, { x: newX, y: newY })
  })
}

// 拖拽结束
function handleDragEnd() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
}

// 选择框相关
function startSelectionBox(e: MouseEvent) {
  if (e.button !== 0) return

  selectionBox.value = true
  selectionStartPos.value = { x: e.clientX, y: e.clientY }
}

function updateSelectionBox(e: MouseEvent) {
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return

  const x1 = selectionStartPos.value.x
  const y1 = selectionStartPos.value.y
  const x2 = e.clientX
  const y2 = e.clientY

  const left = Math.min(x1, x2) - rect.left + canvasRef.value!.scrollLeft
  const top = Math.min(y1, y2) - rect.top + canvasRef.value!.scrollTop
  const width = Math.abs(x2 - x1)
  const height = Math.abs(y2 - y1)

  selectionBoxStyle.value = {
    left: `${left / scale.value}px`,
    top: `${top / scale.value}px`,
    width: `${width / scale.value}px`,
    height: `${height / scale.value}px`,
  }
}

function finishSelectionBox() {
  // 检查哪些组件在选择框内
  const boxLeft = parseFloat(selectionBoxStyle.value.left)
  const boxTop = parseFloat(selectionBoxStyle.value.top)
  const boxRight = boxLeft + parseFloat(selectionBoxStyle.value.width)
  const boxBottom = boxTop + parseFloat(selectionBoxStyle.value.height)

  const selected: string[] = []

  currentDesign.value.components.forEach((component) => {
    if (
      component.x >= boxLeft &&
      component.x + component.width <= boxRight &&
      component.y >= boxTop &&
      component.y + component.height <= boxBottom
    ) {
      selected.push(component.id)
    }
  })

  if (selected.length > 0) {
    selectComponent(selected)
  }

  selectionBox.value = false
}

// 处理拖放添加组件
function handleDrop(e: DragEvent) {
  e.preventDefault()

  const componentType = e.dataTransfer?.getData('componentType')
  if (!componentType) return

  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = (e.clientX - rect.left) / scale.value
  const y = (e.clientY - rect.top) / scale.value

  // 创建新组件
  const newComponent = createComponent(componentType as Component['type'], x, y)

  if (newComponent) {
    // 通过事件发送到父组件
    emit('add-component', newComponent)
  }
}

const emit = defineEmits<{
  (e: 'add-component', component: Component): void
}>()

// 创建新组件
function createComponent(
  type: Component['type'],
  x: number,
  y: number
): Component | null {
  const id = `${type}-${Date.now()}`

  const baseConfig = {
    id,
    x,
    y,
    zIndex: currentDesign.value.components.length,
    visible: true,
    locked: false,
  }

  switch (type) {
    case 'text':
      return {
        ...baseConfig,
        type: 'text',
        width: 200,
        height: 40,
        content: '双击编辑文本',
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#000000',
        fontWeight: 400,
        fontStyle: 'normal',
        textAlign: 'left',
        lineHeight: 1.5,
      }
    case 'image':
      return {
        ...baseConfig,
        type: 'image',
        width: 200,
        height: 200,
        src: '',
        fit: 'contain',
        opacity: 1,
        borderRadius: 0,
      }
    case 'table':
      return {
        ...baseConfig,
        type: 'table',
        width: 400,
        height: 300,
        columns: [
          { id: 'col1', field: 'field1', label: '列1', width: 100, align: 'left' },
          { id: 'col2', field: 'field2', label: '列2', width: 100, align: 'left' },
          { id: 'col3', field: 'field3', label: '列3', width: 100, align: 'left' },
        ],
        dataSource: null,
        showHeader: true,
        stripe: true,
        border: true,
        headerBackgroundColor: '#f5f7fa',
        headerColor: '#606266',
        fontSize: 14,
      }
    case 'chart':
      return {
        ...baseConfig,
        type: 'chart',
        width: 400,
        height: 300,
        chartType: 'bar',
        dataSource: null,
        title: '图表标题',
        showLegend: true,
        showDataZoom: false,
        theme: 'default',
      }
    case 'rectangle':
      return {
        ...baseConfig,
        type: 'rectangle',
        width: 200,
        height: 100,
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 0,
      }
    case 'line':
      return {
        ...baseConfig,
        type: 'line',
        width: 200,
        height: 2,
        stroke: '#000000',
        strokeWidth: 2,
        strokeStyle: 'solid',
      }
    case 'bar-chart':
    case 'line-chart': {
      const defaultAxisConfig = {
        show: true,
        name: '',
        nameFontSize: 12,
        nameColor: '#666',
        axisLabelFontSize: 12,
        axisLabelColor: '#666',
        axisLineColor: '#ccc',
        axisLineWidth: 1,
      }
      const defaultSeriesConfig = {
        labelShow: false,
        labelPosition: 'top' as const,
        labelFontSize: 12,
        labelColor: '#333',
        itemStyleBorderWidth: 0,
        itemStyleBorderColor: '#fff',
        itemStyleBorderRadius: 0,
        areaStyleOpacity: 0.3,
      }
      const defaultConfig = {
        title: '图表标题',
        titleFontSize: 16,
        titleColor: '#333',
        showLegend: true,
        legendPosition: 'top' as const,
        theme: 'default' as const,
        backgroundColor: '#fff',
        animation: true,
        animationDuration: 1000,
      }
      return {
        ...baseConfig,
        type: type === 'bar-chart' ? 'bar-chart' : 'line-chart',
        width: 400,
        height: 300,
        dataSource: null,
        config: defaultConfig,
        xAxis: defaultAxisConfig,
        yAxis: defaultAxisConfig,
        series: defaultSeriesConfig,
        ...(type === 'bar-chart' ? {
          barWidth: 20,
          barGap: '20%',
          showBackground: false,
          backgroundColor: '#eee',
        } : {
          smooth: false,
          step: false,
          showSymbol: true,
          symbolSize: 6,
          lineStyleWidth: 2,
          lineStyleType: 'solid' as const,
          areaStyle: false,
        }),
      }
    }
    case 'pie-chart': {
      const defaultConfig = {
        title: '饼图标题',
        titleFontSize: 16,
        titleColor: '#333',
        showLegend: true,
        legendPosition: 'bottom' as const,
        theme: 'default' as const,
        backgroundColor: '#fff',
        animation: true,
        animationDuration: 1000,
      }
      const defaultSeriesConfig = {
        labelShow: true,
        labelPosition: 'outside' as const,
        labelFontSize: 12,
        labelColor: '#333',
        itemStyleBorderWidth: 0,
        itemStyleBorderColor: '#fff',
        itemStyleBorderRadius: 0,
        areaStyleOpacity: 0.3,
      }
      return {
        ...baseConfig,
        type: 'pie-chart',
        width: 400,
        height: 300,
        dataSource: null,
        config: defaultConfig,
        series: defaultSeriesConfig,
        roseType: false,
        radius: ['0%', '70%'],
        center: ['50%', '50%'],
        emphasisScale: true,
        minAngle: 0,
      }
    }
    case 'scatter-chart': {
      const defaultAxisConfig = {
        show: true,
        name: '',
        nameFontSize: 12,
        nameColor: '#666',
        axisLabelFontSize: 12,
        axisLabelColor: '#666',
        axisLineColor: '#ccc',
        axisLineWidth: 1,
      }
      const defaultSeriesConfig = {
        labelShow: false,
        labelPosition: 'top' as const,
        labelFontSize: 12,
        labelColor: '#333',
        itemStyleBorderWidth: 0,
        itemStyleBorderColor: '#fff',
        itemStyleBorderRadius: 0,
        areaStyleOpacity: 0.3,
      }
      const defaultConfig = {
        title: '散点图标题',
        titleFontSize: 16,
        titleColor: '#333',
        showLegend: true,
        legendPosition: 'top' as const,
        theme: 'default' as const,
        backgroundColor: '#fff',
        animation: true,
        animationDuration: 1000,
      }
      return {
        ...baseConfig,
        type: 'scatter-chart',
        width: 400,
        height: 300,
        dataSource: null,
        config: defaultConfig,
        xAxis: defaultAxisConfig,
        yAxis: defaultAxisConfig,
        series: defaultSeriesConfig,
        symbolSize: 8,
        symbol: 'circle' as const,
        showEffect: false,
        effectType: 'ripple' as const,
      }
    }
    case 'gauge-chart': {
      const defaultConfig = {
        title: '仪表盘标题',
        titleFontSize: 16,
        titleColor: '#333',
        showLegend: false,
        legendPosition: 'top' as const,
        theme: 'default' as const,
        backgroundColor: '#fff',
        animation: true,
        animationDuration: 1000,
      }
      return {
        ...baseConfig,
        type: 'gauge-chart',
        width: 300,
        height: 300,
        dataSource: null,
        config: defaultConfig,
        min: 0,
        max: 100,
        startAngle: 225,
        endAngle: -45,
        radius: '75%',
        axisLine: {
          show: true,
          lineStyleWidth: 30,
        },
        splitNumber: 10,
        detail: {
          show: true,
          fontSize: 20,
          color: '#333',
          formatter: '{value}',
        },
        pointer: {
          show: true,
          length: '70%',
          width: 6,
        },
      }
    }
    case 'funnel-chart': {
      const defaultConfig = {
        title: '漏斗图标题',
        titleFontSize: 16,
        titleColor: '#333',
        showLegend: true,
        legendPosition: 'top' as const,
        theme: 'default' as const,
        backgroundColor: '#fff',
        animation: true,
        animationDuration: 1000,
      }
      const defaultSeriesConfig = {
        labelShow: true,
        labelPosition: 'outside' as const,
        labelFontSize: 12,
        labelColor: '#333',
        itemStyleBorderWidth: 0,
        itemStyleBorderColor: '#fff',
        itemStyleBorderRadius: 0,
        areaStyleOpacity: 0.3,
      }
      return {
        ...baseConfig,
        type: 'funnel-chart',
        width: 400,
        height: 300,
        dataSource: null,
        config: defaultConfig,
        series: defaultSeriesConfig,
        sort: 'descending' as const,
        gap: 0,
        left: '10%',
        top: 60,
        right: '10%',
        bottom: 60,
        width: '80%',
        height: '80%',
        labelAlign: 'center' as const,
      }
    }
    default:
      return null
  }
}

// 更新组件
function handleUpdateComponent(id: string, updates: Partial<Component>) {
  updateComponent(id, updates)
}
</script>

<style scoped>
.design-canvas {
  position: relative;
  overflow: auto;
  user-select: none;
}

.design-canvas.show-grid {
  background-image: linear-gradient(to right, #e0e0e0 1px, transparent 1px),
    linear-gradient(to bottom, #e0e0e0 1px, transparent 1px);
  background-size: 10px 10px;
}

.canvas-content {
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selection-box {
  position: absolute;
  border: 1px dashed #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  pointer-events: none;
  z-index: 9999;
}
</style>
