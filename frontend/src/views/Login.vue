<template>
  <div class="login-container">
    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="circle c1"></div>
      <div class="circle c2"></div>
      <div class="circle c3"></div>
    </div>

    <div class="login-card">
      <!-- Brand -->
      <div class="brand-section">
        <div class="brand-logo">
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
            <rect x="8" y="45" width="16" height="40" rx="3" fill="#1a365d"/>
            <rect x="30" y="25" width="16" height="60" rx="3" fill="#2a4a7f"/>
            <rect x="52" y="15" width="16" height="70" rx="3" fill="#3b5e9c"/>
            <rect x="74" y="35" width="16" height="50" rx="3" fill="#4a72b0"/>
          </svg>
        </div>
        <h1 class="brand-title">PolicySim</h1>
        <p class="brand-subtitle">公共政策仿真平台</p>
        <p class="brand-tagline">培养政策决策思维 · 模拟公共管理实践</p>
      </div>

      <!-- Login Form -->
      <el-form :model="form" :rules="rules" ref="formRef" @keyup.enter="handleLogin" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            class="login-input"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            :prefix-icon="Lock"
            class="login-input"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- Quick Role Switch -->
      <div class="role-switch">
        <p class="role-label">快速体验：</p>
        <div class="role-buttons">
          <el-button
            v-for="role in demoRoles"
            :key="role.username"
            :class="['role-btn', { active: form.username === role.username }]"
            @click="switchRole(role)"
            size="small"
          >
            <span class="role-dot" :style="{ background: role.color }"></span>
            {{ role.label }}
          </el-button>
        </div>
      </div>

      <!-- Footer -->
      <div class="login-footer">
        <p>演示账号密码均为 <strong>123456</strong></p>
        <p class="version">v2.0 · 教学演示系统</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: '123456',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const demoRoles = [
  { username: 'admin', password: '123456', label: '管理员', color: '#f56565' },
  { username: 'teacher1', password: '123456', label: '教师', color: '#e6a23c' },
  { username: 'student1', password: '123456', label: '学生', color: '#48bb78' },
]

function switchRole(role: typeof demoRoles[0]) {
  form.username = role.username
  form.password = role.password
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await auth.login(form.username, form.password)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1a2e 0%, #1a365d 40%, #2d6a9f 70%, #4a9bd9 100%);
  position: relative;
  overflow: hidden;
}

/* Animated background circles */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
}
.c1 {
  width: 600px; height: 600px;
  background: white;
  top: -200px; right: -150px;
}
.c2 {
  width: 400px; height: 400px;
  background: white;
  bottom: -100px; left: -100px;
}
.c3 {
  width: 250px; height: 250px;
  background: white;
  top: 50%; left: 20%;
  transform: translateY(-50%);
}

.login-card {
  width: 420px;
  padding: 40px 36px;
  background: rgba(255, 255, 255, 0.97);
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35);
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

/* Brand */
.brand-section {
  text-align: center;
  margin-bottom: 32px;
}
.brand-logo {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}
.brand-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a365d;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.brand-subtitle {
  font-size: 15px;
  color: #4a5568;
  font-weight: 500;
}
.brand-tagline {
  font-size: 12px;
  color: #a0aec0;
  margin-top: 8px;
  letter-spacing: 0.5px;
}

/* Form */
.login-form {
  margin-bottom: 20px;
}
.login-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 4px 12px;
}
.login-input :deep(.el-input__inner) {
  height: 44px;
}
.login-btn {
  width: 100%;
  height: 46px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 6px;
}

/* Role switch */
.role-switch {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}
.role-label {
  font-size: 12px;
  color: #a0aec0;
  margin-bottom: 8px;
}
.role-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.role-btn {
  flex: 1;
  border-radius: 8px !important;
  transition: all 0.2s;
}
.role-btn.active {
  border-color: #1a365d !important;
  background: #edf2f7 !important;
  color: #1a365d !important;
  font-weight: 600;
}
.role-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

/* Footer */
.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #a0aec0;
}
.login-footer strong {
  color: #718096;
}
.version {
  margin-top: 4px;
  font-size: 11px;
  color: #cbd5e1;
}
</style>
