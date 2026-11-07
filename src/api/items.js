import request from '@/utils/request'

// GET /api/items/search → Spring Page<ItemResponse>
// params: { keyword?, useStatus?, categoryId?, room?, page(从0开始), size(1-100) }
export function searchItems(params) {
  return request.get('/api/items/search', { params })
}

// GET /api/items → 全量 List<ItemResponse>（不分页，仅仪表盘聚合用）
export function listAllItems() {
  return request.get('/api/items')
}

// GET /api/items/{id} → ItemResponse
// （PUT 为全量替换语义，按建议更新前需先取回完整物品再合并提交）
export function getItem(id) {
  return request.get(`/api/items/${id}`)
}

// POST /api/items → 201 ItemResponse
export function createItem(data) {
  return request.post('/api/items', data)
}

// PUT /api/items/{id}（全量替换语义：缺省的可空字段会被置 null）→ 200 ItemResponse
export function updateItem(id, data) {
  return request.put(`/api/items/${id}`, data)
}

// DELETE /api/items/{id} → 204
export function deleteItem(id) {
  return request.delete(`/api/items/${id}`)
}
