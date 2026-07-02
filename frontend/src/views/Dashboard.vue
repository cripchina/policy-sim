<template>
  <div class="dashboard">
    <NavBar />
    <div class="dashboard-content">
      <div class="welcome-section">
        <h1>欢迎回来，{{ auth.displayName }}</h1>
        <p class="role-desc">
          <template v-if="auth.isTeacher">作为教师，您可以创建和管理仿真案例、分配实验任务、批改学生报告。</template>
          <template v-else-if="auth.isStudent">作为学生，您可以参与政策仿真实验、提交分析报告、查看成绩反馈。</template>
          <template v-else>作为管理员，您可以管理系统用户、案例库和系统配置。</template>
        </p>
      </div>

      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon" :size="40" color="#409eff"><Reading /></el-icon>
              <div class="stat-info">
                <h3>{{ caseCount }}</h3>
                <p>仿真案例</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon" :size="40" color="#67c23a"><DataAnalysis /></el-icon>
              <div class="stat-info">
                <h3>{{ simCount }}</h3>
                <p>仿真次数</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon" :size="40" color="#e6a23c"><Document /></el-icon>
              <div class="stat-info">
                <h3>{{ reportCount }}</h3>
                <p>实验报告</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-card class="quick-start">
        <template #header>
          <span>快速开始</span>
        </template>
        <el-row :gutter="16">
          <el-col :span="6" v-for="c in recentCases" :key="c.id">
            <el-card shadow="hover" class="case-card" @click="router.push(`/cases/${c.id}`)">
              <h4>{{ c.title }}</h4>
              <el-tag size="small">{{ c.category }}</el-tag>
              <p class="case-desc">{{ c.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getCases, type PolicyCase } from '../api/cases'
import { getHistory } from '../api/simulation'
import { getReports } from '../api/reports'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const auth = useAuthStore()

const caseCount = ref(0)
const simCount = ref(0)
const reportCount = ref(0)
const recentCases = ref<PolicyCase[]>([])

onMounted(async () => {
  try {
    const cases = await getCases()
    caseCount.value = cases.length
    recentCases.value = cases.slice(0, 4)

    const history = await getHistory()
    simCount.value = history.length

    const reports = await getReports()
    reportCount.value = reports.length
  } catch {
    // silently fail
  }
})
</script>

<style scoped>
.dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.dashboard-content {
  flex: 1;
  padding: 24px;
  background: #f5f7fa;
  overflow-y: auto;
}
.welcome-section {
  margin-bottom: 24px;
}
.welcome-section h1 {
  font-size: 28px;
  color: #1a365d;
  margin-bottom: 8px;
}
.role-desc {
  color: #666;
  font-size: 14px;
}
.stat-row {
  margin-bottom: 24px;
}
.stat-card {
  cursor: default;
}
.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-info h3 {
  font-size: 28px;
  color: #333;
}
.stat-info p {
  color: #999;
  font-size: 13px;
  margin-top: 4px;
}
.quick-start {
  margin-top: 8px;
}
.case-card {
  cursor: pointer;
  transition: transform 0.2s;
}
.case-card:hover {
  transform: translateY(-2px);
}
.case-card h4 {
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.case-desc {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
