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
    <div class="rectangle-content" :style="rectangleStyle" />
  </BaseRenderer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseRenderer from './BaseRenderer.vue'
import type { RectangleComponent } from '../../../types'

const props = defineProps<{
  component: RectangleComponent
  selected?: boolean
  hovered?: boolean
}>()

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void
  (e: 'mouseenter'): void
  (e: 'mouseleave'): void
  (e: 'update', id: string, updates: any): void
}>()

const rectangleStyle = computed(() => ({
  width: '100%',
  height: '100%',
  backgroundColor: props.component.backgroundColor,
  border: `${props.component.borderWidth}px ${props.component.borderStyle} ${props.component.borderColor}`,
  borderRadius: `${props.component.borderRadius}px`,
}))
</script>

<style scoped>
.rectangle-content {
  box-sizing: border-box;
}
</style>
