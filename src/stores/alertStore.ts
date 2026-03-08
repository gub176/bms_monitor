import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Alert } from '../types/database'

interface AlertState {
  alerts: Alert[]
  activeAlerts: Alert[]
  loading: boolean
  error: string | null
  fetchAlerts: (deviceId?: string) => Promise<void>
  addAlert: (alert: Alert) => void
  updateAlert: (alertId: string, updates: Partial<Alert>) => void
  clearAlerts: () => void
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  activeAlerts: [],
  loading: false,
  error: null,

  fetchAlerts: async (deviceId) => {
    set({ loading: true, error: null })
    try {
      let query = supabase
        .from('alerts')
        .select('*')
        .order('start_time', { ascending: false })

      if (deviceId) {
        query = query.eq('device_id', deviceId)
      }

      const { data, error } = await query

      if (error) throw error

      const activeAlerts = data?.filter((a) => a.end_time === null) || []
      set({
        alerts: data || [],
        activeAlerts,
        loading: false,
        error: null,
      })
    } catch (err) {
      console.error('Failed to fetch alerts:', err)
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

  updateAlert: (alertId, updates) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, ...updates } : a
      ),
      activeAlerts: state.activeAlerts.map((a) =>
        a.id === alertId ? { ...a, ...updates } : a
      ),
    }))
  },

  clearAlerts: () => {
    set({ alerts: [], activeAlerts: [], error: null })
  },
}))
