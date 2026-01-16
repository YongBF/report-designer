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
      <el-input-number
        v-model="localComponent.config.animationDuration"
        :min="0"
        :max="5000"
        :step="100"
        @change="handleChange"
      />
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
      <el-input-number
        v-model="localComponent.xAxis.nameFontSize"
        :min="10"
        :max="20"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="名称颜色">
      <el-color-picker v-model="localComponent.xAxis.nameColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标签字号">
      <el-input-number
        v-model="localComponent.xAxis.axisLabelFontSize"
        :min="10"
        :max="20"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="标签颜色">
      <el-color-picker v-model="localComponent.xAxis.axisLabelColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴线颜色">
      <el-color-picker v-model="localComponent.xAxis.axisLineColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴线宽度">
      <el-input-number
        v-model="localComponent.xAxis.axisLineWidth"
        :min="0"
        :max="5"
        :step="0.5"
        @change="handleChange"
      />
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
      <el-input-number
        v-model="localComponent.yAxis.nameFontSize"
        :min="10"
        :max="20"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="名称颜色">
      <el-color-picker v-model="localComponent.yAxis.nameColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标签字号">
      <el-input-number
        v-model="localComponent.yAxis.axisLabelFontSize"
        :min="10"
        :max="20"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="标签颜色">
      <el-color-picker v-model="localComponent.yAxis.axisLabelColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴线颜色">
      <el-color-picker v-model="localComponent.yAxis.axisLineColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="轴线宽度">
      <el-input-number
        v-model="localComponent.yAxis.axisLineWidth"
        :min="0"
        :max="5"
        :step="0.5"
        @change="handleChange"
      />
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
      <el-input-number
        v-model="localComponent.series.labelFontSize"
        :min="10"
        :max="20"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="标签颜色">
      <el-color-picker v-model="localComponent.series.labelColor" @change="handleChange" />
    </el-form-item>

    <el-form-item label="边框宽度">
      <el-input-number
        v-model="localComponent.series.itemStyleBorderWidth"
        :min="0"
        :max="5"
        :step="0.5"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="边框颜色">
      <el-color-picker
        v-model="localComponent.series.itemStyleBorderColor"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="圆角">
      <el-input-number
        v-model="localComponent.series.itemStyleBorderRadius"
        :min="0"
        :max="10"
        @change="handleChange"
      />
    </el-form-item>

    <!-- 柱状图特有配置 -->
    <el-divider content-position="left">柱状图配置</el-divider>

    <el-form-item label="柱宽">
      <el-input-number
        v-model="localComponent.barWidth"
        :min="1"
        :max="100"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="柱间距">
      <el-input v-model="localComponent.barGap" placeholder="如: 20%" @change="handleChange" />
    </el-form-item>

    <el-form-item label="显示背景">
      <el-switch v-model="localComponent.showBackground" @change="handleChange" />
    </el-form-item>

    <el-form-item label="背景颜色">
      <el-color-picker v-model="localComponent.backgroundColor" @change="handleChange" />
    </el-form-item>

    <!-- 数据源 -->
    <el-divider content-position="left">数据源</el-divider>

    <ChartDataSourceConfig :component="localComponent" @update="handleChange" />
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue';
import type { BarChartComponent } from '../../../types';
import { currentDesign, updateComponent } from '../../../stores/designer';
import ChartDataSourceConfig from '../common/ChartDataSourceConfig.vue';

const props = defineProps<{
  component: BarChartComponent;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const localComponent = reactive<BarChartComponent>({
  ...props.component,
  config: { ...props.component.config },
  xAxis: { ...props.component.xAxis },
  yAxis: { ...props.component.yAxis },
  series: { ...props.component.series },
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
    localComponent.xAxis = { ...newComponent.xAxis };
    localComponent.yAxis = { ...newComponent.yAxis };
    localComponent.series = { ...newComponent.series };
    localComponent.barWidth = newComponent.barWidth;
    localComponent.barGap = newComponent.barGap;
    localComponent.showBackground = newComponent.showBackground;
    localComponent.backgroundColor = newComponent.backgroundColor;
    localComponent.dataSource = newComponent.dataSource;
  },
  { deep: true }
);

function handleChange() {
  // 使用 updateComponent 方法来确保触发响应式更新
  updateComponent(props.component.id, {
    config: { ...localComponent.config },
    xAxis: { ...localComponent.xAxis },
    yAxis: { ...localComponent.yAxis },
    series: { ...localComponent.series },
    barWidth: localComponent.barWidth,
    barGap: localComponent.barGap,
    showBackground: localComponent.showBackground,
    backgroundColor: localComponent.backgroundColor,
  });
  emit('update');
}
</script>
