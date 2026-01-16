<!--
  LineChartProperties.vue

  折线图属性面板组件

  用于配置折线图的各种属性，包括：
  - 基础配置（标题、图例、主题、背景色、动画）
  - X轴配置（显示、名称、样式）
  - Y轴配置（显示、名称、样式）
  - 系列配置（标签、边框）
  - 折线图特有配置（平滑曲线、标记点、区域填充）
  - 数据源配置

  @author Report Designer Team
  @since 2025-01-15
-->
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

    <el-form-item label="区域透明度">
      <el-input-number
        v-model="localComponent.series.areaStyleOpacity"
        :min="0"
        :max="1"
        :step="0.1"
        @change="handleChange"
      />
    </el-form-item>

    <!-- 折线图特有配置 -->
    <el-divider content-position="left">折线图配置</el-divider>

    <el-form-item label="平滑曲线">
      <el-switch v-model="localComponent.smooth" @change="handleChange" />
    </el-form-item>

    <el-form-item label="阶梯线">
      <el-switch v-model="localComponent.step" @change="handleChange" />
    </el-form-item>

    <el-form-item label="显示标记">
      <el-switch v-model="localComponent.showSymbol" @change="handleChange" />
    </el-form-item>

    <el-form-item label="标记大小">
      <el-input-number
        v-model="localComponent.symbolSize"
        :min="0"
        :max="20"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="线宽">
      <el-input-number
        v-model="localComponent.lineStyleWidth"
        :min="1"
        :max="10"
        :step="0.5"
        @change="handleChange"
      />
    </el-form-item>

    <el-form-item label="线型">
      <el-select v-model="localComponent.lineStyleType" @change="handleChange">
        <el-option label="实线" value="solid" />
        <el-option label="虚线" value="dashed" />
        <el-option label="点线" value="dotted" />
      </el-select>
    </el-form-item>

    <el-form-item label="区域填充">
      <el-switch v-model="localComponent.areaStyle" @change="handleChange" />
    </el-form-item>

    <!-- 数据源 -->
    <el-divider content-position="left">数据源</el-divider>

    <ChartDataSourceConfig :component="localComponent" @update="handleChange" />
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, onMounted } from 'vue';
import type { LineChartComponent } from '../../../types';
import { currentDesign, updateComponent } from '../../../stores/designer';
import ChartDataSourceConfig from '../common/ChartDataSourceConfig.vue';

const props = defineProps<{
  component: LineChartComponent;
}>();

onMounted(() => {
  console.log('LineChartProperties mounted with:', props.component);
});

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const localComponent = reactive<LineChartComponent>({
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
    localComponent.smooth = newComponent.smooth;
    localComponent.step = newComponent.step;
    localComponent.showSymbol = newComponent.showSymbol;
    localComponent.symbolSize = newComponent.symbolSize;
    localComponent.lineStyleWidth = newComponent.lineStyleWidth;
    localComponent.lineStyleType = newComponent.lineStyleType;
    localComponent.areaStyle = newComponent.areaStyle;
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
    smooth: localComponent.smooth,
    step: localComponent.step,
    showSymbol: localComponent.showSymbol,
    symbolSize: localComponent.symbolSize,
    lineStyleWidth: localComponent.lineStyleWidth,
    lineStyleType: localComponent.lineStyleType,
    areaStyle: localComponent.areaStyle,
  });
  emit('update');
}
</script>
