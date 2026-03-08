import { useEffect, useCallback } from 'react'
import { useDeviceStore } from '../stores/deviceStore'
import { useAuthStore } from '../stores/authStore'

export function useDevices() {
  const { isAuthenticated } = useAuthStore()
  const { devices, loading, error, fetchDevices, setCurrentDevice, currentDeviceId } =
    useDeviceStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchDevices()
    }
  }, [isAuthenticated, fetchDevices])

  const selectDevice = useCallback(
    (deviceId: string | null) => {
      setCurrentDevice(deviceId)
    },
    [setCurrentDevice]
  )

  return {
    devices,
    loading,
    error,
    currentDeviceId,
    selectDevice,
    refresh: fetchDevices,
  }
}
