<template>
  <div class="reports-page">
    <NavBar />
    <div class="page-content">
      <div class="page-header">
        <h1>实验报告</h1>
        <p v-if="auth.isTeacher">查看和批改学生提交的实验报告</p>
        <p v-else>查看你提交的实验报告和成绩</p>
      </div>

      <el-table :data="reports" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="编号" width="70" />
        <el-table-column v-if="auth.isTeacher" prop="student.displayName" label="学生" width="120" />
        <el-table-column prop="policyCase?.title" label="案例" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="router.push(`/cases/${row.caseId}`)">
              {{ row.policyCase?.title || `案例 #${row.caseId}` }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="成绩" width="80">
          <template #default="{ row }">
            <span :style="{ color: row.score ? (row.score >= 60 ? '#67c23a' : '#f56c6c') : '#999', fontWeight: 'bold' }">
              {{ row.score ?? '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="viewReport(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && reports.length === 0" description="暂无实验报告" />
    </div>

    <!-- View Report Dialog -->
    <el-dialog v-model="viewVisible" :title="'报告详情'" width="700px">
      <template v-if="viewTarget">
        <p style="margin-bottom: 12px">
          <strong>案例：</strong>{{ viewTarget.policyCase?.title }}
          <span style="margin: 0 12px">|</span>
          <strong>学生：</strong>{{ viewTarget.student?.displayName }}
          <span style="margin: 0 12px">|</span>
          <strong>状态：</strong>
          <el-tag :type="statusType(viewTarget.status)" size="small">{{ statusLabel(viewTarget.status) }}</el-tag>
        </p>
        <el-divider />
        <div class="report-content">{{ viewTarget.content }}</div>
        <el-divider v-if="viewTarget.teacherComment" />
        <div v-if="viewTarget.teacherComment" class="teacher-comment">
          <p><strong>教师评语：</strong></p>
          <p>{{ viewTarget.teacherComment }}</p>
        </div>
        <div v-if="viewTarget.score !== null && viewTarget.score !== undefined" class="score-display">
          <p>成绩：<span :style="{ color: viewTarget.score >= 60 ? '#67c23a' : '#f56c6c', fontSize: '20px', fontWeight: 'bold' }">{{ viewTarget.score }}</span> / 100</p>
        </div>
      </template>
      <template #footer>
        <el-button @click="viewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getReports, type Report } from '../api/reports'
import { useAuthStore } from '../stores/auth'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const reports = ref<Report[]>([])
const viewVisible = ref(false)
const viewTarget = ref<Report | null>(null)

onMounted(async () => {
  try {
    reports.value = await getReports()
  } catch {
    // handled
  } finally {
    loading.value = false
  }
})

function statusType(status: string): string {
  return status === 'graded' ? 'success' : status === 'submitted' ? 'warning' : 'info'
}

function statusLabel(status: string): string {
  return status === 'graded' ? '已批改' : status === 'submitted' ? '待批改' : '草稿'
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN')
}

function viewReport(report: Report) {
  viewTarget.value = report
  viewVisible.value = true
}
</script>

<style scoped>
.reports-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.page-content {
  flex: 1;
  padding: 24px;
  background: #f5f7fa;
  overflow-y: auto;
}
.page-header {
  margin-bottom: 20px;
}
.page-header h1 {
  font-size: 24px;
  color: #1a365d;
}
.page-header p {
  color: #999;
  margin-top: 4px;
}
.report-content {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #333;
  font-size: 14px;
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
}
.teacher-comment {
  background: #fef7e0;
  padding: 12px 16px;
  border-radius: 6px;
  color: #856404;
}
.score-display {
  margin-top: 16px;
  text-align: center;
}
</style>
