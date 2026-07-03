<template>
  <div class="dashboard">
    <NavBar />
    <div class="dashboard-content">
      <div class="welcome-section">
        <h1>欢迎回来，{{ auth.displayName }}</h1>
        <p class="role-desc">
          <template v-if="auth.isTeacher">管理班级、分配实验、查看学生仿真进度。</template>
          <template v-else-if="auth.isStudent">选择案例进行仿真实验，提交分析报告。</template>
          <template v-else>管理系统用户、案例库和平台配置。</template>
        </p>
      </div>

      <!-- Stats Cards -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon" :size="36" color="#409eff"><Reading /></el-icon>
              <div class="stat-info">
                <h3>{{ caseCount }}</h3>
                <p>仿真案例</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon" :size="36" color="#48bb78"><DataAnalysis /></el-icon>
              <div class="stat-info">
                <h3>{{ simCount }}</h3>
                <p>仿真次数</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon" :size="36" color="#e6a23c"><Document /></el-icon>
              <div class="stat-info">
                <h3>{{ reportCount }}</h3>
                <p>实验报告</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon" :size="36" color="#9f7aea"><School /></el-icon>
              <div class="stat-info">
                <h3>{{ classCount }}</h3>
                <p>教学班级</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="8" :md="4">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-content">
              <el-icon class="stat-icon" :size="36" color="#ed64a6"><Timer /></el-icon>
              <div class="stat-info">
                <h3>{{ experimentCount }}</h3>
                <p>分配实验</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Teacher/Admin: Quick Actions -->
      <el-row :gutter="20" v-if="auth.isTeacher">
        <el-col :span="12">
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>快捷操作</span>
              </div>
            </template>
            <div class="quick-actions">
              <el-button @click="router.push('/classes')" class="action-btn">
                <el-icon><Plus /></el-icon>创建班级
              </el-button>
              <el-button @click="router.push('/experiments')" class="action-btn">
                <el-icon><Plus /></el-icon>分配实验
              </el-button>
              <el-button @click="router.push('/cases')" class="action-btn">
                <el-icon><Reading /></el-icon>浏览案例
              </el-button>
              <el-button @click="router.push('/reports')" class="action-btn">
                <el-icon><Document /></el-icon>批改报告
              </el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>最近的实验</span>
              </div>
            </template>
            <div v-if="recentExperiments.length === 0" style="color: #999; padding: 20px 0; text-align: center;">
              暂无实验，点击左侧"分配实验"创建
            </div>
            <div v-for="exp in recentExperiments" :key="exp.id" class="experiment-item" @click="router.push(`/experiments/${exp.id}`)">
              <div class="exp-info">
                <span class="exp-title">{{ exp.title }}</span>
                <span class="exp-class">{{ exp.class?.name }}</span>
              </div>
              <el-tag :type="exp.status === 'active' ? 'success' : exp.status === 'closed' ? 'info' : 'warning'" size="small">
                {{ exp.status === 'active' ? '进行中' : exp.status === 'closed' ? '已结束' : '待开始' }}
              </el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Student: Recent Simulations -->
      <el-row :gutter="20" v-if="auth.isStudent">
        <el-col :span="12">
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>我的最近的仿真</span>
              </div>
            </template>
            <div v-if="recentSims.length === 0" style="color: #999; padding: 20px 0; text-align: center;">
              尚未进行仿真，去案例中心开始吧
            </div>
            <div v-for="sim in recentSims" :key="sim.id" class="sim-item">
              <div class="sim-info">
                <span class="sim-case">{{ sim.caseTitle }}</span>
                <span class="sim-date">{{ formatDate(sim.createdAt) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <span>快速入口</span>
              </div>
            </template>
            <div class="quick-actions">
              <el-button @click="router.push('/cases')" class="action-btn">
                <el-icon><Reading /></el-icon>浏览案例
              </el-button>
              <el-button @click="router.push('/reports')" class="action-btn">
                <el-icon><Document /></el-icon>我的报告
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- All Cases Quick Start -->
      <el-card class="section-card" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>全部案例</span>
            <el-link @click="router.push('/cases')" type="primary">查看全部 &gt;</el-link>
          </div>
        </template>
        <el-row :gutter="16">
          <el-col :xs="12" :sm="8" :md="6" v-for="c in recentCases" :key="c.id" style="margin-bottom: 12px">
            <el-card shadow="hover" class="case-card" @click="router.push(`/cases/${c.id}`)">
              <div class="case-category">
                <el-tag size="small">{{ c.category }}</el-tag>
              </div>
              <h4>{{ c.title }}</h4>
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
import { getHistory, type SimHistoryItem } from '../api/simulation'
import { getReports } from '../api/reports'
import { getClasses, type Class } from '../api/classes'
import { getExperiments, type Experiment } from '../api/experiments'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const auth = useAuthStore()

const caseCount = ref(0)
const simCount = ref(0)
const reportCount = ref(0)
const classCount = ref(0)
const experimentCount = ref(0)
const recentCases = ref<PolicyCase[]>([])
const recentExperiments = ref<Experiment[]>([])
const recentSims = ref<SimHistoryItem[]>([])

onMounted(async () => {
  try {
    // Load all data in parallel
    const [cases, history, reports, classes, experiments] = await Promise.all([
      getCases(),
      getHistory(),
      getReports(),
      getClasses().catch(() => [] as Class[]),
      getExperiments().catch(() => [] as Experiment[]),
    ])

    caseCount.value = cases.length
    recentCases.value = cases.slice(0, 4)

    simCount.value = history.length
    recentSims.value = history.slice(0, 5)

    reportCount.value = Array.isArray(reports) ? reports.length : 0

    classCount.value = Array.isArray(classes) ? classes.length : 0
    recentExperiments.value = Array.isArray(experiments) ? experiments.slice(0, 5) : []
    experimentCount.value = Array.isArray(experiments) ? experiments.length : 0
  } catch {
    // silently fail
  }
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.dashboard { height: 100%; display: flex; flex-direction: column; }
.dashboard-content { flex: 1; padding: 24px; background: #f5f7fa; overflow-y: auto; }
.welcome-section { margin-bottom: 24px; }
.welcome-section h1 { font-size: 28px; color: var(--primary); margin-bottom: 8px; }
.role-desc { color: var(--text-secondary); font-size: 14px; }
.stats-row { margin-bottom: 20px; }
.stat-card { cursor: default; text-align: center; }
.stat-content { display: flex; align-items: center; gap: 12px; padding: 4px 0; }
.stat-icon { flex-shrink: 0; }
.stat-info { text-align: left; }
.stat-info h3 { font-size: 26px; color: var(--text-primary); line-height: 1.2; }
.stat-info p { color: var(--text-muted); font-size: 12px; margin-top: 2px; }
.section-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.quick-actions { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px 0; }
.action-btn { flex: 1; min-width: 120px; }
.experiment-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid var(--border-color); cursor: pointer;
  transition: background 0.15s;
}
.experiment-item:hover { background: #f8fafc; }
.experiment-item:last-child { border-bottom: none; }
.exp-info { display: flex; flex-direction: column; gap: 2px; }
.exp-title { font-size: 14px; color: var(--text-primary); font-weight: 500; }
.exp-class { font-size: 12px; color: var(--text-muted); }
.sim-item { padding: 10px 0; border-bottom: 1px solid var(--border-color); }
.sim-item:last-child { border-bottom: none; }
.sim-info { display: flex; justify-content: space-between; align-items: center; }
.sim-case { font-size: 14px; color: var(--text-primary); }
.sim-date { font-size: 12px; color: var(--text-muted); }
.case-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
.case-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.case-category { margin-bottom: 8px; }
.case-card h4 { font-size: 14px; color: var(--text-primary); line-height: 1.4; }
</style>
