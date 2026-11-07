```vue
<template>
  <el-dialog
    v-model="visible"
    width="640px"
    :close-on-click-modal="false"
    class="item-dialog"
    destroy-on-close="false"
    @closed="resetValidation"
  >
    <template #header>
      <div class="dialog-heading">
        <div class="heading-icon">
          <el-icon :size="22"><Box /></el-icon>
        </div>
        <div class="heading-text">
          <div class="dialog-title">{{ isEdit ? '编辑物品' : '添加新物品' }}</div>
          <div class="dialog-subtitle">
            {{ isEdit ? '更新物品信息，让每件物品都有迹可循' : '记录你的物品信息，以便日后轻松管理和查找' }}
          </div>
        </div>
      </div>
    </template>

    <div class="dialog-content">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="item-form"
      >
        <!-- 基础信息 -->
        <div class="form-section">
          <div class="section-heading">
            <span class="section-dot purple"></span>
            <span>基础信息</span>
            <span class="section-desc">物品的基本资料</span>
          </div>

          <el-form-item label="物品名称" prop="name">
            <el-input
              v-model="form.name"
              maxlength="100"
              show-word-limit
              placeholder="例如：罗技蓝牙键盘"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><Box /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="所属分类" prop="categoryId">
            <el-select
              v-model="form.categoryId"
              clearable
              filterable
              placeholder="选择一个分类（可选）"
              style="width: 100%"
              size="large"
            >
              <el-option
                v-for="c in categories"
                :key="c.id"
                :label="c.name"
                :value="c.id"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-divider />

        <!-- 存放信息 -->
        <div class="form-section">
          <div class="section-heading">
            <span class="section-dot blue"></span>
            <span>存放信息</span>
            <span class="section-desc">记住物品放在哪里</span>
          </div>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="所在房间" prop="room">
                <el-input
                  v-model="form.room"
                  maxlength="50"
                  placeholder="例如：卧室"
                  size="large"
                  clearable
                >
                  <template #prefix>
                    <el-icon><House /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="具体位置" prop="detailPosition">
                <el-input
                  v-model="form.detailPosition"
                  maxlength="100"
                  placeholder="例如：衣柜第二层"
                  size="large"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Location /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <!-- 使用信息 -->
        <div class="form-section">
          <div class="section-heading">
            <span class="section-dot green"></span>
            <span>使用信息</span>
            <span class="section-desc">了解物品的使用情况</span>
          </div>

          <el-form-item label="当前使用状态" prop="useStatus">
            <el-radio-group v-model="form.useStatus" class="status-group">
              <el-radio-button
                v-for="o in USE_STATUS_OPTIONS"
                :key="o.value"
                :value="o.value"
              >
                {{ o.label }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="最后使用日期" prop="lastUseDate">
            <el-date-picker
              v-model="form.lastUseDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择最后使用日期（可选）"
              style="width: 100%"
              size="large"
              clearable
            />
          </el-form-item>
        </div>

        <el-divider />

        <!-- 保修信息 -->
        <div class="form-section">
          <div class="section-heading">
            <span class="section-dot orange"></span>
            <span>保修信息</span>
            <span class="section-desc">可选填写</span>
          </div>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="保修开始日期" prop="warrantyStartDate">
                <el-date-picker
                  v-model="form.warrantyStartDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="开始日期"
                  style="width: 100%"
                  size="large"
                  clearable
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="保修结束日期" prop="warrantyEndDate">
                <el-date-picker
                  v-model="form.warrantyEndDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="结束日期"
                  style="width: 100%"
                  size="large"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="保修备注" prop="warrantyRemark">
            <el-input
              v-model="form.warrantyRemark"
              type="textarea"
              :rows="3"
              maxlength="500"
              show-word-limit
              placeholder="例如：官方保修一年，保修凭证存放在抽屉里"
              resize="none"
            />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <div class="footer-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>物品名称为必填项，其余信息可按需填写</span>
        </div>

        <div class="footer-actions">
          <el-button class="cancel-btn" @click="visible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            class="save-btn"
            :loading="saving"
            @click="save"
          >
            {{ isEdit ? '保存修改' : '创建物品' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Box,
  House,
  Location,
  InfoFilled
} from '@element-plus/icons-vue'
import { createItem, updateItem } from '@/api/items'
import { USE_STATUS_OPTIONS } from '@/utils/format'

defineProps({
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['saved'])

const visible = ref(false)
const saving = ref(false)
const isEdit = ref(false)
const editingId = ref(null)
const formRef = ref()

const form = reactive({
  name: '',
  categoryId: null,
  room: '',
  detailPosition: '',
  useStatus: 'NORMAL',
  lastUseDate: null,
  warrantyStartDate: null,
  warrantyEndDate: null,
  warrantyRemark: ''
})

// 与后端 DTO 约束一致
const rules = {
  name: [
    { required: true, message: '物品名称不能为空', trigger: 'blur' },
    { max: 100, message: '物品名称不能超过100个字符', trigger: 'blur' }
  ],
  room: [
    { max: 50, message: '房间名称不能超过50个字符', trigger: 'blur' }
  ],
  detailPosition: [
    { max: 100, message: '存放位置不能超过100个字符', trigger: 'blur' }
  ],
  warrantyRemark: [
    { max: 500, message: '保修备注不能超过500个字符', trigger: 'blur' }
  ]
}

function open(item) {
  isEdit.value = !!item
  editingId.value = item?.id ?? null

  form.name = item?.name ?? ''
  form.categoryId = item?.categoryId ?? null
  form.room = item?.room ?? ''
  form.detailPosition = item?.detailPosition ?? ''
  form.useStatus = item?.useStatus ?? 'NORMAL'
  form.lastUseDate = item?.lastUseDate ?? null
  form.warrantyStartDate = item?.warrantyStartDate ?? null
  form.warrantyEndDate = item?.warrantyEndDate ?? null
  form.warrantyRemark = item?.warrantyRemark ?? ''

  visible.value = true
}

function resetValidation() {
  formRef.value?.clearValidate()
}

function buildPayload() {
  return {
    name: form.name.trim(),
    categoryId: form.categoryId ?? null,
    room: form.room?.trim() || null,
    detailPosition: form.detailPosition?.trim() || null,
    useStatus: form.useStatus || null,
    lastUseDate: form.lastUseDate || null,
    warrantyStartDate: form.warrantyStartDate || null,
    warrantyEndDate: form.warrantyEndDate || null,
    warrantyRemark: form.warrantyRemark?.trim() || null
  }
}

async function save() {
  if (saving.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  // 避免名称只包含空格
  if (!form.name.trim()) {
    formRef.value?.validateField('name')
    return
  }

  saving.value = true

  try {
    if (isEdit.value) {
      await updateItem(editingId.value, buildPayload())
      ElMessage.success('物品已保存')
    } else {
      await createItem(buildPayload())
      ElMessage.success('物品已创建')
    }

    visible.value = false
    emit('saved')
  } catch {
    // 响应拦截器统一处理错误
  } finally {
    saving.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
/* 弹窗内容 */
.dialog-content {
  padding: 0 4px;
}

.dialog-heading {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 4px 0 8px;
}

.heading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 14px;
  color: #6558e8;
  background: #f0eeff;
}

.heading-text {
  min-width: 0;
}

.dialog-title {
  color: #263653;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.dialog-subtitle {
  margin-top: 5px;
  color: #98a5ba;
  font-size: 12px;
  line-height: 1.5;
}

/* 表单分区 */
.form-section {
  padding: 5px 0 2px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 19px;
  color: #344563;
  font-size: 14px;
  font-weight: 700;
}

.section-desc {
  margin-left: 2px;
  color: #a2aec0;
  font-size: 12px;
  font-weight: 400;
}

.section-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

.section-dot.purple {
  background: #8173f5;
  box-shadow: 0 0 0 4px #f0eeff;
}

.section-dot.blue {
  background: #5596f5;
  box-shadow: 0 0 0 4px #edf4ff;
}

.section-dot.green {
  background: #31bd98;
  box-shadow: 0 0 0 4px #e9f9f4;
}

.section-dot.orange {
  background: #efa94e;
  box-shadow: 0 0 0 4px #fff5e7;
}

/* 表单控件 */
.item-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.item-form :deep(.el-form-item__label) {
  padding-bottom: 7px;
  color: #52627d;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}

.item-form :deep(.el-input__wrapper),
.item-form :deep(.el-select__wrapper) {
  min-height: 42px;
  border-radius: 9px;
  box-shadow: 0 0 0 1px #e8edf5 inset;
  transition: box-shadow 0.2s ease;
}

.item-form :deep(.el-input__wrapper:hover),
.item-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px #b8b1ff inset;
}

.item-form :deep(.el-input__wrapper.is-focus),
.item-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #8173f5 inset !important;
}

.item-form :deep(.el-input__inner),
.item-form :deep(.el-select__placeholder) {
  color: #344563;
  font-size: 13px;
}

.item-form :deep(.el-input__prefix-inner) {
  color: #a0a9bb;
}

.item-form :deep(.el-date-editor) {
  width: 100%;
}

.item-form :deep(.el-date-editor .el-input__wrapper) {
  width: 100%;
}

.item-form :deep(.el-textarea__inner) {
  padding: 11px 13px;
  border: 0;
  border-radius: 9px;
  box-shadow: 0 0 0 1px #e8edf5 inset;
  font-size: 13px;
  line-height: 1.6;
}

.item-form :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #8173f5 inset;
}

.item-form :deep(.el-divider) {
  margin: 19px 0;
  border-color: #edf0f6;
}

/* 状态选择 */
.status-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-group :deep(.el-radio-button__inner) {
  padding: 9px 17px;
  border: 1px solid #e8edf5 !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  color: #687893;
  font-size: 13px;
  transition: all 0.2s ease;
}

.status-group :deep(.el-radio-button:first-child .el-radio-button__inner),
.status-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 8px !important;
}

.status-group :deep(.el-radio-button__inner:hover) {
  color: #7165ed;
}

.status-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  border-color: #8173f5 !important;
  background: #f1efff;
  color: #6c5ce7;
  box-shadow: none !important;
}

/* 底部操作区 */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 5px;
}

.footer-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #a1adbf;
  font-size: 11px;
}

.footer-tip .el-icon {
  flex-shrink: 0;
  font-size: 14px;
}

.footer-actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}

.cancel-btn,
.save-btn {
  height: 38px;
  min-width: 90px;
  border-radius: 9px;
  font-weight: 600;
}

.cancel-btn {
  border-color: #e7ebf3;
  color: #687893;
}

.save-btn {
  border: none;
  background: linear-gradient(135deg, #7165ed, #8b72ed);
  box-shadow: 0 4px 10px rgb(113 101 237 / 20%);
}

.save-btn:hover {
  background: linear-gradient(135deg, #6255df, #7c62df);
}

/* 窄屏适配 */
@media (max-width: 600px) {
  .dialog-heading {
    gap: 11px;
  }

  .heading-icon {
    width: 40px;
    height: 40px;
  }

  .dialog-title {
    font-size: 18px;
  }

  .dialog-subtitle {
    font-size: 11px;
  }

  .section-heading {
    flex-wrap: wrap;
    gap: 8px;
  }

  .section-desc {
    font-size: 11px;
  }

  .item-form :deep(.el-col-12) {
    max-width: 100%;
    flex: 0 0 100%;
  }

  .status-group {
    gap: 7px;
  }

  .status-group :deep(.el-radio-button__inner) {
    padding: 8px 12px;
    font-size: 12px;
  }

  .dialog-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .footer-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .footer-tip {
    font-size: 10px;
  }
}
</style>
```