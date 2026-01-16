<!--
  ChartDataSourceConfig.vue

  图表数据源配置组件

  用于配置图表的数据源，支持：
  - 静态数据：通过数据编辑器配置 categories 和 series
  - API 接口：配置 API URL 和请求方法

  @component ChartDataSourceConfig
  @author Report Designer Team
  @since 2025-01-16
-->
<template>
  <el-form-item label="数据源类型">
    <el-radio-group v-model="localDataSourceType" @change="handleDataSourceTypeChange">
      <el-radio value="static">静态数据</el-radio>
      <el-radio value="api">API 接口</el-radio>
    </el-radio-group>
  </el-form-item>

  <!-- 静态数据配置 -->
  <template v-if="localDataSourceType === 'static'">
    <el-form-item label="数据">
      <el-button size="small" @click="openEditor">编辑数据 ({{ dataPreview }})</el-button>
    </el-form-item>
    <el-form-item v-if="hasStaticData" label="数据预览">
      <div v-if="dataSource?.staticData?.categories" class="data-preview">
        <div class="data-preview-label">类别:</div>
        <div class="data-preview-value">{{ dataSource.staticData.categories.join(', ') }}</div>
        <div
          v-for="(s, idx) in dataSource.staticData.series.slice(0, 3)"
          :key="idx"
          class="data-preview-series"
        >
          <div class="data-preview-label">{{ s.name }}:</div>
          <div class="data-preview-value">{{ s.data.join(', ') }}</div>
        </div>
        <div v-if="dataSource.staticData.series.length > 3" class="data-preview-more">
          ...共 {{ dataSource.staticData.series.length }} 个系列
        </div>
      </div>
      <div v-else class="data-empty">暂无数据，点击上方按钮添加</div>
    </el-form-item>
  </template>

  <!-- API 配置 -->
  <template v-if="localDataSourceType === 'api'">
    <el-form-item label="API 地址">
      <el-input
        v-model="localApiUrl"
        placeholder="https://api.example.com/chart-data"
        @change="handleApiConfigChange"
      />
    </el-form-item>
    <el-form-item label="请求方法">
      <el-select v-model="localApiMethod" @change="handleApiConfigChange">
        <el-option label="GET" value="GET" />
        <el-option label="POST" value="POST" />
      </el-select>
    </el-form-item>

    <!-- 数据转换配置 -->
    <el-form-item label="数据转换">
      <el-button size="small" @click="transformConfigVisible = true">
        {{ transformConfigButtonText }}
      </el-button>
    </el-form-item>
  </template>

  <!-- 数据转换配置对话框 -->
  <el-dialog
    v-model="transformConfigVisible"
    title="配置数据转换"
    width="800px"
    @close="handleTransformConfigClose"
  >
    <DataTransformConfig
      v-model="transformConfig"
      @update="handleTransformConfigUpdate"
    />
    <template #footer>
      <el-button @click="transformConfigVisible = false">取消</el-button>
      <el-button type="primary" @click="handleTransformConfigSave">保存</el-button>
    </template>
  </el-dialog>

  <!-- 数据编辑器对话框 -->
  <el-dialog
    v-model="editorVisible"
    title="编辑图表数据"
    width="900px"
    :close-on-click-modal="false"
    @close="handleEditorCancel"
  >
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 表格视图 -->
      <el-tab-pane label="表格视图" name="table">
        <div class="data-editor-container">
          <!-- 工具栏 -->
          <div class="editor-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" size="small" @click="addCategoryColumn">
                <el-icon><Plus /></el-icon>
                添加列
              </el-button>
              <el-button size="small" @click="addSeriesRow">
                <el-icon><Plus /></el-icon>
                添加行
              </el-button>
              <el-button size="small" @click="clearAllData" type="danger" plain>
                <el-icon><Delete /></el-icon>
                清空数据
              </el-button>
            </div>
            <div class="toolbar-right">
              <el-button size="small" @click="exportData" :disabled="!hasData">
                <el-icon><Download /></el-icon>
                导出 JSON
              </el-button>
            </div>
          </div>

          <!-- 数据表格 -->
          <el-table
            :data="tableData"
            border
            stripe
            style="width: 100%; margin-top: 12px"
            :empty-text="hasData ? '' : '暂无数据，请添加列和行'"
          >
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column
              v-for="col in tableColumns"
              :key="col.prop"
              :prop="col.prop"
              :label="col.label"
              :width="col.prop === 'category' ? 150 : 150"
              align="center"
            >
              <template #header="{ column }">
                <div class="table-header-cell">
                  <el-input
                    v-if="column.label !== '类别'"
                    :model-value="column.label"
                    size="small"
                    @change="handleColumnNameChange(tableColumns.indexOf(column), $event)"
                  />
                  <span v-else>类别</span>
                  <el-icon
                    v-if="column.label !== '类别'"
                    class="delete-icon"
                    @click="removeSeriesByIndex(tableColumns.indexOf(column))"
                  >
                    <Close />
                  </el-icon>
                </div>
              </template>
              <template #default="{ row, $index }">
                <el-input
                  v-if="col.prop === 'category'"
                  v-model="row.category"
                  placeholder="输入类别名称"
                  size="small"
                  @change="handleTableCellChange"
                />
                <el-input-number
                  v-else
                  v-model="row[col.prop]"
                  :controls="false"
                  placeholder="0"
                  size="small"
                  @change="handleTableCellChange"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button
                  link
                  type="danger"
                  size="small"
                  @click="removeTableRow($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 数据统计 -->
          <div v-if="hasData" class="data-statistics">
            <el-descriptions :column="3" size="small" border>
              <el-descriptions-item label="类别数量">
                {{ editorCategories.length }} 个
              </el-descriptions-item>
              <el-descriptions-item label="系列数量">
                {{ editorSeries.length }} 个
              </el-descriptions-item>
              <el-descriptions-item label="数据点总数">
                {{ editorCategories.length * editorSeries.length }} 个
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-tab-pane>

      <!-- 表单视图 -->
      <el-tab-pane label="表单视图" name="form">
        <div class="form-editor-container">
          <!-- X轴类别 -->
          <el-form-item label="X轴类别">
            <div class="category-section">
              <div class="section-header">
                <span class="section-title">类别列表</span>
                <el-button type="primary" size="small" @click="addCategory">
                  添加类别
                </el-button>
              </div>
              <div v-if="editorCategories.length > 0" class="category-list">
                <div
                  v-for="(cat, idx) in editorCategories"
                  :key="idx"
                  class="category-item"
                >
                  <el-tag closable @close="removeCategory(idx)">
                    {{ cat }}
                  </el-tag>
                </div>
              </div>
              <el-empty
                v-else
                description="暂无类别，点击上方按钮添加"
                :image-size="80"
              />
            </div>
          </el-form-item>

          <!-- 系列数据 -->
          <el-form-item label="系列数据">
            <div class="series-section">
              <div class="section-header">
                <span class="section-title">数据系列</span>
                <el-button type="primary" size="small" @click="addSeries">
                  添加系列
                </el-button>
              </div>
              <div v-if="editorSeries.length === 0" class="empty-series">
                <el-empty
                  description="暂无系列，点击上方按钮添加"
                  :image-size="80"
                />
              </div>
              <div v-else class="series-list">
                <el-collapse v-model="activeSeries" accordion>
                  <el-collapse-item
                    v-for="(s, sIdx) in editorSeries"
                    :key="sIdx"
                    :name="sIdx"
                  >
                    <template #title>
                      <div class="series-collapse-header">
                        <span>{{ s.name || `系列 ${sIdx + 1}` }}</span>
                        <el-button
                          link
                          type="danger"
                          size="small"
                          @click.stop="removeSeries(sIdx)"
                        >
                          删除
                        </el-button>
                      </div>
                    </template>
                    <div class="series-form">
                      <el-form-item label="系列名称" label-width="90px" size="small">
                        <el-input
                          v-model="s.name"
                          placeholder="如：销售额"
                          @input="handleSeriesChange(s)"
                        />
                      </el-form-item>
                      <el-form-item label="数据值" label-width="90px" size="small">
                        <el-input
                          v-model="s.dataString"
                          type="textarea"
                          :rows="3"
                          placeholder="用逗号分隔的数值，如：120, 200, 150, 80, 70"
                          @input="handleSeriesDataChange(s)"
                        />
                        <div class="help-text">
                          <span>当前有 {{ editorCategories.length }} 个类别</span>
                          <span v-if="s.data.length !== editorCategories.length" class="warning-text">
                            （数据量不匹配：{{ s.data.length }} / {{ editorCategories.length }}）
                          </span>
                        </div>
                      </el-form-item>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </el-form-item>
        </div>
      </el-tab-pane>

      <!-- 快速导入 -->
      <el-tab-pane label="快速导入" name="import">
        <div class="quick-import-container">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          >
            从 Excel、CSV 或其他来源复制粘贴数据，系统会自动识别格式
          </el-alert>

          <el-form-item label="粘贴数据">
            <el-input
              v-model="importDataText"
              type="textarea"
              :rows="12"
              placeholder="示例格式（支持从 Excel 复制粘贴）：&#10;&#10;类别      销售额    利润&#10;一月      120      40&#10;二月      200      70&#10;三月      150      50&#10;&#10;或 JSON 格式：&#10;{&#10;  &quot;categories&quot;: [&quot;一月&quot;, &quot;二月&quot;],&#10;  &quot;series&quot;: [&#10;    { &quot;name&quot;: &quot;销售额&quot;, &quot;data&quot;: [120, 200] }&#10;  ]&#10;}"
              @input="handleImportDataChange"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="parseImportData">
              解析并导入
            </el-button>
            <el-button @click="clearImportData">
              清空
            </el-button>
          </el-form-item>

          <!-- 解析预览 -->
          <div v-if="importPreview" class="import-preview">
            <el-divider content-position="left">解析预览</el-divider>
            <el-table
              :data="importPreview.tableData"
              border
              size="small"
              max-height="300"
            >
              <el-table-column
                v-for="col in importPreview.columns"
                :key="col"
                :prop="col"
                :label="col"
                align="center"
              />
            </el-table>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="dialog-footer">
        <span class="footer-hint">
          <el-icon><InfoFilled /></el-icon>
          {{ dataHintText }}
        </span>
        <div class="footer-buttons">
          <el-button @click="handleEditorCancel">取消</el-button>
          <el-button type="primary" @click="handleEditorSave">保存数据</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Plus,
  Delete,
  Download,
  Close,
  InfoFilled,
} from '@element-plus/icons-vue';
import { updateComponent } from '../../../stores/designer';
import DataTransformConfig from './DataTransformConfig.vue';

interface ChartSeries {
  name: string;
  data: number[];
  dataString: string;
}

const props = defineProps<{
  component: any;
}>();

const emit = defineEmits<{
  (e: 'update'): void;
}>();

// 数据源类型
const localDataSourceType = ref('static');
const localApiUrl = ref('');
const localApiMethod = ref('GET');

// 备份的静态数据，用于在切换数据源类型时保留数据
const backedUpStaticData = ref<any>(null);

// 编辑器状态
const editorVisible = ref(false);
const editorCategories = ref<string[]>([]);
const editorSeries = ref<ChartSeries[]>([]);

// Tab 切换状态
const activeTab = ref('table');
const activeSeries = ref<number[]>([]);

// 表格视图相关
const tableData = ref<any[]>([]);
const tableColumns = ref<Array<{ prop: string; label: string }>>([]);

// 快速导入相关
const importDataText = ref('');
const importPreview = ref<any>(null);

// 计算属性
const hasData = computed(() => editorCategories.value.length > 0);

const dataHintText = computed(() => {
  if (editorCategories.value.length === 0) {
    return '请先添加类别（X轴）';
  }
  if (editorSeries.value.length === 0) {
    return '请添加至少一个数据系列';
  }
  const allValid = editorSeries.value.every(
    (s) => s.data.length === editorCategories.value.length
  );
  if (!allValid) {
    return '⚠️ 系列数据数量与类别数量不匹配';
  }
  return `✓ 数据完整：${editorCategories.value.length} 个类别 × ${editorSeries.value.length} 个系列`;
});

// 数据转换配置
const transformConfigVisible = ref(false);
const transformConfig = ref<any>(null);

// 数据转换配置按钮文本
const transformConfigButtonText = computed(() => {
  if (!dataSource.value?.transform) {
    return '配置数据转换';
  }
  const mode = dataSource.value.transform.mode || 'basic';
  return mode === 'basic' ? '已配置（基础模式）' : '已配置（高级模式）';
});

// 获取当前数据源
const dataSource = computed(() => props.component?.dataSource);

// 是否有静态数据
const hasStaticData = computed(() => {
  return (
    dataSource.value?.staticData &&
    dataSource.value.staticData.categories &&
    dataSource.value.staticData.categories.length > 0
  );
});

// 数据预览文本
const dataPreview = computed(() => {
  if (dataSource.value?.staticData?.series) {
    return `${dataSource.value.staticData.series.length} 个系列`;
  }
  return '0 个系列';
});

// 初始化数据源类型
function initDataSourceType() {
  if (dataSource.value?.type) {
    localDataSourceType.value = dataSource.value.type;
    if (dataSource.value.type === 'api') {
      localApiUrl.value = dataSource.value.apiUrl || '';
      localApiMethod.value = dataSource.value.apiMethod || 'GET';
    }
  } else {
    localDataSourceType.value = 'static';
  }

  // 备份当前静态数据（如果有的话）
  if (dataSource.value?.type === 'static' && dataSource.value?.staticData) {
    backedUpStaticData.value = JSON.parse(JSON.stringify(dataSource.value.staticData));
  }
}

// 监听组件变化，初始化数据源类型
watch(
  () => props.component,
  () => {
    initDataSourceType();
  },
  { immediate: true, deep: true }
);

// 处理数据源类型变化
function handleDataSourceTypeChange() {
  if (localDataSourceType.value === 'api') {
    // 切换到 API，备份当前静态数据
    if (dataSource.value?.type === 'static' && dataSource.value?.staticData) {
      backedUpStaticData.value = JSON.parse(JSON.stringify(dataSource.value.staticData));
    }
    updateComponent(props.component.id, {
      dataSource: {
        type: 'api',
        apiUrl: localApiUrl.value,
        apiMethod: localApiMethod.value as 'GET' | 'POST',
      },
    });
  } else {
    // 切换到静态数据，恢复之前备份的静态数据（如果有）
    updateComponent(props.component.id, {
      dataSource: {
        type: 'static',
        staticData: backedUpStaticData.value,
      },
    });
  }
  emit('update');
}

// 处理 API 配置变化
function handleApiConfigChange() {
  updateComponent(props.component.id, {
    dataSource: {
      type: 'api',
      apiUrl: localApiUrl.value,
      apiMethod: localApiMethod.value as 'GET' | 'POST',
    },
  });
  emit('update');
}

// 打开编辑器
function openEditor() {
  const ds = dataSource.value;
  if (ds?.staticData) {
    editorCategories.value = [...(ds.staticData.categories || [])];
    editorSeries.value = (ds.staticData.series || []).map((s: any) => ({
      name: s.name,
      data: [...s.data],
      dataString: s.data.join(', '),
    }));
    // 同步表格数据
    syncTableData();
  } else {
    editorCategories.value = [];
    editorSeries.value = [];
    tableData.value = [];
    tableColumns.value = [];
  }
  activeTab.value = 'table';
  editorVisible.value = true;
}

// 同步表格数据
function syncTableData() {
  // 构建表格列
  const columns: Array<{ prop: string; label: string }> = [
    { prop: 'category', label: '类别' },
  ];

  editorSeries.value.forEach((s, idx) => {
    columns.push({ prop: `series_${idx}`, label: s.name || `系列${idx + 1}` });
  });

  tableColumns.value = columns;

  // 构建表格数据
  const rows = editorCategories.value.map((cat, catIdx) => {
    const row: any = { category: cat };
    editorSeries.value.forEach((s, sIdx) => {
      row[`series_${sIdx}`] = s.data[catIdx] || 0;
    });
    return row;
  });

  tableData.value = rows;
}

// 表格视图 - 添加类别列（添加行）
function addSeriesRow() {
  if (editorSeries.value.length === 0) {
    ElMessage.warning('请先添加数据系列');
    return;
  }

  const categoryName = `类别${editorCategories.value.length + 1}`;
  editorCategories.value.push(categoryName);

  // 同步所有系列的数据
  editorSeries.value.forEach((s) => {
    s.data.push(0);
    s.dataString = s.data.join(', ');
  });

  syncTableData();
}

// 表格视图 - 添加系列列
function addCategoryColumn() {
  const newSeries = {
    name: `系列${editorSeries.value.length + 1}`,
    data: editorCategories.value.map(() => 0),
    dataString: editorCategories.value.map(() => '0').join(', '),
  };

  editorSeries.value.push(newSeries);
  syncTableData();
}

// 表格视图 - 删除行
function removeTableRow(index: number) {
  editorCategories.value.splice(index, 1);

  // 同步所有系列的数据
  editorSeries.value.forEach((s) => {
    s.data.splice(index, 1);
    s.dataString = s.data.join(', ');
  });

  syncTableData();
}

// 表格视图 - 删除列
function removeSeriesByIndex(columnIndex: number) {
  if (columnIndex === 0) return; // 不能删除类别列

  const seriesIndex = columnIndex - 1;
  editorSeries.value.splice(seriesIndex, 1);
  syncTableData();
}

// 表格视图 - 列名称变化处理
function handleColumnNameChange(columnIndex: number, newName: string) {
  if (columnIndex === 0) return; // 类别列不能修改名称

  const seriesIndex = columnIndex - 1;
  if (editorSeries.value[seriesIndex]) {
    editorSeries.value[seriesIndex].name = newName;
    // 更新表格列的标签
    syncTableData();
  }
}

// 表格单元格变化处理
function handleTableCellChange() {
  // 从表格数据同步回 editorSeries
  editorSeries.value.forEach((s, sIdx) => {
    s.data = tableData.value.map((row) => {
      const val = row[`series_${sIdx}`];
      return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    s.dataString = s.data.join(', ');
  });

  // 同步类别
  editorCategories.value = tableData.value.map((row) => row.category);
}

// 清空所有数据
function clearAllData() {
  if (!confirm('确定要清空所有数据吗？')) return;

  editorCategories.value = [];
  editorSeries.value = [];
  tableData.value = [];
  tableColumns.value = [{ prop: 'category', label: '类别' }];
}

// 导出数据
function exportData() {
  const data = {
    categories: [...editorCategories.value],
    series: editorSeries.value.map((s) => ({
      name: s.name,
      data: [...s.data],
    })),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chart-data-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  ElMessage.success('数据已导出');
}

// 系列数据变化处理
function handleSeriesChange(series: ChartSeries) {
  syncTableData();
}

function handleSeriesDataChange(series: ChartSeries) {
  parseSeriesData(series);
  syncTableData();
}

// 快速导入 - 处理导入数据变化
function handleImportDataChange() {
  // 实时预览解析
  try {
    const parsed = parseImportDataText(importDataText.value);
    if (parsed) {
      importPreview.value = parsed;
    }
  } catch (e) {
    // 忽略解析错误，等到用户点击"解析并导入"
  }
}

// 解析导入数据文本
function parseImportDataText(text: string) {
  if (!text.trim()) return null;

  // 尝试解析 JSON
  if (text.trim().startsWith('{')) {
    try {
      const data = JSON.parse(text);
      // 验证格式
      if (data.categories && data.series) {
        return {
          columns: ['类别', ...data.series.map((s: any) => s.name)],
          tableData: data.categories.map((cat: string, idx: number) => {
            const row: any = { 类别: cat };
            data.series.forEach((s: any, sIdx: number) => {
              row[s.name] = s.data[idx];
            });
            return row;
          }),
        };
      }
    } catch (e) {
      // 不是 JSON，继续尝试其他格式
    }
  }

  // 尝试解析表格格式（制表符或多个空格分隔）
  const lines = text.trim().split('\n').filter((line) => line.trim());
  if (lines.length < 2) return null;

  // 分割列
  const separator = lines[0].includes('\t') ? '\t' : /\s{2,}/;
  const headers = lines[0].split(separator).map((h) => h.trim());

  const tableData = lines.slice(1).map((line) => {
    const values = line.split(separator).map((v) => v.trim());
    const row: any = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    return row;
  });

  return { columns: headers, tableData };
}

// 解析并导入数据
function parseImportData() {
  const parsed = parseImportDataText(importDataText.value);

  if (!parsed) {
    ElMessage.error('无法识别数据格式，请检查输入');
    return;
  }

  // 从预览数据提取图表数据
  const categories = parsed.tableData.map((row: any) => row[parsed.columns[0]]);
  const series: any[] = [];

  parsed.columns.slice(1).forEach((colName, idx) => {
    series.push({
      name: colName,
      data: parsed.tableData.map((row: any) => {
        const val = parseFloat(row[colName]);
        return isNaN(val) ? 0 : val;
      }),
      dataString: '',
    });
  });

  // 更新编辑器数据
  editorCategories.value = categories;
  editorSeries.value = series.map((s) => ({
    ...s,
    dataString: s.data.join(', '),
  }));

  syncTableData();

  // 切换到表格视图
  activeTab.value = 'table';

  // 清空导入数据
  clearImportData();

  ElMessage.success(`成功导入 ${categories.length} 个类别、${series.length} 个系列`);
}

// 清空导入数据
function clearImportData() {
  importDataText.value = '';
  importPreview.value = null;
}

// 添加类别
function addCategory() {
  const categoryName = prompt('请输入类别名称：');
  if (categoryName && categoryName.trim()) {
    editorCategories.value.push(categoryName.trim());
    syncTableData();
  }
}

// 移除类别
function removeCategory(index: number) {
  editorCategories.value.splice(index, 1);
  // 同步更新所有系列的数据
  editorSeries.value.forEach((s) => {
    s.data.splice(index, 1);
    s.dataString = s.data.join(', ');
  });
  syncTableData();
}

// 添加系列
function addSeries() {
  editorSeries.value.push({
    name: `系列 ${editorSeries.value.length + 1}`,
    data: editorCategories.value.map(() => 0),
    dataString: editorCategories.value.map(() => '0').join(', '),
  });
  syncTableData();
}

// 移除系列
function removeSeries(index: number) {
  editorSeries.value.splice(index, 1);
  syncTableData();
}

// 解析系列数据
function parseSeriesData(series: ChartSeries) {
  const values = series.dataString.split(',').map((v: string) => {
    const num = parseFloat(v.trim());
    return isNaN(num) ? 0 : num;
  });
  series.data = values;
}

// 保存编辑器内容
function handleEditorSave() {
  // 验证数据
  if (editorCategories.value.length === 0) {
    ElMessage.warning('请至少添加一个类别');
    return;
  }
  if (editorSeries.value.length === 0) {
    ElMessage.warning('请至少添加一个系列');
    return;
  }

  // 检查数据数量是否一致
  const valid = editorSeries.value.every((s) => s.data.length === editorCategories.value.length);
  if (!valid) {
    ElMessage.warning('所有系列的数据数量必须与类别数量一致');
    return;
  }

  // 构建 staticData
  const staticData = {
    categories: [...editorCategories.value],
    series: editorSeries.value.map((s) => ({
      name: s.name,
      data: [...s.data],
    })),
  };

  console.log('[DEBUG] handleEditorSave - Saving staticData:', staticData);

  // 同时更新备份
  backedUpStaticData.value = JSON.parse(JSON.stringify(staticData));

  // 更新组件的 dataSource
  updateComponent(props.component.id, {
    dataSource: {
      type: 'static',
      staticData,
    },
  });

  console.log('[DEBUG] handleEditorSave - After updateComponent, dataSource:', props.component.dataSource);

  editorVisible.value = false;
  emit('update');
  ElMessage.success('数据已保存');
}

// 取消编辑
function handleEditorCancel() {
  editorVisible.value = false;
  editorCategories.value = [];
  editorSeries.value = [];
}

// 打开数据转换配置
function openTransformConfig() {
  if (dataSource.value?.transform) {
    transformConfig.value = { ...dataSource.value.transform };
  } else {
    // 默认基础模式配置
    transformConfig.value = {
      mode: 'basic',
      basic: {
        dataPath: 'data',
        categoryField: '',
        seriesFields: [{ name: '数值', field: 'value' }],
      },
    };
  }
  transformConfigVisible.value = true;
}

// 更新数据转换配置
function handleTransformConfigUpdate(config: any) {
  transformConfig.value = config;
}

// 保存数据转换配置
function handleTransformConfigSave() {
  if (!transformConfig.value) return;

  updateComponent(props.component.id, {
    dataSource: {
      ...dataSource.value,
      transform: transformConfig.value,
    },
  });

  transformConfigVisible.value = false;
  emit('update');
  ElMessage.success('数据转换配置已保存');
}

// 关闭数据转换配置
function handleTransformConfigClose() {
  // 不保存，直接关闭
  transformConfigVisible.value = false;
}
</script>

<style scoped>
/* 数据预览 */
.data-preview {
  font-size: 12px;
  color: #606266;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
}

.data-preview-label {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.data-preview-value {
  margin-bottom: 8px;
  color: #606266;
}

.data-preview-series {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #dcdfe6;
}

.data-preview-more {
  margin-top: 8px;
  color: #909399;
  font-style: italic;
}

.data-empty {
  font-size: 12px;
  color: #909399;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

/* 表格视图样式 */
.data-editor-container {
  padding: 12px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
}

.table-header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.table-header-cell .el-input {
  width: 100px;
  flex-shrink: 0;
}

.delete-icon {
  cursor: pointer;
  color: #909399;
  font-size: 14px;
  flex-shrink: 0;
}

.delete-icon:hover {
  color: #f56c6c;
}

.data-statistics {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

/* 表单视图样式 */
.form-editor-container {
  padding: 12px;
}

.category-section,
.series-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.section-title {
  font-weight: 500;
  color: #303133;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  min-height: 60px;
}

.category-item {
  display: inline-block;
}

.series-list {
  width: 100%;
}

.empty-series {
  padding: 20px;
  background: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.series-collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-weight: 500;
}

.series-form {
  padding: 12px 0;
}

.help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

.warning-text {
  color: #e6a23c;
  margin-left: 8px;
}

/* 快速导入样式 */
.quick-import-container {
  padding: 12px;
}

.import-preview {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.footer-buttons {
  display: flex;
  gap: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .editor-toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
}
</style>
