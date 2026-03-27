import React from 'react'
import { Select, DatePicker, Button, Space } from 'antd'
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
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 text-gray-600">
        <FilterOutlined className="text-gray-500" />
        <span className="text-sm font-medium">筛选条件：</span>
      </div>

      <Space wrap size="middle">
        {/* 级别筛选 */}
        <Select
          mode="multiple"
          placeholder="告警级别"
          value={filters.levels}
          onChange={handleLevelChange}
          className="min-w-[140px]"
          allowClear
          size="small"
        >
          <Option value="critical">严重</Option>
          <Option value="warning">警告</Option>
          <Option value="info">提示</Option>
        </Select>

        {/* 设备筛选 */}
        <Select
          placeholder="设备 ID"
          value={filters.deviceId}
          onChange={handleDeviceChange}
          className="min-w-[180px]"
          allowClear
          size="small"
          showSearch
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
          className="min-w-[240px]"
        />

        {/* 重置按钮 */}
        {hasActiveFilters && (
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            size="small"
            type="primary"
            ghost
          >
            重置筛选
          </Button>
        )}
      </Space>
    </div>
  )
}

export default AlertFilters
