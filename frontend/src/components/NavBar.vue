<template>
  <el-menu
    :default-active="currentRoute"
    mode="horizontal"
    class="nav-bar"
    :ellipsis="false"
    router
  >
    <div class="brand">
      <span class="brand-icon">&#9881;</span>
      <span class="brand-text">政策仿真平台</span>
    </div>

    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-menu-item index="/cases">
      <el-icon><Reading /></el-icon>
      <span>案例中心</span>
    </el-menu-item>
    <el-menu-item index="/classes" v-if="auth.isTeacher">
      <el-icon><School /></el-icon>
      <span>班级管理</span>
    </el-menu-item>
    <el-menu-item index="/experiments" v-if="auth.isTeacher">
      <el-icon><Timer /></el-icon>
      <span>实验管理</span>
    </el-menu-item>
    <el-menu-item index="/reports">
      <el-icon><Document /></el-icon>
      <span>实验报告</span>
    </el-menu-item>

    <div class="flex-grow" />

    <el-sub-menu index="user">
      <template #title>
        <el-icon><UserFilled /></el-icon>
        <span>{{ auth.displayName || auth.user?.username }}</span>
        <el-tag v-if="auth.isTeacher" size="small" type="warning" style="margin-left: 6px">教师</el-tag>
        <el-tag v-else-if="auth.isStudent" size="small" type="info" style="margin-left: 6px">学生</el-tag>
        <el-tag v-else size="small" type="danger" style="margin-left: 6px">管理员</el-tag>
      </template>
      <el-menu-item @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessageBox } from 'element-plus'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const currentRoute = computed(() => route.path)

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示')
    auth.logout()
    router.push('/login')
  } catch {
    // cancelled
  }
}
</script>

<style scoped>
.nav-bar {
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color, #e4e7ed);
  background: var(--card-bg, #fff);
  display: flex;
  align-items: center;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px 0 4px;
  margin-right: 8px;
  border-right: 1px solid var(--border-color, #e4e7ed);
  user-select: none;
}
.brand-icon {
  font-size: 22px;
  color: var(--primary, #1a365d);
}
.brand-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary, #1a365d);
  white-space: nowrap;
}
.flex-grow {
  flex-grow: 1;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .brand-text { display: none; }
  .brand { padding-right: 8px; }
  :deep(.el-menu-item span) { display: none; }
  :deep(.el-menu-item .el-icon) { margin-right: 0; }
  :deep(.el-sub-menu__title span) { display: none; }
}
</style>
