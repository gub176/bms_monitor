import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Card, Empty, Spin, Badge, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  BellOutlined,
  DashboardOutlined,
  RightOutlined,
  RiseOutlined,
  FireOutlined,
} from '@ant-design/icons'
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
      <div className="flex flex-col items-center justify-center min-h-[600px] p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-6">
          <ThunderboltOutlined className="text-5xl text-blue-500" />
        </div>
        <Title level={3} className="!mb-3 !text-gray-800">
          暂无设备
        </Title>
        <Text type="secondary" className="mb-8 text-center max-w-md text-base">
          绑定 BMS 设备后即可实时监控电压、温度、SOC 等关键数据，全面了解设备运行状态
        </Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setBindModalOpen(true)}
          className="px-8 h-12 text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
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
            className={`w-3 h-3 rounded-full ${
              record.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`}
          />
          <div>
            <div className="font-semibold text-gray-800">{text || 'BMS 设备'}</div>
            <div className="text-xs text-gray-400 font-mono">{record.device_id.slice(0, 16)}...</div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: 'online' | 'offline') => (
        <Badge
          count={status === 'online' ? '运行中' : '离线'}
          color={status === 'online' ? 'green' : 'gray'}
          className="text-xs font-medium"
        />
      ),
    },
    {
      title: '电压',
      key: 'voltage',
      width: 130,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <div className="flex items-center justify-end gap-2">
          <ThunderboltOutlined className="text-blue-500 text-sm" />
          <span className="text-blue-600 font-bold text-base">{record.voltage.toFixed(2)} V</span>
        </div>
      ),
    },
    {
      title: '温度',
      key: 'temperature',
      width: 130,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <div className="flex items-center justify-end gap-2">
          <FireOutlined className="text-orange-500 text-sm" />
          <span className="text-orange-600 font-bold text-base">{record.temperature.toFixed(1)} °C</span>
        </div>
      ),
    },
    {
      title: 'SOC',
      key: 'soc',
      width: 120,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <div className="flex items-center justify-end gap-2">
          <RiseOutlined className={record.soc > 80 ? 'text-green-500' : 'text-yellow-500'} text-sm />
          <span className={`font-bold text-base ${record.soc > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
            {record.soc}%
          </span>
        </div>
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
        <RightOutlined className="text-gray-400 text-sm hover:text-blue-500 transition-colors cursor-pointer" />
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
    soc: Math.round(70 + Math.random() * 30),
    cell_count: device.cell_count || 16,
  }))

  return (
    <div className="space-y-6">
      {/* 核心指标卡片 - 渐变背景 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="stat-card-gradient-primary" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm mb-1 font-medium">设备总数</div>
              <div className="text-4xl font-bold text-white">
                {stats.total}
                <span className="text-lg text-white/70 ml-1">台</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ThunderboltOutlined className="text-3xl text-white" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <RiseOutlined className="text-white/80" />
            <span className="text-white/80 text-sm">所有设备</span>
          </div>
        </Card>

        <Card className="stat-card-gradient-success" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm mb-1 font-medium">在线设备</div>
              <div className="text-4xl font-bold text-white">
                {stats.online}
                <span className="text-lg text-white/70 ml-1">台</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <WifiOutlined className="text-3xl text-white" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white/80 text-sm">实时运行</span>
          </div>
        </Card>

        <Card className="stat-card-gradient-warning" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm mb-1 font-medium">活跃告警</div>
              <div className="text-4xl font-bold text-white">
                {stats.activeAlerts}
                <span className="text-lg text-white/70 ml-1">条</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BellOutlined className="text-3xl text-white" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <BellOutlined className="text-white/80" />
            <span className="text-white/80 text-sm">需要关注</span>
          </div>
        </Card>

        <Card className="stat-card-gradient-info" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm mb-1 font-medium">系统健康度</div>
              <div className="text-4xl font-bold text-white">
                {stats.health}
                <span className="text-lg text-white/70 ml-1">%</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <DashboardOutlined className="text-3xl text-white" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <RiseOutlined className="text-white/80" />
            <span className="text-white/80 text-sm">运行正常</span>
          </div>
        </Card>
      </div>

      {/* 设备列表 */}
      <Card
        className="energy-card"
        variant="borderless"
        title={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <ThunderboltOutlined className="text-blue-500" />
            </div>
            <span className="text-lg font-semibold text-gray-800">设备列表</span>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={() => setBindModalOpen(true)}
            className="rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            绑定新设备
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="middle"
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <RiseOutlined className="text-blue-500" />
            </div>
            <span className="text-lg font-semibold text-gray-800">24 小时趋势</span>
          </div>
        }
        extra={
          <Badge color="blue" text={<span className="text-sm">实时更新</span>} />
        }
      >
        <div className="h-80">
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
            height={280}
            color={['#1890ff', '#faad14', '#52c41a']}
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
