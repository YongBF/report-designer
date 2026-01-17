/**
 * useToolbar.ts
 *
 * 工具栏操作相关的 composable
 *
 * 功能包括：
 * - 新建设计
 * - 撤销/重做
 * - 保存设计
 * - 预览
 * - 测试
 * - 图表配置更新
 *
 * @module composables/useToolbar
 * @author Report Designer Team
 * @since 2025-01-15
 */

import { nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { useDesignerStore } from '../stores/pinia';
import type { Component } from '../types';

/**
 * 工具栏操作 composable
 */
export function useToolbar() {
  const designerStore = useDesignerStore();
  const {
    currentDesign,
    selectedIds,
    createNewDesign,
    undo,
    redo,
    canUndo,
    canRedo,
    updateComponent,
  } = designerStore;
  /**
   * 新建设计
   */
  function handleNew() {
    createNewDesign();
    ElMessage.success('已新建报表');
  }

  /**
   * 撤销
   */
  function handleUndo() {
    undo();
  }

  /**
   * 重做
   */
  function handleRedo() {
    redo();
  }

  /**
   * 保存设计
   * 将当前设计导出为 JSON 文件
   */
  function handleSave() {
    const design = JSON.stringify(currentDesign.value, null, 2);
    const blob = new Blob([design], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDesign.value.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('报表已保存');
  }

  /**
   * 预览
   */
  function handlePreview() {
    ElMessage.info('预览功能开发中...');
  }

  /**
   * 处理图表配置更新
   * 更新图表组件配置并立即刷新图表显示
   */
  function handleChartUpdate(selectedComponent: Component | null) {
    if (!selectedComponent) return;
    // 使用深拷贝更新组件，确保触发响应式更新
    updateComponent(
      selectedComponent.id,
      JSON.parse(JSON.stringify(selectedComponent))
    );
    // 立即更新图表显示
    nextTick(() => {
      // 安全检查：确保 currentDesign.value 存在
      if (!currentDesign.value || !currentDesign.value.components) {
        return;
      }
      const updatedComponent = currentDesign.value.components.find(
        (c) => c.id === selectedComponent!.id
      );
      if (
        updatedComponent &&
        [
          'chart',
          'bar-chart',
          'line-chart',
          'pie-chart',
          'scatter-chart',
          'gauge-chart',
          'funnel-chart',
        ].includes(updatedComponent.type)
      ) {
        // 触发图表更新事件
        const event = new CustomEvent('chart-update', {
          detail: { componentId: updatedComponent.id },
        });
        window.dispatchEvent(event);
      }
    });
  }

  return {
    // 状态
    canUndo,
    canRedo,
    // 方法
    handleNew,
    handleUndo,
    handleRedo,
    handleSave,
    handlePreview,
    handleChartUpdate,
  };
}
