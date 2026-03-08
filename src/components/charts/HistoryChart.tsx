import React, { useMemo } from 'react'
import { Line } from '@ant-design/charts'
import type { Telemetry } from '../../types/database'

interface HistoryChartProps {
  data: Telemetry[]
  metric: 'soc' | 'total_voltage' | 'temperature_max' | 'temperature_min'
  title?: string
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data, metric, title }) => {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      index,
      time: new Date(item.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: item[metric] || 0,
      timestamp: item.timestamp,
    }))
  }, [data, metric])

  const getMetricConfig = () => {
    switch (metric) {
      case 'soc':
        return { name: 'SOC', unit: '%', color: '#1890ff' }
      case 'total_voltage':
        return { name: '总电压', unit: 'V', color: '#52c41a' }
      case 'temperature_max':
        return { name: '最高温度', unit: '°C', color: '#fa541c' }
      case 'temperature_min':
        return { name: '最低温度', unit: '°C', color: '#13c2c2' }
      default:
        return { name: metric, unit: '', color: '#1890ff' }
    }
  }

  const config = getMetricConfig()

  const chartConfig = {
    data: chartData,
    height: 300,
    autoFit: true,
    xField: 'time',
    yField: 'value',
    point: {
      size: 2,
      shape: 'circle',
    },
    yAxis: {
      label: {
        formatter: (value: number) => `${value} ${config.unit}`,
      },
    },
    lineStyle: {
      lineWidth: 2,
      stroke: config.color,
    },
    tooltip: {
      formatter: (datum: { value: number; timestamp: string }) => ({
        name: config.name,
        value: `${datum.value.toFixed(2)} ${config.unit}`,
      }),
    },
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  }

  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <Line {...chartConfig} />
    </div>
  )
}

export default HistoryChart
