import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, Alert, Checkbox, Divider } from 'antd'
import { ThunderboltOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const { Title, Text } = Typography

interface LoginFormValues {
  email: string
  password: string
  remember?: boolean
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, loading } = useAuthStore()
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleSubmit = async (values: LoginFormValues) => {
    setLoginError(null)
    const result = await signIn(values.email, values.password)
    if (result.error) {
      setLoginError(result.error)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card className="w-full max-w-md shadow-2xl" variant="borderless">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }}
          >
            <ThunderboltOutlined className="text-3xl text-white" />
          </div>
          <Title level={2} className="!mb-1">
            BMS 监控系统
          </Title>
          <Text type="secondary">
            能源管理系统
          </Text>
        </div>

        {loginError && (
          <Alert
            message={loginError}
            type="error"
            showIcon
            closable
            className="mb-6"
          />
        )}

        <Form
          name="login"
          layout="vertical"
          size="large"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label={<span className="text-sm font-medium">邮箱</span>}
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="请输入邮箱"
              className="!py-2.5"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-sm font-medium">密码</span>}
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少 6 位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="请输入密码"
              className="!py-2.5"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex items-center justify-between">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Button type="link" className="!p-0">
                忘记密码？
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="!h-11 !text-base font-medium"
              style={{ background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)' }}
            >
              登录
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text type="secondary" className="text-sm">
              还没有账号？{' '}
              <Button type="link" className="!p-0">
                立即注册
              </Button>
            </Text>
          </div>
        </Form>

        <Divider className="!my-6" />

        <div className="text-center">
          <Text type="secondary" className="text-xs">
            © 2026 BMS 监控系统。All rights reserved.
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login
