<template>
  <el-form label-width="80px" size="small">
    <el-form-item label="显示表头">
      <el-switch v-model="localComponent.showHeader" @change="handleChange" />
    </el-form-item>

    <el-form-item label="斑马纹">
      <el-switch v-model="localComponent.stripe" @change="handleChange" />
    </el-form-item>

    <el-form-item label="边框">
      <el-switch v-model="localComponent.border" @change="handleChange" />
    </el-form-item>

    <el-form-item label="表头背景">
      <el-color-picker v-model="localComponent.headerBackgroundColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="表头文字">
      <el-color-picker v-model="localComponent.headerColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="字号">
      <el-input-number
        v-model="localComponent.fontSize"
        :min="10"
        :max="24"
        @change="handleChange"
      />
    </el-form-item>

    <el-divider>列配置</el-divider>

    <div v-for="(column, index) in localComponent.columns" :key="column.id" class="column-config">
      <el-form-item label="列名">
        <el-input v-model="column.label" @change="handleChange" />
      </el-form-item>
      <el-form-item label="字段">
        <el-input v-model="column.field" @change="handleChange" />
      </el-form-item>
      <el-form-item label="宽度">
        <el-input-number v-model="column.width" :min="50" @change="handleChange" />
      </el-form-item>
      <el-form-item label="对齐">
        <el-select v-model="column.align" @change="handleChange">
          <el-option label="左" value="left" />
          <el-option label="中" value="center" />
          <el-option label="右" value="right" />
        </el-select>
      </el-form-item>
      <el-button type="danger" size="small" @click="removeColumn(index)">删除列</el-button>
      <el-divider />
    </div>

    <el-button type="primary" size="small" @click="addColumn">添加列</el-button>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { TableComponent, TableColumn } from '../../../types';
import { generateId } from '../../../utils';

const props = defineProps<{
  component: TableComponent;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const localComponent = reactive<TableComponent>({ ...props.component });

watch(
  () => props.component,
  (newComponent) => {
    Object.assign(localComponent, newComponent);
  },
  { deep: true }
);

function handleChange() {
  Object.assign(props.component, localComponent);
  emit('update');
}

function addColumn() {
  const newColumn: TableColumn = {
    id: generateId(),
    field: `field${localComponent.columns.length + 1}`,
    label: `列${localComponent.columns.length + 1}`,
    width: 100,
    align: 'left',
  };
  localComponent.columns.push(newColumn);
  handleChange();
}

function removeColumn(index: number) {
  localComponent.columns.splice(index, 1);
  handleChange();
}
</script>

<style scoped>
.column-config {
  background-color: white;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}
</style>
