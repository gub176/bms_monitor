import React from 'react'
import { Button } from 'antd'

const Test: React.FC = () => {
  return (
    <div style={{ padding: 40 }}>
      <h1>Test Page</h1>
      <p>If you can see this, the app is working!</p>
      <Button type="primary">Test Button</Button>
    </div>
  )
}

export default Test
