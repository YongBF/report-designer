/**
 * componentData.ts
 *
 * 组件库数据定义
 *
 * 定义了组件库面板中可用的所有组件类型及其图标
 *
 * @module utils/componentData
 * @author Report Designer Team
 * @since 2025-01-15
 */

import type { ComponentType } from '../types';
import {
  Document,
  Picture,
  Grid,
  DocumentAdd,
  TrendCharts,
  DataLine,
  PieChart,
  DataAnalysis,
  Odometer,
  Histogram,
  Coin,
} from '@element-plus/icons-vue';

/**
 * 组件项接口
 */
export interface ComponentItem {
  type: ComponentType;
  label: string;
  icon: any;
}

/**
 * 基础组件列表
 */
export const basicComponents: ComponentItem[] = [
  { type: 'text', label: '文本', icon: Document },
  { type: 'image', label: '图片', icon: Picture },
  { type: 'table', label: '表格', icon: Grid },
  { type: 'form', label: '表单', icon: DocumentAdd },
];

/**
 * 图表组件列表
 */
export const chartComponents: ComponentItem[] = [
  { type: 'bar-chart', label: '柱状图', icon: TrendCharts },
  { type: 'line-chart', label: '折线图', icon: DataLine },
  { type: 'pie-chart', label: '饼图', icon: PieChart },
  { type: 'scatter-chart', label: '散点图', icon: DataAnalysis },
  { type: 'gauge-chart', label: '仪表盘', icon: Odometer },
];

/**
 * 形状组件列表
 */
export const shapeComponents: ComponentItem[] = [
  { type: 'rectangle', label: '矩形', icon: Histogram },
  { type: 'line', label: '线条', icon: Coin },
];
