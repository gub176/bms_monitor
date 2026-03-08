import React from 'react'
import { Badge } from 'antd'

interface StatusBadgeProps {
  status: number
  type?: 'operation' | 'charge' | 'grid'
  showText?: boolean
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'operation',
  showText = true,
}) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'operation':
        switch (status) {
          case 0:
            return { color: 'gray', text: '关机' }
          case 1:
            return { color: 'green', text: '运行' }
          case 2:
            return { color: 'orange', text: '待机' }
          case 3:
            return { color: 'red', text: '故障' }
          default:
            return { color: 'gray', text: '未知' }
        }
      case 'charge':
        switch (status) {
          case 0:
            return { color: 'gray', text: '空闲' }
          case 1:
            return { color: 'blue', text: '充电' }
          case 2:
            return { color: 'green', text: '放电' }
          case 3:
            return { color: 'purple', text: '满电' }
          default:
            return { color: 'gray', text: '未知' }
        }
      case 'grid':
        switch (status) {
          case 0:
            return { color: 'gray', text: '离线' }
          case 1:
            return { color: 'green', text: '并网' }
          case 2:
            return { color: 'orange', text: '离网' }
          default:
            return { color: 'gray', text: '未知' }
        }
      default:
        return { color: 'gray', text: '未知' }
    }
  }

  const config = getStatusConfig()

  if (!showText) {
    return <Badge status={config.color as any} />
  }

  return <Badge status={config.color as any} text={config.text} />
}

export default StatusBadge
