<template>
  <el-dialog
    v-model="visible"
    :title="`图片管理${item ? ' · ' + item.name : ''}`"
    width="700px"
    class="image-manager-dialog"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <!-- 上传区域 -->
    <div class="upload-panel">
      <div class="upload-icon">
        <el-icon><Picture /></el-icon>
      </div>

      <div class="upload-content">
        <div class="upload-title">为物品添加图片</div>
        <div class="upload-desc">上传图片，让你的物品信息更加完整</div>
        <div class="upload-tip">
          支持 JPG、JPEG、PNG、WEBP，单张最大 8MB
        </div>
      </div>

      <el-upload
        :show-file-list="false"
        :http-request="doUpload"
        :before-upload="beforeUpload"
        accept=".jpg,.jpeg,.png,.webp"
        :disabled="uploading || !item"
      >
        <el-button type="primary" round :loading="uploading">
          <el-icon><Upload /></el-icon>
          {{ uploading ? '正在上传' : '上传图片' }}
        </el-button>
      </el-upload>
    </div>

    <!-- 图片库标题 -->
    <div class="gallery-header">
      <div class="gallery-heading">
        <span class="gallery-title">图片库</span>
        <span class="image-count">{{ images.length }} 张</span>
      </div>
      <span class="gallery-hint">点击图片可查看大图</span>
    </div>

    <!-- 图片列表 -->
    <div v-loading="loading" class="gallery">
      <div
        v-for="(img, index) in images"
        :key="img.id"
        class="image-card"
      >
        <div class="image-wrapper">
          <el-image
            :src="imageUrl(img.imagePath)"
            :alt="item?.name || '物品图片'"
            :preview-src-list="previewImages"
            :initial-index="index"
            preview-teleported
            fit="cover"
            class="gallery-image"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>图片加载失败</span>
              </div>
            </template>
          </el-image>

          <div class="image-overlay">
            <span class="preview-hint">
              <el-icon><ZoomIn /></el-icon>
              查看大图
            </span>
          </div>
        </div>

        <div class="image-footer">
          <div class="image-info">
            <span class="image-index">图片 {{ index + 1 }}</span>
            <span class="image-time">{{ formatDateTime(img.createTime) }}</span>
          </div>

          <el-button
            link
            type="danger"
            size="small"
            :disabled="deletingId === img.id"
            @click="remove(img)"
          >
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && images.length === 0" class="empty-state">
        <el-empty description="还没有上传图片">
          <template #image>
            <div class="empty-icon-wrapper">
              <el-icon class="empty-icon"><Picture /></el-icon>
            </div>
          </template>
          <div class="empty-desc">
            上传物品照片，方便以后快速识别和查找
          </div>
        </el-empty>
      </div>
    </div>

    <!-- 底部 -->
    <template #footer>
      <div class="dialog-footer">
        <span class="footer-info">
          当前共 {{ images.length }} 张图片
        </span>
        <el-button round @click="visible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Picture,
  Upload,
  Delete,
  ZoomIn
} from '@element-plus/icons-vue'
import {
  listImages,
  uploadImage,
  deleteImage
} from '@/api/images'
import {
  imageUrl,
  formatDateTime
} from '@/utils/format'

const MAX_SIZE = 8 * 1024 * 1024
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp']

const visible = ref(false)
const loading = ref(false)
const uploading = ref(false)
const deletingId = ref(null)
const item = ref(null)
const images = ref([])

// 图片预览地址
const previewImages = computed(() =>
  images.value.map(img => imageUrl(img.imagePath))
)

function open(target) {
  item.value = target
  images.value = []
  visible.value = true
  load()
}

async function load() {
  if (!item.value?.id) return

  loading.value = true
  try {
    images.value = await listImages(item.value.id)
  } catch {
    // 请求拦截器已统一提示
  } finally {
    loading.value = false
  }
}

function beforeUpload(file) {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (!ALLOWED_EXT.includes(ext)) {
    ElMessage.error('仅支持 JPG、JPEG、PNG、WEBP 格式')
    return false
  }

  if (file.size > MAX_SIZE) {
    ElMessage.error('图片不能超过 8MB')
    return false
  }

  return true
}

async function doUpload({ file }) {
  if (uploading.value || !item.value?.id) return

  uploading.value = true
  try {
    await uploadImage(item.value.id, file)
    ElMessage.success('图片上传成功')
    await load()
  } catch {
    // 请求拦截器已统一提示
  } finally {
    uploading.value = false
  }
}

async function remove(img) {
  if (deletingId.value !== null) return

  try {
    await ElMessageBox.confirm(
      '删除后将无法恢复，确定删除这张图片吗？',
      '删除图片',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '暂不删除',
        confirmButtonClass: 'el-button--danger'
      }
    )
  } catch {
    return
  }

  deletingId.value = img.id

  try {
    await deleteImage(item.value.id, img.id)
    ElMessage.success('图片已删除')
    await load()
  } catch {
    // 请求拦截器已统一提示
  } finally {
    deletingId.value = null
  }
}

defineExpose({ open })
</script>

<style scoped>
/* 上传区域 */
.upload-panel {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px;
  margin-bottom: 27px;
  border: 1px dashed #c9d2ff;
  border-radius: 15px;
  background: linear-gradient(120deg, #f3f5ff 0%, #f8f5ff 100%);
  transition: border-color 0.2s ease;
}

.upload-panel:hover {
  border-color: #8993f2;
}

.upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  color: #6475f5;
  background: #e6eaff;
  font-size: 25px;
}

.upload-content {
  flex: 1;
  min-width: 0;
}

.upload-title {
  color: #263657;
  font-size: 15px;
  font-weight: 700;
}

.upload-desc {
  margin-top: 5px;
  color: #71809c;
  font-size: 13px;
  line-height: 1.5;
}

.upload-tip {
  margin-top: 7px;
  color: #9aa6bb;
  font-size: 12px;
}

.upload-panel :deep(.el-button) {
  height: 38px;
  padding: 0 20px;
  border: none;
  background: linear-gradient(135deg, #6379f5, #8170e9);
  box-shadow: 0 5px 12px rgb(99 121 245 / 20%);
}

.upload-panel :deep(.el-button:hover) {
  background: linear-gradient(135deg, #5269ed, #725fe0);
}

.upload-panel :deep(.el-button .el-icon) {
  margin-right: 5px;
}

/* 图片库标题 */
.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.gallery-heading {
  display: flex;
  align-items: center;
  gap: 9px;
}

.gallery-title {
  color: #263657;
  font-size: 16px;
  font-weight: 700;
}

.image-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 25px;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  color: #6576ed;
  background: #eef0ff;
  font-size: 12px;
}

.gallery-hint {
  color: #a0aabe;
  font-size: 12px;
}

/* 图片网格 */
.gallery {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-content: start;
  gap: 16px;
  min-height: 180px;
}

.image-card {
  overflow: hidden;
  border: 1px solid #edf0f6;
  border-radius: 13px;
  background: #fff;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.image-card:hover {
  transform: translateY(-3px);
  border-color: #dfe3fa;
  box-shadow: 0 8px 22px rgb(39 57 91 / 9%);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  background: #f5f7fb;
}

.gallery-image {
  display: block;
  width: 100%;
  height: 145px;
  background: #f5f7fb;
}

.gallery-image :deep(.el-image__inner) {
  transition: transform 0.3s ease;
}

.image-card:hover .gallery-image :deep(.el-image__inner) {
  transform: scale(1.04);
}

.image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(30 39 62 / 0%);
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
}

.image-card:hover .image-overlay {
  background: rgb(30 39 62 / 25%);
  opacity: 1;
}

.preview-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 20px;
  color: #fff;
  background: rgb(255 255 255 / 20%);
  font-size: 12px;
  backdrop-filter: blur(5px);
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 7px;
  width: 100%;
  height: 145px;
  color: #aab3c4;
  font-size: 12px;
}

.image-error .el-icon {
  font-size: 28px;
}

/* 图片底部信息 */
.image-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-height: 48px;
  padding: 0 10px;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.image-index {
  color: #59647a;
  font-size: 11px;
  font-weight: 600;
}

.image-time {
  overflow: hidden;
  color: #a0aabe;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-footer :deep(.el-button) {
  flex-shrink: 0;
  padding: 4px;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  padding: 20px 0;
  text-align: center;
}

.empty-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  margin: 0 auto;
  border-radius: 22px;
  background: #f2f3ff;
}

.empty-icon {
  color: #9ba5df;
  font-size: 35px;
}

.empty-desc {
  margin-top: 5px;
  color: #9aa6bb;
  font-size: 12px;
}

/* 底部 */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.footer-info {
  color: #9aa6bb;
  font-size: 12px;
}

/* 弹窗整体 */
:deep(.el-dialog) {
  overflow: hidden;
  border-radius: 18px;
}

:deep(.el-dialog__header) {
  padding: 22px 24px 17px;
  margin-right: 0;
  border-bottom: 1px solid #f0f2f7;
}

:deep(.el-dialog__title) {
  color: #263657;
  font-size: 17px;
  font-weight: 700;
}

:deep(.el-dialog__body) {
  padding: 22px 24px;
}

:deep(.el-dialog__footer) {
  padding: 14px 24px 20px;
  border-top: 1px solid #f0f2f7;
}

/* 平板和手机 */
@media (max-width: 600px) {
  .upload-panel {
    flex-wrap: wrap;
    gap: 13px;
    padding: 17px;
  }

  .upload-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .upload-content {
    flex: 1 1 calc(100% - 60px);
  }

  .upload-panel :deep(.el-upload) {
    width: 100%;
  }

  .upload-panel :deep(.el-button) {
    width: 100%;
  }

  .gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .gallery-image {
    height: 125px;
  }

  .image-error {
    height: 125px;
  }

  :deep(.el-dialog__header) {
    padding: 18px 17px 14px;
  }

  :deep(.el-dialog__body) {
    padding: 17px;
  }

  :deep(.el-dialog__footer) {
    padding: 12px 17px 16px;
  }
}

@media (max-width: 380px) {
  .gallery {
    grid-template-columns: 1fr;
  }

  .gallery-image {
    height: 190px;
  }

  .image-error {
    height: 190px;
  }

  .gallery-hint {
    font-size: 11px;
  }
}
</style>