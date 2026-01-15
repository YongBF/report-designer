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
import type { PieChartComponent } from '../../../types'

const props = defineProps<{
  component: PieChartComponent
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
    { name: '类别A', value: 335 },
    { name: '类别B', value: 310 },
    { name: '类别C', value: 234 },
    { name: '类别D', value: 135 },
    { name: '类别E', value: 1548 },
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
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: config.showLegend ? {
      top: config.legendPosition === 'top' ? 0 : 'auto',
      bottom: config.legendPosition === 'bottom' ? 0 : 'auto',
      left: config.legendPosition === 'left' ? 0 : 'auto',
      right: config.legendPosition === 'right' ? 0 : 'auto',
    } : undefined,
    series: [
      {
        type: 'pie',
        radius: props.component.radius,
        center: props.component.center,
        roseType: props.component.roseType,
        data: data,
        emphasis: {
          scale: props.component.emphasisScale,
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        label: series.labelShow ? {
          show: series.labelShow,
          position: series.labelPosition,
          fontSize: series.labelFontSize,
          color: series.labelColor,
        } : undefined,
        itemStyle: {
          borderWidth: series.itemStyleBorderWidth,
          borderColor: series.itemStyleBorderColor,
          borderRadius: series.itemStyleBorderRadius,
        },
        minAngle: props.component.minAngle,
      },
    ],
    backgroundColor: config.backgroundColor,
  }
}

// 监听配置变化
watch(
  () => [props.component.config, props.component.series, props.component.radius, props.component.center, props.component.roseType, props.component.emphasisScale, props.component.minAngle, props.component.dataSource],
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
