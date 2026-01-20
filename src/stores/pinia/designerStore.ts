/**
 * Report Designer Pinia Store
 *
 * 报表设计器的 Pinia 状态管理中心
 *
 * 功能包括：
 * - 设计器状态管理（当前设计、历史记录、撤销/重做）
 * - 组件管理（添加、更新、删除、复制、调整顺序）
 * - 选择管理（单选、多选、悬停）
 * - 数据源管理
 * - 数据库连接管理
 * - 画布设置（缩放、网格、对齐）
 *
 * @module stores/pinia/designerStore
 * @author Report Designer Team
 * @since 2026-01-16
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type {
  Component,
  ReportDesign,
  HistoryItem,
  DataSource,
  DatabaseConnection,
} from '../../types';
import { generateId } from '../../utils';

const STORAGE_KEY = 'report_designer_current';

export const useDesignerStore = defineStore('designer', () => {
  // ============ State ============

  // 当前设计
  const currentDesign = ref<ReportDesign>({
    id: generateId(),
    name: '未命名报表',
    width: 800,
    height: Math.max(window.innerHeight - 200, 600),
    backgroundColor: '#ffffff',
    components: [],
    dataSources: [],
    databaseConnections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 历史记录
  const history = ref<HistoryItem[]>([]);
  const historyIndex = ref(-1);
  const maxHistorySize = 50;

  // 选中的组件 ID
  const selectedIds = ref<string[]>([]);
  const hoveredId = ref<string | null>(null);

  // 画布缩放
  const scale = ref(1);
  const gridSize = ref(10);
  const showGrid = ref(true);
  const snapToGrid = ref(true);

  // ============ Actions ============

  // 初始化 - 从本地存储加载
  function initDesigner() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const design = JSON.parse(saved) as ReportDesign;
        currentDesign.value = design;

        // 强制更新画布高度以适应当前屏幕
        currentDesign.value.height = Math.max(window.innerHeight - 200, 600);
        saveToStorage();

        saveHistory('加载设计');
      } catch (e) {
        // 加载设计失败，忽略错误
      }
    } else {
      saveHistory('新建设计');
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDesign.value));
  }

  // 保存历史记录
  function saveHistory(description: string) {
    const item: HistoryItem = {
      id: generateId(),
      design: JSON.parse(JSON.stringify(currentDesign.value)),
      timestamp: Date.now(),
      description,
    };

    // 如果当前不在历史记录末尾，删除后面的记录
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }

    history.value.push(item);

    // 限制历史记录大小
    if (history.value.length > maxHistorySize) {
      history.value.shift();
    }

    historyIndex.value = history.value.length - 1;
    saveToStorage();
  }

  // 撤销
  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--;
      const item = history.value[historyIndex.value];
      currentDesign.value = JSON.parse(JSON.stringify(item.design));
      saveToStorage();
      return true;
    }
    return false;
  }

  // 重做
  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      const item = history.value[historyIndex.value];
      currentDesign.value = JSON.parse(JSON.stringify(item.design));
      saveToStorage();
      return true;
    }
    return false;
  }

  // 创建新设计
  function createNewDesign(width = 800, height?: number) {
    // 如果没有指定高度，使用屏幕高度减去一些边距
    const canvasHeight = height || window.innerHeight - 200;

    currentDesign.value = {
      id: generateId(),
      name: '未命名报表',
      width,
      height: Math.max(canvasHeight, 600), // 至少 600px
      backgroundColor: '#ffffff',
      components: [],
      dataSources: [],
      databaseConnections: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    selectedIds.value = [];
    saveHistory('新建设计');
  }

  // 加载设计
  function loadDesign(design: ReportDesign) {
    currentDesign.value = JSON.parse(JSON.stringify(design));
    selectedIds.value = [];
    saveHistory('加载设计');
  }

  // 导出设计
  function exportDesign(): ReportDesign {
    return JSON.parse(JSON.stringify(currentDesign.value));
  }

  // 导入设计
  function importDesign(design: ReportDesign) {
    currentDesign.value = JSON.parse(JSON.stringify(design));
    selectedIds.value = [];
    saveHistory('导入设计');
  }

  // 添加组件
  function addComponent(component: Component) {
    currentDesign.value.components.push(component);
    selectedIds.value = [component.id];
    saveHistory('添加组件');
  }

  // 更新组件
  function updateComponent(id: string, updates: Partial<Component>) {
    const index = currentDesign.value.components.findIndex((c) => c.id === id);
    if (index !== -1) {
      // 使用 Vue 3 响应式方式：先获取原组件，合并更新
      const oldComponent = currentDesign.value.components[index];
      const updatedComponent = {
        ...oldComponent,
        ...updates,
      };

      // 创建新的 components 数组
      const newComponents = [
        ...currentDesign.value.components.slice(0, index),
        updatedComponent,
        ...currentDesign.value.components.slice(index + 1),
      ];

      // 创建全新的 currentDesign 对象，强制触发响应式更新
      const oldDesign = currentDesign.value;
      currentDesign.value = {
        ...oldDesign,
        components: newComponents,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // 删除组件
  function removeComponents(ids: string[]) {
    currentDesign.value.components = currentDesign.value.components.filter(
      (c) => !ids.includes(c.id)
    );
    selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id));
    saveHistory('删除组件');
  }

  // 复制组件
  function duplicateComponents(ids: string[]) {
    const newComponents: Component[] = [];
    const newIds: string[] = [];

    ids.forEach((id) => {
      const component = currentDesign.value.components.find((c) => c.id === id);
      if (component) {
        const newComponent = JSON.parse(JSON.stringify(component));
        newComponent.id = generateId();
        newComponent.x += 20;
        newComponent.y += 20;
        newComponents.push(newComponent);
        newIds.push(newComponent.id);
      }
    });

    currentDesign.value.components.push(...newComponents);
    selectedIds.value = newIds;
    saveHistory('复制组件');
  }

  // 调整组件顺序
  function changeComponentOrder(id: string, direction: 'up' | 'down' | 'toTop' | 'toBottom') {
    const index = currentDesign.value.components.findIndex((c) => c.id === id);
    if (index === -1) return;

    const component = currentDesign.value.components[index];
    const maxOrder = Math.max(0, ...currentDesign.value.components.map((c) => c.order));

    switch (direction) {
      case 'up':
        component.order = Math.max(0, component.order - 1);
        break;
      case 'down':
        component.order++;
        break;
      case 'toTop':
        component.order = 0;
        // 其他组件 order+1
        currentDesign.value.components.forEach((c) => {
          if (c.id !== id) c.order++;
        });
        break;
      case 'toBottom':
        component.order = maxOrder + 1;
        break;
    }

    saveHistory('调整顺序');
  }

  // 选择组件
  function selectComponent(id: string | string[], addToSelection = false) {
    if (Array.isArray(id)) {
      selectedIds.value = addToSelection ? [...new Set([...selectedIds.value, ...id])] : id;
    } else {
      if (addToSelection) {
        if (selectedIds.value.includes(id)) {
          selectedIds.value = selectedIds.value.filter((i) => i !== id);
        } else {
          selectedIds.value.push(id);
        }
      } else {
        selectedIds.value = [id];
      }
    }
  }

  function clearSelection() {
    selectedIds.value = [];
  }

  function selectAll() {
    selectedIds.value = currentDesign.value.components.map((c) => c.id);
  }

  // 数据源操作
  function addDataSource(dataSource: DataSource) {
    currentDesign.value.dataSources.push(dataSource);
    saveHistory('添加数据源');
  }

  function updateDataSource(id: string, updates: Partial<DataSource>) {
    const index = currentDesign.value.dataSources.findIndex((d) => d.id === id);
    if (index !== -1) {
      Object.assign(currentDesign.value.dataSources[index], updates);
    }
  }

  function removeDataSource(id: string) {
    currentDesign.value.dataSources = currentDesign.value.dataSources.filter((d) => d.id !== id);
    saveHistory('删除数据源');
  }

  function addDatabaseConnection(connection: DatabaseConnection) {
    currentDesign.value.databaseConnections.push(connection);
    saveHistory('添加数据库连接');
  }

  function removeDatabaseConnection(id: string) {
    currentDesign.value.databaseConnections = currentDesign.value.databaseConnections.filter(
      (c) => c.id !== id
    );
    saveHistory('删除数据库连接');
  }

  // 画布操作
  function updateCanvasSize(width: number, height: number) {
    currentDesign.value.width = width;
    currentDesign.value.height = height;
    currentDesign.value.updatedAt = new Date().toISOString();
    saveHistory('调整画布大小');
  }

  function updateCanvasStyle(updates: Partial<Pick<ReportDesign, 'backgroundColor'>>) {
    Object.assign(currentDesign.value, updates);
    currentDesign.value.updatedAt = new Date().toISOString();
  }

  // 设置
  function setScale(value: number) {
    scale.value = Math.max(0.1, Math.min(3, value));
  }

  function setHoveredId(id: string | null) {
    hoveredId.value = id;
  }

  // ============ Getters ============

  // 选中的组件
  const selectedComponents = computed(() => {
    return currentDesign.value.components.filter((c) => selectedIds.value.includes(c.id));
  });

  // 单个选中组件
  const singleSelectedComponent = computed(() => {
    return selectedIds.value.length === 1
      ? currentDesign.value.components.find((c) => c.id === selectedIds.value[0])
      : null;
  });

  // 悬停的组件
  const hoveredComponent = computed(() => {
    return hoveredId.value
      ? currentDesign.value.components.find((c) => c.id === hoveredId.value)
      : null;
  });

  // 可以撤销
  const canUndo = computed(() => historyIndex.value > 0);

  // 可以重做
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  // ============ Watchers ============

  // 监听设计变化，自动保存历史记录
  let saveTimeout: NodeJS.Timeout | null = null;
  watch(
    () => currentDesign.value,
    () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveHistory('自动保存');
      }, 500);
    },
    { deep: true }
  );

  // ============ Return ============

  return {
    // State
    currentDesign,
    history,
    historyIndex,
    selectedIds,
    hoveredId,
    scale,
    gridSize,
    showGrid,
    snapToGrid,

    // Actions
    initDesigner,
    saveHistory,
    undo,
    redo,
    createNewDesign,
    loadDesign,
    exportDesign,
    importDesign,
    addComponent,
    updateComponent,
    removeComponents,
    duplicateComponents,
    changeComponentOrder,
    selectComponent,
    clearSelection,
    selectAll,
    addDataSource,
    updateDataSource,
    removeDataSource,
    addDatabaseConnection,
    removeDatabaseConnection,
    updateCanvasSize,
    updateCanvasStyle,
    setScale,
    setHoveredId,

    // Getters
    selectedComponents,
    singleSelectedComponent,
    hoveredComponent,
    canUndo,
    canRedo,
  };
});
