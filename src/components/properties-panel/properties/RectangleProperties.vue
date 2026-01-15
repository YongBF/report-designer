<template>
  <el-form label-width="80px" size="small">
    <el-form-item label="背景色">
      <el-color-picker v-model="localComponent.backgroundColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="边框色">
      <el-color-picker v-model="localComponent.borderColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="边框宽度">
      <el-input-number v-model="localComponent.borderWidth" :min="0" :max="20" @change="handleChange" />
    </el-form-item>

    <el-form-item label="边框样式">
      <el-select v-model="localComponent.borderStyle" @change="handleChange">
        <el-option label="实线" value="solid" />
        <el-option label="虚线" value="dashed" />
        <el-option label="点线" value="dotted" />
        <el-option label="无边框" value="none" />
      </el-select>
    </el-form-item>

    <el-form-item label="圆角">
      <el-input-number v-model="localComponent.borderRadius" :min="0" @change="handleChange" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { RectangleComponent } from '../../../../types'

const props = defineProps<{
  component: RectangleComponent
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const localComponent = reactive<RectangleComponent>({ ...props.component })

watch(
  () => props.component,
  (newComponent) => {
    Object.assign(localComponent, newComponent)
  },
  { deep: true }
)

function handleChange() {
  Object.assign(props.component, localComponent)
  emit('update')
}
</script>
