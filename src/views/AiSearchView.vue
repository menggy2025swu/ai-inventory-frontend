
<template>
  <div class="search-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <div class="eyebrow">
          <span class="eyebrow-dot"></span>
          AI SMART SEARCH
        </div>
        <h2 class="page-title">智能找物</h2>
        <p class="page-description">
          不用记住物品的具体名称，用日常语言描述，AI 帮你快速找到它。
        </p>
      </div>
      <div class="header-decoration">⌕</div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-panel">
      <div class="search-heading">
        <div class="search-heading-icon">✦</div>
        <div>
          <h3>你想找什么？</h3>
          <p>试着描述物品名称、存放位置或使用状态</p>
        </div>
      </div>

      <div class="search-input-row">
        <el-input
          v-model="query"
          class="natural-input"
          placeholder="例如：我的那把机械键盘放在哪里了？"
          clearable
          size="large"
          @keyup.enter="doSearch"
        >
          <template #prefix>
            <span class="input-search-icon">⌕</span>
          </template>
        </el-input>

        <el-button
          type="primary"
          size="large"
          class="search-button"
          :disabled="!query.trim()"
          :loading="loading"
          @click="doSearch"
        >
          {{ loading ? 'AI 正在查找…' : '✦ AI 找物' }}
        </el-button>
      </div>

      <div class="example-area">
        <span class="example-label">试试这样问：</span>
        <button
          class="example-chip"
          type="button"
          @click="query = '我的电子产品放在哪里了？'"
        >
          我的电子产品放在哪里了？
        </button>
        <button
          class="example-chip"
          type="button"
          @click="query = '有哪些闲置的物品？'"
        >
          有哪些闲置的物品？
        </button>
        <button
          class="example-chip"
          type="button"
          @click="query = '帮我找一下卧室里的物品'"
        >
          找卧室里的物品
        </button>
      </div>
    </div>

    <!-- 搜索结果 -->
    <template v-if="response">
      <!-- 解析条件 -->
      <div class="condition-panel">
        <div class="condition-heading">
          <div class="condition-title">
            <span class="condition-icon">✧</span>
            <span>AI 理解了你的搜索</span>
          </div>
          <span class="condition-subtitle">解析出的检索条件</span>
        </div>

        <div class="condition-tags">
          <template v-if="conditionTags.length">
            <el-tag
              v-for="t in conditionTags"
              :key="t.label"
              class="condition-tag"
              effect="light"
              round
            >
              <span class="tag-label">{{ t.label }}</span>
              <span class="tag-equals">·</span>
              <span>{{ t.value }}</span>
            </el-tag>
          </template>
          <el-tag v-else type="info" effect="light" round>
            未解析出具体条件，将展示全部物品
          </el-tag>
        </div>
      </div>

      <!-- 结果标题 -->
      <div class="results-heading">
        <div>
          <h3>搜索结果</h3>
          <p>
            找到了符合条件的物品
            <span class="result-number">{{ items.length }}</span>
            件
          </p>
        </div>
        <div class="result-status" v-if="items.length">
          <span class="status-dot"></span>
          查询完成
        </div>
      </div>

      <!-- 物品卡片 -->
      <div v-loading="imagesLoading" class="results-container">
        <div v-if="items.length" class="item-grid">
          <div
            v-for="item in items"
            :key="item.id"
            class="item-card"
          >
            <div class="item-image-wrap">
              <img
                v-if="imageMap[item.id]"
                :src="imageMap[item.id]"
                class="item-image"
                :alt="item.name"
              />
              <div v-else class="image-placeholder">
                <span class="placeholder-icon">▧</span>
                <span>暂无图片</span>
              </div>
              <div class="image-overlay"></div>
            </div>

            <div class="item-content">
              <div class="item-title-row">
                <h4 class="item-name" :title="item.name">
                  {{ item.name }}
                </h4>
                <el-tag
                  :type="useStatusTagType(item.useStatus)"
                  size="small"
                  effect="light"
                  round
                >
                  {{ useStatusLabel(item.useStatus) }}
                </el-tag>
              </div>

              <div class="item-location">
                <span class="location-icon">⌖</span>
                <span>
                  {{ item.room || '位置未设置' }}
                  <template v-if="item.detailPosition">
                    · {{ item.detailPosition }}
                  </template>
                </span>
              </div>

              <div class="item-divider"></div>

              <div class="item-footer">
                <span class="created-label">录入时间</span>
                <span class="created-time">
                  {{ formatDateTime(item.createTime) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 无搜索结果 -->
        <div v-else class="empty-result">
          <div class="empty-illustration">⌕</div>
          <h3>暂时没有找到相关物品</h3>
          <p>可以换一种描述方式，试试物品名称、房间或使用状态。</p>
          <el-button
            type="primary"
            plain
            @click="query = ''"
          >
            修改搜索内容
          </el-button>
        </div>
      </div>
    </template>

    <!-- 初始引导 -->
    <div v-else class="search-guide">
      <div class="guide-title">
        <span class="guide-sparkle">✦</span>
        <span>让找物变得更简单</span>
      </div>

      <div class="guide-grid">
        <div class="guide-item">
          <div class="guide-icon purple">⌕</div>
          <h4>自然语言搜索</h4>
          <p>不必记住准确名称，直接描述你想找的东西。</p>
        </div>

        <div class="guide-item">
          <div class="guide-icon blue">⌖</div>
          <h4>快速定位</h4>
          <p>结合房间和详细位置，快速找到物品存放地点。</p>
        </div>

        <div class="guide-item">
          <div class="guide-icon green">✧</div>
          <h4>智能理解</h4>
          <p>AI 理解你的搜索意图，提取相关条件进行查找。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { aiSearch } from '@/api/ai'
import { listImages } from '@/api/images'
import {
  useStatusLabel,
  useStatusTagType,
  formatDateTime,
  imageUrl
} from '@/utils/format'

const query = ref('')
const loading = ref(false)
const imagesLoading = ref(false)
const response = ref(null)
const items = computed(() => response.value?.results?.content ?? [])
const imageMap = reactive({})

const conditionTags = computed(() => {
  const r = response.value
  if (!r) return []

  const tags = []

  if (r.keyword) tags.push({ label: '物品', value: r.keyword })
  if (r.useStatus) tags.push({ label: '状态', value: useStatusLabel(r.useStatus) })
  if (r.room) tags.push({ label: '房间', value: r.room })
  if (r.categoryName) tags.push({ label: '分类', value: r.categoryName })

  return tags
})

async function doSearch() {
  const q = query.value.trim()
  if (!q || loading.value) return

  loading.value = true
  Object.keys(imageMap).forEach((k) => delete imageMap[k])

  try {
    response.value = await aiSearch(q)
    await loadImages()
  } catch {
    /* 已由拦截器提示 */
  } finally {
    loading.value = false
  }
}

// 每条结果单独取图片列表，展示首张；失败仅该条无图，不阻塞整体
async function loadImages() {
  imagesLoading.value = true

  try {
    await Promise.allSettled(
      items.value.map(async (item) => {
        const imgs = await listImages(item.id)
        if (imgs?.length) {
          imageMap[item.id] = imageUrl(imgs[0].imagePath)
        }
      })
    )
  } catch {
    /* 单条失败已在 allSettled 内消化 */
  } finally {
    imagesLoading.value = false
  }
}
</script>

<style scoped>
.search-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
  padding-bottom: 24px;
  color: #28344b;
}

/* 页面标题 */
.page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100px;
  overflow: hidden;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #8170d8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.eyebrow-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8875e8;
  box-shadow: 0 0 0 4px #eeeaff;
}

.page-title {
  margin: 0;
  color: #202b42;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.page-description {
  margin: 9px 0 0;
  color: #8992a5;
  font-size: 13px;
  line-height: 1.7;
}

.header-decoration {
  position: absolute;
  top: -27px;
  right: 35px;
  color: #f0edff;
  font-size: 125px;
  font-weight: 300;
  line-height: 1;
  pointer-events: none;
}

/* 搜索面板 */
.search-panel {
  padding: 25px 28px 21px;
  border: 1px solid #ece9fc;
  border-radius: 17px;
  background:
    radial-gradient(circle at 95% 5%, rgba(226, 220, 255, 0.4), transparent 30%),
    linear-gradient(120deg, #fbfaff, #ffffff 70%);
  box-shadow: 0 7px 25px rgba(70, 62, 130, 0.035);
}

.search-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.search-heading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  border-radius: 12px;
  background: #eeeaff;
  color: #806ce0;
  font-size: 21px;
}

.search-heading h3 {
  margin: 0;
  color: #29354b;
  font-size: 16px;
  font-weight: 700;
}

.search-heading p {
  margin: 5px 0 0;
  color: #929bad;
  font-size: 12px;
}

.search-input-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.natural-input {
  max-width: 760px;
}

.natural-input :deep(.el-input__wrapper) {
  min-height: 48px;
  padding: 0 15px;
  border: 1px solid #e9e7f4;
  border-radius: 11px;
  background: #fff;
  box-shadow: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.natural-input :deep(.el-input__wrapper.is-focus) {
  border-color: #a99bea;
  box-shadow: 0 0 0 3px rgba(137, 119, 220, 0.1);
}

.natural-input :deep(.el-input__inner) {
  color: #344057;
  font-size: 13px;
}

.natural-input :deep(.el-input__inner::placeholder) {
  color: #b0b7c5;
}

.input-search-icon {
  color: #8a78dc;
  font-size: 23px;
}

.search-button {
  flex-shrink: 0;
  width: 135px;
  height: 48px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(105deg, #8270df, #6e7ee7);
  box-shadow: 0 6px 15px rgba(119, 105, 218, 0.2);
  font-size: 13px;
  font-weight: 600;
}

.search-button:hover {
  background: linear-gradient(105deg, #7461d1, #6373dc);
  box-shadow: 0 8px 18px rgba(119, 105, 218, 0.27);
}

.search-button.is-disabled {
  opacity: 0.55;
}

.example-area {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 17px;
}

.example-label {
  color: #9aa2b2;
  font-size: 12px;
}

.example-chip {
  padding: 6px 11px;
  border: 1px solid #ece9f8;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  color: #7d75a7;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.example-chip:hover {
  border-color: #c7bdf2;
  background: #f5f2ff;
  color: #7564c8;
}

/* 条件标签 */
.condition-panel {
  padding: 19px 22px;
  border: 1px solid #edf0f6;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(40, 53, 85, 0.025);
}

.condition-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.condition-title {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #354159;
  font-size: 13px;
  font-weight: 650;
}

.condition-icon {
  color: #8875df;
  font-size: 19px;
}

.condition-subtitle {
  color: #a1a9b8;
  font-size: 11px;
}

.condition-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.condition-tag {
  height: 28px;
  border-color: #e9e5fb;
  background: #f8f6ff;
  color: #7568b8;
}

.tag-label {
  color: #988dc8;
}

.tag-equals {
  margin: 0 5px;
  color: #c1b8e7;
}

/* 结果标题 */
.results-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 3px;
}

.results-heading h3 {
  margin: 0;
  color: #29354b;
  font-size: 17px;
  font-weight: 700;
}

.results-heading p {
  margin: 6px 0 0;
  color: #929bad;
  font-size: 12px;
}

.result-number {
  margin: 0 3px;
  color: #7968ce;
  font-size: 14px;
  font-weight: 700;
}

.result-status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #55a783;
  font-size: 12px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5bb78b;
}

/* 物品卡片 */
.results-container {
  min-height: 100px;
  border-radius: 14px;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
  gap: 17px;
}

.item-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #edf0f6;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(40, 53, 85, 0.025);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.item-card:hover {
  transform: translateY(-4px);
  border-color: #e1dcf8;
  box-shadow: 0 12px 26px rgba(65, 58, 120, 0.09);
}

.item-image-wrap {
  position: relative;
  height: 155px;
  overflow: hidden;
  background: #f6f7fb;
}

.item-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.item-card:hover .item-image {
  transform: scale(1.045);
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #f5f4fc, #f4f7fc);
  color: #a6aabd;
  font-size: 11px;
}

.placeholder-icon {
  color: #b9b2df;
  font-size: 34px;
}

.image-overlay {
  position: absolute;
  inset: auto 0 0;
  height: 35px;
  background: linear-gradient(transparent, rgba(30, 35, 55, 0.07));
  pointer-events: none;
}

.item-content {
  padding: 14px 15px 13px;
}

.item-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.item-name {
  overflow: hidden;
  margin: 0;
  color: #303c53;
  font-size: 14px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-title-row :deep(.el-tag) {
  flex-shrink: 0;
  max-width: 90px;
}

.item-location {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  min-height: 36px;
  margin-top: 12px;
  color: #758097;
  font-size: 12px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.location-icon {
  flex-shrink: 0;
  color: #8a78dc;
  font-size: 17px;
  line-height: 1.3;
}

.item-divider {
  height: 1px;
  margin: 10px 0;
  background: #f0f1f5;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
}

.created-label {
  color: #a2aabb;
}

.created-time {
  overflow: hidden;
  color: #8791a4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 空结果 */
.empty-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding: 35px 20px;
  border: 1px dashed #e6e5f0;
  border-radius: 15px;
  background: #fcfcff;
  text-align: center;
}

.empty-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 65px;
  height: 65px;
  border-radius: 21px;
  background: #f0edff;
  color: #8875df;
  font-size: 39px;
}

.empty-result h3 {
  margin: 17px 0 8px;
  color: #47536a;
  font-size: 16px;
}

.empty-result p {
  margin: 0 0 18px;
  color: #9aa2b2;
  font-size: 12px;
  line-height: 1.8;
}

/* 初始引导 */
.search-guide {
  padding: 25px 26px;
  border: 1px solid #edf0f6;
  border-radius: 16px;
  background: #fff;
}

.guide-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 21px;
  color: #47536a;
  font-size: 14px;
  font-weight: 650;
}

.guide-sparkle {
  color: #8875df;
  font-size: 19px;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}

.guide-item {
  padding: 19px 17px;
  border: 1px solid #f0f1f6;
  border-radius: 12px;
  background: #fcfcfe;
}

.guide-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  border-radius: 12px;
  font-size: 20px;
}

.guide-icon.purple {
  background: #f0edff;
  color: #806ce0;
}

.guide-icon.blue {
  background: #eaf2ff;
  color: #6092e5;
}

.guide-icon.green {
  background: #e8f8f0;
  color: #40ad7d;
}

.guide-item h4 {
  margin: 14px 0 7px;
  color: #47536a;
  font-size: 13px;
  font-weight: 650;
}

.guide-item p {
  margin: 0;
  color: #929bad;
  font-size: 12px;
  line-height: 1.8;
}

/* 响应式 */
@media (max-width: 760px) {
  .guide-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .guide-item {
    display: grid;
    grid-template-columns: 39px 1fr;
    column-gap: 12px;
    align-items: center;
    padding: 13px;
  }

  .guide-item h4 {
    margin: 0 0 4px;
  }

  .guide-item p {
    grid-column: 2;
  }

  .item-grid {
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  }
}

@media (max-width: 600px) {
  .search-page {
    gap: 16px;
  }

  .page-header {
    min-height: auto;
    padding: 8px 0;
  }

  .page-title {
    font-size: 23px;
  }

  .header-decoration {
    right: 5px;
    font-size: 90px;
  }

  .search-panel {
    padding: 20px 16px;
  }

  .search-input-row {
    flex-direction: column;
    gap: 10px;
  }

  .natural-input {
    max-width: none;
  }

  .search-button {
    width: 100%;
  }

  .example-area {
    gap: 7px;
  }

  .condition-panel {
    padding: 16px;
  }

  .condition-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }

  .results-heading {
    align-items: flex-start;
  }

  .item-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .item-image-wrap {
    height: 120px;
  }

  .item-content {
    padding: 11px;
  }

  .item-title-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .item-location {
    min-height: 42px;
    margin-top: 9px;
  }

  .item-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .search-guide {
    padding: 19px 15px;
  }
}

@media (max-width: 360px) {
  .item-grid {
    grid-template-columns: 1fr;
  }

  .item-image-wrap {
    height: 165px;
  }
}
</style>
