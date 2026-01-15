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

    <!-- X轴配置 -->
    <el-divider content-position="left">X轴配置</el-divider>

    <el-form-item label="显示X轴">
      <el-switch v-model="localComponent.xAxis.show" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴名称">
      <el-input v-model="localComponent.xAxis.name" @change="handleChange" />
    </el-form-item>

    <el-form-item label="名称字号">
      <el-input-number v-model="localComponent.xAxis.nameFontSize" :min="10" :max="20" @change="handleChange" />
    </el-form-item>

    <el-form-item label="名称颜色">
      <el-color-picker v-model="localComponent.xAxis.nameColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标签字号">
      <el-input-number v-model="localComponent.xAxis.axisLabelFontSize" :min="10" :max="20" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标签颜色">
      <el-color-picker v-model="localComponent.xAxis.axisLabelColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴线颜色">
      <el-color-picker v-model="localComponent.xAxis.axisLineColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴线宽度">
      <el-input-number v-model="localComponent.xAxis.axisLineWidth" :min="0" :max="5" :step="0.5" @change="handleChange" />
    </el-form-item>

    <!-- Y轴配置 -->
    <el-divider content-position="left">Y轴配置</el-divider>

    <el-form-item label="显示Y轴">
      <el-switch v-model="localComponent.yAxis.show" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴名称">
      <el-input v-model="localComponent.yAxis.name" @change="handleChange" />
    </el-form-item>

    <el-form-item label="名称字号">
      <el-input-number v-model="localComponent.yAxis.nameFontSize" :min="10" :max="20" @change="handleChange" />
    </el-form-item>

    <el-form-item label="名称颜色">
      <el-color-picker v-model="localComponent.yAxis.nameColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标签字号">
      <el-input-number v-model="localComponent.yAxis.axisLabelFontSize" :min="10" :max="20" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标签颜色">
      <el-color-picker v-model="localComponent.yAxis.axisLabelColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴线颜色">
      <el-color-picker v-model="localComponent.yAxis.axisLineColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴线宽度">
      <el-input-number v-model="localComponent.yAxis.axisLineWidth" :min="0" :max="5" :step="0.5" @change="handleChange" />
    </el-form-item>

    <!-- 系列配置 -->
    <el-divider content-position="left">系列配置</el-divider>

    <el-form-item label="显示标签">
      <el-switch v-model="localComponent.series.labelShow" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标签位置">
      <el-select v-model="localComponent.series.labelPosition" @change="handleChange">
        <el-option label="顶部" value="top" />
        <el-option label="内部" value="inside" />
        <el-option label="内部上方" value="insideTop" />
        <el-option label="内部左侧" value="insideLeft" />
        <el-option label="内部右侧" value="insideRight" />
        <el-option label="内部底部" value="insideBottom" />
        <el-option label="外部" value="outside" />
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

    <!-- 柱状图特有配置 -->
    <el-divider content-position="left">柱状图配置</el-divider>

    <el-form-item label="柱宽">
      <el-input-number v-model="localComponent.barWidth" :min="1" :max="100" @change="handleChange" />
    </el-form-item>

    <el-form-item label="柱间距">
      <el-input v-model="localComponent.barGap" @change="handleChange" placeholder="如: 20%" />
    </el-form-item>

    <el-form-item label="显示背景">
      <el-switch v-model="localComponent.showBackground" @change="handleChange" />
    </el-form-item>

    <el-form-item label="背景颜色">
      <el-color-picker v-model="localComponent.backgroundColor" @change="handleChange" />
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
import { reactive, watch, computed, ref } from 'vue'
import type { BarChartComponent } from '../../../types'
import { currentDesign } from '../../../stores/designer'

const props = defineProps<{
  component: BarChartComponent
}>()

const emit = defineEmits<{
  (e: 'update'): void
}>()

const localComponent = reactive<BarChartComponent>({
  ...props.component,
  config: { ...props.component.config },
  xAxis: { ...props.component.xAxis },
  yAxis: { ...props.component.yAxis },
  series: { ...props.component.series },
})

const selectedDataSourceId = ref(props.component.dataSource?.id || '')

const dataSources = computed(() => currentDesign.value.dataSources)

watch(
  () => props.component,
  (newComponent) => {
    Object.assign(localComponent, newComponent)
    Object.assign(localComponent.config, newComponent.config)
    Object.assign(localComponent.xAxis, newComponent.xAxis)
    Object.assign(localComponent.yAxis, newComponent.yAxis)
    Object.assign(localComponent.series, newComponent.series)
    selectedDataSourceId.value = newComponent.dataSource?.id || ''
  },
  { deep: true }
)

function handleChange() {
  Object.assign(props.component.config, localComponent.config)
  Object.assign(props.component.xAxis, localComponent.xAxis)
  Object.assign(props.component.yAxis, localComponent.yAxis)
  Object.assign(props.component.series, localComponent.series)
  Object.assign(props.component, {
    barWidth: localComponent.barWidth,
    barGap: localComponent.barGap,
    showBackground: localComponent.showBackground,
    backgroundColor: localComponent.backgroundColor,
  })
  emit('update')
}

function handleDataSourceChange(dataSourceId: string) {
  const dataSource = dataSources.value.find(ds => ds.id === dataSourceId)
  props.component.dataSource = dataSource || null
  emit('update')
}
</script>
