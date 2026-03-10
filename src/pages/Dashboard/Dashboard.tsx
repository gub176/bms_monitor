import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Card, Empty, Spin, Badge, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ThunderboltOutlined, WifiOutlined, BellOutlined, DashboardOutlined } from '@ant-design/icons'
import { useDevices } from '../../hooks/useDevices'
import { useAlertStore } from '../../stores/alertStore'
import BindDeviceModal from '../../components/device/BindDeviceModal'

const { Title, Text } = Typography

interface DeviceRow {
  key: string
  device_id: string
  manufacturer: string
  status: 'online' | 'offline'
  voltage: number
  temperature: number
  soc: number
  cell_count: number
}

interface StatCardProps {
  title: string
  value: string | number
  suffix?: string
  icon: React.ReactNode
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, suffix, icon, color }) => (
  <Card className="stat-card-minimal" variant="borderless">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <Text className="stat-card-label truncate block">{title}</Text>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="stat-card-value" style={{ color }}>{value}</span>
          {suffix && <span className="stat-card-suffix">{suffix}</span>}
        </div>
      </div>
      <div
        className="stat-card-icon flex-shrink-0"
        style={{ background: `${color}15`, color }}
        aria-hidden="true"
      >
        {icon}
      </div>
    </div>
  </Card>
)

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { devices, loading, error, refresh } = useDevices()
  const { activeAlerts } = useAlertStore()
  const [bindModalOpen, setBindModalOpen] = useState(false)

  const stats = {
    total: devices.length,
    online: devices.filter((d) => d.status === 'online').length,
    activeAlerts: activeAlerts.length,
    health: devices.length > 0
      ? Math.round((devices.filter((d) => d.status === 'online').length / devices.length) * 100)
      : 100,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-500 text-sm">加载设备数据...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Empty description={<span className="text-gray-500">{error}</span>} />
      </div>
    )
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-white rounded-xl shadow-sm">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <ThunderboltOutlined className="text-4xl text-[#2d5a3d]" />
        </div>
        <Title level={4} className="!mb-2">暂无设备</Title>
        <Text type="secondary" className="mb-6 text-center max-w-md">
          绑定 BMS 设备后即可实时监控电压、温度、SOC 等关键数据
        </Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setBindModalOpen(true)}
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
      width: 220,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${record.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}
            aria-label={record.status === 'online' ? '在线' : '离线'}
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{text || 'BMS 设备'}</div>
            <div className="text-xs text-gray-400 font-mono truncate">{record.device_id.slice(0, 16)}...</div>
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
        <Badge
          count={status === 'online' ? '运行中' : '离线'}
          color={status === 'online' ? 'green' : 'default'}
          className="text-xs"
        />
      ),
    },
    {
      title: '电压',
      key: 'voltage',
      width: 120,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <span className="text-gray-900 font-medium">{record.voltage.toFixed(2)} V</span>
      ),
    },
    {
      title: '温度',
      key: 'temperature',
      width: 120,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <span className="text-gray-900 font-medium">{record.temperature.toFixed(1)} °C</span>
      ),
    },
    {
      title: 'SOC',
      key: 'soc',
      width: 100,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <span className="text-gray-900 font-medium">{record.soc}%</span>
      ),
    },
    {
      title: '电芯数',
      dataIndex: 'cell_count',
      key: 'cell_count',
      width: 90,
      align: 'right',
      render: (count: number) => <span className="text-gray-500">{count || '-'} 串</span>,
    },
  ]

  const tableData: DeviceRow[] = devices.map((device, index) => ({
    key: device.device_id,
    device_id: device.device_id,
    manufacturer: device.manufacturer || `设备 ${index + 1}`,
    status: device.status as 'online' | 'offline',
    voltage: 3.7 + Math.random() * 0.3,
    temperature: 22 + Math.random() * 10,
    soc: Math.round(70 + Math.random() * 30),
    cell_count: device.cell_count || 16,
  }))

  return (
    <div>
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="设备总数"
          value={stats.total}
          suffix="台"
          icon={<ThunderboltOutlined className="text-lg" />}
          color="#2d5a3d"
        />
        <StatCard
          title="在线设备"
          value={stats.online}
          suffix="台"
          icon={<WifiOutlined className="text-lg" />}
          color="#4d8f5d"
        />
        <StatCard
          title="活跃告警"
          value={stats.activeAlerts}
          suffix="条"
          icon={<BellOutlined className="text-lg" />}
          color="#c9a959"
        />
        <StatCard
          title="系统健康度"
          value={stats.health}
          suffix="%"
          icon={<DashboardOutlined className="text-lg" />}
          color="#2d5a3d"
        />
      </div>

      {/* 设备列表 */}
      <Card className="energy-card" variant="borderless" title="设备列表" extra={
        <Button type="primary" icon={<PlusOutlined />} size="middle" onClick={() => setBindModalOpen(true)}>
          绑定新设备
        </Button>
      }>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="middle"
          className="energy-table"
          onRow={(record) => ({
            onClick: () => navigate(`/device/${record.device_id}`),
            className: 'cursor-pointer hover:bg-blue-50/30 transition-colors',
          })}
        />
      </Card>

      <BindDeviceModal open={bindModalOpen} onClose={() => setBindModalOpen(false)} onSuccess={refresh} />
    </div>
  )
}

export default Dashboard
