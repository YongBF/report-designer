/**
 * Toolbar Actions Composable
 *
 * 工具栏操作封装
 *
 * @module composables/useToolbarActions
 * @author Report Designer Team
 * @since 2026-01-17
 */

import { useDesignerStore } from '@/stores/pinia';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export function useToolbarActions() {
  const designerStore = useDesignerStore();
  const router = useRouter();

  /**
   * 新建设计
   */
  function handleNew() {
    designerStore.createNewDesign();
    ElMessage.success('已创建新设计');
  }

  /**
   * 撤销
   */
  function handleUndo() {
    const success = designerStore.undo();
    if (success) {
      ElMessage.info('已撤销');
    }
  }

  /**
   * 重做
   */
  function handleRedo() {
    const success = designerStore.redo();
    if (success) {
      ElMessage.info('已重做');
    }
  }

  /**
   * 保存
   */
  function handleSave() {
    designerStore.saveHistory('手动保存');
    const design = designerStore.exportDesign();
    localStorage.setItem('report_designer_current', JSON.stringify(design));
    ElMessage.success('设计已保存到本地存储');
  }

  /**
   * 预览
   */
  function handlePreview() {
    const designId = designerStore.currentDesign?.id || 'design-1';
    const url = `/preview/${designId}`;
    window.open(url, '_blank');
  }

  /**
   * 返回编辑器
   */
  function goBack() {
    router.push('/');
  }

  return {
    handleNew,
    handleUndo,
    handleRedo,
    handleSave,
    handlePreview,
    goBack,
  };
}

export default useToolbarActions;
