<!--
  TypePropertiesPanel.vue

  类型特定属性面板

  根据组件类型动态渲染对应的属性配置：
  - 文本属性
  - 图片属性
  - 表格属性
  - 图表属性
  - 表单属性
  - 形状属性

  @component TypePropertiesPanel
  @author Report Designer Team
  @since 2026-01-17
-->
<template>
  <template v-if="type === 'text'">
    <el-collapse-item title="文本属性" name="text">
      <el-form label-width="100px" size="small">
        <el-form-item label="内容">
          <el-input
            :model-value="component.content"
            type="textarea"
            @update:model-value="handleUpdate('content', $event)"
          />
        </el-form-item>
        <el-form-item label="字号">
          <el-input-number
            :model-value="component.fontSize"
            :min="8"
            :max="72"
            @update:model-value="handleUpdate('fontSize', $event)"
          />
        </el-form-item>
        <el-form-item label="字体">
          <el-select
            :model-value="component.fontFamily"
            @update:model-value="handleUpdate('fontFamily', $event)"
          >
            <el-option label="Arial" value="Arial" />
            <el-option label="宋体" value="SimSun" />
            <el-option label="黑体" value="SimHei" />
            <el-option label="微软雅黑" value="Microsoft YaHei" />
            <el-option label="楷体" value="KaiTi" />
          </el-select>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker
            :model-value="component.color"
            @update:model-value="handleUpdate('color', $event)"
          />
        </el-form-item>
        <el-form-item label="字重">
          <el-select
            :model-value="component.fontWeight"
            @update:model-value="handleUpdate('fontWeight', $event)"
          >
            <el-option label="正常" :value="400" />
            <el-option label="粗体" :value="700" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-collapse-item>
  </template>

  <template v-else-if="type === 'image'">
    <el-collapse-item title="图片属性" name="image">
      <el-form label-width="100px" size="small">
        <el-form-item label="图片地址">
          <el-input
            :model-value="component.src"
            placeholder="请输入图片 URL"
            @update:model-value="handleUpdate('src', $event)"
          />
        </el-form-item>
        <el-form-item label="边框圆角">
          <el-input-number
            :model-value="component.borderRadius"
            :min="0"
            @update:model-value="handleUpdate('borderRadius', $event)"
          />
        </el-form-item>
      </el-form>
    </el-collapse-item>
  </template>

  <template v-else-if="type === 'rectangle'">
    <el-collapse-item title="矩形属性" name="rectangle">
      <el-form label-width="100px" size="small">
        <el-form-item label="背景颜色">
          <el-color-picker
            :model-value="component.backgroundColor"
            @update:model-value="handleUpdate('backgroundColor', $event)"
          />
        </el-form-item>
        <el-form-item label="边框圆角">
          <el-input-number
            :model-value="component.borderRadius"
            :min="0"
            @update:model-value="handleUpdate('borderRadius', $event)"
          />
        </el-form-item>
        <el-form-item label="边框">
          <el-input
            :model-value="component.border"
            placeholder="例如: 1px solid #ccc"
            @update:model-value="handleUpdate('border', $event)"
          />
        </el-form-item>
      </el-form>
    </el-collapse-item>
  </template>

  <template v-else-if="type === 'line'">
    <el-collapse-item title="线条属性" name="line">
      <el-form label-width="100px" size="small">
        <el-form-item label="线条颜色">
          <el-color-picker
            :model-value="component.color"
            @update:model-value="handleUpdate('color', $event)"
          />
        </el-form-item>
        <el-form-item label="线条宽度">
          <el-input-number
            :model-value="component.lineWidth"
            :min="1"
            :max="20"
            @update:model-value="handleUpdate('lineWidth', $event)"
          />
        </el-form-item>
        <el-form-item label="线条样式">
          <el-select
            :model-value="component.lineStyle"
            @update:model-value="handleUpdate('lineStyle', $event)"
          >
            <el-option label="实线" value="solid" />
            <el-option label="虚线" value="dashed" />
            <el-option label="点线" value="dotted" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-collapse-item>
  </template>

  <!-- 表格和图表组件使用现有的属性面板 -->
  <template v-else-if="['table', 'bar-chart', 'line-chart', 'pie-chart', 'scatter-chart', 'gauge-chart', 'funnel-chart'].includes(type)">
    <component
      :is="getTableOrChartPropertiesComponent(type)"
      :component="component"
      @update="handleComponentUpdate"
    />
  </template>

  <!-- 表单组件 -->
  <template v-else-if="type === 'form'">
    <el-collapse-item title="表单设置" name="form">
      <el-form label-width="100px" size="small">
        <el-form-item label="标签位置">
          <el-select
            :model-value="component.labelPosition"
            @update:model-value="handleUpdate('labelPosition', $event)"
          >
            <el-option label="左对齐" value="left" />
            <el-option label="右对齐" value="right" />
            <el-option label="顶部对齐" value="top" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签宽度">
          <el-input-number
            :model-value="component.labelWidth"
            :min="50"
            :max="200"
            @update:model-value="handleUpdate('labelWidth', $event)"
          />
        </el-form-item>
        <el-form-item label="尺寸">
          <el-select
            :model-value="component.size"
            @update:model-value="handleUpdate('size', $event)"
          >
            <el-option label="大" value="large" />
            <el-option label="默认" value="default" />
            <el-option label="小" value="small" />
          </el-select>
        </el-form-item>
        <el-form-item label="列数">
          <el-input-number
            :model-value="component.columns"
            :min="1"
            :max="4"
            @update:model-value="handleUpdate('columns', $event)"
          />
        </el-form-item>
        <el-form-item label="显示边框">
          <el-switch
            :model-value="component.showBorder"
            @update:model-value="handleUpdate('showBorder', $event)"
          />
        </el-form-item>
      </el-form>
    </el-collapse-item>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from '@/types';
// 导入现有的属性面板组件
import TableProperties from '@/components/properties-panel/properties/TableProperties.vue';
import BarChartProperties from '@/components/properties-panel/properties/BarChartProperties.vue';
import LineChartProperties from '@/components/properties-panel/properties/LineChartProperties.vue';
import PieChartProperties from '@/components/properties-panel/properties/PieChartProperties.vue';
import ScatterChartProperties from '@/components/properties-panel/properties/ScatterChartProperties.vue';
import GaugeChartProperties from '@/components/properties-panel/properties/GaugeChartProperties.vue';
import FunnelChartProperties from '@/components/properties-panel/properties/FunnelChartProperties.vue';

// Props
interface Props {
  type: string;
  component: Component;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  update: [field: string, value: any];
}>();

// Methods
function handleUpdate(field: string, value: any) {
  emit('update', field, value);
}

function handleComponentUpdate(...args: any[]) {
  emit('update', args[0], args[1]);
}

// 根据类型获取对应的属性面板组件
function getTableOrChartPropertiesComponent(type: string) {
  const componentMap: Record<string, any> = {
    'table': TableProperties,
    'bar-chart': BarChartProperties,
    'line-chart': LineChartProperties,
    'pie-chart': PieChartProperties,
    'scatter-chart': ScatterChartProperties,
    'gauge-chart': GaugeChartProperties,
    'funnel-chart': FunnelChartProperties,
  };
  return componentMap[type] || null;
}
</script>

<style scoped>
/* 使用 el-collapse-item 默认样式 */
</style>
