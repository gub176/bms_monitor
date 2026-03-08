import React, { useEffect } from 'react'
import { Table, Tag, Typography, Empty, Spin, Card, Tabs } from 'antd'
import { AlertOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useAlertStore } from '../../stores/alertStore'
import { formatDateTime } from '../../utils/formatters'
import type { Alert } from '../../types/database'

const { Title, Text } = Typography

const AlertLevelTag: React.FC<{ level?: string }> = ({ level }) => {
  const config: Record<string, { color: string; text: string }> = {
    info: { color: 'blue', text: '提示' },
    warning: { color: 'orange', text: '警告' },
    critical: { color: 'red', text: '严重' },
  }
  const { color, text } = config[level?.toLowerCase()] || { color: 'gray', text: level || '未知' }
  return <Tag color={color}>{text}</Tag>
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
      width: 80,
      render: (level: string) => <AlertLevelTag level={level} />,
    },
    {
      title: '告警类型',
      dataIndex: 'alert_type',
      key: 'alert_type',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '设备 ID',
      dataIndex: 'device_id',
      key: 'device_id',
      width: 200,
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 180,
      render: (time: string) => formatDateTime(time),
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 180,
      render: (time: string | null) => (time ? formatDateTime(time) : '—'),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_: unknown, record: Alert) =>
        record.end_time === null ? (
          <Tag color="red">活动中</Tag>
        ) : (
          <Tag icon={<CheckCircleOutlined />} color="success">
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
    <div className="p-6">
      <div className="mb-6">
        <Title level={3} className="!mb-2">
          <AlertOutlined className="mr-2" />
          告警中心
        </Title>
        <Text type="secondary">
          活动告警：{activeAlerts.length} | 历史告警：{alerts.length - activeAlerts.length}
        </Text>
      </div>

      <Tabs
        items={[
          {
            key: 'active',
            label: `活动告警 (${activeAlerts.length})`,
            children: (
              <Card variant="borderless" className="!p-0">
                {activeAlerts.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={activeAlerts}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 1000 }}
                  />
                ) : (
                  <Empty description="暂无活动告警" className="py-12" />
                )}
              </Card>
            ),
          },
          {
            key: 'history',
            label: `历史记录 (${alerts.length - activeAlerts.length})`,
            children: (
              <Card variant="borderless" className="!p-0">
                {alerts.filter((a) => a.end_time !== null).length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={alerts.filter((a) => a.end_time !== null)}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                  />
                ) : (
                  <Empty description="暂无历史告警" className="py-12" />
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  )
}

export default Alerts
