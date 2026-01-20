/**
 * Designer Events Composable
 *
 * 设计器事件处理
 *
 * @module composables/useDesignerEvents
 * @author Report Designer Team
 * @since 2026-01-17
 */

import { ref } from 'vue';
import { useDesignerStore } from '@/stores/pinia';
import type { Component, FormComponent } from '@/types';

export function useDesignerEvents() {
  const designerStore = useDesignerStore();

  // 表单数据存储
  const formData = ref<Record<string, Record<string, any>>>({});

  /**
   * 处理工具栏操作
   */
  function handleToolbarAction(action: string) {
    switch (action) {
      case 'new':
        designerStore.createNewDesign();
        break;
      case 'undo':
        designerStore.undo();
        break;
      case 'redo':
        designerStore.redo();
        break;
      case 'save':
        designerStore.saveHistory('手动保存');
        // TODO: 实现保存到后端
        break;
      case 'preview':
        // 预览由组件处理
        break;
    }
  }

  /**
   * 处理组件点击
   */
  function handleComponentClick(component: Component) {
    if (component.locked) return;
    designerStore.selectComponent(component.id);
  }

  /**
   * 处理组件更新
   */
  function handleComponentUpdate(id: string, updates: Partial<Component>) {
    designerStore.updateComponent(id, updates);
  }

  /**
   * 处理组件删除
   */
  function handleComponentDelete() {
    const selectedIds = designerStore.selectedIds;
    if (selectedIds.length > 0) {
      designerStore.removeComponents(selectedIds);
    }
  }

  /**
   * 处理画布点击
   */
  function handleCanvasClick() {
    designerStore.clearSelection();
  }

  /**
   * 处理表单字段变化
   */
  function handleFormFieldChange(formId: string, field: string, value: any) {
    if (!formData.value[formId]) {
      formData.value[formId] = {};
    }
    formData.value[formId][field] = value;
  }

  /**
   * 处理表单按钮点击
   */
  function handleFormButtonClick(formComponent: FormComponent, item: any) {
    // 收集表单数据
    const data = formData.value[formComponent.id] || {};

    // TODO: 触发组件联动
    // TODO: 执行按钮配置的动作
    if (item.actionType === 'submit') {
      // 提交表单
    } else if (item.actionType === 'reset') {
      formData.value[formComponent.id] = {};
    }
  }

  return {
    formData,
    handleToolbarAction,
    handleComponentClick,
    handleComponentUpdate,
    handleComponentDelete,
    handleCanvasClick,
    handleFormFieldChange,
    handleFormButtonClick,
  };
}

export default useDesignerEvents;
