<!--
  App.vue

  报表设计器主应用组件

  这是报表设计器的根组件，包含：
  - 工具栏：新建、撤销、重做、保存、预览等操作
  - 组件库面板：左侧面板，包含所有可拖拽的组件
  - 画布面板：中间区域，用于设计和预览报表
  - 属性面板：右侧面板，用于配置选中组件的属性

  @component App
  @author Report Designer Team
  @since 2025-01-14
-->
<template>
  <div class="report-designer">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button :icon="DocumentAdd" @click="handleNew">新建</el-button>
      <el-button :disabled="!canUndo" :icon="Back" @click="handleUndo">撤销</el-button>
      <el-button :disabled="!canRedo" :icon="Right" @click="handleRedo">重做</el-button>
      <el-button :icon="Download" @click="handleSave">保存</el-button>
      <el-button :icon="View" @click="handlePreview">预览</el-button>
      <el-divider direction="vertical" />
      <span style="color: #909399; font-size: 12px"
        >💡 提示：点击组件选中后，拖拽蓝色手柄可移动组件</span
      >
    </div>

    <!-- 主体内容 -->
    <div class="designer-main">
      <!-- 左侧组件库 -->
      <div class="left-panel">
        <div class="panel-header">
          <h3>组件库</h3>
        </div>

        <div class="panel-content">
          <div class="component-group">
            <div class="group-title">基础组件</div>
            <div
              v-for="item in basicComponents"
              :key="item.type"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart(item, $event)"
            >
              <div class="component-icon">
                <component :is="item.icon" />
              </div>
              <div class="component-label">{{ item.label }}</div>
            </div>
          </div>

          <div class="component-group">
            <div class="group-title">图表组件</div>
            <div
              v-for="item in chartComponents"
              :key="item.type"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart(item, $event)"
            >
              <div class="component-icon">
                <component :is="item.icon" />
              </div>
              <div class="component-label">{{ item.label }}</div>
            </div>
          </div>

          <div class="component-group">
            <div class="group-title">形状组件</div>
            <div
              v-for="item in shapeComponents"
              :key="item.type"
              class="component-item"
              draggable="true"
              @dragstart="handleDragStart(item, $event)"
            >
              <div class="component-icon">
                <component :is="item.icon" />
              </div>
              <div class="component-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间画布区域 -->
      <div class="canvas-panel">
        <div
          ref="canvasRef"
          class="canvas-content"
          :class="{ 'drag-over': draggingComponentId || isDraggingFromLibrary }"
          :style="canvasStyle"
          @dragover.prevent="handleCanvasDragOver"
          @dragenter.prevent
          @dragleave="handleCanvasDragLeave"
          @drop="handleCanvasDropFromLibrary"
          @click.self="handleCanvasClick"
        >
          <div class="canvas-content-inner">
            <!-- 渲染所有组件 -->
            <template v-for="(component, index) in orderedComponents" :key="component.id">
              <div
                :data-component-id="component.id"
                class="canvas-component-wrapper"
                :class="`width-${component.widthPercent}`"
              >
                <!-- 拖拽手柄 -->
                <div
                  v-if="selectedIds.includes(component.id)"
                  class="drag-handle"
                  draggable="true"
                  title="按住拖拽移动组件"
                  @dragstart="handleComponentDragStart(component, $event)"
                  @dragend="handleComponentDragEnd"
                >
                  <el-icon><Rank /></el-icon>
                  <span class="drag-handle-tip">拖拽</span>
                </div>

                <!-- 组件内容 -->
                <div
                  class="canvas-component"
                  :class="[
                    { selected: selectedIds.includes(component.id) },
                    { dragging: draggingComponentId === component.id },
                  ]"
                  :style="getComponentStyle(component)"
                  @click.stop="(e) => handleComponentClick(component, e)"
                >
                  <!-- 文本组件 -->
                  <template v-if="component.type === 'text'">
                    <div class="text-content" :style="getTextStyle(component)">
                      {{ component.content }}
                    </div>
                  </template>

                  <!-- 图片组件 -->
                  <template v-else-if="component.type === 'image'">
                    <div class="image-container">
                      <div v-if="!component.src" class="image-placeholder">
                        <el-icon><Picture /></el-icon>
                        <span>图片</span>
                      </div>
                      <img v-else :src="component.src" alt="" class="image-content" />
                    </div>
                  </template>

                  <!-- 表格组件 -->
                  <template v-else-if="component.type === 'table'">
                    <TableRenderer
                      :component="component"
                      :selected="selectedIds.includes(component.id)"
                      @update="updateComponent"
                    />
                  </template>

                  <!-- 图表组件 -->
                  <template v-else-if="component.type === 'chart'">
                    <div :ref="(el) => setChartRef(component.id, el)" class="chart-container"></div>
                  </template>

                  <!-- 柱状图 -->
                  <template v-else-if="component.type === 'bar-chart'">
                    <div :ref="(el) => setChartRef(component.id, el)" class="chart-container"></div>
                  </template>

                  <!-- 折线图 -->
                  <template v-else-if="component.type === 'line-chart'">
                    <div :ref="(el) => setChartRef(component.id, el)" class="chart-container"></div>
                  </template>

                  <!-- 饼图 -->
                  <template v-else-if="component.type === 'pie-chart'">
                    <div :ref="(el) => setChartRef(component.id, el)" class="chart-container"></div>
                  </template>

                  <!-- 散点图 -->
                  <template v-else-if="component.type === 'scatter-chart'">
                    <div :ref="(el) => setChartRef(component.id, el)" class="chart-container"></div>
                  </template>

                  <!-- 仪表盘 -->
                  <template v-else-if="component.type === 'gauge-chart'">
                    <div :ref="(el) => setChartRef(component.id, el)" class="chart-container"></div>
                  </template>

                  <!-- 漏斗图 -->
                  <template v-else-if="component.type === 'funnel-chart'">
                    <div :ref="(el) => setChartRef(component.id, el)" class="chart-container"></div>
                  </template>

                  <!-- 矩形组件 -->
                  <template v-else-if="component.type === 'rectangle'">
                    <div class="rectangle-content" :style="getRectangleStyle(component)"></div>
                  </template>

                  <!-- 线条组件 -->
                  <template v-else-if="component.type === 'line'">
                    <div class="line-content" :style="getLineStyle(component)"></div>
                  </template>

                  <!-- 表单组件 -->
                  <template v-else-if="component.type === 'form'">
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
                            <!-- 文本输入 -->
                            <el-form-item
                              v-if="item.type === 'text'"
                              :label="item.label"
                              :required="item.required"
                              :class="{ 'last-form-item': index === component.items.length - 1 }"
                            >
                              <el-input
                                :placeholder="item.placeholder"
                                :disabled="item.disabled"
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                              />
                              <div v-if="item.helpText" class="form-item-help">
                                {{ item.helpText }}
                              </div>
                            </el-form-item>

                            <!-- 数字输入 -->
                            <el-form-item
                              v-else-if="item.type === 'number'"
                              :label="item.label"
                              :required="item.required"
                              :class="{ 'last-form-item': index === component.items.length - 1 }"
                            >
                              <el-input-number
                                :placeholder="item.placeholder"
                                :disabled="item.disabled"
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                style="width: 100%"
                              />
                            </el-form-item>

                            <!-- 密码输入 -->
                            <el-form-item
                              v-else-if="item.type === 'password'"
                              :label="item.label"
                              :required="item.required"
                              :class="{ 'last-form-item': index === component.items.length - 1 }"
                            >
                              <el-input
                                type="password"
                                :placeholder="item.placeholder"
                                :disabled="item.disabled"
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                              />
                            </el-form-item>

                            <!-- 邮箱 -->
                            <el-form-item
                              v-else-if="item.type === 'email'"
                              :label="item.label"
                              :required="item.required"
                              :class="{ 'last-form-item': index === component.items.length - 1 }"
                            >
                              <el-input
                                type="email"
                                :placeholder="item.placeholder"
                                :disabled="item.disabled"
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                              />
                            </el-form-item>

                            <!-- 日期选择 -->
                            <el-form-item
                              v-else-if="item.type === 'date'"
                              :label="item.label"
                              :required="item.required"
                            >
                              <el-date-picker
                                type="date"
                                :placeholder="item.placeholder"
                                :disabled="item.disabled"
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                style="width: 100%"
                              />
                            </el-form-item>

                            <!-- 日期时间 -->
                            <el-form-item
                              v-else-if="item.type === 'datetime'"
                              :label="item.label"
                              :required="item.required"
                            >
                              <el-date-picker
                                type="datetime"
                                :placeholder="item.placeholder"
                                :disabled="item.disabled"
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                style="width: 100%"
                              />
                            </el-form-item>

                            <!-- 时间选择 -->
                            <el-form-item
                              v-else-if="item.type === 'time'"
                              :label="item.label"
                              :required="item.required"
                            >
                              <el-time-picker
                                :placeholder="item.placeholder"
                                :disabled="item.disabled"
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                style="width: 100%"
                              />
                            </el-form-item>

                            <!-- 下拉选择 -->
                            <el-form-item
                              v-else-if="item.type === 'select'"
                              :label="item.label"
                              :required="item.required"
                            >
                              <el-select
                                :placeholder="item.placeholder"
                                :disabled="item.disabled"
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                style="width: 100%"
                              >
                                <el-option
                                  v-for="opt in getFormItemOptions(item)"
                                  :key="opt.value"
                                  :label="opt.label"
                                  :value="opt.value"
                                  :disabled="opt.disabled"
                                />
                              </el-select>
                            </el-form-item>

                            <!-- 单选框组 -->
                            <el-form-item
                              v-else-if="item.type === 'radio'"
                              :label="item.label"
                              :required="item.required"
                            >
                              <el-radio-group
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                :disabled="item.disabled"
                              >
                                <el-radio
                                  v-for="opt in getFormItemOptions(item)"
                                  :key="opt.value"
                                  :label="opt.value"
                                  :disabled="opt.disabled"
                                >
                                  {{ opt.label }}
                                </el-radio>
                              </el-radio-group>
                            </el-form-item>

                            <!-- 复选框 -->
                            <el-form-item v-else-if="item.type === 'checkbox'" :label="item.label">
                              <el-checkbox-group
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                :disabled="item.disabled"
                              >
                                <el-checkbox
                                  v-for="opt in getFormItemOptions(item)"
                                  :key="opt.value"
                                  :label="opt.value"
                                  :disabled="opt.disabled"
                                >
                                  {{ opt.label }}
                                </el-checkbox>
                              </el-checkbox-group>
                            </el-form-item>

                            <!-- 开关 -->
                            <el-form-item v-else-if="item.type === 'switch'" :label="item.label">
                              <el-switch
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                :disabled="item.disabled"
                              />
                            </el-form-item>

                            <!-- 文本域 -->
                            <el-form-item
                              v-else-if="item.type === 'textarea'"
                              :label="item.label"
                              :required="item.required"
                            >
                              <el-input
                                type="textarea"
                                :placeholder="item.placeholder"
                                :disabled="item.disabled"
                                :rows="item.rows || 3"
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                              />
                            </el-form-item>

                            <!-- 滑块 -->
                            <el-form-item v-else-if="item.type === 'slider'" :label="item.label">
                              <el-slider
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue || 0"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                :disabled="item.disabled"
                                style="width: calc(100% - 20px)"
                              />
                            </el-form-item>

                            <!-- 评分 -->
                            <el-form-item v-else-if="item.type === 'rate'" :label="item.label">
                              <el-rate
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue || 0"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                :disabled="item.disabled"
                              />
                            </el-form-item>

                            <!-- 颜色选择 -->
                            <el-form-item v-else-if="item.type === 'color'" :label="item.label">
                              <el-color-picker
                                :model-value="getFieldValue(component.id, item.field) || item.defaultValue"
                                @update:model-value="(val) => setFieldValue(component.id, item.field, val)"
                                :disabled="item.disabled"
                              />
                            </el-form-item>

                            <!-- 按钮 -->
                            <el-form-item v-else-if="item.type === 'button'">
                              <div style="width: 100%; display: flex; justify-content: flex-end;">
                                <el-button
                                  :type="item.buttonType || 'default'"
                                  :size="item.buttonSize || 'default'"
                                  :plain="item.plain || false"
                                  :round="item.round || false"
                                  :circle="item.circle || false"
                                  :disabled="item.disabled"
                                  @click="handleFormItemButtonClick(component, item)"
                                >
                                  {{ item.label }}
                                </el-button>
                              </div>
                            </el-form-item>
                          </el-col>
                        </el-row>
                      </el-form>
                    </div>
                  </template>

                  <!-- 选中时显示调整手柄 -->
                  <template v-if="selectedIds.includes(component.id) && !draggingComponentId">
                    <div
                      class="resize-handle bottom-right"
                      @mousedown.stop="handleResizeStart(component, $event)"
                    ></div>
                  </template>
                </div>

                <!-- 插入指示器 -->
                <div
                  v-if="(draggingComponentId || isDraggingFromLibrary) && dropIndex === index"
                  class="insert-indicator insert-left"
                ></div>
              </div>
            </template>

            <!-- 最后位置的插入指示器 -->
            <div
              v-if="
                (draggingComponentId || isDraggingFromLibrary) &&
                dropIndex === orderedComponents.length
              "
              class="insert-indicator insert-end"
            ></div>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="right-panel">
        <div class="panel-header">
          <h3>属性面板</h3>
        </div>
        <div class="panel-content">
          <el-empty v-if="!selectedComponent" description="请选择一个组件" />
          <div v-else>
            <p><strong>组件类型:</strong> {{ selectedComponent.type }}</p>
            <p><strong>组件ID:</strong> {{ selectedComponent.id }}</p>
            <el-divider />

            <el-form label-width="80px" size="small">
              <el-form-item label="宽度">
                <el-select id="component-width" v-model="selectedComponent.widthPercent">
                  <el-option label="100%" value="100" />
                  <el-option label="50%" value="50" />
                  <el-option label="33%" value="33" />
                </el-select>
              </el-form-item>
              <el-form-item label="高度">
                <el-input-number
                  id="component-height"
                  v-model="selectedComponent.height"
                  :min="50"
                  :max="2000"
                />
              </el-form-item>
              <el-form-item label="排序">
                <el-input-number id="component-order" v-model="selectedComponent.order" :min="0" />
              </el-form-item>
              <el-form-item label="可见">
                <el-switch id="component-visible" v-model="selectedComponent.visible" />
              </el-form-item>
              <el-form-item label="锁定">
                <el-switch id="component-locked" v-model="selectedComponent.locked" />
              </el-form-item>
            </el-form>

            <!-- 文本组件额外属性 -->
            <template v-if="selectedComponent.type === 'text'">
              <el-divider>文本属性</el-divider>
              <el-form label-width="80px" size="small">
                <el-form-item label="内容">
                  <el-input id="text-content" v-model="selectedComponent.content" type="textarea" />
                </el-form-item>
                <el-form-item label="字号">
                  <el-input-number
                    id="text-font-size"
                    v-model="selectedComponent.fontSize"
                    :min="8"
                    :max="72"
                  />
                </el-form-item>
                <el-form-item label="颜色">
                  <el-color-picker id="text-color" v-model="selectedComponent.color" />
                </el-form-item>
              </el-form>
            </template>

            <!-- 表格组件额外属性 -->
            <template v-if="selectedComponent.type === 'table'">
              <el-divider>表格属性</el-divider>

              <!-- 基础配置 -->
              <el-collapse v-model="tableCollapseActive" accordion>
                <el-collapse-item title="基础设置" name="basic">
                  <el-form label-width="80px" size="small">
                    <el-form-item label="显示表头">
                      <el-switch id="table-show-header" v-model="selectedComponent.showHeader" />
                    </el-form-item>
                    <el-form-item label="斑马纹">
                      <el-switch id="table-stripe" v-model="selectedComponent.stripe" />
                    </el-form-item>
                    <el-form-item label="边框">
                      <el-switch id="table-border" v-model="selectedComponent.border" />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>

                <!-- 表头样式 -->
                <el-collapse-item title="表头样式" name="header">
                  <el-form label-width="80px" size="small">
                    <el-form-item label="背景色">
                      <el-color-picker
                        id="table-header-bg-color"
                        v-model="selectedComponent.headerBackgroundColor"
                      />
                    </el-form-item>
                    <el-form-item label="文字颜色">
                      <el-color-picker
                        id="table-header-color"
                        v-model="selectedComponent.headerColor"
                      />
                    </el-form-item>
                    <el-form-item label="字号">
                      <el-input-number
                        id="table-font-size"
                        v-model="selectedComponent.fontSize"
                        :min="10"
                        :max="24"
                      />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>

                <!-- 列配置 -->
                <el-collapse-item title="列配置" name="columns">
                  <div style="margin-bottom: 12px">
                    <el-button type="primary" size="small" @click="addTableColumn"
                      >添加列</el-button
                    >
                  </div>

                  <el-table :data="selectedComponent.columns" border size="small" max-height="300">
                    <el-table-column prop="label" label="列名" width="100">
                      <template #default="{ row, $index }">
                        <el-input :id="`column-label-${$index}`" v-model="row.label" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="field" label="字段" width="100">
                      <template #default="{ row, $index }">
                        <el-input :id="`column-field-${$index}`" v-model="row.field" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="width" label="宽度" width="80">
                      <template #default="{ row, $index }">
                        <el-input-number
                          :id="`column-width-${$index}`"
                          v-model="row.width"
                          :min="0"
                          :max="500"
                          size="small"
                          controls-position="right"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column prop="align" label="对齐" width="80">
                      <template #default="{ row, $index }">
                        <el-select :id="`column-align-${$index}`" v-model="row.align" size="small">
                          <el-option label="左" value="left" />
                          <el-option label="中" value="center" />
                          <el-option label="右" value="right" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column prop="fixed" label="固定" width="80">
                      <template #default="{ row, $index }">
                        <el-select :id="`column-fixed-${$index}`" v-model="row.fixed" size="small">
                          <el-option label="否" value="" />
                          <el-option label="左" value="left" />
                          <el-option label="右" value="right" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                      <template #default="{ $index }">
                        <el-button
                          link
                          type="primary"
                          size="small"
                          :disabled="$index === 0"
                          @click="moveTableColumn($index, 'up')"
                        >
                          上移
                        </el-button>
                        <el-button
                          link
                          type="primary"
                          size="small"
                          :disabled="$index === selectedComponent.columns.length - 1"
                          @click="moveTableColumn($index, 'down')"
                        >
                          下移
                        </el-button>
                        <el-button
                          link
                          type="danger"
                          size="small"
                          @click="removeTableColumn($index)"
                        >
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <div style="margin-top: 8px; font-size: 12px; color: #909399">
                    提示：宽度设为 0 时将自适应铺满剩余空间
                  </div>
                </el-collapse-item>

                <!-- 数据源配置 -->
                <el-collapse-item title="数据源" name="datasource">
                  <el-form label-width="80px" size="small">
                    <el-form-item label="数据源类型">
                      <el-radio-group id="table-datasource-type" v-model="tableDataSourceType">
                        <el-radio value="static">静态数据</el-radio>
                        <el-radio value="api">API 接口</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <!-- 静态数据 -->
                    <template v-if="tableDataSourceType === 'static'">
                      <el-form-item label="数据">
                        <el-button size="small" @click="openStaticDataEditor"
                          >编辑数据 ({{ staticData.length }} 条)</el-button
                        >
                      </el-form-item>
                      <el-form-item v-if="staticDataPreview.length > 0" label="数据预览">
                        <el-table
                          :data="staticDataPreview"
                          border
                          size="small"
                          max-height="200"
                          :show-header="false"
                        >
                          <el-table-column
                            v-for="col in selectedComponent.columns"
                            :key="col.field"
                            :prop="col.field"
                            :label="col.label"
                            :width="col.width === 0 ? undefined : col.width"
                          />
                        </el-table>
                      </el-form-item>
                    </template>

                    <!-- API 配置 -->
                    <template v-if="tableDataSourceType === 'api'">
                      <el-form-item label="API 地址">
                        <el-input
                          id="table-api-url"
                          v-model="tableApiUrl"
                          placeholder="https://api.example.com/data"
                        />
                      </el-form-item>
                      <el-form-item label="请求方法">
                        <el-select id="table-api-method" v-model="tableApiMethod">
                          <el-option label="GET" value="GET" />
                          <el-option label="POST" value="POST" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="数据路径">
                        <el-input
                          id="table-data-path"
                          v-model="tableDataPath"
                          placeholder="data.items"
                        />
                        <span style="font-size: 12px; color: #909399">从响应中提取数据的路径</span>
                      </el-form-item>
                    </template>
                  </el-form>
                </el-collapse-item>

                <!-- 分页配置 -->
                <el-collapse-item title="分页设置" name="pagination">
                  <el-form label-width="80px" size="small">
                    <el-form-item label="启用分页">
                      <el-switch id="table-pagination" v-model="selectedComponent.pagination" />
                    </el-form-item>
                    <el-form-item v-if="selectedComponent.pagination ?? true" label="每页条数">
                      <el-input-number
                        id="table-page-size"
                        v-model="selectedComponent.pageSize"
                        :min="1"
                        :max="100"
                      />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>
              </el-collapse>
            </template>

            <!-- 表单组件额外属性 -->
            <template v-if="selectedComponent.type === 'form'">
              <el-divider>表单属性</el-divider>

              <el-collapse v-model="formCollapseActive" accordion>
                <!-- 表单布局 -->
                <el-collapse-item title="布局设置" name="layout">
                  <el-form label-width="80px" size="small">
                    <el-form-item label="列数">
                      <el-radio-group id="form-columns" v-model="selectedComponent.columns">
                        <el-radio :value="1">一列</el-radio>
                        <el-radio :value="2">两列</el-radio>
                        <el-radio :value="3">三列</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="标签位置">
                      <el-radio-group
                        id="form-label-position"
                        v-model="selectedComponent.labelPosition"
                      >
                        <el-radio label="left">左对齐</el-radio>
                        <el-radio label="right">右对齐</el-radio>
                        <el-radio label="top">顶部</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="标签宽度">
                      <el-input-number
                        id="form-label-width"
                        v-model="selectedComponent.labelWidth"
                        :min="40"
                        :max="200"
                      />
                    </el-form-item>
                    <el-form-item label="表单尺寸">
                      <el-radio-group id="form-size" v-model="selectedComponent.size">
                        <el-radio label="large">大</el-radio>
                        <el-radio label="default">中</el-radio>
                        <el-radio label="small">小</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="显示边框">
                      <el-switch id="form-show-border" v-model="selectedComponent.showBorder" />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>

                <!-- 表单项配置 -->
                <el-collapse-item title="表单项" name="items">
                  <div style="margin-bottom: 12px; display: flex; gap: 8px">
                    <el-select
                      v-model="newFormItemType"
                      placeholder="选择表单项类型"
                      style="width: 200px"
                      size="small"
                    >
                      <el-option label="文本输入" value="text" />
                      <el-option label="数字输入" value="number" />
                      <el-option label="密码输入" value="password" />
                      <el-option label="邮箱" value="email" />
                      <el-option label="日期选择" value="date" />
                      <el-option label="日期时间" value="datetime" />
                      <el-option label="时间选择" value="time" />
                      <el-option label="下拉选择" value="select" />
                      <el-option label="单选框" value="radio" />
                      <el-option label="复选框" value="checkbox" />
                      <el-option label="开关" value="switch" />
                      <el-option label="文本域" value="textarea" />
                      <el-option label="滑块" value="slider" />
                      <el-option label="评分" value="rate" />
                      <el-option label="颜色选择" value="color" />
                      <el-option label="按钮" value="button" />
                    </el-select>
                    <el-button type="primary" size="small" @click="handleAddFormItem"
                      >添加</el-button
                    >
                  </div>

                  <el-table
                    v-if="selectedFormComponent?.items"
                    :data="selectedFormComponent.items"
                    border
                    size="small"
                    max-height="400"
                  >
                    <el-table-column prop="label" label="标签" width="100">
                      <template #default="{ row }">
                        <el-input v-model="row.label" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="field" label="字段" width="100">
                      <template #default="{ row }">
                        <el-input v-model="row.field" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="type" label="类型" width="100">
                      <template #default="{ row }">
                        <el-select v-model="row.type" size="small">
                          <el-option label="文本" value="text" />
                          <el-option label="数字" value="number" />
                          <el-option label="密码" value="password" />
                          <el-option label="邮箱" value="email" />
                          <el-option label="日期" value="date" />
                          <el-option label="日期时间" value="datetime" />
                          <el-option label="时间" value="time" />
                          <el-option label="下拉" value="select" />
                          <el-option label="单选" value="radio" />
                          <el-option label="复选" value="checkbox" />
                          <el-option label="开关" value="switch" />
                          <el-option label="文本域" value="textarea" />
                          <el-option label="滑块" value="slider" />
                          <el-option label="评分" value="rate" />
                          <el-option label="颜色" value="color" />
                        </el-select>
                      </template>
                    </el-table-column>
                    <el-table-column label="必填" width="60">
                      <template #default="{ row }">
                        <el-switch v-model="row.required" size="small" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                      <template #default="{ $index }">
                        <el-button link type="primary" size="small" @click="editFormItem($index)">
                          配置
                        </el-button>
                        <el-button link type="danger" size="small" @click="removeFormItem($index)">
                          删除
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-collapse-item>
              </el-collapse>
            </template>

            <!-- 柱状图额外属性 -->
            <template v-if="selectedComponent.type === 'bar-chart'">
              <el-divider>柱状图属性</el-divider>
              <BarChartProperties :component="selectedComponent" @update="handleChartUpdate" />
            </template>

            <!-- 折线图额外属性 -->
            <template v-if="selectedComponent.type === 'line-chart'">
              <el-divider>折线图属性</el-divider>
              <LineChartProperties :component="selectedComponent" @update="handleChartUpdate" />
            </template>

            <!-- 饼图额外属性 -->
            <template v-if="selectedComponent.type === 'pie-chart'">
              <el-divider>饼图属性</el-divider>
              <PieChartProperties :component="selectedComponent" @update="handleChartUpdate" />
            </template>

            <!-- 散点图额外属性 -->
            <template v-if="selectedComponent.type === 'scatter-chart'">
              <el-divider>散点图属性</el-divider>
              <ScatterChartProperties :component="selectedComponent" @update="handleChartUpdate" />
            </template>

            <!-- 仪表盘额外属性 -->
            <template v-if="selectedComponent.type === 'gauge-chart'">
              <el-divider>仪表盘属性</el-divider>
              <GaugeChartProperties :component="selectedComponent" @update="handleChartUpdate" />
            </template>

            <!-- 漏斗图额外属性 -->
            <template v-if="selectedComponent.type === 'funnel-chart'">
              <el-divider>漏斗图属性</el-divider>
              <FunnelChartProperties :component="selectedComponent" @update="handleChartUpdate" />
            </template>

            <!-- 组件联动配置（所有组件通用） -->
            <el-divider>组件联动</el-divider>
            <ComponentLinkageConfig
              :component="selectedComponent"
              :all-components="currentDesign.components"
              :linkage-manager="linkageManager"
              @update="handleUpdate"
            />

            <el-divider />
            <el-button type="danger" :icon="Delete" @click="handleDelete">删除组件</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 静态数据编辑器对话框 -->
    <el-dialog
      v-model="staticDataEditorVisible"
      title="编辑静态数据"
      width="800px"
      @close="handleStaticDataCancel"
    >
      <div style="margin-bottom: 12px">
        <el-button type="primary" size="small" @click="addStaticDataRow">添加行</el-button>
        <el-button size="small" @click="clearStaticData">清空数据</el-button>
      </div>

      <el-table :data="staticData" border size="small" max-height="400">
        <el-table-column
          v-for="col in selectedComponent?.columns || []"
          :key="col.id"
          :prop="col.field"
          :label="col.label"
        >
          <template #default="{ row, $index }">
            <el-input
              :id="`static-data-${col.field}-${$index}`"
              v-model="row[col.field]"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="removeStaticDataRow($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="handleStaticDataCancel">取消</el-button>
        <el-button type="primary" @click="handleStaticDataSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 表单项编辑器对话框 -->
    <el-dialog
      v-model="formItemEditorVisible"
      title="编辑表单项"
      width="700px"
      @close="handleFormItemCancel"
    >
      <el-form v-if="editingFormItem" label-width="100px" size="small">
        <!-- 基本属性 -->
        <el-divider>基本属性</el-divider>
        <el-form-item label="字段名">
          <el-input v-model="editingFormItem.field" placeholder="字段名，用于数据提交" />
        </el-form-item>
        <el-form-item label="标签">
          <el-input v-model="editingFormItem.label" placeholder="表单项标签" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="editingFormItem.type" style="width: 100%">
            <el-option label="文本输入" value="text" />
            <el-option label="数字输入" value="number" />
            <el-option label="密码输入" value="password" />
            <el-option label="邮箱" value="email" />
            <el-option label="日期选择" value="date" />
            <el-option label="日期时间" value="datetime" />
            <el-option label="时间选择" value="time" />
            <el-option label="下拉选择" value="select" />
            <el-option label="单选框" value="radio" />
            <el-option label="复选框" value="checkbox" />
            <el-option label="开关" value="switch" />
            <el-option label="文本域" value="textarea" />
            <el-option label="滑块" value="slider" />
            <el-option label="评分" value="rate" />
            <el-option label="颜色选择" value="color" />
            <el-option label="按钮" value="button" />
          </el-select>
        </el-form-item>
        <el-form-item label="占位符">
          <el-input v-model="editingFormItem.placeholder" placeholder="输入提示" />
        </el-form-item>
        <el-form-item label="默认值">
          <el-input v-model="editingFormItem.defaultValue" placeholder="默认值" />
        </el-form-item>
        <el-form-item label="帮助文本">
          <el-input
            v-model="editingFormItem.helpText"
            placeholder="字段说明或帮助文本"
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <!-- 验证规则 -->
        <el-divider>验证规则</el-divider>
        <el-form-item label="必填">
          <el-switch v-model="editingFormItem.required" />
        </el-form-item>
        <el-form-item label="禁用">
          <el-switch v-model="editingFormItem.disabled" />
        </el-form-item>

        <!-- 验证规则列表 -->
        <el-form-item label="验证规则">
          <div style="width: 100%">
            <el-button size="small" style="margin-bottom: 8px" @click="addFormItemRule"
              >添加规则</el-button
            >
            <el-table
              v-if="editingFormItem.rules && editingFormItem.rules.length > 0"
              :data="editingFormItem.rules"
              border
              size="small"
              max-height="200"
            >
              <el-table-column label="必填" width="60">
                <template #default="{ row }">
                  <el-switch v-model="row.required" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="错误提示" width="150">
                <template #default="{ row }">
                  <el-input v-model="row.message" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="最小值" width="80">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.min"
                    size="small"
                    :controls="false"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="最大值" width="80">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.max"
                    size="small"
                    :controls="false"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="最小长度" width="90">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.minLength"
                    size="small"
                    :controls="false"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="最大长度" width="90">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.maxLength"
                    size="small"
                    :controls="false"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="removeFormItemRule($index)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <!-- 选项配置（仅用于 select、radio、checkbox） -->
        <template v-if="['select', 'radio', 'checkbox'].includes(editingFormItem.type)">
          <el-divider>选项配置</el-divider>

          <!-- 选项来源切换 -->
          <el-form-item label="选项来源">
            <el-radio-group v-model="editingFormItem.optionsSourceType">
              <el-radio value="static">静态选项</el-radio>
              <el-radio value="api">API 接口</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 静态选项配置 -->
          <template v-if="editingFormItem.optionsSourceType === 'static'">
            <el-form-item label="选项">
              <div style="width: 100%">
                <el-button size="small" style="margin-bottom: 8px" @click="addFormItemOption"
                  >添加选项</el-button
                >
                <el-table
                  v-if="editingFormItem.options && editingFormItem.options.length > 0"
                  :data="editingFormItem.options"
                  border
                  size="small"
                  max-height="200"
                >
                  <el-table-column label="标签" width="150">
                    <template #default="{ row }">
                      <el-input v-model="row.label" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="值" width="150">
                    <template #default="{ row }">
                      <el-input v-model="row.value" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="禁用" width="60">
                    <template #default="{ row }">
                      <el-switch v-model="row.disabled" size="small" />
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="60">
                    <template #default="{ $index }">
                      <el-button
                        link
                        type="danger"
                        size="small"
                        @click="removeFormItemOption($index)"
                        >删除</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form-item>
          </template>

          <!-- API 选项配置 -->
          <template
            v-else-if="
              editingFormItem.optionsSourceType === 'api' && editingFormItem.optionsApiConfig
            "
          >
            <el-form-item label="API 地址">
              <el-input
                v-model="editingFormItem.optionsApiConfig.url"
                placeholder="请输入 API 地址，如：/api/options"
              />
            </el-form-item>
            <el-form-item label="请求方法">
              <el-radio-group v-model="editingFormItem.optionsApiConfig.method">
                <el-radio value="GET">GET</el-radio>
                <el-radio value="POST">POST</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标签字段">
              <el-input
                v-model="editingFormItem.optionsApiConfig.labelField"
                placeholder="用于显示的字段名，如：name"
              />
              <span style="font-size: 12px; color: #909399; margin-left: 8px"
                >API 返回数据中作为选项标签的字段</span
              >
            </el-form-item>
            <el-form-item label="值字段">
              <el-input
                v-model="editingFormItem.optionsApiConfig.valueField"
                placeholder="用于值的字段名，如：id"
              />
              <span style="font-size: 12px; color: #909399; margin-left: 8px"
                >API 返回数据中作为选项值的字段</span
              >
            </el-form-item>
            <el-form-item label="请求头">
              <el-input
                v-model="editingFormItem.optionsApiConfigHeadersJson"
                type="textarea"
                :rows="2"
                placeholder='JSON 格式，如：{"Authorization": "Bearer token"}'
              />
            </el-form-item>
            <el-form-item label="请求参数">
              <el-input
                v-model="editingFormItem.optionsApiConfigParamsJson"
                type="textarea"
                :rows="2"
                placeholder='JSON 格式，如：{"category": "A"}'
              />
            </el-form-item>
          </template>
        </template>

        <!-- 布局配置 -->
        <el-divider>布局配置</el-divider>
        <el-form-item label="宽度">
          <el-radio-group v-model="editingFormItem.widthPercent">
            <el-radio value="100">100%</el-radio>
            <el-radio value="50">50%</el-radio>
            <el-radio value="33">33%</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="跨列数">
          <el-input-number v-model="editingFormItem.span" :min="1" :max="24" />
          <span style="margin-left: 8px; font-size: 12px; color: #909399">基于24列栅格系统</span>
        </el-form-item>

        <!-- 按钮配置（仅用于 button 类型） -->
        <template v-if="editingFormItem.type === 'button'">
          <el-divider>按钮配置</el-divider>
          <el-form-item label="按钮类型">
            <el-select v-model="editingFormItem.buttonType" style="width: 100%">
              <el-option label="默认" value="default" />
              <el-option label="主要" value="primary" />
              <el-option label="成功" value="success" />
              <el-option label="警告" value="warning" />
              <el-option label="危险" value="danger" />
              <el-option label="信息" value="info" />
              <el-option label="文本" value="text" />
            </el-select>
          </el-form-item>
          <el-form-item label="按钮尺寸">
            <el-radio-group v-model="editingFormItem.buttonSize">
              <el-radio value="large">大</el-radio>
              <el-radio value="default">中</el-radio>
              <el-radio value="small">小</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="朴素按钮">
            <el-switch v-model="editingFormItem.plain" />
          </el-form-item>
          <el-form-item label="圆角按钮">
            <el-switch v-model="editingFormItem.round" />
          </el-form-item>
          <el-form-item label="圆形按钮">
            <el-switch v-model="editingFormItem.circle" />
          </el-form-item>
          <el-form-item label="按钮图标">
            <el-input v-model="editingFormItem.icon" placeholder="Element Plus 图标名称，如：Search" />
            <div style="font-size: 12px; color: #909399; margin-top: 4px">
              可用图标：Search, Plus, Delete, Edit, Check, Close, ArrowDown 等
            </div>
          </el-form-item>

          <el-divider>动作配置</el-divider>
          <el-form-item label="动作类型">
            <el-select v-model="editingFormItem.actionType" style="width: 100%">
              <el-option label="无动作" value="" />
              <el-option label="提交表单" value="submit" />
              <el-option label="重置表单" value="reset" />
              <el-option label="刷新数据" value="refresh" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="editingFormItem.actionType === 'custom'" label="自定义代码">
            <el-input
              v-model="editingFormItem.customHandler"
              type="textarea"
              :rows="6"
              placeholder="自定义 JavaScript 代码&#10;&#10;可用变量：&#10;- component: 当前表单组件对象&#10;- item: 当前按钮配置对象&#10;&#10;示例：&#10;console.log('按钮被点击', component, item);&#10;alert('Hello ' + component.id);"
            />
            <div style="font-size: 12px; color: #909399; margin-top: 4px">
              此代码将在按钮点击时执行，用于实现自定义逻辑和组件联动
            </div>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="handleFormItemCancel">取消</el-button>
        <el-button type="primary" @click="handleFormItemSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 图表数据编辑器对话框 -->
    <el-dialog
      v-model="chartDataEditorVisible"
      title="编辑图表数据"
      width="700px"
      @close="handleChartDataCancel"
    >
      <el-form label-width="80px" size="small">
        <!-- X轴类别 -->
        <el-form-item label="X轴类别">
          <div style="margin-bottom: 8px">
            <el-button type="primary" size="small" @click="addChartCategory">添加类别</el-button>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px">
            <el-tag
              v-for="(cat, idx) in chartCategories"
              :key="idx"
              closable
              @close="removeChartCategory(idx)"
            >
              {{ cat }}
            </el-tag>
          </div>
          <div
            v-if="chartCategories.length === 0"
            style="font-size: 12px; color: #909399; margin-top: 8px"
          >
            点击上方按钮添加类别
          </div>
        </el-form-item>

        <!-- 系列数据 -->
        <el-form-item label="系列数据">
          <div style="margin-bottom: 12px">
            <el-button type="primary" size="small" @click="addChartSeries">添加系列</el-button>
          </div>
          <div v-if="chartSeries.length === 0" style="font-size: 12px; color: #909399">
            点击上方按钮添加数据系列
          </div>
          <div
            v-for="(s, sIdx) in chartSeries"
            :key="sIdx"
            style="
              border: 1px solid #dcdfe6;
              padding: 12px;
              margin-bottom: 12px;
              border-radius: 4px;
            "
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
              "
            >
              <span>系列 {{ sIdx + 1 }}</span>
              <el-button link type="danger" size="small" @click="removeChartSeries(sIdx)"
                >删除系列</el-button
              >
            </div>
            <el-form-item label="系列名称" label-width="80px" size="small">
              <el-input v-model="s.name" placeholder="如：销售额" />
            </el-form-item>
            <el-form-item label="数据值" label-width="80px" size="small">
              <el-input
                v-model="s.dataString"
                type="textarea"
                :rows="2"
                placeholder="用逗号分隔的数值，如：120, 200, 150, 80, 70"
                @input="parseSeriesData(s)"
              />
              <span style="font-size: 12px; color: #909399">
                数量必须与类别数量一致 ({{ chartCategories.length }} 个)
              </span>
            </el-form-item>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleChartDataCancel">取消</el-button>
        <el-button type="primary" @click="handleChartDataSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import {
  Document,
  Picture,
  DocumentAdd,
  Back,
  Right,
  Download,
  View,
  Delete,
  Rank,
} from '@element-plus/icons-vue';
import { useDesignerStore } from './stores/designer';
import type { Component } from './types';

// 使用 Pinia store
const designerStore = useDesignerStore();
const { selectedIds, canUndo, canRedo, updateComponent, currentDesign } = designerStore;
import TableRenderer from './components/canvas/renderers/TableRenderer.vue';
// 图表属性面板组件
import BarChartProperties from './components/properties-panel/properties/BarChartProperties.vue';
import LineChartProperties from './components/properties-panel/properties/LineChartProperties.vue';
import PieChartProperties from './components/properties-panel/properties/PieChartProperties.vue';
import ScatterChartProperties from './components/properties-panel/properties/ScatterChartProperties.vue';
import GaugeChartProperties from './components/properties-panel/properties/GaugeChartProperties.vue';
import FunnelChartProperties from './components/properties-panel/properties/FunnelChartProperties.vue';
// 联动配置组件
import ComponentLinkageConfig from './components/properties-panel/common/ComponentLinkageConfig.vue';

// 导入 composables
import {
  useToolbar,
  useDragDrop,
  useTableConfig,
  useFormConfig,
  useChartData,
  useComponentStyle,
  useChartGenerator,
  useComponentState,
  useComponentCreation,
  useChartRefManagement,
  useWatchers,
  useComponentLinkage,
  useFormData,
} from './composables';
import {
  basicComponents,
  chartComponents,
  shapeComponents,
} from './utils';

// ============ 组件状态管理 ============
const componentState = useComponentState();
const {
  canvasRef,
  chartRefsMap,
  chartInstancesMap,
  barChartCollapseActive,
  orderedComponents,
  selectedComponent,
  selectedFormComponent,
  canvasStyle,
} = componentState;

// ============ 组件创建 ============
const { createComponent } = useComponentCreation();

// ============ 拖拽和调整大小 ============
const dragDrop = useDragDrop(canvasRef, orderedComponents, createComponent);
const {
  draggingComponentId,
  dropIndex,
  isDraggingFromLibrary,
} = dragDrop;

// ============ 表格配置 ============
const tableConfig = useTableConfig(selectedComponent);
const {
  tableCollapseActive,
  tableDataSourceType,
  staticData,
  staticDataEditorVisible,
  staticDataPreview,
  tableApiUrl,
  tableApiMethod,
  tableDataPath,
} = tableConfig;

// ============ 表单配置 ============
const formConfig = useFormConfig(selectedFormComponent);
const {
  formCollapseActive,
  formItemEditorVisible,
  editingFormItem,
  newFormItemType,
  loadApiOptions,
} = formConfig;

// ============ 组件样式 ============
const { getComponentStyle, getTextStyle, getRectangleStyle, getLineStyle } = useComponentStyle();

// ============ 图表引用管理 ============
const chartRefManagement = useChartRefManagement(chartRefsMap);
const { setChartRef } = chartRefManagement;

// ============ 图表生成 ============
const chartGenerator = useChartGenerator(orderedComponents, chartRefsMap, chartInstancesMap);
const { initCharts, updateChart } = chartGenerator;

// ============ 图表数据 ============
const chartData = useChartData(selectedComponent, updateChart);
const {
  chartDataEditorVisible,
  chartDataSourceType,
  chartDataApiUrl,
  chartDataApiMethod,
  chartCategories,
  chartSeries,
  openChartDataEditor,
  addChartCategory,
  removeChartCategory,
  addChartSeries,
  removeChartSeries,
  parseSeriesData,
  handleChartDataSave,
  handleChartDataCancel,
  watchComponentChange,
} = chartData;

// ============ 组件联动管理 ============
const linkageManager = useComponentLinkage(currentDesign);

// ============ 表单数据管理 ============
const formDataManager = useFormData();
const { getFieldValue, setFieldValue, initFormData } = formDataManager;

// ============ 工具栏操作 ============
const toolbar = useToolbar();
const { handleChartUpdate: handleChartUpdateBase } = toolbar;

// ============ 监听器管理 ============
useWatchers({
  selectedComponent,
  orderedComponents,
  barChartCollapseActive,
  tableDataSourceType,
  staticData,
  tableApiUrl,
  tableApiMethod,
  tableDataPath,
  chartDataSourceType,
  chartCategories,
  chartSeries,
  chartDataApiUrl,
  chartDataApiMethod,
  editingFormItem,
  loadApiOptions,
  initCharts,
  updateChart,
});

// ============ 初始化 ============
onMounted(() => {
  setTimeout(() => {
    initCharts();
  }, 100);
});

// ============ 图表更新方法 ============
function handleChartUpdate() {
  handleChartUpdateBase(selectedComponent.value);
}

// ============ 工具栏方法 ============
const { handleNew, handleUndo, handleRedo, handleSave, handlePreview } = toolbar;

// ============ 拖拽和调整大小方法 ============
const {
  handleDragStart,
  handleCanvasDropFromLibrary,
  handleCanvasDragLeave,
  handleCanvasClick,
  handleComponentClick,
  handleComponentDragStart,
  handleComponentDragEnd,
  handleCanvasDragOver,
  handleResizeStart,
  handleDelete,
} = dragDrop;

// ============ 表格方法 ============
const {
  addTableColumn,
  removeTableColumn,
  moveTableColumn,
  openStaticDataEditor,
  addStaticDataRow,
  removeStaticDataRow,
  clearStaticData,
  handleStaticDataCancel,
  handleStaticDataSave,
} = tableConfig;

// ============ 表单方法 ============
const {
  handleAddFormItem,
  removeFormItem,
  editFormItem,
  handleFormItemSave,
  handleFormItemCancel,
  addFormItemOption,
  removeFormItemOption,
  getFormItemOptions,
  addFormItemRule,
  removeFormItemRule,
} = formConfig;

/**
 * 处理表单按钮点击事件
 * 用于组件间联动，预留扩展接口
 *
 * @param component - 表单组件
 * @param item - 被点击的按钮表单项
 */
function handleFormItemButtonClick(component: any, item: any) {
  console.log('[Form Button Click]', {
    formId: component.id,
    buttonId: item.id,
    buttonLabel: item.label,
    actionType: item.actionType,
    timestamp: new Date().toISOString()
  });

  // 收集表单数据
  const formData = collectFormData(component);

  // 触发组件联动
  linkageManager.triggerLinkage(
    component.id,
    'button.click',
    { buttonId: item.id, buttonLabel: item.label },
    formData,
    () => currentDesign.value.components
  );

  // 构建 action 对象
  const action = item.actionType ? {
    type: item.actionType,
    handler: item.customHandler,
  } : null;

  // 执行按钮配置的动作
  if (action) {
    switch (action.type) {
      case 'submit':
        // 提交表单 - 预留接口
        console.log('Action: Submit form', { component, item, formData });
        // TODO: 实现表单提交逻辑
        // 可以收集表单数据并发送到指定 URL
        break;
      case 'reset':
        // 重置表单 - 预留接口
        console.log('Action: Reset form', { component, item });
        // TODO: 实现表单重置逻辑
        // 可以重置表单所有字段到默认值
        break;
      case 'refresh':
        // 刷新数据 - 预留接口
        console.log('Action: Refresh data', { component, item });
        // TODO: 实现数据刷新逻辑
        // 可以重新加载表单关联的数据源
        break;
      case 'custom':
        // 自定义动作
        console.log('Action: Custom handler', { component, item, formData });
        if (action.handler) {
          try {
            // 创建安全的执行环境
            const customFn = new Function('component', 'item', 'console', 'data', action.handler);
            customFn(component, item, console, formData);
          } catch (error) {
            console.error('Custom handler error:', error);
            // 可以在这里添加错误提示
          }
        }
        break;
      default:
        console.log('Unknown action type:', action.type);
    }
  }
}

/**
 * 收集表单数据
 * 从表单组件中提取所有字段的值（使用响应式数据）
 */
function collectFormData(formComponent: any): Record<string, any> {
  const formData: Record<string, any> = {};

  if (!formComponent.items || !Array.isArray(formComponent.items)) {
    return formData;
  }

  // 遍历表单项，收集数据
  formComponent.items.forEach((item: any) => {
    if (item.type === 'button') {
      // 跳过按钮
      return;
    }

    // 从响应式数据源获取字段值
    if (item.field) {
      const value = getFieldValue(formComponent.id, item.field);
      formData[item.field] = value ?? item.defaultValue ?? '';
    }
  });

  console.log('[Form Data Collected]', formData);
  return formData;
}

</script>
<style>
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

.report-designer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #f0f2f5;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  gap: 8px;
}

.designer-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
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

.component-group {
  margin-bottom: 24px;
}

.component-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 12px;
}

.component-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: move;
  transition: all 0.2s ease;
}

.component-item:hover {
  background-color: #ecf5ff;
  border-color: #409eff;
  transform: translateX(4px);
}

.component-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 4px;
  margin-right: 12px;
  color: #409eff;
}

.component-icon .el-icon {
  font-size: 20px;
}

.component-label {
  font-size: 14px;
  color: #303133;
}

.canvas-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  padding: 20px;
  overflow: auto;
}

.canvas-content {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: contents;
}

.canvas-content > * {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-content: flex-start;
}

/* 创建一个内部容器来包裹所有组件 */
.canvas-content-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-content: flex-start;
  transition: background-color 0.2s;
  min-height: 600px;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: -1px -1px;
}

.canvas-content.drag-over {
  background-color: rgba(64, 158, 255, 0.02);
}

/* 组件包装器 */
.canvas-component-wrapper {
  position: relative;
  transition: all 0.2s;
  pointer-events: auto;
}

.canvas-component-wrapper.width-100 {
  width: 100%;
}

.canvas-component-wrapper.width-50 {
  width: calc(50% - 8px);
}

.canvas-component-wrapper.width-33 {
  width: calc(33.333% - 11px);
}

/* 拖拽手柄 */
.drag-handle {
  position: absolute;
  top: -32px;
  left: 0;
  min-width: 60px;
  height: 28px;
  background: #409eff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: grab;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  transition: all 0.2s;
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 0 8px;
}

.drag-handle:hover {
  background: #66b1ff;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.5);
}

.drag-handle:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.drag-handle .el-icon {
  font-size: 14px;
}

.drag-handle-tip {
  font-size: 12px;
}

.canvas-component {
  box-sizing: border-box;
  border: 2px solid transparent;
  transition:
    border-color 0.2s,
    opacity 0.2s,
    transform 0.2s;
  position: relative;
  pointer-events: auto;
}

.canvas-component.width-100 {
  width: 100%;
}

.canvas-component.width-50 {
  width: calc(50% - 8px);
}

.canvas-component.width-33 {
  width: calc(33.333% - 11px);
}

.canvas-component:hover {
  border-color: #409eff;
}

.canvas-component.selected {
  border-color: #409eff;
}

.canvas-component.dragging {
  opacity: 0.4;
  transform: scale(0.98);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 插入指示器 */
.insert-indicator {
  position: absolute;
  background: #409eff;
  z-index: 50;
  pointer-events: none;
  animation: insertPulse 1s ease-in-out infinite;
}

@keyframes insertPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.insert-indicator.insert-left {
  width: 3px;
  height: 100%;
  left: -9px;
  top: 0;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
}

.insert-indicator.insert-end {
  width: calc(100% - 40px);
  height: 3px;
  left: 20px;
  bottom: -8px;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
}

.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: white;
  border: 2px solid #409eff;
  border-radius: 2px;
  cursor: ns-resize;
  bottom: -6px;
  right: -6px;
}

.text-content {
  user-select: text;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border-radius: 4px;
  border: 1px dashed #dcdfe6;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.image-placeholder .el-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.image-content {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.table-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #ffffff;
}

.chart-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}

.rectangle-content {
  box-sizing: border-box;
}

.line-content {
  box-sizing: border-box;
}

.right-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-left: 1px solid #e4e7ed;
}

/* 表单组件样式 */
.form-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  /* 移除内边距，因为父组件已经有padding了 */
}

.form-container.form-bordered {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
}

/* 移除表单中最后一个表单项的底部边距 */
.form-container .el-row .el-col:last-child .el-form-item {
  margin-bottom: 0;
}

.form-item-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}
</style>
