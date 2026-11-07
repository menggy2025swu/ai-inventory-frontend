
<template>
  <div class="categories-page" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-heading">
      <div>
        <div class="eyebrow">CATEGORY MANAGEMENT</div>
        <h2 class="page-title">分类管理</h2>
        <p class="page-description">为个人物品建立清晰的分类，让物品整理更加有序。</p>
      </div>

      <div class="heading-actions">
        <el-button
          class="import-button"
          :loading="importing"
          @click="importCommon"
        >
          ⇩ 导入常见分类
        </el-button>
        <el-button type="primary" class="create-button" @click="openCreate">
          <span class="plus-icon">＋</span>
          新增分类
        </el-button>
      </div>
    </div>

    <!-- 分类概览 -->
    <div class="overview-strip">
      <div class="overview-icon">▦</div>
      <div class="overview-content">
        <div class="overview-label">分类总数</div>
        <div class="overview-value">
          {{ rows.length }} <span>个分类</span>
        </div>
      </div>
      <div class="overview-divider"></div>
      <div class="overview-hint">
        <span class="hint-dot"></span>
        使用分类让你的物品井井有条
      </div>
    </div>

    <!-- 分类列表 -->
    <section class="panel">
      <div class="panel-heading">
        <div>
          <h3>我的分类</h3>
          <p>管理已有分类，可以随时修改名称</p>
        </div>
        <span class="panel-decoration">MY CATEGORIES</span>
      </div>

      <el-table
        :data="rows"
        class="categories-table"
        :header-cell-style="{
          background: '#f8f9fc',
          color: '#8994a8',
          fontWeight: '600',
          height: '48px'
        }"
      >
        <el-table-column label="分类名称" min-width="220" show-overflow-tooltip>
          <template #default="{ row, $index }">
            <div class="category-info">
              <div class="category-icon" :class="`category-icon-${$index % 5}`">
                {{ String(row.name || '分').charAt(0) }}
              </div>
              <div class="category-text">
                <div
                  class="category-name name-clickable"
                  :title="`查看「${row.name}」下的物品`"
                  @click="goItems(row)"
                >
                  {{ row.name }}
                </div>
                <div class="category-subtitle">个人物品分类</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="物品数量" width="120">
          <template #default="{ row }">
            <el-link
              v-if="countMap[row.id] !== undefined"
              type="primary"
              :underline="false"
              class="count-link"
              @click="goItems(row)"
            >
              {{ countMap[row.id] }} 件
            </el-link>
            <el-icon
              v-else-if="countsLoading"
              class="count-loading is-loading"
            >
              <Loading />
            </el-icon>
            <span v-else class="count-empty">—</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="190">
          <template #default="{ row }">
            <span class="time-text">{{ formatDateTime(row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button link type="primary" @click="openEdit(row)">
                编辑
              </el-button>
              <el-button link type="danger" @click="removeRow(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-state">
            <div class="empty-icon">▦</div>
            <h4>还没有创建分类</h4>
            <p>创建第一个分类，让你的物品拥有清晰的归属。</p>
            <el-button type="primary" plain @click="openCreate">
              新增分类
            </el-button>
          </div>
        </template>
      </el-table>

      <div class="table-footer">
        <span>当前共有 <strong>{{ rows.length }}</strong> 个分类</span>
        <span class="footer-tip">分类被物品引用时，需要先解除引用才能删除</span>
      </div>
    </section>

    <!-- 新增 / 编辑对话框 -->
    <el-dialog
      v-model="visible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="420px"
      class="category-dialog"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <div class="dialog-intro">
        <div class="dialog-icon">▦</div>
        <div>
          <div class="dialog-title">
            {{ isEdit ? '修改分类名称' : '创建一个新分类' }}
          </div>
          <div class="dialog-description">
            {{ isEdit ? '修改后，相关物品仍保留在该分类中。' : '为你的物品设置一个容易识别的分类名称。' }}
          </div>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="category-form"
        @submit.prevent
      >
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="form.name"
            maxlength="50"
            show-word-limit
            placeholder="例如：数码产品、生活用品、学习资料"
            autocomplete="off"
            @keyup.enter="save"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-button" @click="visible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            class="save-button"
            :loading="saving"
            @click="save"
          >
            {{ isEdit ? '保存修改' : '创建分类' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '@/api/categories'
import { searchItems } from '@/api/items'
import { formatDateTime } from '@/utils/format'

const rows = ref([])
const loading = ref(false)
const visible = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref()
const form = reactive({ name: '' })
const importing = ref(false)

const router = useRouter()
// 分类 ID → 物品数量；countsLoading 控制数量列的小 loading
const countMap = reactive({})
const countsLoading = ref(false)

// 内置常见分类：一键导入，已存在的（409）静默跳过
const COMMON_CATEGORIES = [
  '衣服', '裤子', '帽子', '电器', '包',
  '配饰', '发饰', '鞋子', '数码', '图书',
  '文具', '化妆品', '药品', '工具', '玩具'
]

// 与后端 CreateCategoryRequest / UpdateCategoryRequest 约束一致
const rules = {
  name: [
    { required: true, message: '分类名称不能为空', trigger: 'blur' },
    { max: 50, message: '分类名称不能超过50个字符', trigger: 'blur' }
  ]
}

async function load() {
  loading.value = true
  try {
    rows.value = await listCategories()
    // 数量统计异步并发加载，不阻塞分类列表渲染
    loadCounts()
  } catch {
    /* 拦截器已统一提示 */
  } finally {
    loading.value = false
  }
}

// 并发统计每个分类下的物品数量：size=1 只为取 totalElements，
// 单条失败仅该分类不显示数量，不影响其他分类
async function loadCounts() {
  const cats = rows.value
  Object.keys(countMap).forEach((key) => delete countMap[key])

  if (!cats.length) {
    countsLoading.value = false
    return
  }

  countsLoading.value = true
  try {
    const results = await Promise.all(
      cats.map((cat) =>
        searchItems({ categoryId: cat.id, page: 0, size: 1 })
          .then((page) => ({ id: cat.id, total: page.totalElements ?? 0 }))
          .catch(() => ({ id: cat.id, total: null }))
      )
    )
    results.forEach(({ id, total }) => {
      if (total !== null) {
        countMap[id] = total
      }
    })
  } finally {
    countsLoading.value = false
  }
}

// 点击分类名 / 数量 → 跳转物品管理并按该分类筛选
function goItems(row) {
  router.push({ path: '/items', query: { categoryId: row.id } })
}

function openCreate() {
  isEdit.value = false
  editingId.value = null
  form.name = ''
  visible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  form.name = row.name
  visible.value = true
}

function resetForm() {
  formRef.value?.clearValidate()
}

async function save() {
  if (saving.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  const name = form.name.trim()

  if (!name) {
    formRef.value?.validateField('name')
    return
  }

  saving.value = true

  try {
    if (isEdit.value) {
      await updateCategory(editingId.value, { name })
      ElMessage.success('已保存')
    } else {
      await createCategory({ name })
      ElMessage.success('已创建')
    }

    visible.value = false
    await load()
  } catch {
    /* 409 重名等已由拦截器提示 */
  } finally {
    saving.value = false
  }
}

// 串行逐条创建，避免并发触发唯一约束竞争；
// 单条失败（如 409 重名）跳过，不影响其余分类导入
async function importCommon() {
  if (importing.value) return

  importing.value = true
  try {
    for (const name of COMMON_CATEGORIES) {
      try {
        await createCategory({ name }, { skipErrorToast: true })
      } catch {
        /* 已存在等单条失败静默跳过 */
      }
    }
    ElMessage.success('已导入常见分类')
    await load()
  } finally {
    importing.value = false
  }
}

async function removeRow(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除分类「${row.name}」吗？被物品引用的分类无法删除。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消'
      }
    )
  } catch {
    return
  }

  try {
    await deleteCategory(row.id)
    ElMessage.success('已删除')
    await load()
  } catch (error) {
    // 409：分类仍被物品引用，补充可操作指引
    if (error.response?.status === 409) {
      ElMessageBox.alert(
        '该分类正在被物品使用，不能直接删除。请先到「物品管理」编辑相关物品，移除其分类后再试。',
        '无法删除',
        {
          type: 'warning',
          confirmButtonText: '我知道了'
        }
      )
    }
    /* 其他错误（404/500）已由拦截器提示 */
  }
}

onMounted(load)
</script>

<style scoped>
.categories-page {
  width: 100%;
  min-width: 0;
  color: #263550;
}

/* 页面标题 */
.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.eyebrow {
  margin-bottom: 7px;
  color: #9aa8c0;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 1.6px;
}

.page-title {
  margin: 0;
  color: #23324e;
  font-size: 23px;
  font-weight: 750;
  letter-spacing: -0.4px;
}

.page-description {
  margin: 8px 0 0;
  color: #96a1b4;
  font-size: 13px;
  line-height: 1.6;
}

.create-button {
  height: 42px;
  padding: 0 19px;
  border: none;
  border-radius: 9px;
  background: linear-gradient(110deg, #5479ee, #7461e6);
  box-shadow: 0 5px 13px rgba(91, 110, 226, 0.2);
  font-weight: 650;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.create-button:hover {
  transform: translateY(-2px);
  background: linear-gradient(110deg, #5479ee, #7461e6);
  box-shadow: 0 7px 17px rgba(91, 110, 226, 0.28);
}

.plus-icon {
  margin-right: 5px;
  font-size: 18px;
}

.heading-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
}

.import-button {
  height: 42px;
  padding: 0 17px;
  border-color: #dfe4f6;
  border-radius: 9px;
  color: #5f74d8;
  font-weight: 650;
}

.import-button:hover {
  border-color: #b9c4f2;
  background: #f6f8ff;
  color: #4a63d1;
}

/* 概览 */
.overview-strip {
  min-height: 83px;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 20px;
  margin-bottom: 19px;
  box-sizing: border-box;
  border: 1px solid #e9edfa;
  border-radius: 13px;
  background: linear-gradient(110deg, #fff, #f6f7ff);
  box-shadow: 0 4px 14px rgba(34, 54, 89, 0.025);
}

.overview-icon {
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #edf1ff;
  color: #5b79e9;
  font-size: 23px;
}

.overview-label {
  color: #98a3b7;
  font-size: 11px;
}

.overview-value {
  margin-top: 3px;
  color: #293957;
  font-size: 21px;
  font-weight: 750;
}

.overview-value span {
  color: #98a3b7;
  font-size: 12px;
  font-weight: 400;
}

.overview-divider {
  width: 1px;
  height: 38px;
  margin: 0 7px;
  background: #e8ebf2;
}

.overview-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #99a4b7;
  font-size: 12px;
}

.hint-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #46c69a;
}

/* 列表卡片 */
.panel {
  overflow: hidden;
  border: 1px solid #e9edf4;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(34, 54, 89, 0.025);
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #f0f2f6;
}

.panel-heading h3 {
  margin: 0;
  color: #293956;
  font-size: 15px;
  font-weight: 750;
}

.panel-heading p {
  margin: 6px 0 0;
  color: #9ba6b8;
  font-size: 11px;
}

.panel-decoration {
  color: #a7b2c8;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1.3px;
}

/* 表格 */
.categories-table {
  width: 100%;
}

.categories-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.categories-table :deep(th.el-table__cell) {
  border-bottom: 1px solid #edf0f5;
}

.categories-table :deep(td.el-table__cell) {
  height: 82px;
  border-bottom: 1px solid #f0f2f6;
  transition: background 0.15s ease;
}

.categories-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: #f8f9ff !important;
}

.categories-table :deep(.cell) {
  padding-right: 16px;
  padding-left: 20px;
  font-size: 12px;
}

.categories-table :deep(.el-table__fixed-right::before) {
  display: none;
}

/* 分类信息 */
.category-info {
  display: flex;
  align-items: center;
  gap: 13px;
}

.category-icon {
  width: 43px;
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
}

.category-icon-0 {
  color: #5376d8;
  background: #edf2ff;
}

.category-icon-1 {
  color: #28a17b;
  background: #e8f8f1;
}

.category-icon-2 {
  color: #c08b38;
  background: #fff5e5;
}

.category-icon-3 {
  color: #8568cb;
  background: #f1edff;
}

.category-icon-4 {
  color: #d16c77;
  background: #fff0f1;
}

.category-name {
  color: #34435e;
  font-size: 13px;
  font-weight: 700;
}

.name-clickable {
  cursor: pointer;
  transition: color 0.15s ease;
}

.name-clickable:hover {
  color: #5479ee;
}

/* 物品数量列 */
.count-link {
  font-size: 12px;
  font-weight: 700;
}

.count-loading {
  color: #8ba0e8;
  font-size: 15px;
}

.count-empty {
  color: #b3bac7;
  font-size: 12px;
}

.category-subtitle {
  margin-top: 6px;
  color: #a5afbf;
  font-size: 10px;
}

.time-text {
  color: #98a4b6;
  font-size: 11px;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.row-actions :deep(.el-button) {
  padding: 5px 7px;
  font-size: 12px;
}

.row-actions :deep(.el-button:hover) {
  background: #f4f6ff;
  border-radius: 5px;
}

/* 空状态 */
.empty-state {
  min-height: 260px;
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
  margin: 0 0 16px;
  color: #9ba5b5;
  font-size: 11px;
}

.empty-state :deep(.el-button) {
  height: 34px;
  border-radius: 7px;
}

/* 表格底部 */
.table-footer {
  min-height: 53px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 10px 20px;
  border-top: 1px solid #f0f2f6;
  color: #a1acbd;
  font-size: 11px;
}

.table-footer strong {
  color: #5e78e6;
}

.footer-tip {
  color: #b0b8c5;
}

/* 弹窗 */
.category-dialog :deep(.el-dialog) {
  overflow: hidden;
  border-radius: 15px;
}

.category-dialog :deep(.el-dialog__header) {
  padding: 22px 24px 16px;
  margin-right: 0;
  border-bottom: 1px solid #f0f2f6;
}

.category-dialog :deep(.el-dialog__title) {
  color: #293956;
  font-size: 16px;
  font-weight: 750;
}

.category-dialog :deep(.el-dialog__body) {
  padding: 22px 24px 10px;
}

.dialog-intro {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 23px;
}

.dialog-icon {
  width: 43px;
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  background: #edf1ff;
  color: #5b79e9;
  font-size: 22px;
}

.dialog-title {
  color: #35435b;
  font-size: 13px;
  font-weight: 700;
}

.dialog-description {
  margin-top: 6px;
  color: #9ba5b5;
  font-size: 11px;
  line-height: 1.5;
}

.category-form :deep(.el-form-item__label) {
  color: #718099;
  font-size: 12px;
  font-weight: 600;
}

.category-form :deep(.el-input__wrapper) {
  min-height: 40px;
  border-radius: 8px;
  background: #f8f9fc;
  box-shadow: 0 0 0 1px #edf0f5 inset;
}

.category-form :deep(.el-input__wrapper:hover) {
  background: #fff;
  box-shadow: 0 0 0 1px #d9e0f5 inset;
}

.category-form :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px #7890ed inset !important;
}

.category-dialog :deep(.el-dialog__footer) {
  padding: 12px 24px 21px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
}

.dialog-footer :deep(.el-button) {
  height: 37px;
  padding: 0 17px;
  border-radius: 8px;
}

.cancel-button {
  color: #7e8ba1;
  border-color: #e7eaf1;
}

.save-button {
  border: none;
  background: linear-gradient(110deg, #5479ee, #7461e6);
}

/* 小屏适配 */
@media (max-width: 650px) {
  .page-heading {
    align-items: flex-start;
    gap: 10px;
  }

  .page-title {
    font-size: 21px;
  }

  .page-description {
    max-width: 240px;
    font-size: 12px;
  }

  .create-button {
    height: 38px;
    flex-shrink: 0;
    padding: 0 12px;
    font-size: 12px;
  }

  .heading-actions {
    gap: 6px;
  }

  .import-button {
    height: 38px;
    padding: 0 10px;
    font-size: 12px;
  }

  .overview-strip {
    padding: 13px 15px;
  }

  .overview-hint,
  .overview-divider,
  .panel-decoration,
  .footer-tip {
    display: none;
  }

  .panel-heading {
    padding: 16px;
  }

  .categories-table :deep(.cell) {
    padding-right: 10px;
    padding-left: 12px;
  }

  .category-icon {
    width: 38px;
    height: 38px;
  }

  .table-footer {
    padding: 10px 15px;
  }
}
</style>
