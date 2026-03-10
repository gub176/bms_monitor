import React, { useState } from 'react'
import { Form, Input, Button, Checkbox, Alert } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import './Login.css'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, loading } = useAuthStore()
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleSubmit = async (values: { email: string; password: string; remember?: boolean }) => {
    setLoginError(null)
    const result = await signIn(values.email, values.password)
    if (result.error) {
      setLoginError(result.error)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="login-container">
      {/* 左侧品牌形象区 */}
      <div className="login-brand-section">
        <div className="brand-content">
          <div className="brand-icon-wrapper">
            <ThunderboltOutlined className="brand-icon" />
          </div>
          <h1 className="brand-tagline">智慧能源 · 绿色未来</h1>
        </div>
        {/* 背景装饰图案 */}
        <svg className="brand-pattern" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="hex-pattern" x="0" y="0" width="20" height="17.32" patternUnits="userSpaceOnUse">
              <path d="M10 0L17.32 4.33V12.99L10 17.32L2.68 12.99V4.33L10 0Z" fill="none" stroke="#2d5a3d" strokeWidth="0.5" opacity="0.08"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#hex-pattern)"/>
        </svg>
      </div>

      {/* 右侧表单区 */}
      <div className="login-form-section">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h2 className="login-title">BMS 监控系统</h2>
            <p className="login-subtitle">Energy Management System</p>
          </div>

          {loginError && (
            <Alert
              message={loginError}
              type="error"
              showIcon
              closable
              className="login-error-alert"
            />
          )}

          <Form
            name="login"
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="login-form"
          >
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input placeholder="请输入邮箱" size="large" />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度至少 6 位' },
              ]}
            >
              <Input.Password placeholder="请输入密码" size="large" />
            </Form.Item>

            <Form.Item>
              <div className="login-form-options">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
                <a href="#" className="forgot-link">忘记密码？</a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="login-submit-btn"
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <p className="copyright">© 2026 BMS 监控系统。All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
