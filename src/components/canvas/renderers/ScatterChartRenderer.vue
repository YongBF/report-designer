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
import type { ScatterChartComponent } from '../../../types'

const props = defineProps<{
  component: ScatterChartComponent
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
  // 默认模拟数据 - 二维数组 [x, y]
  return [
    [10, 20],
    [20, 40],
    [30, 60],
    [40, 80],
    [50, 100],
    [60, 90],
    [70, 70],
    [80, 50],
    [90, 30],
    [100, 10],
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
      formatter: (params: any) => {
        if (Array.isArray(params.data)) {
          return `X: ${params.data[0]}<br/>Y: ${params.data[1]}`
        }
        return `${params.name}<br/>值: ${params.value}`
      },
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
      type: 'value',
      name: xAxis.name,
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
        type: 'scatter',
        data: data,
        symbolSize: props.component.symbolSize,
        symbol: props.component.symbol,
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
        emphasis: {
          focus: 'series',
        },
        rippleEffect: props.component.showEffect ? {
          brushType: props.component.effectType === 'ripple' ? 'stroke' : 'fill',
          scale: 3,
        } : undefined,
      },
    ],
    backgroundColor: config.backgroundColor,
  }
}

// 监听配置变化
watch(
  () => [props.component.config, props.component.xAxis, props.component.yAxis, props.component.series, props.component.symbolSize, props.component.symbol, props.component.showEffect, props.component.effectType, props.component.dataSource],
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
