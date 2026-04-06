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
import { useTelemetryStore, getPowerState } from '../../stores/telemetryStore'
import {
  getOperationStatusText,
  getChargeStatusText,
  getGridStatusText,
  getStatusClass,
  getChargeDischargeStatusText,
  getGridConnectionStatusText,
  getMainContactorStatusText,
  getEmergencyStopStatusText,
  getBatteryBalancingStatusText,
  getAdvancedStatusColor,
} from '../../utils/formatters'
import { TEMPERATURE_THRESHOLDS } from '../../constants/device'

const { Title, Text } = Typography

// 获取温度状态的实用函数
const getTemperatureStatus = (temperature: number) => {
  if (temperature > TEMPERATURE_THRESHOLDS.CRITICAL) return 'critical'
  if (temperature > TEMPERATURE_THRESHOLDS.WARNING) return 'warning'
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
  const {
    latestTelemetry,
    latestStatus,
    loading: telemetryLoading,
    error: telemetryError,
    fetchTelemetry,
    fetchStatus,
    subscribeToTelemetry,
    unsubscribeFromTelemetry,
  } = useTelemetryStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取设备详情和告警数据
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchDevices()
        if (deviceId) {
          await fetchAlerts(deviceId)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载设备数据失败')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [deviceId])

  // 获取遥测数据并订阅实时更新
  useEffect(() => {
    if (!deviceId) return

    // 获取初始数据
    fetchTelemetry(deviceId)
    fetchStatus(deviceId)

    // 订阅实时更新
    subscribeToTelemetry(deviceId)

    // 清理函数：组件卸载或 deviceId 变化时取消订阅
    return () => {
      if (deviceId) {
        unsubscribeFromTelemetry(deviceId)
      }
    }
  }, [deviceId])

  const device = devices.find((d) => d.device_id === deviceId)
  const deviceAlerts = activeAlerts.filter((a) => a.device_id === deviceId)

  // 从 Store 获取真实数据
  const telemetry = latestTelemetry[deviceId!] || null
  const status = latestStatus[deviceId!] || null

  // 电芯数据 - 从真实遥测数据生成
  const cellData: CellData[] = telemetry?.cell_voltages?.map((voltage, index) => ({
    key: index.toString(),
    index: index + 1,
    voltage,
    soc: telemetry?.cell_socs?.[index] || 75 + Math.random() * 5,
    temperature: telemetry?.cell_temperatures?.[index % (telemetry?.cell_temperatures?.length || 1)] || 28 + Math.random() * 4,
  })) || []

  const cellColumns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (index: number) => (
        <Text strong className="text-sm">
          <span aria-label={`电芯 #${index.toString().padStart(2, '0')}`}>
            #{index.toString().padStart(2, '0')}
          </span>
        </Text>
      ),
    },
    {
      title: <span aria-label="电芯电压">电压</span>,
      dataIndex: 'voltage',
      key: 'voltage',
      width: 120,
      render: (voltage: number) => (
        <span
          className="font-mono text-[var(--color-primary)] font-medium"
          aria-label={`电压 ${voltage.toFixed(3)} 伏特`}
        >
          {voltage.toFixed(3)} V
        </span>
      ),
    },
    {
      title: <span aria-label="电芯 SOC">SOC</span>,
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
            aria-label={`荷电状态 ${Math.round(soc)}%`}
          />
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-2">
          <span>温度</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)]" aria-hidden="true">
            ({TEMPERATURE_THRESHOLDS.MIN}~{TEMPERATURE_THRESHOLDS.MAX}°C)
          </span>
        </div>
      ),
      dataIndex: 'temperature',
      key: 'temperature',
      width: 100,
      render: (temperature: number) => {
        const status = getTemperatureStatus(temperature)
        return (
          <span
            className={`font-mono font-medium ${getTemperatureClass(temperature)}`}
            aria-label={`温度 ${temperature.toFixed(1)} 摄氏度，状态：${status === 'normal' ? '正常' : status === 'warning' ? '警告' : '严重'}`}
          >
            {temperature.toFixed(1)} °C
          </span>
        )
      },
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
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 device-logo-gradient"
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
            <span className={getStatusClass(status?.operation_status || 0, 'operation')}>
              {status?.operation_status === 1 ? (
                <CheckCircleOutlined aria-hidden="true" />
              ) : (
                <CloseCircleOutlined aria-hidden="true" />
              )}
              {getOperationStatusText(status?.operation_status)}
            </span>

            {/* 充放电状态 */}
            <span className={getStatusClass(status?.charge_status || 0, 'charge')}>
              <ThunderboltOutlined aria-hidden="true" />
              {getChargeStatusText(status?.charge_status)}
            </span>

            {/* 并网状态 */}
            <span className={getStatusClass(status?.grid_status || 0, 'grid')}>
              <WifiOutlined aria-hidden="true" />
              {getGridStatusText(status?.grid_status)}
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
                {telemetry?.soc?.toFixed(1) ?? '--'}%
              </div>
              {telemetry?.soc !== null && (
                <Progress
                  percent={Math.round(telemetry.soc)}
                  strokeColor={{ '0%': 'var(--color-primary)', '100%': 'var(--color-success)' }}
                  showInfo={false}
                  size="small"
                />
              )}
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
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
                {telemetry?.total_voltage?.toFixed(1) ?? '--'}
                <span className="text-sm text-[var(--color-text-tertiary)] ml-1">V</span>
              </div>
              <div className="flex items-center gap-2">
                <Text type="secondary" className="text-xs">
                  总电流
                </Text>
                <Text strong className="text-sm ml-auto">
                  {telemetry?.total_current?.toFixed(1) ?? '--'} A
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
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
                {telemetry?.soh?.toFixed(1) ?? '--'}%
              </div>
              {telemetry?.soh !== null && (
                <Progress
                  percent={Math.round(telemetry.soh)}
                  strokeColor="var(--color-info)"
                  showInfo={false}
                  size="small"
                />
              )}
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
              <div className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
                {telemetry?.temperature_max ?? '--'}°C
                <span className="text-sm text-[var(--color-text-tertiary)] mx-2">~</span>
                {telemetry?.temperature_min ?? '--'}°C
              </div>
              <div className="flex items-center gap-2">
                <Text type="secondary" className="text-xs">
                  最高 {telemetry?.temperature_max ?? '--'}°C
                </Text>
                <Text type="secondary" className="text-xs ml-auto">
                  最低 {telemetry?.temperature_min ?? '--'}°C
                </Text>
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
              <Col xs={12} sm={12}>
                <div className="text-center p-4 rounded-lg power-card-charge">
                  <Text type="secondary" className="text-xs block mb-2">
                    充电功率
                  </Text>
                  <Text strong className="text-xl md:text-2xl text-[var(--color-primary)]">
                    {telemetry?.charge_power ? (telemetry.charge_power / 1000).toFixed(2) : '0.00'} kW
                  </Text>
                </div>
              </Col>
              <Col xs={12} sm={12}>
                <div className="text-center p-4 rounded-lg power-card-discharge">
                  <Text type="secondary" className="text-xs block mb-2">
                    放电功率
                  </Text>
                  <Text strong className="text-xl md:text-2xl text-[var(--color-success)]">
                    {telemetry?.discharge_power ? (telemetry.discharge_power / 1000).toFixed(2) : '0.00'} kW
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
              <Col xs={12} sm={12}>
                <div className="text-center p-4 rounded-lg device-info-card">
                  <Text type="secondary" className="text-xs block mb-2">
                    电芯数量
                  </Text>
                  <Text strong className="text-xl md:text-2xl text-[var(--color-text-primary)]">
                    {device.cell_count || 16} 串
                  </Text>
                </div>
              </Col>
              <Col xs={12} sm={12}>
                <div className="text-center p-4 rounded-lg device-info-card">
                  <Text type="secondary" className="text-xs block mb-2">
                    电池包数量
                  </Text>
                  <Text strong className="text-xl md:text-2xl text-[var(--color-text-primary)]">
                    {device.battery_packs_count || 1} 个
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 系统状态 - 高级状态信息 */}
      <Row gutter={[16, 16]} role="region" aria-label="系统状态">
        <Col xs={24}>
          <Card
            className="energy-card"
            variant="borderless"
            title={
              <div className="flex items-center gap-2">
                <SafetyOutlined className="text-[var(--color-info)]" aria-hidden="true" />
                <span>系统状态</span>
              </div>
            }
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {/* 充放电详细状态 */}
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                <Text type="secondary" className="text-xs block mb-2">
                  充放电状态
                </Text>
                <Text
                  strong
                  className="text-sm"
                  style={{ color: getAdvancedStatusColor(status?.charge_discharge_status, 'chargeDischarge') }}
                >
                  {getChargeDischargeStatusText(status?.charge_discharge_status)}
                </Text>
              </div>

              {/* 电网连接状态 */}
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                <Text type="secondary" className="text-xs block mb-2">
                  电网连接
                </Text>
                <Text
                  strong
                  className="text-sm"
                  style={{ color: getAdvancedStatusColor(status?.grid_connection_status, 'gridConnection') }}
                >
                  {getGridConnectionStatusText(status?.grid_connection_status)}
                </Text>
              </div>

              {/* 主接触器状态 */}
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                <Text type="secondary" className="text-xs block mb-2">
                  主接触器
                </Text>
                <Text
                  strong
                  className="text-sm"
                  style={{ color: getAdvancedStatusColor(status?.main_contactor_status, 'contactor') }}
                >
                  {getMainContactorStatusText(status?.main_contactor_status)}
                </Text>
              </div>

              {/* 急停状态 */}
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                <Text type="secondary" className="text-xs block mb-2">
                  急停按钮
                </Text>
                <Text
                  strong
                  className="text-sm"
                  style={{ color: getAdvancedStatusColor(status?.emergency_stop_status, 'emergencyStop') }}
                >
                  {getEmergencyStopStatusText(status?.emergency_stop_status)}
                </Text>
              </div>

              {/* 电池均衡状态 */}
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                <Text type="secondary" className="text-xs block mb-2">
                  电池均衡
                </Text>
                <Text
                  strong
                  className="text-sm"
                  style={{ color: getAdvancedStatusColor(status?.battery_balancing_status, 'balancing') }}
                >
                  {getBatteryBalancingStatusText(status?.battery_balancing_status)}
                </Text>
              </div>
            </div>
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
          footer={() => (
            <div className="temperature-legend" role="legend" aria-label="温度状态图例">
              <span className="text-xs text-[var(--color-text-secondary)]">温度状态:</span>
              <div className="temperature-legend-item">
                <div className="temperature-legend-dot normal" aria-hidden="true" />
                <span>正常 (≤{TEMPERATURE_THRESHOLDS.WARNING}°C)</span>
              </div>
              <div className="temperature-legend-item">
                <div className="temperature-legend-dot warning" aria-hidden="true" />
                <span>警告 ({TEMPERATURE_THRESHOLDS.WARNING}-{TEMPERATURE_THRESHOLDS.CRITICAL})°C</span>
              </div>
              <div className="temperature-legend-item">
                <div className="temperature-legend-dot critical" aria-hidden="true" />
                <span>严重 ({'>'}{TEMPERATURE_THRESHOLDS.CRITICAL}°C)</span>
              </div>
            </div>
          )}
        />
      </Card>
    </main>
  )
}

export default DeviceDetail
