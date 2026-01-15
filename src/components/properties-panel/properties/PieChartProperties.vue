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
        <el-option label="外部" value="outside" />
        <el-option label="内部" value="inside" />
        <el-option label="内部顶部" value="insideTop" />
        <el-option label="内部左侧" value="insideLeft" />
        <el-option label="内部右侧" value="insideRight" />
        <el-option label="内部底部" value="insideBottom" />
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

    <!-- 饼图特有配置 -->
    <el-divider content-position="left">饼图配置</el-divider>

    <el-form-item label="内半径">
      <el-input v-model="localComponent.radius[0]" @change="handleChange" placeholder="如: 0%" />
    </el-form-item>

    <el-form-item label="外半径">
      <el-input v-model="localComponent.radius[1]" @change="handleChange" placeholder="如: 70%" />
    </el-form-item>

    <el-form-item label="圆心X">
      <el-input v-model="localComponent.center[0]" @change="handleChange" placeholder="如: 50%" />
    </el-form-item>

    <el-form-item label="圆心Y">
      <el-input v-model="localComponent.center[1]" @change="handleChange" placeholder="如: 50%" />
    </el-form-item>

    <el-form-item label="玫瑰图模式">
      <el-select v-model="localComponent.roseType" @change="handleChange">
        <el-option label="不启用" :value="false" />
        <el-option label="半径模式" value="radius" />
        <el-option label="面积模式" value="area" />
      </el-select>
    </el-form-item>

    <el-form-item label="高亮放大">
      <el-switch v-model="localComponent.emphasisScale" @change="handleChange" />
    </el-form-item>

    <el-form-item label="最小角度">
      <el-input-number v-model="localComponent.minAngle" :min="0" :max="90" @change="handleChange" />
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
import type { PieChartComponent } from '../../../types'
import { currentDesign } from '../../../stores/designer'

const props = defineProps<{
  component: PieChartComponent
}>()

onMounted(() => {
  console.log('PieChartProperties mounted with:', props.component)
})

const emit = defineEmits<{
  (e: 'update'): void
}>()

const localComponent = reactive<PieChartComponent>({
  ...props.component,
  config: { ...props.component.config },
  series: { ...props.component.series },
  radius: [...props.component.radius],
  center: [...props.component.center],
})

const selectedDataSourceId = ref(props.component.dataSource?.id || '')

const dataSources = computed(() => currentDesign.value.dataSources)

watch(
  () => props.component,
  (newComponent) => {
    Object.assign(localComponent, newComponent)
    Object.assign(localComponent.config, newComponent.config)
    Object.assign(localComponent.series, newComponent.series)
    localComponent.radius = [...newComponent.radius]
    localComponent.center = [...newComponent.center]
    selectedDataSourceId.value = newComponent.dataSource?.id || ''
  },
  { deep: true }
)

function handleChange() {
  Object.assign(props.component.config, localComponent.config)
  Object.assign(props.component.series, localComponent.series)
  Object.assign(props.component, {
    radius: [...localComponent.radius],
    center: [...localComponent.center],
    roseType: localComponent.roseType,
    emphasisScale: localComponent.emphasisScale,
    minAngle: localComponent.minAngle,
  })
  emit('update')
}

function handleDataSourceChange(dataSourceId: string) {
  const dataSource = dataSources.value.find(ds => ds.id === dataSourceId)
  props.component.dataSource = dataSource || null
  emit('update')
}
</script>
