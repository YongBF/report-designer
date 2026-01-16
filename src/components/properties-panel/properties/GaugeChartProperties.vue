<template>
  <el-form label-width="100px" size="small">
    <!-- 基础配置 -->
    <el-divider content-position="left">基础配置</el-divider>

    <el-form-item label="标题">
      <el-input v-model="localComponent.config.title" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标题字号">
      <el-input-number
        v-model="localComponent.config.titleFontSize"
        :min="12"
        :max="36"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="标题颜色">
      <el-color-picker v-model="localComponent.config.titleColor" @change="handleChange" />
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
      <el-input-number
        v-model="localComponent.config.animationDuration"
        :min="0"
        :max="5000"
        :step="100"
        @change="handleChange"
      />
    </el-form-item>

    <!-- 仪表盘特有配置 -->
    <el-divider content-position="left">仪表盘配置</el-divider>

    <el-form-item label="最小值">
      <el-input-number v-model="localComponent.min" @change="handleChange" />
    </el-form-item>

    <el-form-item label="最大值">
      <el-input-number v-model="localComponent.max" @change="handleChange" />
    </el-form-item>

    <el-form-item label="起始角度">
      <el-input-number
        v-model="localComponent.startAngle"
        :min="0"
        :max="360"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="结束角度">
      <el-input-number
        v-model="localComponent.endAngle"
        :min="0"
        :max="360"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="半径">
      <el-input v-model="localComponent.radius" placeholder="如: 75%" @change="handleChange" />
    </el-form-item>

    <el-divider content-position="left">轴线配置</el-divider>

    <el-form-item label="显示轴线">
      <el-switch v-model="localComponent.axisLine.show" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴线宽度">
      <el-input-number
        v-model="localComponent.axisLine.lineStyleWidth"
        :min="1"
        :max="50"
        @change="handleChange"
      />
    </el-form-item>

    <el-divider content-position="left">指针配置</el-divider>

    <el-form-item label="显示指针">
      <el-switch v-model="localComponent.pointer.show" @change="handleChange" />
    </el-form-item>

    <el-form-item label="指针长度">
      <el-input
        v-model="localComponent.pointer.length"
        placeholder="如: 70%"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="指针宽度">
      <el-input-number
        v-model="localComponent.pointer.width"
        :min="1"
        :max="20"
        @change="handleChange"
      />
    </el-form-item>

    <el-divider content-position="left">刻度配置</el-divider>

    <el-form-item label="分割段数">
      <el-input-number
        v-model="localComponent.splitNumber"
        :min="2"
        :max="20"
        @change="handleChange"
      />
    </el-form-item>

    <el-divider content-position="left">数值标签配置</el-divider>

    <el-form-item label="显示数值">
      <el-switch v-model="localComponent.detail.show" @change="handleChange" />
    </el-form-item>

    <el-form-item label="字号">
      <el-input-number
        v-model="localComponent.detail.fontSize"
        :min="10"
        :max="40"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="颜色">
      <el-color-picker v-model="localComponent.detail.color" @change="handleChange" />
    </el-form-item>

    <el-form-item label="格式化">
      <el-input
        v-model="localComponent.detail.formatter"
        placeholder="{value}"
        @change="handleChange"
      />
    </el-form-item>

    <!-- 数据源 -->
    <el-divider content-position="left">数据源</el-divider>

    <ChartDataSourceConfig :component="localComponent" @update="handleChange" />
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, onMounted } from 'vue';
import type { GaugeChartComponent } from '../../../types';
import { currentDesign, updateComponent } from '../../../stores/designer';
import ChartDataSourceConfig from '../common/ChartDataSourceConfig.vue';

const props = defineProps<{
  component: GaugeChartComponent;
}>();

onMounted(() => {
  console.log('GaugeChartProperties mounted with:', props.component);
});

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const localComponent = reactive<GaugeChartComponent>({
  ...props.component,
  config: { ...props.component.config },
  axisLine: { ...props.component.axisLine },
  detail: { ...props.component.detail },
  pointer: { ...props.component.pointer },
});

watch(
  () => props.component,
  (newComponent) => {
    // 使用对象展开来创建新的对象引用，确保响应式更新
    localComponent.id = newComponent.id;
    localComponent.type = newComponent.type;
    localComponent.x = newComponent.x;
    localComponent.y = newComponent.y;
    localComponent.width = newComponent.width;
    localComponent.height = newComponent.height;
    localComponent.zIndex = newComponent.zIndex;
    localComponent.visible = newComponent.visible;
    localComponent.locked = newComponent.locked;
    localComponent.order = newComponent.order;

    // 深拷贝嵌套对象
    localComponent.config = { ...newComponent.config };
    localComponent.axisLine = { ...newComponent.axisLine };
    localComponent.detail = { ...newComponent.detail };
    localComponent.pointer = { ...newComponent.pointer };
    localComponent.min = newComponent.min;
    localComponent.max = newComponent.max;
    localComponent.startAngle = newComponent.startAngle;
    localComponent.endAngle = newComponent.endAngle;
    localComponent.radius = newComponent.radius;
    localComponent.splitNumber = newComponent.splitNumber;
    localComponent.dataSource = newComponent.dataSource;
  },
  { deep: true }
);

function handleChange() {
  // 使用 updateComponent 方法来确保触发响应式更新
  updateComponent(props.component.id, {
    config: { ...localComponent.config },
    axisLine: { ...localComponent.axisLine },
    detail: { ...localComponent.detail },
    pointer: { ...localComponent.pointer },
    min: localComponent.min,
    max: localComponent.max,
    startAngle: localComponent.startAngle,
    endAngle: localComponent.endAngle,
    radius: localComponent.radius,
    splitNumber: localComponent.splitNumber,
  });
  emit('update');
}
</script>
