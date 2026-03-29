import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { Device } from '../types/database'

interface DeviceState {
  devices: Device[]
  currentDeviceId: string | null
  loading: boolean
  error: string | null
  activeAlertsCount: Record<string, number>
  setDevices: (devices: Device[]) => void
  setCurrentDevice: (deviceId: string | null) => void
  fetchDevices: () => Promise<void>
  addDevice: (device: Device) => void
  updateDevice: (deviceId: string, updates: Partial<Device>) => void
  setActiveAlertsCount: (counts: Record<string, number>) => void
  bindDevice: (deviceId: string) => Promise<{ error: string | null }>
  unbindDevice: (deviceId: string) => Promise<{ error: string | null }>
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  currentDeviceId: null,
  loading: false,
  error: null,
  activeAlertsCount: {},

  setDevices: (devices) => {
    set({ devices, loading: false })
  },

  setCurrentDevice: (deviceId) => {
    set({ currentDeviceId: deviceId })
  },

  addDevice: (device) => {
    set((state) => ({ devices: [...state.devices, device] }))
  },

  updateDevice: (deviceId, updates) => {
    set((state) => ({
      devices: state.devices.map((d) =>
        d.device_id === deviceId ? { ...d, ...updates } : d
      ),
    }))
  },

  setActiveAlertsCount: (counts) => {
    set({ activeAlertsCount: counts })
  },

  fetchDevices: async () => {
    set({ loading: true, error: null })
    try {
      // 通过 user_devices 关联查询用户绑定的设备
      const { data, error } = await supabase
        .from('user_devices')
        .select(`
          device_id,
          role,
          devices:device_id (
            device_id,
            auth_key,
            manufacturer,
            hw_version,
            fw_version,
            battery_packs_count,
            cell_count,
            temp_sensor_count,
            last_online,
            last_offline,
            status,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // 提取 devices 数据
      const devicesList: Device[] = (data || [])
        .filter(item => item.devices)
        .map(item => {
          const d = item.devices as unknown as Device
          return {
            device_id: d.device_id,
            auth_key: d.auth_key,
            manufacturer: d.manufacturer,
            hw_version: d.hw_version,
            fw_version: d.fw_version,
            battery_packs_count: d.battery_packs_count,
            cell_count: d.cell_count,
            temp_sensor_count: d.temp_sensor_count,
            last_online: d.last_online,
            last_offline: d.last_offline,
            status: d.status,
            created_at: d.created_at,
            updated_at: d.updated_at,
          } as Device
        })

      set({ devices: devicesList, loading: false, error: null })
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : '获取设备列表失败',
      })
    }
  },

  bindDevice: async (deviceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: '请先登录' }
      }

      const { error } = await supabase
        .from('user_devices')
        .insert({
          user_id: user.id,
          device_id: deviceId,
          role: 'owner',
        })

      if (error) {
        return { error: error.message }
      }

      // 刷新设备列表
      await get().fetchDevices()
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : '绑定设备失败'
      return { error: message }
    }
  },

  unbindDevice: async (deviceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { error: '请先登录' }
      }

      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('user_id', user.id)
        .eq('device_id', deviceId)

      if (error) {
        return { error: error.message }
      }

      // 从本地状态移除
      set((state) => ({
        devices: state.devices.filter((d) => d.device_id !== deviceId),
      }))
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : '解绑设备失败'
      return { error: message }
    }
  },
}))
