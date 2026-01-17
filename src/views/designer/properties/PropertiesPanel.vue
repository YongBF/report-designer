<!--
  PropertiesPanel.vue

  属性面板容器组件

  右侧面板，用于配置选中组件的属性。
  根据组件类型动态显示不同的配置项。

  @component PropertiesPanel
  @author Report Designer Team
  @since 2026-01-17
-->
<template>
  <div class="right-panel">
    <div class="panel-header">
      <h3>属性面板</h3>
    </div>
    <div class="panel-content">
      <el-empty v-if="!selectedComponent" description="请选择一个组件" />
      <el-collapse v-else v-model="activePanel" accordion>
        <!-- 组件信息 -->
        <ComponentInfoPanel
          :component="selectedComponent"
          @update="handleUpdate"
        />

        <!-- 基础属性 -->
        <BasePropertiesPanel
          :component="selectedComponent"
          @update="handleUpdate"
        />

        <!-- 类型特定属性 -->
        <TypePropertiesPanel
          :type="selectedComponent.type"
          :component="selectedComponent"
          @update="handleUpdate"
        />

        <!-- 组件联动 -->
        <ComponentLinkageConfig
          :component="selectedComponent"
          :all-components="allComponents"
          :linkage-manager="linkageManager"
          @update="handleUpdate"
        />

        <!-- 操作 -->
        <el-collapse-item title="操作" name="actions">
          <el-button type="danger" :icon="Delete" style="width: 100%" @click="handleDelete">
            删除组件
          </el-button>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Delete } from '@element-plus/icons-vue';
import type { Component as ComponentType } from '@/types';
import ComponentLinkageConfig from '@/components/properties-panel/common/ComponentLinkageConfig.vue';
import ComponentInfoPanel from './ComponentInfoPanel.vue';
import BasePropertiesPanel from './BasePropertiesPanel.vue';
import TypePropertiesPanel from './TypePropertiesPanel.vue';

// Props
interface Props {
  selectedComponent: ComponentType | null;
  allComponents: ComponentType[];
  linkageManager: any;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [id: string, data: any];
  delete: [];
}>();

// State
const activePanel = ref('info');

// Methods
function handleUpdate(id: string, data: any) {
  emit('update', id, data);
}

function handleDelete() {
  emit('delete');
}
</script>

<style scoped>
.right-panel {
  width: 320px;
  background-color: #ffffff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background-color: #c0c4cc;
}
</style>
