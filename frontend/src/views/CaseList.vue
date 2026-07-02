<template>
  <div class="case-list-page">
    <NavBar />
    <div class="page-content">
      <div class="page-header">
        <h1>案例中心</h1>
        <p>选择仿真案例，开始政策分析实验</p>
      </div>

      <div class="category-filter">
        <el-radio-group v-model="selectedCategory" @change="filterCases">
          <el-radio-button value="">全部案例</el-radio-button>
          <el-radio-button v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</el-radio-button>
        </el-radio-group>
      </div>

      <el-row :gutter="20" v-loading="loading">
        <el-col :span="8" v-for="c in filteredCases" :key="c.id" style="margin-bottom: 20px">
          <el-card shadow="hover" class="case-card" @click="router.push(`/cases/${c.id}`)">
            <div class="case-category">
              <el-tag>{{ c.category }}</el-tag>
            </div>
            <h3>{{ c.title }}</h3>
            <p class="case-description">{{ c.description }}</p>
            <div class="case-footer">
              <span class="case-date">更新于 {{ formatDate(c.updatedAt) }}</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="!loading && filteredCases.length === 0" description="暂无匹配的案例" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCases, type PolicyCase } from '../api/cases'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const cases = ref<PolicyCase[]>([])
const filteredCases = ref<PolicyCase[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    cases.value = await getCases()
    const cats = new Set(cases.value.map(c => c.category))
    categories.value = Array.from(cats)
    filteredCases.value = cases.value
  } catch {
    // handled
  } finally {
    loading.value = false
  }
})

function filterCases() {
  if (!selectedCategory.value) {
    filteredCases.value = cases.value
  } else {
    filteredCases.value = cases.value.filter(c => c.category === selectedCategory.value)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.case-list-page {
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
.category-filter {
  margin-bottom: 20px;
}
.case-card {
  cursor: pointer;
  height: 100%;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}
.case-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
.case-category {
  margin-bottom: 12px;
}
.case-card h3 {
  font-size: 16px;
  color: #1a365d;
  margin-bottom: 8px;
  min-height: 44px;
}
.case-description {
  color: #666;
  font-size: 13px;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.case-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  color: #999;
  font-size: 12px;
}
</style>
