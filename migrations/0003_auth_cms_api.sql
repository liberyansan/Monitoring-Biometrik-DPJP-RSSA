-- =====================================================
-- Migration 0003: Auth, CMS, API Management
-- Admin users, sessions, API keys, audit logs, webhooks
-- =====================================================

-- Admin Users (for login CMS)
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  department_id INTEGER,
  is_active INTEGER DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Admin Sessions (JWT tracking)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- API Keys (per device for biometric integration)
CREATE TABLE IF NOT EXISTS api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  device_id INTEGER,
  permissions TEXT DEFAULT 'attendance:write',
  rate_limit INTEGER DEFAULT 60,
  ip_whitelist TEXT,
  is_active INTEGER DEFAULT 1,
  last_used DATETIME,
  expires_at DATETIME,
  total_requests INTEGER DEFAULT 0,
  created_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- API Request Logs
CREATE TABLE IF NOT EXISTS api_request_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key_id INTEGER,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  ip_address TEXT,
  response_time_ms INTEGER,
  request_body TEXT,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id)
);

-- Audit Logs (CMS changes)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id INTEGER,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- Webhook Configs (SIMRS integration)
CREATE TABLE IF NOT EXISTS webhook_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT NOT NULL,
  headers TEXT,
  secret TEXT,
  is_active INTEGER DEFAULT 1,
  last_triggered DATETIME,
  last_status INTEGER,
  total_sent INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SIMRS Integration Config
CREATE TABLE IF NOT EXISTS simrs_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_device ON api_keys(device_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_key ON api_request_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_time ON api_request_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name, record_id);
