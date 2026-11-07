
<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="background-decoration decoration-one"></div>
    <div class="background-decoration decoration-two"></div>
    <div class="background-grid"></div>

    <div class="auth-container">
      <!-- 左侧品牌介绍 -->
      <div class="brand-panel">
        <div class="brand-logo">
          <span class="logo-icon">✦</span>
          <span>AI Inventory</span>
        </div>

        <div class="brand-content">
          <div class="brand-eyebrow">SMART PERSONAL INVENTORY</div>
          <h1>让物品管理<br />变得简单而智能。</h1>
          <p>
            记录每一件物品，整理每一个角落。
            让 AI 帮你轻松管理个人物品，随时找到需要的东西。
          </p>

          <div class="brand-features">
            <div class="brand-feature">
              <span class="feature-icon">▦</span>
              <span>物品分类管理</span>
            </div>
            <div class="brand-feature">
              <span class="feature-icon">✧</span>
              <span>AI 智能整理</span>
            </div>
            <div class="brand-feature">
              <span class="feature-icon">⌕</span>
              <span>自然语言找物</span>
            </div>
          </div>
        </div>

        <div class="brand-footer">
          YOUR PERSONAL SPACE, ORGANIZED.
        </div>

        <div class="brand-decoration">
          <div class="decoration-circle circle-large"></div>
          <div class="decoration-circle circle-small"></div>
          <span class="decoration-star">✦</span>
        </div>
      </div>

      <!-- 右侧登录卡片 -->
      <div class="form-panel">
        <div class="auth-card">
          <div class="mobile-logo">
            <span class="logo-icon">✦</span>
            <span>AI Inventory</span>
          </div>

          <div class="welcome">
            <div class="welcome-label">WELCOME BACK</div>
            <h2>欢迎回来</h2>
            <p>登录你的账号，继续管理个人物品。</p>
          </div>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            @submit.prevent
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                size="large"
                autocomplete="username"
                clearable
              >
                <template #prefix>
                  <span class="field-icon">♙</span>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                show-password
                placeholder="请输入密码"
                size="large"
                autocomplete="current-password"
                @keyup.enter="submit"
              >
                <template #prefix>
                  <span class="field-icon">▣</span>
                </template>
              </el-input>
            </el-form-item>

            <el-button
              type="primary"
              class="login-button"
              :loading="loading"
              @click="submit"
            >
              {{ loading ? '正在登录…' : '登 录' }}
              <span v-if="!loading" class="button-arrow">→</span>
            </el-button>

            <div class="register-link">
              <span>还没有账号？</span>
              <el-link
                type="primary"
                :underline="false"
                @click="router.push('/register')"
              >
                立即注册
              </el-link>
            </div>
          </el-form>

          <div class="card-footer">
            <span class="footer-lock">▣</span>
            你的个人物品数据受到安全保护
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import { setAuth } from '@/auth'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

// 校验规则与后端 RegisterRequest/LoginRequest 的约束保持一致
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{4,20}$/,
      message: '4-20位字母、数字或下划线',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 64, message: '密码长度8-64位', trigger: 'blur' }
  ]
}

async function submit() {
  // validate() 无回调时校验失败会 reject，需要捕获
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  if (loading.value) return

  loading.value = true
  try {
    const res = await login({
      username: form.username,
      password: form.password
    })

    // 登录成功响应：{token, tokenType:"Bearer", username, nickname}
    setAuth(res.token, {
      username: res.username,
      nickname: res.nickname
    })

    ElMessage.success('登录成功')
    router.push(route.query.redirect || '/')
  } catch {
    /* 401 凭据错误等已由响应拦截器提示 */
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 35px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 10% 10%, rgba(183, 170, 255, 0.2), transparent 35%),
    radial-gradient(ellipse at 90% 90%, rgba(153, 178, 255, 0.2), transparent 35%),
    #f5f6fc;
}

.background-decoration {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(1px);
}

.decoration-one {
  top: -180px;
  left: -150px;
  width: 450px;
  height: 450px;
  background: rgba(177, 160, 255, 0.09);
}

.decoration-two {
  right: -170px;
  bottom: -190px;
  width: 500px;
  height: 500px;
  background: rgba(130, 158, 245, 0.1);
}

.background-grid {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  pointer-events: none;
  background-image: radial-gradient(#b8b4d8 0.7px, transparent 0.7px);
  background-size: 23px 23px;
}

.auth-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: min(100%, 1000px);
  min-height: 610px;
  overflow: hidden;
  border: 1px solid rgba(229, 229, 243, 0.9);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 25px 80px rgba(54, 58, 108, 0.1);
}

/* 左侧品牌区域 */
.brand-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 42px 45px 32px;
  background:
    radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.15), transparent 35%),
    linear-gradient(145deg, #7868d6 0%, #716fdb 48%, #6485e5 100%);
  color: #fff;
}

.brand-logo {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 33px;
  height: 33px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 20px;
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 380px;
  margin-top: -20px;
}

.brand-eyebrow {
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.brand-content h1 {
  margin: 0;
  color: #fff;
  font-size: 34px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.5px;
}

.brand-content > p {
  max-width: 340px;
  margin: 19px 0 27px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 13px;
  line-height: 2;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(255, 255, 255, 0.23);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 16px;
}

.brand-footer {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.48);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.7px;
}

.brand-decoration {
  position: absolute;
  right: -90px;
  bottom: 65px;
  width: 310px;
  height: 310px;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
}

.circle-large {
  inset: 0;
}

.circle-small {
  inset: 45px;
  border-style: dashed;
}

.decoration-star {
  position: absolute;
  top: 90px;
  left: 100px;
  color: rgba(255, 255, 255, 0.15);
  font-size: 90px;
}

/* 右侧表单区域 */
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 55px 50px;
  background: #fff;
}

.auth-card {
  width: 100%;
  max-width: 350px;
}

.mobile-logo {
  display: none;
}

.welcome {
  margin-bottom: 32px;
}

.welcome-label {
  margin-bottom: 10px;
  color: #8b7bd8;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.8px;
}

.welcome h2 {
  margin: 0;
  color: #28334a;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.welcome p {
  margin: 10px 0 0;
  color: #929bad;
  font-size: 13px;
  line-height: 1.7;
}

/* 表单 */
.auth-card :deep(.el-form-item) {
  margin-bottom: 22px;
}

.auth-card :deep(.el-form-item__label) {
  padding-bottom: 8px;
  color: #59647a;
  font-size: 12px;
  font-weight: 600;
}

.auth-card :deep(.el-input__wrapper) {
  min-height: 46px;
  padding: 0 13px;
  border: 1px solid #e9ebf2;
  border-radius: 10px;
  background: #fafbfe;
  box-shadow: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

.auth-card :deep(.el-input__wrapper:hover) {
  border-color: #c9c1ee;
}

.auth-card :deep(.el-input__wrapper.is-focus) {
  border-color: #9484df;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(137, 119, 220, 0.1);
}

.auth-card :deep(.el-input__inner) {
  color: #354159;
  font-size: 13px;
}

.auth-card :deep(.el-input__inner::placeholder) {
  color: #b2b9c7;
}

.field-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  color: #9990c9;
  font-size: 17px;
}

/* 登录按钮 */
.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 47px;
  margin-top: 7px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(105deg, #8270df, #6e7ee7);
  box-shadow: 0 7px 17px rgba(119, 105, 218, 0.23);
  font-size: 14px;
  font-weight: 650;
  letter-spacing: 2px;
  transition: all 0.2s;
}

.login-button:hover {
  background: linear-gradient(105deg, #7461d1, #6373dc);
  box-shadow: 0 9px 21px rgba(119, 105, 218, 0.3);
  transform: translateY(-1px);
}

.button-arrow {
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0;
}

.register-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 22px;
  color: #929bad;
  font-size: 12px;
}

.register-link :deep(.el-link) {
  font-size: 12px;
  font-weight: 600;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 48px;
  padding-top: 19px;
  border-top: 1px solid #f0f1f5;
  color: #a6adba;
  font-size: 11px;
}

.footer-lock {
  color: #8f82d0;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 760px) {
  .auth-page {
    padding: 20px;
  }

  .auth-container {
    grid-template-columns: 1fr;
    width: min(100%, 440px);
    min-height: auto;
  }

  .brand-panel {
    display: none;
  }

  .form-panel {
    padding: 45px 35px 35px;
  }

  .mobile-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    margin-bottom: 38px;
    color: #6f67bd;
    font-size: 16px;
    font-weight: 700;
  }

  .mobile-logo .logo-icon {
    border-color: #e5e0fb;
    background: #f1efff;
    color: #806ce0;
  }

  .card-footer {
    margin-top: 35px;
  }
}

@media (max-width: 400px) {
  .auth-page {
    padding: 12px;
  }

  .form-panel {
    padding: 35px 22px 28px;
  }

  .welcome h2 {
    font-size: 24px;
  }
}
</style>
