<template>
  <div class="dashboard">
    <NavBar />
    <div class="dashboard-content">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h1>{{ welcomeTitle }}</h1>
          <p>{{ welcomeDesc }}</p>
        </div>
        <div class="welcome-illustration">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
            <rect x="10" y="40" width="12" height="30" rx="3" fill="rgba(255,255,255,0.3)"/>
            <rect x="30" y="25" width="12" height="45" rx="3" fill="rgba(255,255,255,0.5)"/>
            <rect x="50" y="35" width="12" height="35" rx="3" fill="rgba(255,255,255,0.4)"/>
            <rect x="70" y="15" width="12" height="55" rx="3" fill="rgba(255,255,255,0.7)"/>
            <rect x="90" y="30" width="12" height="40" rx="3" fill="rgba(255,255,255,0.5)"/>
            <line x1="8" y1="72" x2="105" y2="72" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <el-row :gutter="16" class="stats-row">
        <el-col :xs="12" :sm="6" v-for="stat in statCards" :key="stat.label">
          <el-card shadow="never" class="stat-card" :style="{ borderLeftColor: stat.color }">
            <div class="stat-content">
              <el-icon class="stat-icon" :size="28" :color="stat.color">{{ stat.icon }}</el-icon>
              <div class="stat-info">
                <h3>{{ stat.value }}</h3>
                <p>{{ stat.label }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Student Section -->
      <template v-if="auth.isStudent">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-card shadow="never" class="content-card">
              <template #header>
                <div class="card-header">
                  <span><el-icon><Timer /></el-icon> 分配的实验</span>
                  <el-link v-if="assignedExperiments.length > 5" @click="router.push('/experiments')" type="primary">查看全部</el-link>
                </div>
              </template>
              <div v-if="loading" v-loading="loading" style="height: 200px"></div>
              <el-empty v-else-if="assignedExperiments.length === 0" description="暂无分配的实验，请联系教师" />
              <div v-else class="exp-list">
                <div v-for="exp in assignedExperiments.slice(0, 5)" :key="exp.id" class="list-item" @click="router.push(`/cases/${exp.caseId}`)">
                  <div class="item-left">
                    <span class="item-title">{{ exp.title }}</span>
                    <span class="item-sub">案例：{{ exp.policyCase?.title }} | 班级：{{ exp.class?.name }}</span>
                  </div>
                  <div class="item-right">
                    <el-tag :type="exp.status === 'active' ? 'success' : exp.status === 'closed' ? 'info' : 'warning'" size="small" effect="plain" round>
                      {{ exp.status === 'active' ? '进行中' : exp.status === 'closed' ? '已结束' : '待开始' }}
                    </el-tag>
                    <el-icon color="#c0c4cc" style="margin-left: 8px"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="never" class="content-card">
              <template #header>
                <div class="card-header">
                  <span><el-icon><School /></el-icon> 我的班级</span>
                </div>
              </template>
              <div v-if="loading" v-loading="loading" style="height: 100px"></div>
              <el-empty v-else-if="myClasses.length === 0" description="暂未加入班级" />
              <div v-else class="class-list">
                <div v-for="cls in myClasses" :key="cls.id" class="class-tag" @click="router.push(`/experiments`)" :title="cls.name">
                  <el-icon><School /></el-icon>
                  <span>{{ cls.name }}</span>
                </div>
              </div>
            </el-card>

            <el-card shadow="never" class="content-card" style="margin-top: 16px">
              <template #header>
                <div class="card-header">
                  <span><el-icon><Document /></el-icon> 最近报告</span>
                  <el-link v-if="recentReports.length > 0" @click="router.push('/reports')" type="primary">全部</el-link>
                </div>
              </template>
              <div v-if="loading" v-loading="loading" style="height: 100px"></div>
              <el-empty v-else-if="recentReports.length === 0" description="暂无报告" />
              <div v-else class="report-list">
                <div v-for="r in recentReports.slice(0, 3)" :key="r.id" class="list-item" @click="router.push('/reports')">
                  <div class="item-left">
                    <span class="item-title">{{ r.caseTitle }}</span>
                    <span class="item-sub">{{ formatDate(r.createdAt) }}</span>
                  </div>
                  <el-tag v-if="r.score != null" type="success" size="small" round>{{ r.score }}分</el-tag>
                  <el-tag v-else type="warning" size="small" round>待批改</el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>

      <!-- Teacher Section -->
      <template v-if="auth.isTeacher">
        <el-row :gutter="16">
          <el-col :span="14">
            <el-card shadow="never" class="content-card">
              <template #header>
                <div class="card-header">
                  <span><el-icon><Timer /></el-icon> 最近的实验</span>
                  <el-link v-if="recentExperiments.length > 0" @click="router.push('/experiments')" type="primary">管理实验</el-link>
                </div>
              </template>
              <div v-if="loading" v-loading="loading" style="height: 200px"></div>
              <el-empty v-else-if="recentExperiments.length === 0" description="暂无实验，点击右上角创建" />
              <div v-else class="exp-list">
                <div v-for="exp in recentExperiments.slice(0, 5)" :key="exp.id" class="list-item" @click="router.push(`/experiments/${exp.id}`)">
                  <div class="item-left">
                    <span class="item-title">{{ exp.title }}</span>
                    <span class="item-sub">{{ exp.className }} · {{ exp.caseTitle }}</span>
                  </div>
                  <div class="item-right">
                    <el-tag :type="exp.status === 'active' ? 'success' : exp.status === 'closed' ? 'info' : 'warning'" size="small" effect="plain" round>
                      {{ exp.status === 'active' ? '进行中' : exp.status === 'closed' ? '已结束' : '待开始' }}
                    </el-tag>
                    <el-icon color="#c0c4cc" style="margin-left: 8px"><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="10">
            <el-card shadow="never" class="content-card">
              <template #header>
                <div class="card-header">
                  <span><el-icon><School /></el-icon> 班级概览</span>
                  <el-link v-if="classList.length > 0" @click="router.push('/classes')" type="primary">管理班级</el-link>
                </div>
              </template>
              <div v-if="loading" v-loading="loading" style="height: 200px"></div>
              <el-empty v-else-if="classList.length === 0" description="暂无班级，去创建" />
              <div v-else class="class-grid">
                <div v-for="cls in classList" :key="cls.id" class="class-mini-card" @click="router.push(`/classes/${cls.id}`)">
                  <div class="class-mini-header">
                    <el-icon color="#409eff"><School /></el-icon>
                    <span>{{ cls.name }}</span>
                  </div>
                  <div class="class-mini-stat">
                    <span class="num">{{ cls.studentCount }}</span>
                    <span class="lbl">名学生</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- Quick Actions -->
        <el-card shadow="never" class="content-card" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span><el-icon><Plus /></el-icon> 快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button @click="router.push('/classes')" class="action-btn">
              <el-icon><Plus /></el-icon>创建班级
            </el-button>
            <el-button @click="router.push('/experiments')" class="action-btn">
              <el-icon><Timer /></el-icon>分配实验
            </el-button>
            <el-button @click="router.push('/cases')" class="action-btn">
              <el-icon><Reading /></el-icon>浏览案例
            </el-button>
            <el-button @click="router.push('/reports')" class="action-btn">
              <el-icon><Document /></el-icon>批改报告
            </el-button>
          </div>
        </el-card>
      </template>

      <!-- Admin Section -->
      <template v-if="!auth.isTeacher && !auth.isStudent">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><Reading /></el-icon> 全部案例</span>
              <el-link @click="router.push('/cases')" type="primary">管理案例</el-link>
            </div>
          </template>
          <el-row :gutter="12">
            <el-col :xs="12" :sm="8" :md="6" v-for="c in recentCases" :key="c.id" style="margin-bottom: 12px">
              <el-card shadow="hover" class="case-card" @click="router.push(`/cases/${c.id}`)">
                <div class="case-category">
                  <el-tag size="small" round :color="getCategoryColor(c.category)" style="color:#fff;border:0">{{ c.category }}</el-tag>
                </div>
                <h4>{{ c.title }}</h4>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </template>

      <!-- Case Quick Access for Students too -->
      <template v-if="auth.isStudent">
        <el-card shadow="never" class="content-card" style="margin-top: 16px">
          <template #header>
            <div class="card-header">
              <span><el-icon><Reading /></el-icon> 案例中心</span>
              <el-link @click="router.push('/cases')" type="primary">全部案例 &gt;</el-link>
            </div>
          </template>
          <el-row :gutter="12">
            <el-col :xs="12" :sm="8" :md="6" v-for="c in recentCases" :key="c.id" style="margin-bottom: 12px">
              <el-card shadow="hover" class="case-card" @click="router.push(`/cases/${c.id}`)">
                <div class="case-category">
                  <el-tag size="small" round :color="getCategoryColor(c.category)" style="color:#fff;border:0">{{ c.category }}</el-tag>
                </div>
                <h4>{{ c.title }}</h4>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getCases, type PolicyCase } from '../api/cases'
import { getStudentStats, getTeacherStats, type StudentStats, type TeacherStats } from '../api/stats'
import { getAssignedExperiments, type Experiment } from '../api/experiments'
import NavBar from '../components/NavBar.vue'
import { Reading, DataAnalysis, Document, School, Timer, Plus, ArrowRight, UserFilled, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const recentCases = ref<PolicyCase[]>([])

// Student stats
const assignedExperiments = ref<Experiment[]>([])
const myClasses = ref<{ id: number; name: string }[]>([])
const recentReports = ref<StudentStats['recentReports']>([])
const stats = ref<StudentStats | TeacherStats | null>(null)

// Teacher/Admin stats
const className = ref('')
const classList = ref<TeacherStats['classList']>([])
const recentExperiments = ref<TeacherStats['recentExperiments']>([])

const welcomeTitle = computed(() => {
  const name = auth.displayName || auth.user?.username || '用户'
  return `你好，${name}`
})

const welcomeDesc = computed(() => {
  if (auth.isTeacher) return '管理班级、分配实验、查看学生仿真进度'
  if (auth.isStudent) return '参与实验、进行仿真、提交分析报告'
  return '管理系统用户、案例库和平台配置'
})

const statCards = computed(() => {
  if (auth.isStudent && stats.value) {
    const s = stats.value as StudentStats
    return [
      { label: '仿真案例', value: s.totalCases, icon: Reading, color: '#409eff' },
      { label: '仿真次数', value: s.totalSims, icon: DataAnalysis, color: '#48bb78' },
      { label: '实验报告', value: s.totalReports, icon: Document, color: '#e6a23c' },
      { label: '教学班级', value: s.totalClasses, icon: School, color: '#9f7aea' },
    ]
  }
  if (auth.isTeacher && stats.value) {
    const s = stats.value as TeacherStats
    return [
      { label: '教学班级', value: s.totalClasses, icon: School, color: '#409eff' },
      { label: '学生总数', value: s.totalStudents, icon: UserFilled, color: '#48bb78' },
      { label: '分配实验', value: s.totalExperiments, icon: Timer, color: '#e6a23c' },
      { label: '仿真提交', value: s.totalSubmissions, icon: DataAnalysis, color: '#9f7aea' },
    ]
  }
  return [
    { label: '仿真案例', value: recentCases.value.length, icon: Reading, color: '#409eff' },
    { label: '仿真次数', value: '-', icon: DataAnalysis, color: '#48bb78' },
    { label: '实验报告', value: '-', icon: Document, color: '#e6a23c' },
      { label: '系统管理', value: '-', icon: Setting, color: '#9f7aea' },
  ]
})

const categoryColors: Record<string, string> = {
  '财政税收': '#409eff',
  '环境政策': '#48bb78',
  '社会保障': '#e6a23c',
  '住房政策': '#f56565',
  '科技政策': '#9f7aea',
  '应急管理': '#ed64a6',
  '智慧城市': '#38b2ac',
}

function getCategoryColor(cat: string): string {
  return categoryColors[cat] || '#909399'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

onMounted(async () => {
  try {
    const [cases] = await Promise.all([
      getCases(),
    ])
    recentCases.value = cases.slice(0, 4)

    if (auth.isStudent) {
      const [s, exps] = await Promise.all([
        getStudentStats(),
        getAssignedExperiments().catch(() => [] as Experiment[]),
      ])
      stats.value = s
      assignedExperiments.value = exps
      myClasses.value = s.myClasses
      recentReports.value = s.recentReports
    } else if (auth.isTeacher) {
      const s = await getTeacherStats()
      stats.value = s
      classList.value = s.classList
      recentExperiments.value = s.recentExperiments
    }
  } catch {
    // silently fail
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.dashboard-content {
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, #1a365d 0%, #2d6a9f 100%);
  border-radius: 16px;
  padding: 28px 36px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 4px 20px rgba(26, 54, 93, 0.15);
}

.welcome-text h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #fff;
}

.welcome-text p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.welcome-illustration {
  flex-shrink: 0;
}

/* Stats Cards */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border-left: 4px solid #409eff;
  margin-bottom: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 6px 0;
}

.stat-icon {
  flex-shrink: 0;
  background: rgba(64, 158, 255, 0.1);
  padding: 10px;
  border-radius: 10px;
}

.stat-info h3 {
  font-size: 24px;
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0;
}

.stat-info p {
  color: var(--text-muted);
  font-size: 13px;
  margin: 2px 0 0;
}

/* Content Cards */
.content-card {
  border-radius: 12px;
  margin-bottom: 16px;
}

.content-card :deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* List Items */
.exp-list,
.report-list {
  min-height: 60px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.15s;
  border-radius: 6px;
}

.list-item:hover {
  background: #f8fafc;
}

.list-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.item-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Class list */
.class-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.class-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f0f5ff;
  border-radius: 20px;
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  transition: background 0.2s;
}

.class-tag:hover {
  background: #dbeafe;
}

/* Class Grid (Teacher) */
.class-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.class-mini-card {
  background: #f8fafc;
  border-radius: 10px;
  padding: 14px;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  border: 1px solid #f0f0f0;
}

.class-mini-card:hover {
  background: #f0f5ff;
  transform: translateY(-1px);
}

.class-mini-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.class-mini-stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.class-mini-stat .num {
  font-size: 22px;
  font-weight: 700;
  color: #409eff;
}

.class-mini-stat .lbl {
  font-size: 12px;
  color: var(--text-muted);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  flex: 1;
  min-width: 140px;
  height: 44px;
  font-size: 14px;
  border-radius: 10px;
}

/* Case Cards */
.case-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 10px;
}

.case-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.case-category {
  margin-bottom: 8px;
}

.case-card h4 {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.4;
  margin: 0;
}

/* Empty state spacing */
:deep(.el-empty) {
  padding: 30px 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .dashboard-content {
    padding: 16px;
  }
  .welcome-banner {
    padding: 20px;
  }
  .welcome-illustration {
    display: none;
  }
  .welcome-text h1 {
    font-size: 20px;
  }
}
</style>
