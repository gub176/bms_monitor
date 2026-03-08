-- BMS Monitor Database Schema
-- Based on actual production schema (2026-03-08)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Devices table (实际表结构)
CREATE TABLE IF NOT EXISTS devices (
  device_id TEXT PRIMARY KEY,
  auth_key TEXT NOT NULL,
  manufacturer TEXT,
  hw_version TEXT,
  fw_version TEXT,
  battery_packs_count INTEGER,
  cell_count INTEGER,
  temp_sensor_count INTEGER,
  last_online TIMESTAMPTZ,
  last_offline TIMESTAMPTZ,
  status TEXT CHECK (status IN ('online', 'offline')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Device binding table (实际表结构)
CREATE TABLE IF NOT EXISTS user_devices (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, device_id)
);

-- Telemetry table (实际表结构)
CREATE TABLE IF NOT EXISTS telemetry (
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL,
  cell_voltages NUMERIC[],
  cell_socs NUMERIC[],
  cell_temperatures NUMERIC[],
  data JSONB
);

-- Status table (实际表结构)
CREATE TABLE IF NOT EXISTS status (
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL,
  operation_status INTEGER,
  charge_discharge_status INTEGER,
  grid_connection_status INTEGER,
  main_contactor_status INTEGER,
  emergency_stop_status INTEGER,
  battery_balancing_status INTEGER
);

-- Alerts table (实际表结构)
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity IN (1, 2, 3)),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ
);

-- Remote commands table (预留)
CREATE TABLE IF NOT EXISTS remote_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  command_type TEXT NOT NULL,
  command_data JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending', 'executed', 'failed')),
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_telemetry_device_id ON telemetry(device_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_received_at ON telemetry(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_device_id ON status(device_id);
CREATE INDEX IF NOT EXISTS idx_status_timestamp ON status(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_start_time ON alerts(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_end_time ON alerts(end_time) WHERE end_time IS NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_remote_commands_device_id ON remote_commands(device_id);
CREATE INDEX IF NOT EXISTS idx_remote_commands_user_id ON remote_commands(user_id);

-- Row Level Security (RLS)
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE status ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_commands ENABLE ROW LEVEL SECURITY;

-- RLS Policies for devices - users can see devices they have bound
DROP POLICY IF EXISTS "Users can view bound devices" ON devices;
CREATE POLICY "Users can view bound devices"
  ON devices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_devices
      WHERE user_devices.device_id = devices.device_id
      AND user_devices.user_id = auth.uid()
    )
  );

-- RLS Policies for user_devices
DROP POLICY IF EXISTS "Users can view their own bindings" ON user_devices;
CREATE POLICY "Users can view their own bindings"
  ON user_devices FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own bindings" ON user_devices;
CREATE POLICY "Users can create their own bindings"
  ON user_devices FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own bindings" ON user_devices;
CREATE POLICY "Users can delete their own bindings"
  ON user_devices FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for telemetry - users can see telemetry for their bound devices
DROP POLICY IF EXISTS "Users can view telemetry for bound devices" ON telemetry;
CREATE POLICY "Users can view telemetry for bound devices"
  ON telemetry FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_devices
      WHERE user_devices.device_id = telemetry.device_id
      AND user_devices.user_id = auth.uid()
    )
  );

-- RLS Policies for status
DROP POLICY IF EXISTS "Users can view status for bound devices" ON status;
CREATE POLICY "Users can view status for bound devices"
  ON status FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_devices
      WHERE user_devices.device_id = status.device_id
      AND user_devices.user_id = auth.uid()
    )
  );

-- RLS Policies for alerts
DROP POLICY IF EXISTS "Users can view alerts for bound devices" ON alerts;
CREATE POLICY "Users can view alerts for bound devices"
  ON alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_devices
      WHERE user_devices.device_id = alerts.device_id
      AND user_devices.user_id = auth.uid()
    )
  );

-- RLS Policies for remote_commands
DROP POLICY IF EXISTS "Users can view their own commands" ON remote_commands;
CREATE POLICY "Users can view their own commands"
  ON remote_commands FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own commands" ON remote_commands;
CREATE POLICY "Users can create their own commands"
  ON remote_commands FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for devices updated_at
DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get alert type statistics
CREATE OR REPLACE FUNCTION get_alert_type_stats()
RETURNS TABLE(alert_type TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.alert_type, COUNT(*)::BIGINT
  FROM alerts a
  GROUP BY a.alert_type
  ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;
