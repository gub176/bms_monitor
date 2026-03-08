import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Tabs, Typography, Spin, Empty, Button, Space } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useDeviceStore } from '../../stores/deviceStore'
import { useTelemetryStore } from '../../stores/telemetryStore'
import { useAlertStore } from '../../stores/alertStore'
import { useRealtime } from '../../hooks/useRealtime'
import { supabase } from '../../lib/supabaseClient'
import DeviceOverview from '../../components/device/DeviceOverview'
import HistoryChart from '../../components/charts/HistoryChart'
import type { Telemetry } from '../../types/database'

const { Title } = Typography

const DeviceDetail: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>()
  const navigate = useNavigate()
  const { devices, setCurrentDevice } = useDeviceStore()
  const { latestTelemetry, latestStatus, setTelemetryHistory } = useTelemetryStore()
  const { fetchAlerts } = useAlertStore()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('24h')

  // Subscribe to realtime updates
  useRealtime(deviceId || null)

  const device = devices.find((d) => d.device_id === deviceId)
  const telemetry = deviceId ? latestTelemetry[deviceId] : undefined
  const status = deviceId ? latestStatus[deviceId] : undefined

  useEffect(() => {
    if (deviceId) {
      setCurrentDevice(deviceId)
      fetchAlerts(deviceId)
      fetchHistory(deviceId, timeRange)
    }
  }, [deviceId, timeRange])

  const fetchHistory = async (id: string, range: string) => {
    setLoading(true)
    try {
      const hours = range === '1h' ? 1 : range === '6h' ? 6 : range === '24h' ? 24 : 168
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('telemetry')
        .select('*')
        .eq('device_id', id)
        .gte('timestamp', startTime)
        .order('timestamp', { ascending: true })

      if (error) throw error
      setTelemetryHistory(id, data || [])
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!device) {
    return (
      <div className="p-6">
        <Empty description="设备不存在" />
        <Button type="primary" onClick={() => navigate('/dashboard')} className="mt-4">
          返回仪表盘
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')}>
            返回
          </Button>
          <Title level={3} className="!mb-0">
            {device.name || device.device_id}
          </Title>
        </Space>
      </div>

      <Tabs
        activeKey={timeRange}
        onChange={(key) => setTimeRange(key)}
        items={[
          {
            key: 'overview',
            label: '实时概览',
            children: (
              <Card bordered={false} className="!p-0">
                <DeviceOverview telemetry={telemetry} status={status} />
              </Card>
            ),
          },
          {
            key: '1h',
            label: '最近 1 小时',
            children: loading ? (
              <div className="flex items-center justify-center py-12">
                <Spin />
              </div>
            ) : (
              <Card title="SOC 趋势" bordered={false}>
                {deviceId && (
                  <HistoryChart
                    data={useTelemetryStore.getState().telemetryHistory[deviceId] || []}
                    metric="soc"
                  />
                )}
              </Card>
            ),
          },
          {
            key: '24h',
            label: '最近 24 小时',
            children: loading ? (
              <div className="flex items-center justify-center py-12">
                <Spin />
              </div>
            ) : (
              <Card title="电压趋势" bordered={false}>
                {deviceId && (
                  <HistoryChart
                    data={useTelemetryStore.getState().telemetryHistory[deviceId] || []}
                    metric="total_voltage"
                  />
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}

export default DeviceDetail
