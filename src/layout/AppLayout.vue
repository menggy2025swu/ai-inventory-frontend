
<template>
  <el-container class="app-layout">
    <!-- 左侧导航 -->
    <el-aside class="app-sidebar" width="248px">
      <div class="sidebar-inner">
        <!-- 品牌 -->
        <div class="brand">
          <div class="brand-icon">AI</div>
          <div class="brand-info">
            <div class="brand-name">物品管家</div>
            <div class="brand-subtitle">PERSONAL INVENTORY</div>
          </div>
        </div>

        <!-- 导航 -->
        <div class="nav-content">
          <div class="nav-section-title">工作空间</div>

          <el-menu
            :default-active="route.path"
            router
            class="sidebar-menu"
          >
            <el-menu-item index="/dashboard">
              <span class="menu-icon">⌂</span>
              <span class="menu-label">仪表盘</span>
            </el-menu-item>

            <el-menu-item index="/items">
              <span class="menu-icon">▦</span>
              <span class="menu-label">物品管理</span>
            </el-menu-item>

            <el-menu-item index="/categories">
              <span class="menu-icon">▤</span>
              <span class="menu-label">分类管理</span>
            </el-menu-item>

            <el-menu-item index="/locations">
              <span class="menu-icon">⌖</span>
              <span class="menu-label">位置管理</span>
            </el-menu-item>

            <div class="nav-section-title ai-section-title">
              <span>智能助手</span>
              <span class="ai-label">AI POWERED</span>
            </div>

            <el-menu-item index="/ai/intake">
              <span class="menu-icon ai-icon">✧</span>
              <span class="menu-label">AI 智能录入</span>
              <span class="menu-tag">NEW</span>
            </el-menu-item>

            <el-menu-item index="/ai/organize">
              <span class="menu-icon ai-icon">✳</span>
              <span class="menu-label">AI 自动整理</span>
            </el-menu-item>

            <el-menu-item index="/ai/search">
              <span class="menu-icon ai-icon">⌕</span>
              <span class="menu-label">AI 智能找物</span>
            </el-menu-item>
          </el-menu>
        </div>

        <!-- 底部 -->
        <div class="sidebar-bottom">
          <div class="sidebar-tip">
            <div class="tip-icon">✦</div>
            <div>
              <div class="tip-title">让 AI 帮你管理生活</div>
              <div class="tip-desc">轻松记录，随时找回</div>
            </div>
          </div>

          <div class="user-card">
            <el-avatar :size="38" class="user-avatar">
              {{ avatarText }}
            </el-avatar>

            <div class="user-info">
              <div class="user-name">{{ displayName }}</div>
              <div class="user-status">
                <span class="online-dot"></span>
                个人空间
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-aside>

    <!-- 右侧主体 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="top-header">
        <div class="header-left">
          <div class="breadcrumb-label">PERSONAL WORKSPACE</div>
          <h1 class="page-title">
            {{ route.meta.title || '物品管家' }}
          </h1>
        </div>

        <div class="header-right">
          <div class="header-welcome">
            <span class="welcome-dot"></span>
            欢迎回来，{{ displayName }}
          </div>

          <el-dropdown trigger="click">
            <div class="header-user">
              <el-avatar :size="36" class="header-avatar">
                {{ avatarText }}
              </el-avatar>
              <span class="header-username">{{ displayName }}</span>
              <span class="dropdown-arrow">⌄</span>
            </div>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  {{ user.username || '当前用户' }}
                </el-dropdown-item>
                <el-dropdown-item divided @click="logout">
                  <span class="logout-text">退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 页面内容 -->
      <el-main class="main-content">
        <div class="content-wrapper">
          <router-view />
        </div>

        <footer class="page-footer">
          <span>AI 物品管家</span>
          <span class="footer-separator">·</span>
          <span>让每件物品都有迹可循</span>
        </footer>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { getUser, clearAuth } from '@/auth'
import { listAllItems } from '@/api/items'

const router = useRouter()
const route = useRoute()

const user = getUser() || {}

const displayName = computed(() => {
  return user.nickname || user.username || '用户'
})

const avatarText = computed(() => {
  return String(displayName.value).charAt(0).toUpperCase()
})

onMounted(async () => {
  // 刷新页面时检查 JWT 是否仍然有效
  try {
    await listAllItems()
  } catch {
    // 由原有请求拦截器统一处理错误
  }
})

function logout() {
  ElMessageBox.confirm(
    '确定退出登录吗？',
    '退出登录',
    {
      confirmButtonText: '确认退出',
      cancelButtonText: '继续使用',
      type: 'warning',
      roundButton: true
    }
  )
    .then(() => {
      clearAuth()
      router.push('/login')
    })
    .catch(() => {})
}
</script>

<style scoped>
/* 整体布局 */
.app-layout {
  width: 100%;
  height: 100vh;
  min-width: 0;
  overflow: hidden;
  background: #f5f7fb;
  color: #1e293b;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "Microsoft YaHei",
    sans-serif;
}

.main-container {
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

/* 左侧导航 */
.app-sidebar {
  height: 100%;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #edf0f5;
  box-shadow: 2px 0 12px rgba(31, 45, 61, 0.025);
  z-index: 2;
}

.sidebar-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 15px;
  box-sizing: border-box;
}

/* 品牌 */
.brand {
  height: 84px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  border-bottom: 1px solid #f0f2f6;
  flex-shrink: 0;
}

.brand-icon {
  width: 43px;
  height: 43px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  background: linear-gradient(135deg, #4779f5, #7559e8);
  box-shadow: 0 5px 13px rgba(91, 104, 235, 0.25);
  flex-shrink: 0;
}

.brand-name {
  font-size: 17px;
  font-weight: 750;
  color: #18243a;
  letter-spacing: 0.5px;
}

.brand-subtitle {
  margin-top: 4px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.1px;
  color: #a1aabd;
}

/* 菜单 */
.nav-content {
  flex: 1;
  padding-top: 25px;
  overflow-y: auto;
  min-height: 0;
}

.nav-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin: 0 0 10px;
  color: #a0a9ba;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 1px;
}

.ai-section-title {
  margin-top: 30px;
  padding-top: 5px;
}

.ai-label {
  font-size: 9px;
  letter-spacing: 0.5px;
  color: #8875e8;
  background: #f1edff;
  padding: 4px 6px;
  border-radius: 5px;
}

.sidebar-menu {
  border-right: none !important;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item) {
  position: relative;
  height: 47px;
  line-height: 47px;
  margin: 4px 0;
  padding: 0 13px !important;
  border-radius: 10px;
  color: #647187;
  font-size: 13px;
  font-weight: 550;
  transition: all 0.2s ease;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: #f4f6fb;
  color: #496fe0;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  color: #496fe0;
  background: linear-gradient(100deg, #edf2ff, #f3f0ff);
  font-weight: 700;
}

.sidebar-menu :deep(.el-menu-item.is-active)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 11px;
  bottom: 11px;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: #5978eb;
}

.menu-icon {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 19px;
  color: #8995aa;
  flex-shrink: 0;
}

.sidebar-menu :deep(.el-menu-item.is-active) .menu-icon {
  color: #5978eb;
  background: #fff;
}

.ai-icon {
  color: #8875e8;
}

.menu-label {
  flex: 1;
}

.menu-tag {
  padding: 3px 5px;
  border-radius: 5px;
  background: #f0ebff;
  color: #866ce7;
  font-size: 9px;
  font-weight: 750;
  line-height: 1;
}

/* 侧边栏底部 */
.sidebar-bottom {
  padding: 15px 0 17px;
  flex-shrink: 0;
  border-top: 1px solid #f0f2f6;
}

.sidebar-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
  margin-bottom: 14px;
  border-radius: 11px;
  background: linear-gradient(120deg, #f0f3ff, #f6f1ff);
}

.tip-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: #fff;
  color: #826be8;
  font-size: 18px;
}

.tip-title {
  font-size: 11px;
  font-weight: 700;
  color: #4c5680;
}

.tip-desc {
  margin-top: 4px;
  color: #939bb3;
  font-size: 10px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 7px;
}

.user-avatar,
.header-avatar {
  flex-shrink: 0;
  color: #fff;
  background: linear-gradient(135deg, #6887ed, #8a69dc);
  font-weight: 700;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
  color: #344057;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  font-size: 10px;
  color: #9aa3b3;
}

.online-dot,
.welcome-dot {
  width: 7px;
  height: 7px;
  display: inline-block;
  border-radius: 50%;
  background: #36bd88;
  flex-shrink: 0;
}

/* 顶部导航 */
.top-header {
  height: 78px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 34px;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #edf0f5;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.breadcrumb-label {
  color: #a0aabd;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1.5px;
}

.page-title {
  margin: 0;
  color: #1c2940;
  font-size: 19px;
  font-weight: 750;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 25px;
}

.header-welcome {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8a94a7;
  font-size: 12px;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  outline: none;
}

.header-username {
  color: #46536a;
  font-size: 12px;
  font-weight: 650;
}

.dropdown-arrow {
  color: #a2aabb;
  font-size: 16px;
}

.logout-text {
  color: #e15b62;
}

/* 页面主体 */
.main-content {
  height: calc(100% - 78px);
  padding: 27px 30px 12px;
  overflow-y: auto;
  background: #f5f7fb;
  box-sizing: border-box;
}

.content-wrapper {
  width: 100%;
  max-width: 1600px;
  min-height: calc(100% - 37px);
  margin: 0 auto;
}

.page-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  padding: 16px 0 8px;
  color: #aab2c0;
  font-size: 10px;
}

.footer-separator {
  color: #c5cbd5;
}

/* 滚动条 */
.nav-content::-webkit-scrollbar,
.main-content::-webkit-scrollbar {
  width: 5px;
}

.nav-content::-webkit-scrollbar-thumb,
.main-content::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: #dce2ec;
}

.nav-content::-webkit-scrollbar-track,
.main-content::-webkit-scrollbar-track {
  background: transparent;
}

/* 中等屏幕 */
@media (max-width: 1100px) {
  .app-sidebar {
    width: 215px !important;
  }

  .top-header {
    padding: 0 24px;
  }

  .main-content {
    padding: 22px 22px 12px;
  }
}

/* 小屏幕：收起侧边栏文字 */
@media (max-width: 800px) {
  .app-layout {
    min-width: 0;
  }

  .app-sidebar {
    width: 72px !important;
  }

  .sidebar-inner {
    padding: 0 8px;
  }

  .brand {
    justify-content: center;
    padding: 0;
  }

  .brand-info,
  .nav-section-title,
  .menu-label,
  .menu-tag,
  .sidebar-tip,
  .user-info {
    display: none;
  }

  .sidebar-menu :deep(.el-menu-item) {
    justify-content: center;
    padding: 0 !important;
  }

  .menu-icon {
    margin: 0;
    font-size: 21px;
  }

  .user-card {
    justify-content: center;
    padding: 5px 0;
  }

  .header-welcome,
  .header-username {
    display: none;
  }

  .top-header {
    padding: 0 17px;
  }

  .main-content {
    padding: 18px 14px;
  }
}
</style>
