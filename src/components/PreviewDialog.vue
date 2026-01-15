<template>
  <el-dialog
    v-model="visible"
    title="预览"
    width="90%"
    top="5vh"
    :fullscreen="fullscreen"
    @close="handleClose"
  >
    <template #header>
      <div class="preview-header">
        <span>预览</span>
        <el-button :icon="fullscreen ? ExitFullScreen :FullScreen" circle @click="toggleFullscreen" />
      </div>
    </template>

    <div class="preview-container" :class="{ fullscreen }">
      <div
        ref="previewRef"
        class="preview-content"
        :style="contentStyle"
      >
        <!-- 渲染所有组件 -->
        <template v-for="component in sortedComponents" :key="component.id">
          <component
            :is="getComponentRenderer(component.type)"
            :component="component"
            :selected="false"
            :hovered="false"
          />
        </template>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FullScreen, ExitFullScreen } from '@element-plus/icons-vue'
import { currentDesign } from '../stores/designer'
import type { Component } from '../types'
import TextRenderer from './canvas/renderers/TextRenderer.vue'
import ImageRenderer from './canvas/renderers/ImageRenderer.vue'
import TableRenderer from './canvas/renderers/TableRenderer.vue'
import ChartRenderer from './canvas/renderers/ChartRenderer.vue'
import RectangleRenderer from './canvas/renderers/RectangleRenderer.vue'
import LineRenderer from './canvas/renderers/LineRenderer.vue'

const visible = defineModel<boolean>()
const fullscreen = ref(false)
const previewRef = ref<HTMLElement>()

// 按 zIndex 排序的组件
const sortedComponents = computed(() => {
  return [...currentDesign.value.components].sort(
    (a, b) => a.zIndex - b.zIndex
  )
})

// 预览内容样式
const contentStyle = computed(() => ({
  width: `${currentDesign.value.width}px`,
  minHeight: `${currentDesign.value.height}px`,
  backgroundColor: currentDesign.value.backgroundColor,
  margin: '0 auto',
  position: 'relative',
}))

// 获取组件渲染器
function getComponentRenderer(type: Component['type']) {
  const renderers: Record<Component['type'], any> = {
    text: TextRenderer,
    image: ImageRenderer,
    table: TableRenderer,
    chart: ChartRenderer,
    rectangle: RectangleRenderer,
    line: LineRenderer,
  }
  return renderers[type]
}

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value
}

function handleClose() {
  visible.value = false
  fullscreen.value = false
}
</script>

<style scoped>
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.preview-container {
  height: 70vh;
  overflow: auto;
  background-color: #f5f5f5;
  padding: 20px;
}

.preview-container.fullscreen {
  height: 90vh;
}

.preview-content {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
