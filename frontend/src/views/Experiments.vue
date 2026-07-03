<template>
  <div class="experiments-page">
    <NavBar />
    <div class="page-content">
      <div class="page-header">
        <h1>实验管理</h1>
        <p>分配实验到班级，查看学生完成情况</p>
      </div>

      <div style="margin-bottom: 16px">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>创建实验
        </el-button>
      </div>

      <el-table :data="experiments" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="实验名称" min-width="160" />
        <el-table-column label="班级" width="150">
          <template #default="{ row }">{{ row.class?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="案例" width="150">
          <template #default="{ row }">{{ row.policyCase?.title || '-' }}</template>
        </el-table-column>
        <el-table-column label="时间" width="200">
          <template #default="{ row }">
            {{ row.startDate || '不限' }} ~ {{ row.endDate || '不限' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="router.push(`/experiments/${row.id}`)">详情</el-button>
            <el-button size="small" @click="editExperiment(row)">编辑</el-button>
            <el-popconfirm title="确定删除此实验？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && experiments.length === 0" description="暂无实验" />
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog v-model="showCreateDialog" :title="editingId ? '编辑实验' : '创建实验'" width="550px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="实验名称" required>
          <el-input v-model="form.title" placeholder="例如：财政税收政策模拟实验" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="班级" required>
          <el-select v-model="form.classId" placeholder="选择班级" style="width: 100%">
            <el-option v-for="c in classes" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="案例" required>
          <el-select v-model="form.caseId" placeholder="选择案例" style="width: 100%">
            <el-option v-for="c in cases" :key="c.id" :label="c.title" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="form.startDate" type="date" placeholder="可选" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="form.endDate" type="date" placeholder="可选" style="width: 100%" value-format="YYYY-MM-DD" />
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
import { getExperiments, createExperiment, updateExperiment, deleteExperiment, type Experiment } from '../api/experiments'
import { getCases, type PolicyCase } from '../api/cases'
import { getClasses, type Class } from '../api/classes'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const experiments = ref<Experiment[]>([])
const classes = ref<Class[]>([])
const cases = ref<PolicyCase[]>([])
const loading = ref(true)
const saving = ref(false)
const showCreateDialog = ref(false)
const editingId = ref<number | null>(null)
const form = ref({
  title: '',
  description: '',
  classId: null as number | null,
  caseId: null as number | null,
  startDate: '',
  endDate: '',
})

onMounted(fetchData)

async function fetchData() {
  loading.value = true
  try {
    const [exps, cls, casesData] = await Promise.all([
      getExperiments(),
      getClasses(),
      getCases(),
    ])
    experiments.value = exps
    classes.value = cls
    cases.value = casesData
  } catch {
    // handled
  } finally {
    loading.value = false
  }
}

function editExperiment(exp: Experiment) {
  editingId.value = exp.id
  form.value = {
    title: exp.title,
    description: exp.description || '',
    classId: exp.classId,
    caseId: exp.caseId,
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
  }
  showCreateDialog.value = true
}

async function handleSave() {
  if (!form.value.title || !form.value.classId || !form.value.caseId) {
    ElMessage.warning('请填写必要信息')
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await updateExperiment(editingId.value, form.value)
      ElMessage.success('实验已更新')
    } else {
      await createExperiment(form.value as any)
      ElMessage.success('实验已创建')
    }
    showCreateDialog.value = false
    form.value = { title: '', description: '', classId: null, caseId: null, startDate: '', endDate: '' }
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
    await deleteExperiment(id)
    ElMessage.success('实验已删除')
    await fetchData()
  } catch {
    ElMessage.error('删除失败')
  }
}

function statusType(status: string) {
  return status === 'active' ? 'success' : status === 'closed' ? 'info' : 'warning'
}

function statusLabel(status: string) {
  return status === 'active' ? '进行中' : status === 'closed' ? '已结束' : '待开始'
}
</script>

<style scoped>
.experiments-page { height: 100%; display: flex; flex-direction: column; }
.page-content { flex: 1; padding: 24px; background: #f5f7fa; overflow-y: auto; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; color: #1a365d; }
.page-header p { color: #999; margin-top: 4px; }
</style>
