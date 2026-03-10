import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Badge, Divider } from 'antd'
import {
  DashboardOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDeviceStore } from '../../stores/deviceStore'
import { useAlertStore } from '../../stores/alertStore'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, email, signOut } = useAuth()
  const { devices } = useDeviceStore()
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

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div className="flex flex-col">
          <span className="font-medium">{email || user?.email}</span>
          <span className="text-xs text-gray-400">管理员账户</span>
        </div>
      ),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span className="text-red-500">退出登录</span>,
      onClick: () => signOut(),
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout className="min-h-screen bg-[#f5f7fa]">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="80"
        width="220"
        onBreakpoint={(broken) => setCollapsed(broken)}
        className="shadow-sm border-r border-gray-100"
        style={{ background: '#ffffff' }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          {!collapsed ? (
            <div className="flex items-center gap-2 px-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <ThunderboltOutlined className="text-white text-base" />
              </div>
              <span className="font-semibold text-gray-800 text-base">BMS 监控</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
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
              <Avatar icon={<UserOutlined />} size="small" className="bg-blue-500" />
              <div className="flex flex-col flex-1 min-w-0">
                <Text className="text-xs text-gray-700 font-medium truncate">{email || user?.email}</Text>
                <Text className="text-[10px] text-gray-400">在线监控</Text>
              </div>
            </div>
          )}
        </div>
      </Sider>
      <Layout>
        <Header className="bg-white px-6 flex items-center justify-between shadow-sm border-b border-gray-100" style={{ height: '64px' }}>
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined className="text-lg" /> : <MenuFoldOutlined className="text-lg" />}
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-gray-100 w-10 h-10 flex items-center justify-center rounded-lg"
            />
            <div className="hidden md:block">
              <nav className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">首页</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-800 font-medium">
                  {location.pathname === '/dashboard' && '设备概览'}
                  {location.pathname === '/alerts' && '告警中心'}
                  {location.pathname.startsWith('/device/') && '设备详情'}
                </span>
              </nav>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <Text className="text-xs text-gray-500">系统正常</Text>
              </div>
              <Divider type="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <ThunderboltOutlined className="text-blue-500 text-sm" />
                <Text className="text-xs">
                  <span className="font-semibold text-gray-800">{devices.length}</span>
                  <span className="text-gray-400 ml-1">台设备</span>
                </Text>
              </div>
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                <Avatar icon={<UserOutlined />} size="small" className="bg-blue-500" />
                <div className="hidden md:flex flex-col">
                  <Text className="text-sm font-medium text-gray-700">{email || user?.email}</Text>
                  <Text className="text-xs text-gray-400">系统管理员</Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6">
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
