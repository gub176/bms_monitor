import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Typography, Button, Card, Empty, Spin } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ThunderboltOutlined, WifiOutlined, AlertOutlined, DashboardOutlined } from '@ant-design/icons'
import { useDevices } from '../../hooks/useDevices'
import { useAlertStore } from '../../stores/alertStore'
import BindDeviceModal from '../../components/device/BindDeviceModal'
import { Line } from '@ant-design/charts'

// 模拟设备数据扩展
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

  // 统计数据
  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    activeAlerts: activeAlerts.length,
    health: devices.length > 0 ? Math.round((devices.filter(d => d.status === 'online').length / devices.length) * 100) : 100,
  }

  // 24 小时趋势数据
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
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Empty description="暂无设备" />
        <Typography.Text type="secondary" className="mt-2 mb-4">
          绑定设备后即可监控和管理
        </Typography.Text>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setBindModalOpen(true)}>
          绑定设备
        </Button>
        <BindDeviceModal
          open={bindModalOpen}
          onClose={() => setBindModalOpen(false)}
          onSuccess={refresh}
        />
      </div>
    )
  }

  // 表格列定义
  const columns: ColumnsType<DeviceRow> = [
    {
      title: '设备名称',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 180,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${record.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="font-medium text-gray-800">{text || 'BMS 设备'}</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: 'online' | 'offline') => (
        <Tag color={status === 'online' ? 'green' : 'gray'}>
          {status === 'online' ? '运行中' : '离线'}
        </Tag>
      ),
    },
    {
      title: '设备 ID',
      dataIndex: 'device_id',
      key: 'device_id',
      width: 220,
      render: (text: string) => (
        <span className="font-mono text-gray-600 text-sm">{text}</span>
      ),
    },
    {
      title: '电压',
      key: 'voltage',
      width: 120,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <span className="text-blue-600 font-semibold">{record.voltage.toFixed(2)}V</span>
      ),
    },
    {
      title: '温度',
      key: 'temperature',
      width: 120,
      align: 'right',
      render: (_: unknown, record: DeviceRow) => (
        <span className="text-orange-600 font-semibold">{record.temperature.toFixed(1)}°C</span>
      ),
    },
    {
      title: '电芯数',
      dataIndex: 'cell_count',
      key: 'cell_count',
      width: 100,
      align: 'right',
      render: (count: number) => (
        <span className="text-gray-600">{count || '-'} 串</span>
      ),
    },
  ]

  // 转换设备数据为表格格式
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
    <div className="p-0">
      {/* 第一行：核心指标卡片 - 整行横向排列 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* 设备总数 */}
        <Card className="energy-card" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm mb-1">设备总数</div>
              <div className="text-3xl font-bold text-gray-800">{stats.total}<span className="text-base text-gray-400 ml-1">台</span></div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <ThunderboltOutlined className="text-2xl text-white" />
            </div>
          </div>
        </Card>

        {/* 在线设备 */}
        <Card className="energy-card" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm mb-1">在线设备</div>
              <div className="text-3xl font-bold text-green-600">{stats.online}<span className="text-base text-gray-400 ml-1">台</span></div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <WifiOutlined className="text-2xl text-white" />
            </div>
          </div>
        </Card>

        {/* 活跃告警 */}
        <Card className="energy-card" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm mb-1">活跃告警</div>
              <div className="text-3xl font-bold text-orange-500">{stats.activeAlerts}<span className="text-base text-gray-400 ml-1">条</span></div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
              <AlertOutlined className="text-2xl text-white" />
            </div>
          </div>
        </Card>

        {/* 系统健康度 */}
        <Card className="energy-card" variant="borderless">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm mb-1">系统健康度</div>
              <div className="text-3xl font-bold text-cyan-600">{stats.health}<span className="text-base text-gray-400 ml-1">%</span></div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600">
              <DashboardOutlined className="text-2xl text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* 第二行：设备列表表格 */}
      <Card
        className="energy-card mb-6"
        variant="borderless"
        title="设备列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setBindModalOpen(true)}>
            绑定新设备
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="middle"
          onRow={(record) => ({
            onClick: () => navigate(`/device/${record.device_id}`),
            className: 'cursor-pointer hover:bg-blue-50/50 transition-colors',
          })}
        />
      </Card>

      {/* 第三行：24 小时趋势图表 */}
      <Card
        className="energy-card"
        variant="borderless"
        title="24 小时趋势"
        extra={
          <Tag color="blue" className="animate-pulse">实时更新</Tag>
        }
      >
        <div className="h-80 -mt-4 -ml-4">
          <Line
            data={trendData.flatMap(d => [
              { time: d.time, value: d.voltage, type: '电压 (V)' },
              { time: d.time, value: d.temperature, type: '温度 (°C)' },
            ])}
            xField="time"
            yField="value"
            seriesField="type"
            smooth={true}
            height={280}
            color={['#3b82f6', '#f59e0b']}
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
          />
        </div>
      </Card>

      <BindDeviceModal
        open={bindModalOpen}
        onClose={() => setBindModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  )
}

export default Dashboard
