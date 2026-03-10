import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Badge } from 'antd'
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
const { Text, Title } = Typography

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
      icon: <DashboardOutlined className="text-base" />,
      label: '仪表盘',
    },
    {
      key: '/alerts',
      icon: <BellOutlined className="text-base" />,
      label: (
        <div className="flex items-center justify-between w-full">
          <span>告警中心</span>
          {activeAlerts.length > 0 && (
            <Badge count={activeAlerts.length} size="small" offset={[0, 0]} />
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
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-500">退出登录</span>,
      onClick: () => signOut(),
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="80"
        width="240"
        onBreakpoint={(broken) => {
          setCollapsed(broken)
        }}
        className="shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                <ThunderboltOutlined className="text-white text-xl" />
              </div>
              <div className="flex flex-col">
                <Title level={5} className="!mb-0 !text-white !text-base font-bold">
                  BMS 监控系统
                </Title>
                <Text className="!text-xs !text-gray-400">能源管理系统</Text>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <ThunderboltOutlined className="text-white text-xl" />
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="!border-r-0 mt-4"
          style={{
            background: 'transparent',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2">
              <Avatar
                icon={<UserOutlined />}
                size="small"
                className="bg-gradient-to-br from-cyan-400 to-blue-500"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <Text className="text-xs text-white font-medium truncate">
                  {email || user?.email}
                </Text>
                <Text className="text-[10px] text-gray-400">在线监控</Text>
              </div>
            </div>
          )}
        </div>
      </Sider>
      <Layout className="bg-[#f0f2f5]">
        <Header
          className="bg-white px-6 flex items-center justify-between shadow-sm border-b border-gray-100"
          style={{ height: '64px', lineHeight: '64px' }}
        >
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
            <div className="hidden lg:flex items-center gap-6 px-4 py-2 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <Text className="text-xs text-gray-500">系统运行正常</Text>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <ThunderboltOutlined className="text-blue-500 text-sm" />
                <Text className="text-xs">
                  <span className="font-semibold text-gray-800">{devices.length}</span>
                  <span className="text-gray-400 ml-1">台设备</span>
                </Text>
              </div>
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-4 py-2 rounded-xl transition-all">
                <Avatar
                  icon={<UserOutlined />}
                  size="default"
                  className="bg-gradient-to-br from-blue-500 to-blue-600 shadow-md"
                />
                <div className="hidden md:flex flex-col">
                  <Text className="text-sm font-semibold text-gray-800">
                    {email || user?.email}
                  </Text>
                  <Text className="text-xs text-gray-400">系统管理员</Text>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="p-6">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
