import request from '@/utils/request'

// GET /api/categories → List<CategoryResponse{id, name, createTime}>
export function listCategories() {
  return request.get('/api/categories')
}

// POST /api/categories，body: {name}（≤50，必填）→ 201 CategoryResponse
// config 可传 { skipErrorToast: true } 关闭统一错误提示（批量导入场景）
export function createCategory(data, config) {
  return request.post('/api/categories', data, config)
}

// PUT /api/categories/{id}，body: {name}（全量替换；404=不存在或他人分类）
export function updateCategory(id, data) {
  return request.put(`/api/categories/${id}`, data)
}

// DELETE /api/categories/{id} → 204；
// 404=不存在或他人分类；409=仍被物品引用（页面需拦截提示）
export function deleteCategory(id) {
  return request.delete(`/api/categories/${id}`)
}
