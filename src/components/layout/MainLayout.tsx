import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Divider } from 'antd'
import {
  DashboardOutlined,
  AlertOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const { Header, Sider, Content } = Layout
const { Text } = Typography

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, email, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/alerts',
      icon: <AlertOutlined />,
      label: '告警中心',
    },
  ]

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
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
        width="220"
        onBreakpoint={(broken) => {
          setCollapsed(broken)
        }}
        className="!bg-[#001529] shadow-lg"
      >
        <div
          className="h-16 flex items-center justify-center border-b border-gray-700"
          style={{ background: 'linear-gradient(135deg, #002140 0%, #001529 100%)' }}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-blue-400 text-xl" />
              <Typography.Title level={4} className="!mb-0 text-white !font-semibold">
                BMS 监控
              </Typography.Title>
            </div>
          ) : (
            <ThunderboltOutlined className="text-blue-400 text-xl" />
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="!border-r-0 mt-2"
          style={{ background: '#001529' }}
        />
      </Sider>
      <Layout>
        <Header
          className="bg-white px-6 flex items-center justify-between shadow-sm"
          style={{ height: '56px', lineHeight: '56px' }}
        >
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-base hover:bg-gray-100"
            />
            <Divider type="vertical" className="h-6" />
            <Text type="secondary" className="text-sm">
              能源管理系统
            </Text>
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <Avatar
                icon={<UserOutlined />}
                src={undefined}
                size="default"
                className="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              {!collapsed && (
                <div className="flex flex-col">
                  <Text className="text-sm font-medium">{email || user?.email}</Text>
                  <Text type="secondary" className="text-xs">管理员</Text>
                </div>
              )}
            </div>
          </Dropdown>
        </Header>
        <Content className="m-0 bg-[#f5f5f5]">
          <div className="p-6 min-h-[calc(100vh-56px)]">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
