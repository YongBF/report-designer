/**
 * 图表相关常量
 */

/**
 * 图表类型
 */
export const CHART_TYPES = {
  BAR: 'bar-chart',
  LINE: 'line-chart',
  PIE: 'pie-chart',
  SCATTER: 'scatter-chart',
  GAUGE: 'gauge-chart',
  FUNNEL: 'funnel-chart',
} as const;

/**
 * 图表主题
 */
export const CHART_THEMES = {
  DEFAULT: 'default',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

/**
 * 默认图表配置
 */
export const DEFAULT_CHART_CONFIG = {
  width: 600,
  height: 400,
  animation: true,
  animationDuration: 1000,
} as const;

/**
 * 图表颜色序列
 */
export const CHART_COLORS = [
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399',
  '#C71585',
  '#00CED1',
  '#9370DB',
] as const;
