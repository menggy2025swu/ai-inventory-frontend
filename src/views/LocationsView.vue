<template>
  <div class="locations-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">位置管理</h2>
        <p class="page-description">管理物品的存放位置，让每件物品都有迹可循</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openCreate">
        新增位置
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="summary-card">
      <div class="summary-icon">
        <el-icon><Location /></el-icon>
      </div>
      <div class="summary-content">
        <span class="summary-label">常用位置</span>
        <div class="summary-value">{{ rows.length }}</div>
      </div>
    </div>

    <!-- 位置列表 -->
    <el-card class="content-card" shadow="never">
      <div class="section-header">
        <div>
          <h3 class="section-title">位置列表</h3>
          <p class="section-description">查看和维护你的物品存放位置</p>
        </div>
        <span class="total-count">共 {{ rows.length }} 个位置</span>
      </div>

      <el-table
        :data="rows"
        v-loading="loading"
        class="location-table"
        row-class-name="location-row"
      >
        <el-table-column label="房间" min-width="160">
          <template #default="{ row }">
            <div class="room-cell">
              <div class="room-icon">
                <el-icon><House /></el-icon>
              </div>
              <span class="room-name">{{ row.room }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="具体位置" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="detail-position">
              <el-icon><MapLocation /></el-icon>
              {{ row.detailPosition || '未填写具体位置' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-text">{{ formatDateTime(row.createTime) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
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
          <el-empty description="暂无常用位置，新增一个位置开始管理吧">
            <el-button type="primary" @click="openCreate">新增位置</el-button>
          </el-empty>
        </template>
      </el-table>
    </el-card>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      v-model="visible"
      :title="isEdit ? '编辑位置' : '新增位置'"
      width="460px"
      :close-on-click-modal="false"
      class="location-dialog"
      @closed="resetForm"
    >
      <div class="dialog-description">
        {{ isEdit ? '修改位置名称或具体存放地点' : '添加一个常用位置，方便记录物品存放地点' }}
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="location-form"
      >
        <el-form-item label="房间名称" prop="room">
          <el-input
            v-model="form.room"
            maxlength="50"
            show-word-limit
            placeholder="例如：卧室、书房、客厅"
            :prefix-icon="House"
            clearable
          />
        </el-form-item>

        <el-form-item label="具体位置" prop="detailPosition">
          <el-input
            v-model="form.detailPosition"
            maxlength="100"
            show-word-limit
            placeholder="例如：衣柜第二层、书桌抽屉（可留空）"
            :prefix-icon="MapLocation"
            clearable
          />
          <div class="form-tip">可以填写柜子、抽屉、架子等更具体的位置</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="save">
            {{ isEdit ? '保存修改' : '创建位置' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Location,
  House,
  MapLocation
} from '@element-plus/icons-vue'
import {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation
} from '@/api/locations'
import { formatDateTime } from '@/utils/format'

const rows = ref([])
const loading = ref(false)
const visible = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref()

const form = reactive({
  room: '',
  detailPosition: ''
})

// 与后端 Create/UpdateLocationRequest 保持一致
const rules = {
  room: [
    { required: true, message: '房间名称不能为空', trigger: 'blur' },
    { max: 50, message: '房间名称不能超过50个字符', trigger: 'blur' }
  ],
  detailPosition: [
    { max: 100, message: '存放位置不能超过100个字符', trigger: 'blur' }
  ]
}

async function load() {
  loading.value = true
  try {
    rows.value = await listLocations()
  } catch {
    // 请求拦截器已统一提示
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formRef.value?.clearValidate()
}

function openCreate() {
  isEdit.value = false
  editingId.value = null
  form.room = ''
  form.detailPosition = ''
  visible.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingId.value = row.id
  form.room = row.room ?? ''
  form.detailPosition = row.detailPosition ?? ''
  visible.value = true
}

// PUT 为全量替换语义：空的具体位置统一归一为 null
function buildPayload() {
  return {
    room: form.room.trim(),
    detailPosition: form.detailPosition?.trim() || null
  }
}

async function save() {
  if (saving.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  // 防止房间名称只有空格
  if (!form.room.trim()) {
    formRef.value?.validateField('room')
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await updateLocation(editingId.value, buildPayload())
      ElMessage.success('位置已更新')
    } else {
      await createLocation(buildPayload())
      ElMessage.success('位置已创建')
    }

    visible.value = false
    await load()
  } catch {
    // 请求拦截器已统一提示
  } finally {
    saving.value = false
  }
}

async function removeRow(row) {
  const label = row.detailPosition
    ? `${row.room} · ${row.detailPosition}`
    : row.room

  try {
    await ElMessageBox.confirm(
      `确定删除位置「${label}」吗？不会影响已录入的物品。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )
  } catch {
    return
  }

  try {
    await deleteLocation(row.id)
    ElMessage.success('位置已删除')
    await load()
  } catch {
    // 请求拦截器已统一提示
  }
}

onMounted(load)
</script>

<style scoped>
.locations-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  margin: 0;
  color: #252b3b;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.page-description {
  margin: 8px 0 0;
  color: #9299a9;
  font-size: 13px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  width: fit-content;
  min-width: 190px;
  padding: 18px 24px;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 14px;
  box-shadow: 0 3px 12px rgb(38 49 77 / 3%);
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  color: #6875e8;
  background: #eef0ff;
  border-radius: 12px;
  font-size: 22px;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  color: #9299a9;
  font-size: 12px;
}

.summary-value {
  color: #252b3b;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.2;
}

.content-card {
  border: 1px solid #edf0f5;
  border-radius: 14px;
}

.content-card :deep(.el-card__body) {
  padding: 22px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  color: #303748;
  font-size: 16px;
  font-weight: 650;
}

.section-description {
  margin: 6px 0 0;
  color: #a0a6b4;
  font-size: 12px;
}

.total-count {
  flex-shrink: 0;
  padding: 6px 11px;
  color: #6875d9;
  background: #f0f1ff;
  border-radius: 20px;
  font-size: 12px;
}

.location-table {
  width: 100%;
}

.location-table :deep(th.el-table__cell) {
  height: 48px;
  color: #7f8798;
  background: #f8f9fc;
  font-size: 12px;
  font-weight: 600;
}

.location-table :deep(td.el-table__cell) {
  height: 62px;
  color: #50596b;
  border-bottom-color: #f0f1f5;
}

.location-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.room-cell {
  display: flex;
  align-items: center;
  gap: 11px;
}

.room-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  color: #6875dc;
  background: #f0f1ff;
  border-radius: 9px;
  font-size: 17px;
}

.room-name {
  color: #343b4c;
  font-size: 13px;
  font-weight: 600;
}

.detail-position {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #687184;
  font-size: 13px;
}

.detail-position :deep(.el-icon) {
  color: #a1a8b7;
}

.time-text {
  color: #9299a9;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-description {
  margin-bottom: 22px;
  color: #9097a7;
  font-size: 13px;
  line-height: 1.6;
}

.location-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.location-form :deep(.el-form-item__label) {
  padding-bottom: 8px;
  color: #424a5b;
  font-size: 13px;
  font-weight: 600;
}

.location-form :deep(.el-input__wrapper) {
  min-height: 40px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e8eaf0 inset;
}

.location-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #7b83e8 inset;
}

.form-tip {
  margin-top: 7px;
  color: #a1a7b4;
  font-size: 11px;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-footer .el-button {
  min-width: 90px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .locations-page {
    gap: 16px;
  }

  .page-title {
    font-size: 21px;
  }

  .page-header {
    align-items: flex-start;
  }

  .page-header .el-button {
    flex-shrink: 0;
  }

  .summary-card {
    width: 100%;
  }

  .content-card :deep(.el-card__body) {
    padding: 16px;
  }

  .section-header {
    margin-bottom: 14px;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
  }

  .page-header .el-button {
    width: 100%;
  }

  .section-description {
    max-width: 220px;
    line-height: 1.5;
  }

  .total-count {
    font-size: 11px;
  }

  .content-card :deep(.el-card__body) {
    padding: 12px;
  }
}
</style>
