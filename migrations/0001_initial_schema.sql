-- =====================================================
-- RSSA Biometric Monitoring System - Database Schema
-- RS Saiful Anwar (RSSA) Malang
-- =====================================================

-- Departments / Unit Kerja
CREATE TABLE IF NOT EXISTS departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'unit', -- 'unit', 'poli', 'instalasi', 'ruangan'
  parent_id INTEGER,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES departments(id)
);

-- Employees / Pegawai
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nip TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'dpjp', 'ppds', 'perawat', 'staff', 'admin'
  specialization TEXT, -- Spesialisasi (untuk dokter)
  department_id INTEGER,
  phone TEXT,
  email TEXT,
  photo_url TEXT,
  biometric_id TEXT, -- ID dari mesin biometrik
  face_registered INTEGER DEFAULT 0,
  finger_registered INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Biometric Devices / Perangkat Biometrik
CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'face_recognition', 'fingerprint', 'combo'
  location TEXT NOT NULL, -- Lokasi perangkat
  location_type TEXT NOT NULL, -- 'lobby', 'unit', 'icu', 'ok', 'farmasi', 'other'
  ip_address TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'maintenance'
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Records / Catatan Kehadiran
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  device_id INTEGER,
  scan_time DATETIME NOT NULL,
  scan_type TEXT NOT NULL, -- 'clock_in', 'clock_out', 'access'
  method TEXT NOT NULL, -- 'face', 'fingerprint', 'manual'
  confidence_score REAL, -- Skor kepercayaan biometrik (0-100)
  photo_capture TEXT, -- URL foto saat scan
  location TEXT,
  status TEXT DEFAULT 'verified', -- 'verified', 'pending', 'rejected'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- DPJP Schedules / Jadwal DPJP
CREATE TABLE IF NOT EXISTS dpjp_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  schedule_date DATE NOT NULL,
  shift TEXT NOT NULL, -- 'pagi', 'siang', 'malam', 'on_call'
  start_time TEXT NOT NULL, -- HH:MM format
  end_time TEXT NOT NULL,   -- HH:MM format
  department_id INTEGER,
  activity_type TEXT NOT NULL, -- 'visite', 'operasi', 'poliklinik', 'tindakan', 'konsul', 'jaga'
  patient_count INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'missed', 'cancelled'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- PPDS Rotation / Rotasi PPDS
CREATE TABLE IF NOT EXISTS ppds_rotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  department_id INTEGER NOT NULL,
  supervisor_id INTEGER, -- DPJP pembimbing
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  stage TEXT, -- 'junior', 'senior', 'chief'
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'transferred'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (supervisor_id) REFERENCES employees(id)
);

-- Access Logs / Log Akses Ruangan
CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  device_id INTEGER NOT NULL,
  access_time DATETIME NOT NULL,
  room_name TEXT NOT NULL,
  access_type TEXT NOT NULL, -- 'granted', 'denied'
  method TEXT NOT NULL, -- 'face', 'fingerprint'
  reason TEXT, -- Alasan jika ditolak
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_nip ON employees(nip);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_scan_time ON attendance(scan_time);
CREATE INDEX IF NOT EXISTS idx_attendance_scan_type ON attendance(scan_type);
CREATE INDEX IF NOT EXISTS idx_dpjp_schedules_employee ON dpjp_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_dpjp_schedules_date ON dpjp_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_ppds_rotations_employee ON ppds_rotations(employee_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_time ON access_logs(access_time);
CREATE INDEX IF NOT EXISTS idx_access_logs_employee ON access_logs(employee_id);
