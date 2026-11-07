
<template>
  <div class="organize-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <div class="eyebrow">
          <span class="eyebrow-dot"></span>
          AI SMART ORGANIZATION
        </div>
        <h2 class="page-title">智能整理</h2>
        <p class="page-description">
          让 AI 帮你检查物品分类、存放位置和使用状态，发现可以优化的地方。
        </p>
      </div>
      <div class="header-decoration">✦</div>
    </div>

    <!-- 未分析：分析引导 -->
    <template v-if="!result">
      <div class="analysis-card">
        <div class="analysis-illustration">
          <div class="illustration-orbit orbit-one"></div>
          <div class="illustration-orbit orbit-two"></div>
          <div class="illustration-center">
            <span>✦</span>
          </div>
          <span class="float-icon icon-one">📦</span>
          <span class="float-icon icon-two">📍</span>
          <span class="float-icon icon-three">✨</span>
        </div>

        <div class="analysis-content">
          <div class="analysis-label">AI ORGANIZATION ASSISTANT</div>
          <h3>让每件物品都有自己的位置</h3>
          <p>
            AI 将检查你的物品信息，分析分类是否合理、存放位置是否清晰，
            并给出使用状态调整建议。
          </p>

          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">▦</span>
              <span>分类优化</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">⌖</span>
              <span>位置建议</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">✓</span>
              <span>状态检查</span>
            </div>
          </div>

          <el-button
            type="primary"
            size="large"
            class="analyze-button"
            :loading="loading"
            @click="analyze"
          >
            {{ loading ? 'AI 正在分析…' : '✦ 开始智能分析' }}
          </el-button>

          <p class="safe-tip">
            <span>🔒</span>
            仅分析你的物品数据，不会自动修改或删除任何内容
          </p>
          <p v-if="loading" class="loading-tip">
            模型正在整理物品信息，通常需要 5 秒左右，请稍候…
          </p>
        </div>
      </div>

      <div class="bottom-notice">
        <span class="notice-icon">💡</span>
        <div>
          <strong>小提示</strong>
          <p>分析范围最多包含 200 件物品。你可以逐条查看建议，再决定是否采纳。</p>
        </div>
      </div>
    </template>

    <!-- 分析结果 -->
    <template v-else>
      <!-- 统计概览 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon purple">▦</div>
          <div>
            <div class="stat-label">已分析物品</div>
            <div class="stat-value">{{ result.analyzedItemCount ?? 0 }}<span>件</span></div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">✦</div>
          <div>
            <div class="stat-label">整理建议</div>
            <div class="stat-value">{{ rows.length }}<span>条</span></div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">✓</div>
          <div>
            <div class="stat-label">当前状态</div>
            <div class="stat-status">{{ rows.length ? '等待处理' : '状态良好' }}</div>
          </div>
        </div>
      </div>

      <!-- AI 总结 -->
      <div class="result-summary">
        <div class="summary-heading">
          <span class="summary-icon">✦</span>
          <span>AI 分析总结</span>
        </div>
        <p>{{ result.summary || '分析已完成。' }}</p>
      </div>

      <div v-if="result.truncationNotice" class="warning-notice">
        <span>⚠</span>
        <p>{{ result.truncationNotice }}</p>
      </div>

      <!-- 建议列表 -->
      <div class="suggestions-section">
        <div class="section-heading">
          <div>
            <h3>整理建议</h3>
            <p>查看 AI 发现的问题，根据实际情况决定是否采纳。</p>
          </div>
          <div class="section-actions">
            <span class="suggestion-count">{{ rows.length }} 条建议</span>
            <el-button
              type="primary"
              size="small"
              class="adopt-all-button"
              :loading="bulkAdopting"
              :disabled="!rows.length"
              @click="adoptAll"
            >
              ✓ 一键采纳所有建议
            </el-button>
          </div>
        </div>

        <div v-if="rows.length" class="table-card">
          <el-table
            :data="rows"
            class="suggestion-table"
            style="width: 100%"
            :header-cell-style="{
              background: '#f8f9fc',
              color: '#667085',
              fontWeight: '600',
              height: '48px'
            }"
          >
            <el-table-column
              prop="itemName"
              label="物品名称"
              min-width="130"
              show-overflow-tooltip
            />

            <el-table-column label="建议分类" min-width="135">
              <template #default="{ row }">
                <div v-if="row.suggestedCategoryName" class="category-cell">
                  <span>{{ row.suggestedCategoryName }}</span>
                  <el-tag
                    v-if="!row.matchedCategoryId"
                    size="small"
                    type="info"
                    effect="plain"
                  >
                    新分类
                  </el-tag>
                </div>
                <span v-else class="empty-value">—</span>
              </template>
            </el-table-column>

            <el-table-column label="建议房间" width="110">
              <template #default="{ row }">
                <span>{{ row.suggestedRoom || '—' }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="建议位置"
              min-width="135"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span>{{ row.suggestedDetailPosition || '—' }}</span>
              </template>
            </el-table-column>

            <el-table-column label="建议状态" width="110">
              <template #default="{ row }">
                <el-tag
                  v-if="row.suggestedUseStatus"
                  :type="useStatusTagType(row.suggestedUseStatus)"
                  size="small"
                  effect="light"
                >
                  {{ useStatusLabel(row.suggestedUseStatus) }}
                </el-tag>
                <span v-else class="empty-value">—</span>
              </template>
            </el-table-column>

            <el-table-column
              prop="reason"
              label="调整理由"
              min-width="190"
              show-overflow-tooltip
            />

            <el-table-column label="操作" width="135" fixed="right">
              <template #default="{ row }">
                <div class="row-actions">
                  <el-button
                    link
                    type="primary"
                    :loading="adoptOpeningId === row.itemId"
                    @click="adopt(row)"
                  >
                    采纳
                  </el-button>
                  <el-button
                    link
                    type="info"
                    @click="ignore(row)"
                  >
                    忽略
                  </el-button>
                </div>
              </template>
            </el-table-column>

            <template #empty>
              <el-empty description="暂无整理建议" />
            </template>
          </el-table>
        </div>

        <!-- 无建议状态 -->
        <div v-else class="all-good-card">
          <div class="all-good-icon">✓</div>
          <h3>你的物品整理得很不错！</h3>
          <p>AI 暂时没有发现需要调整的地方，继续保持良好的物品管理习惯吧。</p>
        </div>
      </div>

      <!-- 底部操作 -->
      <div class="result-footer">
        <div class="footer-tip">
          <span>ⓘ</span>
          采纳建议将直接更新对应物品，你也可以在弹窗中先修改再保存。
        </div>
        <el-button class="reset-button" @click="reset">
          ↻ 重新分析
        </el-button>
      </div>
    </template>

    <!-- 采纳编辑弹窗：按 AI 建议预填，可修改后全量保存 -->
    <el-dialog
      v-model="adoptVisible"
      title="采纳建议"
      width="520px"
      class="adopt-dialog"
      :close-on-click-modal="false"
    >
      <div class="adopt-tip">
        已按 AI 建议预填以下内容，确认或修改后保存，将直接更新该物品。
      </div>

      <el-form label-position="top" class="adopt-form" @submit.prevent>
        <el-form-item label="物品名称">
          <el-input v-model="adoptForm.name" disabled />
        </el-form-item>

        <el-form-item label="所属分类">
          <el-select
            v-model="adoptForm.categoryId"
            clearable
            placeholder="不设置分类"
            style="width: 100%"
          >
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
          <div
            v-if="
              adoptForm.suggestedCategoryName &&
              !adoptForm.suggestedCategoryMatched
            "
            class="field-hint"
          >
            AI 建议的新分类「{{ adoptForm.suggestedCategoryName }}」不在你的分类库中，
            本次仅更新房间 / 位置 / 状态；如需该分类请先到「分类管理」创建。
          </div>
        </el-form-item>

        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="所在房间">
              <el-input
                v-model="adoptForm.room"
                maxlength="50"
                placeholder="例如：卧室"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="具体位置">
              <el-input
                v-model="adoptForm.detailPosition"
                maxlength="100"
                placeholder="例如：衣柜第二层"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="使用状态">
          <el-radio-group v-model="adoptForm.useStatus" class="status-group">
            <el-radio-button
              v-for="o in USE_STATUS_OPTIONS"
              :key="o.value"
              :value="o.value"
            >
              {{ o.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="adopt-footer">
          <el-button class="adopt-cancel" @click="adoptVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            class="adopt-save"
            :loading="adoptSaving"
            @click="saveAdopt"
          >
            保存并采纳
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { aiOrganize } from '@/api/ai'
import { getItem, updateItem } from '@/api/items'
import { listCategories } from '@/api/categories'
import { USE_STATUS_OPTIONS, useStatusLabel, useStatusTagType } from '@/utils/format'

const loading = ref(false)
const result = ref(null)
const rows = ref([])
const categories = ref([])

// 采纳编辑弹窗状态
const adoptVisible = ref(false)
const adoptSaving = ref(false)
const adoptOpeningId = ref(null)
const adoptForm = reactive({
  itemId: null,
  name: '',
  categoryId: null,
  room: '',
  detailPosition: '',
  useStatus: 'NORMAL',
  lastUseDate: null,
  warrantyStartDate: null,
  warrantyEndDate: null,
  warrantyRemark: '',
  suggestedCategoryName: null,
  suggestedCategoryMatched: true
})

// 一键采纳状态
const bulkAdopting = ref(false)

onMounted(async () => {
  try {
    categories.value = await listCategories()
  } catch {
    /* 分类加载失败不阻塞分析，仅影响采纳时的新分类名匹配 */
  }
})

async function analyze() {
  if (loading.value) return

  loading.value = true
  try {
    const res = await aiOrganize()
    result.value = res
    rows.value = res.suggestions ?? []
  } catch {
    /* 502 等已由拦截器提示 */
  } finally {
    loading.value = false
  }
}

// 按名称（忽略大小写）在本人分类库中匹配分类
function matchCategoryByName(name) {
  const target = name?.trim().toLowerCase()
  if (!target) return null
  return (
    categories.value.find(
      (c) => c.name?.trim().toLowerCase() === target
    ) ?? null
  )
}

// 计算建议落地后的 categoryId：优先后端已匹配的 ID，
// 其次按建议分类名匹配本人分类库，匹配不到则保持物品原分类
function resolveCategoryId(row, item) {
  if (row.matchedCategoryId) return row.matchedCategoryId
  const hit = matchCategoryByName(row.suggestedCategoryName)
  if (hit) return hit.id
  return item.categoryId ?? null
}

const blankToNull = (v) =>
  typeof v === 'string' ? v.trim() || null : v ?? null

// 把建议合并到物品完整数据上，构造全量替换语义的 PUT 载荷：
// 建议字段为 null 表示"无建议"，保留物品原值
function buildAdoptPayload(row, item) {
  return {
    name: item.name?.trim(),
    categoryId: resolveCategoryId(row, item),
    room: blankToNull(row.suggestedRoom ?? item.room),
    detailPosition: blankToNull(
      row.suggestedDetailPosition ?? item.detailPosition
    ),
    useStatus: (row.suggestedUseStatus ?? item.useStatus) || null,
    lastUseDate: item.lastUseDate ?? null,
    warrantyStartDate: item.warrantyStartDate ?? null,
    warrantyEndDate: item.warrantyEndDate ?? null,
    warrantyRemark: blankToNull(item.warrantyRemark)
  }
}

// 采纳：取回完整物品 → 按建议预填 → 弹窗确认/修改后保存
async function adopt(row) {
  if (adoptOpeningId.value) return

  adoptOpeningId.value = row.itemId
  try {
    const item = await getItem(row.itemId)
    Object.assign(adoptForm, {
      itemId: item.id,
      name: item.name ?? '',
      categoryId: resolveCategoryId(row, item),
      room: row.suggestedRoom ?? item.room ?? '',
      detailPosition:
        row.suggestedDetailPosition ?? item.detailPosition ?? '',
      useStatus: row.suggestedUseStatus ?? item.useStatus ?? 'NORMAL',
      lastUseDate: item.lastUseDate ?? null,
      warrantyStartDate: item.warrantyStartDate ?? null,
      warrantyEndDate: item.warrantyEndDate ?? null,
      warrantyRemark: item.warrantyRemark ?? '',
      suggestedCategoryName: row.suggestedCategoryName ?? null,
      suggestedCategoryMatched:
        !!row.matchedCategoryId ||
        !!matchCategoryByName(row.suggestedCategoryName)
    })
    adoptVisible.value = true
  } catch {
    /* 404 等已由拦截器提示 */
  } finally {
    adoptOpeningId.value = null
  }
}

// 保存采纳：PUT 全量替换，成功后从建议列表移除该条
async function saveAdopt() {
  if (adoptSaving.value) return

  adoptSaving.value = true
  try {
    await updateItem(adoptForm.itemId, {
      name: adoptForm.name.trim(),
      categoryId: adoptForm.categoryId ?? null,
      room: adoptForm.room?.trim() || null,
      detailPosition: adoptForm.detailPosition?.trim() || null,
      useStatus: adoptForm.useStatus || null,
      lastUseDate: adoptForm.lastUseDate || null,
      warrantyStartDate: adoptForm.warrantyStartDate || null,
      warrantyEndDate: adoptForm.warrantyEndDate || null,
      warrantyRemark: adoptForm.warrantyRemark?.trim() || null
    })
    ElMessage.success('采纳成功')
    adoptVisible.value = false
    rows.value = rows.value.filter((r) => r.itemId !== adoptForm.itemId)
  } catch {
    /* 已由拦截器统一提示 */
  } finally {
    adoptSaving.value = false
  }
}

// 单条静默采纳（供一键采纳调用）：取回完整物品 → 合并建议 → PUT
async function applySuggestion(row) {
  const item = await getItem(row.itemId)
  await updateItem(row.itemId, buildAdoptPayload(row, item))
}

// 一键采纳所有建议：串行逐条更新，统计成功/失败
async function adoptAll() {
  if (bulkAdopting.value || !rows.value.length) return

  try {
    await ElMessageBox.confirm(
      `将按 AI 建议逐条更新 ${rows.value.length} 件物品，确定一键采纳所有建议吗？`,
      '一键采纳',
      {
        type: 'warning',
        confirmButtonText: '全部采纳',
        cancelButtonText: '取消'
      }
    )
  } catch {
    return
  }

  bulkAdopting.value = true
  let success = 0
  let failed = 0
  const adoptedIds = []

  // 串行逐条采纳，避免并发写冲突；单条失败不影响其余
  for (const row of rows.value) {
    try {
      await applySuggestion(row)
      success += 1
      adoptedIds.push(row.itemId)
    } catch {
      failed += 1
    }
  }

  rows.value = rows.value.filter((r) => !adoptedIds.includes(r.itemId))
  bulkAdopting.value = false

  ElMessage({
    type: failed ? 'warning' : 'success',
    message: `成功采纳 ${success} 条，失败 ${failed} 条`
  })
}

// 忽略当前建议，仅从本次结果列表中移除
function ignore(row) {
  rows.value = rows.value.filter((r) => r.itemId !== row.itemId)
  ElMessage.success('已忽略该建议')
}

// 清空本次结果，允许重新发起分析
function reset() {
  result.value = null
  rows.value = []
}
</script>

<style scoped>
.organize-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
  padding-bottom: 24px;
  color: #263248;
}

.page-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  min-height: 100px;
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
  top: -32px;
  right: 30px;
  color: #f0edff;
  font-size: 120px;
  line-height: 1;
  pointer-events: none;
}

/* 未分析状态 */
.analysis-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 70px;
  min-height: 400px;
  padding: 48px 7%;
  overflow: hidden;
  border: 1px solid #eeeaff;
  border-radius: 20px;
  background:
    radial-gradient(circle at 15% 20%, rgba(226, 220, 255, 0.45), transparent 32%),
    linear-gradient(125deg, #fbfaff 0%, #ffffff 55%, #f7f8ff 100%);
  box-shadow: 0 8px 30px rgba(70, 62, 130, 0.045);
}

.analysis-illustration {
  position: relative;
  display: flex;
  flex: 0 0 230px;
  align-items: center;
  justify-content: center;
  width: 230px;
  height: 230px;
}

.illustration-orbit {
  position: absolute;
  border: 1px dashed #d9d1ff;
  border-radius: 50%;
}

.orbit-one {
  width: 205px;
  height: 205px;
}

.orbit-two {
  width: 155px;
  height: 155px;
  border-style: solid;
  border-color: #e7e2ff;
}

.illustration-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border: 1px solid #e5deff;
  border-radius: 30px;
  background: linear-gradient(145deg, #ffffff, #eeeaff);
  box-shadow: 0 15px 35px rgba(119, 99, 206, 0.16);
  transform: rotate(-8deg);
}

.illustration-center span {
  color: #806ce0;
  font-size: 48px;
}

.float-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 43px;
  height: 43px;
  border: 1px solid #eeeaff;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(69, 58, 130, 0.1);
  font-size: 19px;
}

.icon-one {
  top: 13px;
  right: 28px;
}

.icon-two {
  bottom: 22px;
  left: 18px;
}

.icon-three {
  right: 0;
  bottom: 42px;
}

.analysis-content {
  max-width: 490px;
}

.analysis-label {
  margin-bottom: 12px;
  color: #8978dc;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
}

.analysis-content h3 {
  margin: 0;
  color: #27324a;
  font-size: 25px;
  font-weight: 700;
}

.analysis-content > p:not(.safe-tip):not(.loading-tip) {
  margin: 13px 0 20px;
  color: #828ba0;
  font-size: 14px;
  line-height: 1.9;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border: 1px solid #eeeaff;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.8);
  color: #68728a;
  font-size: 12px;
}

.feature-icon {
  color: #8774df;
  font-size: 15px;
}

.analyze-button {
  width: 100%;
  max-width: 260px;
  height: 46px;
  border: none;
  border-radius: 11px;
  background: linear-gradient(105deg, #8270df, #6e7ee7);
  box-shadow: 0 7px 17px rgba(119, 105, 218, 0.23);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.analyze-button:hover {
  background: linear-gradient(105deg, #7461d1, #6373dc);
  box-shadow: 0 9px 20px rgba(119, 105, 218, 0.3);
}

.safe-tip {
  margin: 13px 0 0;
  color: #9aa2b2;
  font-size: 12px;
}

.safe-tip span {
  margin-right: 4px;
}

.loading-tip {
  margin: 10px 0 0;
  color: #7d6bd2;
  font-size: 12px;
}

.bottom-notice {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 17px 20px;
  border: 1px solid #eeeaff;
  border-radius: 13px;
  background: #fbfaff;
}

.notice-icon {
  font-size: 20px;
}

.bottom-notice strong {
  color: #5c548e;
  font-size: 13px;
}

.bottom-notice p {
  margin: 5px 0 0;
  color: #9299aa;
  font-size: 12px;
  line-height: 1.7;
}

/* 结果统计 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 100px;
  padding: 19px 22px;
  border: 1px solid #edf0f6;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(40, 53, 85, 0.025);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 13px;
  font-size: 21px;
}

.stat-icon.purple {
  background: #f0edff;
  color: #806ce0;
}

.stat-icon.blue {
  background: #eaf2ff;
  color: #6092e5;
}

.stat-icon.green {
  background: #e8f8f0;
  color: #40ad7d;
}

.stat-label {
  margin-bottom: 7px;
  color: #929bad;
  font-size: 12px;
}

.stat-value {
  color: #28344b;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.stat-value span {
  margin-left: 4px;
  color: #929bad;
  font-size: 12px;
  font-weight: 400;
}

.stat-status {
  color: #48a77e;
  font-size: 18px;
  font-weight: 650;
}

/* AI 总结 */
.result-summary {
  padding: 20px 23px;
  border: 1px solid #e9e5ff;
  border-radius: 14px;
  background: linear-gradient(110deg, #f8f6ff, #fcfbff);
}

.summary-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
  color: #6254ad;
  font-size: 14px;
  font-weight: 700;
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  border-radius: 8px;
  background: #eae5ff;
  color: #806ce0;
}

.result-summary p {
  margin: 0;
  color: #69738a;
  font-size: 13px;
  line-height: 1.9;
  white-space: pre-wrap;
}

.warning-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 17px;
  border: 1px solid #f5e4c4;
  border-radius: 11px;
  background: #fffbf2;
  color: #a77b36;
  font-size: 12px;
  line-height: 1.7;
}

.warning-notice span {
  font-size: 16px;
}

.warning-notice p {
  margin: 0;
}

/* 建议表格 */
.suggestions-section {
  min-width: 0;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;
}

.section-heading h3 {
  margin: 0;
  color: #29354b;
  font-size: 17px;
  font-weight: 700;
}

.section-heading p {
  margin: 6px 0 0;
  color: #929bad;
  font-size: 12px;
}

.suggestion-count {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 20px;
  background: #f0edff;
  color: #7968ce;
  font-size: 12px;
}

.table-card {
  overflow: hidden;
  border: 1px solid #edf0f6;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(40, 53, 85, 0.025);
}

.suggestion-table {
  color: #536078;
  font-size: 13px;
}

.suggestion-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.suggestion-table :deep(.el-table__row) {
  height: 55px;
}

.suggestion-table :deep(.el-table__row:hover > td) {
  background: #faf9ff !important;
}

.category-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.empty-value {
  color: #b3bac7;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 建议区操作按钮 */
.section-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
}

.adopt-all-button {
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(105deg, #8270df, #6e7ee7);
  box-shadow: 0 4px 10px rgba(119, 105, 218, 0.2);
  font-weight: 600;
}

.adopt-all-button:hover {
  background: linear-gradient(105deg, #7461d1, #6373dc);
}

.adopt-all-button.is-disabled {
  background: #c9c3e8;
  box-shadow: none;
}

/* 采纳编辑弹窗 */
.adopt-dialog :deep(.el-dialog) {
  overflow: hidden;
  border-radius: 16px;
}

.adopt-dialog :deep(.el-dialog__title) {
  color: #29354b;
  font-size: 17px;
  font-weight: 700;
}

.adopt-tip {
  margin-bottom: 18px;
  padding: 11px 14px;
  border: 1px solid #e9e5ff;
  border-radius: 10px;
  background: #f9f7ff;
  color: #7a6fc4;
  font-size: 12px;
  line-height: 1.7;
}

.adopt-form :deep(.el-form-item__label) {
  color: #68728a;
  font-size: 12px;
  font-weight: 600;
}

.adopt-form :deep(.el-input__wrapper),
.adopt-form :deep(.el-select__wrapper) {
  min-height: 40px;
  border-radius: 9px;
  box-shadow: 0 0 0 1px #e8eaf3 inset;
}

.adopt-form :deep(.el-input__wrapper.is-focus),
.adopt-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #8a78dc inset !important;
}

.field-hint {
  margin-top: 8px;
  color: #b98a3e;
  font-size: 11px;
  line-height: 1.6;
}

.status-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-group :deep(.el-radio-button__inner) {
  padding: 8px 15px;
  border: 1px solid #e8eaf3 !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  color: #68728a;
  font-size: 12px;
}

.status-group :deep(.el-radio-button:first-child .el-radio-button__inner),
.status-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 8px !important;
}

.status-group
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  border-color: #8a78dc !important;
  background: #f2efff;
  color: #6c5bc4;
}

.adopt-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.adopt-footer :deep(.el-button) {
  height: 38px;
  min-width: 92px;
  border-radius: 9px;
}

.adopt-cancel {
  border-color: #e7eaf3;
  color: #7e8aa0;
}

.adopt-save {
  border: none;
  background: linear-gradient(105deg, #8270df, #6e7ee7);
  box-shadow: 0 4px 10px rgba(119, 105, 218, 0.22);
}

.adopt-save:hover {
  background: linear-gradient(105deg, #7461d1, #6373dc);
}

/* 无建议 */
.all-good-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 230px;
  padding: 35px 20px;
  border: 1px solid #e5f3eb;
  border-radius: 15px;
  background: linear-gradient(135deg, #f8fdf9, #ffffff);
  text-align: center;
}

.all-good-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #e8f8ef;
  color: #42ad7d;
  font-size: 28px;
}

.all-good-card h3 {
  margin: 17px 0 8px;
  color: #3d8063;
  font-size: 17px;
}

.all-good-card p {
  margin: 0;
  color: #91a49a;
  font-size: 13px;
  line-height: 1.8;
}

/* 底部 */
.result-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding-top: 5px;
}

.footer-tip {
  color: #929bad;
  font-size: 12px;
  line-height: 1.7;
}

.footer-tip span {
  margin-right: 5px;
  color: #8a78dc;
}

.reset-button {
  flex-shrink: 0;
  height: 38px;
  padding: 0 17px;
  border-color: #e5e1f7;
  border-radius: 9px;
  color: #7768c8;
}

.reset-button:hover {
  border-color: #b9aff0;
  background: #f8f6ff;
  color: #6655bc;
}

/* 响应式 */
@media (max-width: 900px) {
  .analysis-card {
    gap: 35px;
    padding: 35px 5%;
  }

  .analysis-illustration {
    flex-basis: 180px;
    width: 180px;
    height: 180px;
  }

  .orbit-one {
    width: 170px;
    height: 170px;
  }

  .orbit-two {
    width: 130px;
    height: 130px;
  }

  .illustration-center {
    width: 80px;
    height: 80px;
  }

  .illustration-center span {
    font-size: 39px;
  }
}

@media (max-width: 640px) {
  .organize-page {
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
    font-size: 85px;
  }

  .analysis-card {
    flex-direction: column;
    gap: 15px;
    padding: 25px 20px 30px;
  }

  .analysis-illustration {
    flex-basis: 165px;
    width: 165px;
    height: 165px;
  }

  .orbit-one {
    width: 155px;
    height: 155px;
  }

  .orbit-two {
    width: 120px;
    height: 120px;
  }

  .analysis-content {
    width: 100%;
    text-align: center;
  }

  .analysis-content h3 {
    font-size: 21px;
  }

  .feature-list {
    justify-content: center;
  }

  .analyze-button {
    max-width: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card {
    min-height: 78px;
    padding: 13px 17px;
  }

  .stat-icon {
    width: 39px;
    height: 39px;
    flex-basis: 39px;
  }

  .result-summary {
    padding: 17px;
  }

  .section-heading {
    align-items: flex-start;
  }

  .section-heading p {
    max-width: 240px;
    line-height: 1.6;
  }

  .result-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .reset-button {
    width: 100%;
  }

  .table-card {
    overflow-x: auto;
  }

  .suggestion-table {
    min-width: 900px;
  }
}
</style>
