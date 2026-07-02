<template>
  <el-menu
    :default-active="currentRoute"
    mode="horizontal"
    class="nav-bar"
    :ellipsis="false"
    router
  >
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>
    <el-menu-item index="/cases">
      <el-icon><Reading /></el-icon>
      <span>案例中心</span>
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
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}
.flex-grow {
  flex-grow: 1;
}
</style>
