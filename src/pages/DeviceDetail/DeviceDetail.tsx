import React, { useEffect, useState, useMemo } from 'react'
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
  Skeleton,
  Badge,
} from 'antd'
import {
  ThunderboltOutlined,
  HeatMapOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { useDeviceStore } from '../../stores/deviceStore'
import { useAlertStore } from '../../stores/alertStore'
import { useTelemetryStore, extractTelemetryData } from '../../stores/telemetryStore'
import {
  getOperationStatusText,
  getChargeDischargeStatusText,
  getGridConnectionStatusText,
  getMainContactorStatusText,
  getEmergencyStopStatusText,
  getBatteryBalancingStatusText,
  getAdvancedStatusColor,
} from '../../utils/formatters'
import { TEMPERATURE_THRESHOLDS } from '../../constants/device'

const { Text } = Typography

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
    fetchTelemetry,
    fetchStatus,
    subscribeToDevice,
    unsubscribeFromDevice,
    realtimeConnected,
    syncMode,
  } = useTelemetryStore()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshCountdown, setRefreshCountdown] = useState(30)

  // 获取设备详情和告警数据
  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        await fetchDevices()
        if (!mounted) return

        if (deviceId) {
          await fetchAlerts(deviceId)
        }
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : '加载设备数据失败')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    loadData()

    return () => {
      mounted = false
    }
  }, [deviceId])

  // 获取遥测数据并管理混合模式同步
  useEffect(() => {
    if (!deviceId) return

    // 初始获取数据
    fetchTelemetry(deviceId)
    fetchStatus(deviceId)

    // 订阅 Realtime 更新
    subscribeToDevice(deviceId)

    // 倒计时器 - 始终在归零时刷新（Realtime 作为补充，轮询作为保障）
    const countdownInterval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          // 始终刷新数据，Realtime 可能有但不可靠
          fetchTelemetry(deviceId)
          fetchStatus(deviceId)
          return 30
        }
        return prev - 1
      })
    }, 1000)

    // 清理函数
    return () => {
      clearInterval(countdownInterval)
      unsubscribeFromDevice(deviceId)
    }
  }, [deviceId])

  const device = devices.find((d) => d.device_id === deviceId)
  const deviceAlerts = activeAlerts.filter((a) => a.device_id === deviceId)

  // 从 Store 获取真实数据
  const telemetry = latestTelemetry[deviceId!] || null
  const status = latestStatus[deviceId!] || null

  // 从 data JSON 字段提取遥测数据
  const extractedTelemetry = extractTelemetryData(telemetry)

  // 电芯数据 - 使用 useMemo 缓存计算结果
  const cellData: CellData[] = useMemo(() => {
    if (!telemetry?.cell_voltages) return []
    return telemetry.cell_voltages.map((voltageMv, index) => ({
      key: index.toString(),
      index: index + 1,
      voltage: voltageMv / 1000,
      soc: telemetry?.cell_socs?.[index] ? telemetry.cell_socs[index] / 10 : 75,
      temperature: telemetry?.cell_temperatures?.[index % (telemetry?.cell_temperatures?.length || 1)]
        ? telemetry.cell_temperatures[index % telemetry.cell_temperatures.length] / 10
        : 25,
    }))
  }, [telemetry?.cell_voltages, telemetry?.cell_socs, telemetry?.cell_temperatures])

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

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Empty description="暂无设备，请先在仪表盘绑定设备" />
        <Button type="primary" className="mt-4" onClick={() => navigate('/dashboard')}>
          返回仪表盘
        </Button>
      </div>
    )
  }

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px]">
        <Empty description={`设备 ${deviceId} 不存在或您没有访问权限`} />
        <div className="mt-4 flex gap-2">
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            返回仪表盘
          </Button>
          <Button onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      </div>
    )
  }

  const isOnline = device.status === 'online'

  return (
    <main className="space-y-4" aria-label="设备详情页">
      {/* 头部信息卡片 - 紧凑两层布局 */}
      <Card className="energy-card" variant="borderless">
        {/* 第一层：设备信息 */}
        <div className="flex items-center gap-4">
          {/* 设备信息 */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base">{device.manufacturer || 'BMS 设备'} - {device.device_id}</span>
                <Badge
                  color={isOnline ? 'green' : 'default'}
                  text={<span className="font-bold">{isOnline ? '在线' : '离线'}</span>}
                  className="text-xs"
                />
                {deviceAlerts.length > 0 && (
                  <Badge
                    color="red"
                    text={<span className="font-bold">{deviceAlerts.length} 个告警</span>}
                    className="text-xs"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 倒计时和同步模式指示器 */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* 同步模式指示器 */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-bg-page)]" title={syncMode === 'realtime' ? 'Realtime 实时同步' : syncMode === 'fallback' ? '降级轮询模式' : '轮询模式'}>
              <div
                className={`w-2 h-2 rounded-full ${
                  syncMode === 'realtime' ? 'bg-[var(--color-success)]' :
                  syncMode === 'fallback' ? 'bg-[var(--color-warning)]' :
                  'bg-[var(--color-info)]'
                }`}
              />
              <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                {syncMode === 'realtime' ? 'RT' : syncMode === 'fallback' ? 'FB' : 'PL'}
              </span>
            </div>

            {/* 倒计时 */}
            <Progress
              type="circle"
              percent={(refreshCountdown / 30) * 100}
              size={40}
              strokeColor={refreshCountdown <= 5 ? 'var(--color-warning)' : 'var(--color-primary)'}
              format={() => (
                <span className="text-xs font-mono">{refreshCountdown}s</span>
              )}
            />
          </div>
        </div>

        {/* 分隔线 */}
        <div className="my-4 border-t border-[var(--color-border)]" />

        {/* 第二层：详细状态 - 3 列布局 */}
        <Row gutter={[16, 16]}>
          {/* 第 1 列 */}
          <Col xs={24} sm={12} lg={8}>
            <div className="energy-card" style={{ padding: '12px', height: '100%' }}>
              <div className="space-y-3">
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                  <Text type="secondary" className="text-xs block mb-2">
                    运行状态：
                  </Text>
                  <Text strong className="text-sm" style={{ color: getAdvancedStatusColor(status?.operation_status, 'chargeDischarge') }}>
                    {getOperationStatusText(status?.operation_status)}
                  </Text>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                  <Text type="secondary" className="text-xs block mb-2">
                    充放电状态：
                  </Text>
                  <Text
                    strong
                    className="text-sm"
                    style={{ color: getAdvancedStatusColor(status?.charge_discharge_status, 'chargeDischarge') }}
                  >
                    {getChargeDischargeStatusText(status?.charge_discharge_status)}
                  </Text>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                  <Text type="secondary" className="text-xs block mb-2">
                    主接触器：
                  </Text>
                  <Text
                    strong
                    className="text-sm"
                    style={{ color: getAdvancedStatusColor(status?.main_contactor_status, 'contactor') }}
                  >
                    {getMainContactorStatusText(status?.main_contactor_status)}
                  </Text>
                </div>
              </div>
            </div>
          </Col>

          {/* 第 2 列 */}
          <Col xs={24} sm={12} lg={8}>
            <div className="energy-card" style={{ padding: '12px', height: '100%' }}>
              <div className="space-y-3">
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                  <Text type="secondary" className="text-xs block mb-2">
                    并网状态：
                  </Text>
                  <Text strong className="text-sm" style={{ color: getAdvancedStatusColor(status?.grid_connection_status, 'gridConnection') }}>
                    {getGridConnectionStatusText(status?.grid_connection_status)}
                  </Text>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                  <Text type="secondary" className="text-xs block mb-2">
                    电网连接：
                  </Text>
                  <Text
                    strong
                    className="text-sm"
                    style={{ color: getAdvancedStatusColor(status?.grid_connection_status, 'gridConnection') }}
                  >
                    {getGridConnectionStatusText(status?.grid_connection_status)}
                  </Text>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                  <Text type="secondary" className="text-xs block mb-2">
                    电池均衡：
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
            </div>
          </Col>

          {/* 第 3 列 */}
          <Col xs={24} sm={12} lg={8}>
            <div className="energy-card" style={{ padding: '12px', height: '100%' }}>
              <div className="space-y-3">
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                  <Text type="secondary" className="text-xs block mb-2">
                    充放电：
                  </Text>
                  <Text
                    strong
                    className="text-sm"
                    style={{ color: getAdvancedStatusColor(status?.charge_discharge_status, 'chargeDischarge') }}
                  >
                    {getChargeDischargeStatusText(status?.charge_discharge_status)}
                  </Text>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--color-bg-page)' }}>
                  <Text type="secondary" className="text-xs block mb-2">
                    急停按钮：
                  </Text>
                  <Text
                    strong
                    className="text-sm"
                    style={{ color: getAdvancedStatusColor(status?.emergency_stop_status, 'emergencyStop') }}
                  >
                    {getEmergencyStopStatusText(status?.emergency_stop_status)}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
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
                {extractedTelemetry?.soc ? extractedTelemetry.soc.toFixed(1) : '--'}%
              </div>
              {extractedTelemetry?.soc && (
                <Progress
                  percent={Math.round(extractedTelemetry.soc)}
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
                {extractedTelemetry?.total_voltage ? extractedTelemetry.total_voltage.toFixed(1) : '--'}
                <span className="text-sm text-[var(--color-text-tertiary)] ml-1">V</span>
              </div>
              <div className="flex items-center gap-2">
                <Text type="secondary" className="text-xs">
                  总电流
                </Text>
                <Text strong className="text-sm ml-auto">
                  {extractedTelemetry?.total_current ? extractedTelemetry.total_current.toFixed(1) : '--'} A
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
                {extractedTelemetry?.soh ? extractedTelemetry.soh.toFixed(1) : '--'}%
              </div>
              {extractedTelemetry?.soh && (
                <Progress
                  percent={Math.round(extractedTelemetry.soh)}
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
                {extractedTelemetry?.temperature_max ?? '--'}°C
                <span className="text-sm text-[var(--color-text-tertiary)] mx-2">~</span>
                {extractedTelemetry?.temperature_min ?? '--'}°C
              </div>
              <div className="flex items-center gap-2">
                <Text type="secondary" className="text-xs">
                  最高 {extractedTelemetry?.temperature_max ?? '--'}°C
                </Text>
                <Text type="secondary" className="text-xs ml-auto">
                  最低 {extractedTelemetry?.temperature_min ?? '--'}°C
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
                    {extractedTelemetry?.charge_power ? (extractedTelemetry.charge_power / 1000).toFixed(2) : '0.00'} kW
                  </Text>
                </div>
              </Col>
              <Col xs={12} sm={12}>
                <div className="text-center p-4 rounded-lg power-card-discharge">
                  <Text type="secondary" className="text-xs block mb-2">
                    放电功率
                  </Text>
                  <Text strong className="text-xl md:text-2xl text-[var(--color-success)]">
                    {extractedTelemetry?.discharge_power ? (extractedTelemetry.discharge_power / 1000).toFixed(2) : '0.00'} kW
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
