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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import BaseRenderer from './BaseRenderer.vue';
import type { ChartComponent } from '../../../types';

const props = defineProps<{
  component: ChartComponent;
  selected?: boolean;
  hovered?: boolean;
}>();

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void;
  (e: 'mouseenter'): void;
  (e: 'mouseleave'): void;
  (e: 'update', id: string, updates: any): void;
}>();

const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
}));

// 初始化图表
function initChart() {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value, props.component.theme);
  updateChartOptions();
}

// 更新图表配置
function updateChartOptions() {
  if (!chartInstance) return;

  const option = generateChartOption();
  chartInstance.setOption(option, true);
}

// 生成图表配置
function generateChartOption() {
  const data = props.component.dataSource?.staticData || generateMockData();

  const baseOption = {
    title: {
      text: props.component.title,
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: props.component.showLegend
      ? {
          top: 'bottom',
        }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: props.component.showLegend ? '15%' : '3%',
      containLabel: true,
    },
  };

  switch (props.component.chartType) {
    case 'bar':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: data.map((d: any) => d.name),
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'bar',
            data: data.map((d: any) => d.value),
          },
        ],
      };

    case 'line':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: data.map((d: any) => d.name),
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'line',
            data: data.map((d: any) => d.value),
            smooth: true,
          },
        ],
      };

    case 'pie':
      return {
        title: baseOption.title,
        tooltip: {
          trigger: 'item',
        },
        legend: props.component.showLegend
          ? {
              top: 'bottom',
            }
          : undefined,
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };

    case 'scatter':
      return {
        ...baseOption,
        xAxis: {
          type: 'value',
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'scatter',
            data: data,
          },
        ],
      };

    default:
      return baseOption;
  }
}

// 生成模拟数据
function generateMockData() {
  const mockData = [
    { name: '类别1', value: Math.floor(Math.random() * 100) },
    { name: '类别2', value: Math.floor(Math.random() * 100) },
    { name: '类别3', value: Math.floor(Math.random() * 100) },
    { name: '类别4', value: Math.floor(Math.random() * 100) },
    { name: '类别5', value: Math.floor(Math.random() * 100) },
  ];

  if (props.component.chartType === 'pie') {
    return mockData;
  }

  return mockData.map((d) => [d.name, d.value]);
}

// 监听组件变化
watch(
  () => props.component,
  () => {
    nextTick(() => {
      updateChartOptions();
    });
  },
  { deep: true }
);

onMounted(() => {
  nextTick(() => {
    initChart();
  });

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener('resize', handleResize);
});

function handleResize() {
  chartInstance?.resize();
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
}
</style>
