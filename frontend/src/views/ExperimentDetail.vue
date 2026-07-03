<template>
  <div class="experiment-detail-page">
    <NavBar />
    <div class="page-content" v-loading="loading">
      <div v-if="experiment">
        <div class="page-header">
          <el-link @click="router.push('/experiments')" style="margin-bottom: 12px">&lt; 返回实验列表</el-link>
          <h1>{{ experiment.title }}</h1>
          <p>{{ experiment.description || '暂无描述' }}</p>
        </div>

        <el-row :gutter="20">
          <el-col :span="16">
            <el-card class="section-card">
              <template #header>
                <div class="card-header">
                  <span>学生提交情况</span>
                  <el-tag :type="statusType(experiment.status)">{{ statusLabel(experiment.status) }}</el-tag>
                </div>
              </template>

              <el-table :data="results" stripe style="width: 100%" v-loading="resultsLoading">
                <el-table-column label="学生姓名" width="150">
                  <template #default="{ row }">{{ row.studentName }}</template>
                </el-table-column>
                <el-table-column label="状态" width="120">
                  <template #default="{ row }">
                    <el-tag v-if="row.submittedAt" type="success">已提交</el-tag>
                    <el-tag v-else type="info">未提交</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="提交时间" width="170">
                  <template #default="{ row }">
                    {{ row.submittedAt ? formatDate(row.submittedAt) : '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                  <template #default="{ row }">
                    <el-button size="small" v-if="row.submittedAt" @click="viewResult(row)">查看</el-button>
                    <span v-else>-</span>
                  </template>
                </el-table-column>
              </el-table>

              <el-empty v-if="!resultsLoading && results.length === 0" description="暂无提交数据" />
            </el-card>
          </el-col>

          <el-col :span="8">
            <el-card class="section-card">
              <template #header>
                <span>实验信息</span>
              </template>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">案例</span>
                  <span>{{ experiment.policyCase?.title || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">班级</span>
                  <span>{{ experiment.class?.name || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">开始日期</span>
                  <span>{{ experiment.startDate || '不限' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">截止日期</span>
                  <span>{{ experiment.endDate || '不限' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">创建时间</span>
                  <span>{{ formatDate(experiment.createdAt) }}</span>
                </div>
              </div>
              <div style="margin-top: 16px; display: flex; gap: 8px">
                <el-button
                  v-if="experiment.status === 'pending'"
                  type="success"
                  size="small"
                  @click="changeStatus('active')"
                >
                  开始实验
                </el-button>
                <el-button
                  v-if="experiment.status === 'active'"
                  type="warning"
                  size="small"
                  @click="changeStatus('closed')"
                >
                  结束实验
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- Result Viewer Dialog -->
    <el-dialog v-model="showResultDialog" title="仿真结果详情" width="600px">
      <div v-if="selectedResult">
        <h4 style="margin-bottom: 12px">指标结果</h4>
        <div class="indicator-grid">
          <div v-for="(val, key) in selectedResult.indicators" :key="key" class="indicator-item">
            <div class="indicator-value">{{ typeof val === 'number' ? val.toFixed(2) : val }}</div>
            <div class="indicator-label">{{ key }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getExperiment, updateExperiment, getExperimentResults, type Experiment, type ExperimentResult } from '../api/experiments'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const route = useRoute()
const experimentId = computed(() => +(route.params.id as string))
const experiment = ref<Experiment | null>(null)
const results = ref<ExperimentResult[]>([])
const loading = ref(true)
const resultsLoading = ref(true)
const showResultDialog = ref(false)
const selectedResult = ref<ExperimentResult | null>(null)

onMounted(fetchData)

async function fetchData() {
  loading.value = true
  try {
    experiment.value = await getExperiment(experimentId.value)
    await fetchResults()
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function fetchResults() {
  resultsLoading.value = true
  try {
    results.value = await getExperimentResults(experimentId.value)
  } catch {
    // handled
  } finally {
    resultsLoading.value = false
  }
}

async function changeStatus(status: string) {
  try {
    await updateExperiment(experimentId.value, { status })
    ElMessage.success('状态已更新')
    await fetchData()
  } catch {
    ElMessage.error('操作失败')
  }
}

function viewResult(r: ExperimentResult) {
  selectedResult.value = r
  showResultDialog.value = true
}

function statusType(status: string) {
  return status === 'active' ? 'success' : status === 'closed' ? 'info' : 'warning'
}

function statusLabel(status: string) {
  return status === 'active' ? '进行中' : status === 'closed' ? '已结束' : '待开始'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.experiment-detail-page { height: 100%; display: flex; flex-direction: column; }
.page-content { flex: 1; padding: 24px; background: #f5f7fa; overflow-y: auto; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; color: #1a365d; }
.page-header p { color: #999; margin-top: 4px; }
.section-card { margin-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.info-list { display: flex; flex-direction: column; gap: 12px; }
.info-item { display: flex; justify-content: space-between; font-size: 14px; }
.info-label { color: #999; }
.indicator-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.indicator-item {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}
.indicator-value {
  font-size: 20px;
  font-weight: bold;
  color: #1a365d;
}
.indicator-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
