
<template>
  <div class="intake-page">
    <!-- 页面标题 -->
    <div class="page-heading">
      <div>
        <div class="eyebrow">AI POWERED · SMART INVENTORY</div>
        <h1>AI 智能录入</h1>
        <p>让 AI 帮你识别物品，自动整理信息，轻松完成入库。</p>
      </div>
      <div class="heading-decoration">
        <div class="decoration-icon">✦</div>
        <span>SMART INTAKE</span>
      </div>
    </div>

    <!-- 步骤提示 -->
    <div class="steps">
      <div class="step active">
        <span class="step-number">01</span>
        <div>
          <strong>提供物品信息</strong>
          <small>上传图片或输入描述</small>
        </div>
      </div>
      <div class="step-line"></div>
      <div class="step" :class="{ active: suggestion }">
        <span class="step-number">02</span>
        <div>
          <strong>AI 智能识别</strong>
          <small>提取物品关键信息</small>
        </div>
      </div>
      <div class="step-line"></div>
      <div class="step" :class="{ active: suggestion }">
        <span class="step-number">03</span>
        <div>
          <strong>确认并入库</strong>
          <small>检查信息后保存</small>
        </div>
      </div>
    </div>

    <!-- 信息输入卡片 -->
    <div class="main-card">
      <div class="card-heading">
        <div>
          <h2>告诉我这是什么物品</h2>
          <p>支持图片识别和文字描述，也可以同时提供以提高准确度。</p>
        </div>
        <span class="ai-badge">✦ AI 智能识别</span>
      </div>

      <el-tabs v-model="activeTab" class="intake-tabs">
        <el-tab-pane name="image">
          <template #label>
            <span class="tab-label">▧ 图片识别</span>
          </template>

          <div class="upload-section">
            <el-upload
              ref="uploadRef"
              class="custom-uploader"
              :auto-upload="false"
              :limit="1"
              :on-change="onFileChange"
              :on-remove="onFileRemove"
              :on-exceed="onFileExceed"
              accept=".jpg,.jpeg,.png,.webp"
              drag
            >
              <div class="upload-content">
                <div class="upload-icon">↑</div>
                <h3>将物品图片拖到这里</h3>
                <p>或者 <span>点击选择图片</span></p>
                <div class="upload-formats">JPG · PNG · WEBP · 最大 8MB</div>
              </div>
              <template #tip>
                <div class="upload-tip">
                  建议上传清晰、主体完整的物品照片，识别效果更好。
                </div>
              </template>
            </el-upload>

            <div v-if="previewUrl" class="preview-panel">
              <div class="preview-top">
                <div>
                  <strong>图片预览</strong>
                  <span>已选择待识别图片</span>
                </div>
                <el-button text type="danger" @click="clearSelectedImage">
                  移除图片
                </el-button>
              </div>
              <img :src="previewUrl" class="preview-image" alt="物品图片预览" />
            </div>
          </div>

          <div class="description-area">
            <div class="field-heading">
              <label>补充描述 <span>选填</span></label>
              <small>提供更多信息，让 AI 识别更准确</small>
            </div>
            <el-input
              v-model="description"
              type="textarea"
              :rows="3"
              maxlength="2000"
              show-word-limit
              placeholder="例如：这是一个罗技蓝牙键盘，黑色，去年购买，目前基本闲置……"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="text">
          <template #label>
            <span class="tab-label">☰ 文字描述</span>
          </template>

          <div class="text-input-panel">
            <div class="text-input-icon">✎</div>
            <h3>用文字描述你的物品</h3>
            <p>告诉 AI 物品的名称、品牌、颜色、状态或存放位置。</p>
            <el-input
              v-model="description"
              type="textarea"
              :rows="7"
              maxlength="2000"
              show-word-limit
              placeholder="例如：去年双十一买的 87 键红轴机械键盘，黑色，放在书房，目前使用频率比较低……"
            />
            <div class="example-text">
              <span>描述小技巧：</span>
              名称 + 品牌 + 外观 + 使用状态 + 存放位置
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="recognize-footer">
        <div class="recognize-hint">
          <span class="hint-dot"></span>
          <span>识别结果仅作为建议，你可以在入库前修改</span>
        </div>
        <el-button
          type="primary"
          size="large"
          class="recognize-button"
          :loading="analyzing"
          @click="recognize"
        >
          <span v-if="!analyzing">✦ 开始 AI 识别</span>
          <span v-else>AI 正在分析...</span>
        </el-button>
      </div>
      <div v-if="analyzing" class="analyzing-tip">
        正在分析物品特征并提取信息，请稍候……
      </div>
    </div>

    <!-- AI 识别结果 -->
    <div v-if="suggestion" class="result-card">
      <div class="result-heading">
        <div class="result-title">
          <div class="result-icon">✦</div>
          <div>
            <h2>AI 识别结果</h2>
            <p>已经为你提取出以下信息，请检查并完善。</p>
          </div>
        </div>
        <span class="result-status">✓ 识别完成</span>
      </div>

      <div class="result-body">
        <div class="result-intro">
          <span class="intro-label">物品信息</span>
          <span class="intro-desc">以下内容均可手动修改</span>
        </div>

        <el-form label-position="top" class="suggest-form">
          <div class="form-grid">
            <el-form-item label="物品名称" class="full-width">
              <el-input
                v-model="form.name"
                maxlength="100"
                show-word-limit
                placeholder="请输入物品名称"
              />
            </el-form-item>

            <el-form-item label="所属分类">
              <el-select
                v-model="form.categoryId"
                clearable
                placeholder="请选择分类"
                style="width: 100%"
              >
                <el-option
                  v-for="c in categoryOptions"
                  :key="String(c.id)"
                  :label="c.name"
                  :value="c.id"
                />
              </el-select>
              <div v-if="aiNewCategory" class="field-tip">
                AI 建议新分类「{{ aiNewCategory }}」，当前不会自动创建分类。
              </div>
            </el-form-item>

            <el-form-item label="使用状态">
              <el-select v-model="form.useStatus" style="width: 100%">
                <el-option label="正常使用" value="NORMAL" />
                <el-option label="闲置" value="IDLE" />
              </el-select>
            </el-form-item>

            <el-form-item label="所在房间">
              <el-input
                v-model="form.room"
                maxlength="50"
                placeholder="例如：卧室、书房"
              />
            </el-form-item>

            <el-form-item label="具体位置">
              <el-input
                v-model="form.detailPosition"
                maxlength="100"
                placeholder="例如：书桌左侧抽屉"
              />
            </el-form-item>
          </div>

          <div
            v-if="suggestion.brand || suggestion.description"
            class="reference-info"
          >
            <div class="reference-icon">i</div>
            <div>
              <strong>AI 补充参考</strong>
              <p>
                {{ [
                  suggestion.brand && `品牌：${suggestion.brand}`,
                  suggestion.description && `描述：${suggestion.description}`
                ].filter(Boolean).join('；') }}
              </p>
              <small>以上内容仅供参考，目前不会保存到物品信息中。</small>
            </div>
          </div>
        </el-form>
      </div>

      <div class="result-footer">
        <el-button @click="suggestion = null">重新识别</el-button>
        <el-button
          type="primary"
          size="large"
          class="save-button"
          :loading="saving"
          @click="confirmSave"
        >
          ✓ 确认入库
        </el-button>
      </div>
    </div>

    <div class="bottom-note">
      <span>✦</span>
      AI 识别结果由模型生成，请在保存前核对关键信息。
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { aiIntake } from '@/api/ai'
import { createItem } from '@/api/items'
import { listCategories } from '@/api/categories'

const AI_NEW = '__ai_new_category__'
const router = useRouter()
const activeTab = ref('image')
const description = ref('')
const imageFile = ref(null)
const previewUrl = ref(null)
const uploadRef = ref()
const analyzing = ref(false)
const saving = ref(false)
const suggestion = ref(null)
const categories = ref([])

const form = reactive({
  name: '',
  categoryId: null,
  room: '',
  detailPosition: '',
  useStatus: 'NORMAL'
})

const aiNewCategory = computed(() =>
  form.categoryId === AI_NEW ? suggestion.value?.categoryName : null
)

const categoryOptions = computed(() => {
  const opts = categories.value.map((c) => ({ id: c.id, name: c.name }))
  if (suggestion.value?.categoryName && !suggestion.value?.matchedCategoryId) {
    opts.push({
      id: AI_NEW,
      name: `AI 建议新分类：${suggestion.value.categoryName}`
    })
  }
  return opts
})

const MAX_SIZE = 8 * 1024 * 1024

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

function clearSelectedImage() {
  imageFile.value = null
  revokePreview()
  uploadRef.value?.clearFiles()
}

function onFileChange(file) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    ElMessage.error('仅支持 jpg / jpeg / png / webp 图片')
    uploadRef.value.clearFiles()
    return
  }
  if (file.size > MAX_SIZE) {
    ElMessage.error('图片不能超过 8MB')
    uploadRef.value.clearFiles()
    return
  }

  revokePreview()
  imageFile.value = file.raw
  previewUrl.value = URL.createObjectURL(file.raw)
}

function onFileRemove() {
  imageFile.value = null
  revokePreview()
}

function onFileExceed(files) {
  uploadRef.value.clearFiles()
  uploadRef.value.handleStart(files[0])
}

onBeforeUnmount(revokePreview)

async function recognize() {
  const hasImage = activeTab.value === 'image' && imageFile.value
  const text = description.value.trim()

  if (!hasImage && !text) {
    ElMessage.warning('请先选择图片或填写文字描述')
    return
  }

  analyzing.value = true
  try {
    const res = await aiIntake({
      image: hasImage ? imageFile.value : null,
      description: text
    })

    suggestion.value = res
    form.name = res.name ?? ''
    form.categoryId = res.matchedCategoryId ?? (res.categoryName ? AI_NEW : null)
    form.room = res.room ?? ''
    form.detailPosition = res.detailPosition ?? ''
    form.useStatus = res.useStatus === 'IDLE' ? 'IDLE' : 'NORMAL'

    ElMessage.success('识别完成，请确认或修改后入库')
  } catch {
    /* 错误由 Axios 响应拦截器统一处理 */
  } finally {
    analyzing.value = false
  }
}

async function confirmSave() {
  if (!form.name.trim()) {
    ElMessage.warning('物品名称不能为空')
    return
  }

  saving.value = true
  try {
    await createItem({
      name: form.name.trim(),
      categoryId: form.categoryId && form.categoryId !== AI_NEW
        ? form.categoryId
        : null,
      room: form.room?.trim() || null,
      detailPosition: form.detailPosition?.trim() || null,
      useStatus: form.useStatus || 'NORMAL',
      lastUseDate: null,
      warrantyStartDate: null,
      warrantyEndDate: null,
      warrantyRemark: null
    })

    ElMessage.success('已成功添加到物品库')
    router.push('/items')
  } catch {
    /* 错误由 Axios 响应拦截器统一处理 */
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    categories.value = await listCategories()
  } catch {
    /* 分类加载失败不影响 AI 识别 */
  }
})
</script>

<style scoped>
.intake-page {
  max-width: 1180px;
  margin: 0 auto;
  padding-bottom: 30px;
  color: #263449;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
}

.eyebrow {
  color: #6685c5;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 9px;
}

.page-heading h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 750;
  letter-spacing: -1px;
  color: #1d2b42;
}

.page-heading p {
  margin: 9px 0 0;
  color: #8491a5;
  font-size: 14px;
}

.heading-decoration {
  width: 145px;
  height: 90px;
  border-radius: 18px;
  background: linear-gradient(135deg, #edf3ff, #e7eaff);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #7890c8;
  font-size: 10px;
  letter-spacing: 2px;
}

.decoration-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.steps {
  display: flex;
  align-items: center;
  padding: 20px 26px;
  margin-bottom: 20px;
  border: 1px solid #edf0f5;
  border-radius: 14px;
  background: #fff;
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #a0aabc;
  flex-shrink: 0;
}

.step-number {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f1f3f7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.step.active {
  color: #496fbd;
}

.step.active .step-number {
  background: #eaf0ff;
  color: #4e76c6;
}

.step strong,
.step small {
  display: block;
}

.step strong {
  font-size: 13px;
  margin-bottom: 4px;
}

.step small {
  font-size: 11px;
  color: #a0aabc;
}

.step-line {
  height: 1px;
  flex: 1;
  min-width: 20px;
  margin: 0 22px;
  background: #e9edf3;
}

.main-card,
.result-card {
  border: 1px solid #edf0f5;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 5px 24px rgba(40, 60, 100, 0.035);
}

.main-card {
  padding: 26px 30px;
}

.card-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.card-heading h2,
.result-heading h2 {
  margin: 0;
  font-size: 18px;
  color: #263449;
  font-weight: 700;
}

.card-heading p,
.result-heading p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #96a1b2;
}

.ai-badge {
  padding: 7px 12px;
  border-radius: 20px;
  background: #f0f3ff;
  color: #627dc1;
  font-size: 12px;
}

.intake-tabs :deep(.el-tabs__header) {
  margin-bottom: 22px;
}

.intake-tabs :deep(.el-tabs__item) {
  height: 44px;
  font-size: 14px;
}

.tab-label {
  padding: 0 5px;
}

.upload-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 20px;
}

.custom-uploader {
  width: 100%;
}

.custom-uploader :deep(.el-upload),
.custom-uploader :deep(.el-upload-dragger) {
  width: 100%;
}

.custom-uploader :deep(.el-upload-dragger) {
  min-height: 205px;
  padding: 24px;
  border: 1px dashed #b8c8e7;
  border-radius: 12px;
  background: #f8faff;
  transition: all 0.2s;
}

.custom-uploader :deep(.el-upload-dragger:hover) {
  border-color: #6689d0;
  background: #f2f6ff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #e8efff;
  color: #6485c8;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 13px;
}

.upload-content h3 {
  margin: 0;
  color: #34445d;
  font-size: 15px;
}

.upload-content p {
  margin: 8px 0;
  color: #9aa5b5;
  font-size: 13px;
}

.upload-content p span {
  color: #6485c8;
  font-weight: 600;
}

.upload-formats {
  margin-top: 6px;
  color: #aab3c1;
  font-size: 11px;
  letter-spacing: 1px;
}

.upload-tip {
  margin-top: 8px;
  color: #a0aabb;
  font-size: 12px;
}

.preview-panel {
  width: 190px;
  flex-shrink: 0;
}

.preview-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.preview-top strong,
.preview-top span {
  display: block;
}

.preview-top strong {
  font-size: 13px;
  color: #34445d;
}

.preview-top span {
  margin-top: 4px;
  font-size: 11px;
  color: #a0aabb;
}

.preview-top :deep(.el-button) {
  padding: 0;
}

.preview-image {
  width: 190px;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #edf0f5;
}

.description-area {
  margin-top: 22px;
}

.field-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.field-heading label {
  font-size: 13px;
  font-weight: 650;
  color: #43516a;
}

.field-heading label span {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 400;
  color: #a3adbb;
}

.field-heading small {
  font-size: 11px;
  color: #a3adbb;
}

.description-area :deep(.el-textarea__inner),
.text-input-panel :deep(.el-textarea__inner) {
  border-radius: 9px;
  box-shadow: none;
  background: #fafbfd;
  padding: 12px 14px;
  line-height: 1.8;
}

.description-area :deep(.el-textarea__inner:focus),
.text-input-panel :deep(.el-textarea__inner:focus) {
  background: #fff;
}

.text-input-panel {
  max-width: 760px;
  padding: 20px 0;
}

.text-input-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #edf2ff;
  color: #6686c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.text-input-panel h3 {
  margin: 16px 0 7px;
  color: #34445d;
  font-size: 16px;
}

.text-input-panel > p {
  margin: 0 0 17px;
  font-size: 13px;
  color: #9aa5b5;
}

.example-text {
  margin-top: 12px;
  color: #9aa5b5;
  font-size: 12px;
}

.example-text span {
  color: #6685c5;
  font-weight: 600;
}

.recognize-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f2f6;
  padding-top: 20px;
  margin-top: 20px;
}

.recognize-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9aa5b5;
  font-size: 12px;
}

.hint-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #83b6a1;
}

.recognize-button,
.save-button {
  border: none;
  border-radius: 9px;
  padding-left: 25px;
  padding-right: 25px;
  background: linear-gradient(110deg, #6388d1, #7b80cb);
  box-shadow: 0 5px 13px rgba(100, 127, 202, 0.2);
}

.recognize-button:hover,
.save-button:hover {
  background: linear-gradient(110deg, #5279c5, #6d72c0);
}

.analyzing-tip {
  margin-top: 12px;
  text-align: right;
  font-size: 12px;
  color: #7189c3;
}

.result-card {
  margin-top: 22px;
  overflow: hidden;
}

.result-heading {
  padding: 23px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8faff;
  border-bottom: 1px solid #edf0f5;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 13px;
}

.result-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e9efff;
  color: #6384c8;
  font-size: 22px;
}

.result-status {
  padding: 6px 11px;
  border-radius: 20px;
  background: #eaf6ef;
  color: #559875;
  font-size: 12px;
}

.result-body {
  padding: 24px 28px;
}

.result-intro {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.intro-label {
  font-size: 14px;
  font-weight: 700;
  color: #34445d;
}

.intro-desc {
  color: #a0aabb;
  font-size: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 22px;
}

.full-width {
  grid-column: 1 / -1;
}

.suggest-form :deep(.el-form-item__label) {
  color: #637087;
  font-size: 13px;
  padding-bottom: 7px;
}

.suggest-form :deep(.el-input__wrapper),
.suggest-form :deep(.el-select__wrapper) {
  min-height: 38px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e9edf3 inset;
}

.suggest-form :deep(.el-input__wrapper.is-focus),
.suggest-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #7897d2 inset;
}

.field-tip {
  margin-top: 7px;
  color: #8b9bc0;
  font-size: 11px;
  line-height: 1.6;
}

.reference-info {
  display: flex;
  gap: 12px;
  padding: 15px;
  border-radius: 10px;
  background: #f7f9fd;
  margin-top: 6px;
}

.reference-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #e5edff;
  color: #6685c5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.reference-info strong {
  color: #566a91;
  font-size: 12px;
}

.reference-info p {
  margin: 6px 0;
  color: #68768c;
  font-size: 12px;
  line-height: 1.7;
}

.reference-info small {
  color: #a1adbd;
  font-size: 11px;
}

.result-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 17px 28px;
  border-top: 1px solid #edf0f5;
  background: #fcfdff;
}

.result-footer > .el-button:not(.save-button) {
  border-radius: 9px;
}

.bottom-note {
  margin-top: 18px;
  text-align: center;
  color: #a4adba;
  font-size: 11px;
}

.bottom-note span {
  color: #8b9fd0;
  margin-right: 5px;
}

@media (max-width: 760px) {
  .page-heading {
    align-items: flex-start;
  }

  .heading-decoration {
    display: none;
  }

  .steps {
    padding: 16px 12px;
  }

  .step {
    gap: 6px;
  }

  .step-number {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }

  .step strong {
    font-size: 11px;
  }

  .step small {
    display: none;
  }

  .step-line {
    margin: 0 8px;
  }

  .main-card {
    padding: 20px 16px;
  }

  .card-heading {
    gap: 10px;
  }

  .ai-badge {
    white-space: nowrap;
  }

  .upload-section {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    width: 100%;
  }

  .preview-image {
    width: 100%;
    height: 190px;
  }

  .recognize-footer {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
  }

  .recognize-button {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .result-heading,
  .result-body {
    padding: 20px 16px;
  }

  .result-footer {
    padding: 15px 16px;
  }

  .field-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
