/**
 * Panel State Composable
 *
 * 面板状态管理
 *
 * @module composables/usePanelState
 * @author Report Designer Team
 * @since 2026-01-17
 */

import { ref, computed } from 'vue';
import { useDesignerStore } from '@/stores/pinia';
import { useComponentState } from '@/composables';

export function usePanelState() {
  const designerStore = useDesignerStore();

  // 使用现有的组件状态
  const componentState = useComponentState();
  const {
    canvasRef,
    chartRefsMap,
    chartInstancesMap,
    orderedComponents,
    selectedComponent,
    selectedFormComponent,
    canvasStyle,
  } = componentState;

  // 属性面板折叠状态
  const panelCollapseActive = ref('info');

  // 从 store 获取的状态
  const selectedIds = computed(() => designerStore.selectedIds);
  const canUndo = computed(() => designerStore.canUndo);
  const canRedo = computed(() => designerStore.canRedo);

  return {
    // 组件状态
    canvasRef,
    chartRefsMap,
    chartInstancesMap,
    orderedComponents,
    selectedComponent,
    selectedFormComponent,
    canvasStyle,

    // 面板状态
    panelCollapseActive,

    // Store 状态
    selectedIds,
    canUndo,
    canRedo,

    // Store 方法
    updateComponent: designerStore.updateComponent,
  };
}

export default usePanelState;
