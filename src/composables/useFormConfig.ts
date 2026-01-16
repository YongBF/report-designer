/**
 * useFormConfig.ts
 *
 * 表单组件配置相关的 composable
 *
 * 功能包括：
 * - 表单项管理（添加、删除、编辑）
 * - 表单项选项配置（静态/API）
 * - 表单项验证规则配置
 *
 * @module composables/useFormConfig
 * @author Report Designer Team
 * @since 2025-01-15
 */

import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { saveHistory, updateComponent } from '../stores/designer';
import type { Component, FormItemOption } from '../types';

/**
 * 表单配置操作的 composable
 *
 * @param selectedFormComponent - 选中的表单组件
 */
export function useFormConfig(selectedFormComponent: any) {
  // 表单配置状态
  const formCollapseActive = ref(['layout']);
  const formItemEditorVisible = ref(false);
  const editingFormItem = ref<any>(null);
  const editingFormItemIndex = ref<number>(-1);
  const newFormItemType = ref<string>('text');

  // 动态选项缓存（用于存储 API 加载的选项）
  const dynamicOptionsCache = ref<Map<string, FormItemOption[]>>(new Map());

  /**
   * 添加表单项按钮点击处理
   */
  function handleAddFormItem() {
    if (!newFormItemType.value) {
      ElMessage.warning('请选择表单项类型');
      return;
    }
    addFormItem(newFormItemType.value);
    // 重置选择
    newFormItemType.value = 'text';
  }

  /**
   * 添加表单项
   */
  function addFormItem(type: any) {
    const form = selectedFormComponent.value;
    if (!form) return;

    if (!form.items) {
      form.items = [];
    }

    const newItem: any = {
      id: `item-${Date.now()}`,
      type,
      field: `field${form.items.length + 1}`,
      label: `字段${form.items.length + 1}`,
      required: false,
      widthPercent: '100',
    };

    // 根据类型设置默认值
    switch (type) {
      case 'text':
      case 'password':
      case 'email':
      case 'textarea':
        newItem.placeholder = '请输入';
        break;
      case 'number':
        newItem.placeholder = '请输入数字';
        break;
      case 'date':
      case 'datetime':
      case 'time':
        newItem.placeholder = '请选择';
        break;
      case 'select':
      case 'radio':
      case 'checkbox':
        newItem.placeholder = '请选择';
        newItem.optionsSourceType = 'static'; // 默认使用静态选项
        newItem.options = [
          { label: '选项1', value: 'option1' },
          { label: '选项2', value: 'option2' },
        ];
        break;
      case 'color':
        newItem.placeholder = '请选择颜色';
        break;
    }

    // 使用 updateComponent 确保响应式更新
    const newItems = [...form.items, newItem];
    updateComponent(form.id, { items: newItems });
    saveHistory('添加表单项');
  }

  /**
   * 删除表单项
   */
  function removeFormItem(index: number) {
    const form = selectedFormComponent.value;
    if (!form || !form.items) return;

    // 使用 updateComponent 确保响应式更新
    const newItems = form.items.filter((_: any, i: number) => i !== index);
    updateComponent(form.id, { items: newItems });
    saveHistory('删除表单项');
  }

  /**
   * 编辑表单项
   */
  function editFormItem(index: number) {
    const form = selectedFormComponent.value;
    if (!form || !form.items || !form.items[index]) return;

    const item = { ...form.items[index] };

    // 初始化选项来源类型
    if (!item.optionsSourceType) {
      item.optionsSourceType = 'static';
    }

    // 初始化 API 配置
    if (item.optionsSourceType === 'api' && !item.optionsApiConfig) {
      item.optionsApiConfig = {
        url: '',
        method: 'GET',
        labelField: 'label',
        valueField: 'value',
        headers: {},
        params: {},
      };
    }

    // 用于 JSON 编辑的辅助字段
    if (item.optionsApiConfig?.headers) {
      item.optionsApiConfigHeadersJson = JSON.stringify(item.optionsApiConfig.headers, null, 2);
    } else {
      item.optionsApiConfigHeadersJson = '{}';
    }

    if (item.optionsApiConfig?.params) {
      item.optionsApiConfigParamsJson = JSON.stringify(item.optionsApiConfig.params, null, 2);
    } else {
      item.optionsApiConfigParamsJson = '{}';
    }

    editingFormItem.value = item;
    editingFormItemIndex.value = index;
    formItemEditorVisible.value = true;
  }

  /**
   * 保存表单项编辑
   */
  function handleFormItemSave() {
    const form = selectedFormComponent.value;
    if (!form || !form.items) return;

    const item = { ...editingFormItem.value };

    // 如果是 API 模式，解析 JSON 格式的请求头和参数
    if (item.optionsSourceType === 'api' && item.optionsApiConfig) {
      try {
        if (item.optionsApiConfigHeadersJson) {
          item.optionsApiConfig.headers = JSON.parse(item.optionsApiConfigHeadersJson);
        }
        if (item.optionsApiConfigParamsJson) {
          item.optionsApiConfig.params = JSON.parse(item.optionsApiConfigParamsJson);
        }
      } catch (e) {
        ElMessage.error('请求头或参数 JSON 格式错误');
        return;
      }
    }

    // 删除辅助字段
    delete item.optionsApiConfigHeadersJson;
    delete item.optionsApiConfigParamsJson;

    // 使用 updateComponent 确保响应式更新
    const newItems = [...form.items];
    newItems[editingFormItemIndex.value] = item;
    updateComponent(form.id, { items: newItems });
    formItemEditorVisible.value = false;
    saveHistory('编辑表单项');
    ElMessage.success('表单项已保存');
  }

  /**
   * 取消表单项编辑
   */
  function handleFormItemCancel() {
    formItemEditorVisible.value = false;
    editingFormItem.value = null;
  }

  /**
   * 添加表单项选项
   */
  function addFormItemOption() {
    if (!editingFormItem.value) return;
    if (!editingFormItem.value.options) {
      editingFormItem.value.options = [];
    }
    editingFormItem.value.options.push({
      label: `选项${editingFormItem.value.options.length + 1}`,
      value: `option${editingFormItem.value.options.length + 1}`,
    });
  }

  /**
   * 删除表单项选项
   */
  function removeFormItemOption(index: number) {
    if (!editingFormItem.value || !editingFormItem.value.options) return;
    editingFormItem.value.options.splice(index, 1);
  }

  /**
   * 加载 API 选项
   */
  async function loadApiOptions(item: any): Promise<FormItemOption[]> {
    if (!item.optionsApiConfig?.url) {
      return [];
    }

    const cacheKey = `${item.id}-${JSON.stringify(item.optionsApiConfig)}`;
    const cached = dynamicOptionsCache.value.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const config = item.optionsApiConfig;
      const options: RequestInit = {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
      };

      if (config.method === 'POST') {
        options.body = JSON.stringify(config.params || {});
      } else {
        // GET 请求将参数添加到 URL
        const url = new URL(config.url, window.location.origin);
        if (config.params) {
          Object.keys(config.params).forEach((key) => {
            url.searchParams.append(key, String(config.params[key]));
          });
        }
      }

      const response = await fetch(config.url, options);
      if (!response.ok) {
        console.error('API 请求失败:', response.statusText);
        return [];
      }

      const data = await response.json();
      const optionsData = Array.isArray(data) ? data : data.data || [];

      const formattedOptions: FormItemOption[] = optionsData.map((row: any) => ({
        label: row[config.labelField] || row.label || '',
        value: row[config.valueField] || row.value || '',
      }));

      dynamicOptionsCache.value.set(cacheKey, formattedOptions);
      return formattedOptions;
    } catch (error) {
      console.error('加载 API 选项失败:', error);
      return [];
    }
  }

  /**
   * 获取表单项的实际选项（静态或 API）
   */
  function getFormItemOptions(item: any): FormItemOption[] {
    if (item.optionsSourceType === 'api' && item.optionsApiConfig?.url) {
      const cacheKey = `${item.id}-${JSON.stringify(item.optionsApiConfig)}`;
      return dynamicOptionsCache.value.get(cacheKey) || [];
    }
    return item.options || [];
  }

  /**
   * 添加验证规则
   */
  function addFormItemRule() {
    if (!editingFormItem.value) return;
    if (!editingFormItem.value.rules) {
      editingFormItem.value.rules = [];
    }
    editingFormItem.value.rules.push({
      required: false,
      message: '验证失败',
    });
  }

  /**
   * 删除验证规则
   */
  function removeFormItemRule(index: number) {
    if (!editingFormItem.value || !editingFormItem.value.rules) return;
    editingFormItem.value.rules.splice(index, 1);
  }

  return {
    // 状态
    formCollapseActive,
    formItemEditorVisible,
    editingFormItem,
    editingFormItemIndex,
    newFormItemType,
    dynamicOptionsCache,
    // 方法
    handleAddFormItem,
    addFormItem,
    removeFormItem,
    editFormItem,
    handleFormItemSave,
    handleFormItemCancel,
    addFormItemOption,
    removeFormItemOption,
    loadApiOptions,
    getFormItemOptions,
    addFormItemRule,
    removeFormItemRule,
  };
}
