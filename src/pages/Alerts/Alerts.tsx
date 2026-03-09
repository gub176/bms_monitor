import React, { useEffect } from 'react'
import { Table, Tag, Typography, Empty, Spin, Card, Tabs, Badge } from 'antd'
import {
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useAlertStore } from '../../stores/alertStore'
import { formatDateTime } from '../../utils/formatters'
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
  const { alerts, activeAlerts, loading, error, fetchAlerts } = useAlertStore()

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const columns = [
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
              <div className="text-xl font-bold text-orange-500">{activeAlerts.length}</div>
              <Text type="secondary" className="text-xs">
                活动告警
              </Text>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-xl font-bold text-gray-600">{historyAlerts.length}</div>
              <Text type="secondary" className="text-xs">
                历史告警
              </Text>
            </div>
          </div>
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
                <Badge count={activeAlerts.length} offset={[-8, 0]} size="small">
                  <span className="text-sm font-medium">活动告警</span>
                </Badge>
              ),
              children:
                activeAlerts.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={activeAlerts}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="energy-table"
                    scroll={{ x: 1000 }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="p-3 rounded-full bg-green-50 mb-3">
                      <CheckCircleOutlined className="text-3xl text-green-500" />
                    </div>
                    <Typography.Title level={5} className="!mb-1">
                      暂无活动告警
                    </Typography.Title>
                    <Text type="secondary">系统运行正常，所有设备状态良好</Text>
                  </div>
                ),
            },
            {
              key: 'history',
              label: <span className="text-sm font-medium">历史记录 ({historyAlerts.length})</span>,
              children:
                historyAlerts.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={historyAlerts}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                    size="small"
                    className="energy-table"
                    scroll={{ x: 1000 }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="p-3 rounded-full bg-gray-50 mb-3">
                      <InfoCircleOutlined className="text-3xl text-gray-400" />
                    </div>
                    <Typography.Title level={5} className="!mb-1">
                      暂无历史告警
                    </Typography.Title>
                    <Text type="secondary">系统运行以来未产生任何告警记录</Text>
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
