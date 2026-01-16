/**
 * linkage.ts
 *
 * 组件联动类型定义
 *
 * @module types/linkage
 * @author Report Designer Team
 * @since 2025-01-16
 */

import type { Component } from './index';

/**
 * 联动动作类型
 */
export enum LinkageActionType {
  /** 刷新数据 */
  REFRESH = 'refresh',
  /** 更新配置 */
  UPDATE_CONFIG = 'update_config',
  /** 显示/隐藏 */
  TOGGLE_VISIBLE = 'toggle_visible',
  /** 启用/禁用 */
  TOGGLE_DISABLED = 'toggle_disabled',
  /** 自定义代码 */
  CUSTOM = 'custom',
}

/**
 * 参数映射类型
 */
export enum ParameterMappingType {
  /** 直接映射 */
  DIRECT = 'direct',
  /** 重命名 */
  RENAME = 'rename',
  /** 固定值 */
  FIXED = 'fixed',
  /** 表达式 */
  EXPRESSION = 'expression',
}

/**
 * 参数映射配置
 */
export interface ParameterMapping {
  /** 映射类型 */
  type: ParameterMappingType;
  /** 源字段路径（如：formData.name） */
  sourceField: string;
  /** 目标参数名 */
  targetParam: string;
  /** 固定值（当 type 为 fixed 时使用） */
  fixedValue?: any;
  /** 表达式（当 type 为 expression 时使用） */
  expression?: string;
  /** 默认值 */
  defaultValue?: any;
}

/**
 * 联动配置
 */
export interface LinkageConfig {
  /** 联动关系唯一标识 */
  id: string;
  /** 源组件 ID */
  sourceComponentId: string;
  /** 目标组件 ID */
  targetComponentId: string;
  /** 联动动作类型 */
  actionType: LinkageActionType;
  /** 触发条件：源组件的事件类型 */
  triggerEvent: string;
  /** 参数映射配置 */
  parameterMappings: ParameterMapping[];
  /** 是否启用 */
  enabled: boolean;
  /** 延迟执行（毫秒） */
  delay?: number;
  /** 自定义处理代码（当 actionType 为 custom 时使用） */
  customHandler?: string;
  /** 描述信息 */
  description?: string;
}

/**
 * 联动执行上下文
 */
export interface LinkageContext {
  /** 源组件 */
  sourceComponent: Component;
  /** 目标组件 */
  targetComponent: Component;
  /** 触发事件数据 */
  eventData?: any;
  /** 源组件当前值（如表单数据） */
  sourceValue?: any;
  /** 全局状态 */
  globalState?: Record<string, any>;
}

/**
 * 组件联动配置扩展
 */
export interface LinkageComponent {
  /** 组件 ID */
  id: string;
  /** 联动配置列表（作为源） */
  linkagesAsSource?: LinkageConfig[];
  /** 联动配置列表（作为目标） */
  linkagesAsTarget?: LinkageConfig[];
}
