<!--
  DesignerToolbar.vue

  设计器工具栏组件

  提供设计器的顶部操作按钮：
  - 新建、撤销、重做、保存、预览

  @component DesignerToolbar
  @author Report Designer Team
  @since 2026-01-17
-->
<template>
  <div class="toolbar" data-testid="toolbar">
    <el-button :icon="DocumentAdd" data-testid="btn-new" @click="handleNew">新建</el-button>
    <el-button :disabled="!canUndo" :icon="Back" data-testid="btn-undo" @click="handleUndo">撤销</el-button>
    <el-button :disabled="!canRedo" :icon="Right" data-testid="btn-redo" @click="handleRedo">重做</el-button>
    <el-button :icon="Download" data-testid="btn-save" @click="handleSave">保存</el-button>
    <el-button :icon="View" data-testid="btn-preview" @click="handlePreview">预览</el-button>
    <el-divider direction="vertical" />
    <span class="toolbar-hint">
      💡 提示：点击组件选中后，拖拽蓝色手柄可移动组件
    </span>
  </div>
</template>

<script setup lang="ts">
import { DocumentAdd, Back, Right, Download, View } from '@element-plus/icons-vue';
import { useDesignerStore } from '@/stores/pinia';
import { useRouter } from 'vue-router';

// Props
interface Props {
  canUndo?: boolean;
  canRedo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canUndo: false,
  canRedo: false,
});

// Emits
const emit = defineEmits<{
  new: [];
  undo: [];
  redo: [];
  save: [];
  preview: [];
}>();

// Store 和 Router
const designerStore = useDesignerStore();
const router = useRouter();

// 事件处理
function handleNew() {
  emit('new');
}

function handleUndo() {
  emit('undo');
}

function handleRedo() {
  emit('redo');
}

function handleSave() {
  emit('save');
}

function handlePreview() {
  // 在新页签中打开预览页面
  const designId = designerStore.currentDesign?.id || 'design-1';
  const url = `/preview/${designId}`;
  window.open(url, '_blank');
  emit('preview');
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.toolbar-hint {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}
</style>
