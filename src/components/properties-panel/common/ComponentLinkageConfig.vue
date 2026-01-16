<!--
  ComponentLinkageConfig.vue

  组件联动配置面板

  功能：
  - 配置组件间的联动关系
  - 设置参数映射规则
  - 定义触发条件和动作
  - 可视化联动依赖图

  @component ComponentLinkageConfig
  @author Report Designer Team
  @since 2025-01-16
-->
<template>
  <div class="linkage-config">
    <!-- 联动列表 -->
    <div class="linkage-list">
      <div class="list-header">
        <h4>联动配置</h4>
        <el-button type="primary" size="small" @click="handleAddLinkage">
          + 添加联动
        </el-button>
      </div>

      <el-empty
        v-if="linkages.length === 0"
        description="暂无联动配置，点击上方按钮添加"
        :image-size="80"
      />

      <div v-else class="linkage-items">
        <div
          v-for="linkage in linkages"
          :key="linkage.id"
          class="linkage-item"
          :class="{ disabled: !linkage.enabled }"
        >
          <div class="linkage-item-header">
            <div class="linkage-info">
              <el-icon class="linkage-icon"><Link /></el-icon>
              <span class="linkage-title">{{ linkage.description || getLinkageTitle(linkage) }}</span>
            </div>
            <div class="linkage-actions">
              <el-switch
                v-model="linkage.enabled"
                size="small"
                @change="updateLinkage(linkage.id, { enabled: linkage.enabled })"
              />
              <el-button
                link
                type="primary"
                size="small"
                @click="handleEditLinkage(linkage)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="handleRemoveLinkage(linkage.id)"
              >
                删除
              </el-button>
            </div>
          </div>

          <div class="linkage-item-body">
            <div class="linkage-detail">
              <span class="detail-label">源组件:</span>
              <el-tag size="small">{{ getComponentName(linkage.sourceComponentId) }}</el-tag>
              <el-icon><Right /></el-icon>
              <span class="detail-label">目标组件:</span>
              <el-tag size="small" type="success">{{ getComponentName(linkage.targetComponentId) }}</el-tag>
            </div>
            <div class="linkage-detail">
              <span class="detail-label">触发事件:</span>
              <el-tag size="small" type="warning">{{ linkage.triggerEvent }}</el-tag>
              <span class="detail-label" style="margin-left: 12px">动作:</span>
              <el-tag size="small" type="info">{{ getActionTypeName(linkage.actionType) }}</el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 联动编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editingLinkage?.id ? '编辑联动' : '添加联动'"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" label-width="120px" size="small">
        <!-- 基本配置 -->
        <el-divider>基本配置</el-divider>
        <el-form-item label="描述" required>
          <el-input
            v-model="formData.description"
            placeholder="如：表单查询触发表格数据刷新"
          />
        </el-form-item>

        <el-form-item label="源组件" required>
          <el-select
            v-model="formData.sourceComponentId"
            placeholder="选择源组件"
            style="width: 100%"
            @change="handleSourceChange"
          >
            <el-option
              v-for="component in availableComponents"
              :key="component.id"
              :label="getComponentLabel(component)"
              :value="component.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="目标组件" required>
          <el-select
            v-model="formData.targetComponentId"
            placeholder="选择目标组件"
            style="width: 100%"
          >
            <el-option
              v-for="component in targetAvailableComponents"
              :key="component.id"
              :label="getComponentLabel(component)"
              :value="component.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="触发事件" required>
          <el-select v-model="formData.triggerEvent" style="width: 100%">
            <el-option label="按钮点击" value="button.click" />
            <el-option label="值变化" value="value.change" />
            <el-option label="表单提交" value="form.submit" />
            <el-option label="数据加载完成" value="data.loaded" />
          </el-select>
        </el-form-item>

        <el-form-item label="联动动作" required>
          <el-select v-model="formData.actionType" style="width: 100%">
            <el-option label="刷新数据" value="refresh" />
            <el-option label="更新配置" value="update_config" />
            <el-option label="显示/隐藏" value="toggle_visible" />
            <el-option label="启用/禁用" value="toggle_disabled" />
            <el-option label="自定义代码" value="custom" />
          </el-select>
        </el-form-item>

        <!-- 参数映射 -->
        <el-divider>参数映射（可选）</el-divider>
        <el-form-item label="映射配置">
          <div class="mapping-container">
            <div class="mapping-toolbar">
              <el-button size="small" @click="handleAddMapping">+ 添加映射</el-button>
              <el-alert
                type="info"
                :closable="false"
                style="flex: 1; margin-left: 12px"
              >
                <template #title>
                  <div>可选配置。不配置映射将传递源组件的所有数据</div>
                </template>
              </el-alert>
            </div>

            <el-empty
              v-if="!formData.parameterMappings || formData.parameterMappings.length === 0"
              description="暂无映射配置，将传递源组件的所有数据"
              :image-size="60"
            />

            <el-table v-else :data="formData.parameterMappings" border size="small" max-height="300">
              <el-table-column label="映射类型" width="130">
                <template #default="{ row }">
                  <el-select v-model="row.type" size="small">
                    <el-option label="直接映射" value="direct" />
                    <el-option label="重命名" value="rename" />
                    <el-option label="固定值" value="fixed" />
                    <el-option label="表达式" value="expression" />
                  </el-select>
                </template>
              </el-table-column>

              <el-table-column label="源字段" width="180">
                <template #default="{ row }">
                  <el-input
                    v-if="row.type !== 'fixed'"
                    v-model="row.sourceField"
                    placeholder="如：formData.name"
                    size="small"
                  />
                  <span v-else style="color: #909399">-</span>
                </template>
              </el-table-column>

              <el-table-column label="目标参数" width="150">
                <template #default="{ row }">
                  <el-input v-model="row.targetParam" placeholder="如：userName" size="small" />
                </template>
              </el-table-column>

              <el-table-column label="固定值/表达式">
                <template #default="{ row }">
                  <el-input
                    v-if="row.type === 'fixed'"
                    v-model="row.fixedValue"
                    placeholder="固定值"
                    size="small"
                  />
                  <el-input
                    v-else-if="row.type === 'expression'"
                    v-model="row.expression"
                    type="textarea"
                    :rows="2"
                    placeholder="如：data.name + '_' + data.id"
                    size="small"
                  />
                  <span v-else style="color: #909399">-</span>
                </template>
              </el-table-column>

              <el-table-column label="默认值" width="100">
                <template #default="{ row }">
                  <el-input v-model="row.defaultValue" placeholder="可选" size="small" />
                </template>
              </el-table-column>

              <el-table-column label="操作" width="60" fixed="right">
                <template #default="{ $index }">
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="handleRemoveMapping($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <!-- 自定义代码 -->
        <el-divider v-if="formData.actionType === 'custom'">自定义代码</el-divider>
        <el-form-item
          v-if="formData.actionType === 'custom'"
          label="处理代码"
        >
          <el-alert
            type="info"
            :closable="false"
            style="margin-bottom: 12px"
            show-icon
          >
            可用变量：context（上下文）、params（映射后参数）、component（目标组件）、console、window
          </el-alert>
          <el-input
            v-model="formData.customHandler"
            type="textarea"
            :rows="10"
            placeholder="// 可用变量：context（上下文）、params（映射参数）、component（目标组件）&#10;&#10;console.log('联动已触发:', params);&#10;&#10;// 示例：发送 API 请求&#10;// const response = await fetch('/api/search', {&#10;//   method: 'POST',&#10;//   body: JSON.stringify(params)& //});&#10;// const data = await response.json();"
          />
        </el-form-item>

        <!-- 高级选项 -->
        <el-divider>高级选项</el-divider>
        <el-form-item label="启用">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
        <el-form-item label="延迟执行">
          <el-input-number
            v-model="formData.delay"
            :min="0"
            :max="10000"
            :step="100"
            :controls-position="'right'"
          />
          <span style="margin-left: 8px; font-size: 12px; color: #909399">毫秒</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" @click="handleSaveLinkage">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { Link, Right } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { LinkageConfig, ParameterMapping, LinkageActionType } from '../../../types/linkage';
import type { Component } from '../../../types';
import type { ReturnType } from 'vue';
import { generateId } from '../../../utils';

const props = defineProps<{
  component: Component;
  allComponents: Component[];
  linkageManager: ReturnType<typeof useComponentLinkage>;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

// 使用传入的 linkageManager 实例，而不是创建新实例
const { addLinkage, updateLinkage, removeLinkage, getComponentLinkages } = props.linkageManager;

// 编辑对话框
const editDialogVisible = ref(false);
const editingLinkage = ref<LinkageConfig | null>(null);

// 表单数据
const formData = reactive<Partial<LinkageConfig>>({
  description: '',
  sourceComponentId: '',
  targetComponentId: '',
  actionType: 'refresh' as LinkageActionType,
  triggerEvent: 'button.click',
  parameterMappings: [],
  enabled: true,
  delay: 0,
  customHandler: '',
});

// 可用组件列表（包含所有组件）
const availableComponents = computed(() => {
  return props.allComponents;
});

// 可用的目标组件列表（排除已选择的源组件）
const targetAvailableComponents = computed(() => {
  if (!formData.sourceComponentId) {
    return props.allComponents;
  }
  return props.allComponents.filter((c) => c.id !== formData.sourceComponentId);
});

// 当前组件的联动配置
const componentLinkages = computed(() => {
  return getComponentLinkages(props.component.id);
});

// 获取组件的所有联动（作为源或目标）
const linkages = computed(() => {
  return [...(componentLinkages.value.asSource || []), ...(componentLinkages.value.asTarget || [])];
});

// 初始化
watch(
  () => props.component.id,
  () => {
    // 组件变化时刷新
  },
  { immediate: true }
);

// 获取联动标题
function getLinkageTitle(linkage: LinkageConfig): string {
  const sourceName = getComponentName(linkage.sourceComponentId);
  const targetName = getComponentName(linkage.targetComponentId);
  return `${sourceName} → ${targetName}`;
}

// 获取组件名称
function getComponentName(componentId: string): string {
  const component = props.allComponents.find((c) => c.id === componentId);
  if (!component) return '未知组件';
  return getComponentLabel(component);
}

// 获取组件标签
function getComponentLabel(component: Component): string {
  const typeLabels: Record<string, string> = {
    form: '表单',
    table: '表格',
    'bar-chart': '柱状图',
    'line-chart': '折线图',
    'pie-chart': '饼图',
    text: '文本',
    image: '图片',
  };

  const typeLabel = typeLabels[component.type] || component.type;
  return `${typeLabel} (${component.id.slice(-4)})`;
}

// 获取动作类型名称
function getActionTypeName(actionType: LinkageActionType): string {
  const names: Record<LinkageActionType, string> = {
    refresh: '刷新数据',
    update_config: '更新配置',
    toggle_visible: '显示/隐藏',
    toggle_disabled: '启用/禁用',
    custom: '自定义',
  };
  return names[actionType] || actionType;
}

// 默认的自定义代码模板
const defaultCustomHandler = `// 可用变量：
// context.sourceComponent - 源组件
// context.targetComponent - 目标组件
// context.sourceValue - 源组件数据
// params - 映射后的参数对象
// component - 目标组件

console.log('[Custom Linkage] 联动已触发');
console.log('[Custom Linkage] 源组件:', context.sourceComponent.id);
console.log('[Custom Linkage] 目标组件:', context.targetComponent.id);
console.log('[Custom Linkage] 映射参数:', params);

// 示例：发送 API 请求
// const response = await fetch('/api/search', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(params)
// });
// const data = await response.json();
// console.log('API 返回数据:', data);

// 示例：更新目标组件数据
// component.customData = data;

// 示例：显示提示
// console.log('查询参数:', params.name);`;

// 添加联动
function handleAddLinkage() {
  editingLinkage.value = null;
  Object.assign(formData, {
    id: generateId(),
    description: '',
    sourceComponentId: props.component.id, // 默认使用当前组件作为源组件
    targetComponentId: '',
    actionType: 'refresh',
    triggerEvent: 'button.click',
    parameterMappings: [],
    enabled: true,
    delay: 0,
    customHandler: defaultCustomHandler, // 默认填充示例代码
  });
  editDialogVisible.value = true;
}

// 编辑联动
function handleEditLinkage(linkage: LinkageConfig) {
  editingLinkage.value = linkage;
  Object.assign(formData, linkage);
  editDialogVisible.value = true;
}

// 删除联动
function handleRemoveLinkage(linkageId: string) {
  removeLinkage(linkageId);
  ElMessage.success('联动配置已删除');
  emit('update');
}

// 源组件变化
function handleSourceChange() {
  // 可以在这里自动设置一些默认值
}

// 添加参数映射
function handleAddMapping() {
  formData.parameterMappings = formData.parameterMappings || [];
  formData.parameterMappings.push({
    type: 'direct',
    sourceField: '',
    targetParam: '',
    defaultValue: '',
  });
}

// 删除参数映射
function handleRemoveMapping(index: number) {
  formData.parameterMappings?.splice(index, 1);
}

// 保存联动
function handleSaveLinkage() {
  // 验证
  if (!formData.sourceComponentId || !formData.targetComponentId) {
    ElMessage.warning('请选择源组件和目标组件');
    return;
  }

  if (formData.sourceComponentId === formData.targetComponentId) {
    ElMessage.warning('源组件和目标组件不能相同');
    return;
  }

  // 参数映射不再必填，如果没有配置映射，将传递源组件的所有数据

  const linkageConfig = {
    ...formData,
    id: editingLinkage.value?.id || generateId(),
  } as LinkageConfig;

  if (editingLinkage.value) {
    updateLinkage(editingLinkage.value.id, linkageConfig);
    ElMessage.success('联动配置已更新');
  } else {
    addLinkage(linkageConfig);
    ElMessage.success('联动配置已添加');
  }

  editDialogVisible.value = false;
  emit('update');
}

// 关闭对话框
function handleDialogClose() {
  editDialogVisible.value = false;
  editingLinkage.value = null;
}
</script>

<style scoped>
.linkage-config {
  padding: 12px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.linkage-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.linkage-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background: #fff;
  transition: all 0.3s;
}

.linkage-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.linkage-item.disabled {
  opacity: 0.6;
}

.linkage-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.linkage-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.linkage-icon {
  color: #409eff;
  font-size: 18px;
}

.linkage-title {
  font-weight: 500;
  color: #303133;
}

.linkage-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.linkage-item-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.linkage-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.detail-label {
  color: #909399;
}

.mapping-container {
  width: 100%;
}

.mapping-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
</style>
