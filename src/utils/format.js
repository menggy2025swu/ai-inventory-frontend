// useStatus 枚举中文映射（后端 UseStatus：NORMAL/IDLE/TRANSFERRED/DISCARDED）
export const USE_STATUS_OPTIONS = [
  { value: 'NORMAL', label: '正常使用' },
  { value: 'IDLE', label: '闲置' },
  { value: 'TRANSFERRED', label: '已转让' },
  { value: 'DISCARDED', label: '已丢弃' }
]

const STATUS_LABEL = Object.fromEntries(
  USE_STATUS_OPTIONS.map((o) => [o.value, o.label])
)

export function useStatusLabel(value) {
  return STATUS_LABEL[value] ?? value ?? '—'
}

export function useStatusTagType(value) {
  return (
    {
      NORMAL: 'success',
      IDLE: 'info',
      TRANSFERRED: 'warning',
      DISCARDED: 'danger'
    }[value] ?? 'info'
  )
}

// LocalDateTime ISO 字符串 → "YYYY-MM-DD HH:mm"
export function formatDateTime(value) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '—'
}

// 图片静态资源地址（相对路径：dev 下经 vite 代理 /uploads → 8080 转发；
// 后端 GET /uploads/images/** 匿名放行）
export function imageUrl(imagePath) {
  return '/uploads/images/' + imagePath
}
