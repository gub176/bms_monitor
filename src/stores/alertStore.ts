import { create } from 'zustand'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabaseClient'
import { useDeviceStore } from './deviceStore'
import type { Alert } from '../types/database'

export interface AlertFilters {
  levels: string[]              // 选中的级别 ['critical', 'warning', 'info']
  deviceId?: string             // 选中的设备 ID
  dateRange?: [string, string]  // 时间范围 [start, end] ISO 格式
}

export interface DeviceOption {
  value: string
  label: string
}

interface AlertState {
  alerts: Alert[]
  activeAlerts: Alert[]
  loading: boolean
  error: string | null
  filters: AlertFilters
  searchKeyword: string
  deviceOptions: DeviceOption[]
  selectedAlertIds: string[]
  fetchAlerts: (deviceId?: string) => Promise<void>
  addAlert: (alert: Alert) => void
  updateAlert: (alertId: string, updates: Partial<Alert>) => void
  clearAlerts: () => void
  setFilters: (filters: Partial<AlertFilters>) => void
  setSearchKeyword: (keyword: string) => void
  resetFilters: () => void
  getFilteredAlerts: () => Alert[]
  toggleAlertSelection: (alertId: string) => void
  clearSelection: () => void
  bulkMarkAsRead: () => Promise<void>
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  activeAlerts: [],
  loading: false,
  error: null,
  filters: {
    levels: [],
    deviceId: undefined,
    dateRange: undefined,
  },
  searchKeyword: '',
  deviceOptions: [],
  selectedAlertIds: [],

  fetchAlerts: async (deviceId) => {
    set({ loading: true, error: null })
    try {
      // 获取当前用户
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        set({ loading: false, error: '请先登录' })
        return
      }
      if (!user) {
        set({ loading: false, error: '请先登录' })
        return
      }

      // 先获取用户绑定的设备 ID 列表
      const { data: userDevices, error: devicesError } = await supabase
        .from('user_devices')
        .select('device_id')
        .eq('user_id', user.id)

      if (devicesError) {
        throw devicesError
      }

      const deviceIds = userDevices.map(d => d.device_id)

      if (deviceIds.length === 0) {
        set({ alerts: [], activeAlerts: [], loading: false, error: null, deviceOptions: [] })
        return
      }

      // 查询这些设备的告警
      let query = supabase
        .from('alerts')
        .select(`
          id,
          device_id,
          alert_type,
          severity,
          start_time,
          end_time
        `)
        .in('device_id', deviceIds)
        .order('start_time', { ascending: false })

      if (deviceId) {
        query = query.eq('device_id', deviceId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // severity 到 level 的映射
      const severityToLevel: Record<number, string> = {
        1: 'critical',  // 严重
        2: 'warning',   // 警告
        3: 'info',      // 提示
      }

      const allAlerts = (data || []).map((alert) => ({
        ...alert,
        level: severityToLevel[alert.severity] || 'info',
        description: alert.alert_type,
      }))
      const activeAlerts = allAlerts.filter((a) => a.end_time === null)

      // 更新设备选项
      const options = deviceIds.map(id => ({
        value: id,
        label: id,
      }))

      set({
        alerts: allAlerts,
        activeAlerts,
        loading: false,
        error: null,
        deviceOptions: options,
      })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : '获取告警列表失败',
      })
    }
  },

  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
      activeAlerts: alert.end_time === null ? [alert, ...state.activeAlerts] : state.activeAlerts,
    }))
  },

  updateAlert: (alertId: string, updates: Partial<Alert>) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        String(a.id) === alertId ? { ...a, ...updates } : a
      ),
      activeAlerts: state.activeAlerts.map((a) =>
        String(a.id) === alertId ? { ...a, ...updates } : a
      ),
    }))
  },

  clearAlerts: () => {
    set({ alerts: [], activeAlerts: [], error: null })
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },
    }))
  },

  setSearchKeyword: (keyword) => {
    set({ searchKeyword: keyword })
  },

  resetFilters: () => {
    set({
      filters: {
        levels: [],
        deviceId: undefined,
        dateRange: undefined,
      },
      searchKeyword: '',
    })
  },

  toggleAlertSelection: (alertId: string) => {
    set((state) => {
      const isSelected = state.selectedAlertIds.includes(alertId)
      return {
        selectedAlertIds: isSelected
          ? state.selectedAlertIds.filter((id) => id !== alertId)
          : [...state.selectedAlertIds, alertId],
      }
    })
  },

  clearSelection: () => {
    set({ selectedAlertIds: [] })
  },

  bulkMarkAsRead: async () => {
    const state = get()
    if (state.selectedAlertIds.length === 0) return

    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ loading: false, error: '请先登录' })
        return
      }

      // 批量更新告警状态
      const updates = state.selectedAlertIds.map((id) => ({
        id,
        end_time: new Date().toISOString(),
      }))

      for (const update of updates) {
        await supabase
          .from('alerts')
          .update({ end_time: update.end_time })
          .eq('id', update.id)
          .eq('user_id', user.id)
      }

      // 更新本地状态
      set((state) => ({
        alerts: state.alerts.map((a) =>
          state.selectedAlertIds.includes(String(a.id))
            ? { ...a, end_time: new Date().toISOString() }
            : a
        ),
        activeAlerts: state.activeAlerts.filter(
          (a) => !state.selectedAlertIds.includes(String(a.id))
        ),
        selectedAlertIds: [],
        loading: false,
      }))
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : '批量标记失败',
      })
    }
  },

  getFilteredAlerts: () => {
    const state = get()
    const { alerts, filters, searchKeyword } = state

    return alerts.filter((alert) => {
      // 级别筛选
      if (filters.levels.length > 0) {
        const severityMap: Record<number, string> = {
          1: 'critical',
          2: 'warning',
          3: 'info',
        }
        const alertLevel = severityMap[alert.severity]
        if (!filters.levels.includes(alertLevel)) {
          return false
        }
      }

      // 设备筛选
      if (filters.deviceId && alert.device_id !== filters.deviceId) {
        return false
      }

      // 时间范围筛选
      if (filters.dateRange) {
        const [start, end] = filters.dateRange
        const alertStart = dayjs(alert.start_time)
        const rangeStart = dayjs(start)
        const rangeEnd = dayjs(end).endOf('day')

        if (alertStart.isBefore(rangeStart) || alertStart.isAfter(rangeEnd)) {
          return false
        }
      }

      // 关键词搜索
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase()
        const matchType = alert.alert_type.toLowerCase().includes(keyword)
        const matchDesc = alert.description?.toLowerCase().includes(keyword)
        if (!matchType && !matchDesc) {
          return false
        }
      }

      return true
    })
  },
}))

// 监听设备列表变化，更新 deviceOptions
useDeviceStore.subscribe(
  (state) => {
    const options = state.devices.map((d) => ({
      value: d.device_id,
      label: `${d.device_id}${d.manufacturer ? ` (${d.manufacturer})` : ''}`,
    }))
    useAlertStore.setState({ deviceOptions: options })
  }
)
