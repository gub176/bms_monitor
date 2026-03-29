import React, { useState } from 'react'
import { Layout, Menu, Avatar, Typography, Badge, Divider } from 'antd'
import {
  DashboardOutlined,
  UserOutlined,
  ThunderboltOutlined,
  BellOutlined,
  WifiOutlined,
  SettingOutlined,
  LinkOutlined,
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

  // 掩码邮箱地址
  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return email
    const [username, domain] = email.split('@')
    if (username.length <= 3) return email
    const masked = username.slice(0, 3) + '*'.repeat(username.length - 3)
    return `${masked}@${domain}`
  }

  const menuItems = [
    {
      key: 'group-monitor',
      label: <span className="menu-group-label">监控</span>,
      type: 'group' as const,
    },
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
    {
      key: '/devices',
      icon: <WifiOutlined aria-hidden="true" />,
      label: '设备列表',
      ariaLabel: '导航到设备列表页面',
      disabled: true, // 预留功能
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'group-management',
      label: <span className="menu-group-label">管理</span>,
      type: 'group' as const,
    },
    {
      key: '/bind',
      icon: <LinkOutlined aria-hidden="true" />,
      label: '设备绑定',
      ariaLabel: '导航到设备绑定页面',
      disabled: true, // 预留功能
    },
    {
      key: '/settings',
      icon: <SettingOutlined aria-hidden="true" />,
      label: '系统设置',
      ariaLabel: '导航到系统设置页面',
      disabled: true, // 预留功能
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === '/dashboard') {
      navigate(key)
    } else if (key === '/alerts') {
      navigate(key)
    }
    // 其他菜单项预留功能
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
        className="shadow-sm sider-custom"
        style={{ background: 'var(--color-bg-card)' }}
        aria-label="主导航侧边栏"
      >
        {/* 品牌 Logo 区 */}
        <div className="h-20 flex items-center justify-center border-b border-[var(--login-border)] brand-header">
          {!collapsed ? (
            <div className="flex flex-col items-center justify-center gap-1 px-4 py-2">
              <div className="w-9 h-9 rounded-xl brand-logo-gradient flex items-center justify-center shadow-sm" aria-hidden="true">
                <ThunderboltOutlined className="text-white text-lg" />
              </div>
              <span className="font-semibold text-[var(--color-text-primary)] text-sm leading-tight text-center">BMS 监控</span>
              <span className="text-[10px] text-[var(--login-text-secondary)] leading-tight text-center">能源管理系统</span>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl brand-logo-gradient flex items-center justify-center shadow-sm" aria-label="BMS 监控 Logo">
              <ThunderboltOutlined className="text-white text-lg" />
            </div>
          )}
        </div>

        {/* 导航菜单 */}
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="!border-r-0 mt-2 sider-menu"
          role="navigation"
          aria-label="主导航菜单"
        />

        {/* 底部用户区 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[var(--login-border)] user-section">
          {!collapsed && (
            <>
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--login-bg-secondary)] transition-colors cursor-pointer" role="button" aria-label="用户信息">
                <Avatar icon={<UserOutlined />} size="default" className="avatar-green shadow-sm" aria-hidden="true" />
                <div className="flex flex-col flex-1 min-w-0">
                  <Text className="text-xs sidebar-text-primary truncate font-medium">{maskEmail(email || '')}</Text>
                  <Text className="text-[10px] sidebar-text-secondary">已在线</Text>
                </div>
              </div>
              <Divider className="!my-2 !bg-[var(--login-border)]" />
              <div className="flex justify-center">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-lg transition-colors font-medium logout-button"
                  aria-label="退出登录"
                >
                  <PoweroffOutlined />
                  <span>退出登录</span>
                </button>
              </div>
            </>
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
