<template>
  <el-form label-width="80px" size="small">
    <el-form-item label="图片源">
      <el-input v-model="localComponent.src" placeholder="输入图片 URL" @change="handleChange" />
    </el-form-item>

    <el-form-item label="适应方式">
      <el-select v-model="localComponent.fit" @change="handleChange">
        <el-option label="填充" value="fill" />
        <el-option label="包含" value="contain" />
        <el-option label="覆盖" value="cover" />
        <el-option label="无" value="none" />
      </el-select>
    </el-form-item>

    <el-form-item label="透明度">
      <el-slider v-model="localComponent.opacity" :min="0" :max="1" :step="0.01" @change="handleChange" />
    </el-form-item>

    <el-form-item label="圆角">
      <el-input-number v-model="localComponent.borderRadius" :min="0" @change="handleChange" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ImageComponent } from '../../../../types'

const props = defineProps<{
  component: ImageComponent
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const localComponent = reactive<ImageComponent>({ ...props.component })

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
