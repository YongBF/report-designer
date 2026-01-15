<template>
  <BaseRenderer
    :component="component"
    :selected="selected"
    :hovered="hovered"
    @mousedown="$emit('mousedown', $event)"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @update="(id, updates) => $emit('update', id, updates)"
  >
    <div class="image-container" :style="containerStyle">
      <img
        v-if="component.src"
        :src="component.src"
        :style="imageStyle"
        alt=""
        @error="handleImageError"
      />
      <div v-else class="image-placeholder">
        <el-icon><Picture /></el-icon>
        <span>点击选择图片</span>
      </div>
    </div>
  </BaseRenderer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import BaseRenderer from './BaseRenderer.vue'
import type { ImageComponent } from '../../../types'

const props = defineProps<{
  component: ImageComponent
  selected?: boolean
  hovered?: boolean
}>()

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void
  (e: 'mouseenter'): void
  (e: 'mouseleave'): void
  (e: 'update', id: string, updates: any): void
}>()

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  borderRadius: `${props.component.borderRadius}px`,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const imageStyle = computed(() => ({
  width: '100%',
  height: '100%',
  objectFit: props.component.fit,
}))

function handleImageError() {
  console.error('图片加载失败:', props.component.src)
}
</script>

<style scoped>
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 14px;
  cursor: pointer;
}

.image-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
</style>
