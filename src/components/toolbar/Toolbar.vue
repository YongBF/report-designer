<template>
  <div class="toolbar">
    <div class="toolbar-group">
      <el-tooltip content="新建 (Ctrl+N)" placement="bottom">
        <el-button :icon="DocumentAdd" @click="handleNew" />
      </el-tooltip>

      <el-tooltip content="打开 (Ctrl+O)" placement="bottom">
        <el-button :icon="FolderOpened" @click="handleOpen" />
      </el-tooltip>

      <el-tooltip content="保存 (Ctrl+S)" placement="bottom">
        <el-button :icon="DocumentCopy" @click="handleSave" />
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
        <el-button :icon="Back" :disabled="!canUndo" @click="handleUndo" />
      </el-tooltip>

      <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
        <el-button :icon="Right" :disabled="!canRedo" @click="handleRedo" />
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip content="删除 (Delete)" placement="bottom">
        <el-button :icon="Delete" :disabled="!hasSelection" @click="handleDelete" />
      </el-tooltip>

      <el-tooltip content="复制 (Ctrl+C)" placement="bottom">
        <el-button :icon="CopyDocument" :disabled="!hasSelection" @click="handleCopy" />
      </el-tooltip>

      <el-tooltip content="粘贴 (Ctrl+V)" placement="bottom">
        <el-button :icon="Tickets" @click="handlePaste" />
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-dropdown @command="handleLayerCommand">
        <el-button :icon="Layers">
          图层<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="toFront">置于顶层</el-dropdown-item>
            <el-dropdown-item command="toBack">置于底层</el-dropdown-item>
            <el-dropdown-item command="front">上移一层</el-dropdown-item>
            <el-dropdown-item command="back">下移一层</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip content="数据源" placement="bottom">
        <el-button :icon="Connection" @click="showDataSourceManager" />
      </el-tooltip>

      <el-tooltip content="预览 (F5)" placement="bottom">
        <el-button :icon="View" @click="handlePreview" />
      </el-tooltip>

      <el-dropdown @command="handleExport">
        <el-button :icon="Download">
          导出<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="json">JSON</el-dropdown-item>
            <el-dropdown-item command="pdf">PDF</el-dropdown-item>
            <el-dropdown-item command="png">PNG</el-dropdown-item>
            <el-dropdown-item command="excel">Excel</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip content="缩小 (-)" placement="bottom">
        <el-button :icon="ZoomOut" @click="handleZoomOut" />
      </el-tooltip>

      <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>

      <el-tooltip content="放大 (+)" placement="bottom">
        <el-button :icon="ZoomIn" @click="handleZoomIn" />
      </el-tooltip>

      <el-button @click="handleResetZoom">重置</el-button>
    </div>

    <!-- 数据源管理对话框 -->
    <DataSourceManager v-model="dataSourceManagerVisible" />

    <!-- 预览对话框 -->
    <PreviewDialog v-model="previewVisible" />

    <!-- 文件上传对话框 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  DocumentAdd,
  FolderOpened,
  DocumentCopy,
  Back,
  Right,
  Delete,
  CopyDocument,
  Tickets,
  Layers,
  Connection,
  View,
  Download,
  ArrowDown,
  ZoomIn,
  ZoomOut,
} from '@element-plus/icons-vue';
import {
  canUndo,
  canRedo,
  selectedIds,
  scale,
  undo,
  redo,
  removeComponents,
  duplicateComponents,
  changeComponentOrder,
  createNewDesign,
  exportDesign,
  importDesign,
  setScale,
  updateCanvasSize,
} from '../stores/pinia';
import { ElMessageBox, ElMessage } from 'element-plus';
import DataSourceManager from '../DataSourceManager.vue';
import PreviewDialog from '../PreviewDialog.vue';
import { exportToFile } from '../../utils/export';

const dataSourceManagerVisible = ref(false);
const previewVisible = ref(false);
const fileInputRef = ref<HTMLInputElement>();

const hasSelection = computed(() => selectedIds.value.length > 0);

// 新建
function handleNew() {
  ElMessageBox.confirm('确定要新建报表吗？未保存的更改将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    createNewDesign();
    ElMessage.success('已新建报表');
  });
}

// 打开
function handleOpen() {
  fileInputRef.value?.click();
}

// 保存
function handleSave() {
  const design = exportDesign();
  const json = JSON.stringify(design, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${design.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success('报表已保存');
}

// 撤销
function handleUndo() {
  undo();
}

// 重做
function handleRedo() {
  redo();
}

// 删除
function handleDelete() {
  if (selectedIds.value.length === 0) return;
  removeComponents(selectedIds.value);
}

// 复制
function handleCopy() {
  if (selectedIds.value.length === 0) return;
  duplicateComponents(selectedIds.value);
}

// 粘贴
function handlePaste() {
  ElMessage.info('请使用 Ctrl+C 复制组件后再粘贴');
}

// 图层操作
function handleLayerCommand(command: string) {
  if (selectedIds.value.length === 0) return;
  selectedIds.value.forEach((id) => {
    changeComponentOrder(id, command as any);
  });
}

// 数据源管理
function showDataSourceManager() {
  dataSourceManagerVisible.value = true;
}

// 预览
function handlePreview() {
  previewVisible.value = true;
}

// 导出
function handleExport(format: string) {
  exportToFile(format as any);
}

// 缩放
function handleZoomIn() {
  setScale(scale.value + 0.1);
}

function handleZoomOut() {
  setScale(scale.value - 0.1);
}

function handleResetZoom() {
  setScale(1);
}

// 文件上传
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const design = JSON.parse(e.target?.result as string);
      importDesign(design);
      ElMessage.success('报表已加载');
    } catch (err) {
      ElMessage.error('文件格式错误');
    }
  };
  reader.readAsText(file);

  target.value = '';
}

// 键盘快捷键
function handleKeydown(e: KeyboardEvent) {
  // Ctrl+N: 新建
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault();
    handleNew();
  }
  // Ctrl+O: 打开
  if (e.ctrlKey && e.key === 'o') {
    e.preventDefault();
    handleOpen();
  }
  // Ctrl+S: 保存
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    handleSave();
  }
  // Ctrl+Z: 撤销
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    handleUndo();
  }
  // Ctrl+Y: 重做
  if (e.ctrlKey && e.key === 'y') {
    e.preventDefault();
    handleRedo();
  }
  // Delete: 删除
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (
      document.activeElement?.tagName !== 'INPUT' &&
      document.activeElement?.tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
      handleDelete();
    }
  }
  // F5: 预览
  if (e.key === 'F5') {
    e.preventDefault();
    handlePreview();
  }
  // Ctrl+C: 复制
  if (e.ctrlKey && e.key === 'c') {
    if (
      document.activeElement?.tagName !== 'INPUT' &&
      document.activeElement?.tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
      handleCopy();
    }
  }
  // Ctrl+V: 粘贴
  if (e.ctrlKey && e.key === 'v') {
    if (
      document.activeElement?.tagName !== 'INPUT' &&
      document.activeElement?.tagName !== 'TEXTAREA'
    ) {
      e.preventDefault();
      handlePaste();
    }
  }
  // +: 放大
  if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    handleZoomIn();
  }
  // -: 缩小
  if (e.key === '-') {
    e.preventDefault();
    handleZoomOut();
  }
}

// 添加键盘事件监听
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown);
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  gap: 8px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-level {
  min-width: 50px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}
</style>
