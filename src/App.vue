<template>
  <div class="report-designer">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleTest">测试按钮</el-button>
      <el-button @click="handleNew" :icon="DocumentAdd">新建</el-button>
      <el-button @click="handleUndo" :disabled="!canUndo" :icon="Back">撤销</el-button>
      <el-button @click="handleRedo" :disabled="!canRedo" :icon="Right">重做</el-button>
      <el-button @click="handleSave" :icon="Download">保存</el-button>
      <el-button @click="handlePreview" :icon="View">预览</el-button>
      <el-divider direction="vertical" />
      <span style="color: #909399; font-size: 12px;">💡 提示：点击组件选中后，拖拽蓝色手柄可移动组件</span>
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
            <div :data-component-id="component.id" class="canvas-component-wrapper" :class="`width-${component.widthPercent}`">
              <!-- 拖拽手柄 -->
              <div v-if="selectedIds.includes(component.id)" class="drag-handle" draggable="true" @dragstart="handleComponentDragStart(component, $event)" @dragend="handleComponentDragEnd" title="按住拖拽移动组件">
                <el-icon><Rank /></el-icon>
                <span class="drag-handle-tip">拖拽</span>
              </div>

              <!-- 组件内容 -->
              <div class="canvas-component" :class="[{ selected: selectedIds.includes(component.id) }, { dragging: draggingComponentId === component.id }]" :style="getComponentStyle(component)" @click.stop="(e) => handleComponentClick(component, e)">
                <!-- 文本组件 -->
                <template v-if="component.type === 'text'">
                  <div class="text-content" :style="getTextStyle(component)">{{ component.content }}</div>
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
                  <div :ref="el => setChartRef(component.id, el)" class="chart-container"></div>
                </template>

                <!-- 柱状图 -->
                <template v-else-if="component.type === 'bar-chart'">
                  <div :ref="el => setChartRef(component.id, el)" class="chart-container"></div>
                </template>

                <!-- 折线图 -->
                <template v-else-if="component.type === 'line-chart'">
                  <div :ref="el => setChartRef(component.id, el)" class="chart-container"></div>
                </template>

                <!-- 饼图 -->
                <template v-else-if="component.type === 'pie-chart'">
                  <div :ref="el => setChartRef(component.id, el)" class="chart-container"></div>
                </template>

                <!-- 散点图 -->
                <template v-else-if="component.type === 'scatter-chart'">
                  <div :ref="el => setChartRef(component.id, el)" class="chart-container"></div>
                </template>

                <!-- 仪表盘 -->
                <template v-else-if="component.type === 'gauge-chart'">
                  <div :ref="el => setChartRef(component.id, el)" class="chart-container"></div>
                </template>

                <!-- 漏斗图 -->
                <template v-else-if="component.type === 'funnel-chart'">
                  <div :ref="el => setChartRef(component.id, el)" class="chart-container"></div>
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
                          v-for="item in component.items"
                          :key="item.id"
                          :span="item.span || Math.floor(24 / component.columns)"
                        >
                          <!-- 文本输入 -->
                          <el-form-item v-if="item.type === 'text'" :label="item.label" :required="item.required">
                            <el-input
                              :placeholder="item.placeholder"
                              :disabled="item.disabled"
                              :model-value="item.defaultValue"
                            />
                            <div v-if="item.helpText" class="form-item-help">{{ item.helpText }}</div>
                          </el-form-item>

                          <!-- 数字输入 -->
                          <el-form-item v-else-if="item.type === 'number'" :label="item.label" :required="item.required">
                            <el-input-number
                              :placeholder="item.placeholder"
                              :disabled="item.disabled"
                              :model-value="item.defaultValue"
                              style="width: 100%"
                            />
                          </el-form-item>

                          <!-- 密码输入 -->
                          <el-form-item v-else-if="item.type === 'password'" :label="item.label" :required="item.required">
                            <el-input
                              type="password"
                              :placeholder="item.placeholder"
                              :disabled="item.disabled"
                              :model-value="item.defaultValue"
                            />
                          </el-form-item>

                          <!-- 邮箱 -->
                          <el-form-item v-else-if="item.type === 'email'" :label="item.label" :required="item.required">
                            <el-input
                              type="email"
                              :placeholder="item.placeholder"
                              :disabled="item.disabled"
                              :model-value="item.defaultValue"
                            />
                          </el-form-item>

                          <!-- 日期选择 -->
                          <el-form-item v-else-if="item.type === 'date'" :label="item.label" :required="item.required">
                            <el-date-picker
                              type="date"
                              :placeholder="item.placeholder"
                              :disabled="item.disabled"
                              :model-value="item.defaultValue"
                              style="width: 100%"
                            />
                          </el-form-item>

                          <!-- 日期时间 -->
                          <el-form-item v-else-if="item.type === 'datetime'" :label="item.label" :required="item.required">
                            <el-date-picker
                              type="datetime"
                              :placeholder="item.placeholder"
                              :disabled="item.disabled"
                              :model-value="item.defaultValue"
                              style="width: 100%"
                            />
                          </el-form-item>

                          <!-- 时间选择 -->
                          <el-form-item v-else-if="item.type === 'time'" :label="item.label" :required="item.required">
                            <el-time-picker
                              :placeholder="item.placeholder"
                              :disabled="item.disabled"
                              :model-value="item.defaultValue"
                              style="width: 100%"
                            />
                          </el-form-item>

                          <!-- 下拉选择 -->
                          <el-form-item v-else-if="item.type === 'select'" :label="item.label" :required="item.required">
                            <el-select
                              :placeholder="item.placeholder"
                              :disabled="item.disabled"
                              :model-value="item.defaultValue"
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
                          <el-form-item v-else-if="item.type === 'radio'" :label="item.label" :required="item.required">
                            <el-radio-group :model-value="item.defaultValue" :disabled="item.disabled">
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
                            <el-checkbox-group :model-value="item.defaultValue" :disabled="item.disabled">
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
                            <el-switch :model-value="item.defaultValue" :disabled="item.disabled" />
                          </el-form-item>

                          <!-- 文本域 -->
                          <el-form-item v-else-if="item.type === 'textarea'" :label="item.label" :required="item.required">
                            <el-input
                              type="textarea"
                              :placeholder="item.placeholder"
                              :disabled="item.disabled"
                              :model-value="item.defaultValue"
                              :rows="3"
                            />
                          </el-form-item>

                          <!-- 滑块 -->
                          <el-form-item v-else-if="item.type === 'slider'" :label="item.label">
                            <el-slider
                              :model-value="item.defaultValue || 0"
                              :disabled="item.disabled"
                              style="width: calc(100% - 20px)"
                            />
                          </el-form-item>

                          <!-- 评分 -->
                          <el-form-item v-else-if="item.type === 'rate'" :label="item.label">
                            <el-rate
                              :model-value="item.defaultValue || 0"
                              :disabled="item.disabled"
                            />
                          </el-form-item>

                          <!-- 颜色选择 -->
                          <el-form-item v-else-if="item.type === 'color'" :label="item.label">
                            <el-color-picker
                              :model-value="item.defaultValue"
                              :disabled="item.disabled"
                            />
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </el-form>
                  </div>
                </template>

                <!-- 选中时显示调整手柄 -->
                <template v-if="selectedIds.includes(component.id) && !draggingComponentId">
                  <div class="resize-handle bottom-right" @mousedown.stop="handleResizeStart(component, $event)"></div>
                </template>
              </div>

              <!-- 插入指示器 -->
              <div v-if="(draggingComponentId || isDraggingFromLibrary) && dropIndex === index" class="insert-indicator insert-left"></div>
            </div>
          </template>

            <!-- 最后位置的插入指示器 -->
            <div v-if="(draggingComponentId || isDraggingFromLibrary) && dropIndex === orderedComponents.length" class="insert-indicator insert-end"></div>
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
                <el-input-number id="component-height" v-model="selectedComponent.height" :min="50" :max="2000" />
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
                  <el-input-number id="text-font-size" v-model="selectedComponent.fontSize" :min="8" :max="72" />
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
                      <el-color-picker id="table-header-bg-color" v-model="selectedComponent.headerBackgroundColor" />
                    </el-form-item>
                    <el-form-item label="文字颜色">
                      <el-color-picker id="table-header-color" v-model="selectedComponent.headerColor" />
                    </el-form-item>
                    <el-form-item label="字号">
                      <el-input-number id="table-font-size" v-model="selectedComponent.fontSize" :min="10" :max="24" />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>

                <!-- 列配置 -->
                <el-collapse-item title="列配置" name="columns">
                  <div style="margin-bottom: 12px">
                    <el-button type="primary" size="small" @click="addTableColumn">添加列</el-button>
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
                          @click="moveTableColumn($index, 'up')"
                          :disabled="$index === 0"
                        >
                          上移
                        </el-button>
                        <el-button
                          link
                          type="primary"
                          size="small"
                          @click="moveTableColumn($index, 'down')"
                          :disabled="$index === selectedComponent.columns.length - 1"
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
                  <div style="margin-top: 8px; font-size: 12px; color: #909399;">
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
                        <el-button size="small" @click="openStaticDataEditor">编辑数据 ({{ staticData.length }} 条)</el-button>
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
                        <el-input id="table-api-url" v-model="tableApiUrl" placeholder="https://api.example.com/data" />
                      </el-form-item>
                      <el-form-item label="请求方法">
                        <el-select id="table-api-method" v-model="tableApiMethod">
                          <el-option label="GET" value="GET" />
                          <el-option label="POST" value="POST" />
                        </el-select>
                      </el-form-item>
                      <el-form-item label="数据路径">
                        <el-input id="table-data-path" v-model="tableDataPath" placeholder="data.items" />
                        <span style="font-size: 12px; color: #909399;">从响应中提取数据的路径</span>
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
                      <el-input-number id="table-page-size" v-model="selectedComponent.pageSize" :min="1" :max="100" />
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
                      <el-radio-group id="form-label-position" v-model="selectedComponent.labelPosition">
                        <el-radio label="left">左对齐</el-radio>
                        <el-radio label="right">右对齐</el-radio>
                        <el-radio label="top">顶部</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="标签宽度">
                      <el-input-number id="form-label-width" v-model="selectedComponent.labelWidth" :min="40" :max="200" />
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
                  <div style="margin-bottom: 12px; display: flex; gap: 8px;">
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
                    </el-select>
                    <el-button type="primary" size="small" @click="handleAddFormItem">添加</el-button>
                  </div>

                  <el-table v-if="selectedFormComponent?.items" :data="selectedFormComponent.items" border size="small" max-height="400">
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

              <el-collapse v-model="barChartCollapseActive" accordion>
                <!-- 基础配置 -->
                <el-collapse-item title="基础配置" name="basic">
                  <el-form label-width="100px" size="small">
                    <el-form-item label="标题">
                      <el-input id="bar-title" v-model="selectedComponent.config.title" />
                    </el-form-item>
                    <el-form-item label="标题字号">
                      <el-input-number id="bar-title-font-size" v-model="selectedComponent.config.titleFontSize" :min="12" :max="36" />
                    </el-form-item>
                    <el-form-item label="标题颜色">
                      <el-color-picker id="bar-title-color" v-model="selectedComponent.config.titleColor" />
                    </el-form-item>
                    <el-form-item label="显示图例">
                      <el-switch id="bar-show-legend" v-model="selectedComponent.config.showLegend" />
                    </el-form-item>
                    <el-form-item label="图例位置">
                      <el-select id="bar-legend-position" v-model="selectedComponent.config.legendPosition">
                        <el-option label="顶部" value="top" />
                        <el-option label="底部" value="bottom" />
                        <el-option label="左侧" value="left" />
                        <el-option label="右侧" value="right" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="主题">
                      <el-select id="bar-theme" v-model="selectedComponent.config.theme">
                        <el-option label="默认" value="default" />
                        <el-option label="亮色" value="light" />
                        <el-option label="暗色" value="dark" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="背景颜色">
                      <el-color-picker id="bar-bg-color" v-model="selectedComponent.config.backgroundColor" show-alpha />
                    </el-form-item>
                    <el-form-item label="启用动画">
                      <el-switch id="bar-animation" v-model="selectedComponent.config.animation" />
                    </el-form-item>
                    <el-form-item label="动画时长">
                      <el-input-number id="bar-animation-duration" v-model="selectedComponent.config.animationDuration" :min="0" :max="5000" :step="100" />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>

                <!-- X轴配置 -->
                <el-collapse-item title="X轴配置" name="xaxis">
                  <el-form label-width="100px" size="small">
                    <el-form-item label="显示X轴">
                      <el-switch id="bar-x-show" v-model="selectedComponent.xAxis.show" />
                    </el-form-item>
                    <el-form-item label="轴名称">
                      <el-input id="bar-x-name" v-model="selectedComponent.xAxis.name" />
                    </el-form-item>
                    <el-form-item label="名称字号">
                      <el-input-number id="bar-x-name-font-size" v-model="selectedComponent.xAxis.nameFontSize" :min="10" :max="24" />
                    </el-form-item>
                    <el-form-item label="名称颜色">
                      <el-color-picker id="bar-x-name-color" v-model="selectedComponent.xAxis.nameColor" />
                    </el-form-item>
                    <el-form-item label="标签字号">
                      <el-input-number id="bar-x-label-font-size" v-model="selectedComponent.xAxis.axisLabelFontSize" :min="8" :max="20" />
                    </el-form-item>
                    <el-form-item label="标签颜色">
                      <el-color-picker id="bar-x-label-color" v-model="selectedComponent.xAxis.axisLabelColor" />
                    </el-form-item>
                    <el-form-item label="轴线颜色">
                      <el-color-picker id="bar-x-line-color" v-model="selectedComponent.xAxis.axisLineColor" />
                    </el-form-item>
                    <el-form-item label="轴线宽度">
                      <el-input-number id="bar-x-line-width" v-model="selectedComponent.xAxis.axisLineWidth" :min="0" :max="10" :step="0.5" />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>

                <!-- Y轴配置 -->
                <el-collapse-item title="Y轴配置" name="yaxis">
                  <el-form label-width="100px" size="small">
                    <el-form-item label="显示Y轴">
                      <el-switch id="bar-y-show" v-model="selectedComponent.yAxis.show" />
                    </el-form-item>
                    <el-form-item label="轴名称">
                      <el-input id="bar-y-name" v-model="selectedComponent.yAxis.name" />
                    </el-form-item>
                    <el-form-item label="名称字号">
                      <el-input-number id="bar-y-name-font-size" v-model="selectedComponent.yAxis.nameFontSize" :min="10" :max="24" />
                    </el-form-item>
                    <el-form-item label="名称颜色">
                      <el-color-picker id="bar-y-name-color" v-model="selectedComponent.yAxis.nameColor" />
                    </el-form-item>
                    <el-form-item label="标签字号">
                      <el-input-number id="bar-y-label-font-size" v-model="selectedComponent.yAxis.axisLabelFontSize" :min="8" :max="20" />
                    </el-form-item>
                    <el-form-item label="标签颜色">
                      <el-color-picker id="bar-y-label-color" v-model="selectedComponent.yAxis.axisLabelColor" />
                    </el-form-item>
                    <el-form-item label="轴线颜色">
                      <el-color-picker id="bar-y-line-color" v-model="selectedComponent.yAxis.axisLineColor" />
                    </el-form-item>
                    <el-form-item label="轴线宽度">
                      <el-input-number id="bar-y-line-width" v-model="selectedComponent.yAxis.axisLineWidth" :min="0" :max="10" :step="0.5" />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>

                <!-- 系列配置 -->
                <el-collapse-item title="系列配置" name="series">
                  <el-form label-width="100px" size="small">
                    <el-form-item label="显示标签">
                      <el-switch id="bar-series-label-show" v-model="selectedComponent.series.labelShow" />
                    </el-form-item>
                    <el-form-item label="标签位置">
                      <el-select id="bar-series-label-position" v-model="selectedComponent.series.labelPosition">
                        <el-option label="顶部" value="top" />
                        <el-option label="内部" value="inside" />
                        <el-option label="内部顶部" value="insideTop" />
                        <el-option label="内部左侧" value="insideLeft" />
                        <el-option label="内部右侧" value="insideRight" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="标签字号">
                      <el-input-number id="bar-series-label-font-size" v-model="selectedComponent.series.labelFontSize" :min="8" :max="24" />
                    </el-form-item>
                    <el-form-item label="标签颜色">
                      <el-color-picker id="bar-series-label-color" v-model="selectedComponent.series.labelColor" />
                    </el-form-item>
                    <el-form-item label="边框宽度">
                      <el-input-number id="bar-series-border-width" v-model="selectedComponent.series.itemStyleBorderWidth" :min="0" :max="10" />
                    </el-form-item>
                    <el-form-item label="边框颜色">
                      <el-color-picker id="bar-series-border-color" v-model="selectedComponent.series.itemStyleBorderColor" />
                    </el-form-item>
                    <el-form-item label="圆角">
                      <el-input-number id="bar-series-border-radius" v-model="selectedComponent.series.itemStyleBorderRadius" :min="0" :max="50" />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>

                <!-- 数据源配置 -->
                <el-collapse-item title="数据源" name="datasource">
                  <el-form label-width="100px" size="small">
                    <el-form-item label="数据源类型">
                      <el-radio-group v-model="chartDataSourceType">
                        <el-radio value="static">静态数据</el-radio>
                        <el-radio value="api">API 接口</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <!-- 静态数据 -->
                    <template v-if="chartDataSourceType === 'static'">
                      <el-form-item label="数据">
                        <el-button size="small" @click="openChartDataEditor">编辑数据 ({{ chartSeries.length }} 个系列)</el-button>
                      </el-form-item>
                      <el-form-item v-if="chartCategories.length > 0" label="数据预览">
                        <div style="font-size: 12px; color: #606266; margin-bottom: 8px;">
                          类别: {{ chartCategories.join(', ') }}
                        </div>
                        <div v-for="(s, idx) in chartSeries.slice(0, 3)" :key="idx" style="font-size: 12px; color: #606266;">
                          {{ s.name }}: {{ s.data.join(', ') }}
                        </div>
                      </el-form-item>
                    </template>

                    <!-- API 配置 -->
                    <template v-if="chartDataSourceType === 'api'">
                      <el-form-item label="API 地址">
                        <el-input v-model="chartDataApiUrl" placeholder="https://api.example.com/chart-data" />
                      </el-form-item>
                      <el-form-item label="请求方法">
                        <el-select v-model="chartDataApiMethod">
                          <el-option label="GET" value="GET" />
                          <el-option label="POST" value="POST" />
                        </el-select>
                      </el-form-item>
                    </template>
                  </el-form>
                </el-collapse-item>

                <!-- 柱状图特有配置 -->
                <el-collapse-item title="柱状图特有配置" name="bar">
                  <el-form label-width="100px" size="small">
                    <el-form-item label="柱宽度">
                      <el-input-number id="bar-width" v-model="selectedComponent.barWidth" :min="10" :max="100" />
                    </el-form-item>
                    <el-form-item label="柱间距">
                      <el-input id="bar-gap" v-model="selectedComponent.barGap" placeholder="如: 30%" />
                    </el-form-item>
                    <el-form-item label="显示背景">
                      <el-switch id="bar-show-background" v-model="selectedComponent.showBackground" />
                    </el-form-item>
                    <el-form-item label="背景颜色">
                      <el-color-picker id="bar-background-color" v-model="selectedComponent.backgroundColor" />
                    </el-form-item>
                  </el-form>
                </el-collapse-item>
              </el-collapse>
            </template>

            <el-divider />
            <el-button type="danger" @click="handleDelete" :icon="Delete">删除组件</el-button>
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

      <el-table
        :data="staticData"
        border
        size="small"
        max-height="400"
      >
        <el-table-column
          v-for="col in selectedComponent?.columns || []"
          :key="col.id"
          :prop="col.field"
          :label="col.label"
        >
          <template #default="{ row, $index }">
            <el-input :id="`static-data-${col.field}-${$index}`" v-model="row[col.field]" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ $index }">
            <el-button
              link
              type="danger"
              size="small"
              @click="removeStaticDataRow($index)"
            >
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
          </el-select>
        </el-form-item>
        <el-form-item label="占位符">
          <el-input v-model="editingFormItem.placeholder" placeholder="输入提示" />
        </el-form-item>
        <el-form-item label="默认值">
          <el-input v-model="editingFormItem.defaultValue" placeholder="默认值" />
        </el-form-item>
        <el-form-item label="帮助文本">
          <el-input v-model="editingFormItem.helpText" placeholder="字段说明或帮助文本" type="textarea" :rows="2" />
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
            <el-button size="small" @click="addFormItemRule" style="margin-bottom: 8px">添加规则</el-button>
            <el-table v-if="editingFormItem.rules && editingFormItem.rules.length > 0" :data="editingFormItem.rules" border size="small" max-height="200">
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
                  <el-input-number v-model="row.min" size="small" :controls="false" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column label="最大值" width="80">
                <template #default="{ row }">
                  <el-input-number v-model="row.max" size="small" :controls="false" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column label="最小长度" width="90">
                <template #default="{ row }">
                  <el-input-number v-model="row.minLength" size="small" :controls="false" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column label="最大长度" width="90">
                <template #default="{ row }">
                  <el-input-number v-model="row.maxLength" size="small" :controls="false" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="removeFormItemRule($index)">删除</el-button>
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
                <el-button size="small" @click="addFormItemOption" style="margin-bottom: 8px">添加选项</el-button>
                <el-table v-if="editingFormItem.options && editingFormItem.options.length > 0" :data="editingFormItem.options" border size="small" max-height="200">
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
                      <el-button link type="danger" size="small" @click="removeFormItemOption($index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form-item>
          </template>

          <!-- API 选项配置 -->
          <template v-else-if="editingFormItem.optionsSourceType === 'api' && editingFormItem.optionsApiConfig">
            <el-form-item label="API 地址">
              <el-input v-model="editingFormItem.optionsApiConfig.url" placeholder="请输入 API 地址，如：/api/options" />
            </el-form-item>
            <el-form-item label="请求方法">
              <el-radio-group v-model="editingFormItem.optionsApiConfig.method">
                <el-radio value="GET">GET</el-radio>
                <el-radio value="POST">POST</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标签字段">
              <el-input v-model="editingFormItem.optionsApiConfig.labelField" placeholder="用于显示的字段名，如：name" />
              <span style="font-size: 12px; color: #909399; margin-left: 8px">API 返回数据中作为选项标签的字段</span>
            </el-form-item>
            <el-form-item label="值字段">
              <el-input v-model="editingFormItem.optionsApiConfig.valueField" placeholder="用于值的字段名，如：id" />
              <span style="font-size: 12px; color: #909399; margin-left: 8px">API 返回数据中作为选项值的字段</span>
            </el-form-item>
            <el-form-item label="请求头">
              <el-input v-model="editingFormItem.optionsApiConfigHeadersJson" type="textarea" :rows="2" placeholder='JSON 格式，如：{"Authorization": "Bearer token"}' />
            </el-form-item>
            <el-form-item label="请求参数">
              <el-input v-model="editingFormItem.optionsApiConfigParamsJson" type="textarea" :rows="2" placeholder='JSON 格式，如：{"category": "A"}' />
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
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <el-tag
              v-for="(cat, idx) in chartCategories"
              :key="idx"
              closable
              @close="removeChartCategory(idx)"
            >
              {{ cat }}
            </el-tag>
          </div>
          <div v-if="chartCategories.length === 0" style="font-size: 12px; color: #909399; margin-top: 8px;">
            点击上方按钮添加类别
          </div>
        </el-form-item>

        <!-- 系列数据 -->
        <el-form-item label="系列数据">
          <div style="margin-bottom: 12px">
            <el-button type="primary" size="small" @click="addChartSeries">添加系列</el-button>
          </div>
          <div v-if="chartSeries.length === 0" style="font-size: 12px; color: #909399;">
            点击上方按钮添加数据系列
          </div>
          <div v-for="(s, sIdx) in chartSeries" :key="sIdx" style="border: 1px solid #dcdfe6; padding: 12px; margin-bottom: 12px; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span>系列 {{ sIdx + 1 }}</span>
              <el-button link type="danger" size="small" @click="removeChartSeries(sIdx)">删除系列</el-button>
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
              <span style="font-size: 12px; color: #909399;">
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import {
  Document,
  Picture,
  Grid,
  DataAnalysis,
  Histogram,
  Coin,
  DocumentAdd,
  Back,
  Right,
  Download,
  View,
  Delete,
  Rank,
  TrendCharts,
  PieChart,
  DataLine,
  Odometer,
  ArrowDown,
} from '@element-plus/icons-vue'
import {
  currentDesign,
  selectedIds,
  addComponent,
  createNewDesign,
  undo,
  redo,
  canUndo,
  canRedo,
  removeComponents,
  saveHistory,
  updateComponent,
} from './stores/designer'
import { ElMessage } from 'element-plus'
import type { Component, ComponentType } from './types'
import * as echarts from 'echarts'
import TableRenderer from './components/canvas/renderers/TableRenderer.vue'

interface ComponentItem {
  type: ComponentType
  label: string
  icon: any
}

const basicComponents: ComponentItem[] = [
  { type: 'text', label: '文本', icon: Document },
  { type: 'image', label: '图片', icon: Picture },
  { type: 'table', label: '表格', icon: Grid },
  { type: 'form', label: '表单', icon: DocumentAdd },
]

const chartComponents: ComponentItem[] = [
  { type: 'bar-chart', label: '柱状图', icon: TrendCharts },
  { type: 'line-chart', label: '折线图', icon: DataLine },
  { type: 'pie-chart', label: '饼图', icon: PieChart },
  { type: 'scatter-chart', label: '散点图', icon: DataAnalysis },
  { type: 'gauge-chart', label: '仪表盘', icon: Odometer },
]

const shapeComponents: ComponentItem[] = [
  { type: 'rectangle', label: '矩形', icon: Histogram },
  { type: 'line', label: '线条', icon: Coin },
]

const canvasRef = ref<HTMLElement>()
const chartRefsMap = ref<Map<string, HTMLElement>>(new Map())
// 存储图表实例，用于更新
const chartInstancesMap = ref<Map<string, any>>(new Map())

// 表格配置状态
const tableCollapseActive = ref(['basic'])
const tableDataSourceType = ref('static')
const tableApiUrl = ref('')
const tableApiMethod = ref('GET')
const tableDataPath = ref('')
const staticData = ref<Record<string, any>[]>([])
const staticDataEditorVisible = ref(false)

// 表单配置状态
const formCollapseActive = ref(['layout'])
const formItemEditorVisible = ref(false)
const editingFormItem = ref<any>(null)
const editingFormItemIndex = ref<number>(-1)
const newFormItemType = ref<string>('text')

// 动态选项缓存（用于存储 API 加载的选项）
const dynamicOptionsCache = ref<Map<string, FormItemOption[]>>(new Map())

// 柱状图配置状态
const barChartCollapseActive = ref(['basic'])

// 图表数据编辑状态
const chartDataEditorVisible = ref(false)
const chartDataSourceType = ref('static')
const chartDataApiUrl = ref('')
const chartDataApiMethod = ref('GET')
// 图表数据：categories 和 series
const chartCategories = ref<string[]>([])
const chartSeries = ref<any[]>([])

// 静态数据预览
const staticDataPreview = computed(() => {
  return staticData.value.slice(0, 5)
})

const canvasStyle = computed(() => ({
  width: '100%',
  backgroundColor: currentDesign.value.backgroundColor,
}))

// 按 order 排序的组件
const orderedComponents = computed(() => {
  return [...currentDesign.value.components].sort((a, b) => a.order - b.order)
})

const selectedComponent = computed(() => {
  if (selectedIds.value.length === 0) return null
  return currentDesign.value.components.find(c => c.id === selectedIds.value[0]) || null
})

// 选中的表单组件（类型安全）
const selectedFormComponent = computed(() => {
  if (!selectedComponent.value || selectedComponent.value.type !== 'form') return null
  return selectedComponent.value as any
})

// 监听选中组件变化，更新表格数据源类型
watch(() => selectedComponent.value?.id, () => {
  if (!selectedComponent.value || selectedComponent.value.type !== 'table') return

  const table = selectedComponent.value as any
  // 根据是否有 dataSource 来判断数据源类型
  if (table.dataSource?.staticData) {
    tableDataSourceType.value = 'static'
    staticData.value = [...table.dataSource.staticData]
  } else if (table.dataSource?.apiUrl) {
    tableDataSourceType.value = 'api'
    tableApiUrl.value = table.dataSource.apiUrl || ''
    tableApiMethod.value = table.dataSource.apiMethod || 'GET'
    tableDataPath.value = table.dataSource.dataPath || ''
  } else {
    // 默认使用静态数据
    tableDataSourceType.value = 'static'
    staticData.value = []
  }
}, { immediate: true })

// 监听表单组件变化，加载 API 选项
watch(() => orderedComponents.value, async (components) => {
  for (const component of components) {
    if (component.type === 'form' && component.items) {
      for (const item of component.items) {
        if (item.optionsSourceType === 'api' && item.optionsApiConfig?.url) {
          await loadApiOptions(item)
        }
      }
    }
  }
}, { deep: true, immediate: true })

// 监听编辑中的表单项选项来源切换，自动初始化 API 配置
watch(() => editingFormItem.value?.optionsSourceType, (newType) => {
  if (newType === 'api' && editingFormItem.value) {
    if (!editingFormItem.value.optionsApiConfig) {
      editingFormItem.value.optionsApiConfig = {
        url: '',
        method: 'GET',
        labelField: 'label',
        valueField: 'value',
        headers: {},
        params: {},
      }
      editingFormItem.value.optionsApiConfigHeadersJson = '{}'
      editingFormItem.value.optionsApiConfigParamsJson = '{}'
    }
  }
})

// 设置图表 ref
function setChartRef(id: string, el: any) {
  if (el) {
    chartRefsMap.value.set(id, el)
  } else {
    chartRefsMap.value.delete(id)
  }
}

// 拖拽相关 - 组件排序
const draggingComponentId = ref<string | null>(null)
const dropIndex = ref<number | null>(null)
const isDraggingFromLibrary = ref(false)

// 拖拽相关 - 只用于高度调整
const isResizing = ref(false)
const resizeStartY = ref(0)
const resizeStartHeight = ref(0)
const resizingComponentId = ref<string | null>(null)

function handleTest() {
  ElMessage.success('测试成功！Element Plus 正常工作')
}

function handleNew() {
  createNewDesign()
  ElMessage.success('已新建报表')
}

function handleUndo() {
  undo()
}

function handleRedo() {
  redo()
}

function handleSave() {
  const design = JSON.stringify(currentDesign.value, null, 2)
  const blob = new Blob([design], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${currentDesign.value.name}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('报表已保存')
}

function handlePreview() {
  ElMessage.info('预览功能开发中...')
}

function handleDragStart(item: ComponentItem, e: DragEvent) {
  isDraggingFromLibrary.value = true
  if (e.dataTransfer) {
    e.dataTransfer.setData('componentType', item.type)
    e.dataTransfer.effectAllowed = 'copy'
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const componentType = e.dataTransfer?.getData('componentType')
  if (!componentType) return

  const newComponent = createComponent(componentType as ComponentType)
  if (newComponent) {
    addComponent(newComponent)
    ElMessage.success('组件已添加')
  }
}

// 组件库拖拽到画布
function handleCanvasDropFromLibrary(e: DragEvent) {
  console.log('Drop from library')
  const componentType = e.dataTransfer?.getData('componentType')
  console.log('Component type:', componentType)
  if (componentType) {
    // 从组件库拖拽新组件
    const newComponent = createComponent(componentType as ComponentType)
    if (!newComponent) return

    // 如果有计算出的插入位置，使用它；否则添加到末尾
    if (dropIndex.value !== null && dropIndex.value >= 0) {
      const components = orderedComponents.value

      // 调整新组件的 order 值，插入到正确位置
      if (dropIndex.value < components.length) {
        // 插入到中间某个位置
        const targetOrder = components[dropIndex.value].order
        newComponent.order = targetOrder

        // 将后面的组件 order 值加 1
        components.forEach(comp => {
          if (comp.order >= targetOrder) {
            comp.order++
          }
        })
      } else {
        // 添加到末尾
        const maxOrder = components.length > 0 ? Math.max(...components.map(c => c.order)) : -1
        newComponent.order = maxOrder + 1
      }

      currentDesign.value.components.push(newComponent)
      selectedIds.value = [newComponent.id]
      saveHistory('添加组件')
    } else {
      // 使用默认的 addComponent
      addComponent(newComponent)
    }

    ElMessage.success('组件已添加')
  } else {
    handleCanvasDrop(e)
  }

  // 清理
  isDraggingFromLibrary.value = false
  dropIndex.value = null
}

// 画布拖拽离开
function handleCanvasDragLeave(e: DragEvent) {
  // 只在真正离开画布时清除状态
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = e.clientX
  const y = e.clientY

  // 如果鼠标在画布范围内，不清除状态
  if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
    return
  }

  isDraggingFromLibrary.value = false
  dropIndex.value = null
}

function handleCanvasClick() {
  selectedIds.value = []
}

function handleComponentClick(component: Component, e: MouseEvent) {
  e.stopPropagation()
  if (e.ctrlKey || e.metaKey) {
    if (selectedIds.value.includes(component.id)) {
      selectedIds.value = selectedIds.value.filter(id => id !== component.id)
    } else {
      selectedIds.value.push(component.id)
    }
  } else {
    selectedIds.value = [component.id]
  }
}

// 组件拖拽开始
function handleComponentDragStart(component: Component, e: DragEvent) {
  console.log('Drag start:', component.id)
  draggingComponentId.value = component.id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('componentId', component.id)
    e.dataTransfer.setDragImage(e.target as HTMLElement, 0, 0)
  }
}

// 组件拖拽结束
function handleComponentDragEnd() {
  console.log('Drag end')
  draggingComponentId.value = null
  dropIndex.value = null
}

// 画布拖拽经过 - 计算插入位置
function handleCanvasDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()

  // 检查是否有拖拽的内容（画布内组件或组件库新组件）
  if (!draggingComponentId.value && !isDraggingFromLibrary.value) {
    console.log('No dragging content')
    return
  }

  const canvasRect = canvasRef.value!.getBoundingClientRect()
  const mouseX = e.clientX - canvasRect.left
  const mouseY = e.clientY - canvasRect.top
  console.log('Drag over - Mouse position:', { mouseX, mouseY }, 'From library:', isDraggingFromLibrary.value)

  // 获取所有可见组件的位置信息
  const componentPositions: Array<{ id: string; index: number; left: number; top: number; right: number; bottom: number; centerX: number; centerY: number }> = []
  const components = orderedComponents.value
  const draggingId = draggingComponentId.value

  for (let i = 0; i < components.length; i++) {
    // 从组件库拖拽时，不跳过任何组件；画布内拖拽时，跳过正在拖拽的组件
    if (isDraggingFromLibrary.value || components[i].id !== draggingId) {
      const componentEl = canvasRef.value!.querySelector(`[data-component-id="${components[i].id}"]`) as HTMLElement
      if (!componentEl) continue

      const rect = componentEl.getBoundingClientRect()
      componentPositions.push({
        id: components[i].id,
        index: i,
        left: rect.left - canvasRect.left,
        top: rect.top - canvasRect.top,
        right: rect.right - canvasRect.left,
        bottom: rect.bottom - canvasRect.top,
        centerX: (rect.left + rect.right) / 2 - canvasRect.left,
        centerY: (rect.top + rect.bottom) / 2 - canvasRect.top,
      })
    }
  }

  // 找到鼠标位置应该插入的位置
  let targetIndex = components.length
  let minDistance = Infinity

  for (const pos of componentPositions) {
    // 判断鼠标是否在组件的左半边还是右半边
    const isLeftSide = mouseX < pos.centerX

    // 计算鼠标到组件边界的距离
    const dx = isLeftSide ? Math.abs(mouseX - pos.left) : Math.abs(mouseX - pos.right)
    const dy = Math.abs(mouseY - pos.centerY)

    // 使用加权距离，水平方向权重更大
    const distance = dx * 1.5 + dy

    if (distance < minDistance) {
      minDistance = distance
      // 如果在左半边，插入到当前组件之前；否则在之后
      targetIndex = isLeftSide ? pos.index : pos.index + 1
    }
  }

  dropIndex.value = targetIndex
  console.log('Calculated drop index:', targetIndex, 'Total components:', components.length)
}

// 画布放置
function handleCanvasDrop(e: DragEvent) {
  console.log('Canvas drop, draggingId:', draggingComponentId.value, 'dropIndex:', dropIndex.value)
  e.preventDefault()
  if (!draggingComponentId.value) return

  const component = currentDesign.value.components.find(c => c.id === draggingComponentId.value)
  if (!component || dropIndex.value === null) return

  // 重新排序所有组件的 order 值
  const components = orderedComponents.value.filter(c => c.id !== draggingComponentId.value)
  components.splice(dropIndex.value, 0, component)

  // 更新所有组件的 order
  components.forEach((comp, index) => {
    comp.order = index
  })

  draggingComponentId.value = null
  dropIndex.value = null
  console.log('Drop complete, new order:', components.map(c => c.id))
}

// 高度调整功能
function handleResizeStart(component: Component, e: MouseEvent) {
  if (component.locked) return

  isResizing.value = true
  resizeStartY.value = e.clientY
  resizeStartHeight.value = component.height
  resizingComponentId.value = component.id

  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
}

function handleResizeMove(e: MouseEvent) {
  if (!isResizing.value || !resizingComponentId.value) return

  const component = currentDesign.value.components.find(c => c.id === resizingComponentId.value)
  if (!component) return

  const dy = e.clientY - resizeStartY.value
  component.height = Math.max(50, resizeStartHeight.value + dy)
}

function handleResizeEnd() {
  isResizing.value = false
  resizingComponentId.value = null
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
}

function handleDelete() {
  if (selectedIds.value.length > 0) {
    removeComponents(selectedIds.value)
    ElMessage.success('组件已删除')
  }
}

// 表格列操作
function addTableColumn() {
  if (!selectedComponent.value || selectedComponent.value.type !== 'table') return

  const table = selectedComponent.value as any
  const newColumn = {
    id: `col-${Date.now()}`,
    field: `field${table.columns.length + 1}`,
    label: `列${table.columns.length + 1}`,
    width: 100,
    align: 'left' as const,
    fixed: '' as string | undefined,
  }
  table.columns.push(newColumn)
  saveHistory('添加列')
}

function removeTableColumn(index: number) {
  if (!selectedComponent.value || selectedComponent.value.type !== 'table') return

  const table = selectedComponent.value as any
  table.columns.splice(index, 1)
  saveHistory('删除列')
}

function moveTableColumn(index: number, direction: 'up' | 'down') {
  if (!selectedComponent.value || selectedComponent.value.type !== 'table') return

  const table = selectedComponent.value as any
  if (direction === 'up' && index > 0) {
    const temp = table.columns[index]
    table.columns[index] = table.columns[index - 1]
    table.columns[index - 1] = temp
  } else if (direction === 'down' && index < table.columns.length - 1) {
    const temp = table.columns[index]
    table.columns[index] = table.columns[index + 1]
    table.columns[index + 1] = temp
  }
  saveHistory('移动列')
}

// 打开静态数据编辑器
function openStaticDataEditor() {
  if (!selectedComponent.value || selectedComponent.value.type !== 'table') return

  const table = selectedComponent.value as any
  if (table.dataSource?.staticData) {
    staticData.value = [...table.dataSource.staticData]
  } else {
    // 根据列生成默认数据
    staticData.value = Array.from({ length: 3 }, (_, i) => {
      const row: Record<string, any> = {}
      table.columns.forEach((col: any) => {
        row[col.field] = `数据${i + 1}`
      })
      return row
    })
  }
  staticDataEditorVisible.value = true
}

// 静态数据编辑器操作
function addStaticDataRow() {
  if (!selectedComponent.value || selectedComponent.value.type !== 'table') return

  const table = selectedComponent.value as any
  const newRow: Record<string, any> = {}
  table.columns.forEach((col: any) => {
    newRow[col.field] = ''
  })
  staticData.value.push(newRow)
}

function removeStaticDataRow(index: number) {
  staticData.value.splice(index, 1)
}

function clearStaticData() {
  staticData.value = []
}

function handleStaticDataCancel() {
  staticDataEditorVisible.value = false
}

function handleStaticDataSave() {
  if (!selectedComponent.value || selectedComponent.value.type !== 'table') return

  const table = selectedComponent.value as any

  // 使用 updateComponent 确保响应式更新
  updateComponent(table.id, {
    dataSource: {
      ...table.dataSource,
      staticData: [...staticData.value]
    }
  })

  staticDataEditorVisible.value = false
  saveHistory('保存静态数据')
  ElMessage.success('静态数据已保存')
}

// 表单项操作
function handleAddFormItem() {
  if (!newFormItemType.value) {
    ElMessage.warning('请选择表单项类型')
    return
  }
  addFormItem(newFormItemType.value)
  // 重置选择
  newFormItemType.value = 'text'
}

function addFormItem(type: any) {
  const form = selectedFormComponent.value
  if (!form) return

  if (!form.items) {
    form.items = []
  }

  const newItem: any = {
    id: `item-${Date.now()}`,
    type,
    field: `field${form.items.length + 1}`,
    label: `字段${form.items.length + 1}`,
    required: false,
    widthPercent: '100',
  }

  // 根据类型设置默认值
  switch (type) {
    case 'text':
    case 'password':
    case 'email':
    case 'textarea':
      newItem.placeholder = '请输入'
      break
    case 'number':
      newItem.placeholder = '请输入数字'
      break
    case 'date':
    case 'datetime':
    case 'time':
      newItem.placeholder = '请选择'
      break
    case 'select':
    case 'radio':
    case 'checkbox':
      newItem.placeholder = '请选择'
      newItem.optionsSourceType = 'static'  // 默认使用静态选项
      newItem.options = [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' },
      ]
      break
    case 'color':
      newItem.placeholder = '请选择颜色'
      break
  }

  // 使用 updateComponent 确保响应式更新
  const newItems = [...form.items, newItem]
  updateComponent(form.id, { items: newItems })
  saveHistory('添加表单项')
}

function removeFormItem(index: number) {
  const form = selectedFormComponent.value
  if (!form || !form.items) return

  // 使用 updateComponent 确保响应式更新
  const newItems = form.items.filter((_: any, i: number) => i !== index)
  updateComponent(form.id, { items: newItems })
  saveHistory('删除表单项')
}

function editFormItem(index: number) {
  const form = selectedFormComponent.value
  if (!form || !form.items || !form.items[index]) return

  const item = { ...form.items[index] }

  // 初始化选项来源类型
  if (!item.optionsSourceType) {
    item.optionsSourceType = 'static'
  }

  // 初始化 API 配置
  if (item.optionsSourceType === 'api' && !item.optionsApiConfig) {
    item.optionsApiConfig = {
      url: '',
      method: 'GET',
      labelField: 'label',
      valueField: 'value',
      headers: {},
      params: {},
    }
  }

  // 用于 JSON 编辑的辅助字段
  if (item.optionsApiConfig?.headers) {
    item.optionsApiConfigHeadersJson = JSON.stringify(item.optionsApiConfig.headers, null, 2)
  } else {
    item.optionsApiConfigHeadersJson = '{}'
  }

  if (item.optionsApiConfig?.params) {
    item.optionsApiConfigParamsJson = JSON.stringify(item.optionsApiConfig.params, null, 2)
  } else {
    item.optionsApiConfigParamsJson = '{}'
  }

  editingFormItem.value = item
  editingFormItemIndex.value = index
  formItemEditorVisible.value = true
}

function handleFormItemSave() {
  const form = selectedFormComponent.value
  if (!form || !form.items) return

  const item = { ...editingFormItem.value }

  // 如果是 API 模式，解析 JSON 格式的请求头和参数
  if (item.optionsSourceType === 'api' && item.optionsApiConfig) {
    try {
      if (item.optionsApiConfigHeadersJson) {
        item.optionsApiConfig.headers = JSON.parse(item.optionsApiConfigHeadersJson)
      }
      if (item.optionsApiConfigParamsJson) {
        item.optionsApiConfig.params = JSON.parse(item.optionsApiConfigParamsJson)
      }
    } catch (e) {
      ElMessage.error('请求头或参数 JSON 格式错误')
      return
    }
  }

  // 删除辅助字段
  delete item.optionsApiConfigHeadersJson
  delete item.optionsApiConfigParamsJson

  // 使用 updateComponent 确保响应式更新
  const newItems = [...form.items]
  newItems[editingFormItemIndex.value] = item
  updateComponent(form.id, { items: newItems })
  formItemEditorVisible.value = false
  saveHistory('编辑表单项')
  ElMessage.success('表单项已保存')
}

function handleFormItemCancel() {
  formItemEditorVisible.value = false
  editingFormItem.value = null
}

function addFormItemOption() {
  if (!editingFormItem.value) return
  if (!editingFormItem.value.options) {
    editingFormItem.value.options = []
  }
  editingFormItem.value.options.push({
    label: `选项${editingFormItem.value.options.length + 1}`,
    value: `option${editingFormItem.value.options.length + 1}`,
  })
}

function removeFormItemOption(index: number) {
  if (!editingFormItem.value || !editingFormItem.value.options) return
  editingFormItem.value.options.splice(index, 1)
}

// 加载 API 选项
async function loadApiOptions(item: any): Promise<FormItemOption[]> {
  if (!item.optionsApiConfig?.url) {
    return []
  }

  const cacheKey = `${item.id}-${JSON.stringify(item.optionsApiConfig)}`
  const cached = dynamicOptionsCache.value.get(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const config = item.optionsApiConfig
    const options: RequestInit = {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    }

    if (config.method === 'POST') {
      options.body = JSON.stringify(config.params || {})
    } else {
      // GET 请求将参数添加到 URL
      const url = new URL(config.url, window.location.origin)
      if (config.params) {
        Object.keys(config.params).forEach(key => {
          url.searchParams.append(key, String(config.params[key]))
        })
      }
    }

    const response = await fetch(config.url, options)
    if (!response.ok) {
      console.error('API 请求失败:', response.statusText)
      return []
    }

    const data = await response.json()
    const optionsData = Array.isArray(data) ? data : (data.data || [])

    const formattedOptions: FormItemOption[] = optionsData.map((row: any) => ({
      label: row[config.labelField] || row.label || '',
      value: row[config.valueField] || row.value || '',
    }))

    dynamicOptionsCache.value.set(cacheKey, formattedOptions)
    return formattedOptions
  } catch (error) {
    console.error('加载 API 选项失败:', error)
    return []
  }
}

// 获取表单项的实际选项（静态或 API）
function getFormItemOptions(item: any): FormItemOption[] {
  if (item.optionsSourceType === 'api' && item.optionsApiConfig?.url) {
    const cacheKey = `${item.id}-${JSON.stringify(item.optionsApiConfig)}`
    return dynamicOptionsCache.value.get(cacheKey) || []
  }
  return item.options || []
}

function addFormItemRule() {
  if (!editingFormItem.value) return
  if (!editingFormItem.value.rules) {
    editingFormItem.value.rules = []
  }
  editingFormItem.value.rules.push({
    required: false,
    message: '验证失败',
  })
}

function removeFormItemRule(index: number) {
  if (!editingFormItem.value || !editingFormItem.value.rules) return
  editingFormItem.value.rules.splice(index, 1)
}

function getComponentStyle(component: Component) {
  return {
    height: `${component.height}px`,
    opacity: component.visible ? 1 : 0.3,
    cursor: component.locked ? 'not-allowed' : 'default',
  }
}

function getTextStyle(component: any) {
  return {
    fontSize: `${component.fontSize}px`,
    fontFamily: component.fontFamily,
    color: component.color,
    fontWeight: component.fontWeight,
    fontStyle: component.fontStyle,
    textAlign: component.textAlign,
    lineHeight: component.lineHeight,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  }
}

function getRectangleStyle(component: any) {
  return {
    width: '100%',
    height: '100%',
    backgroundColor: component.backgroundColor,
    border: `${component.borderWidth}px ${component.borderStyle} ${component.borderColor}`,
    borderRadius: `${component.borderRadius}px`,
  }
}

function getLineStyle(component: any) {
  return {
    width: '100%',
    height: '100%',
    borderTop: `${component.strokeWidth}px ${component.strokeStyle} ${component.stroke}`,
  }
}

// 初始化图表
function initCharts() {
  nextTick(() => {
    const chartTypes = ['chart', 'bar-chart', 'line-chart', 'pie-chart', 'scatter-chart', 'gauge-chart', 'funnel-chart']
    chartTypes.forEach(chartType => {
      const components = orderedComponents.value.filter(c => c.type === chartType)
      components.forEach((component) => {
        const el = chartRefsMap.value.get(component.id)
        if (!el) return

        // 检查是否已有实例，如果有则先销毁
        if (chartInstancesMap.value.has(component.id)) {
          const existingChart = chartInstancesMap.value.get(component.id)
          existingChart.dispose()
        }

        const chart = echarts.init(el)
        chartInstancesMap.value.set(component.id, chart)

        let option: any = {}

        // 根据图表类型生成配置
        if (chartType === 'chart') {
          // 旧版通用图表（向后兼容）
          option = {
            title: {
              text: component.title,
              left: 'center',
            },
            tooltip: {},
            xAxis: {
              type: 'category',
              data: ['A', 'B', 'C', 'D', 'E'],
            },
            yAxis: {
              type: 'value',
            },
            series: [{
              type: component.chartType,
              data: [10, 20, 30, 40, 50],
            }],
          }
        } else if (chartType === 'bar-chart') {
          option = generateBarChartOption(component as any)
        } else if (chartType === 'line-chart') {
          option = generateLineChartOption(component as any)
        } else if (chartType === 'pie-chart') {
          option = generatePieChartOption(component as any)
        } else if (chartType === 'scatter-chart') {
          option = generateScatterChartOption(component as any)
        } else if (chartType === 'gauge-chart') {
          option = generateGaugeChartOption(component as any)
        } else if (chartType === 'funnel-chart') {
          option = generateFunnelChartOption(component as any)
        }

        chart.setOption(option)
      })
    })
  })
}

// 更新单个图表
function updateChart(component: any) {
  const chart = chartInstancesMap.value.get(component.id)
  if (!chart) return

  let option: any = {}

  // 根据图表类型生成配置
  if (component.type === 'chart') {
    option = {
      title: {
        text: component.title,
        left: 'center',
      },
      tooltip: {},
      xAxis: {
        type: 'category',
        data: ['A', 'B', 'C', 'D', 'E'],
      },
      yAxis: {
        type: 'value',
      },
      series: [{
        type: component.chartType,
        data: [10, 20, 30, 40, 50],
      }],
    }
  } else if (component.type === 'bar-chart') {
    option = generateBarChartOption(component)
  } else if (component.type === 'line-chart') {
    option = generateLineChartOption(component)
  } else if (component.type === 'pie-chart') {
    option = generatePieChartOption(component)
  } else if (component.type === 'scatter-chart') {
    option = generateScatterChartOption(component)
  } else if (component.type === 'gauge-chart') {
    option = generateGaugeChartOption(component)
  } else if (component.type === 'funnel-chart') {
    option = generateFunnelChartOption(component)
  }

  chart.setOption(option, true)
}

// ============ 图表数据处理函数 ============

// 打开图表数据编辑器
function openChartDataEditor() {
  if (!selectedComponent.value || !selectedComponent.value.dataSource) return

  const dataSource = selectedComponent.value.dataSource
  chartDataSourceType.value = dataSource.type || 'static'

  if (dataSource.type === 'static' && dataSource.staticData) {
    chartCategories.value = [...(dataSource.staticData.categories || [])]
    chartSeries.value = (dataSource.staticData.series || []).map((s: any) => ({
      name: s.name,
      data: [...s.data],
      dataString: s.data.join(', ')
    }))
  } else if (dataSource.type === 'api') {
    chartDataApiUrl.value = dataSource.apiUrl || ''
    chartDataApiMethod.value = dataSource.apiMethod || 'GET'
  }

  chartDataEditorVisible.value = true
}

// 添加图表类别
function addChartCategory() {
  const categoryName = prompt('请输入类别名称：')
  if (categoryName && categoryName.trim()) {
    chartCategories.value.push(categoryName.trim())
  }
}

// 移除图表类别
function removeChartCategory(index: number) {
  chartCategories.value.splice(index, 1)
}

// 添加图表系列
function addChartSeries() {
  chartSeries.value.push({
    name: `系列 ${chartSeries.value.length + 1}`,
    data: chartCategories.value.map(() => 0),
    dataString: chartCategories.value.map(() => '0').join(', ')
  })
}

// 移除图表系列
function removeChartSeries(index: number) {
  chartSeries.value.splice(index, 1)
}

// 解析系列数据
function parseSeriesData(series: any) {
  const values = series.dataString.split(',').map((v: string) => {
    const num = parseFloat(v.trim())
    return isNaN(num) ? 0 : num
  })
  series.data = values
}

// 保存图表数据
function handleChartDataSave() {
  if (!selectedComponent.value) return

  if (chartDataSourceType.value === 'static') {
    // 验证数据
    if (chartCategories.value.length === 0) {
      ElMessage.warning('请至少添加一个类别')
      return
    }
    if (chartSeries.value.length === 0) {
      ElMessage.warning('请至少添加一个系列')
      return
    }

    // 检查数据数量是否一致
    const valid = chartSeries.value.every(s => s.data.length === chartCategories.value.length)
    if (!valid) {
      ElMessage.warning('所有系列的数据数量必须与类别数量一致')
      return
    }

    // 构建 staticData
    const staticData = {
      categories: [...chartCategories.value],
      series: chartSeries.value.map(s => ({
        name: s.name,
        data: [...s.data]
      }))
    }

    // 更新组件的 dataSource
    updateComponent(selectedComponent.value.id, {
      dataSource: {
        ...selectedComponent.value.dataSource!,
        type: 'static',
        staticData
      }
    })
  } else if (chartDataSourceType.value === 'api') {
    // 更新 API 配置
    updateComponent(selectedComponent.value.id, {
      dataSource: {
        ...selectedComponent.value.dataSource!,
        type: 'api',
        apiUrl: chartDataApiUrl.value,
        apiMethod: chartDataApiMethod.value as 'GET' | 'POST'
      }
    })
  }

  // 更新图表显示
  nextTick(() => {
    const updatedComponent = currentDesign.value.components.find(c => c.id === selectedComponent.value!.id)
    if (updatedComponent) {
      updateChart(updatedComponent)
    }
  })

  chartDataEditorVisible.value = false
  ElMessage.success('数据已保存')
}

// 取消编辑图表数据
function handleChartDataCancel() {
  chartDataEditorVisible.value = false
  chartCategories.value = []
  chartSeries.value = []
}

// 监听柱状图选中变化，同步数据源配置
watch(() => selectedComponent.value?.id, () => {
  if (!selectedComponent.value || selectedComponent.value.type !== 'bar-chart') return

  const chart = selectedComponent.value as any
  if (chart.dataSource) {
    chartDataSourceType.value = chart.dataSource.type || 'static'

    if (chart.dataSource.type === 'static' && chart.dataSource.staticData) {
      chartCategories.value = [...(chart.dataSource.staticData.categories || [])]
      chartSeries.value = (chart.dataSource.staticData.series || []).map((s: any) => ({
        name: s.name,
        data: [...s.data],
        dataString: s.data.join(', ')
      }))
    } else if (chart.dataSource.type === 'api') {
      chartDataApiUrl.value = chart.dataSource.apiUrl || ''
      chartDataApiMethod.value = chart.dataSource.apiMethod || 'GET'
    }
  }
}, { immediate: true })

// 生成柱状图配置
function generateBarChartOption(component: any) {
  const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']

  // 从 dataSource 获取数据，如果没有则使用默认数据
  let categories = ['类别A', '类别B', '类别C', '类别D', '类别E']
  let seriesData = [{ name: '数据', data: [120, 200, 150, 80, 70] }]

  if (component.dataSource?.staticData) {
    categories = component.dataSource.staticData.categories || categories
    seriesData = component.dataSource.staticData.series || seriesData
  }

  return {
    title: {
      text: component.config.title,
      left: 'center',
      textStyle: {
        fontSize: component.config.titleFontSize,
        color: component.config.titleColor,
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      show: component.config.showLegend,
      top: component.config.legendPosition === 'top' ? 0 : 'auto',
      bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
      left: component.config.legendPosition === 'left' ? 0 : 'auto',
      right: component.config.legendPosition === 'right' ? 0 : 'auto',
    },
    xAxis: {
      show: component.xAxis.show,
      name: component.xAxis.name,
      nameTextStyle: {
        fontSize: component.xAxis.nameFontSize,
        color: component.xAxis.nameColor,
      },
      axisLabel: {
        fontSize: component.xAxis.axisLabelFontSize,
        color: component.xAxis.axisLabelColor,
      },
      axisLine: {
        show: component.xAxis.show,
        lineStyle: {
          color: component.xAxis.axisLineColor,
          width: component.xAxis.axisLineWidth,
        },
      },
      type: 'category',
      data: categories,
    },
    yAxis: {
      show: component.yAxis.show,
      name: component.yAxis.name,
      nameTextStyle: {
        fontSize: component.yAxis.nameFontSize,
        color: component.yAxis.nameColor,
      },
      axisLabel: {
        fontSize: component.yAxis.axisLabelFontSize,
        color: component.yAxis.axisLabelColor,
      },
      axisLine: {
        show: component.yAxis.show,
        lineStyle: {
          color: component.yAxis.axisLineColor,
          width: component.yAxis.axisLineWidth,
        },
      },
      type: 'value',
    },
    series: seriesData.map((s: any, index: number) => ({
      type: 'bar',
      name: s.name,
      data: s.data,
      barWidth: component.barWidth,
      label: {
        show: component.series.labelShow,
        position: component.series.labelPosition,
        fontSize: component.series.labelFontSize,
        color: component.series.labelColor,
      },
      itemStyle: {
        borderWidth: component.series.itemStyleBorderWidth,
        borderColor: component.series.itemStyleBorderColor,
        borderRadius: component.series.itemStyleBorderRadius,
      },
      showBackground: component.showBackground,
      backgroundStyle: {
        color: component.backgroundColor,
      },
    })),
    animation: component.config.animation,
    animationDuration: component.config.animationDuration,
  }
}

// 生成折线图配置
function generateLineChartOption(component: any) {
  return {
    title: {
      text: component.config.title,
      left: 'center',
      textStyle: {
        fontSize: component.config.titleFontSize,
        color: component.config.titleColor,
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      show: component.config.showLegend,
      top: component.config.legendPosition === 'top' ? 0 : 'auto',
      bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
      left: component.config.legendPosition === 'left' ? 0 : 'auto',
      right: component.config.legendPosition === 'right' ? 0 : 'auto',
    },
    xAxis: {
      show: component.xAxis.show,
      name: component.xAxis.name,
      nameTextStyle: {
        fontSize: component.xAxis.nameFontSize,
        color: component.xAxis.nameColor,
      },
      axisLabel: {
        fontSize: component.xAxis.axisLabelFontSize,
        color: component.xAxis.axisLabelColor,
      },
      axisLine: {
        show: component.xAxis.show,
        lineStyle: {
          color: component.xAxis.axisLineColor,
          width: component.xAxis.axisLineWidth,
        },
      },
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
    },
    yAxis: {
      show: component.yAxis.show,
      name: component.yAxis.name,
      nameTextStyle: {
        fontSize: component.yAxis.nameFontSize,
        color: component.yAxis.nameColor,
      },
      axisLabel: {
        fontSize: component.yAxis.axisLabelFontSize,
        color: component.yAxis.axisLabelColor,
      },
      axisLine: {
        show: component.yAxis.show,
        lineStyle: {
          color: component.yAxis.axisLineColor,
          width: component.yAxis.axisLineWidth,
        },
      },
      type: 'value',
    },
    series: [{
      type: 'line',
      data: [120, 132, 101, 134, 90, 230],
      smooth: component.smooth,
      step: component.step,
      showSymbol: component.showSymbol,
      symbolSize: component.symbolSize,
      label: {
        show: component.series.labelShow,
        position: component.series.labelPosition,
        fontSize: component.series.labelFontSize,
        color: component.series.labelColor,
      },
      lineStyle: {
        width: component.lineStyleWidth,
        type: component.lineStyleType,
      },
      areaStyle: component.areaStyle ? {
        opacity: component.series.areaStyleOpacity,
      } : undefined,
    }],
    animation: component.config.animation,
    animationDuration: component.config.animationDuration,
  }
}

// 生成饼图配置
function generatePieChartOption(component: any) {
  return {
    title: {
      text: component.config.title,
      left: 'center',
      textStyle: {
        fontSize: component.config.titleFontSize,
        color: component.config.titleColor,
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      show: component.config.showLegend,
      top: component.config.legendPosition === 'top' ? 0 : 'auto',
      bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
      left: component.config.legendPosition === 'left' ? 0 : 'auto',
      right: component.config.legendPosition === 'right' ? 0 : 'auto',
    },
    series: [{
      type: 'pie',
      data: [
        { value: 335, name: '类别A' },
        { value: 310, name: '类别B' },
        { value: 234, name: '类别C' },
        { value: 135, name: '类别D' },
        { value: 148, name: '类别E' },
      ],
      radius: component.radius,
      center: component.center,
      roseType: component.roseType,
      label: {
        show: component.series.labelShow,
        position: component.series.labelPosition,
        fontSize: component.series.labelFontSize,
        color: component.series.labelColor,
      },
      itemStyle: {
        borderWidth: component.series.itemStyleBorderWidth,
        borderColor: component.series.itemStyleBorderColor,
        borderRadius: component.series.itemStyleBorderRadius,
      },
      emphasis: {
        scale: component.emphasisScale,
      },
      minAngle: component.minAngle,
    }],
    animation: component.config.animation,
    animationDuration: component.config.animationDuration,
  }
}

// 生成散点图配置
function generateScatterChartOption(component: any) {
  return {
    title: {
      text: component.config.title,
      left: 'center',
      textStyle: {
        fontSize: component.config.titleFontSize,
        color: component.config.titleColor,
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      show: component.config.showLegend,
      top: component.config.legendPosition === 'top' ? 0 : 'auto',
      bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
      left: component.config.legendPosition === 'left' ? 0 : 'auto',
      right: component.config.legendPosition === 'right' ? 0 : 'auto',
    },
    xAxis: {
      show: component.xAxis.show,
      name: component.xAxis.name,
      nameTextStyle: {
        fontSize: component.xAxis.nameFontSize,
        color: component.xAxis.nameColor,
      },
      axisLabel: {
        fontSize: component.xAxis.axisLabelFontSize,
        color: component.xAxis.axisLabelColor,
      },
      axisLine: {
        show: component.xAxis.show,
        lineStyle: {
          color: component.xAxis.axisLineColor,
          width: component.xAxis.axisLineWidth,
        },
      },
      scale: true,
    },
    yAxis: {
      show: component.yAxis.show,
      name: component.yAxis.name,
      nameTextStyle: {
        fontSize: component.yAxis.nameFontSize,
        color: component.yAxis.nameColor,
      },
      axisLabel: {
        fontSize: component.yAxis.axisLabelFontSize,
        color: component.yAxis.axisLabelColor,
      },
      axisLine: {
        show: component.yAxis.show,
        lineStyle: {
          color: component.yAxis.axisLineColor,
          width: component.yAxis.axisLineWidth,
        },
      },
      scale: true,
    },
    series: [{
      type: 'scatter',
      data: [[10, 20], [30, 40], [50, 60], [70, 80], [90, 100]],
      symbolSize: component.symbolSize,
      symbol: component.symbol,
      label: {
        show: component.series.labelShow,
        position: component.series.labelPosition,
        fontSize: component.series.labelFontSize,
        color: component.series.labelColor,
      },
      itemStyle: {
        borderWidth: component.series.itemStyleBorderWidth,
        borderColor: component.series.itemStyleBorderColor,
        borderRadius: component.series.itemStyleBorderRadius,
      },
      rippleEffect: component.showEffect ? {
        brushType: component.effectType,
      } : undefined,
    }],
    animation: component.config.animation,
    animationDuration: component.config.animationDuration,
  }
}

// 生成仪表盘配置
function generateGaugeChartOption(component: any) {
  return {
    title: {
      text: component.config.title,
      left: 'center',
      textStyle: {
        fontSize: component.config.titleFontSize,
        color: component.config.titleColor,
      },
    },
    series: [{
      type: 'gauge',
      min: component.min,
      max: component.max,
      startAngle: component.startAngle,
      endAngle: component.endAngle,
      radius: component.radius,
      axisLine: {
        show: component.axisLine.show,
        lineStyle: {
          width: component.axisLine.lineStyleWidth,
          color: [[0.3, '#67e0e3'], [0.7, '#37a2da'], [1, '#fd666d']],
        },
      },
      splitNumber: component.splitNumber,
      detail: {
        show: component.detail.show,
        fontSize: component.detail.fontSize,
        color: component.detail.color,
        formatter: component.detail.formatter,
      },
      pointer: {
        show: component.pointer.show,
        length: component.pointer.length,
        width: component.pointer.width,
      },
      data: [{ value: 70 }],
    }],
    animation: component.config.animation,
    animationDuration: component.config.animationDuration,
  }
}

// 生成漏斗图配置
function generateFunnelChartOption(component: any) {
  return {
    title: {
      text: component.config.title,
      left: 'center',
      textStyle: {
        fontSize: component.config.titleFontSize,
        color: component.config.titleColor,
      },
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      show: component.config.showLegend,
      top: component.config.legendPosition === 'top' ? 0 : 'auto',
      bottom: component.config.legendPosition === 'bottom' ? 0 : 'auto',
      left: component.config.legendPosition === 'left' ? 0 : 'auto',
      right: component.config.legendPosition === 'right' ? 0 : 'auto',
    },
    series: [{
      type: 'funnel',
      data: [
        { value: 100, name: '步骤A' },
        { value: 80, name: '步骤B' },
        { value: 60, name: '步骤C' },
        { value: 40, name: '步骤D' },
        { value: 20, name: '步骤E' },
      ],
      sort: component.sort,
      gap: component.gap,
      left: component.left,
      top: component.top,
      right: component.right,
      bottom: component.bottom,
      width: component.width,
      height: component.height,
      label: {
        show: component.series.labelShow,
        position: component.series.labelPosition,
        fontSize: component.series.labelFontSize,
        color: component.series.labelColor,
        align: component.labelAlign,
      },
      itemStyle: {
        borderWidth: component.series.itemStyleBorderWidth,
        borderColor: component.series.itemStyleBorderColor,
        borderRadius: component.series.itemStyleBorderRadius,
      },
    }],
    animation: component.config.animation,
    animationDuration: component.config.animationDuration,
  }
}

// 组件挂载后初始化图表
onMounted(() => {
  // 使用 setTimeout 确保完全渲染后再初始化图表
  setTimeout(() => {
    initCharts()
  }, 100)
})

// 监听组件数量变化，初始化图表
watch(() => currentDesign.value.components.length, () => {
  // 只在组件数量增加时调用，避免重复初始化
  nextTick(() => {
    initCharts()
  })
})

// 监听图表组件配置变化，重新渲染图表
watch(
  () => currentDesign.value.components
    .filter(c => ['chart', 'bar-chart', 'line-chart', 'pie-chart', 'scatter-chart', 'gauge-chart', 'funnel-chart'].includes(c.type)),
  (newCharts, oldCharts) => {
    nextTick(() => {
      newCharts.forEach((component) => {
        // 找到对应的旧图表
        const oldChart = oldCharts?.find(c => c.id === component.id)

        // 检查是否有变化
        let hasChanged = !oldChart

        if (!hasChanged && oldChart) {
          // 根据图表类型检查不同的属性
          if (component.type === 'bar-chart') {
            // 柱状图：检查 config, xAxis, yAxis, series 和特有属性
            const keys = ['config', 'xAxis', 'yAxis', 'series', 'barWidth', 'barGap', 'showBackground', 'backgroundColor']
            for (const key of keys) {
              if (JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])) {
                hasChanged = true
                break
              }
            }
          } else if (component.type === 'line-chart') {
            // 折线图：检查 config, xAxis, yAxis, series 和特有属性
            const keys = ['config', 'xAxis', 'yAxis', 'series', 'smooth', 'step', 'showSymbol', 'symbolSize', 'lineStyleWidth', 'lineStyleType', 'areaStyle']
            for (const key of keys) {
              if (JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])) {
                hasChanged = true
                break
              }
            }
          } else if (component.type === 'scatter-chart') {
            // 散点图：检查 config, xAxis, yAxis, series 和特有属性
            const keys = ['config', 'xAxis', 'yAxis', 'series', 'symbolSize', 'symbol', 'showEffect', 'effectType']
            for (const key of keys) {
              if (JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])) {
                hasChanged = true
                break
              }
            }
          } else if (component.type === 'pie-chart') {
            // 饼图：检查 config, series 和特有属性
            const keys = ['config', 'series', 'roseType', 'radius', 'center', 'emphasisScale', 'minAngle']
            for (const key of keys) {
              if (JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])) {
                hasChanged = true
                break
              }
            }
          } else if (component.type === 'funnel-chart') {
            // 检查 config, series
            const keys = ['config', 'series']
            for (const key of keys) {
              if (JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])) {
                hasChanged = true
                break
              }
            }
          } else if (component.type === 'gauge-chart') {
            // 检查 config 和其他特有属性
            const keys = ['config', 'min', 'max', 'startAngle', 'endAngle', 'radius', 'axisLine', 'splitNumber', 'detail', 'pointer']
            for (const key of keys) {
              if (JSON.stringify((component as any)[key]) !== JSON.stringify((oldChart as any)[key])) {
                hasChanged = true
                break
              }
            }
          } else if (component.type === 'chart') {
            // 旧版图表
            hasChanged = JSON.stringify(component) !== JSON.stringify(oldChart)
          }
        }

        if (hasChanged) {
          updateChart(component)
        }
      })
    })
  },
  { deep: true }
)

function createComponent(type: ComponentType): Component | null {
  const id = `${type}-${Date.now()}`
  const order = currentDesign.value.components.length

  const baseConfig = {
    id,
    widthPercent: '100' as const,
    height: 200,
    order,
    visible: true,
    locked: false,
  }

  switch (type) {
    case 'text':
      return {
        ...baseConfig,
        type: 'text',
        content: '双击编辑文本',
        fontSize: 14,
        fontFamily: 'Arial',
        color: '#000000',
        fontWeight: 400,
        fontStyle: 'normal',
        textAlign: 'left',
        lineHeight: 1.5,
      }
    case 'image':
      return {
        ...baseConfig,
        type: 'image',
        height: 200,
        src: '',
        fit: 'contain',
        opacity: 1,
        borderRadius: 0,
      }
    case 'table':
      // 生成默认的3条静态数据
      const defaultColumns = [
        { id: 'col1', field: 'field1', label: '列1', width: 100, align: 'left', fixed: '' },
        { id: 'col2', field: 'field2', label: '列2', width: 100, align: 'left', fixed: '' },
        { id: 'col3', field: 'field3', label: '列3', width: 100, align: 'left', fixed: '' },
      ]
      const defaultStaticData = Array.from({ length: 3 }, (_, i) => {
        const row: Record<string, any> = {}
        defaultColumns.forEach(col => {
          row[col.field] = `数据${i + 1}`
        })
        return row
      })

      return {
        ...baseConfig,
        type: 'table',
        height: 300,
        columns: defaultColumns,
        dataSource: {
          id: `ds-${id}`,
          name: '静态数据源',
          type: 'static',
          staticData: defaultStaticData
        },
        showHeader: true,
        stripe: true,
        border: true,
        headerBackgroundColor: '#f5f7fa',
        headerColor: '#606266',
        fontSize: 14,
        pagination: true,
        pageSize: 10,
        currentPage: 1,
      }
    case 'chart':
      return {
        ...baseConfig,
        type: 'chart',
        height: 300,
        chartType: 'bar',
        dataSource: null,
        title: '图表标题',
        showLegend: true,
        showDataZoom: false,
        theme: 'default',
      }
    case 'bar-chart':
      return {
        ...baseConfig,
        type: 'bar-chart',
        height: 400,
        dataSource: null,
        config: {
          title: '柱状图',
          titleFontSize: 18,
          titleColor: '#303133',
          showLegend: true,
          legendPosition: 'top',
          theme: 'default',
          backgroundColor: 'transparent',
          animation: true,
          animationDuration: 1000,
        },
        xAxis: {
          show: true,
          name: '类别',
          nameFontSize: 14,
          nameColor: '#606266',
          axisLabelFontSize: 12,
          axisLabelColor: '#606266',
          axisLineColor: '#dcdfe6',
          axisLineWidth: 1,
        },
        yAxis: {
          show: true,
          name: '数值',
          nameFontSize: 14,
          nameColor: '#606266',
          axisLabelFontSize: 12,
          axisLabelColor: '#606266',
          axisLineColor: '#dcdfe6',
          axisLineWidth: 1,
        },
        series: {
          labelShow: false,
          labelPosition: 'top',
          labelFontSize: 12,
          labelColor: '#606266',
          itemStyleBorderWidth: 0,
          itemStyleBorderColor: '#000',
          itemStyleBorderRadius: 0,
          areaStyleOpacity: 0,
        },
        barWidth: 30,
        barGap: '30%',
        showBackground: false,
        backgroundColor: '#f5f7fa',
        // 默认静态数据源
        dataSource: {
          id: `ds-${Date.now()}`,
          name: '柱状图数据源',
          type: 'static',
          staticData: {
            categories: ['一月', '二月', '三月', '四月', '五月'],
            series: [
              { name: '销售额', data: [120, 200, 150, 80, 70] }
            ]
          }
        }
      }
    case 'line-chart':
      return {
        ...baseConfig,
        type: 'line-chart',
        height: 400,
        dataSource: null,
        config: {
          title: '折线图',
          titleFontSize: 18,
          titleColor: '#303133',
          showLegend: true,
          legendPosition: 'top',
          theme: 'default',
          backgroundColor: 'transparent',
          animation: true,
          animationDuration: 1000,
        },
        xAxis: {
          show: true,
          name: '类别',
          nameFontSize: 14,
          nameColor: '#606266',
          axisLabelFontSize: 12,
          axisLabelColor: '#606266',
          axisLineColor: '#dcdfe6',
          axisLineWidth: 1,
        },
        yAxis: {
          show: true,
          name: '数值',
          nameFontSize: 14,
          nameColor: '#606266',
          axisLabelFontSize: 12,
          axisLabelColor: '#606266',
          axisLineColor: '#dcdfe6',
          axisLineWidth: 1,
        },
        series: {
          labelShow: false,
          labelPosition: 'top',
          labelFontSize: 12,
          labelColor: '#606266',
          itemStyleBorderWidth: 0,
          itemStyleBorderColor: '#000',
          itemStyleBorderRadius: 0,
          areaStyleOpacity: 0.3,
        },
        smooth: false,
        step: false,
        showSymbol: true,
        symbolSize: 6,
        lineStyleWidth: 2,
        lineStyleType: 'solid',
        areaStyle: false,
      }
    case 'pie-chart':
      return {
        ...baseConfig,
        type: 'pie-chart',
        height: 400,
        dataSource: null,
        config: {
          title: '饼图',
          titleFontSize: 18,
          titleColor: '#303133',
          showLegend: true,
          legendPosition: 'right',
          theme: 'default',
          backgroundColor: 'transparent',
          animation: true,
          animationDuration: 1000,
        },
        series: {
          labelShow: true,
          labelPosition: 'outside',
          labelFontSize: 12,
          labelColor: '#606266',
          itemStyleBorderWidth: 1,
          itemStyleBorderColor: '#fff',
          itemStyleBorderRadius: 4,
          areaStyleOpacity: 0,
        },
        roseType: false,
        radius: ['0%', '70%'],
        center: ['50%', '50%'],
        emphasisScale: true,
        minAngle: 0,
      }
    case 'scatter-chart':
      return {
        ...baseConfig,
        type: 'scatter-chart',
        height: 400,
        dataSource: null,
        config: {
          title: '散点图',
          titleFontSize: 18,
          titleColor: '#303133',
          showLegend: true,
          legendPosition: 'top',
          theme: 'default',
          backgroundColor: 'transparent',
          animation: true,
          animationDuration: 1000,
        },
        xAxis: {
          show: true,
          name: 'X轴',
          nameFontSize: 14,
          nameColor: '#606266',
          axisLabelFontSize: 12,
          axisLabelColor: '#606266',
          axisLineColor: '#dcdfe6',
          axisLineWidth: 1,
        },
        yAxis: {
          show: true,
          name: 'Y轴',
          nameFontSize: 14,
          nameColor: '#606266',
          axisLabelFontSize: 12,
          axisLabelColor: '#606266',
          axisLineColor: '#dcdfe6',
          axisLineWidth: 1,
        },
        series: {
          labelShow: false,
          labelPosition: 'top',
          labelFontSize: 12,
          labelColor: '#606266',
          itemStyleBorderWidth: 0,
          itemStyleBorderColor: '#000',
          itemStyleBorderRadius: 0,
          areaStyleOpacity: 0,
        },
        symbolSize: 10,
        symbol: 'circle',
        showEffect: false,
        effectType: 'ripple',
      }
    case 'gauge-chart':
      return {
        ...baseConfig,
        type: 'gauge-chart',
        height: 400,
        dataSource: null,
        config: {
          title: '仪表盘',
          titleFontSize: 18,
          titleColor: '#303133',
          showLegend: false,
          legendPosition: 'top',
          theme: 'default',
          backgroundColor: 'transparent',
          animation: true,
          animationDuration: 1000,
        },
        min: 0,
        max: 100,
        startAngle: 225,
        endAngle: -45,
        radius: '75%',
        axisLine: {
          show: true,
          lineStyleWidth: 30,
        },
        splitNumber: 10,
        detail: {
          show: true,
          fontSize: 20,
          color: '#606266',
          formatter: '{value}',
        },
        pointer: {
          show: true,
          length: '70%',
          width: 6,
        },
      }
    case 'funnel-chart':
      return {
        ...baseConfig,
        type: 'funnel-chart',
        height: 400,
        dataSource: null,
        config: {
          title: '漏斗图',
          titleFontSize: 18,
          titleColor: '#303133',
          showLegend: true,
          legendPosition: 'right',
          theme: 'default',
          backgroundColor: 'transparent',
          animation: true,
          animationDuration: 1000,
        },
        series: {
          labelShow: true,
          labelPosition: 'outside',
          labelFontSize: 12,
          labelColor: '#606266',
          itemStyleBorderWidth: 0,
          itemStyleBorderColor: '#fff',
          itemStyleBorderRadius: 0,
          areaStyleOpacity: 0,
        },
        sort: 'descending',
        gap: 0,
        left: '10%',
        top: '10%',
        right: '10%',
        bottom: '10%',
        width: '80%',
        height: '80%',
        labelAlign: 'center',
      }
    case 'rectangle':
      return {
        ...baseConfig,
        type: 'rectangle',
        height: 100,
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 0,
      }
    case 'line':
      return {
        ...baseConfig,
        type: 'line',
        height: 2,
        stroke: '#000000',
        strokeWidth: 2,
        strokeStyle: 'solid',
      }
    case 'form':
      return {
        ...baseConfig,
        type: 'form',
        height: 400,
        items: [
          {
            id: `item-${id}-1`,
            type: 'text',
            field: 'name',
            label: '姓名',
            placeholder: '请输入姓名',
            required: true,
            widthPercent: '100',
          },
          {
            id: `item-${id}-2`,
            type: 'email',
            field: 'email',
            label: '邮箱',
            placeholder: '请输入邮箱',
            required: true,
            widthPercent: '100',
          },
          {
            id: `item-${id}-3`,
            type: 'select',
            field: 'gender',
            label: '性别',
            placeholder: '请选择',
            defaultValue: '',
            required: true,
            widthPercent: '100',
            options: [
              { label: '男', value: 'male' },
              { label: '女', value: 'female' },
            ],
          },
        ],
        labelPosition: 'right',
        labelWidth: 80,
        columns: 1,
        size: 'default',
        showBorder: false,
      }
    default:
      return null
  }
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
  transition: border-color 0.2s, opacity 0.2s, transform 0.2s;
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
  0%, 100% {
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
  background-color: #f5f7fa;
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
}

.table-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.chart-container {
  width: 100%;
  height: 100%;
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
  padding: 16px;
}

.form-container.form-bordered {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
}

.form-item-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}
</style>
