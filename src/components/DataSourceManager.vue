<template>
  <el-dialog
    v-model="visible"
    title="数据源管理"
    width="800px"
    @close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <!-- 数据源列表 -->
      <el-tab-pane label="数据源" name="datasources">
        <div class="toolbar">
          <el-button type="primary" @click="showAddDataSource">添加数据源</el-button>
        </div>

        <el-table :data="dataSources" border>
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="type" label="类型">
            <template #default="{ row }">
              <el-tag>{{ getDataSourceTypeLabel(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="editDataSource(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteDataSource(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 数据库连接 -->
      <el-tab-pane label="数据库连接" name="databases">
        <div class="toolbar">
          <el-button type="primary" @click="showAddDatabase">添加数据库</el-button>
        </div>

        <el-table :data="databaseConnections" border>
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="type" label="类型">
            <template #default="{ row }">
              <el-tag>{{ row.type.toUpperCase() }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="host" label="主机" />
          <el-table-column prop="port" label="端口" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button link type="primary" @click="editDatabase(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteDatabase(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 数据源表单对话框 -->
    <el-dialog
      v-model="dataSourceFormVisible"
      :title="editingDataSource ? '编辑数据源' : '添加数据源'"
      width="600px"
      append-to-body
    >
      <el-form :model="dataSourceForm" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="dataSourceForm.name" placeholder="请输入数据源名称" />
        </el-form-item>

        <el-form-item label="类型">
          <el-select v-model="dataSourceForm.type">
            <el-option label="静态数据" value="static" />
            <el-option label="API" value="api" />
            <el-option label="SQL" value="sql" />
          </el-select>
        </el-form-item>

        <!-- 静态数据 -->
        <template v-if="dataSourceForm.type === 'static'">
          <el-form-item label="数据">
            <el-input
              v-model="staticDataJson"
              type="textarea"
              :rows="10"
              placeholder='[{"field1": "value1", "field2": "value2"}]'
            />
          </el-form-item>
        </template>

        <!-- API 配置 -->
        <template v-if="dataSourceForm.type === 'api'">
          <el-form-item label="API 地址">
            <el-input v-model="dataSourceForm.apiUrl" placeholder="https://api.example.com/data" />
          </el-form-item>

          <el-form-item label="请求方法">
            <el-select v-model="dataSourceForm.apiMethod">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
            </el-select>
          </el-form-item>

          <el-form-item label="请求头">
            <el-input
              v-model="apiHeadersJson"
              type="textarea"
              :rows="3"
              placeholder='{"Authorization": "Bearer token"}'
            />
          </el-form-item>
        </template>

        <!-- SQL 配置 -->
        <template v-if="dataSourceForm.type === 'sql'">
          <el-form-item label="数据库">
            <el-select v-model="dataSourceForm.databaseId" placeholder="选择数据库">
              <el-option
                v-for="db in databaseConnections"
                :key="db.id"
                :label="db.name"
                :value="db.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="SQL 语句">
            <el-input
              v-model="dataSourceForm.sql"
              type="textarea"
              :rows="5"
              placeholder="SELECT * FROM table_name"
            />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="dataSourceFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDataSource">保存</el-button>
      </template>
    </el-dialog>

    <!-- 数据库表单对话框 -->
    <el-dialog
      v-model="databaseFormVisible"
      :title="editingDatabase ? '编辑数据库' : '添加数据库'"
      width="600px"
      append-to-body
    >
      <el-form :model="databaseForm" label-width="100px">
        <el-form-item label="名称">
          <el-input v-model="databaseForm.name" placeholder="请输入连接名称" />
        </el-form-item>

        <el-form-item label="数据库类型">
          <el-select v-model="databaseForm.type">
            <el-option label="MySQL" value="mysql" />
            <el-option label="PostgreSQL" value="postgresql" />
            <el-option label="SQL Server" value="mssql" />
            <el-option label="Oracle" value="oracle" />
          </el-select>
        </el-form-item>

        <el-form-item label="主机">
          <el-input v-model="databaseForm.host" placeholder="localhost" />
        </el-form-item>

        <el-form-item label="端口">
          <el-input-number v-model="databaseForm.port" :min="1" :max="65535" />
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="databaseForm.username" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="databaseForm.password" type="password" show-password />
        </el-form-item>

        <el-form-item label="数据库">
          <el-input v-model="databaseForm.database" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="databaseFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDatabase">保存</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  currentDesign,
  addDataSource,
  updateDataSource,
  removeDataSource,
  addDatabaseConnection,
  removeDatabaseConnection,
} from '../stores/designer'
import type { DataSource, DatabaseConnection } from '../types'
import { ElMessage } from 'element-plus'

const visible = defineModel<boolean>()
const activeTab = ref('datasources')

// 数据源相关
const dataSources = computed(() => currentDesign.value.dataSources)
const dataSourceFormVisible = ref(false)
const editingDataSource = ref<DataSource | null>(null)
const dataSourceForm = ref<Partial<DataSource>>({
  name: '',
  type: 'static',
  staticData: [],
  apiUrl: '',
  apiMethod: 'GET',
  apiHeaders: {},
  databaseId: '',
  sql: '',
})
const staticDataJson = ref('')
const apiHeadersJson = ref('')

// 数据库相关
const databaseConnections = computed(() => currentDesign.value.databaseConnections)
const databaseFormVisible = ref(false)
const editingDatabase = ref<DatabaseConnection | null>(null)
const databaseForm = ref<Partial<DatabaseConnection>>({
  name: '',
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: '',
  password: '',
  database: '',
})

function getDataSourceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    static: '静态数据',
    api: 'API',
    sql: 'SQL',
  }
  return labels[type] || type
}

// 数据源操作
function showAddDataSource() {
  editingDataSource.value = null
  dataSourceForm.value = {
    name: '',
    type: 'static',
    staticData: [],
  }
  staticDataJson.value = ''
  apiHeadersJson.value = ''
  dataSourceFormVisible.value = true
}

function editDataSource(ds: DataSource) {
  editingDataSource.value = ds
  dataSourceForm.value = { ...ds }
  staticDataJson.value = ds.staticData ? JSON.stringify(ds.staticData, null, 2) : ''
  apiHeadersJson.value = ds.apiHeaders ? JSON.stringify(ds.apiHeaders, null, 2) : ''
  dataSourceFormVisible.value = true
}

function saveDataSource() {
  if (!dataSourceForm.value.name) {
    ElMessage.warning('请输入数据源名称')
    return
  }

  try {
    if (dataSourceForm.value.type === 'static' && staticDataJson.value) {
      dataSourceForm.value.staticData = JSON.parse(staticDataJson.value)
    }
    if (dataSourceForm.value.type === 'api' && apiHeadersJson.value) {
      dataSourceForm.value.apiHeaders = JSON.parse(apiHeadersJson.value)
    }
  } catch (e) {
    ElMessage.error('JSON 格式错误')
    return
  }

  if (editingDataSource.value) {
    updateDataSource(editingDataSource.value.id, dataSourceForm.value)
    ElMessage.success('数据源已更新')
  } else {
    addDataSource({
      id: `ds-${Date.now()}`,
      ...dataSourceForm.value,
    } as DataSource)
    ElMessage.success('数据源已添加')
  }

  dataSourceFormVisible.value = false
}

function deleteDataSource(id: string) {
  removeDataSource(id)
  ElMessage.success('数据源已删除')
}

// 数据库操作
function showAddDatabase() {
  editingDatabase.value = null
  databaseForm.value = {
    name: '',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: '',
    password: '',
    database: '',
  }
  databaseFormVisible.value = true
}

function editDatabase(db: DatabaseConnection) {
  editingDatabase.value = db
  databaseForm.value = { ...db }
  databaseFormVisible.value = true
}

function saveDatabase() {
  if (!databaseForm.value.name) {
    ElMessage.warning('请输入连接名称')
    return
  }

  if (editingDatabase.value) {
    Object.assign(editingDatabase.value, databaseForm.value)
    ElMessage.success('数据库连接已更新')
  } else {
    addDatabaseConnection({
      id: `db-${Date.now()}`,
      ...databaseForm.value,
    } as DatabaseConnection)
    ElMessage.success('数据库连接已添加')
  }

  databaseFormVisible.value = false
}

function deleteDatabase(id: string) {
  removeDatabaseConnection(id)
  ElMessage.success('数据库连接已删除')
}

function handleClose() {
  visible.value = false
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 16px;
}
</style>
