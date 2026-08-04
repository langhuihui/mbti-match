<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">MBTI Match 管理后台</h1>
      <p class="login-subtitle">荣格八维 × 九型人格 测定平台</p>
      <el-form :model="form" @submit.prevent="handleLogin" class="login-form">
        <el-form-item>
          <el-input v-model="form.username" placeholder="管理员账号" prefix-icon="User" size="large" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" placeholder="密码" prefix-icon="Lock" type="password" size="large" show-password />
        </el-form-item>
        <el-button type="primary" size="large" class="login-btn" @click="handleLogin" :loading="loading">
          登 录
        </el-button>
      </el-form>
      <p class="login-hint">开发模式：任意账号密码可登录</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)

const form = ref({
  username: '',
  password: '',
})

async function handleLogin() {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  loading.value = true

  const token = form.value.password

  try {
    const { dataService, getDataMode } = await import('@/services/cloudbase')
    const { mode, cloudConfigured } = getDataMode()

    // 先直接登录（不阻塞在云函数验证上）
    auth.login(token, { name: form.value.username, role: 'admin' })

    // cloud 模式下尝试验证 token 有效性
    if (mode === 'cloud' && cloudConfigured) {
      try {
        const result = await dataService.getOverview()
        if (!result || result.totalUsers === undefined) {
          throw new Error('验证失败')
        }
        ElMessage.success('登录成功')
      } catch (err) {
        // cloud 模式验证失败，登出
        auth.logout()
        throw err
      }
    } else {
      // auto/mock 模式，直接登录成功
      ElMessage.success(mode === 'mock' ? '登录成功（开发模式）' : '登录成功')
    }

    router.push('/dashboard')
  } catch (err) {
    localStorage.removeItem('admin_token')
    ElMessage.error('登录失败：' + (err.message || '密码错误'))
  }
  loading.value = false
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2d 0%, #6366f1 100%);
}

.login-card {
  width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.login-title {
  text-align: center;
  font-size: 24px;
  color: #1e1e2d;
  margin-bottom: 8px;
}

.login-subtitle {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-bottom: 32px;
}

.login-form {
  margin-bottom: 16px;
}

.login-btn {
  width: 100%;
}

.login-hint {
  text-align: center;
  color: #ccc;
  font-size: 12px;
}
</style>
