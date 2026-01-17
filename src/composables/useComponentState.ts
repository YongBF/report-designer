/**
 * useComponentState.ts
 *
 * 组件状态管理相关的 composable
 *
 * 功能包括：
 * - 画布引用管理
 * - 图表引用和实例管理
 * - 组件列表计算属性
 * - 选中组件状态管理
 * - 画布样式计算
 *
 * @module composables/useComponentState
 * @author Report Designer Team
 * @since 2025-01-15
 */

import { ref, computed } from 'vue';
import { useDesignerStore } from '../stores/pinia';
import { storeToRefs } from 'pinia';
import type { Component } from '../types';

/**
 * 组件状态管理的 composable
 */
export function useComponentState() {
  const designerStore = useDesignerStore();
  const { currentDesign, selectedIds } = storeToRefs(designerStore);
  // Canvas 引用
  const canvasRef = ref<HTMLElement>();

  // 图表相关引用
  const chartRefsMap = ref<Map<string, HTMLElement>>(new Map());
  const chartInstancesMap = ref<Map<string, any>>(new Map());

  // 柱状图折叠面板状态
  const barChartCollapseActive = ref(['basic']);

  /**
   * 计算属性：按 order 排序的组件列表
   */
  const orderedComponents = computed(() => {
    return [...currentDesign.value.components].sort((a, b) => a.order - b.order);
  });

  /**
   * 计算属性：当前选中的单个组件
   */
  const selectedComponent = computed(() => {
    return selectedIds.value.length === 1
      ? currentDesign.value.components.find((c) => c.id === selectedIds.value[0]) || null
      : null;
  });

  /**
   * 计算属性：当前选中的表单组件
   */
  const selectedFormComponent = computed(() => {
    return selectedComponent.value?.type === 'form' ? selectedComponent.value : null;
  });

  /**
   * 计算属性：画布样式
   */
  const canvasStyle = computed(() => ({
    width: '100%',
    backgroundColor: currentDesign.value.backgroundColor,
  }));

  return {
    // 状态
    canvasRef,
    chartRefsMap,
    chartInstancesMap,
    barChartCollapseActive,
    // 计算属性
    orderedComponents,
    selectedComponent,
    selectedFormComponent,
    canvasStyle,
  };
}
