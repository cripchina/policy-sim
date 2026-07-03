<template>
  <div class="case-detail-page">
    <NavBar />
    <div class="page-content" v-loading="loading">
      <div class="breadcrumb">
        <el-link @click="router.push('/cases')">← 返回案例列表</el-link>
        <span class="breadcrumb-sep">|</span>
        <span class="breadcrumb-cat">{{ policyCase?.category }}</span>
      </div>

      <template v-if="policyCase">
        <div class="case-header">
          <div class="case-header-info">
            <h1>{{ policyCase.title }}</h1>
            <p class="case-desc">{{ policyCase.description }}</p>
          </div>
          <el-tag :color="categoryColor(policyCase.category)" effect="dark" size="small">
            {{ policyCase.category }}
          </el-tag>
        </div>

        <el-tabs v-model="activeTab" type="border-card">
          <!-- Background Tab -->
          <el-tab-pane label="案例背景" name="background">
            <div class="markdown-content" v-html="renderedBackground"></div>
          </el-tab-pane>

          <!-- Simulation Tab -->
          <el-tab-pane label="政策仿真" name="simulation">
            <div class="simulation-layout">
              <!-- Left: Parameters -->
              <div class="params-panel">
                <div class="params-header">
                  <h3>政策参数设置</h3>
                  <el-tooltip content="调整参数后自动运行仿真" placement="top">
                    <el-icon class="auto-run-icon" :class="{ active: autoRun }" @click="autoRun = !autoRun">
                      <VideoPlay />
                    </el-icon>
                  </el-tooltip>
                </div>
                <p class="params-hint">拖动滑块调整政策参数，结果实时更新</p>

                <div v-for="p in config?.parameters" :key="p.id" class="param-item">
                  <div class="param-label">
                    <span class="param-name">
                      <el-icon v-if="paramIcon(p.type)" size="14" style="margin-right: 4px; color: var(--primary)">
                        <component :is="paramIcon(p.type)" />
                      </el-icon>
                      {{ p.label }}
                    </span>
                    <span class="param-value" :style="{ color: paramValueDiff(p.id) }">
                      <template v-if="p.type === 'slider'">{{ paramValues[p.id] ?? p.default }}{{ p.unit }}</template>
                      <template v-else-if="p.type === 'select'">
                        {{ p.options?.find(o => o.value === (paramValues[p.id] ?? p.default))?.label }}
                      </template>
                      <template v-else>{{ paramValues[p.id] ?? p.default }}{{ p.unit }}</template>
                    </span>
                  </div>
                  <template v-if="p.type === 'slider'">
                    <div class="slider-wrapper">
                      <el-slider
                        v-model="paramValues[p.id]"
                        :min="p.min"
                        :max="p.max"
                        :step="p.step || 1"
                        show-input
                        :input-size="'small'"
                        @change="onParamChange"
                      />
                    </div>
                    <div class="param-range">
                      <span>{{ p.min }}{{ p.unit }}</span>
                      <span>{{ p.max }}{{ p.unit }}</span>
                    </div>
                  </template>
                  <template v-else-if="p.type === 'select' && p.options">
                    <el-select v-model="paramValues[p.id]" style="width: 100%" @change="onParamChange">
                      <el-option v-for="opt in p.options" :key="opt.value" :label="opt.label" :value="opt.value" />
                    </el-select>
                  </template>
                  <template v-else-if="p.type === 'number'">
                    <el-input-number
                      v-model="paramValues[p.id]"
                      :min="p.min"
                      :max="p.max"
                      :step="p.step || 1"
                      style="width: 100%"
                      @change="onParamChange"
                    />
                  </template>
                </div>

                <div class="params-actions">
                  <el-button type="primary" size="large" class="run-btn" :loading="running" @click="executeSimulation">
                    <el-icon style="margin-right: 6px"><CaretRight /></el-icon>
                    {{ running ? '仿真中...' : '运行仿真' }}
                  </el-button>
                  <el-tooltip content="保存当前方案进行对比" placement="top">
                    <el-button size="large" :disabled="!simResult" @click="saveScenario">
                      <el-icon><Plus /></el-icon>保存方案
                    </el-button>
                  </el-tooltip>
                </div>

                <!-- Saved scenarios -->
                <div v-if="savedScenarios.length > 0" class="scenarios-section">
                  <h4>方案对比 ({{ savedScenarios.length }})</h4>
                  <div v-for="(sc, i) in savedScenarios" :key="i" class="scenario-item" @click="selectScenario(i)">
                    <div class="scenario-info">
                      <span class="scenario-name">方案 {{ i + 1 }}</span>
                      <span class="scenario-time">{{ formatTime(sc.time) }}</span>
                    </div>
                    <el-button size="small" text type="danger" @click.stop="removeScenario(i)">删除</el-button>
                  </div>
                </div>
              </div>

              <!-- Right: Results -->
              <div class="results-panel">
                <h3>仿真结果</h3>

                <template v-if="hasResults">
                  <!-- Multi-line chart when scenarios exist -->
                  <div class="chart-container" v-if="savedScenarios.length > 0">
                    <v-chart :option="compareRadarOption" style="height: 360px" autoresize />
                    <div class="chart-legend">
                      <span class="legend-item"><span class="legend-dot" style="background:#409eff"></span>当前方案</span>
                      <span v-for="(_, i) in savedScenarios" :key="i" class="legend-item">
                        <span class="legend-dot" :style="{ background: scenarioColor(i) }"></span>方案 {{ i + 1 }}
                      </span>
                    </div>
                  </div>

                  <!-- Single radar chart -->
                  <div class="chart-container" v-else>
                    <v-chart :option="radarOption" style="height: 350px" autoresize />
                  </div>

                  <!-- Indicator Cards -->
                  <div class="indicator-grid">
                    <div
                      v-for="r in simResult"
                      :key="r.indicatorId"
                      class="indicator-card"
                      :class="{ good: r.higherIsBetter && normalizedValue(r.value) >= 50, bad: r.higherIsBetter && normalizedValue(r.value) < 30 }"
                    >
                      <div class="indicator-value">
                        {{ formatValue(r.value, r.format) }}
                        <span class="indicator-unit">{{ r.unit }}</span>
                      </div>
                      <div class="indicator-label">{{ r.label }}</div>
                      <div class="indicator-bar">
                        <div class="indicator-fill" :style="{ width: normalizedValue(r.value) + '%', background: r.higherIsBetter ? '#48bb78' : '#f56565' }"></div>
                      </div>
                    </div>
                  </div>
                </template>

                <el-empty v-else description="调整参数后点击「运行仿真」查看结果" :image-size="120" />

                <!-- History -->
                <template v-if="history.length > 0">
                  <el-divider />
                  <div class="history-header">
                    <h4>仿真历史记录</h4>
                    <el-button size="small" text @click="clearHistory">清空</el-button>
                  </div>
                  <div class="history-list">
                    <div
                      v-for="h in history"
                      :key="h.id"
                      class="history-item"
                      @click="restoreHistory(h)"
                    >
                      <span class="history-time">{{ formatDateTime(h.createdAt) }}</span>
                      <span class="history-params">{{ summarizeParams(h.parameters) }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </el-tab-pane>

          <!-- Report Tab -->
          <el-tab-pane label="实验报告" name="report">
            <div class="report-section">
              <div v-if="auth.isStudent">
                <el-alert
                  v-if="lastSimResult"
                  title="提示：可将当前仿真结果截图或记录关键数据用于报告中"
                  type="info"
                  :closable="false"
                  show-icon
                  style="margin-bottom: 16px"
                />
                <el-input
                  v-model="reportContent"
                  type="textarea"
                  :rows="14"
                  placeholder="请输入你的实验分析报告...&#10;&#10;建议结构：&#10;1. 实验目的&#10;2. 参数设置与依据&#10;3. 仿真结果分析&#10;4. 政策建议"
                  style="margin-bottom: 16px"
                />
                <el-button type="primary" :loading="submittingReport" @click="submitReport">
                  提交报告
                </el-button>
              </div>

              <div v-if="auth.isTeacher">
                <el-table :data="reports" stripe style="width: 100%">
                  <el-table-column prop="student.displayName" label="学生" width="120" />
                  <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="row.status === 'graded' ? 'success' : row.status === 'submitted' ? 'warning' : 'info'">
                        {{ row.status === 'graded' ? '已批改' : row.status === 'submitted' ? '待批改' : '草稿' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="score" label="成绩" width="80">
                    <template #default="{ row }">
                      <span :style="{ color: row.score ? (row.score >= 60 ? '#48bb78' : '#f56565') : '#a0aec0', fontWeight: 600 }">
                        {{ row.score ?? '-' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="content" label="报告内容" min-width="280">
                    <template #default="{ row }">
                      <span class="report-preview">{{ row.content?.substring(0, 100) }}...</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        v-if="row.status === 'submitted'"
                        size="small"
                        type="primary"
                        @click="gradeDialog(row)"
                      >
                        批改
                      </el-button>
                      <el-button size="small" @click="viewReport(row)">查看</el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <el-empty v-if="reports.length === 0" description="暂无学生提交报告" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>

    <!-- Grade Dialog -->
    <el-dialog v-model="gradeVisible" title="批改报告" width="560px">
      <div v-if="gradeTarget" class="grade-report-preview">
        <p class="grade-label"><strong>学生报告：</strong></p>
        <div class="grade-content">{{ gradeTarget.content }}</div>
      </div>
      <el-divider />
      <el-form label-width="80px">
        <el-form-item label="成绩">
          <el-input-number v-model="gradeScore" :min="0" :max="100" />
          <span style="margin-left: 8px; color: #999">分</span>
        </el-form-item>
        <el-form-item label="评语">
          <el-input v-model="gradeComment" type="textarea" :rows="4" placeholder="输入给学生的评语..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="gradeVisible = false">取消</el-button>
        <el-button type="primary" :loading="grading" @click="submitGrade">提交批改</el-button>
      </template>
    </el-dialog>

    <!-- View Report Dialog -->
    <el-dialog v-model="viewVisible" title="报告详情" width="700px">
      <template v-if="viewTarget">
        <p style="margin-bottom: 12px; color: var(--text-secondary)">
          <strong>案例：</strong>{{ viewTarget.policyCase?.title }}
          <span style="margin: 0 12px; color: #e2e8f0">|</span>
          <strong>学生：</strong>{{ viewTarget.student?.displayName }}
          <span style="margin: 0 12px; color: #e2e8f0">|</span>
          <strong>状态：</strong>
          <el-tag :type="viewTarget.status === 'graded' ? 'success' : viewTarget.status === 'submitted' ? 'warning' : 'info'" size="small">
            {{ viewTarget.status === 'graded' ? '已批改' : viewTarget.status === 'submitted' ? '待批改' : '草稿' }}
          </el-tag>
        </p>
        <el-divider />
        <div class="report-content-display">{{ viewTarget.content }}</div>
        <el-divider v-if="viewTarget.teacherComment" />
        <div v-if="viewTarget.teacherComment" class="teacher-comment">
          <p><strong>教师评语：</strong></p>
          <p>{{ viewTarget.teacherComment }}</p>
        </div>
        <div v-if="viewTarget.score !== null && viewTarget.score !== undefined" class="score-display">
          <p>成绩：<span :style="{ color: viewTarget.score >= 60 ? '#48bb78' : '#f56565', fontSize: '22px', fontWeight: 700 }">{{ viewTarget.score }}</span> / 100</p>
        </div>
      </template>
      <template #footer>
        <el-button @click="viewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { use } from 'echarts/core'
import { RadarChart, BarChart, LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, RadarComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { VideoPlay, Plus, CaretRight } from '@element-plus/icons-vue'
import { getCase, type PolicyCase, type SimConfig } from '../api/cases'
import { runSimulation as runSimulationApi, getHistory, type SimResult, type SimHistoryItem } from '../api/simulation'
import { getReports, createReport, gradeReport, type Report } from '../api/reports'
import { useAuthStore } from '../stores/auth'
import NavBar from '../components/NavBar.vue'

use([RadarChart, BarChart, LineChart, TitleComponent, TooltipComponent, LegendComponent, RadarComponent, CanvasRenderer])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const policyCase = ref<PolicyCase | null>(null)
const config = ref<SimConfig | null>(null)
const paramValues = ref<Record<string, number>>({})
const running = ref(false)
const simResult = ref<SimResult[] | null>(null)
const history = ref<SimHistoryItem[]>([])
const activeTab = ref('background')
const autoRun = ref(true)

// Report
const reportContent = ref('')
const reports = ref<Report[]>([])
const submittingReport = ref(false)
const gradeVisible = ref(false)
const gradeTarget = ref<Report | null>(null)
const gradeScore = ref(80)
const gradeComment = ref('')
const grading = ref(false)
const viewVisible = ref(false)
const viewTarget = ref<Report | null>(null)
const lastSimResult = ref(false)

// Scenario comparison
interface Scenario {
  params: Record<string, number>
  results: SimResult[]
  time: Date
}
const savedScenarios = ref<Scenario[]>([])

const scenarioColors = ['#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

function scenarioColor(i: number): string {
  return scenarioColors[i % scenarioColors.length]
}

const hasResults = computed(() => simResult.value && simResult.value.length > 0)

// Category color
const categoryColors: Record<string, string> = {
  '财政税收': '#e53e3e', '环境政策': '#38a169', '社会保障': '#d69e2e',
  '住房政策': '#805ad5', '科技政策': '#319795', '应急管理': '#e53e3e', '智慧城市': '#4299e1',
}
function categoryColor(cat: string): string {
  return categoryColors[cat] || '#718096'
}

// Param icons
import { TrendCharts, DataBoard } from '@element-plus/icons-vue'

function paramIcon(type: string) {
  if (type === 'slider') return TrendCharts
  if (type === 'select') return DataBoard
  return null
}

function paramValueDiff(id: string): string {
  return 'var(--primary)'
}

onMounted(async () => {
  const caseId = Number(route.params.id)
  try {
    policyCase.value = await getCase(caseId)
    config.value = JSON.parse(policyCase.value.config)

    if (config.value) {
      for (const p of config.value.parameters) {
        paramValues.value[p.id] = p.default
      }
    }

    history.value = await getHistory(caseId)

    if (auth.isTeacher) {
      reports.value = await getReports(caseId)
    }
  } catch {
    ElMessage.error('案例加载失败')
    router.push('/cases')
  } finally {
    loading.value = false
  }
})

// Auto-run on param change (debounced)
let autoRunTimer: ReturnType<typeof setTimeout> | null = null
function onParamChange() {
  if (autoRun.value) {
    if (autoRunTimer) clearTimeout(autoRunTimer)
    autoRunTimer = setTimeout(() => {
      executeSimulation()
    }, 600)
  }
}

async function executeSimulation() {
  if (!policyCase.value) return
  running.value = true
  try {
    const res = await runSimulationApi(policyCase.value.id, { ...paramValues.value })
    simResult.value = res.results
    lastSimResult.value = true
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '仿真运行失败')
  } finally {
    running.value = false
  }
}

function normalizedValue(value: number): number {
  return Math.max(0, Math.min(100, Math.abs(value)))
}

function saveScenario() {
  if (!simResult.value) return
  savedScenarios.value.push({
    params: { ...paramValues.value },
    results: simResult.value.map(r => ({ ...r })),
    time: new Date(),
  })
  ElMessage.success(`方案 ${savedScenarios.value.length} 已保存`)
}

function selectScenario(i: number) {
  const sc = savedScenarios.value[i]
  if (sc) {
    paramValues.value = { ...sc.params }
    simResult.value = sc.results.map(r => ({ ...r }))
  }
}

function removeScenario(i: number) {
  savedScenarios.value.splice(i, 1)
}

// Radar chart (single)
const radarOption = computed(() => {
  if (!simResult.value || !config.value) return {}
  const indicators = simResult.value.map(r => ({
    name: r.label,
    max: 100,
  }))
  const values = simResult.value.map(r => normalizedValue(r.value))
  return {
    radar: {
      indicator: indicators,
      radius: '65%',
      splitNumber: 4,
      axisName: { color: '#4a5568', fontSize: 11 },
    },
    series: [{
      type: 'radar',
      data: [{ value: values, name: '当前方案', areaStyle: { opacity: 0.25, color: '#409eff' }, lineStyle: { color: '#409eff', width: 2 }, itemStyle: { color: '#409eff' } }],
      symbol: 'none',
      lineStyle: { width: 2 },
    }],
    tooltip: { trigger: 'item' as const },
  }
})

// Radar chart (comparison)
const compareRadarOption = computed(() => {
  if (!simResult.value || !config.value) return {}
  const indicators = simResult.value.map(r => ({
    name: r.label,
    max: 100,
  }))
  const currentValues = simResult.value.map(r => normalizedValue(r.value))

  const series: any[] = [{
    type: 'radar',
    data: [{
      value: currentValues,
      name: '当前方案',
      areaStyle: { opacity: 0.2, color: '#409eff' },
      lineStyle: { color: '#409eff', width: 2 },
      itemStyle: { color: '#409eff' },
    }],
    symbol: 'none',
    lineStyle: { width: 2 },
  }]

  savedScenarios.value.forEach((sc, i) => {
    const color = scenarioColors[i]
    const vals = sc.results.map(r => normalizedValue(r.value))
    series.push({
      type: 'radar',
      data: [{
        value: vals,
        name: `方案 ${i + 1}`,
        areaStyle: { opacity: 0.08, color },
        lineStyle: { color, width: 1.5, type: 'dashed' as const },
        itemStyle: { color },
      }],
      symbol: 'none',
      lineStyle: { width: 1.5, type: 'dashed' as const },
    })
  })

  return {
    radar: {
      indicator: indicators,
      radius: '60%',
      splitNumber: 4,
      axisName: { color: '#4a5568', fontSize: 11 },
    },
    series,
    tooltip: { trigger: 'item' as const },
    legend: {
      data: ['当前方案', ...savedScenarios.value.map((_, i) => `方案 ${i + 1}`)],
      bottom: 0,
      textStyle: { fontSize: 11, color: '#4a5568' },
    },
  }
})

// History
function restoreHistory(h: SimHistoryItem) {
  paramValues.value = { ...h.parameters }
  simResult.value = h.results.map(r => ({ ...r }))
}

function summarizeParams(params: Record<string, number>): string {
  return Object.values(params).map(v => v.toString()).join(', ')
}

function formatValue(value: number, format: string): string {
  if (format === 'percent') return value.toFixed(1)
  if (format === 'currency') return value.toFixed(0)
  return value.toFixed(2)
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN')
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function clearHistory() {
  history.value = []
}

// Report
async function submitReport() {
  if (!policyCase.value || !reportContent.value.trim()) {
    ElMessage.warning('请输入报告内容')
    return
  }
  submittingReport.value = true
  try {
    await createReport({
      caseId: policyCase.value.id,
      content: reportContent.value,
      status: 'submitted',
    })
    ElMessage.success('报告提交成功')
  } catch {
    ElMessage.error('提交失败')
  } finally {
    submittingReport.value = false
  }
}

function gradeDialog(report: Report) {
  gradeTarget.value = report
  gradeScore.value = report.score || 80
  gradeComment.value = report.teacherComment || ''
  gradeVisible.value = true
}

function viewReport(report: Report) {
  viewTarget.value = report
  viewVisible.value = true
}

async function submitGrade() {
  if (!gradeTarget.value) return
  grading.value = true
  try {
    await gradeReport(gradeTarget.value.id, gradeScore.value, gradeComment.value)
    ElMessage.success('批改成功')
    gradeVisible.value = false
    reports.value = await getReports(Number(route.params.id))
  } catch {
    ElMessage.error('批改失败')
  } finally {
    grading.value = false
  }
}

// Background rendering
const renderedBackground = computed(() => {
  if (!policyCase.value?.background) return ''
  return policyCase.value.background
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/- (.*)/g, '<li>$1</li>')
    .replace(/\n\n/g, '<br><br>')
})
</script>

<style scoped>
.case-detail-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.page-content {
  flex: 1;
  padding: 24px 32px;
  background: #f5f7fa;
  overflow-y: auto;
}
.breadcrumb {
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--text-muted);
}
.breadcrumb-sep {
  margin: 0 10px;
  color: #e2e8f0;
}
.breadcrumb-cat {
  color: var(--text-secondary);
}

/* Case header */
.case-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}
.case-header h1 {
  font-size: 26px;
  color: var(--primary, #1a365d);
  line-height: 1.3;
}
.case-desc {
  color: var(--text-secondary, #4a5568);
  margin-top: 6px;
  font-size: 14px;
}

/* Simulation layout */
.simulation-layout {
  display: flex;
  gap: 24px;
  min-height: 600px;
}
.params-panel {
  width: 400px;
  flex-shrink: 0;
}
.results-panel {
  flex: 1;
  min-width: 0;
}

/* Params */
.params-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.params-header h3 {
  font-size: 16px;
  color: var(--text-primary);
}
.auto-run-icon {
  font-size: 18px;
  color: #cbd5e1;
  cursor: pointer;
  transition: color 0.2s;
}
.auto-run-icon.active {
  color: #48bb78;
}
.params-hint {
  color: var(--text-muted, #a0aec0);
  font-size: 12px;
  margin-bottom: 16px;
  margin-top: 4px;
}
.param-item {
  margin-bottom: 18px;
  padding: 14px 14px 10px;
  background: #ffffff;
  border: 1px solid #edf2f7;
  border-radius: 10px;
  transition: box-shadow 0.2s;
}
.param-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.param-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-primary);
}
.param-name {
  display: flex;
  align-items: center;
  font-weight: 500;
}
.param-value {
  color: var(--primary, #1a365d);
  font-weight: 600;
  font-size: 14px;
}
.param-range {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #cbd5e1;
  margin-top: 2px;
}
.slider-wrapper {
  padding: 0 2px;
}

/* Params actions */
.params-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}
.run-btn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
}

/* Scenarios */
.scenarios-section {
  margin-top: 20px;
  padding: 12px;
  background: #fafafa;
  border-radius: 10px;
}
.scenarios-section h4 {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.scenario-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}
.scenario-item:hover {
  background: #edf2f7;
}
.scenario-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.scenario-name {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}
.scenario-time {
  font-size: 11px;
  color: var(--text-muted);
}

/* Results */
.chart-container {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #edf2f7;
}
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* Indicator cards */
.indicator-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}
.indicator-card {
  background: #fff;
  border: 1px solid #edf2f7;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  transition: all 0.2s;
}
.indicator-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.indicator-card.good {
  border-top: 3px solid #48bb78;
}
.indicator-card.bad {
  border-top: 3px solid #f56565;
}
.indicator-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}
.indicator-unit {
  font-size: 12px;
  font-weight: normal;
  color: var(--text-muted);
}
.indicator-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.indicator-bar {
  height: 4px;
  background: #edf2f7;
  border-radius: 2px;
  margin-top: 10px;
  overflow: hidden;
}
.indicator-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* History */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.history-header h4 {
  font-size: 14px;
  color: var(--text-secondary);
}
.history-list {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
}
.history-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  transition: background 0.15s;
}
.history-item:hover {
  background: #ebf4ff;
}
.history-time {
  color: var(--text-muted);
}
.history-params {
  color: var(--text-secondary);
}

/* Report */
.report-section {
  min-height: 300px;
}
.report-preview {
  color: var(--text-secondary);
  font-size: 12px;
}
.report-content-display {
  white-space: pre-wrap;
  line-height: 1.8;
  color: var(--text-primary);
  font-size: 14px;
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  max-height: 400px;
  overflow-y: auto;
}
.teacher-comment {
  background: #fef7e0;
  padding: 12px 16px;
  border-radius: 8px;
  color: #856404;
}
.score-display {
  margin-top: 16px;
  text-align: center;
}

/* Grade dialog */
.grade-report-preview {
  margin-bottom: 8px;
}
.grade-label {
  margin-bottom: 8px;
  color: var(--text-secondary);
}
.grade-content {
  white-space: pre-wrap;
  line-height: 1.6;
  background: #fafafa;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  max-height: 200px;
  overflow-y: auto;
}

/* Markdown */
.markdown-content {
  line-height: 1.8;
  font-size: 14px;
  color: #333;
  padding: 8px 0;
}
.markdown-content h2 {
  font-size: 18px;
  color: #1a365d;
  margin: 20px 0 12px;
}
.markdown-content h3 {
  font-size: 15px;
  color: #333;
  margin: 16px 0 8px;
}
.markdown-content li {
  margin: 4px 0;
  color: #555;
}

/* Responsive */
@media (max-width: 1024px) {
  .simulation-layout { flex-direction: column; }
  .params-panel { width: 100%; }
}
</style>
