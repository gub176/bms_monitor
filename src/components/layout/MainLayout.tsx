import React, { useState } from 'react'
import { Layout, Menu, Avatar, Typography, Badge } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  ThunderboltOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAlertStore } from '../../stores/alertStore'
import { PoweroffOutlined } from '@ant-design/icons'

const { Sider, Content } = Layout
const { Text } = Typography

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, signOut } = useAuth()
  const { activeAlerts } = useAlertStore()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined aria-hidden="true" />,
      label: '仪表盘',
      ariaLabel: '导航到仪表盘页面',
    },
    {
      key: '/alerts',
      icon: <BellOutlined aria-hidden="true" />,
      label: (
        <div className="flex items-center gap-2">
          <span>告警中心</span>
          {activeAlerts.length > 0 && (
            <Badge count={activeAlerts.length} size="small" />
          )}
        </div>
      ),
      ariaLabel: `导航到告警中心页面${activeAlerts.length > 0 ? `，${activeAlerts.length} 条活动告警` : ''}`,
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout className="min-h-screen layout-clean-energy">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="80"
        width="220"
        onBreakpoint={(broken) => setCollapsed(broken)}
        className="shadow-sm"
        style={{ background: 'var(--color-bg-card)' }}
        aria-label="主导航侧边栏"
      >
        <div className="h-16 flex items-center justify-center border-b border-[var(--login-border)]">
          {!collapsed ? (
            <div className="flex items-center gap-2 px-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center" aria-hidden="true">
                <ThunderboltOutlined className="text-white text-base" />
              </div>
              <span className="font-semibold text-[var(--color-text-primary)] text-base">BMS 监控</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center" aria-label="BMS 监控 Logo">
              <ThunderboltOutlined className="text-white text-base" />
            </div>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="!border-r-0 mt-2"
          role="navigation"
          aria-label="主导航菜单"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--login-border)]">
          {!collapsed && (
            <div className="flex flex-col gap-3" role="region" aria-label="用户信息">
              <div className="flex items-center gap-3 px-2">
                <Avatar icon={<UserOutlined />} size="small" className="avatar-green" aria-hidden="true" />
                <div className="flex flex-col flex-1 min-w-0">
                  <Text className="text-xs sidebar-text-primary truncate" aria-label={`用户：${email || ''}`}>{email || ''}</Text>
                  <Text className="text-[10px] sidebar-text-secondary">在线监控</Text>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-2 py-2 text-xs text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-md transition-colors"
                aria-label="退出登录"
              >
                <PoweroffOutlined />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </Sider>
      <Content className="p-6 mt-0">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </Content>
    </Layout>
  )
}

export default MainLayout
