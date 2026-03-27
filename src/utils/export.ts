import type { Alert } from '../types/database'

/**
 * 将告警数据转换为 CSV 格式
 * @param alerts 告警列表
 * @returns CSV 字符串
 */
export function alertsToCSV(alerts: Alert[]): string {
  // CSV 表头
  const headers = [
    'ID',
    '设备 ID',
    '告警类型',
    '描述',
    '级别',
    '开始时间',
    '结束时间',
    '状态',
  ]

  // 级别映射
  const severityMap: Record<number, string> = {
    1: '严重',
    2: '警告',
    3: '提示',
  }

  // 数据行
  const rows = alerts.map((alert) => {
    const status = alert.end_time === null ? '活动中' : '已恢复'
    const severity = severityMap[alert.severity] || '未知'

    return [
      alert.id,
      alert.device_id,
      alert.alert_type,
      alert.description || '',
      severity,
      alert.start_time,
      alert.end_time || '',
      status,
    ].map((field) => {
      // 处理包含逗号或引号的字段
      const str = String(field)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
  })

  // 组合 CSV
  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

/**
 * 下载 CSV 文件
 * @param content CSV 内容
 * @param filename 文件名
 */
export function downloadCSV(content: string, filename: string): void {
  // 添加 BOM 以支持 Excel 正确识别 UTF-8
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 清理 URL
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * 导出告警为 CSV 文件
 * @param alerts 告警列表
 * @param filename 可选的文件名（默认带时间戳）
 */
export function exportAlertsToCSV(alerts: Alert[], filename?: string): void {
  const csv = alertsToCSV(alerts)
  const defaultFilename = `告警导出_${new Date().toISOString().slice(0, 10)}.csv`
  downloadCSV(csv, filename || defaultFilename)
}
