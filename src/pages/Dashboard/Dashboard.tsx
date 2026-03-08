import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Empty, Spin, Typography, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useDevices } from '../../hooks/useDevices'
import DeviceCard from '../../components/device/DeviceCard'
import BindDeviceModal from '../../components/device/BindDeviceModal'

const { Title } = Typography

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { devices, loading, error, currentDeviceId, selectDevice, refresh } = useDevices()
  const [bindModalOpen, setBindModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" description="加载设备列表..." />
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

  if (devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Empty description="暂无设备" />
        <Typography.Text type="secondary" className="mt-2 mb-4">
          绑定设备后即可监控和管理
        </Typography.Text>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setBindModalOpen(true)}>
          绑定设备
        </Button>
        <BindDeviceModal
          open={bindModalOpen}
          onClose={() => setBindModalOpen(false)}
          onSuccess={refresh}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Title level={3} className="!mb-0">
          我的设备
        </Title>
        <div className="flex items-center gap-4">
          <Typography.Text type="secondary">
            共 {devices.length} 台设备
          </Typography.Text>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setBindModalOpen(true)}>
            绑定设备
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {devices.map((device) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={device.device_id}>
            <DeviceCard
              device={device}
              isActive={currentDeviceId === device.device_id}
              onClick={() => {
                selectDevice(device.device_id)
                navigate(`/device/${device.device_id}`)
              }}
            />
          </Col>
        ))}
      </Row>

      <BindDeviceModal
        open={bindModalOpen}
        onClose={() => setBindModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  )
}

export default Dashboard
