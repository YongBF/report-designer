/**
 * useTableConfig.ts
 *
 * 表格组件配置相关的 composable
 *
 * 功能包括：
 * - 表格列管理（添加、删除、移动）
 * - 静态数据编辑
 * - 数据源配置
 *
 * @module composables/useTableConfig
 * @author Report Designer Team
 * @since 2025-01-15
 */

import { ref, computed } from 'vue';
import { saveHistory, updateComponent } from '../stores/designer';
import type { Component } from '../types';

/**
 * 表格配置操作的 composable
 *
 * @param selectedComponent - 选中的组件
 */
export function useTableConfig(selectedComponent: any) {
  // 表格配置状态
  const tableCollapseActive = ref(['basic']);
  const tableDataSourceType = ref('static');
  const tableApiUrl = ref('');
  const tableApiMethod = ref('GET');
  const tableDataPath = ref('');
  const staticData = ref<Record<string, any>[]>([]);
  const staticDataEditorVisible = ref(false);

  // 静态数据预览
  const staticDataPreview = computed(() => {
    return staticData.value.slice(0, 5);
  });

  /**
   * 添加表格列
   */
  function addTableColumn() {
    if (!selectedComponent.value || selectedComponent.value.type !== 'table') return;

    const table = selectedComponent.value as any;
    const newColumn = {
      id: `col-${Date.now()}`,
      field: `field${table.columns.length + 1}`,
      label: `列${table.columns.length + 1}`,
      width: 100,
      align: 'left' as const,
      fixed: '' as string | undefined,
    };
    table.columns.push(newColumn);
    saveHistory('添加列');
  }

  /**
   * 删除表格列
   */
  function removeTableColumn(index: number) {
    if (!selectedComponent.value || selectedComponent.value.type !== 'table') return;

    const table = selectedComponent.value as any;
    table.columns.splice(index, 1);
    saveHistory('删除列');
  }

  /**
   * 移动表格列
   */
  function moveTableColumn(index: number, direction: 'up' | 'down') {
    if (!selectedComponent.value || selectedComponent.value.type !== 'table') return;

    const table = selectedComponent.value as any;
    if (direction === 'up' && index > 0) {
      const temp = table.columns[index];
      table.columns[index] = table.columns[index - 1];
      table.columns[index - 1] = temp;
    } else if (direction === 'down' && index < table.columns.length - 1) {
      const temp = table.columns[index];
      table.columns[index] = table.columns[index + 1];
      table.columns[index + 1] = temp;
    }
    saveHistory('移动列');
  }

  /**
   * 打开静态数据编辑器
   */
  function openStaticDataEditor() {
    if (!selectedComponent.value || selectedComponent.value.type !== 'table') return;

    const table = selectedComponent.value as any;
    if (table.dataSource?.staticData) {
      staticData.value = [...table.dataSource.staticData];
    } else {
      // 根据列生成默认数据
      staticData.value = Array.from({ length: 3 }, (_, i) => {
        const row: Record<string, any> = {};
        table.columns.forEach((col: any) => {
          row[col.field] = `数据${i + 1}`;
        });
        return row;
      });
    }
    staticDataEditorVisible.value = true;
  }

  /**
   * 添加静态数据行
   */
  function addStaticDataRow() {
    if (!selectedComponent.value || selectedComponent.value.type !== 'table') return;

    const table = selectedComponent.value as any;
    const newRow: Record<string, any> = {};
    table.columns.forEach((col: any) => {
      newRow[col.field] = '';
    });
    staticData.value.push(newRow);
  }

  /**
   * 删除静态数据行
   */
  function removeStaticDataRow(index: number) {
    staticData.value.splice(index, 1);
  }

  /**
   * 清空静态数据
   */
  function clearStaticData() {
    staticData.value = [];
  }

  /**
   * 取消静态数据编辑
   */
  function handleStaticDataCancel() {
    staticDataEditorVisible.value = false;
  }

  /**
   * 保存静态数据
   */
  function handleStaticDataSave() {
    if (!selectedComponent.value || selectedComponent.value.type !== 'table') return;

    const table = selectedComponent.value as any;

    // 使用 updateComponent 确保响应式更新
    updateComponent(table.id, {
      dataSource: {
        ...table.dataSource,
        staticData: [...staticData.value],
      },
    });

    staticDataEditorVisible.value = false;
    saveHistory('更新静态数据');
  }

  return {
    // 状态
    tableCollapseActive,
    tableDataSourceType,
    tableApiUrl,
    tableApiMethod,
    tableDataPath,
    staticData,
    staticDataEditorVisible,
    staticDataPreview,
    // 方法
    addTableColumn,
    removeTableColumn,
    moveTableColumn,
    openStaticDataEditor,
    addStaticDataRow,
    removeStaticDataRow,
    clearStaticData,
    handleStaticDataCancel,
    handleStaticDataSave,
  };
}
