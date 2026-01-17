/**
 * useComponentCreation.ts
 *
 * 组件创建相关的 composable
 *
 * 功能包括：
 * - 创建各种类型的组件实例
 * - 为每种组件类型设置默认配置
 *
 * @module composables/useComponentCreation
 * @author Report Designer Team
 * @since 2025-01-15
 */

import { useDesignerStore } from '../stores/pinia';
import { storeToRefs } from 'pinia';
import type { Component, ComponentType } from '../types';

/**
 * 组件创建的 composable
 */
export function useComponentCreation() {
  const designerStore = useDesignerStore();
  const { currentDesign } = storeToRefs(designerStore);

  // 组件类型标签映射
  const typeLabels: Record<string, string> = {
    form: '表单',
    table: '表格',
    'bar-chart': '柱状图',
    'line-chart': '折线图',
    'pie-chart': '饼图',
    'scatter-chart': '散点图',
    'gauge-chart': '仪表盘',
    'funnel-chart': '漏斗图',
    text: '文本',
    image: '图片',
    rectangle: '矩形',
    line: '线条',
  };

  /**
   * 创建指定类型的组件
   * @param type - 组件类型
   * @returns 组件实例或 null
   */
  function createComponent(type: ComponentType): Component | null {
    const id = `${type}-${Date.now()}`;
    const order = currentDesign.value.components.length;

    // 生成默认组件名称（联动配置中显示的名称）
    const typeLabel = typeLabels[type] || type;
    const defaultName = `${typeLabel} (${id.slice(-4)})`;

    const baseConfig = {
      id,
      name: defaultName,
      widthPercent: '100' as const,
      height: 200,
      order,
      visible: true,
      locked: false,
    };

    switch (type) {
      case 'text':
        return {
          ...baseConfig,
          type: 'text',
          content: '双击编辑文本',
          fontSize: 14,
          fontFamily: 'Arial',
          color: '#000000',
          fontWeight: 400,
          fontStyle: 'normal',
          textAlign: 'left',
          lineHeight: 1.5,
        };
      case 'image':
        return {
          ...baseConfig,
          type: 'image',
          height: 200,
          src: '',
          fit: 'contain',
          opacity: 1,
          borderRadius: 0,
        };
      case 'table': {
        const defaultColumns = [
          { id: 'col1', field: 'field1', label: '列1', width: 100, align: 'left', fixed: '' },
          { id: 'col2', field: 'field2', label: '列2', width: 100, align: 'left', fixed: '' },
          { id: 'col3', field: 'field3', label: '列3', width: 100, align: 'left', fixed: '' },
        ];
        const defaultStaticData = Array.from({ length: 3 }, (_, i) => {
          const row: Record<string, any> = {};
          defaultColumns.forEach((col) => {
            row[col.field] = `数据${i + 1}`;
          });
          return row;
        });

        return {
          ...baseConfig,
          type: 'table',
          height: 300,
          columns: defaultColumns,
          dataSource: {
            id: `ds-${id}`,
            name: '静态数据源',
            type: 'static',
            staticData: defaultStaticData,
          },
          showHeader: true,
          stripe: true,
          border: true,
          headerBackgroundColor: '#f5f7fa',
          headerColor: '#606266',
          fontSize: 14,
          pagination: true,
          pageSize: 10,
          currentPage: 1,
        };
      }
      case 'chart':
        return {
          ...baseConfig,
          type: 'chart',
          height: 300,
          chartType: 'bar',
          dataSource: null,
          title: '图表标题',
          showLegend: true,
          showDataZoom: false,
          theme: 'default',
        };
      case 'bar-chart':
        return {
          ...baseConfig,
          type: 'bar-chart',
          height: 400,
          config: {
            title: '柱状图',
            titleFontSize: 18,
            titleColor: '#303133',
            showLegend: true,
            legendPosition: 'top',
            theme: 'default',
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 1000,
          },
          xAxis: {
            show: true,
            name: '类别',
            nameFontSize: 14,
            nameColor: '#606266',
            axisLabelFontSize: 12,
            axisLabelColor: '#606266',
            axisLineColor: '#dcdfe6',
            axisLineWidth: 1,
          },
          yAxis: {
            show: true,
            name: '数值',
            nameFontSize: 14,
            nameColor: '#606266',
            axisLabelFontSize: 12,
            axisLabelColor: '#606266',
            axisLineColor: '#dcdfe6',
            axisLineWidth: 1,
          },
          series: {
            labelShow: false,
            labelPosition: 'top',
            labelFontSize: 12,
            labelColor: '#606266',
            itemStyleBorderWidth: 0,
            itemStyleBorderColor: '#000',
            itemStyleBorderRadius: 0,
            areaStyleOpacity: 0,
          },
          barWidth: 30,
          barGap: '30%',
          showBackground: false,
          backgroundColor: '#f5f7fa',
          dataSource: {
            id: `ds-${Date.now()}`,
            name: '柱状图数据源',
            type: 'static',
            staticData: {
              categories: ['一月', '二月', '三月', '四月', '五月'],
              series: [{ name: '销售额', data: [120, 200, 150, 80, 70] }],
            },
          },
        };
      case 'line-chart':
        return {
          ...baseConfig,
          type: 'line-chart',
          height: 400,
          config: {
            title: '折线图',
            titleFontSize: 18,
            titleColor: '#303133',
            showLegend: true,
            legendPosition: 'top',
            theme: 'default',
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 1000,
          },
          xAxis: {
            show: true,
            name: '类别',
            nameFontSize: 14,
            nameColor: '#606266',
            axisLabelFontSize: 12,
            axisLabelColor: '#606266',
            axisLineColor: '#dcdfe6',
            axisLineWidth: 1,
          },
          yAxis: {
            show: true,
            name: '数值',
            nameFontSize: 14,
            nameColor: '#606266',
            axisLabelFontSize: 12,
            axisLabelColor: '#606266',
            axisLineColor: '#dcdfe6',
            axisLineWidth: 1,
          },
          series: {
            labelShow: false,
            labelPosition: 'top',
            labelFontSize: 12,
            labelColor: '#606266',
            itemStyleBorderWidth: 0,
            itemStyleBorderColor: '#000',
            itemStyleBorderRadius: 0,
            areaStyleOpacity: 0.3,
          },
          smooth: false,
          step: false,
          showSymbol: true,
          symbolSize: 6,
          lineStyleWidth: 2,
          lineStyleType: 'solid',
          areaStyle: false,
          dataSource: {
            id: `ds-${Date.now()}`,
            name: '折线图数据源',
            type: 'static',
            staticData: {
              categories: ['一月', '二月', '三月', '四月', '五月', '六月'],
              series: [{ name: '销售额', data: [120, 200, 150, 80, 70, 110] }],
            },
          },
        };
      case 'pie-chart':
        return {
          ...baseConfig,
          type: 'pie-chart',
          height: 400,
          config: {
            title: '饼图',
            titleFontSize: 18,
            titleColor: '#303133',
            showLegend: true,
            legendPosition: 'right',
            theme: 'default',
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 1000,
          },
          series: {
            labelShow: true,
            labelPosition: 'outside',
            labelFontSize: 12,
            labelColor: '#606266',
            itemStyleBorderWidth: 1,
            itemStyleBorderColor: '#fff',
            itemStyleBorderRadius: 4,
            areaStyleOpacity: 0,
          },
          roseType: false,
          radius: ['0%', '70%'],
          center: ['50%', '50%'],
          emphasisScale: true,
          minAngle: 0,
          dataSource: {
            id: `ds-${Date.now()}`,
            name: '饼图数据源',
            type: 'static',
            staticData: {
              data: [
                { name: '直接访问', value: 335 },
                { name: '邮件营销', value: 310 },
                { name: '联盟广告', value: 234 },
                { name: '视频广告', value: 135 },
                { name: '搜索引擎', value: 1548 },
              ],
            },
          },
        };
      case 'scatter-chart':
        return {
          ...baseConfig,
          type: 'scatter-chart',
          height: 400,
          config: {
            title: '散点图',
            titleFontSize: 18,
            titleColor: '#303133',
            showLegend: true,
            legendPosition: 'top',
            theme: 'default',
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 1000,
          },
          xAxis: {
            show: true,
            name: 'X轴',
            nameFontSize: 14,
            nameColor: '#606266',
            axisLabelFontSize: 12,
            axisLabelColor: '#606266',
            axisLineColor: '#dcdfe6',
            axisLineWidth: 1,
          },
          yAxis: {
            show: true,
            name: 'Y轴',
            nameFontSize: 14,
            nameColor: '#606266',
            axisLabelFontSize: 12,
            axisLabelColor: '#606266',
            axisLineColor: '#dcdfe6',
            axisLineWidth: 1,
          },
          series: {
            labelShow: false,
            labelPosition: 'top',
            labelFontSize: 12,
            labelColor: '#606266',
            itemStyleBorderWidth: 0,
            itemStyleBorderColor: '#000',
            itemStyleBorderRadius: 0,
            areaStyleOpacity: 0,
          },
          symbolSize: 10,
          symbol: 'circle',
          showEffect: false,
          effectType: 'ripple',
          dataSource: {
            id: `ds-${Date.now()}`,
            name: '散点图数据源',
            type: 'static',
            staticData: {
              data: [
                [10, 20],
                [30, 40],
                [50, 35],
                [70, 50],
                [90, 65],
                [25, 30],
                [45, 55],
                [65, 45],
                [85, 70],
                [15, 25],
                [35, 50],
                [55, 40],
                [75, 60],
                [95, 75],
                [20, 35],
              ],
            },
          },
        };
      case 'gauge-chart':
        return {
          ...baseConfig,
          type: 'gauge-chart',
          height: 400,
          config: {
            title: '仪表盘',
            titleFontSize: 18,
            titleColor: '#303133',
            showLegend: false,
            legendPosition: 'top',
            theme: 'default',
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 1000,
          },
          min: 0,
          max: 100,
          startAngle: 225,
          endAngle: -45,
          radius: '75%',
          axisLine: {
            show: true,
            lineStyleWidth: 30,
          },
          splitNumber: 10,
          detail: {
            show: true,
            fontSize: 20,
            color: '#606266',
            formatter: '{value}',
          },
          pointer: {
            show: true,
            length: '70%',
            width: 6,
          },
          dataSource: {
            id: `ds-${Date.now()}`,
            name: '仪表盘数据源',
            type: 'static',
            staticData: {
              value: 75,
            },
          },
        };
      case 'funnel-chart':
        return {
          ...baseConfig,
          type: 'funnel-chart',
          height: 400,
          config: {
            title: '漏斗图',
            titleFontSize: 18,
            titleColor: '#303133',
            showLegend: true,
            legendPosition: 'right',
            theme: 'default',
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 1000,
          },
          series: {
            labelShow: true,
            labelPosition: 'outside',
            labelFontSize: 12,
            labelColor: '#606266',
            itemStyleBorderWidth: 0,
            itemStyleBorderColor: '#fff',
            itemStyleBorderRadius: 0,
            areaStyleOpacity: 0,
          },
          sort: 'descending',
          gap: 0,
          left: '10%',
          top: '10%',
          right: '10%',
          bottom: '10%',
          width: '80%',
          labelAlign: 'center',
          dataSource: {
            id: `ds-${Date.now()}`,
            name: '漏斗图数据源',
            type: 'static',
            staticData: {
              data: [
                { name: '展示', value: 100 },
                { name: '点击', value: 80 },
                { name: '访问', value: 60 },
                { name: '咨询', value: 40 },
                { name: '订单', value: 20 },
              ],
            },
          },
        };
      case 'rectangle':
        return {
          ...baseConfig,
          type: 'rectangle',
          height: 100,
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: 0,
        };
      case 'line':
        return {
          ...baseConfig,
          type: 'line',
          height: 2,
          stroke: '#000000',
          strokeWidth: 2,
          strokeStyle: 'solid',
        };
      case 'form':
        return {
          ...baseConfig,
          type: 'form',
          height: 400,
          items: [
            {
              id: `item-${id}-1`,
              type: 'text',
              field: 'name',
              label: '姓名',
              placeholder: '请输入姓名',
              required: true,
              widthPercent: '100',
            },
            {
              id: `item-${id}-2`,
              type: 'email',
              field: 'email',
              label: '邮箱',
              placeholder: '请输入邮箱',
              required: true,
              widthPercent: '100',
            },
            {
              id: `item-${id}-3`,
              type: 'select',
              field: 'gender',
              label: '性别',
              placeholder: '请选择',
              defaultValue: '',
              required: true,
              widthPercent: '100',
              options: [
                { label: '男', value: 'male' },
                { label: '女', value: 'female' },
              ],
            },
          ],
          labelPosition: 'right',
          labelWidth: 80,
          columns: 1,
          size: 'default',
          showBorder: false,
        };
      default:
        return null;
    }
  }

  return {
    createComponent,
  };
}
