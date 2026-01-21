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
      :error-details="error || undefined"
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
import type { FunnelChartComponent } from '../../../types';
import { fetchWithLinkageParams } from '../../../utils/apiHelper';

const props = defineProps<{
  component: FunnelChartComponent;
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
  return chartData && Array.isArray(chartData) && chartData.length > 0;
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

  // 静态数据格式：{ data: [{name, value}, ...] }
  if (dataSource?.staticData && dataSource.staticData.length > 0) {
    return dataSource.staticData;
  }

  // 默认模拟数据
  return [
    { name: '展示', value: 100 },
    { name: '点击', value: 80 },
    { name: '访问', value: 60 },
    { name: '咨询', value: 40 },
    { name: '订单', value: 20 },
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
      formatter: '{a} <br/>{b}: {c}',
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
        type: 'funnel',
        left: props.component.left,
        top: props.component.top,
        right: props.component.right,
        bottom: props.component.bottom,
        width: props.component.width,
        height: props.component.height,
        sort: props.component.sort,
        gap: props.component.gap,
        label: series.labelShow
          ? {
              show: series.labelShow,
              position: series.labelPosition,
              fontSize: series.labelFontSize,
              color: series.labelColor,
            }
          : undefined,
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
