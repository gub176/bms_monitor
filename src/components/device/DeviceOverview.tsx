import React from 'react'
import { Card, Statistic, Progress, Row, Col, Typography, Space, Tag } from 'antd'
import {
  ThunderboltOutlined,
  WifiOutlined,
  HeatMapOutlined,
} from '@ant-design/icons'
import type { Telemetry, Status } from '../../types/database'
import {
  formatVoltage,
  formatCurrent,
  formatPower,
  formatPercent,
  formatTemperature,
} from '../../utils/formatters'
import StatusBadge from '../device/StatusBadge'

const { Title, Text } = Typography

interface DeviceOverviewProps {
  telemetry: Telemetry | undefined
  status: Status | undefined
}

const DeviceOverview: React.FC<DeviceOverviewProps> = ({ telemetry, status }) => {
  return (
    <div className="space-y-4">
      {/* 状态卡片 */}
      <Card title="设备状态" size="small">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Space direction="vertical" size="small">
              <Text type="secondary">运行状态</Text>
              {status?.operation_status !== undefined && (
                <StatusBadge status={status.operation_status} type="operation" />
              )}
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" size="small">
              <Text type="secondary">充放电状态</Text>
              {status?.charge_status !== undefined && (
                <StatusBadge status={status.charge_status} type="charge" />
              )}
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" size="small">
              <Text type="secondary">并网状态</Text>
              {status?.grid_status !== undefined && (
                <StatusBadge status={status.grid_status} type="grid" />
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 关键参数 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="SOC"
              value={telemetry?.soc || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ThunderboltOutlined />}
            />
            <Progress
              percent={telemetry?.soc || 0}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              showInfo={false}
              className="mt-2"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="总电压"
              value={telemetry?.total_voltage || 0}
              suffix="V"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="总电流"
              value={telemetry?.total_current || 0}
              suffix="A"
              precision={2}
              valueStyle={{ color: '#faad14' }}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="SOH"
              value={telemetry?.soh || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ThunderboltOutlined />}
            />
            <Progress
              percent={telemetry?.soh || 0}
              strokeColor="#722ed1"
              showInfo={false}
              className="mt-2"
            />
          </Card>
        </Col>
      </Row>

      {/* 功率和温度 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card size="small" title="功率信息">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">充电功率</Text>
                  <Text strong className="text-lg">
                    {formatPower(telemetry?.charge_power)}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">放电功率</Text>
                  <Text strong className="text-lg">
                    {formatPower(telemetry?.discharge_power)}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="温度信息">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">最高温度</Text>
                  <Text strong className="text-lg text-red-500">
                    {formatTemperature(telemetry?.temperature_max)}
                  </Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">最低温度</Text>
                  <Text strong className="text-lg text-blue-500">
                    {formatTemperature(telemetry?.temperature_min)}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DeviceOverview
