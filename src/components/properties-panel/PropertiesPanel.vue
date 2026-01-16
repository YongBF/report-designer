<template>
  <div class="properties-panel">
    <div class="panel-header">
      <h3>属性面板</h3>
    </div>

    <div class="panel-content">
      <el-empty v-if="!selectedComponent" description="请选择一个组件" />

      <div v-else class="properties-form">
        <!-- 基础属性 -->
        <div class="property-section">
          <div class="section-title">基础属性</div>

          <el-form label-width="80px" size="small">
            <el-form-item label="位置 X">
              <el-input-number
                v-model="selectedComponent.x"
                :min="0"
                :max="currentDesign.width"
                @change="handleUpdate"
              />
            </el-form-item>

            <el-form-item label="位置 Y">
              <el-input-number
                v-model="selectedComponent.y"
                :min="0"
                :max="currentDesign.height"
                @change="handleUpdate"
              />
            </el-form-item>

            <el-form-item label="宽度">
              <el-input-number v-model="selectedComponent.width" :min="20" @change="handleUpdate" />
            </el-form-item>

            <el-form-item label="高度">
              <el-input-number
                v-model="selectedComponent.height"
                :min="20"
                @change="handleUpdate"
              />
            </el-form-item>

            <el-form-item label="层级">
              <el-input-number v-model="selectedComponent.zIndex" :min="0" @change="handleUpdate" />
            </el-form-item>

            <el-form-item label="可见">
              <el-switch v-model="selectedComponent.visible" @change="handleUpdate" />
            </el-form-item>

            <el-form-item label="锁定">
              <el-switch v-model="selectedComponent.locked" @change="handleUpdate" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 文本组件属性 -->
        <template v-if="selectedComponent.type === 'text'">
          <div class="property-section">
            <div class="section-title">文本属性</div>
            <TextProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 图片组件属性 -->
        <template v-if="selectedComponent.type === 'image'">
          <div class="property-section">
            <div class="section-title">图片属性</div>
            <ImageProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 表格组件属性 -->
        <template v-if="selectedComponent.type === 'table'">
          <div class="property-section">
            <div class="section-title">表格属性</div>
            <TableProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 图表组件属性 -->
        <template v-if="selectedComponent && selectedComponent.type === 'chart'">
          <div class="property-section">
            <div class="section-title">图表属性</div>
            <ChartProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 柱状图组件属性 -->
        <template v-if="selectedComponent && selectedComponent.type === 'bar-chart'">
          <div class="property-section">
            <div class="section-title">柱状图属性</div>
            <BarChartProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 折线图组件属性 -->
        <template v-if="selectedComponent && selectedComponent.type === 'line-chart'">
          <div class="property-section">
            <div class="section-title">折线图属性</div>
            <LineChartProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 饼图组件属性 -->
        <template v-if="selectedComponent && selectedComponent.type === 'pie-chart'">
          <div class="property-section">
            <div class="section-title">饼图属性</div>
            <PieChartProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 散点图组件属性 -->
        <template v-if="selectedComponent && selectedComponent.type === 'scatter-chart'">
          <div class="property-section">
            <div class="section-title">散点图属性</div>
            <ScatterChartProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 仪表盘组件属性 -->
        <template v-if="selectedComponent && selectedComponent.type === 'gauge-chart'">
          <div class="property-section">
            <div class="section-title">仪表盘属性</div>
            <GaugeChartProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 漏斗图组件属性 -->
        <template v-if="selectedComponent && selectedComponent.type === 'funnel-chart'">
          <div class="property-section">
            <div class="section-title">漏斗图属性</div>
            <FunnelChartProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 矩形组件属性 -->
        <template v-if="selectedComponent && selectedComponent.type === 'rectangle'">
          <div class="property-section">
            <div class="section-title">矩形属性</div>
            <RectangleProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>

        <!-- 线条组件属性 -->
        <template v-if="selectedComponent && selectedComponent.type === 'line'">
          <div class="property-section">
            <div class="section-title">线条属性</div>
            <LineProperties :component="selectedComponent" @update="handleUpdate" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { currentDesign, singleSelectedComponent, updateComponent } from '../../stores/designer';
import TextProperties from './properties/TextProperties.vue';
import ImageProperties from './properties/ImageProperties.vue';
import TableProperties from './properties/TableProperties.vue';
import ChartProperties from './properties/ChartProperties.vue';
import RectangleProperties from './properties/RectangleProperties.vue';
import LineProperties from './properties/LineProperties.vue';
import BarChartProperties from './properties/BarChartProperties.vue';
import LineChartProperties from './properties/LineChartProperties.vue';
import PieChartProperties from './properties/PieChartProperties.vue';
import ScatterChartProperties from './properties/ScatterChartProperties.vue';
import GaugeChartProperties from './properties/GaugeChartProperties.vue';
import FunnelChartProperties from './properties/FunnelChartProperties.vue';
import type { Component } from '../../types';

const selectedComponent = computed(() => {
  const comp = singleSelectedComponent.value as Component | null;
  if (comp) {
    console.log('Selected component:', comp.type, comp);
  }
  return comp;
});

function handleUpdate() {
  if (selectedComponent.value) {
    updateComponent(selectedComponent.value.id, selectedComponent.value);
  }
}
</script>

<style scoped>
.properties-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-left: 1px solid #e4e7ed;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.properties-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.property-section {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
}

.section-title:not(:first-child) {
  margin-top: 16px;
}
</style>
