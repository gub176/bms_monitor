import React from 'react'
import { Typography } from 'antd'

const { Text } = Typography

interface StatCardProps {
  title: string
  value: string | number
  suffix?: string
  icon: React.ReactNode
  color?: string
  colorVar?: string
  colorType?: 'primary' | 'light' | 'accent'
}

/**
 * 统计卡片组件 - 用于 Dashboard 和 Alerts 页面
 * 使用 minimalist 设计风格，白色背景 + 彩色图标
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  suffix,
  icon,
  color,
  colorVar,
  colorType
}) => (
  <div className="stat-card-minimal">
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <Text className="stat-card-label truncate block">{title}</Text>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="stat-card-value" style={{ color: colorVar || color }}>{value}</span>
          {suffix && <span className="stat-card-suffix">{suffix}</span>}
        </div>
      </div>
      <div
        className="stat-card-icon"
        data-color={colorType}
        aria-hidden="true"
      >
        {icon}
      </div>
    </div>
  </div>
)

export default StatCard
