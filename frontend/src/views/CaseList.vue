<template>
  <div class="case-list-page">
    <NavBar />
    <div class="page-content">
      <div class="page-header">
        <div>
          <h1>案例中心</h1>
          <p>选择仿真案例，开始政策分析实验</p>
        </div>
        <el-input
          v-model="searchQuery"
          placeholder="搜索案例名称..."
          :prefix-icon="Search"
          clearable
          class="search-input"
          size="large"
        />
      </div>

      <div class="category-filter">
        <el-radio-group v-model="selectedCategory" @change="filterCases" size="large">
          <el-radio-button value="">全部案例</el-radio-button>
          <el-radio-button v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Skeleton loading -->
      <el-row :gutter="20" v-if="loading">
        <el-col :span="8" v-for="n in 6" :key="n" style="margin-bottom: 20px">
          <el-card class="skeleton-card">
            <el-skeleton :rows="4" animated />
          </el-card>
        </el-col>
      </el-row>

      <!-- Case cards -->
      <el-row :gutter="20" v-else>
        <el-col :xs="24" :sm="12" :md="8" v-for="c in filteredCases" :key="c.id" style="margin-bottom: 20px">
          <el-card shadow="hover" class="case-card" @click="router.push(`/cases/${c.id}`)">
            <div class="case-color-bar" :style="{ background: categoryColor(c.category) }"></div>
            <div class="case-card-body">
              <div class="case-category-row">
                <el-tag :color="categoryColor(c.category)" class="category-tag" effect="dark" size="small">
                  {{ c.category }}
                </el-tag>
                <span class="case-id">#{{ c.id }}</span>
              </div>
              <h3>{{ c.title }}</h3>
              <p class="case-description">{{ c.description }}</p>
              <div class="case-meta">
                <span class="meta-item">
                  <el-icon size="12"><Clock /></el-icon>
                  {{ formatDate(c.updatedAt) }}
                </span>
              
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="!loading && filteredCases.length === 0" description="暂无匹配的案例">
        <el-button v-if="searchQuery" @click="searchQuery = ''; selectedCategory = ''" type="primary">
          清除筛选
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Clock } from '@element-plus/icons-vue'
import { getCases, type PolicyCase } from '../api/cases'
import NavBar from '../components/NavBar.vue'

const router = useRouter()
const cases = ref<PolicyCase[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref('')
const loading = ref(true)
const searchQuery = ref('')

// Color map for categories
const categoryColors: Record<string, string> = {
  '财政税收': '#e53e3e',
  '环境政策': '#38a169',
  '社会保障': '#d69e2e',
  '住房政策': '#805ad5',
  '科技政策': '#319795',
  '应急管理': '#e53e3e',
  '智慧城市': '#4299e1',
}

function categoryColor(cat: string): string {
  return categoryColors[cat] || '#718096'
}

onMounted(async () => {
  try {
    cases.value = await getCases()
    // deduplicate categories, preserving display order
    const seen = new Set<string>()
    categories.value = cases.value
      .map(c => c.category)
      .filter(cat => {
        if (seen.has(cat)) return false
        seen.add(cat)
        return true
      })
  } catch {
    // handled
  } finally {
    loading.value = false
  }
})

const filteredCases = computed(() => {
  let result = cases.value
  if (selectedCategory.value) {
    result = result.filter(c => c.category === selectedCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
  }
  return result
})

function filterCases() {
  // computed handles it automatically
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
  padding: 28px 32px;
  background: #f5f7fa;
  overflow-y: auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-header h1 {
  font-size: 24px;
  color: var(--primary, #1a365d);
}
.page-header p {
  color: var(--text-muted, #a0aec0);
  margin-top: 4px;
  font-size: 14px;
}
.search-input {
  width: 280px;
}
.category-filter {
  margin-bottom: 24px;
}

/* Skeleton */
.skeleton-card {
  height: 200px;
}

/* Case card */
.case-card {
  cursor: pointer;
  height: 100%;
  transition: all 0.25s ease;
  overflow: hidden;
  padding: 0;
}
.case-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}
.case-color-bar {
  height: 4px;
  width: 100%;
}
.case-card-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  height: calc(100% - 4px);
}
.case-category-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.category-tag {
  border: none !important;
}
.case-id {
  font-size: 12px;
  color: var(--text-muted, #a0aec0);
}
.case-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #1a365d);
  margin-bottom: 8px;
  line-height: 1.4;
}
.case-description {
  color: var(--text-secondary, #4a5568);
  font-size: 13px;
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.case-meta {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #edf2f7;
  font-size: 12px;
  color: var(--text-muted, #a0aec0);
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-content { padding: 16px; }
  .search-input { width: 100%; }
  .page-header { flex-direction: column; }
}
</style>
