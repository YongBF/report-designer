/**
 * useChartGenerator.ts
 *
 * 图表生成相关的 composable
 *
 * 功能包括：
 * - 各种图表类型的配置生成（柱状图、折线图、饼图、散点图、仪表盘、漏斗图）
 * - 图表初始化和更新
 * - 图表实例管理
 *
 * @module composables/useChartGenerator
 * @author Report Designer Team
 * @since 2025-01-15
 */

import { nextTick } from 'vue';
import * as echarts from 'echarts';
import type { Component } from '../types';

/**
 * 图表生成操作的 composable
 *
 * @param orderedComponents - 排序后的组件列表
 * @param chartRefsMap - 图表 DOM 元素引用映射
 * @param chartInstancesMap - 图表实例映射
 */
export function useChartGenerator(
  orderedComponents: any,
  chartRefsMap: any,
  chartInstancesMap: any
) {
  /**
   * 生成柱状图配置
   *
   * @param component - 图表组件
   * @returns ECharts 配置对象
   */
  function generateBarChartOption(component: any) {
    const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

    // 从 dataSource 获取数据，如果没有则使用默认数据
    let categories = ['类别A', '类别B', '类别C', '类别D', '类别E'];
    let seriesData = [{ name: '数据', data: [120, 200, 150, 80, 70] }];

    if (component.dataSource?.staticData) {
      categories = component.dataSource.staticData.categories || categories;
      seriesData = component.dataSource.staticData.series || seriesData;
    }

    return {
      title: {
        text: component.config.title,
        left: 'center',
        textStyle: {
          fontSize: component.config.titleFontSize,
          color: component.config.titleColor,
        },
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        show: component.config.showLegend,
        top: component.config.legendPosition === 'top' ? 0 : 'auto',
        bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
        left: component.config.legendPosition === 'left' ? 0 : 'auto',
        right: component.config.legendPosition === 'right' ? 0 : 'auto',
      },
      xAxis: {
        show: component.xAxis.show,
        name: component.xAxis.name,
        nameTextStyle: {
          fontSize: component.xAxis.nameFontSize,
          color: component.xAxis.nameColor,
        },
        axisLabel: {
          fontSize: component.xAxis.axisLabelFontSize,
          color: component.xAxis.axisLabelColor,
        },
        axisLine: {
          show: component.xAxis.show,
          lineStyle: {
            color: component.xAxis.axisLineColor,
            width: component.xAxis.axisLineWidth,
          },
        },
        type: 'category',
        data: categories,
      },
      yAxis: {
        show: component.yAxis.show,
        name: component.yAxis.name,
        nameTextStyle: {
          fontSize: component.yAxis.nameFontSize,
          color: component.yAxis.nameColor,
        },
        axisLabel: {
          fontSize: component.yAxis.axisLabelFontSize,
          color: component.yAxis.axisLabelColor,
        },
        axisLine: {
          show: component.yAxis.show,
          lineStyle: {
            color: component.yAxis.axisLineColor,
            width: component.yAxis.axisLineWidth,
          },
        },
        type: 'value',
      },
      series: seriesData.map((s: any, index: number) => ({
        type: 'bar',
        name: s.name,
        data: s.data,
        barWidth: component.barWidth,
        label: {
          show: component.series.labelShow,
          position: component.series.labelPosition,
          fontSize: component.series.labelFontSize,
          color: component.series.labelColor,
        },
        itemStyle: {
          borderWidth: component.series.itemStyleBorderWidth,
          borderColor: component.series.itemStyleBorderColor,
          borderRadius: component.series.itemStyleBorderRadius,
        },
        showBackground: component.showBackground,
        backgroundStyle: {
          color: component.backgroundColor,
        },
      })),
      animation: component.config.animation,
      animationDuration: component.config.animationDuration,
    };
  }

  /**
   * 生成折线图配置
   *
   * @param component - 图表组件
   * @returns ECharts 配置对象
   */
  function generateLineChartOption(component: any) {
    return {
      title: {
        text: component.config.title,
        left: 'center',
        textStyle: {
          fontSize: component.config.titleFontSize,
          color: component.config.titleColor,
        },
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        show: component.config.showLegend,
        top: component.config.legendPosition === 'top' ? 0 : 'auto',
        bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
        left: component.config.legendPosition === 'left' ? 0 : 'auto',
        right: component.config.legendPosition === 'right' ? 0 : 'auto',
      },
      xAxis: {
        show: component.xAxis.show,
        name: component.xAxis.name,
        nameTextStyle: {
          fontSize: component.xAxis.nameFontSize,
          color: component.xAxis.nameColor,
        },
        axisLabel: {
          fontSize: component.xAxis.axisLabelFontSize,
          color: component.xAxis.axisLabelColor,
        },
        axisLine: {
          show: component.xAxis.show,
          lineStyle: {
            color: component.xAxis.axisLineColor,
            width: component.xAxis.axisLineWidth,
          },
        },
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      },
      yAxis: {
        show: component.yAxis.show,
        name: component.yAxis.name,
        nameTextStyle: {
          fontSize: component.yAxis.nameFontSize,
          color: component.yAxis.nameColor,
        },
        axisLabel: {
          fontSize: component.yAxis.axisLabelFontSize,
          color: component.yAxis.axisLabelColor,
        },
        axisLine: {
          show: component.yAxis.show,
          lineStyle: {
            color: component.yAxis.axisLineColor,
            width: component.yAxis.axisLineWidth,
          },
        },
        type: 'value',
      },
      series: [
        {
          type: 'line',
          data: [120, 132, 101, 134, 90, 230],
          smooth: component.smooth,
          step: component.step,
          showSymbol: component.showSymbol,
          symbolSize: component.symbolSize,
          label: {
            show: component.series.labelShow,
            position: component.series.labelPosition,
            fontSize: component.series.labelFontSize,
            color: component.series.labelColor,
          },
          lineStyle: {
            width: component.lineStyleWidth,
            type: component.lineStyleType,
          },
          areaStyle: component.areaStyle
            ? {
                opacity: component.series.areaStyleOpacity,
              }
            : undefined,
        },
      ],
      animation: component.config.animation,
      animationDuration: component.config.animationDuration,
    };
  }

  /**
   * 生成饼图配置
   *
   * @param component - 图表组件
   * @returns ECharts 配置对象
   */
  function generatePieChartOption(component: any) {
    return {
      title: {
        text: component.config.title,
        left: 'center',
        textStyle: {
          fontSize: component.config.titleFontSize,
          color: component.config.titleColor,
        },
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        show: component.config.showLegend,
        top: component.config.legendPosition === 'top' ? 0 : 'auto',
        bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
        left: component.config.legendPosition === 'left' ? 0 : 'auto',
        right: component.config.legendPosition === 'right' ? 0 : 'auto',
      },
      series: [
        {
          type: 'pie',
          data: [
            { value: 335, name: '类别A' },
            { value: 310, name: '类别B' },
            { value: 234, name: '类别C' },
            { value: 135, name: '类别D' },
            { value: 148, name: '类别E' },
          ],
          radius: component.radius,
          center: component.center,
          roseType: component.roseType,
          label: {
            show: component.series.labelShow,
            position: component.series.labelPosition,
            fontSize: component.series.labelFontSize,
            color: component.series.labelColor,
          },
          itemStyle: {
            borderWidth: component.series.itemStyleBorderWidth,
            borderColor: component.series.itemStyleBorderColor,
            borderRadius: component.series.itemStyleBorderRadius,
          },
          emphasis: {
            scale: component.emphasisScale,
          },
          minAngle: component.minAngle,
        },
      ],
      animation: component.config.animation,
      animationDuration: component.config.animationDuration,
    };
  }

  /**
   * 生成散点图配置
   *
   * @param component - 图表组件
   * @returns ECharts 配置对象
   */
  function generateScatterChartOption(component: any) {
    return {
      title: {
        text: component.config.title,
        left: 'center',
        textStyle: {
          fontSize: component.config.titleFontSize,
          color: component.config.titleColor,
        },
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        show: component.config.showLegend,
        top: component.config.legendPosition === 'top' ? 0 : 'auto',
        bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
        left: component.config.legendPosition === 'left' ? 0 : 'auto',
        right: component.config.legendPosition === 'right' ? 0 : 'auto',
      },
      xAxis: {
        show: component.xAxis.show,
        name: component.xAxis.name,
        nameTextStyle: {
          fontSize: component.xAxis.nameFontSize,
          color: component.xAxis.nameColor,
        },
        axisLabel: {
          fontSize: component.xAxis.axisLabelFontSize,
          color: component.xAxis.axisLabelColor,
        },
        axisLine: {
          show: component.xAxis.show,
          lineStyle: {
            color: component.xAxis.axisLineColor,
            width: component.xAxis.axisLineWidth,
          },
        },
        scale: true,
      },
      yAxis: {
        show: component.yAxis.show,
        name: component.yAxis.name,
        nameTextStyle: {
          fontSize: component.yAxis.nameFontSize,
          color: component.yAxis.nameColor,
        },
        axisLabel: {
          fontSize: component.yAxis.axisLabelFontSize,
          color: component.yAxis.axisLabelColor,
        },
        axisLine: {
          show: component.yAxis.show,
          lineStyle: {
            color: component.yAxis.axisLineColor,
            width: component.yAxis.axisLineWidth,
          },
        },
        scale: true,
      },
      series: [
        {
          type: 'scatter',
          data: [
            [10, 20],
            [30, 40],
            [50, 60],
            [70, 80],
            [90, 100],
          ],
          symbolSize: component.symbolSize,
          symbol: component.symbol,
          label: {
            show: component.series.labelShow,
            position: component.series.labelPosition,
            fontSize: component.series.labelFontSize,
            color: component.series.labelColor,
          },
          itemStyle: {
            borderWidth: component.series.itemStyleBorderWidth,
            borderColor: component.series.itemStyleBorderColor,
            borderRadius: component.series.itemStyleBorderRadius,
          },
          rippleEffect: component.showEffect
            ? {
                brushType: component.effectType,
              }
            : undefined,
        },
      ],
      animation: component.config.animation,
      animationDuration: component.config.animationDuration,
    };
  }

  /**
   * 生成仪表盘配置
   *
   * @param component - 图表组件
   * @returns ECharts 配置对象
   */
  function generateGaugeChartOption(component: any) {
    return {
      title: {
        text: component.config.title,
        left: 'center',
        textStyle: {
          fontSize: component.config.titleFontSize,
          color: component.config.titleColor,
        },
      },
      series: [
        {
          type: 'gauge',
          min: component.min,
          max: component.max,
          startAngle: component.startAngle,
          endAngle: component.endAngle,
          radius: component.radius,
          axisLine: {
            show: component.axisLine.show,
            lineStyle: {
              width: component.axisLine.lineStyleWidth,
              color: [
                [0.3, '#67e0e3'],
                [0.7, '#37a2da'],
                [1, '#fd666d'],
              ],
            },
          },
          splitNumber: component.splitNumber,
          detail: {
            show: component.detail.show,
            fontSize: component.detail.fontSize,
            color: component.detail.color,
            formatter: component.detail.formatter,
          },
          pointer: {
            show: component.pointer.show,
            length: component.pointer.length,
            width: component.pointer.width,
          },
          data: [{ value: 70 }],
        },
      ],
      animation: component.config.animation,
      animationDuration: component.config.animationDuration,
    };
  }

  /**
   * 生成漏斗图配置
   *
   * @param component - 图表组件
   * @returns ECharts 配置对象
   */
  function generateFunnelChartOption(component: any) {
    return {
      title: {
        text: component.config.title,
        left: 'center',
        textStyle: {
          fontSize: component.config.titleFontSize,
          color: component.config.titleColor,
        },
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        show: component.config.showLegend,
        top: component.config.legendPosition === 'top' ? 0 : 'auto',
        bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
        left: component.config.legendPosition === 'left' ? 0 : 'auto',
        right: component.config.legendPosition === 'right' ? 0 : 'auto',
      },
      series: [
        {
          type: 'funnel',
          data: [
            { value: 100, name: '步骤A' },
            { value: 80, name: '步骤B' },
            { value: 60, name: '步骤C' },
            { value: 40, name: '步骤D' },
            { value: 20, name: '步骤E' },
          ],
          sort: component.sort,
          gap: component.gap,
          left: component.left,
          top: component.top,
          right: component.right,
          bottom: component.bottom,
          width: component.width,
          height: component.height,
          label: {
            show: component.series.labelShow,
            position: component.series.labelPosition,
            fontSize: component.series.labelFontSize,
            color: component.series.labelColor,
            align: component.labelAlign,
          },
          itemStyle: {
            borderWidth: component.series.itemStyleBorderWidth,
            borderColor: component.series.itemStyleBorderColor,
            borderRadius: component.series.itemStyleBorderRadius,
          },
        },
      ],
      animation: component.config.animation,
      animationDuration: component.config.animationDuration,
    };
  }

  /**
   * 更新单个图表
   *
   * @param component - 要更新的图表组件
   */
  function updateChart(component: any) {
    const chart = chartInstancesMap.value.get(component.id);
    if (!chart) return;

    let option: any = {};

    // 根据图表类型生成配置
    if (component.type === 'chart') {
      option = {
        title: {
          text: component.title,
          left: 'center',
        },
        tooltip: {},
        xAxis: {
          type: 'category',
          data: ['A', 'B', 'C', 'D', 'E'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: component.chartType,
            data: [10, 20, 30, 40, 50],
          },
        ],
      };
    } else if (component.type === 'bar-chart') {
      option = generateBarChartOption(component);
    } else if (component.type === 'line-chart') {
      option = generateLineChartOption(component);
    } else if (component.type === 'pie-chart') {
      option = generatePieChartOption(component);
    } else if (component.type === 'scatter-chart') {
      option = generateScatterChartOption(component);
    } else if (component.type === 'gauge-chart') {
      option = generateGaugeChartOption(component);
    } else if (component.type === 'funnel-chart') {
      option = generateFunnelChartOption(component);
    }

    chart.setOption(option, true);
  }

  /**
   * 初始化所有图表
   * 遍历所有图表组件，创建 ECharts 实例并设置初始配置
   */
  function initCharts() {
    nextTick(() => {
      const chartTypes = [
        'chart',
        'bar-chart',
        'line-chart',
        'pie-chart',
        'scatter-chart',
        'gauge-chart',
        'funnel-chart',
      ];
      chartTypes.forEach((chartType) => {
        const components = orderedComponents.value.filter((c) => c.type === chartType);
        components.forEach((component) => {
          const el = chartRefsMap.value.get(component.id);
          if (!el) return;

          // 检查是否已有实例，如果有则先销毁
          if (chartInstancesMap.value.has(component.id)) {
            const existingChart = chartInstancesMap.value.get(component.id);
            existingChart.dispose();
          }

          const chart = echarts.init(el);
          chartInstancesMap.value.set(component.id, chart);

          let option: any = {};

          // 根据图表类型生成配置
          if (chartType === 'chart') {
            // 旧版通用图表（向后兼容）
            option = {
              title: {
                text: component.title,
                left: 'center',
              },
              tooltip: {},
              xAxis: {
                type: 'category',
                data: ['A', 'B', 'C', 'D', 'E'],
              },
              yAxis: {
                type: 'value',
              },
              series: [
                {
                  type: component.chartType,
                  data: [10, 20, 30, 40, 50],
                },
              ],
            };
          } else if (chartType === 'bar-chart') {
            option = generateBarChartOption(component as any);
          } else if (chartType === 'line-chart') {
            option = generateLineChartOption(component as any);
          } else if (chartType === 'pie-chart') {
            option = generatePieChartOption(component as any);
          } else if (chartType === 'scatter-chart') {
            option = generateScatterChartOption(component as any);
          } else if (chartType === 'gauge-chart') {
            option = generateGaugeChartOption(component as any);
          } else if (chartType === 'funnel-chart') {
            option = generateFunnelChartOption(component as any);
          }

          chart.setOption(option);
        });
      });
    });
  }

  return {
    // 方法
    generateBarChartOption,
    generateLineChartOption,
    generatePieChartOption,
    generateScatterChartOption,
    generateGaugeChartOption,
    generateFunnelChartOption,
    updateChart,
    initCharts,
  };
}
