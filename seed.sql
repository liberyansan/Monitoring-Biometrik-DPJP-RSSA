-- =====================================================
-- RSSA Biometric Monitoring System - Seed Data
-- Sample data for development and testing
-- =====================================================

-- Departments
INSERT OR IGNORE INTO departments (code, name, type) VALUES 
  ('IGD', 'Instalasi Gawat Darurat', 'instalasi'),
  ('ICU', 'Intensive Care Unit', 'ruangan'),
  ('OK', 'Instalasi Bedah Sentral (OK)', 'instalasi'),
  ('FARMASI', 'Instalasi Farmasi', 'instalasi'),
  ('POLI-PD', 'Poliklinik Penyakit Dalam', 'poli'),
  ('POLI-BEDAH', 'Poliklinik Bedah', 'poli'),
  ('POLI-ANAK', 'Poliklinik Anak', 'poli'),
  ('POLI-OBGYN', 'Poliklinik Obgyn', 'poli'),
  ('POLI-JANTUNG', 'Poliklinik Jantung', 'poli'),
  ('POLI-SARAF', 'Poliklinik Saraf', 'poli'),
  ('RAW-INAP-1', 'Rawat Inap Paviliun 1', 'ruangan'),
  ('RAW-INAP-2', 'Rawat Inap Paviliun 2', 'ruangan'),
  ('RADIOLOGI', 'Instalasi Radiologi', 'instalasi'),
  ('LAB', 'Instalasi Laboratorium', 'instalasi'),
  ('REHAB', 'Instalasi Rehabilitasi Medik', 'instalasi'),
  ('SDM', 'Bagian SDM', 'unit'),
  ('IT', 'Bagian Teknologi Informasi', 'unit'),
  ('MANAJEMEN', 'Manajemen RS', 'unit');

-- Employees - DPJP (Dokter Penanggung Jawab Pelayanan)
INSERT OR IGNORE INTO employees (nip, name, role, specialization, department_id, phone, biometric_id, face_registered, finger_registered) VALUES 
  ('196501011990011001', 'dr. Ahmad Fauzi, Sp.PD-KGH', 'dpjp', 'Penyakit Dalam - Ginjal Hipertensi', 5, '08123456001', 'BIO-001', 1, 1),
  ('197002151995012002', 'dr. Siti Rahmawati, Sp.B-KBD', 'dpjp', 'Bedah - Digestif', 6, '08123456002', 'BIO-002', 1, 1),
  ('196808201993031003', 'dr. Bambang Sutrisno, Sp.A-KIC', 'dpjp', 'Anak - Intensif Care', 7, '08123456003', 'BIO-003', 1, 1),
  ('197505101998022004', 'dr. Dewi Kartika, Sp.OG-KFM', 'dpjp', 'Obstetri Ginekologi', 8, '08123456004', 'BIO-004', 1, 1),
  ('197112031996011005', 'dr. Hendra Wijaya, Sp.JP-KI', 'dpjp', 'Jantung - Intervensi', 9, '08123456005', 'BIO-005', 1, 1),
  ('196906151994032006', 'dr. Ratna Kusuma, Sp.S-KNF', 'dpjp', 'Saraf - Neurofisiologi', 10, '08123456006', 'BIO-006', 1, 1),
  ('197308201997031007', 'dr. Agus Prasetyo, Sp.An-KIC', 'dpjp', 'Anestesi - ICU', 2, '08123456007', 'BIO-007', 1, 1),
  ('196712101992012008', 'dr. Lina Hartanti, Sp.PD-KGEH', 'dpjp', 'Penyakit Dalam - Gastro', 5, '08123456008', 'BIO-008', 1, 1),
  ('197601051999031009', 'dr. Rudi Hermawan, Sp.B-KL', 'dpjp', 'Bedah - Laparoskopi', 6, '08123456009', 'BIO-009', 1, 0),
  ('197809152002122010', 'dr. Maya Sari, Sp.A-KGH', 'dpjp', 'Anak - Gastro Hepatologi', 7, '08123456010', 'BIO-010', 1, 1);

-- Employees - PPDS (Program Pendidikan Dokter Spesialis)
INSERT OR IGNORE INTO employees (nip, name, role, specialization, department_id, phone, biometric_id, face_registered, finger_registered) VALUES 
  ('202001011001', 'dr. Andi Prasetya', 'ppds', 'PPDS Penyakit Dalam', 5, '08123456101', 'BIO-101', 1, 1),
  ('202001011002', 'dr. Bella Oktaviani', 'ppds', 'PPDS Bedah', 6, '08123456102', 'BIO-102', 1, 1),
  ('202001011003', 'dr. Cahyo Wibowo', 'ppds', 'PPDS Anak', 7, '08123456103', 'BIO-103', 1, 1),
  ('202001011004', 'dr. Dini Lestari', 'ppds', 'PPDS Obgyn', 8, '08123456104', 'BIO-104', 1, 0),
  ('202001011005', 'dr. Erik Saputra', 'ppds', 'PPDS Jantung', 9, '08123456105', 'BIO-105', 1, 1),
  ('202001011006', 'dr. Fitri Handayani', 'ppds', 'PPDS Penyakit Dalam', 5, '08123456106', 'BIO-106', 1, 1),
  ('202001011007', 'dr. Galih Nugroho', 'ppds', 'PPDS Bedah', 6, '08123456107', 'BIO-107', 0, 1),
  ('202001011008', 'dr. Hana Permata', 'ppds', 'PPDS Saraf', 10, '08123456108', 'BIO-108', 1, 1);

-- Employees - Perawat & Staff
INSERT OR IGNORE INTO employees (nip, name, role, specialization, department_id, phone, biometric_id, face_registered, finger_registered) VALUES 
  ('198501011010', 'Ns. Retno Wulandari, S.Kep', 'perawat', 'Perawat ICU', 2, '08123456201', 'BIO-201', 1, 1),
  ('198702151011', 'Ns. Budi Santoso, S.Kep', 'perawat', 'Perawat IGD', 1, '08123456202', 'BIO-202', 1, 1),
  ('199001201012', 'Ns. Citra Dewi, S.Kep', 'perawat', 'Perawat OK', 3, '08123456203', 'BIO-203', 1, 1),
  ('198803101013', 'Apt. Diana Sari, S.Farm', 'staff', 'Apoteker', 4, '08123456204', 'BIO-204', 1, 1),
  ('199205151014', 'Eko Prasetyo, A.Md', 'staff', 'Staff Radiologi', 13, '08123456205', 'BIO-205', 1, 1),
  ('198910201015', 'Fajar Hidayat, S.Kom', 'admin', 'Admin IT', 17, '08123456206', 'BIO-206', 1, 1),
  ('199108051016', 'Gita Permatasari, S.KM', 'staff', 'Staff SDM', 16, '08123456207', 'BIO-207', 1, 1),
  ('199303151017', 'Ns. Hesti Rahayu, S.Kep', 'perawat', 'Perawat Rawat Inap', 11, '08123456208', 'BIO-208', 1, 1);

-- Devices
INSERT OR IGNORE INTO devices (device_code, name, type, location, location_type, ip_address, status) VALUES 
  ('FR-LOBBY-01', 'Face Recognition Lobby Utama', 'face_recognition', 'Lobby Utama Lantai 1', 'lobby', '192.168.1.101', 'active'),
  ('FR-LOBBY-02', 'Face Recognition Lobby Samping', 'face_recognition', 'Lobby Samping Lantai 1', 'lobby', '192.168.1.102', 'active'),
  ('FP-IGD-01', 'Fingerprint IGD', 'fingerprint', 'Pintu Masuk IGD', 'unit', '192.168.1.103', 'active'),
  ('FR-ICU-01', 'Face Recognition ICU', 'face_recognition', 'Pintu Akses ICU', 'icu', '192.168.1.104', 'active'),
  ('CB-OK-01', 'Combo Device OK', 'combo', 'Pintu Akses OK/Bedah Sentral', 'ok', '192.168.1.105', 'active'),
  ('FR-FARM-01', 'Face Recognition Farmasi', 'face_recognition', 'Pintu Akses Farmasi', 'farmasi', '192.168.1.106', 'active'),
  ('FP-POLI-01', 'Fingerprint Poliklinik', 'fingerprint', 'Lobby Poliklinik', 'unit', '192.168.1.107', 'active'),
  ('FR-RAW-01', 'Face Recognition Rawat Inap', 'face_recognition', 'Lantai 2 Rawat Inap', 'unit', '192.168.1.108', 'active'),
  ('CB-LAB-01', 'Combo Device Lab', 'combo', 'Pintu Akses Laboratorium', 'unit', '192.168.1.109', 'maintenance'),
  ('FR-CAD-01', 'Face Recognition Cadangan 1', 'face_recognition', 'Area Cadangan', 'other', '192.168.1.110', 'inactive');

-- Today's attendance data (simulated)
INSERT OR IGNORE INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status) VALUES 
  (1, 1, datetime('now', '-8 hours'), 'clock_in', 'face', 98.5, 'Lobby Utama', 'verified'),
  (2, 1, datetime('now', '-7 hours', '-45 minutes'), 'clock_in', 'face', 97.2, 'Lobby Utama', 'verified'),
  (3, 2, datetime('now', '-7 hours', '-30 minutes'), 'clock_in', 'face', 99.1, 'Lobby Samping', 'verified'),
  (4, 1, datetime('now', '-7 hours', '-15 minutes'), 'clock_in', 'face', 96.8, 'Lobby Utama', 'verified'),
  (5, 7, datetime('now', '-7 hours'), 'clock_in', 'fingerprint', 95.0, 'Poliklinik', 'verified'),
  (6, 1, datetime('now', '-6 hours', '-45 minutes'), 'clock_in', 'face', 98.0, 'Lobby Utama', 'verified'),
  (7, 4, datetime('now', '-8 hours', '-30 minutes'), 'clock_in', 'face', 99.5, 'ICU', 'verified'),
  (8, 1, datetime('now', '-7 hours', '-50 minutes'), 'clock_in', 'face', 97.8, 'Lobby Utama', 'verified'),
  (11, 1, datetime('now', '-7 hours', '-40 minutes'), 'clock_in', 'face', 96.5, 'Lobby Utama', 'verified'),
  (12, 5, datetime('now', '-7 hours', '-20 minutes'), 'clock_in', 'face', 97.0, 'OK', 'verified'),
  (13, 2, datetime('now', '-7 hours', '-10 minutes'), 'clock_in', 'face', 98.2, 'Lobby Samping', 'verified'),
  (14, 1, datetime('now', '-7 hours', '-5 minutes'), 'clock_in', 'face', 95.5, 'Lobby Utama', 'verified'),
  (19, 4, datetime('now', '-8 hours', '-15 minutes'), 'clock_in', 'face', 99.0, 'ICU', 'verified'),
  (20, 3, datetime('now', '-7 hours', '-55 minutes'), 'clock_in', 'fingerprint', 94.5, 'IGD', 'verified'),
  (21, 5, datetime('now', '-7 hours', '-25 minutes'), 'clock_in', 'face', 97.5, 'OK', 'verified'),
  (22, 6, datetime('now', '-7 hours', '-35 minutes'), 'clock_in', 'face', 96.0, 'Farmasi', 'verified'),
  (1, 4, datetime('now', '-6 hours'), 'access', 'face', 98.0, 'ICU', 'verified'),
  (7, 4, datetime('now', '-5 hours'), 'access', 'face', 99.2, 'ICU', 'verified'),
  (2, 5, datetime('now', '-4 hours'), 'access', 'face', 97.5, 'OK', 'verified');

-- DPJP Schedules for today
INSERT OR IGNORE INTO dpjp_schedules (employee_id, schedule_date, shift, start_time, end_time, department_id, activity_type, patient_count, status) VALUES 
  (1, date('now'), 'pagi', '07:00', '14:00', 5, 'visite', 12, 'completed'),
  (1, date('now'), 'pagi', '09:00', '12:00', 5, 'poliklinik', 20, 'completed'),
  (2, date('now'), 'pagi', '07:30', '15:00', 3, 'operasi', 3, 'completed'),
  (3, date('now'), 'pagi', '07:00', '14:00', 7, 'visite', 8, 'completed'),
  (3, date('now'), 'pagi', '09:00', '12:00', 7, 'poliklinik', 15, 'scheduled'),
  (4, date('now'), 'pagi', '08:00', '14:00', 8, 'poliklinik', 18, 'completed'),
  (5, date('now'), 'pagi', '07:00', '14:00', 9, 'visite', 10, 'completed'),
  (5, date('now'), 'pagi', '10:00', '12:00', 9, 'tindakan', 2, 'scheduled'),
  (6, date('now'), 'pagi', '08:00', '14:00', 10, 'poliklinik', 22, 'completed'),
  (7, date('now'), 'pagi', '06:30', '14:00', 2, 'jaga', 5, 'completed'),
  (8, date('now'), 'siang', '14:00', '21:00', 5, 'visite', 10, 'scheduled'),
  (9, date('now'), 'siang', '14:00', '21:00', 3, 'operasi', 2, 'scheduled'),
  (10, date('now'), 'malam', '21:00', '07:00', 7, 'jaga', 0, 'scheduled'),
  -- Yesterday's data
  (1, date('now', '-1 day'), 'pagi', '07:00', '14:00', 5, 'visite', 11, 'completed'),
  (2, date('now', '-1 day'), 'pagi', '07:30', '15:00', 3, 'operasi', 4, 'completed'),
  (3, date('now', '-1 day'), 'pagi', '07:00', '14:00', 7, 'poliklinik', 16, 'completed'),
  (5, date('now', '-1 day'), 'pagi', '07:00', '14:00', 9, 'visite', 9, 'completed'),
  (6, date('now', '-1 day'), 'pagi', '08:00', '14:00', 10, 'poliklinik', 20, 'missed'),
  (7, date('now', '-1 day'), 'malam', '21:00', '07:00', 2, 'jaga', 4, 'completed');

-- PPDS Rotations
INSERT OR IGNORE INTO ppds_rotations (employee_id, department_id, supervisor_id, start_date, end_date, stage, status) VALUES 
  (11, 5, 1, '2026-01-01', '2026-03-31', 'junior', 'active'),
  (12, 6, 2, '2026-01-01', '2026-03-31', 'junior', 'active'),
  (13, 7, 3, '2026-02-01', '2026-04-30', 'junior', 'active'),
  (14, 8, 4, '2026-01-15', '2026-04-15', 'senior', 'active'),
  (15, 9, 5, '2026-02-01', '2026-04-30', 'senior', 'active'),
  (16, 5, 8, '2026-01-01', '2026-03-31', 'junior', 'active'),
  (17, 6, 9, '2026-02-01', '2026-04-30', 'chief', 'active'),
  (18, 10, 6, '2026-01-15', '2026-04-15', 'junior', 'active');

-- Access Logs
INSERT OR IGNORE INTO access_logs (employee_id, device_id, access_time, room_name, access_type, method) VALUES 
  (1, 4, datetime('now', '-6 hours'), 'ICU', 'granted', 'face'),
  (7, 4, datetime('now', '-5 hours'), 'ICU', 'granted', 'face'),
  (2, 5, datetime('now', '-4 hours'), 'OK Bedah Sentral', 'granted', 'face'),
  (12, 5, datetime('now', '-4 hours', '+5 minutes'), 'OK Bedah Sentral', 'granted', 'face'),
  (21, 5, datetime('now', '-3 hours', '-30 minutes'), 'OK Bedah Sentral', 'granted', 'face'),
  (22, 6, datetime('now', '-7 hours', '-35 minutes'), 'Farmasi', 'granted', 'face'),
  (NULL, 4, datetime('now', '-2 hours'), 'ICU', 'denied', 'face'),
  (19, 4, datetime('now', '-1 hour'), 'ICU', 'granted', 'face'),
  (3, 4, datetime('now', '-45 minutes'), 'ICU', 'granted', 'face'),
  (NULL, 5, datetime('now', '-30 minutes'), 'OK Bedah Sentral', 'denied', 'face');
