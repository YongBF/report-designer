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
import type { FunnelChartComponent } from '../../../types'

const props = defineProps<{
  component: FunnelChartComponent
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
    return dataSource.staticData
  }
  // 默认模拟数据
  return [
    { name: '展示', value: 100 },
    { name: '点击', value: 80 },
    { name: '访问', value: 60 },
    { name: '咨询', value: 40 },
    { name: '订单', value: 20 },
  ]
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
  const { config, series } = props.component

  return {
    title: {
      text: config.title,
      left: 'center',
      textStyle: {
        fontSize: config.titleFontSize,
        color: config.titleColor,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}',
    },
    legend: config.showLegend ? {
      top: config.legendPosition === 'top' ? 0 : 'auto',
      bottom: config.legendPosition === 'bottom' ? 0 : 'auto',
      left: config.legendPosition === 'left' ? 0 : 'auto',
      right: config.legendPosition === 'right' ? 0 : 'auto',
    } : undefined,
    series: [
      {
        type: 'funnel',
        left: props.component.left,
        top: props.component.top,
        right: props.component.right,
        bottom: props.component.bottom,
        width: props.component.width,
        height: props.component.height,
        sort: props.component.sort,
        gap: props.component.gap,
        label: series.labelShow ? {
          show: series.labelShow,
          position: series.labelPosition,
          fontSize: series.labelFontSize,
          color: series.labelColor,
        } : undefined,
        labelLine: {
          show: true,
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderWidth: series.itemStyleBorderWidth,
          borderColor: series.itemStyleBorderColor,
          borderRadius: series.itemStyleBorderRadius,
        },
        data: data,
      },
    ],
    backgroundColor: config.backgroundColor,
  }
}

// 监听配置变化
watch(
  () => [props.component.config, props.component.series, props.component.sort, props.component.gap, props.component.left, props.component.top, props.component.right, props.component.bottom, props.component.width, props.component.height, props.component.labelAlign, props.component.dataSource],
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
