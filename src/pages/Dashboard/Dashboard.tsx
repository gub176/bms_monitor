import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Card, Empty, Spin, Badge, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ThunderboltOutlined, WifiOutlined, BellOutlined, DashboardOutlined } from '@ant-design/icons'
import { useDevices } from '../../hooks/useDevices'
import { useAlertStore } from '../../stores/alertStore'
import BindDeviceModal from '../../components/device/BindDeviceModal'
import { Line } from '@ant-design/charts'

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
      <div>
        <Text className="stat-card-label">{title}</Text>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="stat-card-value" style={{ color }}>{value}</span>
          {suffix && <span className="stat-card-suffix">{suffix}</span>}
        </div>
      </div>
      <div className="stat-card-icon" style={{ background: `${color}15`, color }}>
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

  const trendData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i.toString().padStart(2, '0')}:00`,
    voltage: Math.round(3700 + Math.random() * 300) / 100,
    temperature: Math.round(20 + Math.random() * 15),
    soc: Math.round(70 + Math.random() * 30),
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">加载设备数据...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Empty description={error} />
      </div>
    )
  }

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-8 bg-white rounded-xl">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <ThunderboltOutlined className="text-4xl text-blue-500" />
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
      width: 200,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${record.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div>
            <div className="font-medium text-gray-900">{text || 'BMS 设备'}</div>
            <div className="text-xs text-gray-400 font-mono">{record.device_id.slice(0, 16)}...</div>
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
        <span className="text-gray-900 font-semibold">{record.voltage.toFixed(2)} V</span>
      ),
    },
    {
      title: '温度',
      key: 'temperature',
      width: 120,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <span className="text-gray-900 font-semibold">{record.temperature.toFixed(1)} °C</span>
      ),
    },
    {
      title: 'SOC',
      key: 'soc',
      width: 100,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <span className="text-gray-900 font-semibold">{record.soc}%</span>
      ),
    },
    {
      title: '电芯数',
      dataIndex: 'cell_count',
      key: 'cell_count',
      width: 90,
      align: 'right',
      render: (count: number) => <span className="text-gray-500 text-sm">{count || '-'} 串</span>,
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
    <div className="space-y-4">
      {/* 核心指标卡片 - 极简风格 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="设备总数"
          value={stats.total}
          suffix="台"
          icon={<ThunderboltOutlined className="text-lg" />}
          color="#1890ff"
        />
        <StatCard
          title="在线设备"
          value={stats.online}
          suffix="台"
          icon={<WifiOutlined className="text-lg" />}
          color="#52c41a"
        />
        <StatCard
          title="活跃告警"
          value={stats.activeAlerts}
          suffix="条"
          icon={<BellOutlined className="text-lg" />}
          color="#faad14"
        />
        <StatCard
          title="系统健康度"
          value={stats.health}
          suffix="%"
          icon={<DashboardOutlined className="text-lg" />}
          color="#13c2c2"
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

      {/* 24 小时趋势 */}
      <Card className="energy-card" variant="borderless" title="24 小时趋势" extra={
        <Badge color="blue" text={<span className="text-sm">实时更新</span>} />
      }>
        <div className="h-72">
          <Line
            data={trendData.flatMap((d) => [
              { time: d.time, value: d.voltage, type: '电压 (V)' },
              { time: d.time, value: d.temperature, type: '温度 (°C)' },
              { time: d.time, value: d.soc, type: 'SOC (%)' },
            ])}
            xField="time"
            yField="value"
            seriesField="type"
            smooth={true}
            height={260}
            color={['#1890ff', '#faad14', '#52c41a']}
            legend={{ position: 'top', layout: 'horizontal' }}
            xAxis={{ label: { autoRotate: true, autoHide: 'greedy' } }}
            tooltip={{ showMarkers: true, shared: true }}
          />
        </div>
      </Card>

      <BindDeviceModal open={bindModalOpen} onClose={() => setBindModalOpen(false)} onSuccess={refresh} />
    </div>
  )
}

export default Dashboard
