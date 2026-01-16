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
    <div class="text-content" :style="textStyle" @dblclick="handleDoubleClick">
      {{ component.content }}
    </div>
  </BaseRenderer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseRenderer from './BaseRenderer.vue';
import type { TextComponent } from '../../../types';

const props = defineProps<{
  component: TextComponent;
  selected?: boolean;
  hovered?: boolean;
}>();

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void;
  (e: 'mouseenter'): void;
  (e: 'mouseleave'): void;
  (e: 'update', id: string, updates: any): void;
}>();

const editing = ref(false);

const textStyle = computed(() => ({
  fontSize: `${props.component.fontSize}px`,
  fontFamily: props.component.fontFamily,
  color: props.component.color,
  fontWeight: props.component.fontWeight,
  fontStyle: props.component.fontStyle,
  textAlign: props.component.textAlign as any,
  lineHeight: props.component.lineHeight,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  wordBreak: 'break-word',
}));

function handleDoubleClick() {
  if (props.component.locked) return;

  const newContent = prompt('编辑文本内容:', props.component.content);
  if (newContent !== null) {
    emit('update', props.component.id, { content: newContent });
  }
}
</script>

<style scoped>
.text-content {
  user-select: text;
}
</style>
