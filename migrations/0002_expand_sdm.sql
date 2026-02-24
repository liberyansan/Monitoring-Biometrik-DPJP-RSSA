-- =====================================================
-- Migration 0002: Expand SDM Structure
-- Tambah employee_category, role detail, shift schedules,
-- dan staffing requirements
-- =====================================================

-- Tambah kolom category dan sub-role ke employees
ALTER TABLE employees ADD COLUMN category TEXT NOT NULL DEFAULT 'manajemen_administrasi';
-- category: tenaga_medis, tenaga_pendidikan, tenaga_keperawatan, tenaga_kefarmasian,
--           tenaga_penunjang_medis, manajemen_administrasi, tenaga_penunjang_non_medis

ALTER TABLE employees ADD COLUMN sub_role TEXT;
-- sub_role detail per category (dpjp_konsultan, dokter_umum, ppds, fellow, co_ass, 
--                               perawat_icu, bidan, apoteker, radiografer, dll)

ALTER TABLE employees ADD COLUMN sip_str TEXT;
-- Nomor SIP/STR (Surat Izin Praktik / Surat Tanda Registrasi)

ALTER TABLE employees ADD COLUMN employment_type TEXT DEFAULT 'pns';
-- 'pns', 'pppk', 'kontrak', 'outsource', 'mitra'

ALTER TABLE employees ADD COLUMN priority_level INTEGER DEFAULT 3;
-- 1: Sangat Tinggi (DPJP, PPDS, Perawat ICU/OK/IGD)
-- 2: Tinggi (Perawat, Apoteker, Dokter Umum)
-- 3: Sedang (Penunjang Medis, Admin)
-- 4: Rendah (Penunjang Non-Medis)

-- Shift Schedules / Jadwal Shift (untuk perawat & tenaga shift)
CREATE TABLE IF NOT EXISTS shift_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  schedule_date DATE NOT NULL,
  shift_type TEXT NOT NULL, -- 'pagi', 'siang', 'malam', 'libur', 'cuti'
  start_time TEXT NOT NULL, -- HH:MM
  end_time TEXT NOT NULL,   -- HH:MM
  department_id INTEGER,
  area TEXT, -- Area spesifik: 'ICU Bed 1-8', 'OK Ruang 3', dll
  is_leader INTEGER DEFAULT 0, -- Penanggung jawab shift
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'absent', 'swap'
  swap_with INTEGER, -- ID pegawai pengganti jika swap
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (swap_with) REFERENCES employees(id)
);

-- Staffing Requirements / Kebutuhan Minimum SDM per Unit
CREATE TABLE IF NOT EXISTS staffing_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  department_id INTEGER NOT NULL,
  shift_type TEXT NOT NULL, -- 'pagi', 'siang', 'malam'
  category TEXT NOT NULL, -- employee category
  min_count INTEGER NOT NULL DEFAULT 1,
  ideal_count INTEGER,
  notes TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Tambah kolom ke departments
ALTER TABLE departments ADD COLUMN is_critical INTEGER DEFAULT 0;
-- Area kritis: ICU, IGD, OK, NICU, dll

ALTER TABLE departments ADD COLUMN floor TEXT;
-- Lantai gedung

ALTER TABLE departments ADD COLUMN building TEXT;
-- Gedung

-- Indexes baru
CREATE INDEX IF NOT EXISTS idx_employees_category ON employees(category);
CREATE INDEX IF NOT EXISTS idx_employees_priority ON employees(priority_level);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_employee ON shift_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_date ON shift_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_dept ON shift_schedules(department_id);
CREATE INDEX IF NOT EXISTS idx_staffing_req_dept ON staffing_requirements(department_id);
