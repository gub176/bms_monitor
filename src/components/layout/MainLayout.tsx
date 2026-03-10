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

const { Sider, Content } = Layout
const { Text } = Typography

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { email } = useAuth()
  const { activeAlerts } = useAlertStore()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/alerts',
      icon: <BellOutlined />,
      label: (
        <div className="flex items-center gap-2">
          <span>告警中心</span>
          {activeAlerts.length > 0 && (
            <Badge count={activeAlerts.length} size="small" />
          )}
        </div>
      ),
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
        style={{ background: '#ffffff' }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          {!collapsed ? (
            <div className="flex items-center gap-2 px-4">
              <div className="w-8 h-8 rounded-lg sidebar-logo-green flex items-center justify-center">
                <ThunderboltOutlined className="text-white text-base" />
              </div>
              <span className="font-semibold text-gray-800 text-base">BMS 监控</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg sidebar-logo-green flex items-center justify-center">
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
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2">
              <Avatar icon={<UserOutlined />} size="small" className="avatar-green" />
              <div className="flex flex-col flex-1 min-w-0">
                <Text className="text-xs sidebar-text-primary truncate">{email || ''}</Text>
                <Text className="text-[10px] sidebar-text-secondary">在线监控</Text>
              </div>
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
