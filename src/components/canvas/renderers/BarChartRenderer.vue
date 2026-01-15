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
import type { BarChartComponent } from '../../../types'

const props = defineProps<{
  component: BarChartComponent
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
    { name: '周一', value: 120 },
    { name: '周二', value: 200 },
    { name: '周三', value: 150 },
    { name: '周四', value: 180 },
    { name: '周五', value: 220 },
    { name: '周六', value: 280 },
    { name: '周日', value: 240 },
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
  const { config, xAxis, yAxis, series } = props.component

  const xAxisData = data.map((d: any) => d.name || d.category || d.x)
  const seriesData = data.map((d: any) => d.value || d.y)

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
      trigger: 'axis',
    },
    legend: config.showLegend ? {
      top: config.legendPosition === 'top' ? 0 : 'auto',
      bottom: config.legendPosition === 'bottom' ? 0 : 'auto',
      left: config.legendPosition === 'left' ? 0 : 'auto',
      right: config.legendPosition === 'right' ? 0 : 'auto',
    } : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: config.showLegend && (config.legendPosition === 'bottom' || !config.legendPosition || config.legendPosition === 'top') ? '15%' : '3%',
      containLabel: true,
    },
    xAxis: {
      show: xAxis.show,
      type: 'category',
      name: xAxis.name,
      data: xAxisData,
      nameTextStyle: {
        fontSize: xAxis.nameFontSize,
        color: xAxis.nameColor,
      },
      axisLabel: {
        fontSize: xAxis.axisLabelFontSize,
        color: xAxis.axisLabelColor,
      },
      axisLine: {
        lineStyle: {
          color: xAxis.axisLineColor,
          width: xAxis.axisLineWidth,
        },
      },
    },
    yAxis: {
      show: yAxis.show,
      type: 'value',
      name: yAxis.name,
      nameTextStyle: {
        fontSize: yAxis.nameFontSize,
        color: yAxis.nameColor,
      },
      axisLabel: {
        fontSize: yAxis.axisLabelFontSize,
        color: yAxis.axisLabelColor,
      },
      axisLine: {
        lineStyle: {
          color: yAxis.axisLineColor,
          width: yAxis.axisLineWidth,
        },
      },
    },
    series: [
      {
        type: 'bar',
        data: seriesData,
        barWidth: props.component.barWidth,
        barGap: props.component.barGap,
        showBackground: props.component.showBackground,
        backgroundStyle: {
          color: props.component.backgroundColor,
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
      },
    ],
  }
}

// 监听配置变化
watch(
  () => [props.component.config, props.component.xAxis, props.component.yAxis, props.component.series, props.component.barWidth, props.component.barGap, props.component.showBackground, props.component.backgroundColor, props.component.dataSource],
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
