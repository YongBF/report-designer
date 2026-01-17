<!--
  SimpleFormRenderer.vue

  简化的表单渲染器
  用于 CanvasPanel 中渲染表单组件
-->
<template>
  <div class="form-container" :class="{ 'form-bordered': component.showBorder }">
    <el-form
      :label-position="component.labelPosition"
      :label-width="component.labelWidth + 'px'"
      :size="component.size"
    >
      <el-row :gutter="20">
        <el-col
          v-for="(item, index) in component.items"
          :key="item.id"
          :span="item.span || Math.floor(24 / component.columns)"
        >
          <el-form-item
            :label="item.label"
            :required="item.required"
            :class="{ 'last-form-item': index === component.items.length - 1 }"
          >
            <!-- Text input -->
            <el-input
              v-if="item.type === 'text'"
              :placeholder="item.placeholder"
              :disabled="item.disabled"
              :model-value="(formData[component.id]?.[item.field]) || item.defaultValue"
              @update:model-value="emitChange(item.field, $event)"
            />
            <!-- Number input -->
            <el-input-number
              v-else-if="item.type === 'number'"
              :placeholder="item.placeholder"
              :disabled="item.disabled"
              :model-value="(formData[component.id]?.[item.field]) || item.defaultValue"
              @update:model-value="emitChange(item.field, $event)"
              style="width: 100%"
            />
            <!-- Button -->
            <el-button
              v-else-if="item.type === 'button'"
              :type="item.buttonType || 'default'"
              :size="item.buttonSize || 'default'"
              :disabled="item.disabled"
              @click="emitClick(item)"
            >
              {{ item.label }}
            </el-button>
            <span v-else>{{ item.type }}</span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { FormComponent } from '@/types';

// Props
interface Props {
  component: FormComponent;
  formData: Record<string, Record<string, any>>;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'field-change': [formId: string, field: string, value: any];
  'button-click': [component: FormComponent, item: any];
}>();

function emitChange(field: string, value: any) {
  emit('field-change', props.component.id, field, value);
}

function emitClick(item: any) {
  emit('button-click', props.component, item);
}
</script>

<style scoped>
.form-container {
  width: 100%;
}

.form-bordered {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
}
</style>
