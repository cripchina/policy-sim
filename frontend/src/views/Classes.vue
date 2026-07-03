<template>
  <div class="classes-page">
    <NavBar />
    <div class="page-content">
      <div class="page-header">
        <h1>班级管理</h1>
        <p>管理教学班级，批量导入学生</p>
      </div>

      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>创建班级
        </el-button>
      </div>

      <el-table :data="classes" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="班级名称" min-width="180" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="教师" width="150">
          <template #default="{ row }">
            {{ row.teacher?.displayName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="router.push(`/classes/${row.id}`)">管理</el-button>
            <el-button size="small" @click="editClass(row)">编辑</el-button>
            <el-popconfirm title="确定删除此班级？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && classes.length === 0" description="暂无班级，点击上方按钮创建" />
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="showCreateDialog" :title="editingId ? '编辑班级' : '创建班级'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：公共管理2101班" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="可选：班级简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getClasses, createClass, updateClass, deleteClass, type Class } from '../api/classes'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const classes = ref<Class[]>([])
const loading = ref(true)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', description: '' })
const rules = { name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }] }

onMounted(fetchData)

async function fetchData() {
  loading.value = true
  try {
    classes.value = await getClasses()
  } catch {
    // handled
  } finally {
    loading.value = false
  }
}

function editClass(c: Class) {
  editingId.value = c.id
  form.value = { name: c.name, description: c.description || '' }
  showCreateDialog.value = true
}

async function handleSave() {
  saving.value = true
  try {
    if (editingId.value) {
      await updateClass(editingId.value, form.value)
      ElMessage.success('班级已更新')
    } else {
      await createClass(form.value)
      ElMessage.success('班级已创建')
    }
    showCreateDialog.value = false
    form.value = { name: '', description: '' }
    editingId.value = null
    await fetchData()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    saving.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await deleteClass(id)
    ElMessage.success('班级已删除')
    await fetchData()
  } catch {
    ElMessage.error('删除失败')
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.classes-page { height: 100%; display: flex; flex-direction: column; }
.page-content { flex: 1; padding: 24px; background: #f5f7fa; overflow-y: auto; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; color: #1a365d; }
.page-header p { color: #999; margin-top: 4px; }
</style>
