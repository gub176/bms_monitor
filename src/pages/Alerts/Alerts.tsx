import React, { useEffect } from 'react'
import { Table, Tag, Typography, Tabs, Badge, Button, Space, Checkbox, message as antMessage, Row, Col, Card, Empty, Spin } from 'antd'
import {
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ExportOutlined,
  CheckSquareOutlined,
  ArrowUpOutlined,
  FireOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { useAlertStore } from '../../stores/alertStore'
import { AlertFilters } from '../../components/alerts/AlertFilters'
import { AlertSearch } from '../../components/alerts/AlertSearch'
import { formatDateTime } from '../../utils/formatters'
import { exportAlertsToCSV } from '../../utils/export'
import type { Alert } from '../../types/database'

const { Text, Title } = Typography

// 告警类型中文化映射
const getAlertTypeChinese = (type: string): string => {
  const typeMap: Record<string, string> = {
    short_circuit: '短路',
    undervoltage: '欠压',
    overvoltage: '过压',
    cell_voltage_high_warning: '电芯电压过高',
    cell_voltage_low_warning: '电芯电压过低',
    cell_low_temperature_warning: '温度过低',
  }
  return typeMap[type] || type
}

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
    loading,
    error,
    fetchAlerts,
    getFilteredAlerts,
    resetFilters,
    filters,
    searchKeyword,
    selectedAlertIds,
    toggleAlertSelection,
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
      title: (
        <Checkbox
          checked={selectedAlertIds.length === alerts.length && alerts.length > 0}
          onChange={() => {}}
          disabled
          aria-label="全选/取消全选告警"
        />
      ),
      dataIndex: 'id',
      key: 'selection',
      width: 50,
      render: (id: string) => (
        <Checkbox
          checked={selectedAlertIds.includes(id)}
          onChange={() => toggleAlertSelection(id)}
          aria-label={`选择或取消选择告警 ${id}`}
        />
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => <AlertLevelTag level={level} />,
    },
    {
      title: '告警类型',
      dataIndex: 'alert_type',
      key: 'alert_type',
      width: 140,
      render: (text: string) => (
        <Text strong className="text-sm">
          {getAlertTypeChinese(text)}
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

  return (
    <div className="space-y-4">
      {/* 统计卡片区域 - 重新设计 */}
      <Card className="energy-card" variant="borderless">
        <div className="mb-4">
          <Title level={4} className="!mb-1" style={{ color: 'var(--login-text-primary)' }}>告警中心</Title>
          <Text type="secondary" style={{ color: 'var(--login-text-secondary)' }}>实时监控系统告警，及时处理异常情况</Text>
        </div>

        <Row gutter={[16, 16]}>
          {/* 活动告警卡片 - 强调显示 */}
          <Col xs={24} sm={12} lg={6}>
            <div className="relative overflow-hidden rounded-xl p-4 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-error) 0%, #d9363e 100%)' }}>
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-white/10" style={{ borderRadius: '50%' }} />
              <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/10" style={{ borderRadius: '50%' }} />
              <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <FireOutlined className="text-xl" />
                  </div>
                  <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>活动告警</Text>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{filteredActiveAlerts.length}</span>
                  {filteredActiveAlerts.length > 0 && (
                    <ArrowUpOutlined className="text-yellow-300" />
                  )}
                </div>
                <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>需要立即处理</Text>
              </div>
            </div>
          </Col>

          {/* 历史告警卡片 */}
          <Col xs={24} sm={12} lg={6}>
            <div className="relative overflow-hidden rounded-xl p-4 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }}>
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rounded-full bg-white/10" style={{ borderRadius: '50%' }} />
              <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <HistoryOutlined className="text-xl" />
                  </div>
                  <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>历史告警</Text>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{filteredHistoryAlerts.length}</span>
                  <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>条记录</span>
                </div>
                <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>已归档数据</Text>
              </div>
            </div>
          </Col>

          {/* 严重告警统计 */}
          <Col xs={24} sm={12} lg={6}>
            <div className="overflow-hidden rounded-xl p-4 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-warning) 0%, #f59e0b 100%)' }}>
              <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <ExclamationCircleOutlined className="text-xl" />
                  </div>
                  <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>严重告警</Text>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {alerts.filter(a => a.severity === 1 && a.end_time === null).length}
                  </span>
                </div>
                <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>级别 1 · 需立即响应</Text>
              </div>
            </div>
          </Col>

          {/* 今日告警统计 */}
          <Col xs={24} sm={12} lg={6}>
            <div className="overflow-hidden rounded-xl p-4 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-primary) 100%)' }}>
              <div className="relative z-10">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                    <AlertOutlined className="text-xl" />
                  </div>
                  <Text className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>今日告警</Text>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {alerts.filter(a => {
                      const today = new Date().toDateString()
                      return new Date(a.start_time).toDateString() === today
                    }).length}
                  </span>
                </div>
                <Text className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</Text>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 筛选和搜索区域 */}
      <Card className="energy-card" variant="borderless">
        <div className="flex flex-col gap-4">
          {/* 搜索和操作栏 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <AlertSearch />
            </div>
            <Space size="small">
              {selectedAlertIds.length > 0 && (
                <Badge count={selectedAlertIds.length} size="small" offset={[-5, 5]}>
                  <Button
                    type="primary"
                    icon={<CheckSquareOutlined />}
                    onClick={handleBulkMarkAsRead}
                    size="small"
                  >
                    标记已读
                  </Button>
                </Badge>
              )}
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
                size="small"
                className="flex items-center gap-1"
                title={`导出 ${filteredAlerts.length} 条记录`}
              >
                导出 CSV
                {filteredAlerts.length > 0 && (
                  <span className="text-xs" style={{ color: 'var(--login-text-tertiary)', marginLeft: '4px' }}>
                    ({filteredAlerts.length})
                  </span>
                )}
              </Button>
            </Space>
          </div>

          {/* 筛选器 */}
          <AlertFilters onReset={resetFilters} />
        </div>
      </Card>

      {/* 告警列表 - 使用 Tab 分离活动和历史告警 */}
      <Card className="energy-card" variant="borderless">
        <Tabs
          size="large"
          destroyInactiveTabPane
          items={[
            {
              key: 'active',
              label: (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    {filteredActiveAlerts.length > 0 && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                    )}
                    <span className={`relative inline-flex h-3 w-3 rounded-full ${filteredActiveAlerts.length > 0 ? 'bg-red-500' : 'bg-gray-300'}`} />
                  </span>
                  <span className="font-medium">活动告警</span>
                  <Badge count={filteredActiveAlerts.length} offset={[0, 1]} size="small" className={filteredActiveAlerts.length > 0 ? 'bg-red-500' : ''} />
                </div>
              ),
              children: (
                <div className="min-h-[300px]">
                  {filteredActiveAlerts.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={filteredActiveAlerts}
                      rowKey="id"
                      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                      size="middle"
                      className="energy-table"
                      scroll={{ x: 1200 }}
                      rowClassName={(record) => record.severity === 1 ? 'severity-row-highlight' : ''}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <CheckCircleOutlined className="mb-4 text-6xl text-green-500" />
                      <Title level={5} className="!mb-2 text-green-600">系统运行正常</Title>
                      <Text type="secondary">暂无活动告警，所有设备运行正常</Text>
                      {filters.levels.length > 0 || filters.deviceId || filters.dateRange || searchKeyword !== '' ? (
                        <Button type="link" onClick={resetFilters} className="mt-2">
                          清除筛选条件
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'history',
              label: (
                <div className="flex items-center gap-2">
                  <HistoryOutlined className="text-gray-500" />
                  <span className="font-medium">历史记录</span>
                  <Badge count={filteredHistoryAlerts.length} offset={[0, 1]} size="small" />
                </div>
              ),
              children: (
                <div className="min-h-[300px]">
                  {filteredHistoryAlerts.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={filteredHistoryAlerts}
                      rowKey="id"
                      pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                      size="middle"
                      className="energy-table"
                      scroll={{ x: 1200 }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <HistoryOutlined className="mb-4 text-6xl text-gray-300" />
                      <Title level={5} className="!mb-2 text-gray-500">暂无历史告警</Title>
                      <Text type="secondary">没有已恢复的告警记录</Text>
                      {filters.levels.length > 0 || filters.deviceId || filters.dateRange || searchKeyword !== '' ? (
                        <Button type="link" onClick={resetFilters} className="mt-2">
                          清除筛选条件
                        </Button>
                      ) : null}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default Alerts
