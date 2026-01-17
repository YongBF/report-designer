<!--
  BasePropertiesPanel.vue

  基础属性面板

  所有组件通用的基础属性：
  - 宽度
  - 高度
  - 排序
  - 可见性
  - 锁定状态

  @component BasePropertiesPanel
  @author Report Designer Team
  @since 2026-01-17
-->
<template>
  <el-collapse-item title="基础属性" name="basic">
    <el-form label-width="100px" size="small">
      <el-form-item label="宽度">
        <el-select
          :model-value="component.widthPercent"
          @update:model-value="handleUpdate('widthPercent', $event)"
        >
          <el-option label="100%" value="100" />
          <el-option label="50%" value="50" />
          <el-option label="33%" value="33" />
        </el-select>
      </el-form-item>

      <el-form-item label="高度">
        <el-input-number
          :model-value="component.height"
          :min="50"
          :max="2000"
          @update:model-value="handleUpdate('height', $event)"
        />
      </el-form-item>

      <el-form-item label="排序">
        <el-input-number
          :model-value="component.order"
          :min="0"
          @update:model-value="handleUpdate('order', $event)"
        />
      </el-form-item>

      <el-form-item label="可见">
        <el-switch
          :model-value="component.visible"
          @update:model-value="handleUpdate('visible', $event)"
        />
      </el-form-item>

      <el-form-item label="锁定">
        <el-switch
          :model-value="component.locked"
          @update:model-value="handleUpdate('locked', $event)"
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
/* 使用 el-collapse-item 默认样式 */
</style>
