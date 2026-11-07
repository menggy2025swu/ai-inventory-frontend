import request from '@/utils/request'

// POST /api/ai/intake（multipart/form-data：image 可选文件 + description 可选文本，
// 两者至少其一；后端校验失败会 400，由拦截器统一提示）
export function aiIntake({ image, description } = {}) {
  const formData = new FormData()
  if (image) {
    formData.append('image', image)
  }
  if (description && description.trim()) {
    formData.append('description', description.trim())
  }
  // FormData 时 axios 自动带 multipart boundary（Content-Type 在 CORS 白名单内）
  return request.post('/api/ai/intake', formData)
}

// POST /api/ai/organize（无请求体；真实耗时约 5 秒，按钮需 loading）
export function aiOrganize() {
  return request.post('/api/ai/organize')
}

// POST /api/ai/search（JSON {query}，query ≤500 字）
// 真实响应为扁平结构：{originalQuery, keyword, useStatus, room, categoryName,
// matchedCategoryId, results: Page<ItemResponse>}
export function aiSearch(query) {
  return request.post('/api/ai/search', { query })
}
