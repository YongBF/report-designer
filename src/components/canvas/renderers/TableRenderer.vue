<template>
  <BaseRenderer
    :component="component"
    :selected="selected"
    :hovered="hovered"
    @mousedown="$emit('mousedown', $event)"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
    @update="(id, updates) => $emit('update', id, updates)"
  >
    <div class="table-container" :style="containerStyle">
      <el-table
        :data="paginatedData"
        :border="component.border"
        :stripe="component.stripe"
        :show-header="component.showHeader"
        :header-cell-style="headerCellStyle"
        :cell-style="cellStyle"
        style="width: 100%"
      >
        <el-table-column
          v-for="column in component.columns"
          :key="column.id"
          :prop="column.field"
          :label="column.label"
          :width="column.width === 0 ? undefined : column.width"
          :align="column.align"
        />
      </el-table>

      <!-- 分页 -->
      <div v-if="component.pagination ?? true" class="pagination-container">
        <el-pagination
          :current-page="component.currentPage ?? 1"
          :page-size="component.pageSize ?? 10"
          :total="tableData.length"
          layout="prev, pager, next, sizes, total"
          :page-sizes="[3, 5, 10, 20, 50, 100]"
          small
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </BaseRenderer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import BaseRenderer from './BaseRenderer.vue'
import type { TableComponent } from '../../../types'

const props = defineProps<{
  component: TableComponent
  selected?: boolean
  hovered?: boolean
}>()

const emit = defineEmits<{
  (e: 'mousedown', event: MouseEvent): void
  (e: 'mouseenter'): void
  (e: 'mouseleave'): void
  (e: 'update', id: string, updates: any): void
}>()

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  overflow: 'auto',
}))

const headerCellStyle = computed(() => ({
  backgroundColor: props.component.headerBackgroundColor,
  color: props.component.headerColor,
  fontSize: `${props.component.fontSize}px`,
}))

const cellStyle = computed(() => ({
  fontSize: `${props.component.fontSize}px`,
}))

// 模拟数据 - 实际应该从数据源获取
const tableData = computed(() => {
  if (props.component.dataSource?.staticData) {
    console.log('使用静态数据:', props.component.dataSource.staticData.length, '条')
    return props.component.dataSource.staticData
  }

  // 返回示例数据（3条）
  const data = Array.from({ length: 3 }, (_, i) => {
    const row: any = {}
    props.component.columns.forEach((col) => {
      row[col.field] = `数据 ${i + 1}`
    })
    return row
  })
  console.log('使用示例数据:', data.length, '条')
  return data
})

// 分页数据
const totalPages = computed(() => {
  const pagination = props.component.pagination ?? true
  const pageSize = props.component.pageSize ?? 10

  if (!pagination) return 1
  return Math.ceil(tableData.value.length / pageSize)
})

const paginatedData = computed(() => {
  const pagination = props.component.pagination ?? true
  const currentPage = props.component.currentPage ?? 1
  const pageSize = props.component.pageSize ?? 10

  console.log('分页配置:', { pagination, currentPage, pageSize, totalData: tableData.value.length })

  if (!pagination) {
    return tableData.value
  }

  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const result = tableData.value.slice(start, end)
  console.log('分页结果:', { start, end, displayCount: result.length }, result)
  return result
})

function handlePageChange(page: number) {
  console.log('页码变化:', page)
  emit('update', props.component.id, { currentPage: page })
}

function handleSizeChange(size: number) {
  console.log('每页条数变化:', size)
  emit('update', props.component.id, { pageSize: size, currentPage: 1 })
}

// 监听分页配置变化
watch(() => [props.component.pagination, props.component.pageSize, props.component.currentPage], () => {
  console.log('分页配置更新:', {
    pagination: props.component.pagination,
    pageSize: props.component.pageSize,
    currentPage: props.component.currentPage
  })
}, { immediate: true })
</script>

<style scoped>
.table-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-container :deep(.el-table) {
  font-size: inherit;
  flex: 1;
}

.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}
</style>
