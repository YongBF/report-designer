/**
 * useDragDrop.ts
 *
 * 拖拽和调整大小相关的 composable
 *
 * 功能包括：
 * - 从组件库拖拽到画布
 * - 画布内组件拖拽排序
 * - 组件高度调整
 * - 组件选择和删除
 *
 * @module composables/useDragDrop
 * @author Report Designer Team
 * @since 2025-01-15
 */

import { ref, type Ref } from 'vue';
import { ElMessage } from 'element-plus';
import {
  currentDesign,
  selectedIds,
  addComponent,
  removeComponents,
  saveHistory,
} from '../stores/designer';
import type { Component, ComponentType } from '../types';

interface ComponentItem {
  type: ComponentType;
  label: string;
  icon: any;
}

/**
 * 拖拽和调整大小操作的 composable
 *
 * @param canvasRef - 画布 DOM 引用
 * @param orderedComponents - 排序后的组件列表
 * @param createComponent - 创建组件的函数
 */
export function useDragDrop(
  canvasRef: any,
  orderedComponents: any,
  createComponent: (type: ComponentType) => Component | null
) {
  // 拖拽状态
  const draggingComponentId = ref<string | null>(null);
  const dropIndex = ref<number | null>(null);
  const isDraggingFromLibrary = ref(false);

  // 调整大小状态
  const isResizing = ref(false);
  const resizeStartY = ref(0);
  const resizeStartHeight = ref(0);
  const resizingComponentId = ref<string | null>(null);

  /**
   * 从组件库开始拖拽
   */
  function handleDragStart(item: ComponentItem, e: DragEvent) {
    isDraggingFromLibrary.value = true;
    if (e.dataTransfer) {
      e.dataTransfer.setData('componentType', item.type);
      e.dataTransfer.effectAllowed = 'copy';
    }
  }

  /**
   * 从组件库拖拽到画布
   */
  function handleCanvasDropFromLibrary(e: DragEvent) {
    const componentType = e.dataTransfer?.getData('componentType');
    if (!componentType) {
      handleCanvasDrop(e);
      return;
    }

    const newComponent = createComponent(componentType as ComponentType);
    if (!newComponent) return;

    // 如果有计算出的插入位置，使用它；否则添加到末尾
    if (dropIndex.value !== null && dropIndex.value >= 0) {
      const components = orderedComponents.value;

      // 调整新组件的 order 值，插入到正确位置
      if (dropIndex.value < components.length) {
        // 插入到中间某个位置
        const targetOrder = components[dropIndex.value].order;
        newComponent.order = targetOrder;

        // 将后面的组件 order 值加 1
        components.forEach((comp) => {
          if (comp.order >= targetOrder) {
            comp.order++;
          }
        });
      } else {
        // 添加到末尾
        const maxOrder =
          components.length > 0 ? Math.max(...components.map((c) => c.order)) : -1;
        newComponent.order = maxOrder + 1;
      }

      currentDesign.value.components.push(newComponent);
      selectedIds.value = [newComponent.id];
      saveHistory('添加组件');
    } else {
      // 使用默认的 addComponent
      addComponent(newComponent);
    }

    ElMessage.success('组件已添加');

    // 清理
    isDraggingFromLibrary.value = false;
    dropIndex.value = null;
  }

  /**
   * 画布拖拽离开
   */
  function handleCanvasDragLeave(e: DragEvent) {
    // 只在真正离开画布时清除状态
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // 如果鼠标在画布范围内，不清除状态
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return;
    }

    isDraggingFromLibrary.value = false;
    dropIndex.value = null;
  }

  /**
   * 画布点击 - 清除选择
   */
  function handleCanvasClick() {
    selectedIds.value = [];
  }

  /**
   * 组件点击 - 选择组件
   */
  function handleComponentClick(component: Component, e: MouseEvent) {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      if (selectedIds.value.includes(component.id)) {
        selectedIds.value = selectedIds.value.filter((id) => id !== component.id);
      } else {
        selectedIds.value.push(component.id);
      }
    } else {
      selectedIds.value = [component.id];
    }
  }

  /**
   * 组件拖拽开始
   */
  function handleComponentDragStart(component: Component, e: DragEvent) {
    draggingComponentId.value = component.id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('componentId', component.id);
      e.dataTransfer.setDragImage(e.target as HTMLElement, 0, 0);
    }
  }

  /**
   * 组件拖拽结束
   */
  function handleComponentDragEnd() {
    draggingComponentId.value = null;
    dropIndex.value = null;
  }

  /**
   * 画布拖拽经过 - 计算插入位置
   */
  function handleCanvasDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    // 检查是否有拖拽的内容（画布内组件或组件库新组件）
    if (!draggingComponentId.value && !isDraggingFromLibrary.value) {
      return;
    }

    const canvasRect = canvasRef.value!.getBoundingClientRect();
    const mouseX = e.clientX - canvasRect.left;
    const mouseY = e.clientY - canvasRect.top;

    // 获取所有可见组件的位置信息
    const componentPositions: Array<{
      id: string;
      index: number;
      left: number;
      top: number;
      right: number;
      bottom: number;
      centerX: number;
      centerY: number;
    }> = [];
    const components = orderedComponents.value;
    const draggingId = draggingComponentId.value;

    for (let i = 0; i < components.length; i++) {
      // 从组件库拖拽时，不跳过任何组件；画布内拖拽时，跳过正在拖拽的组件
      if (isDraggingFromLibrary.value || components[i].id !== draggingId) {
        const componentEl = canvasRef.value!.querySelector(
          `[data-component-id="${components[i].id}"]`
        ) as HTMLElement;
        if (!componentEl) continue;

        const rect = componentEl.getBoundingClientRect();
        componentPositions.push({
          id: components[i].id,
          index: i,
          left: rect.left - canvasRect.left,
          top: rect.top - canvasRect.top,
          right: rect.right - canvasRect.left,
          bottom: rect.bottom - canvasRect.top,
          centerX: (rect.left + rect.right) / 2 - canvasRect.left,
          centerY: (rect.top + rect.bottom) / 2 - canvasRect.top,
        });
      }
    }

    // 找到鼠标位置应该插入的位置
    let targetIndex = components.length;
    let minDistance = Infinity;

    for (const pos of componentPositions) {
      // 判断鼠标是否在组件的左半边还是右半边
      const isLeftSide = mouseX < pos.centerX;

      // 计算鼠标到组件边界的距离
      const dx = isLeftSide ? Math.abs(mouseX - pos.left) : Math.abs(mouseX - pos.right);
      const dy = Math.abs(mouseY - pos.centerY);

      // 使用加权距离，水平方向权重更大
      const distance = dx * 1.5 + dy;

      if (distance < minDistance) {
        minDistance = distance;
        // 如果在左半边，插入到当前组件之前；否则在之后
        targetIndex = isLeftSide ? pos.index : pos.index + 1;
      }
    }

    dropIndex.value = targetIndex;
  }

  /**
   * 画布放置 - 处理画布内组件拖拽排序
   */
  function handleCanvasDrop(e: DragEvent) {
    e.preventDefault();
    if (!draggingComponentId.value) return;

    const component = currentDesign.value.components.find(
      (c) => c.id === draggingComponentId.value
    );
    if (!component || dropIndex.value === null) return;

    // 重新排序所有组件的 order 值
    const components = orderedComponents.value.filter((c) => c.id !== draggingComponentId.value);
    components.splice(dropIndex.value, 0, component);

    // 更新所有组件的 order
    components.forEach((comp, index) => {
      comp.order = index;
    });

    draggingComponentId.value = null;
    dropIndex.value = null;
  }

  /**
   * 开始调整高度
   */
  function handleResizeStart(component: Component, e: MouseEvent) {
    if (component.locked) return;

    isResizing.value = true;
    resizeStartY.value = e.clientY;
    resizeStartHeight.value = component.height;
    resizingComponentId.value = component.id;

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }

  /**
   * 调整高度中
   */
  function handleResizeMove(e: MouseEvent) {
    if (!isResizing.value || !resizingComponentId.value) return;

    const component = currentDesign.value.components.find(
      (c) => c.id === resizingComponentId.value
    );
    if (!component) return;

    const dy = e.clientY - resizeStartY.value;
    component.height = Math.max(50, resizeStartHeight.value + dy);
  }

  /**
   * 结束调整高度
   */
  function handleResizeEnd() {
    isResizing.value = false;
    resizingComponentId.value = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }

  /**
   * 删除选中的组件
   */
  function handleDelete() {
    if (selectedIds.value.length > 0) {
      removeComponents(selectedIds.value);
      ElMessage.success('组件已删除');
    }
  }

  return {
    // 状态
    draggingComponentId,
    dropIndex,
    isDraggingFromLibrary,
    isResizing,
    // 方法
    handleDragStart,
    handleCanvasDropFromLibrary,
    handleCanvasDragLeave,
    handleCanvasClick,
    handleComponentClick,
    handleComponentDragStart,
    handleComponentDragEnd,
    handleCanvasDragOver,
    handleCanvasDrop,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    handleDelete,
  };
}
