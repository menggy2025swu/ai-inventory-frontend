import request from '@/utils/request'

// GET /api/items/{itemId}/images → List<ItemImageResponse{id, imagePath, createTime}>
export function listImages(itemId) {
  return request.get(`/api/items/${itemId}/images`)
}

// POST /api/items/{itemId}/images → 201 ItemImageResponse
// multipart 字段名必须是 file；Content-Type 由浏览器自动设置为
// multipart/form-data; boundary=...（Content-Type 在 CORS 白名单内）
export function uploadImage(itemId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`/api/items/${itemId}/images`, formData)
}

// DELETE /api/items/{itemId}/images/{imageId} → 204（同步删除磁盘文件）
export function deleteImage(itemId, imageId) {
  return request.delete(`/api/items/${itemId}/images/${imageId}`)
}
