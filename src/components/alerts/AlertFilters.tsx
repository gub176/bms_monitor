import React from 'react'
import { Select, DatePicker, Button, Space, Tag } from 'antd'
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAlertStore } from '../../stores/alertStore'
import type { RangePickerProps } from 'antd/es/date-picker'

const { Option } = Select
const { RangePicker } = DatePicker

interface AlertFiltersProps {
  onReset?: () => void
}

/**
 * 告警筛选器组件
 * 功能：按级别、设备、时间范围筛选告警
 */
export const AlertFilters: React.FC<AlertFiltersProps> = ({ onReset }) => {
  const { filters, setFilters, resetFilters, deviceOptions } = useAlertStore()

  const handleLevelChange = (values: string[]) => {
    setFilters({ levels: values })
  }

  const handleDeviceChange = (value: string) => {
    setFilters({ deviceId: value || undefined })
  }

  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({
        dateRange: [dates[0].toISOString(), dates[1].toISOString()],
      })
    } else {
      setFilters({ dateRange: undefined })
    }
  }

  const handleReset = () => {
    resetFilters()
    onReset?.()
  }

  const hasActiveFilters =
    filters.levels.length > 0 || filters.deviceId || filters.dateRange

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg energy-card" style={{ background: 'var(--login-bg-secondary)' }}>
      <div className="flex items-center gap-2" style={{ color: 'var(--login-text-secondary)' }}>
        <FilterOutlined style={{ color: 'var(--login-text-tertiary)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--login-text-primary)' }}>筛选条件：</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* 级别筛选 */}
        <Select
          mode="multiple"
          placeholder="告警级别"
          value={filters.levels}
          onChange={handleLevelChange}
          style={{ width: 200, borderColor: 'var(--login-border)' }}
          allowClear
          size="small"
          aria-label="按级别筛选告警"
        >
          <Option value="critical">严重</Option>
          <Option value="warning">警告</Option>
          <Option value="info">提示</Option>
        </Select>

        {/* 设备筛选 - 支持搜索过滤 */}
        <Select
          placeholder="设备 ID"
          value={filters.deviceId}
          onChange={handleDeviceChange}
          style={{ width: 300, borderColor: 'var(--login-border)' }}
          allowClear
          size="small"
          showSearch
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
          }
          aria-label="按设备筛选告警"
        >
          {deviceOptions.map((device) => (
            <Option key={device.value} value={device.value}>
              {device.label}
            </Option>
          ))}
        </Select>

        {/* 时间范围筛选 */}
        <RangePicker
          value={filters.dateRange ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])] : null}
          onChange={handleDateRangeChange}
          size="small"
          style={{ borderColor: 'var(--login-border)' }}
          aria-label="按时间范围筛选告警"
        />

        {/* 重置按钮 + 筛选状态提示 */}
        {hasActiveFilters && (
          <Space size="small">
            <Tag color="blue" className="font-medium" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              筛选中
            </Tag>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              size="small"
              type="primary"
              ghost
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              重置
            </Button>
          </Space>
        )}
      </div>
    </div>
  )
}

export default AlertFilters
