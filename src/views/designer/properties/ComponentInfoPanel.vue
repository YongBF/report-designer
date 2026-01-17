<!--
  ComponentInfoPanel.vue

  组件信息属性面板

  显示组件的基本信息：
  - 组件名称
  - 组件类型
  - 组件ID

  @component ComponentInfoPanel
  @author Report Designer Team
  @since 2026-01-17
-->
<template>
  <el-collapse-item title="组件信息" name="info">
    <el-form label-width="100px" size="small">
      <el-form-item label="组件名称">
        <el-input
          :model-value="component.name"
          placeholder="为组件设置一个名称，方便在联动配置中识别"
          clearable
          @update:model-value="handleUpdate('name', $event)"
        />
        <div class="form-item-help">
          此名称将显示在联动配置的组件列表中
        </div>
      </el-form-item>

      <el-form-item label="组件类型">
        <el-input
          :model-value="component.type"
          disabled
          style="font-family: monospace; font-size: 12px;"
        />
      </el-form-item>

      <el-form-item label="组件ID">
        <el-input
          :model-value="component.id"
          disabled
          style="font-family: monospace; font-size: 12px;"
        />
      </el-form-item>
    </el-form>
  </el-collapse-item>
</template>

<script setup lang="ts">
import type { Component } from '@/types';

// Props
interface Props {
  component: Component;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [field: string, value: any];
}>();

// Methods
function handleUpdate(field: string, value: any) {
  emit('update', field, value);
}
</script>

<style scoped>
.form-item-help {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
