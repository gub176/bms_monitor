import React, { useState } from 'react'
import { Modal, Form, Input, Button, App, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useDeviceStore } from '../../stores/deviceStore'

const { Text } = Typography

interface BindDeviceModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const BindDeviceModal: React.FC<BindDeviceModalProps> = ({ open, onClose, onSuccess }) => {
  const { bindDevice } = useDeviceStore()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()

  const handleSubmit = async (values: { device_id: string }) => {
    setLoading(true)
    const { error } = await bindDevice(values.device_id)
    setLoading(false)

    if (error) {
      message.error(error)
    } else {
      message.success('设备绑定成功')
      form.resetFields()
      onSuccess()
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <PlusOutlined />
          <span>绑定设备</span>
        </div>
      }
    >
      <div className="py-4">
        <Text type="secondary" className="block mb-4">
          请输入设备 ID 进行绑定。设备 ID 通常可以在设备的设置菜单或铭牌上找到。
        </Text>

        <Form form={form} onFinish={handleSubmit} layout="vertical" autoComplete="off">
          <Form.Item
            name="device_id"
            label="设备 ID"
            rules={[
              { required: true, message: '请输入设备 ID' },
              { min: 5, message: '设备 ID 至少 5 个字符' },
            ]}
          >
            <Input
              placeholder="例如：DEV001"
              size="large"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item className="!mb-0">
            <div className="flex gap-2 justify-end">
              <Button onClick={onClose} size="large">
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                绑定
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  )
}

export default BindDeviceModal
