<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-icon">
        <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="30" y="60" width="120" height="80" rx="8" fill="#e2e8f0"/>
          <rect x="35" y="65" width="110" height="12" rx="3" fill="#cbd5e1"/>
          <rect x="35" y="82" width="80" height="6" rx="3" fill="#cbd5e1"/>
          <rect x="35" y="93" width="60" height="6" rx="3" fill="#cbd5e1"/>
          <rect x="35" y="104" width="90" height="6" rx="3" fill="#cbd5e1"/>
          <circle cx="150" cy="50" r="30" fill="#f0f4f8" stroke="#e2e8f0" stroke-width="3"/>
          <text x="150" y="57" text-anchor="middle" font-size="36" font-weight="bold" fill="#1a365d" font-family="sans-serif">?</text>
        </svg>
      </div>
      <h1>404</h1>
      <p class="not-found-desc">找不到您要访问的页面</p>
      <p class="not-found-hint">可能是链接已失效，或您输入的地址有误</p>
      <el-button type="primary" size="large" @click="router.push('/')">
        <el-icon style="margin-right: 6px"><HomeFilled /></el-icon>
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fa;
}
.not-found-content {
  text-align: center;
}
.not-found-icon {
  margin-bottom: 16px;
}
.not-found h1 {
  font-size: 72px;
  color: var(--primary, #1a365d);
  line-height: 1;
  margin-bottom: 12px;
}
.not-found-desc {
  font-size: 20px;
  color: var(--text-primary, #1a365d);
  margin-bottom: 8px;
}
.not-found-hint {
  font-size: 14px;
  color: var(--text-muted, #a0aec0);
  margin-bottom: 32px;
}
</style>
