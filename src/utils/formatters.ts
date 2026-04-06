/**
 * Format timestamp to readable date string
 */
export function formatDate(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Format timestamp to readable time string
 */
export function formatTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format timestamp to full date time string
 */
export function formatDateTime(timestamp: string | Date): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}

/**
 * Format relative time (e.g., "5 分钟前")
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) {
    return '刚刚'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return formatDate(timestamp)
  }
}

/**
 * Format voltage value
 */
export function formatVoltage(value: number | null | undefined): string {
  if (value == null) return '--'
  return `${value.toFixed(2)} V`
}

/**
 * Format current value
 */
export function formatCurrent(value: number | null | undefined): string {
  if (value == null) return '--'
  return `${value.toFixed(2)} A`
}

/**
 * Format power value
 */
export function formatPower(value: number | null | undefined): string {
  if (value == null) return '--'
  const absValue = Math.abs(value)
  if (absValue >= 1000) {
    return `${(absValue / 1000).toFixed(2)} kW`
  }
  return `${absValue.toFixed(0)} W`
}

/**
 * Format percentage value (SOC, SOH)
 */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return '--'
  return `${value.toFixed(1)}%`
}

/**
 * Format temperature value
 */
export function formatTemperature(value: number | null | undefined): string {
  if (value == null) return '--'
  return `${value.toFixed(1)}°C`
}

/**
 * Format capacity value
 */
export function formatCapacity(value: number | null | undefined): string {
  if (value == null) return '--'
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} kWh`
  }
  return `${value.toFixed(0)} Wh`
}

/**
 * Get status badge color
 */
export function getStatusColor(status: number, type: 'operation' | 'charge' | 'grid'): string {
  const maps = {
    operation: {
      0: 'gray',
      1: 'green',
      2: 'orange',
      3: 'red',
    },
    charge: {
      0: 'gray',
      1: 'blue',
      2: 'green',
      3: 'purple',
    },
    grid: {
      0: 'gray',
      1: 'green',
      2: 'orange',
    },
  }
  return maps[type][status as keyof (typeof maps)[typeof type]] || 'gray'
}

/**
 * Get operation status text
 * @param status operation_status value from database
 * @returns '正常运行' | '停机'
 */
export function getOperationStatusText(status: number | null | undefined): string {
  return status === 1 ? '正常运行' : '停机'
}

/**
 * Get charge/discharge status text
 * @param status charge_status value from database
 * @returns '充电中' | '放电中' | '空闲'
 */
export function getChargeStatusText(status: number | null | undefined): string {
  if (status === 1) return '充电中'
  if (status === 2) return '放电中'
  return '空闲'
}

/**
 * Get grid connection status text
 * @param status grid_status value from database
 * @returns '已并网' | '离网'
 */
export function getGridStatusText(status: number | null | undefined): string {
  return status === 1 ? '已并网' : '离网'
}

/**
 * Status value to CSS class mapping
 */
export function getStatusClass(status: number, type: 'operation' | 'charge' | 'grid'): string {
  const baseClass = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium'
  const classMap = {
    operation: {
      1: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    },
    charge: {
      1: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
      2: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    },
    grid: {
      1: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
    },
  }
  const activeClass = classMap[type][status as keyof (typeof classMap)[typeof type]]
  return activeClass
    ? `${baseClass} ${activeClass}`
    : `${baseClass} bg-[var(--color-bg-page)] text-[var(--color-text-secondary)]`
}

/**
 * Get alert level color
 */
export function getAlertLevelColor(level: string): string {
  const colors: Record<string, string> = {
    info: 'blue',
    warning: 'orange',
    critical: 'red',
  }
  return colors[level.toLowerCase()] || 'gray'
}
