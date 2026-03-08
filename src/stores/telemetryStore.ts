import { create } from 'zustand'
import type { Telemetry, Status } from '../types/database'

interface TelemetryState {
  latestTelemetry: Record<string, Telemetry> // key: deviceId
  latestStatus: Record<string, Status> // key: deviceId
  telemetryHistory: Record<string, Telemetry[]> // key: deviceId
  updateTelemetry: (deviceId: string, data: Telemetry) => void
  updateStatus: (deviceId: string, data: Status) => void
  setTelemetryHistory: (deviceId: string, history: Telemetry[]) => void
  clearDeviceData: (deviceId: string) => void
  clearAllData: () => void
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  latestTelemetry: {},
  latestStatus: {},
  telemetryHistory: {},

  updateTelemetry: (deviceId, data) => {
    set((state) => ({
      latestTelemetry: {
        ...state.latestTelemetry,
        [deviceId]: data,
      },
    }))
  },

  updateStatus: (deviceId, data) => {
    set((state) => ({
      latestStatus: {
        ...state.latestStatus,
        [deviceId]: data,
      },
    }))
  },

  setTelemetryHistory: (deviceId, history) => {
    set((state) => ({
      telemetryHistory: {
        ...state.telemetryHistory,
        [deviceId]: history,
      },
    }))
  },

  clearDeviceData: (deviceId) => {
    set((state) => {
      const {
        [deviceId]: removedTelemetry,
        ...remainingTelemetry
      } = state.latestTelemetry
      const {
        [deviceId]: removedStatus,
        ...remainingStatus
      } = state.latestStatus
      const {
        [deviceId]: removedHistory,
        ...remainingHistory
      } = state.telemetryHistory

      return {
        latestTelemetry: remainingTelemetry,
        latestStatus: remainingStatus,
        telemetryHistory: remainingHistory,
      }
    })
  },

  clearAllData: () => {
    set({
      latestTelemetry: {},
      latestStatus: {},
      telemetryHistory: {},
    })
  },
}))
