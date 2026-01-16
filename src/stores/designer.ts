/**
 * Report Designer Store - Compatibility Layer
 *
 * 报表设计器状态管理 - 兼容层
 *
 * 此文件提供了从旧的基于 Composition API 的 store 到 Pinia 的兼容层。
 * 现有代码可以继续使用这些导入，而不需要立即修改。
 *
 * @module stores/designer
 * @author Report Designer Team
 * @since 2026-01-16
 * @deprecated 请直接使用 useDesignerStore from './stores/designer'
 */

import { useDesignerStore } from './pinia';

// 创建一个单例 store 实例
let storeInstance: ReturnType<typeof useDesignerStore> | null = null;

function getDesignerStore() {
  if (!storeInstance) {
    storeInstance = useDesignerStore();
  }
  return storeInstance;
}

// 导出所有 state
export const currentDesign = {
  get value() { return getDesignerStore().currentDesign; },
  set value(val) { getDesignerStore().currentDesign = val; }
};

export const history = {
  get value() { return getDesignerStore().history; },
};

export const historyIndex = {
  get value() { return getDesignerStore().historyIndex; },
  set value(val) { getDesignerStore().historyIndex = val; }
};

export const selectedIds = {
  get value() { return getDesignerStore().selectedIds; },
  set value(val) { getDesignerStore().selectedIds = val; }
};

export const hoveredId = {
  get value() { return getDesignerStore().hoveredId; },
  set value(val) { getDesignerStore().hoveredId = val; }
};

export const scale = {
  get value() { return getDesignerStore().scale; },
  set value(val) { getDesignerStore().scale = val; }
};

export const gridSize = {
  get value() { return getDesignerStore().gridSize; },
  set value(val) { getDesignerStore().gridSize = val; }
};

export const showGrid = {
  get value() { return getDesignerStore().showGrid; },
  set value(val) { getDesignerStore().showGrid = val; }
};

export const snapToGrid = {
  get value() { return getDesignerStore().snapToGrid; },
  set value(val) { getDesignerStore().snapToGrid = val; }
};

// 导出 computed - 使用 getter 延迟求值，避免在模块加载时初始化
export const selectedComponents = {
  get value() { return getDesignerStore().selectedComponents; }
};
export const singleSelectedComponent = {
  get value() { return getDesignerStore().singleSelectedComponent; }
};
export const hoveredComponent = {
  get value() { return getDesignerStore().hoveredComponent; }
};
export const canUndo = {
  get value() { return getDesignerStore().canUndo; }
};
export const canRedo = {
  get value() { return getDesignerStore().canRedo; }
};

// 导出 actions
export const initDesigner = () => getDesignerStore().initDesigner();
export const saveHistory = (desc: string) => getDesignerStore().saveHistory(desc);
export const undo = () => getDesignerStore().undo();
export const redo = () => getDesignerStore().redo();
export const createNewDesign = (width?: number, height?: number) => getDesignerStore().createNewDesign(width, height);
export const loadDesign = (design: any) => getDesignerStore().loadDesign(design);
export const exportDesign = () => getDesignerStore().exportDesign();
export const importDesign = (design: any) => getDesignerStore().importDesign(design);
export const addComponent = (component: any) => getDesignerStore().addComponent(component);
export const updateComponent = (id: string, updates: any) => getDesignerStore().updateComponent(id, updates);
export const removeComponents = (ids: string[]) => getDesignerStore().removeComponents(ids);
export const duplicateComponents = (ids: string[]) => getDesignerStore().duplicateComponents(ids);
export const changeComponentOrder = (id: string, direction: any) => getDesignerStore().changeComponentOrder(id, direction);
export const selectComponent = (id: any, addToSelection?: boolean) => getDesignerStore().selectComponent(id, addToSelection);
export const clearSelection = () => getDesignerStore().clearSelection();
export const selectAll = () => getDesignerStore().selectAll();
export const addDataSource = (dataSource: any) => getDesignerStore().addDataSource(dataSource);
export const updateDataSource = (id: string, updates: any) => getDesignerStore().updateDataSource(id, updates);
export const removeDataSource = (id: string) => getDesignerStore().removeDataSource(id);
export const addDatabaseConnection = (connection: any) => getDesignerStore().addDatabaseConnection(connection);
export const removeDatabaseConnection = (id: string) => getDesignerStore().removeDatabaseConnection(id);
export const updateCanvasSize = (width: number, height: number) => getDesignerStore().updateCanvasSize(width, height);
export const updateCanvasStyle = (updates: any) => getDesignerStore().updateCanvasStyle(updates);
export const setScale = (value: number) => getDesignerStore().setScale(value);
export const setHoveredId = (id: string | null) => getDesignerStore().setHoveredId(id);
