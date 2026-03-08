// Status Code Mappings
export const OperationStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: '关机', color: 'gray' },
  1: { text: '运行', color: 'green' },
  2: { text: '待机', color: 'orange' },
  3: { text: '故障', color: 'red' },
}

export const ChargeStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: '空闲', color: 'gray' },
  1: { text: '充电', color: 'blue' },
  2: { text: '放电', color: 'green' },
  3: { text: '满电', color: 'purple' },
}

export const GridStatusMap: Record<number, { text: string; color: string }> = {
  0: { text: '离线', color: 'gray' },
  1: { text: '并网', color: 'green' },
  2: { text: '离网', color: 'orange' },
}

export const AlertLevelMap: Record<string, { text: string; color: string }> = {
  info: { text: '提示', color: 'blue' },
  warning: { text: '警告', color: 'orange' },
  critical: { text: '严重', color: 'red' },
}

// Time Range Options for Charts
export interface TimeRangeOption {
  label: string
  value: string
  hours: number
}

export const TimeRangeOptions: TimeRangeOption[] = [
  { label: '最近 1 小时', value: '1h', hours: 1 },
  { label: '最近 6 小时', value: '6h', hours: 6 },
  { label: '最近 24 小时', value: '24h', hours: 24 },
  { label: '最近 7 天', value: '7d', hours: 168 },
]

// Default Values
export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_REFETCH_INTERVAL = 30000 // 30 seconds
