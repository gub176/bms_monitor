import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Spin,
  Empty,
  Button,
  Progress,
  Table,
  Badge,
} from 'antd'
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  HeatMapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { useDeviceStore } from '../../stores/deviceStore'
import { useAlertStore } from '../../stores/alertStore'
import { formatDateTime } from '../../utils/formatters'

const { Title, Text } = Typography

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

  useEffect(() => {
    const loadData = async () => {
      await fetchDevices()
      if (deviceId) {
        await fetchAlerts(deviceId)
      }
      setLoading(false)
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
        <span className="font-mono text-blue-600 font-medium">{voltage.toFixed(3)} V</span>
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
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
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
          className={`font-mono font-medium ${
            temperature > 35 ? 'text-red-500' : temperature > 32 ? 'text-orange-500' : 'text-green-600'
          }`}
        >
          {temperature.toFixed(1)} °C
        </span>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" description="加载设备详情..." />
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
    <div className="space-y-4">
      {/* 头部导航和设备信息 */}
      <Card className="energy-card" variant="borderless">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dashboard')}
              className="!text-gray-500 hover:!text-blue-500"
            />
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <ThunderboltOutlined className="text-xl text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Title level={4} className="!mb-1">
                    {device.manufacturer || 'BMS 设备'}
                  </Title>
                  <Badge
                    status={isOnline ? 'success' : 'default'}
                    text={isOnline ? '在线' : '离线'}
                  />
                </div>
                <Text type="secondary" className="text-xs font-mono">
                  {device.device_id}
                </Text>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {deviceAlerts.length > 0 && (
              <Tag color="red" className="animate-pulse">
                <ExclamationCircleOutlined className="mr-1" />
                {deviceAlerts.length} 个告警
              </Tag>
            )}
            {device.last_online && (
              <Text type="secondary" className="text-xs">
                最后在线：{formatDateTime(device.last_online)}
              </Text>
            )}
          </div>
        </div>
      </Card>

      {/* 状态指示器 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="stat-card" variant="borderless">
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary" className="text-xs block mb-1">
                  运行状态
                </Text>
                <div className="flex items-center gap-2">
                  {status.operation_status === 1 ? (
                    <CheckCircleOutlined className="text-green-500 text-lg" />
                  ) : (
                    <CloseCircleOutlined className="text-gray-400 text-lg" />
                  )}
                  <Text strong className="text-base">
                    {status.operation_status === 1 ? '正常运行' : '停机'}
                  </Text>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                <DashboardOutlined className="text-xl text-white" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card" variant="borderless">
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary" className="text-xs block mb-1">
                  充放电状态
                </Text>
                <div className="flex items-center gap-2">
                  {status.charge_status === 1 ? (
                    <Tag color="blue" className="text-xs">充电中</Tag>
                  ) : status.charge_status === 2 ? (
                    <Tag color="green" className="text-xs">放电中</Tag>
                  ) : (
                    <Tag color="gray" className="text-xs">空闲</Tag>
                  )}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                <SafetyOutlined className="text-xl text-white" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="stat-card" variant="borderless">
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary" className="text-xs block mb-1">
                  并网状态
                </Text>
                <div className="flex items-center gap-2">
                  {status.grid_status === 1 ? (
                    <Tag color="green" className="text-xs">已并网</Tag>
                  ) : (
                    <Tag color="orange" className="text-xs">离网</Tag>
                  )}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600">
                <WifiOutlined className="text-xl text-white" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 关键参数 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="energy-card" variant="borderless">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text type="secondary" className="text-xs">
                  SOC (荷电状态)
                </Text>
                <ThunderboltOutlined className="text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {telemetry.soc.toFixed(1)}%
              </div>
              <Progress
                percent={telemetry.soc}
                strokeColor={{ '0%': '#1890ff', '100%': '#52c41a' }}
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
                <ThunderboltOutlined className="text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {telemetry.total_voltage.toFixed(1)}
                <span className="text-sm text-gray-400 ml-1">V</span>
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
                <SafetyOutlined className="text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {telemetry.soh.toFixed(1)}%
              </div>
              <Progress
                percent={telemetry.soh}
                strokeColor="#722ed1"
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
                <HeatMapOutlined className="text-orange-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-500">
                  {telemetry.temperature_max}°C
                </span>
                <Text type="secondary" className="text-sm">~</Text>
                <span className="text-2xl font-bold text-blue-500">
                  {telemetry.temperature_min}°C
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <Text type="secondary" className="text-xs">最高</Text>
                  <div className="text-sm font-medium text-red-500">
                    {telemetry.temperature_max}°C
                  </div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">最低</Text>
                  <div className="text-sm font-medium text-blue-500">
                    {telemetry.temperature_min}°C
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 功率信息 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            className="energy-card"
            variant="borderless"
            title={
              <div className="flex items-center gap-2">
                <ThunderboltOutlined className="text-blue-500" />
                <span>功率信息</span>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <Text type="secondary" className="text-xs block mb-2">
                    充电功率
                  </Text>
                  <Text strong className="text-2xl text-blue-600">
                    {(telemetry.charge_power / 1000).toFixed(2)} kW
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-4 rounded-lg bg-green-50">
                  <Text type="secondary" className="text-xs block mb-2">
                    放电功率
                  </Text>
                  <Text strong className="text-2xl text-green-600">
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
                <HeatMapOutlined className="text-orange-500" />
                <span>设备信息</span>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="text-center p-4 rounded-lg bg-gray-50">
                  <Text type="secondary" className="text-xs block mb-2">
                    电芯数量
                  </Text>
                  <Text strong className="text-2xl text-gray-700">
                    {device.cell_count || 16} 串
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-center p-4 rounded-lg bg-gray-50">
                  <Text type="secondary" className="text-xs block mb-2">
                    电池包数量
                  </Text>
                  <Text strong className="text-2xl text-gray-700">
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
            <SafetyOutlined className="text-blue-500" />
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
          scroll={{ x: 500 }}
        />
      </Card>
    </div>
  )
}

export default DeviceDetail
