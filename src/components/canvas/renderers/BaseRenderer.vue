<template>
  <div
    class="base-renderer canvas-component"
    :class="{ selected, hovered }"
    :style="rendererStyle"
    @mousedown="$emit('mousedown', $event)"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <slot />

    <!-- 选择框 -->
    <template v-if="selected">
      <div class="selection-handle bottom" @mousedown.stop="startResize('bottom', $event)" />
      <div class="selection-border" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { scale, updateComponent } from '../../../stores/designer';

const props = defineProps<{
  component: any;
  selected?: boolean;
  hovered?: boolean;
}>();

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void;
  (e: 'mouseenter'): void;
  (e: 'mouseleave'): void;
  (e: 'update', id: string, updates: any): void;
}>();

// 渲染器样式
const rendererStyle = computed(() => ({
  width: '100%',
  height: '100%',
  opacity: props.component.visible ? (props.component.opacity ?? 1) : 0.3,
  cursor: props.component.locked ? 'not-allowed' : 'default',
  pointerEvents: props.component.locked ? 'none' : 'auto',
}));

// 调整大小相关
const isResizing = ref(false);
const resizeDirection = ref('');
const resizeStartPos = ref({ x: 0, y: 0 });
const resizeStartSize = ref({ height: 0 });

function startResize(direction: string, e: MouseEvent) {
  if (props.component.locked) return;

  isResizing.value = true;
  resizeDirection.value = direction;
  resizeStartPos.value = { x: e.clientX, y: e.clientY };
  resizeStartSize.value = {
    height: props.component.height,
  };

  document.addEventListener('mousemove', handleResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);
}

function handleResizeMove(e: MouseEvent) {
  if (!isResizing.value) return;

  const dy = (e.clientY - resizeStartPos.value.y) / scale.value;

  const updates: any = {};

  // 只允许调整高度
  if (resizeDirection.value === 'bottom') {
    updates.height = Math.max(50, resizeStartSize.value.height + dy);
  }

  emit('update', props.component.id, updates);
}

function handleResizeEnd() {
  isResizing.value = false;
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);
}
</script>

<style scoped>
.base-renderer {
  box-sizing: border-box;
  transition: box-shadow 0.2s ease;
}

.base-renderer.hovered {
  outline: 1px dashed #409eff;
}

.base-renderer.selected {
  outline: 2px solid #409eff;
}

.selection-border {
  position: absolute;
  inset: 0;
  border: 2px solid #409eff;
  pointer-events: none;
}

.selection-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: white;
  border: 2px solid #409eff;
  border-radius: 2px;
  z-index: 1;
}

.selection-handle.top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.selection-handle.top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.selection-handle.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.selection-handle.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}

.selection-handle.top {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.selection-handle.bottom {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: ns-resize;
}

.selection-handle.left {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}

.selection-handle.right {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: ew-resize;
}
</style>
