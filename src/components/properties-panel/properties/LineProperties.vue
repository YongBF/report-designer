<template>
  <el-form label-width="80px" size="small">
    <el-form-item label="颜色">
      <el-color-picker v-model="localComponent.stroke" @change="handleChange" />
    </el-form-item>

    <el-form-item label="宽度">
      <el-input-number v-model="localComponent.strokeWidth" :min="1" :max="20" @change="handleChange" />
    </el-form-item>

    <el-form-item label="样式">
      <el-select v-model="localComponent.strokeStyle" @change="handleChange">
        <el-option label="实线" value="solid" />
        <el-option label="虚线" value="dashed" />
        <el-option label="点线" value="dotted" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { LineComponent } from '../../../../types'

const props = defineProps<{
  component: LineComponent
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const localComponent = reactive<LineComponent>({ ...props.component })

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
