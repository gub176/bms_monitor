import React from 'react'
import { Empty, Typography, Button } from 'antd'
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

interface AlertEmptyStateProps {
  type: 'active' | 'history' | 'all'
  onRefresh?: () => void
  onClearFilters?: () => void
  hasActiveFilters?: boolean
}

/**
 * 告警空状态组件
 * 根据不同场景显示不同的空状态提示
 */
export const AlertEmptyState: React.FC<AlertEmptyStateProps> = ({
  type,
  onRefresh,
  onClearFilters,
  hasActiveFilters = false,
}) => {
  const config = {
    active: {
      icon: <CheckCircleOutlined className="text-5xl text-green-500" />,
      title: '暂无活动告警',
      description: '系统运行正常，所有设备状态良好',
    },
    history: {
      icon: <InfoCircleOutlined className="text-5xl text-gray-400" />,
      title: '暂无历史告警',
      description: '系统运行以来未产生任何告警记录',
    },
    all: {
      icon: <CheckCircleOutlined className="text-5xl text-blue-500" />,
      title: '暂无告警数据',
      description: '当前筛选条件下没有匹配的告警记录',
    },
  }

  const { icon, title, description } = config[type]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4">{icon}</div>
      <Typography.Title level={4} className="!mb-2 text-gray-800">
        {title}
      </Typography.Title>
      <Typography.Text type="secondary" className="mb-6 text-center max-w-md">
        {description}
      </Typography.Text>

      <div className="flex gap-3">
        {hasActiveFilters && (
          <Button
            icon={<ReloadOutlined />}
            onClick={onClearFilters}
            size="middle"
          >
            清除筛选
          </Button>
        )}
        {onRefresh && (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            size="middle"
          >
            刷新数据
          </Button>
        )}
      </div>
    </div>
  )
}

export default AlertEmptyState
