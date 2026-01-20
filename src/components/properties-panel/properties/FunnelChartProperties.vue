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
      <el-input v-model="localComponent.left" placeholder="如: 10%" @change="handleChange" />
    </el-form-item>

    <el-form-item label="上边距">
      <el-input v-model="localComponent.top" placeholder="如: 60" @change="handleChange" />
    </el-form-item>

    <el-form-item label="右边距">
      <el-input v-model="localComponent.right" placeholder="如: 10%" @change="handleChange" />
    </el-form-item>

    <el-form-item label="下边距">
      <el-input v-model="localComponent.bottom" placeholder="如: 60" @change="handleChange" />
    </el-form-item>

    <el-form-item label="宽度">
      <el-input v-model="localComponent.width" placeholder="如: 80%" @change="handleChange" />
    </el-form-item>

    <el-form-item label="高度">
      <el-input v-model="localComponent.height" placeholder="如: 80%" @change="handleChange" />
    </el-form-item>

    <!-- 数据源 -->
    <el-divider content-position="left">数据源</el-divider>

    <ChartDataSourceConfig :component="localComponent" @update="handleChange" />
  </el-form>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref, onMounted } from 'vue';
import type { FunnelChartComponent } from '../../../types';
import { currentDesign, updateComponent } from '../../../stores/designer';
import ChartDataSourceConfig from '../common/ChartDataSourceConfig.vue';

const props = defineProps<{
  component: FunnelChartComponent;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

const localComponent = reactive<FunnelChartComponent>({
  ...props.component,
  config: { ...props.component.config },
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
    localComponent.series = { ...newComponent.series };
    localComponent.sort = newComponent.sort;
    localComponent.gap = newComponent.gap;
    localComponent.left = newComponent.left;
    localComponent.top = newComponent.top;
    localComponent.right = newComponent.right;
    localComponent.bottom = newComponent.bottom;
    localComponent.width = newComponent.width;
    localComponent.height = newComponent.height;
    localComponent.labelAlign = newComponent.labelAlign;
    localComponent.dataSource = newComponent.dataSource;
  },
  { deep: true }
);

function handleChange() {
  // 使用 updateComponent 方法来确保触发响应式更新
  updateComponent(props.component.id, {
    config: { ...localComponent.config },
    series: { ...localComponent.series },
    sort: localComponent.sort,
    gap: localComponent.gap,
    left: localComponent.left,
    top: localComponent.top,
    right: localComponent.right,
    bottom: localComponent.bottom,
    width: localComponent.width,
    height: localComponent.height,
  });
  emit('update');
}
</script>
