<template>
  <div class="case-detail-page">
    <NavBar />
    <div class="page-content" v-loading="loading">
      <div class="breadcrumb">
        <el-link @click="router.push('/cases')">← 返回案例列表</el-link>
        <span style="margin: 0 8px; color: #ccc">|</span>
        <span style="color: #999">{{ policyCase?.category }}</span>
      </div>

      <template v-if="policyCase">
        <div class="case-header">
          <h1>{{ policyCase.title }}</h1>
          <p class="case-desc">{{ policyCase.description }}</p>
        </div>

        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="案例背景" name="background">
            <div class="markdown-content" v-html="renderedBackground"></div>
          </el-tab-pane>

          <el-tab-pane label="政策仿真" name="simulation">
            <div class="simulation-layout">
              <!-- Left: Parameters -->
              <div class="params-panel">
                <h3>政策参数设置</h3>
                <p class="params-hint">调整以下参数后点击"运行仿真"</p>

                <div v-for="p in config?.parameters" :key="p.id" class="param-item">
                  <div class="param-label">
                    <span>{{ p.label }}</span>
                    <span class="param-value">
                      <template v-if="p.type === 'slider'">{{ paramValues[p.id] ?? p.default }}{{ p.unit }}</template>
                      <template v-else-if="p.type === 'select'">
                        {{ p.options?.find(o => o.value === (paramValues[p.id] ?? p.default))?.label }}
                      </template>
                      <template v-else>{{ paramValues[p.id] ?? p.default }}{{ p.unit }}</template>
                    </span>
                  </div>
                  <template v-if="p.type === 'slider'">
                    <el-slider
                      v-model="paramValues[p.id]"
                      :min="p.min"
                      :max="p.max"
                      :step="p.step || 1"
                      show-input
                      :input-size="'small'"
                    />
                    <div class="param-range">
                      <span>{{ p.min }}{{ p.unit }}</span>
                      <span>{{ p.max }}{{ p.unit }}</span>
                    </div>
                  </template>
                  <template v-else-if="p.type === 'select' && p.options">
                    <el-select v-model="paramValues[p.id]" style="width: 100%">
                      <el-option
                        v-for="opt in p.options"
                        :key="opt.value"
                        :label="opt.label"
                        :value="opt.value"
                      />
                    </el-select>
                  </template>
                  <template v-else-if="p.type === 'number'">
                    <el-input-number
                      v-model="paramValues[p.id]"
                      :min="p.min"
                      :max="p.max"
                      :step="p.step || 1"
                      style="width: 100%"
                    />
                  </template>
                </div>

                <el-button
                  type="primary"
                  size="large"
                  style="width: 100%; margin-top: 16px"
                  :loading="running"
                  @click="executeSimulation"
                >
                  <el-icon style="margin-right: 6px"><CaretRight /></el-icon>
                  运行仿真
                </el-button>
              </div>

              <!-- Right: Results -->
              <div class="results-panel">
                <h3>仿真结果</h3>

                <template v-if="simResult">
                  <!-- Radar Chart -->
                  <div class="chart-container">
                    <v-chart :option="radarOption" style="height: 350px" autoresize />
                  </div>

                  <!-- Indicator Cards -->
                  <div class="indicator-grid">
                    <div
                      v-for="r in simResult"
                      :key="r.indicatorId"
                      class="indicator-card"
                      :class="{ good: r.higherIsBetter && r.value >= 50, bad: r.higherIsBetter && r.value < 50 }"
                    >
                      <div class="indicator-value">
                        {{ formatValue(r.value, r.format) }}
                        <span class="indicator-unit">{{ r.unit }}</span>
                      </div>
                      <div class="indicator-label">{{ r.label }}</div>
                    </div>
                  </div>
                </template>

                <el-empty v-else description="调整参数后点击「运行仿真」查看结果" />

                <!-- History -->
                <template v-if="history.length > 0">
                  <el-divider />
                  <h4>仿真历史记录</h4>
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

          <el-tab-pane label="实验报告" name="report">
            <div class="report-section">
              <div v-if="auth.isStudent">
                <el-input
                  v-model="reportContent"
                  type="textarea"
                  :rows="12"
                  placeholder="请输入你的实验分析报告..."
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
                  <el-table-column prop="score" label="成绩" width="80" />
                  <el-table-column prop="content" label="报告内容" min-width="200">
                    <template #default="{ row }">
                      <span class="report-preview">{{ row.content?.substring(0, 80) }}...</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                      <el-button
                        v-if="row.status === 'submitted'"
                        size="small"
                        type="primary"
                        @click="gradeDialog(row)"
                      >
                        批改
                      </el-button>
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
    <el-dialog v-model="gradeVisible" title="批改报告" width="500px">
      <el-form>
        <el-form-item label="成绩">
          <el-input-number v-model="gradeScore" :min="0" :max="100" />
        </el-form-item>
        <el-form-item label="评语">
          <el-input v-model="gradeComment" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="gradeVisible = false">取消</el-button>
        <el-button type="primary" :loading="grading" @click="submitGrade">提交批改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { use } from 'echarts/core'
import { RadarChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, RadarComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { getCase, type PolicyCase, type SimConfig } from '../api/cases'
import { runSimulation as runSimulationApi, getHistory, type SimResult, type SimHistoryItem } from '../api/simulation'
import { getReports, createReport, gradeReport, type Report } from '../api/reports'
import { useAuthStore } from '../stores/auth'
import NavBar from '../components/NavBar.vue'

use([RadarChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, RadarComponent, CanvasRenderer])

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

// Report
const reportContent = ref('')
const reports = ref<Report[]>([])
const submittingReport = ref(false)
const gradeVisible = ref(false)
const gradeTarget = ref<Report | null>(null)
const gradeScore = ref(80)
const gradeComment = ref('')
const grading = ref(false)

const renderedBackground = computed(() => {
  if (!policyCase.value?.background) return ''
  return policyCase.value.background
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/### (.*)/g, '<h3>$1</h3>')
    .replace(/- (.*)/g, '<li>$1</li>')
    .replace(/\n\n/g, '<br><br>')
})

const radarOption = computed(() => {
  if (!simResult.value || !config.value) return {}
  const indicators = simResult.value.map(r => ({
    name: r.label,
    max: 100,
  }))
  const values = simResult.value.map(r => {
    // Normalize to 0-100 scale
    const v = Math.abs(r.value)
    return Math.min(v, 100)
  })
  return {
    radar: {
      indicator: indicators,
      radius: '65%',
      splitNumber: 4,
    },
    series: [{
      type: 'radar',
      data: [{ value: values, name: '当前方案', areaStyle: { opacity: 0.25 } }],
      symbol: 'none',
      lineStyle: { width: 2 },
    }],
    tooltip: { trigger: 'item' },
  }
})

onMounted(async () => {
  const caseId = Number(route.params.id)
  try {
    policyCase.value = await getCase(caseId)
    config.value = JSON.parse(policyCase.value.config)

    // Initialize param values with defaults
    if (config.value) {
      for (const p of config.value.parameters) {
        paramValues.value[p.id] = p.default
      }
    }

    // Load history
    history.value = await getHistory(caseId)

    // Load reports (teacher)
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

async function executeSimulation() {
  if (!policyCase.value) return
  running.value = true
  try {
    const res = await runSimulationApi(policyCase.value.id, { ...paramValues.value })
    simResult.value = res.results
    history.value = await getHistory(policyCase.value.id)
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '仿真运行失败')
  } finally {
    running.value = false
  }
}

function restoreHistory(h: SimHistoryItem) {
  paramValues.value = { ...h.parameters }
  simResult.value = h.results
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

async function submitGrade() {
  if (!gradeTarget.value) return
  grading.value = true
  try {
    await gradeReport(gradeTarget.value.id, gradeScore.value, gradeComment.value)
    ElMessage.success('批改成功')
    gradeVisible.value = false
    // Refresh reports
    reports.value = await getReports(Number(route.params.id))
  } catch {
    ElMessage.error('批改失败')
  } finally {
    grading.value = false
  }
}
</script>

<style scoped>
.case-detail-page {
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
.breadcrumb {
  margin-bottom: 16px;
  font-size: 13px;
}
.case-header {
  margin-bottom: 20px;
}
.case-header h1 {
  font-size: 26px;
  color: #1a365d;
}
.case-desc {
  color: #666;
  margin-top: 6px;
}
.simulation-layout {
  display: flex;
  gap: 20px;
  min-height: 600px;
}
.params-panel {
  width: 380px;
  flex-shrink: 0;
}
.results-panel {
  flex: 1;
  min-width: 0;
}
.params-panel h3, .results-panel h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}
.params-hint {
  color: #999;
  font-size: 12px;
  margin-bottom: 16px;
}
.param-item {
  margin-bottom: 20px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}
.param-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #333;
}
.param-value {
  color: #409eff;
  font-weight: bold;
}
.param-range {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #ccc;
  margin-top: 2px;
}
.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.indicator-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.indicator-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  transition: all 0.2s;
}
.indicator-card.good {
  border-left: 3px solid #67c23a;
}
.indicator-card.bad {
  border-left: 3px solid #f56c6c;
}
.indicator-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.indicator-unit {
  font-size: 12px;
  font-weight: normal;
  color: #999;
}
.indicator-label {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
.history-list {
  max-height: 200px;
  overflow-y: auto;
}
.history-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
.history-item:hover {
  background: #ecf5ff;
}
.history-time {
  color: #999;
}
.history-params {
  color: #666;
}
.report-section {
  min-height: 300px;
}
.report-preview {
  color: #666;
  font-size: 12px;
}
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
</style>
