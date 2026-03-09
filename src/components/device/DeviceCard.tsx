import React from 'react'
import { Card, Badge, Tag, Typography, Space } from 'antd'
import { ThunderboltOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons'
import type { Device } from '../../types/database'
import { formatRelativeTime } from '../../utils/formatters'

const { Text } = Typography

interface DeviceCardProps {
  device: Device
  onClick?: () => void
  isActive?: boolean
  alertsCount?: number
}

const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onClick,
  isActive,
  alertsCount = 0,
}) => {
  const isOnline = device.last_online
    ? new Date(device.last_online).getTime() > Date.now() - 5 * 60 * 1000
    : false

  const cardClass = `cursor-pointer transition-all duration-200 hover:shadow-lg ${
    isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
  }`

  return (
    <Card
      className={cardClass}
      onClick={onClick}
      hoverable
      variant="outlined"
      size="small"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ThunderboltOutlined className="text-blue-500 text-lg" />
          <Text strong className="text-base">
            {device.device_id}
          </Text>
        </div>
        {isOnline ? (
          <Badge status="success" text="在线" />
        ) : (
          <Badge status="default" text="离线" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Text type="secondary" className="text-sm">
            {isOnline ? (
              <WifiOutlined className="text-green-500" />
            ) : (
              <DisconnectOutlined className="text-gray-400" />
            )}
          </Text>
          {device.last_online && (
            <Text type="secondary" className="text-xs">
              {formatRelativeTime(device.last_online)}
            </Text>
          )}
        </div>

        {(device.manufacturer || device.fw_version) && (
          <div className="flex flex-wrap gap-1">
            {device.manufacturer && (
              <Tag color="blue" className="text-xs">
                {device.manufacturer}
              </Tag>
            )}
            {device.fw_version && (
              <Tag color="green" className="text-xs">
                v{device.fw_version}
              </Tag>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Space size="small">
            {device.cell_count && (
              <Text type="secondary" className="text-xs">
                {device.cell_count} 串
              </Text>
            )}
            {device.battery_packs_count && (
              <Text type="secondary" className="text-xs">
                {device.battery_packs_count} 包
              </Text>
            )}
          </Space>
          {alertsCount > 0 && (
            <Badge count={alertsCount} size="small" color="red" />
          )}
        </div>
      </div>
    </Card>
  )
}

export default DeviceCard
