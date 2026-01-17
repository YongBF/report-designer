/**
 * useWatchers.ts
 *
 * 监听器管理相关的 composable
 *
 * 功能包括：
 * - 监听柱状图选中变化
 * - 监听表格数据源类型变化
 * - 监听表单组件变化，加载 API 选项
 * - 监听表单项选项来源切换
 * - 监听图表数据源变化
 * - 监听组件数量变化，初始化图表
 * - 监听图表组件配置变化，重新渲染图表
 *
 * @module composables/useWatchers
 * @author Report Designer Team
 * @since 2025-01-15
 */

import { watch, nextTick } from 'vue';
import { useDesignerStore } from '../stores/pinia';
import { storeToRefs } from 'pinia';
import type { Component } from '../types';

interface WatchersDeps {
  // 状态
  selectedComponent: any;
  orderedComponents: any;
  barChartCollapseActive: any;
  // 表格相关
  tableDataSourceType: any;
  staticData: any;
  tableApiUrl: any;
  tableApiMethod: any;
  tableDataPath: any;
  // 图表相关
  chartDataSourceType: any;
  chartCategories: any;
  chartSeries: any;
  chartDataApiUrl: any;
  chartDataApiMethod: any;
  // 表单相关
  editingFormItem: any;
  // 方法
  loadApiOptions: (item: any) => Promise<any>;
  initCharts: () => void;
  updateChart: (component: any) => void;
}

/**
 * 监听器管理的 composable
 *
 * @param deps - 依赖的状态和方法
 */
export function useWatchers(deps: WatchersDeps) {
  const designerStore = useDesignerStore();
  const { currentDesign } = storeToRefs(designerStore);

  const {
    selectedComponent,
    orderedComponents,
    barChartCollapseActive,
    tableDataSourceType,
    staticData,
    tableApiUrl,
    tableApiMethod,
    tableDataPath,
    chartDataSourceType,
    chartCategories,
    chartSeries,
    chartDataApiUrl,
    chartDataApiMethod,
    editingFormItem,
    loadApiOptions,
    initCharts,
    updateChart,
  } = deps;

  /**
   * 监听柱状图选中变化
   */
  watch(
    () => selectedComponent.value?.type,
    (newType) => {
      if (newType === 'bar-chart') {
        barChartCollapseActive.value = ['basic'];
      }
    }
  );

  /**
   * 监听选中组件变化，更新表格数据源类型
   */
  watch(
    () => selectedComponent.value?.id,
    () => {
      if (!selectedComponent.value || selectedComponent.value.type !== 'table') return;

      const table = selectedComponent.value as any;
      if (table.dataSource?.staticData) {
        tableDataSourceType.value = 'static';
        staticData.value = [...table.dataSource.staticData];
      } else if (table.dataSource?.apiUrl) {
        tableDataSourceType.value = 'api';
        tableApiUrl.value = table.dataSource.apiUrl || '';
        tableApiMethod.value = table.dataSource.apiMethod || 'GET';
        tableDataPath.value = table.dataSource.dataPath || '';
      } else {
        tableDataSourceType.value = 'static';
        staticData.value = [];
      }
    },
    { immediate: true }
  );

  /**
   * 监听表单组件变化，加载 API 选项
   */
  watch(
    () => orderedComponents.value,
    async (components) => {
      for (const component of components) {
        if (component.type === 'form' && component.items) {
          for (const item of component.items) {
            if (item.optionsSourceType === 'api' && item.optionsApiConfig?.url) {
              await loadApiOptions(item);
            }
          }
        }
      }
    },
    { deep: true, immediate: true }
  );

  /**
   * 监听编辑中的表单项选项来源切换，自动初始化 API 配置
   */
  watch(
    () => editingFormItem.value?.optionsSourceType,
    (newType) => {
      if (newType === 'api' && editingFormItem.value) {
        if (!editingFormItem.value.optionsApiConfig) {
          editingFormItem.value.optionsApiConfig = {
            url: '',
            method: 'GET',
            labelField: 'label',
            valueField: 'value',
            headers: {},
            params: {},
          };
          editingFormItem.value.optionsApiConfigHeadersJson = '{}';
          editingFormItem.value.optionsApiConfigParamsJson = '{}';
        }
      }
    }
  );

  /**
   * 监听图表选中变化，同步数据源配置
   */
  watch(
    () => selectedComponent.value?.id,
    () => {
      if (!selectedComponent.value || selectedComponent.value.type !== 'bar-chart') return;

      const chart = selectedComponent.value as any;
      if (chart.dataSource) {
        chartDataSourceType.value = chart.dataSource.type || 'static';

        if (chart.dataSource.type === 'static' && chart.dataSource.staticData) {
          chartCategories.value = [...(chart.dataSource.staticData.categories || [])];
          chartSeries.value = (chart.dataSource.staticData.series || []).map((s: any) => ({
            name: s.name,
            data: [...s.data],
            dataString: s.data.join(', '),
          }));
        } else if (chart.dataSource.type === 'api') {
          chartDataApiUrl.value = chart.dataSource.apiUrl || '';
          chartDataApiMethod.value = chart.dataSource.apiMethod || 'GET';
        }
      }
    },
    { immediate: true }
  );

  /**
   * 监听组件数量变化，初始化图表
   */
  watch(
    () => currentDesign.value.components.length,
    () => {
      nextTick(() => {
        initCharts();
      });
    }
  );

  /**
   * 监听图表组件配置变化，重新渲染图表
   */
  watch(
    () =>
      currentDesign.value.components.filter((c) =>
        [
          'chart',
          'bar-chart',
          'line-chart',
          'pie-chart',
          'scatter-chart',
          'gauge-chart',
          'funnel-chart',
        ].includes(c.type)
      ),
    (newCharts, oldCharts) => {
      nextTick(() => {
        newCharts.forEach((component) => {
          const oldChart = oldCharts?.find((c) => c.id === component.id);
          let hasChanged = !oldChart;

          if (!hasChanged && oldChart) {
            if (component.type === 'bar-chart') {
              const keys = [
                'config',
                'xAxis',
                'yAxis',
                'series',
                'barWidth',
                'barGap',
                'showBackground',
                'backgroundColor',
                'dataSource',
              ];
              for (const key of keys) {
                if (
                  JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])
                ) {
                  hasChanged = true;
                  break;
                }
              }
            } else if (component.type === 'line-chart') {
              const keys = [
                'config',
                'xAxis',
                'yAxis',
                'series',
                'smooth',
                'step',
                'showSymbol',
                'symbolSize',
                'lineStyleWidth',
                'lineStyleType',
                'areaStyle',
                'dataSource',
              ];
              for (const key of keys) {
                if (
                  JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])
                ) {
                  hasChanged = true;
                  break;
                }
              }
            } else if (component.type === 'scatter-chart') {
              const keys = [
                'config',
                'xAxis',
                'yAxis',
                'series',
                'symbolSize',
                'symbol',
                'showEffect',
                'effectType',
                'dataSource',
              ];
              for (const key of keys) {
                if (
                  JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])
                ) {
                  hasChanged = true;
                  break;
                }
              }
            } else if (component.type === 'pie-chart') {
              const keys = [
                'config',
                'series',
                'roseType',
                'radius',
                'center',
                'emphasisScale',
                'minAngle',
                'dataSource',
              ];
              for (const key of keys) {
                if (
                  JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])
                ) {
                  hasChanged = true;
                  break;
                }
              }
            } else if (component.type === 'funnel-chart') {
              const keys = ['config', 'series', 'dataSource'];
              for (const key of keys) {
                if (
                  JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])
                ) {
                  hasChanged = true;
                  break;
                }
              }
            } else if (component.type === 'gauge-chart') {
              const keys = [
                'config',
                'min',
                'max',
                'startAngle',
                'endAngle',
                'radius',
                'axisLine',
                'splitNumber',
                'detail',
                'pointer',
                'dataSource',
              ];
              for (const key of keys) {
                if (
                  JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])
                ) {
                  hasChanged = true;
                  break;
                }
              }
            } else if (component.type === 'chart') {
              hasChanged = JSON.stringify(component) !== JSON.stringify(oldChart);
            }
          }

          if (hasChanged) {
            updateChart(component);
          }
        });
      });
    },
    { deep: true }
  );
}
