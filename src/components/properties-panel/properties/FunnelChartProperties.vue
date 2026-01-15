<template>
  <el-form label-width="100px" size="small">
    <!-- 基础配置 -->
    <el-divider content-position="left">基础配置</el-divider>

    <el-form-item label="标题">
      <el-input v-model="localComponent.config.title" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标题字号">
      <el-input-number v-model="localComponent.config.titleFontSize" :min="12" :max="36" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标题颜色">
      <el-color-picker v-model="localComponent.config.titleColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="显示图例">
      <el-switch v-model="localComponent.config.showLegend" @change="handleChange" />
    </el-form-item>

    <el-form-item label="图例位置">
      <el-select v-model="localComponent.config.legendPosition" @change="handleChange">
        <el-option label="顶部" value="top" />
        <el-option label="底部" value="bottom" />
        <el-option label="左侧" value="left" />
        <el-option label="右侧" value="right" />
      </el-select>
    </el-form-item>

    <el-form-item label="主题">
      <el-select v-model="localComponent.config.theme" @change="handleChange">
        <el-option label="默认" value="default" />
        <el-option label="亮色" value="light" />
        <el-option label="暗色" value="dark" />
      </el-select>
    </el-form-item>

    <el-form-item label="背景色">
      <el-color-picker v-model="localComponent.config.backgroundColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="开启动画">
      <el-switch v-model="localComponent.config.animation" @change="handleChange" />
    </el-form-item>

    <el-form-item label="动画时长">
      <el-input-number v-model="localComponent.config.animationDuration" :min="0" :max="5000" :step="100" @change="handleChange" />
    </el-form-item>

    <!-- 系列配置 -->
    <el-divider content-position="left">系列配置</el-divider>

    <el-form-item label="显示标签">
      <el-switch v-model="localComponent.series.labelShow" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标签位置">
      <el-select v-model="localComponent.series.labelPosition" @change="handleChange">
        <el-option label="左侧" value="left" />
        <el-option label="右侧" value="right" />
        <el-option label="顶部" value="top" />
        <el-option label="底部" value="bottom" />
        <el-option label="内部" value="inside" />
        <el-option label="内部左侧" value="insideLeft" />
        <el-option label="内部右侧" value="insideRight" />
      </el-select>
    </el-form-item>

    <el-form-item label="标签字号">
      <el-input-number v-model="localComponent.series.labelFontSize" :min="10" :max="20" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标签颜色">
      <el-color-picker v-model="localComponent.series.labelColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="边框宽度">
      <el-input-number v-model="localComponent.series.itemStyleBorderWidth" :min="0" :max="5" :step="0.5" @change="handleChange" />
    </el-form-item>

    <el-form-item label="边框颜色">
      <el-color-picker v-model="localComponent.series.itemStyleBorderColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="圆角">
      <el-input-number v-model="localComponent.series.itemStyleBorderRadius" :min="0" :max="10" @change="handleChange" />
    </el-form-item>

    <!-- 漏斗图特有配置 -->
    <el-divider content-position="left">漏斗图配置</el-divider>

    <el-form-item label="排序方式">
      <el-select v-model="localComponent.sort" @change="handleChange">
        <el-option label="升序" value="ascending" />
        <el-option label="降序" value="descending" />
        <el-option label="不排序" value="none" />
      </el-select>
    </el-form-item>

    <el-form-item label="间距">
      <el-input-number v-model="localComponent.gap" :min="0" :max="50" @change="handleChange" />
    </el-form-item>

    <el-form-item label="左边距">
      <el-input v-model="localComponent.left" @change="handleChange" placeholder="如: 10%" />
    </el-form-item>

    <el-form-item label="上边距">
      <el-input v-model="localComponent.top" @change="handleChange" placeholder="如: 60" />
    </el-form-item>

    <el-form-item label="右边距">
      <el-input v-model="localComponent.right" @change="handleChange" placeholder="如: 10%" />
    </el-form-item>

    <el-form-item label="下边距">
      <el-input v-model="localComponent.bottom" @change="handleChange" placeholder="如: 60" />
    </el-form-item>

    <el-form-item label="宽度">
      <el-input v-model="localComponent.width" @change="handleChange" placeholder="如: 80%" />
    </el-form-item>

    <el-form-item label="高度">
      <el-input v-model="localComponent.height" @change="handleChange" placeholder="如: 80%" />
    </el-form-item>

    <!-- 数据源 -->
    <el-divider content-position="left">数据源</el-divider>

    <el-form-item label="数据源">
      <el-select
        v-model="selectedDataSourceId"
        placeholder="选择数据源"
        @change="handleDataSourceChange"
      >
        <el-option
          v-for="ds in dataSources"
          :key="ds.id"
          :label="ds.name"
          :value="ds.id"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, onMounted } from 'vue'
import type { FunnelChartComponent } from '../../../types'
import { currentDesign } from '../../../stores/designer'

const props = defineProps<{
  component: FunnelChartComponent
}>()

onMounted(() => {
  console.log('FunnelChartProperties mounted with:', props.component)
})

const emit = defineEmits<{
  (e: 'update'): void
}>()

const localComponent = reactive<FunnelChartComponent>({
  ...props.component,
  config: { ...props.component.config },
  series: { ...props.component.series },
})

const selectedDataSourceId = ref(props.component.dataSource?.id || '')

const dataSources = computed(() => currentDesign.value.dataSources)

watch(
  () => props.component,
  (newComponent) => {
    Object.assign(localComponent, newComponent)
    Object.assign(localComponent.config, newComponent.config)
    Object.assign(localComponent.series, newComponent.series)
    selectedDataSourceId.value = newComponent.dataSource?.id || ''
  },
  { deep: true }
)

function handleChange() {
  Object.assign(props.component.config, localComponent.config)
  Object.assign(props.component.series, localComponent.series)
  Object.assign(props.component, {
    sort: localComponent.sort,
    gap: localComponent.gap,
    left: localComponent.left,
    top: localComponent.top,
    right: localComponent.right,
    bottom: localComponent.bottom,
    width: localComponent.width,
    height: localComponent.height,
  })
  emit('update')
}

function handleDataSourceChange(dataSourceId: string) {
  const dataSource = dataSources.value.find(ds => ds.id === dataSourceId)
  props.component.dataSource = dataSource || null
  emit('update')
}
</script>
