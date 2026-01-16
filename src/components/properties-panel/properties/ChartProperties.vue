<template>
  <el-form label-width="80px" size="small">
    <el-form-item label="图表类型">
      <el-select v-model="localComponent.chartType" @change="handleChange">
        <el-option label="柱状图" value="bar" />
        <el-option label="折线图" value="line" />
        <el-option label="饼图" value="pie" />
        <el-option label="散点图" value="scatter" />
      </el-select>
    </el-form-item>

    <el-form-item label="标题">
      <el-input v-model="localComponent.title" @change="handleChange" />
    </el-form-item>

    <el-form-item label="显示图例">
      <el-switch v-model="localComponent.showLegend" @change="handleChange" />
    </el-form-item>

    <el-form-item label="数据缩放">
      <el-switch v-model="localComponent.showDataZoom" @change="handleChange" />
    </el-form-item>

    <el-form-item label="主题">
      <el-select v-model="localComponent.theme" @change="handleChange">
        <el-option label="默认" value="default" />
        <el-option label="亮色" value="light" />
        <el-option label="暗色" value="dark" />
      </el-select>
    </el-form-item>

    <el-divider>数据源</el-divider>

    <el-form-item label="数据源">
      <el-select
        v-model="localComponent.dataSource"
        placeholder="选择数据源"
        @change="handleDataSourceChange"
      >
        <el-option v-for="ds in dataSources" :key="ds.id" :label="ds.name" :value="ds" />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import type { ChartComponent } from '../../../types';
import { currentDesign } from '../../../stores/designer';

const props = defineProps<{
  component: ChartComponent;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const localComponent = reactive<ChartComponent>({ ...props.component });

const dataSources = computed(() => currentDesign.value.dataSources);

watch(
  () => props.component,
  (newComponent) => {
    Object.assign(localComponent, newComponent);
  },
  { deep: true }
);

function handleChange() {
  Object.assign(props.component, localComponent);
  emit('update');
}

function handleDataSourceChange(value: any) {
  localComponent.dataSource = value;
  handleChange();
}
</script>
