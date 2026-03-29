import React, { useState, useMemo } from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useAlertStore } from '../../stores/alertStore'

/**
 * 告警关键词搜索组件
 * 功能：搜索告警消息内容（alert_type、description）
 * 使用防抖处理避免频繁触发
 */
export const AlertSearch: React.FC = () => {
  const { searchKeyword, setSearchKeyword } = useAlertStore()
  const [value, setValue] = useState(searchKeyword)

  // 防抖处理（300ms）
  const debouncedSetSearchKeyword = useMemo(() => {
    const timeoutIdRef = React.createRef<number>()

    return (keyword: string) => {
      if (timeoutIdRef.current) {
        window.clearTimeout(timeoutIdRef.current)
      }
      timeoutIdRef.current = window.setTimeout(() => {
        setSearchKeyword(keyword)
      }, 300)
    }
  }, [setSearchKeyword])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSetSearchKeyword(newValue)
  }

  const handleClear = () => {
    setValue('')
    setSearchKeyword('')
  }

  return (
    <div className="w-full max-w-md">
      <Input.Search
        placeholder="搜索告警类型或描述..."
        value={value}
        onChange={handleChange}
        onClear={handleClear}
        allowClear
        size="middle"
        prefix={<SearchOutlined style={{ color: 'var(--login-text-tertiary)' }} />}
        className="alert-search-input"
        style={{ borderColor: 'var(--login-border)' }}
        aria-label="搜索告警"
      />
    </div>
  )
}

export default AlertSearch
