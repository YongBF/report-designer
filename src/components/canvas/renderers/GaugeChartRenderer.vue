<template>
  <BaseRenderer
    :component="component"
    :selected="selected"
    :hovered="hovered"
    @mousedown="$emit('mousedown', $event)"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @update="(id, updates) => $emit('update', id, updates)"
  >
    <div ref="chartRef" class="chart-container" :style="containerStyle" />
  </BaseRenderer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import BaseRenderer from './BaseRenderer.vue'
import type { GaugeChartComponent } from '../../../types'

const props = defineProps<{
  component: GaugeChartComponent
  selected?: boolean
  hovered?: boolean
}>()

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void
  (e: 'mouseenter'): void
  (e: 'mouseleave'): void
  (e: 'update', id: string, updates: any): void
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
}))

// 获取图表数据
function getChartData() {
  const dataSource = props.component.dataSource
  if (dataSource?.staticData && dataSource.staticData.length > 0) {
    const data = dataSource.staticData[0]
    return data.value !== undefined ? data.value : 50
  }
  // 默认模拟数据
  return Math.floor(Math.random() * 100)
}

// 初始化图表
function initChart() {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value, props.component.config.theme)
  updateChartOptions()
}

// 更新图表配置
function updateChartOptions() {
  if (!chartInstance) return

  const option = generateChartOption()
  chartInstance.setOption(option, { notMerge: true })
}

// 生成图表配置
function generateChartOption() {
  const data = getChartData()
  const { config } = props.component

  return {
    title: {
      text: config.title,
      left: 'center',
      textStyle: {
        fontSize: config.titleFontSize,
        color: config.titleColor,
      },
    },
    series: [
      {
        type: 'gauge',
        min: props.component.min,
        max: props.component.max,
        startAngle: props.component.startAngle,
        endAngle: props.component.endAngle,
        radius: props.component.radius,
        axisLine: {
          show: props.component.axisLine.show,
          lineStyle: {
            width: props.component.axisLine.lineStyleWidth,
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d'],
            ],
          },
        },
        pointer: {
          show: props.component.pointer.show,
          length: props.component.pointer.length,
          width: props.component.pointer.width,
        },
        splitNumber: props.component.splitNumber,
        detail: props.component.detail.show ? {
          valueAnimation: true,
          fontSize: props.component.detail.fontSize,
          color: props.component.detail.color,
          formatter: props.component.detail.formatter,
        } : undefined,
        data: [
          {
            value: data,
          },
        ],
      },
    ],
    backgroundColor: config.backgroundColor,
  }
}

// 监听配置变化
watch(
  () => [props.component.config, props.component.min, props.component.max, props.component.startAngle, props.component.endAngle, props.component.radius, props.component.axisLine, props.component.pointer, props.component.splitNumber, props.component.detail, props.component.dataSource],
  () => {
    nextTick(() => {
      updateChartOptions()
    })
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    initChart()
  })

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  chartInstance?.resize()
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
