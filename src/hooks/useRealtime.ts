import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useTelemetryStore } from '../stores/telemetryStore'
import type { Telemetry, Status } from '../types/database'

export function useRealtime(deviceId: string | null) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const { updateTelemetry, updateStatus } = useTelemetryStore()

  useEffect(() => {
    if (!deviceId) {
      // Cleanup when deviceId is null
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      return
    }

    // Create channel for this device
    channelRef.current = supabase
      .channel(`device-${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          updateTelemetry(deviceId, payload.new as Telemetry)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'status',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          updateStatus(deviceId, payload.new as Status)
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [deviceId, updateTelemetry, updateStatus])

  return {
    isSubscribed: !!deviceId,
  }
}
