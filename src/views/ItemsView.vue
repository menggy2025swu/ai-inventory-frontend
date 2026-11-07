
<template>
  <div class="items-page" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-heading">
      <div>
        <div class="eyebrow">PERSONAL INVENTORY</div>
        <h2 class="page-title">物品管理</h2>
        <p class="page-description">管理你的个人物品，记录每件物品的位置和使用状态。</p>
      </div>

      <el-button type="primary" class="create-button" @click="openCreate">
        <span class="button-plus">＋</span>
        新增物品
      </el-button>
    </div>

    <!-- 数量概览 -->
    <div class="overview-strip">
      <div class="overview-icon">▦</div>
      <div class="overview-content">
        <div class="overview-label">当前物品</div>
        <div class="overview-value">{{ total }} <span>件</span></div>
      </div>
      <div class="overview-divider"></div>
      <div class="overview-hint">
        <span class="hint-dot"></span>
        这里记录着你拥有的每一件物品
      </div>
    </div>

    <!-- 搜索筛选 -->
    <section class="panel filter-panel">
      <div class="panel-heading">
        <div>
          <h3>筛选物品</h3>
          <p>通过名称、状态、分类或房间快速查找</p>
        </div>
        <span class="filter-decoration">FILTER</span>
      </div>

      <el-form class="filter-form" inline @submit.prevent>
        <el-form-item label="物品名称">
          <el-input
            v-model="filters.keyword"
            clearable
            placeholder="搜索物品名称"
            class="keyword-input"
            @keyup.enter="reload"
          />
        </el-form-item>

        <el-form-item label="使用状态">
          <el-select
            v-model="filters.useStatus"
            clearable
            placeholder="全部状态"
            class="status-select"
          >
            <el-option
              v-for="o in USE_STATUS_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属分类">
          <el-select
            v-model="filters.categoryId"
            clearable
            placeholder="全部分类"
            class="category-select"
          >
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所在房间">
          <el-input
            v-model="filters.room"
            clearable
            placeholder="例如：卧室"
            class="room-input"
            @keyup.enter="reload"
          />
        </el-form-item>

        <el-form-item class="filter-actions">
          <el-button type="primary" @click="reload">查询</el-button>
          <el-button class="reset-button" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <!-- 物品列表 -->
    <section class="panel list-panel">
      <div class="list-heading">
        <div>
          <h3>我的物品</h3>
          <p>共找到 <strong>{{ total }}</strong> 件物品</p>
        </div>
        <div class="list-heading-right">
          <span class="list-status-dot"></span>
          <span>物品列表</span>
        </div>
      </div>

      <el-table
        :data="rows"
        class="items-table"
        row-class-name="item-row"
        :header-cell-style="{
          background: '#f8f9fc',
          color: '#8994a8',
          fontWeight: '600',
          height: '48px'
        }"
      >
        <!-- 物品信息 -->
        <el-table-column label="物品信息" min-width="230">
          <template #default="{ row }">
            <div class="item-info">
              <el-image
                v-if="imageMap[row.id]"
                :src="imageMap[row.id]"
                :preview-src-list="[imageMap[row.id]]"
                preview-teleported
                fit="cover"
                class="item-image"
              />
              <div v-else class="item-image image-placeholder">
                <span>▦</span>
              </div>

              <div class="item-text">
                <div class="item-name" :title="row.name">{{ row.name }}</div>
                <div class="item-id">ID: {{ row.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 分类 -->
        <el-table-column label="所属分类" min-width="115">
          <template #default="{ row }">
            <span class="category-text">
              {{ categoryName(row.categoryId) }}
            </span>
          </template>
        </el-table-column>

        <!-- 房间 -->
        <el-table-column label="所在房间" min-width="110">
          <template #default="{ row }">
            <div class="location-text">
              <span class="location-icon">⌖</span>
              {{ row.room || '暂未设置' }}
            </div>
          </template>
        </el-table-column>

        <!-- 具体位置 -->
        <el-table-column label="具体位置" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="detail-position">
              {{ row.detailPosition || '暂未设置' }}
            </span>
          </template>
        </el-table-column>

        <!-- 状态 -->
        <el-table-column label="使用状态" min-width="105">
          <template #default="{ row }">
            <el-tag
              :type="useStatusTagType(row.useStatus)"
              effect="light"
              round
              class="status-tag"
            >
              {{ useStatusLabel(row.useStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column label="添加时间" min-width="145">
          <template #default="{ row }">
            <span class="time-text">{{ formatDateTime(row.createTime) }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="175" fixed="right">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button link type="primary" @click="openImages(row)">
                图片
              </el-button>
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
          <el-empty :image-size="100" description="暂时没有找到物品">
            <el-button type="primary" plain @click="resetFilters">
              清除筛选条件
            </el-button>
          </el-empty>
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <div class="pagination-note">
          显示当前页物品，共 {{ total }} 件
        </div>

        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="load"
          @size-change="reload"
        />
      </div>
    </section>

    <!-- 原有弹窗，保留业务逻辑 -->
    <ItemFormDialog
      ref="formDialog"
      :categories="categories"
      @saved="load"
    />
    <ItemImagesDialog ref="imagesDialog" />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchItems, deleteItem } from '@/api/items'
import { listImages } from '@/api/images'
import { listCategories } from '@/api/categories'
import ItemFormDialog from '@/components/ItemFormDialog.vue'
import ItemImagesDialog from '@/components/ItemImagesDialog.vue'
import {
  USE_STATUS_OPTIONS,
  useStatusLabel,
  useStatusTagType,
  formatDateTime,
  imageUrl
} from '@/utils/format'

const rows = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)
const imagesLoading = ref(false)
const imageMap = reactive({})
const categories = ref([])

const filters = reactive({
  keyword: '',
  useStatus: '',
  categoryId: null,
  room: ''
})

const formDialog = ref()
const imagesDialog = ref()
const route = useRoute()

function categoryName(categoryId) {
  if (!categoryId) return '—'
  return categories.value.find((c) => c.id === categoryId)?.name ?? `#${categoryId}`
}

async function load() {
  loading.value = true

  try {
    const params = {
      page: page.value - 1,
      size: size.value
    }

    if (filters.keyword?.trim()) params.keyword = filters.keyword.trim()
    if (filters.useStatus) params.useStatus = filters.useStatus
    if (filters.categoryId) params.categoryId = filters.categoryId
    if (filters.room?.trim()) params.room = filters.room.trim()

    const data = await searchItems(params)

    rows.value = data.content
    total.value = data.totalElements

    loadImages()
  } catch {
    // 请求拦截器统一处理错误
  } finally {
    loading.value = false
  }
}

async function loadImages() {
  Object.keys(imageMap).forEach((key) => delete imageMap[key])

  const ids = rows.value.map((row) => row.id)
  if (!ids.length) return

  imagesLoading.value = true

  try {
    await Promise.allSettled(
      ids.map(async (id) => {
        const imgs = await listImages(id)
        if (imgs?.length) {
          imageMap[id] = imageUrl(imgs[0].imagePath)
        }
      })
    )
  } finally {
    imagesLoading.value = false
  }
}

function reload() {
  page.value = 1
  load()
}

function resetFilters() {
  filters.keyword = ''
  filters.useStatus = ''
  filters.categoryId = null
  filters.room = ''
  reload()
}

function openCreate() {
  formDialog.value.open(null)
}

function openEdit(row) {
  formDialog.value.open(row)
}

function openImages(row) {
  imagesDialog.value.open(row)
}

async function removeRow(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除「${row.name}」吗？其全部图片将一并删除。`,
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
    await deleteItem(row.id)
    ElMessage.success('已删除')

    delete imageMap[row.id]

    if (rows.value.length === 1 && page.value > 1) {
      page.value -= 1
    }

    load()
  } catch {
    // 请求拦截器统一处理错误
  }
}

// 读取路由查询参数并写入筛选表单；Number() 转换保证与
// 下拉选项的数值型 id 匹配（字符串会导致下拉框不回显）
function applyRouteQuery() {
  const queryCategoryId = Number(route.query.categoryId)
  if (Number.isInteger(queryCategoryId) && queryCategoryId > 0) {
    filters.categoryId = queryCategoryId
  } else {
    // 路由不带 categoryId（如侧边栏直接进入物品管理）时恢复全部
    filters.categoryId = null
  }
}

onMounted(async () => {
  applyRouteQuery()
  load()

  try {
    categories.value = await listCategories()
  } catch {
    // 分类加载失败不影响物品列表
  }
})

// 组件被路由复用时（已打开过物品页，再从分类管理跳转
// /items?categoryId=X）onMounted 不会再次触发，
// 用 watch 监听查询参数变化，立即应用新条件并刷新列表
watch(
  () => route.query.categoryId,
  () => {
    applyRouteQuery()
    reload() // reload = 页码归 1 + load，避免旧页码下新条件查空
  }
)
</script>

<style scoped>
.items-page {
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

.button-plus {
  margin-right: 5px;
  font-size: 18px;
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
  background: linear-gradient(110deg, #ffffff, #f6f7ff);
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

.hint-dot,
.list-status-dot {
  width: 7px;
  height: 7px;
  display: inline-block;
  flex-shrink: 0;
  border-radius: 50%;
  background: #46c69a;
}

/* 通用卡片 */
.panel {
  overflow: hidden;
  margin-bottom: 19px;
  border: 1px solid #e9edf4;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(34, 54, 89, 0.025);
}

.panel-heading,
.list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #f0f2f6;
}

.panel-heading h3,
.list-heading h3 {
  margin: 0;
  color: #293956;
  font-size: 15px;
  font-weight: 750;
}

.panel-heading p,
.list-heading p {
  margin: 6px 0 0;
  color: #9ba6b8;
  font-size: 11px;
}

.filter-decoration {
  color: #a7b2c8;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1.3px;
}

/* 筛选表单 */
.filter-form {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 2px 10px;
  padding: 18px 22px 5px;
}

.filter-form :deep(.el-form-item) {
  margin-right: 5px;
  margin-bottom: 13px;
}

.filter-form :deep(.el-form-item__label) {
  padding-bottom: 7px;
  color: #7f8ba1;
  font-size: 12px;
}

.filter-form :deep(.el-input__wrapper),
.filter-form :deep(.el-select__wrapper) {
  min-height: 37px;
  border-radius: 8px;
  background: #f8f9fc;
  box-shadow: 0 0 0 1px #edf0f5 inset;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.filter-form :deep(.el-input__wrapper:hover),
.filter-form :deep(.el-select__wrapper:hover) {
  background: #fff;
  box-shadow: 0 0 0 1px #d9e0f5 inset;
}

.filter-form :deep(.el-input__wrapper.is-focus),
.filter-form :deep(.el-select__wrapper.is-focused) {
  background: #fff;
  box-shadow: 0 0 0 1px #7890ed inset !important;
}

.keyword-input {
  width: 190px;
}

.status-select {
  width: 135px;
}

.category-select {
  width: 150px;
}

.room-input {
  width: 135px;
}

.filter-actions {
  margin-left: auto;
}

.filter-actions :deep(.el-button) {
  height: 37px;
  padding: 0 17px;
  border-radius: 8px;
}

.filter-actions :deep(.el-button--primary) {
  border: none;
  background: #5d79e9;
}

.filter-actions :deep(.el-button--primary:hover) {
  background: #4969df;
}

.reset-button {
  color: #7e8ba1;
  border-color: #e7eaf1;
  background: #fff;
}

.reset-button:hover {
  color: #5d79e9;
  border-color: #cdd7fa;
  background: #f7f8ff;
}

/* 列表标题 */
.list-heading {
  min-height: 65px;
  box-sizing: border-box;
}

.list-heading p strong {
  color: #5e78e6;
  font-weight: 700;
}

.list-heading-right {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #9aa5b7;
  font-size: 11px;
}

/* 表格 */
.items-table {
  width: 100%;
}

.items-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.items-table :deep(th.el-table__cell) {
  border-bottom: 1px solid #edf0f5;
}

.items-table :deep(td.el-table__cell) {
  height: 78px;
  border-bottom: 1px solid #f0f2f6;
  transition: background 0.15s ease;
}

.items-table :deep(.el-table__row:hover > td.el-table__cell) {
  background: #f8f9ff !important;
}

.items-table :deep(.cell) {
  padding-right: 13px;
  padding-left: 16px;
  font-size: 12px;
}

.items-table :deep(.el-table__fixed-right::before) {
  display: none;
}

/* 物品信息 */
.item-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.item-image {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #f2f4fa;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca9c0;
  font-size: 22px;
  border: 1px solid #edf0f5;
}

.item-text {
  min-width: 0;
}

.item-name {
  overflow: hidden;
  color: #34435e;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-id {
  margin-top: 6px;
  color: #a5afbf;
  font-size: 10px;
}

.category-text {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 6px;
  background: #f2f4fb;
  color: #7887a2;
  font-size: 11px;
}

.location-text {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #74839b;
  font-size: 12px;
}

.location-icon {
  color: #9da9bd;
  font-size: 16px;
}

.detail-position {
  color: #8b98ad;
  font-size: 12px;
}

.status-tag {
  border: none;
  font-size: 11px;
}

.time-text {
  color: #98a4b6;
  font-size: 11px;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 1px;
}

.row-actions :deep(.el-button) {
  padding: 5px 4px;
  font-size: 12px;
}

.row-actions :deep(.el-button:hover) {
  background: #f4f6ff;
  border-radius: 5px;
}

/* 分页 */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  min-height: 65px;
  padding: 10px 20px;
  border-top: 1px solid #f0f2f6;
}

.pagination-note {
  color: #a1acbd;
  font-size: 11px;
}

.pagination-container :deep(.el-pagination) {
  --el-pagination-button-bg-color: #f4f6fb;
  --el-pagination-hover-color: #5d79e9;
  font-weight: 500;
}

.pagination-container :deep(.el-pager li.is-active) {
  background: #5d79e9;
}

/* 小屏适配 */
@media (max-width: 1100px) {
  .filter-form {
    gap: 0 5px;
  }

  .filter-actions {
    margin-left: 0;
  }

  .keyword-input {
    width: 165px;
  }
}

@media (max-width: 760px) {
  .page-heading {
    align-items: flex-start;
  }

  .page-title {
    font-size: 21px;
  }

  .page-description {
    max-width: 230px;
    line-height: 1.6;
  }

  .create-button {
    flex-shrink: 0;
    padding: 0 12px;
  }

  .overview-strip {
    padding: 13px 15px;
  }

  .overview-hint,
  .overview-divider {
    display: none;
  }

  .panel-heading,
  .list-heading {
    padding: 16px;
  }

  .filter-form {
    display: block;
    padding: 16px 16px 5px;
  }

  .filter-form :deep(.el-form-item) {
    display: flex;
    margin-right: 0;
  }

  .filter-form :deep(.el-form-item__content) {
    flex: 1;
    min-width: 0;
  }

  .keyword-input,
  .status-select,
  .category-select,
  .room-input {
    width: 100%;
  }

  .filter-actions {
    margin-left: 0;
  }

  .filter-actions :deep(.el-form-item__content) {
    justify-content: flex-end;
  }

  .pagination-container {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px 16px;
  }

  .pagination-container :deep(.el-pagination) {
    flex-wrap: wrap;
    height: auto;
    row-gap: 8px;
  }
}

@media (max-width: 420px) {
  .page-heading {
    gap: 10px;
  }

  .page-description {
    font-size: 12px;
  }

  .create-button {
    height: 38px;
    font-size: 12px;
  }

  .filter-decoration,
  .list-heading-right {
    display: none;
  }
}
</style>
