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
    <div class="line-content" :style="lineStyle" />
  </BaseRenderer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseRenderer from './BaseRenderer.vue'
import type { LineComponent } from '../../../types'

const props = defineProps<{
  component: LineComponent
  selected?: boolean
  hovered?: boolean
}>()

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void
  (e: 'mouseenter'): void
  (e: 'mouseleave'): void
  (e: 'update', id: string, updates: any): void
}>()

const lineStyle = computed(() => ({
  width: '100%',
  height: '100%',
  borderTop: `${props.component.strokeWidth}px ${props.component.strokeStyle} ${props.component.stroke}`,
}))
</script>

<style scoped>
.line-content {
  box-sizing: border-box;
}
</style>
