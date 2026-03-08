import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Tabs, message, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../stores/authStore'

const { Title, Text } = Typography

type TabKey = 'login' | 'signup'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('login')

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    const { error } = await signIn(values.email, values.password)
    setLoading(false)

    if (error) {
      message.error(error)
    } else {
      message.success('登录成功')
      navigate('/dashboard')
    }
  }

  const handleSignup = async (values: { email: string; password: string }) => {
    setLoading(true)
    const { error } = await signUp(values.email, values.password)
    setLoading(false)

    if (error) {
      message.error(error)
    } else {
      message.success('注册成功，请检查邮箱验证')
      setActiveTab('login')
    }
  }

  const loginForm = (
    <Form name="login" onFinish={handleLogin} autoComplete="off">
      <Form.Item
        name="email"
        rules={[{ required: true, message: '请输入邮箱地址', type: 'email' }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="邮箱地址"
          size="large"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码"
          size="large"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} size="large" block>
          登录
        </Button>
      </Form.Item>
    </Form>
  )

  const signupForm = (
    <Form name="signup" onFinish={handleSignup} autoComplete="off">
      <Form.Item
        name="email"
        rules={[{ required: true, message: '请输入邮箱地址', type: 'email' }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="邮箱地址"
          size="large"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码长度至少 6 位' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码（至少 6 位）"
          size="large"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} size="large" block>
          注册
        </Button>
      </Form.Item>
    </Form>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg" variant="borderless">
        <div className="text-center mb-8">
          <Title level={2} className="!mb-2">BMS 监控系统</Title>
          <Text type="secondary">户用储能设备云端管理</Text>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          items={[
            {
              key: 'login',
              label: '登录',
              children: loginForm,
            },
            {
              key: 'signup',
              label: '注册',
              children: signupForm,
            },
          ]}
          size="large"
        />

        <div className="mt-6 text-center text-sm text-gray-500">
          <Text type="secondary">
            演示账号：请使用您的 Supabase 账号登录
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login
