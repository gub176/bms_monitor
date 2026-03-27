import React, { useEffect } from 'react'
import { Table, Tag, Typography, Empty, Spin, Card, Tabs, Badge, Button, Space, Checkbox, message as antMessage } from 'antd'
import {
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ExportOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons'
import { useAlertStore } from '../../stores/alertStore'
import { AlertFilters } from '../../components/alerts/AlertFilters'
import { AlertSearch } from '../../components/alerts/AlertSearch'
import { AlertEmptyState } from '../../components/alerts/AlertEmptyState'
import { formatDateTime } from '../../utils/formatters'
import { exportAlertsToCSV } from '../../utils/export'
import type { Alert } from '../../types/database'

const { Text } = Typography

const AlertLevelTag: React.FC<{ level?: string }> = ({ level }) => {
  const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
    info: {
      color: 'blue',
      icon: <InfoCircleOutlined />,
      text: '提示',
    },
    warning: {
      color: 'orange',
      icon: <WarningOutlined />,
      text: '警告',
    },
    critical: {
      color: 'red',
      icon: <ExclamationCircleOutlined />,
      text: '严重',
    },
  }
  const { color, icon, text } =
    config[level?.toLowerCase() ?? 'info'] || { color: 'gray', icon: null, text: level || '未知' }
  return (
    <Tag color={color} className="px-2 py-0.5 text-xs font-medium">
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </Tag>
  )
}

const Alerts: React.FC = () => {
  const {
    alerts,
    activeAlerts,
    loading,
    error,
    fetchAlerts,
    getFilteredAlerts,
    resetFilters,
    filters,
    searchKeyword,
    selectedAlertIds,
    toggleAlertSelection,
    clearSelection,
    bulkMarkAsRead,
  } = useAlertStore()

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const handleExport = () => {
    const filteredAlerts = getFilteredAlerts()
    exportAlertsToCSV(filteredAlerts)
    antMessage.success('导出成功')
  }

  const handleBulkMarkAsRead = async () => {
    if (selectedAlertIds.length === 0) {
      antMessage.warning('请先选择告警')
      return
    }
    await bulkMarkAsRead()
    antMessage.success(`已标记 ${selectedAlertIds.length} 条告警为已读`)
  }

  // 使用筛选后的告警列表
  const filteredAlerts = getFilteredAlerts()
  const filteredActiveAlerts = filteredAlerts.filter((a) => a.end_time === null)
  const filteredHistoryAlerts = filteredAlerts.filter((a) => a.end_time !== null)

  const columns = [
    {
      title: <Checkbox checked={selectedAlertIds.length > 0} onChange={() => {}} disabled />,
      dataIndex: 'id',
      key: 'selection',
      width: 50,
      render: (id: string) => (
        <Checkbox
          checked={selectedAlertIds.includes(id)}
          onChange={() => toggleAlertSelection(id)}
        />
      ),
    },
    {
      title: '级别',
      dataIndex: 'alert_level',
      key: 'alert_level',
      width: 90,
      render: (level: string) => <AlertLevelTag level={level} />,
    },
    {
      title: '告警类型',
      dataIndex: 'alert_type',
      key: 'alert_type',
      width: 140,
      render: (text: string) => (
        <Text strong className="text-sm">
          {text}
        </Text>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 250,
      render: (text: string) => (
        <Text type="secondary" className="text-sm">
          {text}
        </Text>
      ),
    },
    {
      title: '设备 ID',
      dataIndex: 'device_id',
      key: 'device_id',
      width: 200,
      render: (text: string) => (
        <span className="font-mono text-gray-600 text-sm">{text}</span>
      ),
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 170,
      render: (time: string) => (
        <Text className="text-sm">{formatDateTime(time)}</Text>
      ),
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 170,
      render: (time: string | null) => (
        <Text type="secondary" className="text-sm">
          {time ? formatDateTime(time) : '—'}
        </Text>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 90,
      render: (_: unknown, record: Alert) =>
        record.end_time === null ? (
          <Tag color="red" className="text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1 animate-pulse" />
            活动中
          </Tag>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="success" className="text-xs">
            已恢复
          </Tag>
        ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" description="加载告警列表..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Empty description={error} />
      </div>
    )
  }

  const historyAlerts = alerts.filter((a) => a.end_time !== null)

  const historyAlerts = alerts.filter((a) => a.end_time !== null)

  return (
    <div className="space-y-3">
      {/* 页面标题 */}
      <Card className="energy-card" variant="borderless">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <AlertOutlined className="text-lg text-white" />
            </div>
            <div>
              <Typography.Title level={5} className="!mb-0.5">
                告警中心
              </Typography.Title>
              <Text type="secondary" className="text-xs">
                实时监控系统告警，及时处理异常情况
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-500">{filteredActiveAlerts.length}</div>
              <Text type="secondary" className="text-xs">
                活动告警
              </Text>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-xl font-bold text-gray-600">{filteredHistoryAlerts.length}</div>
              <Text type="secondary" className="text-xs">
                历史告警
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* 筛选和搜索 */}
      <Card className="energy-card" variant="borderless">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <AlertSearch />
            <Space>
              {selectedAlertIds.length > 0 && (
                <Button
                  type="primary"
                  icon={<CheckSquareOutlined />}
                  onClick={handleBulkMarkAsRead}
                  size="small"
                >
                  标记已选为已读 ({selectedAlertIds.length})
                </Button>
              )}
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
                size="small"
              >
                导出 CSV
              </Button>
            </Space>
          </div>
          <AlertFilters onReset={resetFilters} />
        </div>
      </Card>

      {/* 告警列表 */}
      <Card className="energy-card" variant="borderless">
        <Tabs
          size="small"
          items={[
            {
              key: 'active',
              label: (
                <Badge count={filteredActiveAlerts.length} offset={[-8, 0]} size="small">
                  <span className="text-sm font-medium">活动告警</span>
                </Badge>
              ),
              children:
                filteredActiveAlerts.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={filteredActiveAlerts}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="energy-table"
                    scroll={{ x: 1000 }}
                  />
                ) : (
                  <AlertEmptyState
                    type="active"
                    onRefresh={() => fetchAlerts()}
                    onClearFilters={resetFilters}
                    hasActiveFilters={
                      filters.levels.length > 0 || filters.deviceId || filters.dateRange || searchKeyword !== ''
                    }
                  />
                ),
            },
            {
              key: 'history',
              label: <span className="text-sm font-medium">历史记录 ({filteredHistoryAlerts.length})</span>,
              children:
                filteredHistoryAlerts.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={filteredHistoryAlerts}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                    size="small"
                    className="energy-table"
                    scroll={{ x: 1000 }}
                  />
                ) : (
                  <AlertEmptyState
                    type="history"
                    onRefresh={() => fetchAlerts()}
                    onClearFilters={resetFilters}
                    hasActiveFilters={
                      filters.levels.length > 0 || filters.deviceId || filters.dateRange || searchKeyword !== ''
                    }
                  />
                ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default Alerts
