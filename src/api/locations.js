import request from '@/utils/request'

// GET /api/locations → List<LocationResponse{id, room, detailPosition, createTime}>
export function listLocations() {
  return request.get('/api/locations')
}

// POST /api/locations，body: {room(必填≤50), detailPosition(可选≤100)} → 201
export function createLocation(data) {
  return request.post('/api/locations', data)
}

// PUT /api/locations/{id}（全量替换；404=不存在或他人位置）
export function updateLocation(id, data) {
  return request.put(`/api/locations/${id}`, data)
}

// DELETE /api/locations/{id} → 204；位置与物品无外键，删除不影响物品
export function deleteLocation(id) {
  return request.delete(`/api/locations/${id}`)
}
