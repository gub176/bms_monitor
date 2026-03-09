import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Typography, Button, Card, Empty, Spin } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  AlertOutlined,
  DashboardOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { useDevices } from '../../hooks/useDevices'
import { useAlertStore } from '../../stores/alertStore'
import BindDeviceModal from '../../components/device/BindDeviceModal'
import { Line } from '@ant-design/charts'

interface DeviceRow {
  key: string
  device_id: string
  manufacturer: string
  status: 'online' | 'offline'
  voltage: number
  temperature: number
  cell_count: number
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { devices, loading, error, refresh } = useDevices()
  const { activeAlerts } = useAlertStore()
  const [bindModalOpen, setBindModalOpen] = useState(false)

  const stats = {
    total: devices.length,
    online: devices.filter((d) => d.status === 'online').length,
    activeAlerts: activeAlerts.length,
    health:
      devices.length > 0
        ? Math.round((devices.filter((d) => d.status === 'online').length / devices.length) * 100)
        : 100,
  }

  const trendData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    voltage: Math.round(3700 + Math.random() * 300) / 100,
    temperature: Math.round(20 + Math.random() * 15),
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" description="加载设备数据..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Empty description={error} />
      </div>
    )
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-6 bg-white rounded-lg shadow-sm">
        <div className="p-6 rounded-full bg-blue-50 mb-6">
          <ThunderboltOutlined className="text-5xl text-blue-500" />
        </div>
        <Typography.Title level={4} className="!mb-2">
          暂无设备
        </Typography.Title>
        <Typography.Text type="secondary" className="mb-6 text-center max-w-md">
          绑定 BMS 设备后即可实时监控电压、温度、SOC 等关键数据
        </Typography.Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setBindModalOpen(true)}
          className="px-8"
        >
          绑定设备
        </Button>
        <BindDeviceModal open={bindModalOpen} onClose={() => setBindModalOpen(false)} onSuccess={refresh} />
      </div>
    )
  }

  const columns: ColumnsType<DeviceRow> = [
    {
      title: '设备名称',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 200,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              record.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`}
          />
          <div>
            <div className="font-medium text-gray-800">{text || 'BMS 设备'}</div>
            <div className="text-xs text-gray-400">{record.device_id.slice(0, 12)}...</div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: 'online' | 'offline') => (
        <Tag
          color={status === 'online' ? 'green' : 'gray'}
          className="px-3 py-0.5 text-xs font-medium"
        >
          {status === 'online' ? '运行中' : '离线'}
        </Tag>
      ),
    },
    {
      title: '电压',
      key: 'voltage',
      width: 120,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <span className="text-blue-600 font-semibold text-sm">{record.voltage.toFixed(2)} V</span>
      ),
    },
    {
      title: '温度',
      key: 'temperature',
      width: 120,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <span className="text-orange-600 font-semibold text-sm">
          {record.temperature.toFixed(1)} °C
        </span>
      ),
    },
    {
      title: '电芯数',
      dataIndex: 'cell_count',
      key: 'cell_count',
      width: 100,
      align: 'right',
      render: (count: number) => <span className="text-gray-600 text-sm">{count || '-'} 串</span>,
    },
    {
      title: '',
      key: 'action',
      width: 80,
      align: 'right',
      render: () => (
        <RightOutlined className="text-gray-400 text-xs hover:text-blue-500 transition-colors" />
      ),
    },
  ]

  const tableData: DeviceRow[] = devices.map((device, index) => ({
    key: device.device_id,
    device_id: device.device_id,
    manufacturer: device.manufacturer || `设备 ${index + 1}`,
    status: device.status as 'online' | 'offline',
    voltage: 3.7 + Math.random() * 0.3,
    temperature: 22 + Math.random() * 10,
    cell_count: device.cell_count || 16,
  }))

  return (
    <div className="space-y-4">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="stat-card" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">设备总数</div>
              <div className="text-2xl font-bold text-gray-800">
                {stats.total}
                <span className="text-sm text-gray-400 ml-1">台</span>
              </div>
            </div>
            <div className="stat-card-icon primary">
              <ThunderboltOutlined className="text-xl text-white" />
            </div>
          </div>
        </Card>

        <Card className="stat-card" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">在线设备</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.online}
                <span className="text-sm text-gray-400 ml-1">台</span>
              </div>
            </div>
            <div className="stat-card-icon success">
              <WifiOutlined className="text-xl text-white" />
            </div>
          </div>
        </Card>

        <Card className="stat-card" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">活跃告警</div>
              <div className="text-2xl font-bold text-orange-500">
                {stats.activeAlerts}
                <span className="text-sm text-gray-400 ml-1">条</span>
              </div>
            </div>
            <div className="stat-card-icon warning">
              <AlertOutlined className="text-xl text-white" />
            </div>
          </div>
        </Card>

        <Card className="stat-card" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">系统健康度</div>
              <div className="text-2xl font-bold text-cyan-600">
                {stats.health}
                <span className="text-sm text-gray-400 ml-1">%</span>
              </div>
            </div>
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
              <DashboardOutlined className="text-xl text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* 设备列表 */}
      <Card
        className="energy-card"
        variant="borderless"
        title={
          <div className="flex items-center gap-2">
            <ThunderboltOutlined className="text-blue-500" />
            <span>设备列表</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => setBindModalOpen(true)}
          >
            绑定新设备
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="small"
          className="energy-table"
          onRow={(record) => ({
            onClick: () => navigate(`/device/${record.device_id}`),
            className: 'cursor-pointer hover:bg-blue-50/50 transition-colors',
          })}
        />
      </Card>

      {/* 24 小时趋势 */}
      <Card
        className="energy-card"
        variant="borderless"
        title={
          <div className="flex items-center gap-2">
            <DashboardOutlined className="text-blue-500" />
            <span>24 小时趋势</span>
          </div>
        }
        extra={
          <Tag color="blue" className="text-xs">
            实时更新
          </Tag>
        }
      >
        <div className="h-72">
          <Line
            data={trendData.flatMap((d) => [
              { time: d.time, value: d.voltage, type: '电压 (V)' },
              { time: d.time, value: d.temperature, type: '温度 (°C)' },
            ])}
            xField="time"
            yField="value"
            seriesField="type"
            smooth={true}
            height={260}
            color={['#1890ff', '#faad14']}
            legend={{ position: 'top', layout: 'horizontal' }}
            xAxis={{
              label: {
                autoRotate: true,
                autoHide: 'greedy',
              },
            }}
            tooltip={{
              showMarkers: true,
              shared: true,
            }}
            animation={{
              appear: {
                animation: 'path-in',
                duration: 1000,
              },
            }}
          />
        </div>
      </Card>

      <BindDeviceModal open={bindModalOpen} onClose={() => setBindModalOpen(false)} onSuccess={refresh} />
    </div>
  )
}

export default Dashboard
