
<template>
  <div class="dashboard" v-loading="loading">
    <!-- 欢迎区域 -->
    <section class="welcome-panel">
      <div class="welcome-content">
        <div class="welcome-tag">
          <span class="welcome-tag-dot"></span>
          PERSONAL WORKSPACE
        </div>

        <h2>让每件物品，都有迹可循。</h2>

        <p>
          管理你的个人物品，让 AI 帮你轻松整理、快速找回。
        </p>

        <div class="welcome-actions">
          <router-link to="/items" class="primary-action">
            <span>管理我的物品</span>
            <span class="action-arrow">→</span>
          </router-link>

          <router-link to="/ai/intake" class="secondary-action">
            <span class="sparkle">✦</span>
            AI 智能录入
          </router-link>
        </div>
      </div>

      <div class="welcome-decoration">
        <div class="decoration-orbit orbit-one"></div>
        <div class="decoration-orbit orbit-two"></div>
        <div class="decoration-center">
          <span>✦</span>
        </div>
        <div class="decoration-card card-one">
          <span class="decoration-icon">▦</span>
          <span>物品管理</span>
        </div>
        <div class="decoration-card card-two">
          <span class="decoration-icon">✧</span>
          <span>AI 智能助手</span>
        </div>
      </div>
    </section>

    <!-- 统计标题 -->
    <section class="section-heading">
      <div>
        <h3>物品概览</h3>
        <p>随时了解你的个人物品情况</p>
      </div>
      <router-link to="/items" class="view-all-link">
        查看全部物品 <span>→</span>
      </router-link>
    </section>

    <!-- 统计卡片 -->
    <section class="statistics-grid">
      <div class="stat-card total-card">
        <div class="stat-top">
          <div class="stat-icon total-icon">▦</div>
          <span class="stat-caption">ALL ITEMS</span>
        </div>
        <div class="stat-number">{{ total }}</div>
        <div class="stat-bottom">
          <span class="stat-name">物品总数</span>
          <span class="stat-description">当前管理的全部物品</span>
        </div>
      </div>

      <div
        v-for="(option, index) in USE_STATUS_OPTIONS"
        :key="option.value"
        class="stat-card"
      >
        <div class="stat-top">
          <div
            class="stat-icon"
            :class="statusIconClass(index)"
          >
            {{ statusIcon(index) }}
          </div>
          <span class="stat-caption">ITEM STATUS</span>
        </div>

        <div class="stat-number">
          {{ countByStatus[option.value] || 0 }}
        </div>

        <div class="stat-bottom">
          <span class="stat-name">{{ option.label }}</span>
          <span class="stat-description">当前物品数量</span>
        </div>
      </div>
    </section>

    <!-- 主体内容 -->
    <section class="content-grid">
      <!-- 最近添加 -->
      <div class="recent-panel">
        <div class="panel-header">
          <div>
            <h3>最近添加</h3>
            <p>最近录入的个人物品</p>
          </div>

          <router-link to="/items" class="panel-link">
            查看全部 <span>→</span>
          </router-link>
        </div>

        <div v-if="latest.length" class="recent-list">
          <div
            v-for="(item, index) in latest"
            :key="item.id || index"
            class="recent-item"
          >
            <div class="item-avatar" :class="`item-avatar-${index % 5}`">
              {{ String(item.name || '物').charAt(0) }}
            </div>

            <div class="item-main">
              <div class="item-name">
                {{ item.name || '未命名物品' }}
              </div>
              <div class="item-time">
                {{ formatDateTime(item.createTime) }}
              </div>
            </div>

            <div class="item-room">
              <span class="room-icon">⌖</span>
              {{ item.room || '暂未设置位置' }}
            </div>

            <div class="item-status">
              <el-tag
                :type="useStatusTagType(item.useStatus)"
                effect="light"
                round
                size="small"
              >
                {{ useStatusLabel(item.useStatus) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">▦</div>
          <h4>还没有添加物品</h4>
          <p>从记录第一件物品开始，建立你的个人物品库。</p>
          <router-link to="/items" class="empty-action">
            去添加物品 →
          </router-link>
        </div>
      </div>

      <!-- 快捷功能 -->
      <div class="quick-panel">
        <div class="panel-header quick-header">
          <div>
            <h3>快捷功能</h3>
            <p>让物品管理更简单</p>
          </div>
        </div>

        <div class="quick-list">
          <router-link to="/items" class="quick-item">
            <div class="quick-icon quick-blue">▦</div>
            <div class="quick-info">
              <div class="quick-name">物品管理</div>
              <div class="quick-desc">查看、添加和管理物品</div>
            </div>
            <span class="quick-arrow">→</span>
          </router-link>

          <router-link to="/ai/intake" class="quick-item">
            <div class="quick-icon quick-purple">✧</div>
            <div class="quick-info">
              <div class="quick-name">AI 智能录入</div>
              <div class="quick-desc">通过图片或文字识别物品</div>
            </div>
            <span class="quick-arrow">→</span>
          </router-link>

          <router-link to="/ai/organize" class="quick-item">
            <div class="quick-icon quick-green">✳</div>
            <div class="quick-info">
              <div class="quick-name">AI 自动整理</div>
              <div class="quick-desc">获取个人物品整理建议</div>
            </div>
            <span class="quick-arrow">→</span>
          </router-link>

          <router-link to="/ai/search" class="quick-item">
            <div class="quick-icon quick-orange">⌕</div>
            <div class="quick-info">
              <div class="quick-name">AI 智能找物</div>
              <div class="quick-desc">用自然语言快速找到物品</div>
            </div>
            <span class="quick-arrow">→</span>
          </router-link>
        </div>

        <div class="ai-tip">
          <div class="ai-tip-icon">✦</div>
          <div>
            <div class="ai-tip-title">试试 AI 智能找物</div>
            <div class="ai-tip-desc">
              不记得东西放在哪里？直接问 AI。
            </div>
          </div>
          <router-link to="/ai/search" class="tip-arrow">→</router-link>
        </div>
      </div>
    </section>

    <!-- 数据说明 -->
    <div class="data-notice">
      <span class="notice-icon">ⓘ</span>
      统计数据根据当前账号的物品列表实时汇总。物品数量较多时，加载时间可能增加。
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { listAllItems } from '@/api/items'
import {
  USE_STATUS_OPTIONS,
  useStatusLabel,
  useStatusTagType,
  formatDateTime
} from '@/utils/format'

const loading = ref(false)
const items = ref([])

const total = computed(() => items.value.length)

const countByStatus = computed(() =>
  items.value.reduce((acc, it) => {
    if (it.useStatus) {
      acc[it.useStatus] = (acc[it.useStatus] || 0) + 1
    }
    return acc
  }, {})
)

const latest = computed(() =>
  [...items.value]
    .sort((a, b) => String(b.createTime).localeCompare(String(a.createTime)))
    .slice(0, 5)
)

function statusIcon(index) {
  const icons = ['✓', '◷', '↗', '×']
  return icons[index] || '•'
}

function statusIconClass(index) {
  const classes = [
    'status-green',
    'status-yellow',
    'status-blue',
    'status-gray'
  ]
  return classes[index] || 'status-gray'
}

onMounted(async () => {
  loading.value = true
  try {
    items.value = await listAllItems()
  } catch {
    /* 拦截器已统一提示 */
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  width: 100%;
  color: #26344d;
}

/* 欢迎区域 */
.welcome-panel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 220px;
  padding: 32px 42px;
  margin-bottom: 30px;
  overflow: hidden;
  border-radius: 18px;
  background: linear-gradient(115deg, #243c75 0%, #3857a0 52%, #675bc1 100%);
  box-shadow: 0 10px 28px rgba(53, 74, 145, 0.14);
  box-sizing: border-box;
}

.welcome-content {
  position: relative;
  z-index: 2;
}

.welcome-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.8px;
}

.welcome-tag-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8ce4c1;
  box-shadow: 0 0 10px rgba(140, 228, 193, 0.8);
}

.welcome-content h2 {
  margin: 20px 0 10px;
  color: #fff;
  font-size: 27px;
  font-weight: 750;
  letter-spacing: 0.5px;
}

.welcome-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.73);
  font-size: 13px;
  line-height: 1.8;
}

.welcome-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 39px;
  padding: 0 17px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;
  transition: all 0.2s ease;
}

.primary-action {
  color: #3c4e91;
  background: #fff;
}

.primary-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.action-arrow {
  font-size: 16px;
}

.secondary-action {
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.1);
}

.secondary-action:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sparkle {
  font-size: 17px;
}

/* 欢迎区装饰 */
.welcome-decoration {
  position: absolute;
  right: 55px;
  top: 50%;
  width: 245px;
  height: 190px;
  transform: translateY(-50%);
  opacity: 0.95;
}

.decoration-orbit {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.orbit-one {
  width: 155px;
  height: 155px;
}

.orbit-two {
  width: 215px;
  height: 215px;
}

.decoration-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 75px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.25),
    rgba(255, 255, 255, 0.08)
  );
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  color: #fff;
  font-size: 35px;
}

.decoration-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.decoration-icon {
  font-size: 17px;
}

.card-one {
  left: -2px;
  top: 27px;
}

.card-two {
  right: -5px;
  bottom: 26px;
}

/* 区块标题 */
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-heading h3,
.panel-header h3 {
  margin: 0;
  color: #29374f;
  font-size: 16px;
  font-weight: 750;
}

.section-heading p,
.panel-header p {
  margin: 6px 0 0;
  color: #9aa5b6;
  font-size: 11px;
}

.view-all-link,
.panel-link {
  color: #6680d9;
  font-size: 11px;
  text-decoration: none;
  font-weight: 600;
}

.view-all-link:hover,
.panel-link:hover {
  color: #445dc1;
}

.view-all-link span,
.panel-link span {
  margin-left: 4px;
}

/* 统计卡片 */
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 28px;
}

.stat-card {
  min-width: 0;
  padding: 18px 19px;
  border: 1px solid #edf0f5;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 3px 12px rgba(35, 52, 84, 0.025);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 9px 23px rgba(35, 52, 84, 0.075);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  font-size: 19px;
  font-weight: 700;
}

.total-icon {
  color: #5476d8;
  background: #edf2ff;
}

.status-green {
  color: #26a77b;
  background: #e8f8f1;
}

.status-yellow {
  color: #d39b3b;
  background: #fff6e6;
}

.status-blue {
  color: #5188d8;
  background: #eaf3ff;
}

.status-gray {
  color: #8e98a8;
  background: #f0f2f5;
}

.stat-caption {
  color: #b2bac8;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 1px;
}

.stat-number {
  margin-top: 17px;
  color: #263550;
  font-size: 31px;
  line-height: 1.1;
  font-weight: 750;
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}

.stat-bottom {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 9px;
}

.stat-name {
  color: #526078;
  font-size: 12px;
  font-weight: 650;
}

.stat-description {
  color: #aab3c1;
  font-size: 10px;
}

/* 主体内容布局 */
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(270px, 1fr);
  gap: 18px;
  align-items: stretch;
}

.recent-panel,
.quick-panel {
  min-width: 0;
  border: 1px solid #edf0f5;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 3px 12px rgba(35, 52, 84, 0.025);
}

.panel-header {
  min-height: 75px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 21px;
  border-bottom: 1px solid #f0f2f6;
}

/* 最近添加列表 */
.recent-list {
  padding: 3px 20px;
}

.recent-item {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 13px;
  border-bottom: 1px solid #f2f4f7;
  transition: background 0.2s ease;
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item:hover {
  background: #fafbfe;
}

.item-avatar {
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 11px;
  font-size: 15px;
  font-weight: 700;
}

.item-avatar-0 {
  color: #5376d8;
  background: #edf2ff;
}

.item-avatar-1 {
  color: #28a17b;
  background: #e8f8f1;
}

.item-avatar-2 {
  color: #c08b38;
  background: #fff5e5;
}

.item-avatar-3 {
  color: #8568cb;
  background: #f1edff;
}

.item-avatar-4 {
  color: #d16c77;
  background: #fff0f1;
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-name {
  overflow: hidden;
  color: #344158;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-time {
  margin-top: 6px;
  color: #a5afbd;
  font-size: 10px;
}

.item-room {
  width: 105px;
  flex-shrink: 0;
  overflow: hidden;
  color: #8490a2;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-icon {
  margin-right: 3px;
  color: #9ba7b9;
  font-size: 15px;
}

.item-status {
  width: 78px;
  flex-shrink: 0;
  text-align: right;
}

/* 空数据状态 */
.empty-state {
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 25px;
  text-align: center;
}

.empty-icon {
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #f0f3ff;
  color: #6882d9;
  font-size: 27px;
}

.empty-state h4 {
  margin: 15px 0 7px;
  color: #35435b;
  font-size: 14px;
}

.empty-state p {
  margin: 0;
  color: #9ba5b5;
  font-size: 11px;
}

.empty-action {
  margin-top: 17px;
  color: #6680d9;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;
}

/* 快捷功能 */
.quick-list {
  padding: 7px 17px;
}

.quick-item {
  min-height: 66px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0 5px;
  border-bottom: 1px solid #f2f4f7;
  text-decoration: none;
  transition: all 0.2s ease;
}

.quick-item:last-child {
  border-bottom: none;
}

.quick-item:hover {
  padding-left: 10px;
  background: #fafbfe;
}

.quick-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 10px;
  font-size: 19px;
  font-weight: 700;
}

.quick-blue {
  color: #5476d8;
  background: #edf2ff;
}

.quick-purple {
  color: #896be0;
  background: #f1edff;
}

.quick-green {
  color: #2ba780;
  background: #e8f8f1;
}

.quick-orange {
  color: #d39343;
  background: #fff5e8;
}

.quick-info {
  flex: 1;
  min-width: 0;
}

.quick-name {
  color: #39465d;
  font-size: 12px;
  font-weight: 650;
}

.quick-desc {
  margin-top: 5px;
  color: #a2adbb;
  font-size: 10px;
}

.quick-arrow {
  color: #b1bac7;
  font-size: 17px;
  transition: transform 0.2s ease;
}

.quick-item:hover .quick-arrow {
  color: #6680d9;
  transform: translateX(3px);
}

/* AI 提示 */
.ai-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 16px 16px;
  padding: 13px 12px;
  border: 1px solid #e9e5ff;
  border-radius: 10px;
  background: linear-gradient(110deg, #f3f1ff, #f7f5ff);
}

.ai-tip-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9px;
  background: #fff;
  color: #876ee0;
  font-size: 17px;
}

.ai-tip-title {
  color: #5d5790;
  font-size: 11px;
  font-weight: 700;
}

.ai-tip-desc {
  margin-top: 4px;
  color: #9692b3;
  font-size: 9px;
}

.tip-arrow {
  margin-left: auto;
  color: #8874dc;
  font-size: 19px;
  text-decoration: none;
}

/* 数据说明 */
.data-notice {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 17px;
  color: #a2acba;
  font-size: 10px;
}

.notice-icon {
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 1250px) {
  .statistics-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .welcome-decoration {
    right: 25px;
    transform: translateY(-50%) scale(0.85);
  }
}

@media (max-width: 950px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .welcome-decoration {
    opacity: 0.45;
  }
}

@media (max-width: 650px) {
  .welcome-panel {
    min-height: 210px;
    padding: 25px 22px;
  }

  .welcome-content h2 {
    font-size: 21px;
  }

  .welcome-content p {
    max-width: 260px;
    font-size: 11px;
  }

  .welcome-decoration {
    right: -65px;
    opacity: 0.22;
  }

  .statistics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-number {
    font-size: 27px;
  }

  .stat-caption {
    display: none;
  }

  .item-room {
    display: none;
  }

  .recent-list {
    padding: 3px 12px;
  }

  .recent-item {
    gap: 9px;
  }

  .section-heading {
    align-items: flex-end;
  }
}
</style>
