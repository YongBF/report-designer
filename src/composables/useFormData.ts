/**
 * useFormData.ts
 *
 * 表单数据管理 composable
 *
 * 功能：
 * - 管理表单组件的输入数据
 * - 提供响应式的数据绑定
 * - 支持获取和设置表单数据
 *
 * @module composables/useFormData
 * @author Report Designer Team
 * @since 2025-01-16
 */

import { ref, watch } from 'vue';
import type { Component } from '../types';

/**
 * 表单数据管理
 */
export function useFormData() {
  // 存储每个表单组件的数据
  // key: 组件ID, value: 表单数据对象
  const formDataMap = ref<Record<string, Record<string, any>>>({});

  /**
   * 获取表单数据
   */
  function getFormData(componentId: string): Record<string, any> {
    if (!formDataMap.value[componentId]) {
      formDataMap.value[componentId] = {};
    }
    return formDataMap.value[componentId];
  }

  /**
   * 设置表单字段值
   */
  function setFieldValue(componentId: string, field: string, value: any) {
    if (!formDataMap.value[componentId]) {
      formDataMap.value[componentId] = {};
    }
    formDataMap.value[componentId][field] = value;
  }

  /**
   * 获取表单字段值
   */
  function getFieldValue(componentId: string, field: string): any {
    return formDataMap.value[componentId]?.[field];
  }

  /**
   * 重置表单数据
   */
  function resetFormData(componentId: string) {
    formDataMap.value[componentId] = {};
  }

  /**
   * 从组件配置初始化表单数据
   */
  function initFormData(component: Component) {
    if (component.type !== 'form' || !component.items) {
      return;
    }

    if (!formDataMap.value[component.id]) {
      formDataMap.value[component.id] = {};
    }

    // 使用 defaultValue 初始化字段值
    component.items.forEach((item: any) => {
      if (item.field && !formDataMap.value[component.id]?.hasOwnProperty(item.field)) {
        formDataMap.value[component.id][item.field] = item.defaultValue ?? '';
      }
    });
  }

  /**
   * 清空所有表单数据
   */
  function clearAll() {
    formDataMap.value = {};
  }

  return {
    formDataMap,
    getFormData,
    setFieldValue,
    getFieldValue,
    resetFormData,
    initFormData,
    clearAll,
  };
}
