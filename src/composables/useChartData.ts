/**
 * useChartData.ts
 *
 * 图表数据编辑相关的 composable
 *
 * 功能包括：
 * - 图表数据编辑器管理
 * - 类别（categories）和系列（series）管理
 * - 静态数据和 API 数据源配置
 *
 * @module composables/useChartData
 * @author Report Designer Team
 * @since 2025-01-15
 */

import { ref, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { useDesignerStore } from '../stores/pinia';
import type { Component } from '../types';

interface ChartSeries {
  name: string;
  data: number[];
  dataString: string;
}

/**
 * 图表数据编辑操作的 composable
 *
 * @param selectedComponent - 选中的组件
 * @param updateChart - 更新图表显示的函数
 */
export function useChartData(
  selectedComponent: any,
  updateChart: (component: Component) => void
) {
  const designerStore = useDesignerStore();
  const { currentDesign } = designerStore;

  // 图表数据编辑状态
  const chartDataEditorVisible = ref(false);
  const chartDataSourceType = ref('static');
  const chartDataApiUrl = ref('');
  const chartDataApiMethod = ref('GET');
  // 图表数据：categories 和 series
  const chartCategories = ref<string[]>([]);
  const chartSeries = ref<ChartSeries[]>([]);

  /**
   * 打开图表数据编辑器
   */
  function openChartDataEditor() {
    if (!selectedComponent.value || !selectedComponent.value.dataSource) return;

    const dataSource = selectedComponent.value.dataSource;
    chartDataSourceType.value = dataSource.type || 'static';

    if (dataSource.type === 'static' && dataSource.staticData) {
      chartCategories.value = [...(dataSource.staticData.categories || [])];
      chartSeries.value = (dataSource.staticData.series || []).map((s: any) => ({
        name: s.name,
        data: [...s.data],
        dataString: s.data.join(', '),
      }));
    } else if (dataSource.type === 'api') {
      chartDataApiUrl.value = dataSource.apiUrl || '';
      chartDataApiMethod.value = dataSource.apiMethod || 'GET';
    }

    chartDataEditorVisible.value = true;
  }

  /**
   * 添加图表类别
   */
  function addChartCategory() {
    const categoryName = prompt('请输入类别名称：');
    if (categoryName && categoryName.trim()) {
      chartCategories.value.push(categoryName.trim());
    }
  }

  /**
   * 移除图表类别
   */
  function removeChartCategory(index: number) {
    chartCategories.value.splice(index, 1);
  }

  /**
   * 添加图表系列
   */
  function addChartSeries() {
    chartSeries.value.push({
      name: `系列 ${chartSeries.value.length + 1}`,
      data: chartCategories.value.map(() => 0),
      dataString: chartCategories.value.map(() => '0').join(', '),
    });
  }

  /**
   * 移除图表系列
   */
  function removeChartSeries(index: number) {
    chartSeries.value.splice(index, 1);
  }

  /**
   * 解析系列数据
   */
  function parseSeriesData(series: ChartSeries) {
    const values = series.dataString.split(',').map((v: string) => {
      const num = parseFloat(v.trim());
      return isNaN(num) ? 0 : num;
    });
    series.data = values;
  }

  /**
   * 保存图表数据
   */
  function handleChartDataSave() {
    if (!selectedComponent.value) return;

    if (chartDataSourceType.value === 'static') {
      // 验证数据
      if (chartCategories.value.length === 0) {
        ElMessage.warning('请至少添加一个类别');
        return;
      }
      if (chartSeries.value.length === 0) {
        ElMessage.warning('请至少添加一个系列');
        return;
      }

      // 检查数据数量是否一致
      const valid = chartSeries.value.every((s) => s.data.length === chartCategories.value.length);
      if (!valid) {
        ElMessage.warning('所有系列的数据数量必须与类别数量一致');
        return;
      }

      // 构建 staticData
      const staticData = {
        categories: [...chartCategories.value],
        series: chartSeries.value.map((s) => ({
          name: s.name,
          data: [...s.data],
        })),
      };

      // 更新组件的 dataSource
      designerStore.updateComponent(selectedComponent.value.id, {
        dataSource: {
          ...selectedComponent.value.dataSource!,
          type: 'static',
          staticData,
        },
      });
    } else if (chartDataSourceType.value === 'api') {
      // 更新 API 配置
      designerStore.updateComponent(selectedComponent.value.id, {
        dataSource: {
          ...selectedComponent.value.dataSource!,
          type: 'api',
          apiUrl: chartDataApiUrl.value,
          apiMethod: chartDataApiMethod.value as 'GET' | 'POST',
        },
      });
    }

    // 更新图表显示
    nextTick(() => {
      const updatedComponent = currentDesign.value.components.find(
        (c) => c.id === selectedComponent.value!.id
      );
      if (updatedComponent) {
        updateChart(updatedComponent);
      }
    });

    chartDataEditorVisible.value = false;
    ElMessage.success('数据已保存');
  }

  /**
   * 取消编辑图表数据
   */
  function handleChartDataCancel() {
    chartDataEditorVisible.value = false;
    chartCategories.value = [];
    chartSeries.value = [];
  }

  /**
   * 监听组件选中变化，同步数据源配置
   */
  function watchComponentChange() {
    watch(
      () => selectedComponent.value?.id,
      () => {
        if (!selectedComponent.value) return;

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
          }
        }
      },
      { deep: true }
    );
  }

  return {
    // 状态
    chartDataEditorVisible,
    chartDataSourceType,
    chartDataApiUrl,
    chartDataApiMethod,
    chartCategories,
    chartSeries,
    // 方法
    openChartDataEditor,
    addChartCategory,
    removeChartCategory,
    addChartSeries,
    removeChartSeries,
    parseSeriesData,
    handleChartDataSave,
    handleChartDataCancel,
    watchComponentChange,
  };
}
