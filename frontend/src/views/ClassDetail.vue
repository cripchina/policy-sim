<template>
  <div class="class-detail-page">
    <NavBar />
    <div class="page-content" v-loading="loading">
      <div v-if="classInfo">
        <div class="page-header">
          <el-link @click="router.push('/classes')" style="margin-bottom: 12px">&lt; 返回班级列表</el-link>
          <h1>{{ classInfo.name }}</h1>
          <p>{{ classInfo.description || '暂无描述' }} · 授课教师：{{ classInfo.teacher?.displayName }}</p>
        </div>

        <el-card class="section-card">
          <template #header>
            <div class="card-header">
              <span>学生列表 ({{ students.length }})</span>
              <div>
                <el-button size="small" @click="showAddStudent = true" :disabled="!allStudents.length">
                  添加学生
                </el-button>
                <el-button size="small" type="primary" @click="showBatchImport = true">
                  <el-icon><Upload /></el-icon>批量导入
                </el-button>
              </div>
            </div>
          </template>

          <el-table :data="students" stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column label="用户名" width="120">
              <template #default="{ row }">{{ row.student?.username }}</template>
            </el-table-column>
            <el-table-column label="姓名" min-width="150">
              <template #default="{ row }">{{ row.student?.displayName }}</template>
            </el-table-column>
            <el-table-column label="加入时间" width="170">
              <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-popconfirm title="确定移除此学生？" @confirm="handleRemoveStudent(row.studentId)">
                  <template #reference>
                    <el-button size="small" type="danger">移除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>

          <el-empty v-if="students.length === 0" description="暂无学生，请批量导入" />
        </el-card>
      </div>
    </div>

    <!-- Add Student Dialog -->
    <el-dialog v-model="showAddStudent" title="添加学生" width="400px">
      <el-select v-model="selectedStudentId" placeholder="选择学生" style="width: 100%">
        <el-option
          v-for="s in availableStudents"
          :key="s.id"
          :label="`${s.displayName} (${s.username})`"
          :value="s.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="showAddStudent = false">取消</el-button>
        <el-button type="primary" :loading="addingStudent" @click="handleAddStudent">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- Batch Import Dialog -->
    <el-dialog v-model="showBatchImport" title="批量导入学生" width="600px">
      <p style="color: #666; margin-bottom: 12px">
        每行一个学生，格式：<code>用户名,姓名</code>（用户名用于登录，姓名用于显示）。默认密码：123456
      </p>
      <el-input
        v-model="batchText"
        type="textarea"
        :rows="10"
        placeholder="示例：&#10;zhangsan,张三&#10;lisi,李四&#10;wangwu,王五"
      />
      <template #footer>
        <el-button @click="showBatchImport = false">取消</el-button>
        <el-button type="primary" :loading="importing" @click="handleBatchImport">开始导入</el-button>
      </template>
    </el-dialog>

    <!-- Import Result Dialog -->
    <el-dialog v-model="showResult" title="导入结果" width="450px">
      <el-result
        :icon="importResult.errors?.length ? 'warning' : 'success'"
        :title="`创建 ${importResult.created} 人，跳过 ${importResult.skipped} 人`"
      >
        <template #extra>
          <el-alert
            v-if="importResult.errors?.length"
            :title="`${importResult.errors.length} 个错误`"
            :description="importResult.errors.join('；')"
            type="warning"
            show-icon
            :closable="false"
          />
        </template>
      </el-result>
      <template #footer>
        <el-button type="primary" @click="showResult = false; showBatchImport = false; fetchData()">完成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getClass, getClassStudents, addStudentToClass, removeStudentFromClass, batchImportStudents, type Class, type ClassStudent } from '../api/classes'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const route = useRoute()
const classId = computed(() => +(route.params.id as string))
const classInfo = ref<Class | null>(null)
const students = ref<ClassStudent[]>([])
const loading = ref(true)

// Add student
const showAddStudent = ref(false)
const allStudents = ref<any[]>([])
const selectedStudentId = ref<number | null>(null)
const addingStudent = ref(false)

// Batch import
const showBatchImport = ref(false)
const batchText = ref('')
const importing = ref(false)
const showResult = ref(false)
const importResult = ref({ created: 0, skipped: 0, errors: [] as string[] })

const availableStudents = computed(() =>
  allStudents.value.filter(
    (s) => !students.value.some((cs) => cs.studentId === s.id),
  ),
)

onMounted(fetchData)

async function fetchData() {
  loading.value = true
  try {
    const [cls, studentList] = await Promise.all([
      getClass(classId.value),
      getClassStudents(classId.value),
    ])
    classInfo.value = cls
    students.value = studentList
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function handleAddStudent() {
  if (!selectedStudentId.value) return
  addingStudent.value = true
  try {
    await addStudentToClass(classId.value, selectedStudentId.value)
    ElMessage.success('学生已添加')
    showAddStudent.value = false
    selectedStudentId.value = null
    await fetchData()
  } catch {
    ElMessage.error('添加失败')
  } finally {
    addingStudent.value = false
  }
}

async function handleRemoveStudent(studentId: number) {
  try {
    await removeStudentFromClass(classId.value, studentId)
    ElMessage.success('学生已移除')
    await fetchData()
  } catch {
    ElMessage.error('移除失败')
  }
}

async function handleBatchImport() {
  const lines = batchText.value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l)

  const students = lines.map((line) => {
    const parts = line.split(/[,，\t]+/)
    return {
      username: parts[0]?.trim() || '',
      displayName: parts[1]?.trim() || parts[0]?.trim() || '',
    }
  })

  if (students.length === 0) {
    ElMessage.warning('请输入学生信息')
    return
  }

  importing.value = true
  try {
    const result = await batchImportStudents(classId.value, students)
    importResult.value = result
    showResult.value = true
    batchText.value = ''
  } catch {
    ElMessage.error('导入失败')
  } finally {
    importing.value = false
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.class-detail-page { height: 100%; display: flex; flex-direction: column; }
.page-content { flex: 1; padding: 24px; background: #f5f7fa; overflow-y: auto; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; color: #1a365d; }
.page-header p { color: #999; margin-top: 4px; }
.section-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
