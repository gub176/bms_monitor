import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Typography,
  Empty,
  Button,
  Progress,
  Table,
  Badge,
  Skeleton,
} from 'antd'
import {
  ThunderboltOutlined,
  WifiOutlined,
  HeatMapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { useDeviceStore } from '../../stores/deviceStore'
import { useAlertStore } from '../../stores/alertStore'

const { Title, Text } = Typography

// 温度状态类型
type TemperatureStatus = 'normal' | 'warning' | 'critical'

// 获取温度状态的实用函数
const getTemperatureStatus = (temperature: number): TemperatureStatus => {
  if (temperature > 35) return 'critical'
  if (temperature > 32) return 'warning'
  return 'normal'
}

// 获取温度状态的 CSS 类
const getTemperatureClass = (temperature: number): string => {
  const status = getTemperatureStatus(temperature)
  switch (status) {
    case 'critical':
      return 'text-[var(--color-error)]'
    case 'warning':
      return 'text-[var(--color-warning)]'
    default:
      return 'text-[var(--color-success)]'
  }
}

interface CellData {
  key: string
  index: number
  voltage: number
  soc: number
  temperature: number
}

const DeviceDetail: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>()
  const navigate = useNavigate()
  const { devices, fetchDevices } = useDeviceStore()
  const { fetchAlerts, activeAlerts } = useAlertStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchDevices()
        if (deviceId) {
          await fetchAlerts(deviceId)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [deviceId])

  const device = devices.find((d) => d.device_id === deviceId)
  const deviceAlerts = activeAlerts.filter((a) => a.device_id === deviceId)

  // 模拟遥测数据
  const telemetry = {
    soc: 78.5,
    soh: 95.2,
    total_voltage: 51.2,
    total_current: 12.5,
    charge_power: 640,
    discharge_power: 0,
    temperature_max: 32,
    temperature_min: 28,
    cell_voltages: Array.from({ length: 16 }, () => 3.2 + Math.random() * 0.1),
    cell_temperatures: Array.from({ length: 8 }, () => 28 + Math.random() * 4),
  }

  // 模拟状态数据
  const status = {
    operation_status: 1,
    charge_status: 1,
    grid_status: 1,
  }

  // 电芯数据
  const cellData: CellData[] = telemetry.cell_voltages.map((voltage, index) => ({
    key: index.toString(),
    index: index + 1,
    voltage,
    soc: 75 + Math.random() * 5,
    temperature: telemetry.cell_temperatures[index % telemetry.cell_temperatures.length],
  }))

  const cellColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (index: number) => (
        <Text strong className="text-sm">
          #{index.toString().padStart(2, '0')}
        </Text>
      ),
    },
    {
      title: '电压',
      dataIndex: 'voltage',
      key: 'voltage',
      width: 120,
      render: (voltage: number) => (
        <span className="font-mono text-[var(--color-primary)] font-medium">{voltage.toFixed(3)} V</span>
      ),
    },
    {
      title: 'SOC',
      dataIndex: 'soc',
      key: 'soc',
      width: 100,
      render: (soc: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={Math.round(soc)}
            size="small"
            strokeColor={{ '0%': 'var(--color-primary)', '100%': 'var(--color-success)' }}
            format={() => `${Math.round(soc)}%`}
            className="!m-0"
          />
        </div>
      ),
    },
    {
      title: '温度',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 100,
      render: (temperature: number) => (
        <span
          className={`font-mono font-medium ${getTemperatureClass(temperature)}`}
        >
          {temperature.toFixed(1)} &deg;C
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton active paragraph={{ rows: 12 }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Empty description={error}>
          <Button type="primary" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </Empty>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Empty description="设备不存在" />
        <Button type="primary" onClick={() => navigate('/dashboard')} className="mt-4">
          返回仪表盘
        </Button>
      </div>
    )
  }

  const isOnline = device.status === 'online'

  return (
    <main className="space-y-4" aria-label="设备详情页">
      {/* 头部信息卡片 - 单行标签栏式布局 */}
      <Card className="energy-card" variant="borderless">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 左侧设备信息 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-active) 100%)' }}
              aria-hidden="true"
            >
              <ThunderboltOutlined className="text-white text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Title level={4} className="!mb-0 !text-base">
                  {device.manufacturer || 'BMS 设备'}
                </Title>
                <Badge
                  status={isOnline ? 'success' : 'default'}
                  text={isOnline ? '在线' : '离线'}
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)]">
                <span className="font-mono">{device.device_id}</span>
                {deviceAlerts.length > 0 && (
                  <span className="flex items-center gap-1 text-[var(--color-error)]">
                    <ExclamationCircleOutlined aria-hidden="true" />
                    {deviceAlerts.length} 个告警
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 右侧状态标签 */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 运行状态 */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
                status.operation_status === 1
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : 'bg-[var(--color-bg-page)] text-[var(--color-text-secondary)]'
              }`}
            >
              {status.operation_status === 1 ? (
                <CheckCircleOutlined aria-hidden="true" />
              ) : (
                <CloseCircleOutlined aria-hidden="true" />
              )}
              {status.operation_status === 1 ? '正常运行' : '停机'}
            </span>

            {/* 充放电状态 */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
                status.charge_status === 1
                  ? 'bg-[var(--color-info)]/10 text-[var(--color-info)]'
                  : status.charge_status === 2
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : 'bg-[var(--color-bg-page)] text-[var(--color-text-secondary)]'
              }`}
            >
              <ThunderboltOutlined aria-hidden="true" />
              {status.charge_status === 1 ? '充电中' : status.charge_status === 2 ? '放电中' : '空闲'}
            </span>

            {/* 并网状态 */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${
                status.grid_status === 1
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                  : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
              }`}
            >
              <WifiOutlined aria-hidden="true" />
              {status.grid_status === 1 ? '已并网' : '离网'}
            </span>
          </div>
        </div>
      </Card>

      {/* 关键参数 */}
      <Row gutter={[16, 16]} role="region" aria-label="关键参数">
        <Col xs={24} sm={12} lg={6}>
          <Card className="energy-card" variant="borderless">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text type="secondary" className="text-xs">
                  SOC (荷电状态)
                </Text>
                <ThunderboltOutlined className="text-[var(--color-primary)]" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                {telemetry.soc.toFixed(1)}%
              </div>
              <Progress
                percent={telemetry.soc}
                strokeColor={{ '0%': 'var(--color-primary)', '100%': 'var(--color-success)' }}
                showInfo={false}
                size="small"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="energy-card" variant="borderless">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text type="secondary" className="text-xs">
                  总电压
                </Text>
                <ThunderboltOutlined className="text-[var(--color-success)]" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                {telemetry.total_voltage.toFixed(1)}
                <span className="text-sm text-[var(--color-text-tertiary)] ml-1">V</span>
              </div>
              <div className="flex items-center gap-2">
                <Text type="secondary" className="text-xs">
                  总电流
                </Text>
                <Text strong className="text-sm ml-auto">
                  {telemetry.total_current.toFixed(1)} A
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="energy-card" variant="borderless">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text type="secondary" className="text-xs">
                  SOH (健康状态)
                </Text>
                <SafetyOutlined className="text-[var(--color-info)]" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold text-[var(--color-text-primary)]">
                {telemetry.soh.toFixed(1)}%
              </div>
              <Progress
                percent={telemetry.soh}
                strokeColor="var(--color-info)"
                showInfo={false}
                size="small"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="energy-card" variant="borderless">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text type="secondary" className="text-xs">
                  温度范围
                </Text>
                <HeatMapOutlined className="text-[var(--color-warning)]" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--color-error)]">
                  {telemetry.temperature_max}&deg;C
                </span>
                <Text type="secondary" className="text-sm">~</Text>
                <span className="text-2xl font-bold text-[var(--color-info)]">
                  {telemetry.temperature_min}&deg;C
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <Text type="secondary" className="text-xs">最高</Text>
                  <div className="text-sm font-medium text-[var(--color-error)]">
                    {telemetry.temperature_max}&deg;C
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">最低</Text>
                  <div className="text-sm font-medium text-[var(--color-info)]">
                    {telemetry.temperature_min}&deg;C
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 功率信息 */}
      <Row gutter={[16, 16]} role="region" aria-label="功率信息">
        <Col xs={24} md={12}>
          <Card
            className="energy-card"
            variant="borderless"
            title={
              <div className="flex items-center gap-2">
                <ThunderboltOutlined className="text-[var(--color-primary)]" aria-hidden="true" />
                <span>功率信息</span>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="text-center p-4 rounded-lg bg-[var(--color-primary-light)]">
                  <Text type="secondary" className="text-xs block mb-2">
                    充电功率
                  </Text>
                  <Text strong className="text-2xl text-[var(--color-primary)]">
                    {(telemetry.charge_power / 1000).toFixed(2)} kW
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-4 rounded-lg bg-[var(--color-success)]/10">
                  <Text type="secondary" className="text-xs block mb-2">
                    放电功率
                  </Text>
                  <Text strong className="text-2xl text-[var(--color-success)]">
                    {(telemetry.discharge_power / 1000).toFixed(2)} kW
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            className="energy-card"
            variant="borderless"
            title={
              <div className="flex items-center gap-2">
                <HeatMapOutlined className="text-[var(--color-warning)]" aria-hidden="true" />
                <span>设备信息</span>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="text-center p-4 rounded-lg bg-[var(--color-bg-page)]">
                  <Text type="secondary" className="text-xs block mb-2">
                    电芯数量
                  </Text>
                  <Text strong className="text-2xl text-[var(--color-text-primary)]">
                    {device.cell_count || 16} 串
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-4 rounded-lg bg-[var(--color-bg-page)]">
                  <Text type="secondary" className="text-xs block mb-2">
                    电池包数量
                  </Text>
                  <Text strong className="text-2xl text-[var(--color-text-primary)]">
                    {device.battery_packs_count || 1} 个
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 电芯详情表格 */}
      <Card
        className="energy-card"
        variant="borderless"
        title={
          <div className="flex items-center gap-2">
            <SafetyOutlined className="text-[var(--color-primary)]" aria-hidden="true" />
            <span>电芯详情</span>
          </div>
        }
      >
        <Table
          columns={cellColumns}
          dataSource={cellData}
          pagination={false}
          size="small"
          className="energy-table"
          scroll={{ x: 'max-content' }}
          onRow={() => ({
            tabIndex: 0,
            role: 'row',
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                // Future: navigate to cell detail
              }
            },
            className: 'energy-table-row',
          })}
        />
      </Card>
    </main>
  )
}

export default DeviceDetail
