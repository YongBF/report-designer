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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import * as echarts from 'echarts';
import BaseRenderer from './BaseRenderer.vue';
import type { PieChartComponent } from '../../../types';

const props = defineProps<{
  component: PieChartComponent;
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

// 获取图表数据
function getChartData() {
  const dataSource = props.component.dataSource;
  const staticData = dataSource?.staticData;

  if (!staticData) {
    // 默认模拟数据
    return [
      { name: '类别A', value: 335 },
      { name: '类别B', value: 310 },
      { name: '类别C', value: 234 },
      { name: '类别D', value: 135 },
      { name: '类别E', value: 1548 },
    ];
  }

  // 检查是否是旧格式（数组格式）
  if (Array.isArray(staticData) && staticData.length > 0) {
    // 检查第一个元素是否有 name 和 value 属性
    if ('name' in staticData[0] && 'value' in staticData[0]) {
      return staticData;
    }
  }

  // 新格式（categories + series），转换为饼图格式
  if (staticData.categories && Array.isArray(staticData.categories) &&
      staticData.series && Array.isArray(staticData.series) && staticData.series.length > 0) {
    // 饼图只使用第一个系列的数据
    const pieData = staticData.categories.map((cat, idx) => ({
      name: cat,
      value: staticData.series[0]?.data[idx] || 0,
    }));
    return pieData;
  }

  // 如果数据格式不匹配，返回默认数据
  return [
    { name: '类别A', value: 335 },
    { name: '类别B', value: 310 },
    { name: '类别C', value: 234 },
    { name: '类别D', value: 135 },
    { name: '类别E', value: 1548 },
  ];
}

// 初始化图表
function initChart() {
  if (!chartRef.value) return;

  if (chartInstance) {
    chartInstance.dispose();
  }

  chartInstance = echarts.init(chartRef.value, props.component.config.theme);
  updateChartOptions();
}

// 更新图表配置
function updateChartOptions() {
  if (!chartInstance) return;

  const option = generateChartOption();
  chartInstance.setOption(option, { notMerge: true });
}

// 生成图表配置
function generateChartOption() {
  const data = getChartData();
  const { config, series } = props.component;

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
    legend: config.showLegend
      ? {
          top: config.legendPosition === 'top' ? 0 : 'auto',
          bottom: config.legendPosition === 'bottom' ? 0 : 'auto',
          left: config.legendPosition === 'left' ? 0 : 'auto',
          right: config.legendPosition === 'right' ? 0 : 'auto',
        }
      : undefined,
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
        label: series.labelShow
          ? {
              show: series.labelShow,
              position: series.labelPosition,
              fontSize: series.labelFontSize,
              color: series.labelColor,
            }
          : undefined,
        itemStyle: {
          borderWidth: series.itemStyleBorderWidth,
          borderColor: series.itemStyleBorderColor,
          borderRadius: series.itemStyleBorderRadius,
        },
        minAngle: props.component.minAngle,
      },
    ],
    backgroundColor: config.backgroundColor,
  };
}

// 监听配置变化 - 直接监听 component 对象以确保所有属性变化都能被检测到
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

  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
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
