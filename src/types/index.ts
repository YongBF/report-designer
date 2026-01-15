// 组件类型定义
export type ComponentType = 'text' | 'image' | 'table' | 'chart' | 'bar-chart' | 'line-chart' | 'pie-chart' | 'scatter-chart' | 'gauge-chart' | 'funnel-chart' | 'rectangle' | 'line' | 'form'

// 表单项类型
export type FormItemType =
  | 'text'           // 文本输入
  | 'number'         // 数字输入
  | 'password'       // 密码输入
  | 'email'          // 邮箱
  | 'date'           // 日期选择
  | 'datetime'       // 日期时间
  | 'time'           // 时间选择
  | 'select'         // 下拉选择
  | 'radio'          // 单选框组
  | 'checkbox'       // 复选框
  | 'switch'         // 开关
  | 'textarea'       // 文本域
  | 'slider'         // 滑块
  | 'rate'           // 评分
  | 'color'          // 颜色选择

// 选项来源类型
export type OptionsSourceType = 'static' | 'api'

// 表单项选项（用于 select、radio、checkbox）
export interface FormItemOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

// 选项 API 配置
export interface OptionsApiConfig {
  url: string                    // API 地址
  method: 'GET' | 'POST'         // 请求方法
  labelField: string             // 标签字段名
  valueField: string             // 值字段名
  headers?: Record<string, string>  // 请求头
  params?: Record<string, any>   // 请求参数
}

// 图表系列数据
export interface ChartSeriesData {
  name: string                   // 系列名称
  data: number[]                 // 数据值数组
}

// 表单项验证规则
export interface FormItemRule {
  required?: boolean
  message?: string
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  validator?: string
}

// 表单项
export interface FormItem {
  id: string
  type: FormItemType
  field: string
  label: string
  placeholder?: string
  defaultValue?: any
  helpText?: string
  required?: boolean
  disabled?: boolean
  rules?: FormItemRule[]
  options?: FormItemOption[]
  optionsSourceType?: OptionsSourceType  // 选项来源类型
  optionsApiConfig?: OptionsApiConfig    // 选项 API 配置
  widthPercent?: '100' | '50' | '33'
  span?: number           // 跨列数
}

// 表单组件
export interface FormComponent extends BaseComponent {
  type: 'form'
  items: FormItem[]
  labelPosition: 'left' | 'right' | 'top'
  labelWidth: number
  columns: 1 | 2 | 3
  size: 'large' | 'default' | 'small'
  showBorder: boolean
}

// 图表类型
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'gauge' | 'funnel'

// 通用图表配置
export interface BaseChartConfig {
  title: string
  titleFontSize: number
  titleColor: string
  showLegend: boolean
  legendPosition: 'top' | 'bottom' | 'left' | 'right'
  theme: 'default' | 'light' | 'dark'
  backgroundColor: string
  animation: boolean
  animationDuration: number
}

// 轴配置（用于柱状图、折线图）
export interface AxisConfig {
  show: boolean
  name: string
  nameFontSize: number
  nameColor: string
  axisLabelFontSize: number
  axisLabelColor: string
  axisLineColor: string
  axisLineWidth: number
}

// 系列配置
export interface SeriesConfig {
  labelShow: boolean
  labelPosition: string // 使用 string 类型以支持所有图表的不同选项
  labelFontSize: number
  labelColor: string
  itemStyleBorderWidth: number
  itemStyleBorderColor: string
  itemStyleBorderRadius: number
  areaStyleOpacity: number // 仅用于折线图
}

// 柱状图组件
export interface BarChartComponent extends BaseComponent {
  type: 'bar-chart'
  dataSource: DataSource | null
  // 基础配置
  config: BaseChartConfig
  // X轴配置
  xAxis: AxisConfig
  // Y轴配置
  yAxis: AxisConfig
  // 系列配置
  series: SeriesConfig
  // 柱状图特有
  barWidth: number
  barGap: string
  showBackground: boolean
  backgroundColor: string
}

// 折线图组件
export interface LineChartComponent extends BaseComponent {
  type: 'line-chart'
  dataSource: DataSource | null
  config: BaseChartConfig
  xAxis: AxisConfig
  yAxis: AxisConfig
  series: SeriesConfig
  // 折线图特有
  smooth: boolean
  step: boolean
  showSymbol: boolean
  symbolSize: number
  lineStyleWidth: number
  lineStyleType: 'solid' | 'dashed' | 'dotted'
  areaStyle: boolean
}

// 饼图组件
export interface PieChartComponent extends BaseComponent {
  type: 'pie-chart'
  dataSource: DataSource | null
  config: BaseChartConfig
  series: SeriesConfig
  // 饼图特有
  roseType: 'radius' | 'area' | false
  radius: [string, string] // ['内半径', '外半径'] 如 ['40%', '70%']
  center: [string, string] // ['x%', 'y%'] 如 ['50%', '50%']
  emphasisScale: boolean
  minAngle: number
}

// 散点图组件
export interface ScatterChartComponent extends BaseComponent {
  type: 'scatter-chart'
  dataSource: DataSource | null
  config: BaseChartConfig
  xAxis: AxisConfig
  yAxis: AxisConfig
  series: SeriesConfig
  // 散点图特有
  symbolSize: number
  symbol: 'circle' | 'rect' | 'triangle' | 'diamond' | 'pin' | 'arrow'
  showEffect: boolean
  effectType: 'ripple' | 'scale'
}

// 仪表盘组件
export interface GaugeChartComponent extends BaseComponent {
  type: 'gauge-chart'
  dataSource: DataSource | null
  config: BaseChartConfig
  // 仪表盘特有
  min: number
  max: number
  startAngle: number
  endAngle: number
  radius: string
  axisLine: {
    show: boolean
    lineStyleWidth: number
  }
  splitNumber: number
  detail: {
    show: boolean
    fontSize: number
    color: string
    formatter: string
  }
  pointer: {
    show: boolean
    length: string
    width: number
  }
}

// 漏斗图组件
export interface FunnelChartComponent extends BaseComponent {
  type: 'funnel-chart'
  dataSource: DataSource | null
  config: BaseChartConfig
  series: SeriesConfig
  // 漏斗图特有
  sort: 'ascending' | 'descending' | 'none'
  gap: number
  left: string
  top: string
  right: string
  bottom: string
  width: string
  height: string
  labelAlign: 'left' | 'right' | 'center'
}

// 保留原有的通用图表类型（向后兼容）
export interface ChartComponent extends BaseComponent {
  type: 'chart'
  chartType: ChartType
  dataSource: DataSource | null
  title: string
  showLegend: boolean
  showDataZoom: boolean
  theme: string
}

// 基础组件接口
export interface BaseComponent {
  id: string
  type: ComponentType
  widthPercent: ComponentWidth
  height: number
  order: number
  visible: boolean
  locked: boolean
}

// 文本组件
export interface TextComponent extends BaseComponent {
  type: 'text'
  content: string
  fontSize: number
  fontFamily: string
  color: string
  fontWeight: number
  fontStyle: string
  textAlign: string
  lineHeight: number
}

// 图片组件
export interface ImageComponent extends BaseComponent {
  type: 'image'
  src: string
  fit: 'fill' | 'contain' | 'cover' | 'none'
  opacity: number
  borderRadius: number
}

// 表格组件
export interface TableColumn {
  id: string
  field: string
  label: string
  width: number
  align: 'left' | 'center' | 'right'
  fixed?: string
}

// 组件宽度百分比
export type ComponentWidth = '100' | '50' | '33'

export interface TableComponent extends BaseComponent {
  type: 'table'
  columns: TableColumn[]
  dataSource: DataSource | null
  showHeader: boolean
  stripe: boolean
  border: boolean
  headerBackgroundColor: string
  headerColor: string
  fontSize: number
  pagination?: boolean
  pageSize?: number
  currentPage?: number
}

// 图表组件
export interface ChartComponent extends BaseComponent {
  type: 'chart'
  chartType: ChartType
  dataSource: DataSource | null
  title: string
  showLegend: boolean
  showDataZoom: boolean
  theme: string
}

// 矩形组件
export interface RectangleComponent extends BaseComponent {
  type: 'rectangle'
  backgroundColor: string
  borderColor: string
  borderWidth: number
  borderStyle: string
  borderRadius: number
}

// 线条组件
export interface LineComponent extends BaseComponent {
  type: 'line'
  stroke: string
  strokeWidth: number
  strokeStyle: string
}

// 数据源类型
export type DataSourceType = 'static' | 'api' | 'sql'

// 数据源接口
export interface DataSource {
  id: string
  name: string
  type: DataSourceType
  // 静态数据
  staticData?: Record<string, any>[]
  // API 数据源
  apiUrl?: string
  apiMethod?: 'GET' | 'POST'
  apiHeaders?: Record<string, string>
  apiParams?: Record<string, any>
  // SQL 数据源
  databaseId?: string
  sql?: string
}

// 数据库连接
export interface DatabaseConnection {
  id: string
  name: string
  host: string
  port: number
  username: string
  password: string
  database: string
  type: 'mysql' | 'postgresql' | 'mssql' | 'oracle'
}

// 组件联合类型
export type Component =
  | TextComponent
  | ImageComponent
  | TableComponent
  | ChartComponent
  | BarChartComponent
  | LineChartComponent
  | PieChartComponent
  | ScatterChartComponent
  | GaugeChartComponent
  | FunnelChartComponent
  | RectangleComponent
  | LineComponent
  | FormComponent

// 报表设计
export interface ReportDesign {
  id: string
  name: string
  width: number
  height: number
  backgroundColor: string
  components: Component[]
  dataSources: DataSource[]
  databaseConnections: DatabaseConnection[]
  createdAt: string
  updatedAt: string
}

// 历史记录
export interface HistoryItem {
  id: string
  design: ReportDesign
  timestamp: number
  description: string
}

// 导出格式
export type ExportFormat = 'pdf' | 'excel' | 'png' | 'json'
