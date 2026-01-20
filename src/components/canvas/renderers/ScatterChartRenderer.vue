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
    <DataLoadingState
      :loading="loading"
      :error="error"
      :error-details="error"
      :empty="!loading && !error && !hasData"
      empty-text="暂无数据"
      :fullscreen="false"
      :show-retry="true"
      :show-details="true"
      @retry="refresh"
    >
      <div ref="chartRef" class="chart-container" :style="containerStyle" />
    </DataLoadingState>
  </BaseRenderer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import BaseRenderer from './BaseRenderer.vue';
import DataLoadingState from '../../common/DataLoadingState.vue';
import type { ScatterChartComponent } from '../../../types';
import { fetchWithLinkageParams } from '../../../utils/apiHelper';

const props = defineProps<{
  component: ScatterChartComponent;
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

// API数据缓存
const apiChartData = ref<any>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
}));

// 计算是否有数据
const hasData = computed(() => {
  const chartData = getChartData();
  return chartData && chartData.series && chartData.series.length > 0;
});

/**
 * 从API获取数据
 */
async function fetchApiData() {
  const dataSource = props.component.dataSource;
  if (!dataSource || dataSource.type !== 'api') {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
      url: dataSource.apiUrl,
      linkageParams: props.component.linkageParams,
    });

    const data = await fetchWithLinkageParams(
      dataSource,
      props.component.linkageParams || {},
      props.component.beforeRequest
    );

    apiChartData.value = data;
  } catch (err: any) {
    error.value = err.message || '获取数据失败';
    apiChartData.value = null;
  } finally {
    loading.value = false;
  }
}

// 获取图表数据
function getChartData() {
  const dataSource = props.component.dataSource;

  // 优先使用API数据
  if (apiChartData.value) {
    return apiChartData.value;
  }

  // 静态数据格式：{ categories: string[], series: Array<{ name: string, data: number[] }> }
  if (dataSource?.staticData) {
    const staticData = dataSource.staticData;
    if (staticData.categories && staticData.categories.length > 0 &&
        staticData.series && staticData.series.length > 0) {
      return staticData;
    }
  }

  // 默认模拟数据
  return {
    categories: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100'],
    series: [
      {
        name: '数据点',
        data: [
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
        ],
      },
    ],
  };
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
  const chartData = getChartData();
  const { config, xAxis, yAxis, series } = props.component;

  // 提取类别和系列数据
  const categories = chartData.categories || [];
  const seriesList = chartData.series || [];

  // 如果没有系列数据，使用默认数据
  if (seriesList.length === 0) {
    return generateDefaultOption();
  }

  // 构建图例数据
  const legendData = seriesList.map((s: any) => s.name);

  // 构建系列配置
  const seriesConfigs = seriesList.map((s: any) => ({
    type: 'scatter',
    name: s.name,
    data: s.data,
    symbolSize: props.component.symbolSize,
    symbol: props.component.symbol,
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
    emphasis: {
      focus: 'series',
    },
    rippleEffect: props.component.showEffect
      ? {
          brushType: props.component.effectType === 'ripple' ? 'stroke' : 'fill',
          scale: 3,
        }
      : undefined,
  }));

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
          return `X: ${params.data[0]}<br/>Y: ${params.data[1]}`;
        }
        return `${params.name}<br/>值: ${params.value}`;
      },
    },
    legend: config.showLegend
      ? {
          data: legendData,
          top: config.legendPosition === 'top' ? 0 : 'auto',
          bottom: config.legendPosition === 'bottom' ? 0 : 'auto',
          left: config.legendPosition === 'left' ? 0 : 'auto',
          right: config.legendPosition === 'right' ? 0 : 'auto',
        }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom:
        config.showLegend &&
        (config.legendPosition === 'bottom' ||
          !config.legendPosition ||
          config.legendPosition === 'top')
          ? '15%'
          : '3%',
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
    series: seriesConfigs,
    backgroundColor: config.backgroundColor,
  };
}

// 生成默认配置（当没有数据时）
function generateDefaultOption() {
  const { config, xAxis, yAxis, series } = props.component;

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
          return `X: ${params.data[0]}<br/>Y: ${params.data[1]}`;
        }
        return `${params.name}<br/>值: ${params.value}`;
      },
    },
    legend: config.showLegend
      ? {
          top: config.legendPosition === 'top' ? 0 : 'auto',
          bottom: config.legendPosition === 'bottom' ? 0 : 'auto',
          left: config.legendPosition === 'left' ? 0 : 'auto',
          right: config.legendPosition === 'right' ? 0 : 'auto',
        }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
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
        data: [
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
        ],
        symbolSize: props.component.symbolSize,
        symbol: props.component.symbol,
        name: '示例数据',
      },
    ],
    backgroundColor: config.backgroundColor,
  };
}

/**
 * 刷新数据（供联动调用）
 */
function refresh() {
  fetchApiData();
  if (chartInstance) {
    updateChartOptions();
  }
}

/**
 * 处理联动刷新事件
 */
function handleLinkageRefresh(event: CustomEvent) {
  if (event.detail?.targetComponentId === props.component.id) {
    refresh();
  }
}

// 监听数据源变化
watch(
  () => props.component.dataSource,
  (newDataSource) => {
    if (newDataSource?.type === 'api') {
      fetchApiData();
    } else {
      apiChartData.value = null;
    }
    nextTick(() => {
      updateChartOptions();
    });
  },
  { immediate: true }
);

// 监听联动参数变化
watch(
  () => props.component.linkageParams,
  (newParams) => {
    if (props.component.dataSource?.type === 'api') {
      fetchApiData().then(() => {
        nextTick(() => {
          updateChartOptions();
        });
      });
    }
  },
  { deep: true }
);

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

// 挂载时添加事件监听
onMounted(() => {
  window.addEventListener('component-linkage-refresh', handleLinkageRefresh as EventListener);
  window.addEventListener('resize', handleResize);
  nextTick(() => {
    initChart();
  });
});

// 卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('component-linkage-refresh', handleLinkageRefresh as EventListener);
  window.removeEventListener('resize', handleResize);
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// 暴露刷新方法供外部调用
defineExpose({
  refresh,
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
