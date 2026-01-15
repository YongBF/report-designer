<template>
  <el-form label-width="80px" size="small">
    <el-form-item label="内容">
      <el-input v-model="localComponent.content" type="textarea" @change="handleChange" />
    </el-form-item>

    <el-form-item label="字号">
      <el-input-number v-model="localComponent.fontSize" :min="8" :max="72" @change="handleChange" />
    </el-form-item>

    <el-form-item label="字体">
      <el-select v-model="localComponent.fontFamily" @change="handleChange">
        <el-option label="Arial" value="Arial" />
        <el-option label="宋体" value="SimSun" />
        <el-option label="黑体" value="SimHei" />
        <el-option label="微软雅黑" value="Microsoft YaHei" />
        <el-option label="楷体" value="KaiTi" />
      </el-select>
    </el-form-item>

    <el-form-item label="颜色">
      <el-color-picker v-model="localComponent.color" @change="handleChange" />
    </el-form-item>

    <el-form-item label="字重">
      <el-select v-model="localComponent.fontWeight" @change="handleChange">
        <el-option label="正常" :value="400" />
        <el-option label="粗体" :value="700" />
      </el-select>
    </el-form-item>

    <el-form-item label="样式">
      <el-select v-model="localComponent.fontStyle" @change="handleChange">
        <el-option label="正常" value="normal" />
        <el-option label="斜体" value="italic" />
      </el-select>
    </el-form-item>

    <el-form-item label="对齐">
      <el-select v-model="localComponent.textAlign" @change="handleChange">
        <el-option label="左对齐" value="left" />
        <el-option label="居中" value="center" />
        <el-option label="右对齐" value="right" />
      </el-select>
    </el-form-item>

    <el-form-item label="行高">
      <el-input-number v-model="localComponent.lineHeight" :min="1" :max="3" :step="0.1" @change="handleChange" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { TextComponent } from '../../../../types'

const props = defineProps<{
  component: TextComponent
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const localComponent = reactive<TextComponent>({ ...props.component })

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
