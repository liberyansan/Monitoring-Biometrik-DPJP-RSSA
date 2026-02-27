-- =====================================================
-- RSSA Biometric Monitoring System - Comprehensive Seed Data
-- 7 Kategori SDM RS Saiful Anwar Malang
-- =====================================================

-- ===========================
-- DEPARTMENTS (Expanded)
-- ===========================
DELETE FROM access_logs;
DELETE FROM attendance;
DELETE FROM dpjp_schedules;
DELETE FROM ppds_rotations;
DELETE FROM shift_schedules;
DELETE FROM staffing_requirements;
DELETE FROM employees;
DELETE FROM devices;
DELETE FROM departments;

INSERT INTO departments (id, code, name, type, is_critical, floor, building) VALUES 
  (1, 'IGD', 'Instalasi Gawat Darurat', 'instalasi', 1, 'Lantai 1', 'Gedung A'),
  (2, 'ICU', 'Intensive Care Unit', 'ruangan', 1, 'Lantai 2', 'Gedung A'),
  (3, 'OK', 'Instalasi Bedah Sentral (OK)', 'instalasi', 1, 'Lantai 3', 'Gedung A'),
  (4, 'FARMASI', 'Instalasi Farmasi', 'instalasi', 0, 'Lantai 1', 'Gedung B'),
  (5, 'POLI-PD', 'Poliklinik Penyakit Dalam', 'poli', 0, 'Lantai 1', 'Gedung C'),
  (6, 'POLI-BEDAH', 'Poliklinik Bedah', 'poli', 0, 'Lantai 1', 'Gedung C'),
  (7, 'POLI-ANAK', 'Poliklinik Anak', 'poli', 0, 'Lantai 1', 'Gedung C'),
  (8, 'POLI-OBGYN', 'Poliklinik Obgyn', 'poli', 0, 'Lantai 2', 'Gedung C'),
  (9, 'POLI-JANTUNG', 'Poliklinik Jantung', 'poli', 0, 'Lantai 2', 'Gedung C'),
  (10, 'POLI-SARAF', 'Poliklinik Saraf', 'poli', 0, 'Lantai 2', 'Gedung C'),
  (11, 'RAW-INAP-1', 'Rawat Inap Paviliun 1', 'ruangan', 0, 'Lantai 2', 'Gedung B'),
  (12, 'RAW-INAP-2', 'Rawat Inap Paviliun 2', 'ruangan', 0, 'Lantai 3', 'Gedung B'),
  (13, 'RADIOLOGI', 'Instalasi Radiologi', 'instalasi', 0, 'Lantai 1', 'Gedung A'),
  (14, 'LAB', 'Instalasi Laboratorium', 'instalasi', 0, 'Lantai 1', 'Gedung A'),
  (15, 'REHAB', 'Instalasi Rehabilitasi Medik', 'instalasi', 0, 'Lantai 1', 'Gedung D'),
  (16, 'SDM', 'Bagian SDM', 'unit', 0, 'Lantai 2', 'Gedung D'),
  (17, 'IT', 'Bagian Teknologi Informasi', 'unit', 0, 'Lantai 2', 'Gedung D'),
  (18, 'MANAJEMEN', 'Manajemen RS', 'unit', 0, 'Lantai 3', 'Gedung D'),
  (19, 'NICU', 'Neonatal ICU', 'ruangan', 1, 'Lantai 2', 'Gedung A'),
  (20, 'ICCU', 'Intensive Cardiac Care Unit', 'ruangan', 1, 'Lantai 2', 'Gedung A'),
  (21, 'GIZI', 'Instalasi Gizi', 'instalasi', 0, 'Lantai 1', 'Gedung D'),
  (22, 'CSSD', 'Central Sterile Supply Department', 'instalasi', 0, 'Lantai 1', 'Gedung A'),
  (23, 'KAMAR-BERSALIN', 'Kamar Bersalin / VK', 'ruangan', 1, 'Lantai 2', 'Gedung B'),
  (24, 'REKAM-MEDIS', 'Instalasi Rekam Medis', 'instalasi', 0, 'Lantai 1', 'Gedung D'),
  (25, 'KEUANGAN', 'Bagian Keuangan', 'unit', 0, 'Lantai 3', 'Gedung D'),
  (26, 'POLI-GIGI', 'Poliklinik Gigi & Mulut', 'poli', 0, 'Lantai 1', 'Gedung C'),
  (27, 'IPSRS', 'Instalasi Pemeliharaan Sarana RS', 'instalasi', 0, 'Lantai 1', 'Gedung D'),
  (28, 'LAUNDRY', 'Unit Laundry', 'unit', 0, 'Lantai 1', 'Gedung D'),
  (29, 'KEAMANAN', 'Unit Keamanan', 'unit', 0, 'Lantai 1', 'Gedung A'),
  (30, 'PENDAFTARAN', 'Loket Pendaftaran & Admisi', 'unit', 0, 'Lantai 1', 'Gedung A');

-- ===========================
-- 1. TENAGA MEDIS
-- ===========================
-- DPJP Konsultan (Dokter Spesialis & Sub-spesialis)
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, sip_str, employment_type, priority_level) VALUES 
  (1, '196501011990011001', 'dr. Ahmad Fauzi, Sp.PD-KGH', 'dpjp', 'tenaga_medis', 'dpjp_konsultan', 'Penyakit Dalam - Ginjal Hipertensi', 5, '08123456001', 'BIO-001', 1, 1, 'SIP-001/2024', 'pns', 1),
  (2, '197002151995012002', 'dr. Siti Rahmawati, Sp.B-KBD', 'dpjp', 'tenaga_medis', 'dpjp_konsultan', 'Bedah - Digestif', 6, '08123456002', 'BIO-002', 1, 1, 'SIP-002/2024', 'pns', 1),
  (3, '196808201993031003', 'dr. Bambang Sutrisno, Sp.A-KIC', 'dpjp', 'tenaga_medis', 'dpjp_konsultan', 'Anak - Intensive Care', 7, '08123456003', 'BIO-003', 1, 1, 'SIP-003/2024', 'pns', 1),
  (4, '197505101998022004', 'dr. Dewi Kartika, Sp.OG-KFM', 'dpjp', 'tenaga_medis', 'dpjp_konsultan', 'Obstetri Ginekologi - Fetomaternal', 8, '08123456004', 'BIO-004', 1, 1, 'SIP-004/2024', 'pns', 1),
  (5, '197112031996011005', 'dr. Hendra Wijaya, Sp.JP-KI', 'dpjp', 'tenaga_medis', 'dpjp_konsultan', 'Jantung - Intervensi', 9, '08123456005', 'BIO-005', 1, 1, 'SIP-005/2024', 'pns', 1),
  (6, '196906151994032006', 'dr. Ratna Kusuma, Sp.S-KNF', 'dpjp', 'tenaga_medis', 'dpjp_konsultan', 'Saraf - Neurofisiologi', 10, '08123456006', 'BIO-006', 1, 1, 'SIP-006/2024', 'pns', 1),
  (7, '197308201997031007', 'dr. Agus Prasetyo, Sp.An-KIC', 'dpjp', 'tenaga_medis', 'dpjp_konsultan', 'Anestesi - Intensive Care', 2, '08123456007', 'BIO-007', 1, 1, 'SIP-007/2024', 'pns', 1),
  (8, '196712101992012008', 'dr. Lina Hartanti, Sp.PD-KGEH', 'dpjp', 'tenaga_medis', 'dpjp_konsultan', 'Penyakit Dalam - Gastroentero Hepatologi', 5, '08123456008', 'BIO-008', 1, 1, 'SIP-008/2024', 'pns', 1),
  (9, '197601051999031009', 'dr. Rudi Hermawan, Sp.B-KL', 'dpjp', 'tenaga_medis', 'dpjp_spesialis', 'Bedah - Laparoskopi', 6, '08123456009', 'BIO-009', 1, 0, 'SIP-009/2024', 'pns', 1),
  (10, '197809152002122010', 'dr. Maya Sari, Sp.A-KGH', 'dpjp', 'tenaga_medis', 'dpjp_konsultan', 'Anak - Gastro Hepatologi', 7, '08123456010', 'BIO-010', 1, 1, 'SIP-010/2024', 'pns', 1);

-- Dokter Umum (IGD, Jaga)
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, sip_str, employment_type, priority_level) VALUES 
  (11, '199001012020011001', 'dr. Farid Maulana', 'dokter_umum', 'tenaga_medis', 'dokter_umum', 'Dokter Jaga IGD', 1, '08123456011', 'BIO-011', 1, 1, 'SIP-011/2024', 'pns', 2),
  (12, '199203012021012002', 'dr. Nadia Safitri', 'dokter_umum', 'tenaga_medis', 'dokter_umum', 'Dokter Jaga IGD', 1, '08123456012', 'BIO-012', 1, 1, 'SIP-012/2024', 'pns', 2),
  (13, '199105012019011003', 'dr. Rian Kurniawan', 'dokter_umum', 'tenaga_medis', 'dokter_umum', 'Dokter Jaga Rawat Inap', 11, '08123456013', 'BIO-013', 1, 1, 'SIP-013/2024', 'pppk', 2);

-- Dokter Gigi
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, sip_str, employment_type, priority_level) VALUES 
  (14, '198801012018012001', 'drg. Ayu Lestari, Sp.BM', 'dokter_gigi', 'tenaga_medis', 'dokter_gigi_spesialis', 'Bedah Mulut', 26, '08123456014', 'BIO-014', 1, 1, 'SIP-014/2024', 'pns', 2);

-- ===========================
-- 2. TENAGA PENDIDIKAN
-- ===========================
-- PPDS (Residen)
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, employment_type, priority_level) VALUES 
  (15, '202001011001', 'dr. Andi Prasetya', 'ppds', 'tenaga_pendidikan', 'ppds_residen', 'PPDS Penyakit Dalam (Tahun 2)', 5, '08123456101', 'BIO-101', 1, 1, 'kontrak', 1),
  (16, '202001011002', 'dr. Bella Oktaviani', 'ppds', 'tenaga_pendidikan', 'ppds_residen', 'PPDS Bedah (Tahun 3)', 6, '08123456102', 'BIO-102', 1, 1, 'kontrak', 1),
  (17, '202001011003', 'dr. Cahyo Wibowo', 'ppds', 'tenaga_pendidikan', 'ppds_residen', 'PPDS Anak (Tahun 1)', 7, '08123456103', 'BIO-103', 1, 1, 'kontrak', 1),
  (18, '202001011004', 'dr. Dini Lestari', 'ppds', 'tenaga_pendidikan', 'ppds_residen', 'PPDS Obgyn (Tahun 2)', 8, '08123456104', 'BIO-104', 1, 0, 'kontrak', 1),
  (19, '202001011005', 'dr. Erik Saputra', 'ppds', 'tenaga_pendidikan', 'ppds_residen', 'PPDS Jantung (Tahun 3)', 9, '08123456105', 'BIO-105', 1, 1, 'kontrak', 1),
  (20, '202001011006', 'dr. Fitri Handayani', 'ppds', 'tenaga_pendidikan', 'ppds_residen', 'PPDS Penyakit Dalam (Tahun 1)', 5, '08123456106', 'BIO-106', 1, 1, 'kontrak', 1),
  (21, '202001011007', 'dr. Galih Nugroho', 'ppds', 'tenaga_pendidikan', 'ppds_residen', 'PPDS Bedah (Tahun 2)', 6, '08123456107', 'BIO-107', 0, 1, 'kontrak', 1),
  (22, '202001011008', 'dr. Hana Permata', 'ppds', 'tenaga_pendidikan', 'ppds_residen', 'PPDS Saraf (Tahun 1)', 10, '08123456108', 'BIO-108', 1, 1, 'kontrak', 1);

-- Fellow (PPDS Sub-spesialis)
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, employment_type, priority_level) VALUES 
  (23, '202101011009', 'dr. Irwan, Sp.PD', 'fellow', 'tenaga_pendidikan', 'fellow', 'Fellow Ginjal Hipertensi', 5, '08123456109', 'BIO-109', 1, 1, 'kontrak', 1),
  (24, '202101011010', 'dr. Jasmine, Sp.JP', 'fellow', 'tenaga_pendidikan', 'fellow', 'Fellow Intervensi Kardiologi', 9, '08123456110', 'BIO-110', 1, 1, 'kontrak', 1);

-- Co-Ass / Dokter Muda
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, employment_type, priority_level) VALUES 
  (25, '202301011011', 'Mhs. Kevin Pratama', 'co_ass', 'tenaga_pendidikan', 'co_ass', 'Koas Stase Penyakit Dalam', 5, '08123456111', 'BIO-111', 1, 0, 'kontrak', 3),
  (26, '202301011012', 'Mhs. Lisa Anggraini', 'co_ass', 'tenaga_pendidikan', 'co_ass', 'Koas Stase Bedah', 6, '08123456112', 'BIO-112', 1, 0, 'kontrak', 3),
  (27, '202301011013', 'Mhs. Muhammad Rizki', 'co_ass', 'tenaga_pendidikan', 'co_ass', 'Koas Stase Anak', 7, '08123456113', 'BIO-113', 1, 0, 'kontrak', 3);

-- ===========================
-- 3. TENAGA KEPERAWATAN
-- ===========================
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, employment_type, priority_level) VALUES 
  -- Perawat ICU (Prioritas 1 - Area Kritis)
  (28, '198501011010', 'Ns. Retno Wulandari, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_icu', 'Perawat ICU Senior', 2, '08123456201', 'BIO-201', 1, 1, 'pns', 1),
  (29, '199001012015011001', 'Ns. Arif Setiawan, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_icu', 'Perawat ICU', 2, '08123456209', 'BIO-209', 1, 1, 'pns', 1),
  (30, '199201012017011002', 'Ns. Putri Rahayu, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_icu', 'Perawat ICU', 2, '08123456210', 'BIO-210', 1, 1, 'pppk', 1),
  (31, '199301012018012003', 'Ns. Dewi Anggraeni, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_iccu', 'Perawat ICCU', 20, '08123456211', 'BIO-211', 1, 1, 'pns', 1),
  -- Perawat IGD (Prioritas 1)
  (32, '198702151011', 'Ns. Budi Santoso, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_igd', 'Perawat IGD Senior', 1, '08123456202', 'BIO-202', 1, 1, 'pns', 1),
  (33, '199101012016011004', 'Ns. Wahyu Hidayat, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_igd', 'Perawat IGD', 1, '08123456212', 'BIO-212', 1, 1, 'pns', 1),
  (34, '199401012019012005', 'Ns. Sari Indah, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_igd', 'Perawat IGD', 1, '08123456213', 'BIO-213', 1, 1, 'pppk', 1),
  -- Perawat OK (Prioritas 1)
  (35, '199001201012', 'Ns. Citra Dewi, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_ok', 'Perawat Kamar Operasi', 3, '08123456203', 'BIO-203', 1, 1, 'pns', 1),
  (36, '199201012017012006', 'Ns. Mega Purnama, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_ok', 'Perawat Kamar Operasi', 3, '08123456214', 'BIO-214', 1, 1, 'pns', 1),
  -- Perawat Rawat Inap
  (37, '199303151017', 'Ns. Hesti Rahayu, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_klinis', 'Perawat Rawat Inap', 11, '08123456208', 'BIO-208', 1, 1, 'pns', 2),
  (38, '199501012020012007', 'Ns. Tika Permata, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_klinis', 'Perawat Rawat Inap', 12, '08123456215', 'BIO-215', 1, 1, 'pppk', 2),
  -- Bidan
  (39, '199001012016012008', 'Bd. Yuni Astuti, S.ST', 'bidan', 'tenaga_keperawatan', 'bidan', 'Bidan Kamar Bersalin', 23, '08123456216', 'BIO-216', 1, 1, 'pns', 2),
  (40, '199301012018012009', 'Bd. Rina Marlina, A.Md.Keb', 'bidan', 'tenaga_keperawatan', 'bidan', 'Bidan Poli Obgyn', 8, '08123456217', 'BIO-217', 1, 1, 'pppk', 2),
  -- Perawat Anestesi
  (41, '198901012015011010', 'Ns. Darmawan, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_anestesi', 'Perawat Anestesi OK', 3, '08123456218', 'BIO-218', 1, 1, 'pns', 1),
  -- Perawat NICU
  (42, '199401012019012011', 'Ns. Laras Pratiwi, S.Kep', 'perawat', 'tenaga_keperawatan', 'perawat_nicu', 'Perawat NICU', 19, '08123456219', 'BIO-219', 1, 1, 'pns', 1);

-- ===========================
-- 4. TENAGA KEFARMASIAN
-- ===========================
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, employment_type, priority_level) VALUES 
  (43, '198803101013', 'Apt. Diana Sari, S.Farm', 'apoteker', 'tenaga_kefarmasian', 'apoteker', 'Apoteker Klinis', 4, '08123456204', 'BIO-204', 1, 1, 'pns', 2),
  (44, '199001012016011012', 'Apt. Rahman Hakim, S.Farm', 'apoteker', 'tenaga_kefarmasian', 'apoteker', 'Apoteker Farmasi Rawat Inap', 4, '08123456220', 'BIO-220', 1, 1, 'pns', 2),
  (45, '199301012018012013', 'Sinta Dewi, A.Md.Farm', 'ttk', 'tenaga_kefarmasian', 'ttk', 'TTK Depo IGD', 4, '08123456221', 'BIO-221', 1, 1, 'pppk', 3),
  (46, '199501012020012014', 'Riko Firmansyah, A.Md.Farm', 'ttk', 'tenaga_kefarmasian', 'ttk', 'TTK Gudang Farmasi', 4, '08123456222', 'BIO-222', 1, 1, 'kontrak', 3);

-- ===========================
-- 5. TENAGA PENUNJANG MEDIS
-- ===========================
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, employment_type, priority_level) VALUES 
  -- Radiografer
  (47, '199205151014', 'Eko Prasetyo, A.Md.Rad', 'radiografer', 'tenaga_penunjang_medis', 'radiografer', 'Radiografer CT Scan', 13, '08123456205', 'BIO-205', 1, 1, 'pns', 3),
  (48, '199301012018011015', 'Andri Susanto, A.Md.Rad', 'radiografer', 'tenaga_penunjang_medis', 'radiografer', 'Radiografer Rontgen', 13, '08123456223', 'BIO-223', 1, 1, 'pppk', 3),
  -- Analis Laboratorium
  (49, '199001012016012016', 'Nurul Hidayah, A.Md.AK', 'analis_lab', 'tenaga_penunjang_medis', 'analis_lab', 'Analis Lab Patologi Klinik', 14, '08123456224', 'BIO-224', 1, 1, 'pns', 3),
  (50, '199201012017012017', 'Dian Permatasari, S.Si', 'analis_lab', 'tenaga_penunjang_medis', 'analis_lab', 'Analis Lab Mikrobiologi', 14, '08123456225', 'BIO-225', 1, 1, 'pns', 3),
  -- Fisioterapis
  (51, '199101012016011018', 'Agung Wicaksono, S.Ft', 'fisioterapis', 'tenaga_penunjang_medis', 'fisioterapis', 'Fisioterapis', 15, '08123456226', 'BIO-226', 1, 1, 'pns', 3),
  -- Ahli Gizi
  (52, '199201012017012019', 'Lestari Wulandari, S.Gz', 'ahli_gizi', 'tenaga_penunjang_medis', 'ahli_gizi', 'Dietisien Klinis', 21, '08123456227', 'BIO-227', 1, 1, 'pns', 3),
  -- Perekam Medis
  (53, '199301012018012020', 'Intan Cahyani, A.Md.RMIK', 'perekam_medis', 'tenaga_penunjang_medis', 'perekam_medis', 'Perekam Medis', 24, '08123456228', 'BIO-228', 1, 1, 'pppk', 3);

-- ===========================
-- 6. MANAJEMEN & ADMINISTRASI
-- ===========================
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, employment_type, priority_level) VALUES 
  -- Direksi
  (54, '196501011990011099', 'dr. Susilo Wibowo, Sp.PD-KGEH, M.Kes', 'direksi', 'manajemen_administrasi', 'direksi', 'Direktur Utama', 18, '08123456301', 'BIO-301', 1, 1, 'pns', 3),
  (55, '196801012000012099', 'dr. Endang Purwati, Sp.A, M.Kes', 'direksi', 'manajemen_administrasi', 'direksi', 'Wakil Direktur Medis', 18, '08123456302', 'BIO-302', 1, 1, 'pns', 3),
  -- Staff SDM
  (56, '199108051016', 'Gita Permatasari, S.KM', 'staff_admin', 'manajemen_administrasi', 'staff_sdm', 'Staff SDM', 16, '08123456207', 'BIO-207', 1, 1, 'pns', 3),
  (57, '199301012018012021', 'Anisa Rahmawati, S.E', 'staff_admin', 'manajemen_administrasi', 'staff_sdm', 'Staff SDM', 16, '08123456229', 'BIO-229', 1, 1, 'pppk', 3),
  -- Staff IT
  (58, '198910201015', 'Fajar Hidayat, S.Kom', 'staff_it', 'manajemen_administrasi', 'staff_it', 'Programmer SIMRS', 17, '08123456206', 'BIO-206', 1, 1, 'pns', 3),
  (59, '199501012020011022', 'Bayu Aji, S.Kom', 'staff_it', 'manajemen_administrasi', 'staff_it', 'Network Administrator', 17, '08123456230', 'BIO-230', 1, 1, 'kontrak', 3),
  -- Staff Keuangan
  (60, '199001012016012023', 'Hari Susanto, S.E', 'staff_admin', 'manajemen_administrasi', 'staff_keuangan', 'Staff Keuangan', 25, '08123456231', 'BIO-231', 1, 1, 'pns', 3),
  -- Pendaftaran / Front Office
  (61, '199601012021012024', 'Winda Sari, A.Md', 'staff_admin', 'manajemen_administrasi', 'staff_admisi', 'Petugas Pendaftaran', 30, '08123456232', 'BIO-232', 1, 1, 'kontrak', 3),
  (62, '199701012022012025', 'Lia Kurniati, SH', 'staff_admin', 'manajemen_administrasi', 'staff_admisi', 'Petugas Admisi Rawat Inap', 30, '08123456233', 'BIO-233', 1, 1, 'kontrak', 3);

-- ===========================
-- 7. TENAGA PENUNJANG NON-MEDIS
-- ===========================
INSERT INTO employees (id, nip, name, role, category, sub_role, specialization, department_id, phone, biometric_id, face_registered, finger_registered, employment_type, priority_level) VALUES 
  -- Security
  (63, '199001012016011026', 'Teguh Prasetyo', 'security', 'tenaga_penunjang_non_medis', 'security', 'Komandan Regu Jaga', 29, '08123456234', 'BIO-234', 1, 1, 'outsource', 3),
  (64, '199301012018011027', 'Bambang Hermanto', 'security', 'tenaga_penunjang_non_medis', 'security', 'Satpam Gedung A', 29, '08123456235', 'BIO-235', 1, 1, 'outsource', 3),
  -- Driver Ambulans
  (65, '198801012018011028', 'Supriyadi', 'driver', 'tenaga_penunjang_non_medis', 'driver_ambulans', 'Driver Ambulans', 1, '08123456236', 'BIO-236', 1, 1, 'outsource', 3),
  -- Teknisi IPSRS
  (66, '199001012016011029', 'Hadi Purnomo', 'teknisi', 'tenaga_penunjang_non_medis', 'teknisi', 'Teknisi Elektromedis', 27, '08123456237', 'BIO-237', 1, 1, 'pns', 4),
  -- CSSD
  (67, '199401012019012030', 'Sri Wahyuni', 'cssd', 'tenaga_penunjang_non_medis', 'petugas_cssd', 'Petugas Sterilisasi', 22, '08123456238', 'BIO-238', 1, 1, 'pppk', 3),
  -- Laundry
  (68, '199501012020011031', 'Sugeng Riyadi', 'laundry', 'tenaga_penunjang_non_medis', 'petugas_laundry', 'Petugas Laundry', 28, '08123456239', 'BIO-239', 1, 0, 'outsource', 4),
  -- Cleaning Service
  (69, '199601012021011032', 'Didik Setiawan', 'cleaning', 'tenaga_penunjang_non_medis', 'cleaning_service', 'Cleaning Service Gedung A', 29, '08123456240', 'BIO-240', 1, 0, 'outsource', 4),
  (70, '199701012022012033', 'Supini', 'cleaning', 'tenaga_penunjang_non_medis', 'cleaning_service', 'Cleaning Service Gedung B', 29, '08123456241', 'BIO-241', 1, 0, 'outsource', 4);

-- ===========================
-- DEVICES (Expanded)
-- ===========================
INSERT INTO devices (device_code, name, type, location, location_type, ip_address, status) VALUES 
  ('FR-LOBBY-01', 'Face Recognition Lobby Utama', 'face_recognition', 'Lobby Utama Gedung A Lt.1', 'lobby', '192.168.1.101', 'active'),
  ('FR-LOBBY-02', 'Face Recognition Lobby Samping', 'face_recognition', 'Lobby Samping Gedung B Lt.1', 'lobby', '192.168.1.102', 'active'),
  ('FP-IGD-01', 'Fingerprint IGD', 'fingerprint', 'Pintu Masuk IGD', 'unit', '192.168.1.103', 'active'),
  ('FR-ICU-01', 'Face Recognition ICU', 'face_recognition', 'Pintu Akses ICU', 'icu', '192.168.1.104', 'active'),
  ('CB-OK-01', 'Combo Device OK', 'combo', 'Pintu Akses OK/Bedah Sentral', 'ok', '192.168.1.105', 'active'),
  ('FR-FARM-01', 'Face Recognition Farmasi', 'face_recognition', 'Pintu Akses Farmasi', 'farmasi', '192.168.1.106', 'active'),
  ('FP-POLI-01', 'Fingerprint Poliklinik', 'fingerprint', 'Lobby Poliklinik Gedung C', 'unit', '192.168.1.107', 'active'),
  ('FR-RAW-01', 'Face Recognition Rawat Inap', 'face_recognition', 'Lobby Gedung B Lt.2 Rawat Inap', 'unit', '192.168.1.108', 'active'),
  ('CB-LAB-01', 'Combo Device Lab', 'combo', 'Pintu Akses Laboratorium', 'unit', '192.168.1.109', 'maintenance'),
  ('FR-NICU-01', 'Face Recognition NICU', 'face_recognition', 'Pintu Akses NICU', 'icu', '192.168.1.110', 'active'),
  ('FR-ICCU-01', 'Face Recognition ICCU', 'face_recognition', 'Pintu Akses ICCU', 'icu', '192.168.1.111', 'active'),
  ('CB-VK-01', 'Combo Device Kamar Bersalin', 'combo', 'Pintu Akses Kamar Bersalin/VK', 'unit', '192.168.1.112', 'active'),
  ('FR-CSSD-01', 'Face Recognition CSSD', 'face_recognition', 'Pintu Akses CSSD', 'unit', '192.168.1.113', 'active'),
  ('FR-CAD-01', 'Face Recognition Cadangan 1', 'face_recognition', 'Area Cadangan', 'other', '192.168.1.114', 'inactive'),
  ('FR-CAD-02', 'Face Recognition Cadangan 2', 'face_recognition', 'Area Cadangan', 'other', '192.168.1.115', 'inactive');

-- ===========================
-- ATTENDANCE (Today - all categories)
-- ===========================
-- Tenaga Medis - DPJP
INSERT INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status) VALUES 
  (1, 1, datetime('now', '-8 hours'), 'clock_in', 'face', 98.5, 'Lobby Utama', 'verified'),
  (2, 1, datetime('now', '-7 hours', '-45 minutes'), 'clock_in', 'face', 97.2, 'Lobby Utama', 'verified'),
  (3, 2, datetime('now', '-7 hours', '-30 minutes'), 'clock_in', 'face', 99.1, 'Lobby Samping', 'verified'),
  (4, 1, datetime('now', '-7 hours', '-15 minutes'), 'clock_in', 'face', 96.8, 'Lobby Utama', 'verified'),
  (5, 7, datetime('now', '-7 hours'), 'clock_in', 'fingerprint', 95.0, 'Poliklinik', 'verified'),
  (6, 1, datetime('now', '-6 hours', '-45 minutes'), 'clock_in', 'face', 98.0, 'Lobby Utama', 'verified'),
  (7, 4, datetime('now', '-8 hours', '-30 minutes'), 'clock_in', 'face', 99.5, 'ICU', 'verified'),
  (8, 1, datetime('now', '-7 hours', '-50 minutes'), 'clock_in', 'face', 97.8, 'Lobby Utama', 'verified'),
  (9, 1, datetime('now', '-7 hours', '-10 minutes'), 'clock_in', 'face', 96.0, 'Lobby Utama', 'verified'),
  -- Dokter Umum IGD
  (11, 3, datetime('now', '-8 hours'), 'clock_in', 'fingerprint', 97.0, 'IGD', 'verified'),
  (12, 3, datetime('now', '-14 hours'), 'clock_in', 'fingerprint', 96.5, 'IGD', 'verified'),
  (13, 8, datetime('now', '-7 hours', '-20 minutes'), 'clock_in', 'face', 98.0, 'Rawat Inap', 'verified');

-- Tenaga Pendidikan
INSERT INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status) VALUES 
  (15, 1, datetime('now', '-7 hours', '-40 minutes'), 'clock_in', 'face', 96.5, 'Lobby Utama', 'verified'),
  (16, 5, datetime('now', '-7 hours', '-20 minutes'), 'clock_in', 'face', 97.0, 'OK', 'verified'),
  (17, 2, datetime('now', '-7 hours', '-10 minutes'), 'clock_in', 'face', 98.2, 'Lobby Samping', 'verified'),
  (18, 1, datetime('now', '-7 hours', '-5 minutes'), 'clock_in', 'face', 95.5, 'Lobby Utama', 'verified'),
  (19, 7, datetime('now', '-6 hours', '-50 minutes'), 'clock_in', 'fingerprint', 96.0, 'Poliklinik', 'verified'),
  (20, 1, datetime('now', '-7 hours', '-35 minutes'), 'clock_in', 'face', 97.5, 'Lobby Utama', 'verified'),
  (23, 1, datetime('now', '-7 hours', '-25 minutes'), 'clock_in', 'face', 98.0, 'Lobby Utama', 'verified'),
  (25, 7, datetime('now', '-6 hours', '-55 minutes'), 'clock_in', 'fingerprint', 94.0, 'Poliklinik', 'verified'),
  (26, 5, datetime('now', '-6 hours', '-50 minutes'), 'clock_in', 'face', 95.0, 'OK', 'verified');

-- Tenaga Keperawatan (shift pagi)
INSERT INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status) VALUES 
  (28, 4, datetime('now', '-8 hours', '-15 minutes'), 'clock_in', 'face', 99.0, 'ICU', 'verified'),
  (29, 4, datetime('now', '-8 hours', '-10 minutes'), 'clock_in', 'face', 98.5, 'ICU', 'verified'),
  (30, 4, datetime('now', '-8 hours', '-5 minutes'), 'clock_in', 'face', 97.5, 'ICU', 'verified'),
  (31, 11, datetime('now', '-8 hours', '-12 minutes'), 'clock_in', 'face', 98.0, 'ICCU', 'verified'),
  (32, 3, datetime('now', '-8 hours', '-20 minutes'), 'clock_in', 'fingerprint', 96.0, 'IGD', 'verified'),
  (33, 3, datetime('now', '-8 hours', '-18 minutes'), 'clock_in', 'fingerprint', 95.5, 'IGD', 'verified'),
  (35, 5, datetime('now', '-7 hours', '-55 minutes'), 'clock_in', 'face', 97.5, 'OK', 'verified'),
  (36, 5, datetime('now', '-7 hours', '-50 minutes'), 'clock_in', 'face', 98.0, 'OK', 'verified'),
  (37, 8, datetime('now', '-7 hours', '-45 minutes'), 'clock_in', 'face', 96.5, 'Rawat Inap', 'verified'),
  (39, 12, datetime('now', '-7 hours', '-40 minutes'), 'clock_in', 'face', 97.0, 'Kamar Bersalin', 'verified'),
  (41, 5, datetime('now', '-7 hours', '-48 minutes'), 'clock_in', 'face', 98.5, 'OK', 'verified'),
  (42, 10, datetime('now', '-8 hours', '-8 minutes'), 'clock_in', 'face', 99.0, 'NICU', 'verified');

-- Tenaga Kefarmasian
INSERT INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status) VALUES 
  (43, 6, datetime('now', '-7 hours', '-35 minutes'), 'clock_in', 'face', 96.0, 'Farmasi', 'verified'),
  (44, 6, datetime('now', '-7 hours', '-30 minutes'), 'clock_in', 'face', 97.0, 'Farmasi', 'verified'),
  (45, 6, datetime('now', '-7 hours', '-25 minutes'), 'clock_in', 'face', 95.5, 'Farmasi', 'verified');

-- Tenaga Penunjang Medis
INSERT INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status) VALUES 
  (47, 1, datetime('now', '-7 hours', '-20 minutes'), 'clock_in', 'face', 96.5, 'Lobby Utama', 'verified'),
  (49, 1, datetime('now', '-7 hours', '-15 minutes'), 'clock_in', 'face', 97.0, 'Lobby Utama', 'verified'),
  (51, 2, datetime('now', '-7 hours'), 'clock_in', 'face', 96.0, 'Lobby Samping', 'verified'),
  (52, 2, datetime('now', '-6 hours', '-55 minutes'), 'clock_in', 'face', 95.5, 'Lobby Samping', 'verified');

-- Manajemen & Administrasi
INSERT INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status) VALUES 
  (54, 1, datetime('now', '-7 hours', '-30 minutes'), 'clock_in', 'face', 99.0, 'Lobby Utama', 'verified'),
  (56, 1, datetime('now', '-7 hours', '-25 minutes'), 'clock_in', 'face', 96.5, 'Lobby Utama', 'verified'),
  (58, 1, datetime('now', '-7 hours', '-20 minutes'), 'clock_in', 'face', 97.0, 'Lobby Utama', 'verified'),
  (60, 1, datetime('now', '-7 hours', '-15 minutes'), 'clock_in', 'face', 96.0, 'Lobby Utama', 'verified'),
  (61, 1, datetime('now', '-7 hours', '-10 minutes'), 'clock_in', 'face', 95.5, 'Lobby Utama', 'verified');

-- Tenaga Penunjang Non-Medis
INSERT INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status) VALUES 
  (63, 1, datetime('now', '-8 hours', '-30 minutes'), 'clock_in', 'face', 95.0, 'Lobby Utama', 'verified'),
  (64, 2, datetime('now', '-8 hours', '-25 minutes'), 'clock_in', 'face', 94.5, 'Lobby Samping', 'verified'),
  (65, 3, datetime('now', '-8 hours', '-20 minutes'), 'clock_in', 'fingerprint', 93.0, 'IGD', 'verified'),
  (66, 1, datetime('now', '-7 hours', '-30 minutes'), 'clock_in', 'face', 95.5, 'Lobby Utama', 'verified'),
  (67, 13, datetime('now', '-7 hours', '-25 minutes'), 'clock_in', 'face', 96.0, 'CSSD', 'verified');

-- Akses ruangan
INSERT INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status) VALUES 
  (1, 4, datetime('now', '-6 hours'), 'access', 'face', 98.0, 'ICU', 'verified'),
  (7, 4, datetime('now', '-5 hours'), 'access', 'face', 99.2, 'ICU', 'verified'),
  (2, 5, datetime('now', '-4 hours'), 'access', 'face', 97.5, 'OK', 'verified'),
  (43, 6, datetime('now', '-3 hours'), 'access', 'face', 96.0, 'Farmasi', 'verified'),
  (3, 10, datetime('now', '-2 hours'), 'access', 'face', 98.0, 'NICU', 'verified');

-- ===========================
-- DPJP SCHEDULES
-- ===========================
INSERT INTO dpjp_schedules (employee_id, schedule_date, shift, start_time, end_time, department_id, activity_type, patient_count, status) VALUES 
  (1, date('now'), 'pagi', '07:00', '14:00', 5, 'visite', 12, 'completed'),
  (1, date('now'), 'pagi', '09:00', '12:00', 5, 'poliklinik', 20, 'completed'),
  (1, date('now'), 'pagi', '13:00', '14:00', 5, 'konsul', 3, 'completed'),
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
  (14, date('now'), 'pagi', '08:00', '14:00', 26, 'poliklinik', 10, 'completed'),
  -- Yesterday
  (1, date('now', '-1 day'), 'pagi', '07:00', '14:00', 5, 'visite', 11, 'completed'),
  (2, date('now', '-1 day'), 'pagi', '07:30', '15:00', 3, 'operasi', 4, 'completed'),
  (3, date('now', '-1 day'), 'pagi', '07:00', '14:00', 7, 'poliklinik', 16, 'completed'),
  (5, date('now', '-1 day'), 'pagi', '07:00', '14:00', 9, 'visite', 9, 'completed'),
  (6, date('now', '-1 day'), 'pagi', '08:00', '14:00', 10, 'poliklinik', 20, 'missed'),
  (7, date('now', '-1 day'), 'malam', '21:00', '07:00', 2, 'jaga', 4, 'completed');

-- ===========================
-- PPDS ROTATIONS
-- ===========================
INSERT INTO ppds_rotations (employee_id, department_id, supervisor_id, start_date, end_date, stage, status) VALUES 
  (15, 5, 1, '2026-01-01', '2026-03-31', 'senior', 'active'),
  (16, 6, 2, '2026-01-01', '2026-03-31', 'chief', 'active'),
  (17, 7, 3, '2026-02-01', '2026-04-30', 'junior', 'active'),
  (18, 8, 4, '2026-01-15', '2026-04-15', 'senior', 'active'),
  (19, 9, 5, '2026-02-01', '2026-04-30', 'senior', 'active'),
  (20, 5, 8, '2026-01-01', '2026-03-31', 'junior', 'active'),
  (21, 6, 9, '2026-02-01', '2026-04-30', 'junior', 'active'),
  (22, 10, 6, '2026-01-15', '2026-04-15', 'junior', 'active'),
  -- Fellow
  (23, 5, 1, '2025-07-01', '2026-06-30', 'fellow', 'active'),
  (24, 9, 5, '2025-07-01', '2026-06-30', 'fellow', 'active');

-- ===========================
-- SHIFT SCHEDULES (Perawat & Penunjang)
-- ===========================
-- ICU shift pagi
INSERT INTO shift_schedules (employee_id, schedule_date, shift_type, start_time, end_time, department_id, area, is_leader, status) VALUES 
  (28, date('now'), 'pagi', '07:00', '14:00', 2, 'ICU Bed 1-4', 1, 'completed'),
  (29, date('now'), 'pagi', '07:00', '14:00', 2, 'ICU Bed 5-8', 0, 'completed'),
  (30, date('now'), 'siang', '14:00', '21:00', 2, 'ICU Bed 1-8', 1, 'scheduled'),
  -- IGD
  (32, date('now'), 'pagi', '07:00', '14:00', 1, 'IGD Triage & Resusitasi', 1, 'completed'),
  (33, date('now'), 'pagi', '07:00', '14:00', 1, 'IGD Observasi', 0, 'completed'),
  (34, date('now'), 'siang', '14:00', '21:00', 1, 'IGD Triage & Resusitasi', 1, 'scheduled'),
  -- OK
  (35, date('now'), 'pagi', '07:00', '15:00', 3, 'OK Ruang 1-2', 1, 'completed'),
  (36, date('now'), 'pagi', '07:00', '15:00', 3, 'OK Ruang 3-4', 0, 'completed'),
  (41, date('now'), 'pagi', '07:00', '15:00', 3, 'OK Anestesi', 0, 'completed'),
  -- ICCU
  (31, date('now'), 'pagi', '07:00', '14:00', 20, 'ICCU', 1, 'completed'),
  -- NICU
  (42, date('now'), 'pagi', '07:00', '14:00', 19, 'NICU', 1, 'completed'),
  -- Rawat Inap
  (37, date('now'), 'pagi', '07:00', '14:00', 11, 'Paviliun 1 Lt.2', 1, 'completed'),
  (38, date('now'), 'siang', '14:00', '21:00', 12, 'Paviliun 2 Lt.3', 1, 'scheduled'),
  -- Bidan
  (39, date('now'), 'pagi', '07:00', '14:00', 23, 'Kamar Bersalin', 1, 'completed'),
  (40, date('now'), 'pagi', '08:00', '14:00', 8, 'Poli Obgyn', 0, 'completed'),
  -- Security
  (63, date('now'), 'pagi', '06:00', '14:00', 29, 'Gerbang Utama', 1, 'completed'),
  (64, date('now'), 'pagi', '06:00', '14:00', 29, 'Lobby Gedung B', 0, 'completed'),
  -- Farmasi
  (43, date('now'), 'pagi', '07:30', '14:30', 4, 'Farmasi Rawat Jalan', 1, 'completed'),
  (44, date('now'), 'pagi', '07:30', '14:30', 4, 'Farmasi Rawat Inap', 0, 'completed'),
  (45, date('now'), 'pagi', '07:30', '14:30', 4, 'Depo Farmasi IGD', 0, 'completed');

-- ===========================
-- STAFFING REQUIREMENTS
-- ===========================
INSERT INTO staffing_requirements (department_id, shift_type, category, min_count, ideal_count, notes) VALUES 
  -- ICU
  (2, 'pagi', 'tenaga_keperawatan', 3, 4, 'Rasio 1:2 (perawat:pasien)'),
  (2, 'siang', 'tenaga_keperawatan', 2, 3, 'Rasio 1:2'),
  (2, 'malam', 'tenaga_keperawatan', 2, 3, 'Rasio 1:2'),
  (2, 'pagi', 'tenaga_medis', 1, 2, 'Minimal 1 DPJP jaga'),
  -- IGD
  (1, 'pagi', 'tenaga_keperawatan', 3, 5, 'Triage + Resusitasi + Observasi'),
  (1, 'siang', 'tenaga_keperawatan', 3, 4, NULL),
  (1, 'malam', 'tenaga_keperawatan', 2, 3, NULL),
  (1, 'pagi', 'tenaga_medis', 2, 3, 'Dokter jaga IGD'),
  (1, 'malam', 'tenaga_medis', 1, 2, NULL),
  -- OK
  (3, 'pagi', 'tenaga_keperawatan', 4, 6, 'Instrument + Sirkuler per OK'),
  (3, 'pagi', 'tenaga_medis', 1, 2, 'DPJP Bedah + Anestesi'),
  -- NICU
  (19, 'pagi', 'tenaga_keperawatan', 2, 3, 'Rasio 1:2'),
  (19, 'siang', 'tenaga_keperawatan', 1, 2, NULL),
  (19, 'malam', 'tenaga_keperawatan', 1, 2, NULL),
  -- Farmasi
  (4, 'pagi', 'tenaga_kefarmasian', 3, 5, 'Rawat jalan + Rawat inap + IGD'),
  (4, 'siang', 'tenaga_kefarmasian', 2, 3, NULL),
  -- Kamar Bersalin
  (23, 'pagi', 'tenaga_keperawatan', 2, 3, 'Bidan per shift'),
  (23, 'siang', 'tenaga_keperawatan', 1, 2, NULL),
  (23, 'malam', 'tenaga_keperawatan', 1, 2, NULL);

-- ===========================
-- ADMIN USERS (4 roles)
-- ===========================
DELETE FROM admin_sessions;
DELETE FROM audit_logs;
DELETE FROM api_request_logs;
DELETE FROM api_keys;
DELETE FROM webhook_configs;
DELETE FROM simrs_config;
DELETE FROM admin_users;

INSERT INTO admin_users (username, password_hash, salt, name, role, is_active) VALUES ('admin', 'c8acbc43e0d995710845a3386dea2d9e97c98dd1166de6bb1543b607a1e9ba56', '3bfc3b8e16141c6cd06cffd0fa5bce6c', 'Super Administrator', 'super_admin', 1);
INSERT INTO admin_users (username, password_hash, salt, name, role, is_active) VALUES ('sdm', 'f90b89c54c7cdd99dc614319c294b50a093be137e0f74f6509dae7cc80148551', 'c1e25e656c8ab33d66ad1695b2f9505e', 'Admin SDM RSSA', 'admin_sdm', 1);
INSERT INTO admin_users (username, password_hash, salt, name, role, department_id, is_active) VALUES ('dept', 'd3009e1f1748d30b9337f9a16f480e59a86e8ba7ff469be2a762489963684054', '24fc309a89fc93092522f33153659823', 'Admin Departemen IGD', 'admin_dept', 1, 1);
INSERT INTO admin_users (username, password_hash, salt, name, role, is_active) VALUES ('viewer', '69376b0a025bf322f61f67a40d84a5e70e9404f8465a64f0d1d07c7af6cc44f5', '64f23e5d4b2f54bcff48a709286284a5', 'Staff Viewer', 'viewer', 1);

-- ===========================
-- SIMRS CONFIG (Konseptual)
-- ===========================
INSERT INTO simrs_config (config_key, config_value, description) VALUES 
  ('simrs_base_url', 'https://simrs.rssa.go.id/api', 'Base URL API SIMRS'),
  ('simrs_api_key', '', 'API Key untuk integrasi SIMRS'),
  ('simrs_sync_interval', '300', 'Interval sinkronisasi (detik)'),
  ('simrs_sync_enabled', 'false', 'Status aktif sinkronisasi'),
  ('simrs_last_sync', '', 'Timestamp sync terakhir'),
  ('simrs_endpoint_employees', '/v1/employees', 'Endpoint data pegawai SIMRS'),
  ('simrs_endpoint_schedules', '/v1/schedules', 'Endpoint jadwal SIMRS'),
  ('simrs_endpoint_departments', '/v1/departments', 'Endpoint departemen SIMRS');

-- ===========================
-- WEBHOOK CONFIGS (Contoh)
-- ===========================
INSERT INTO webhook_configs (name, url, events, headers, is_active) VALUES 
  ('SIMRS Notification', 'https://simrs.rssa.go.id/webhook/biometric', 'attendance:created,attendance:updated', '{"Content-Type":"application/json"}', 0),
  ('Alert System', 'https://alert.rssa.go.id/webhook/staffing', 'staffing:critical,access:denied', '{"Content-Type":"application/json"}', 0);

-- ===========================
-- ACCESS LOGS
-- ===========================
INSERT INTO access_logs (employee_id, device_id, access_time, room_name, access_type, method) VALUES 
  (1, 4, datetime('now', '-6 hours'), 'ICU', 'granted', 'face'),
  (7, 4, datetime('now', '-5 hours'), 'ICU', 'granted', 'face'),
  (28, 4, datetime('now', '-8 hours', '-15 minutes'), 'ICU', 'granted', 'face'),
  (29, 4, datetime('now', '-8 hours', '-10 minutes'), 'ICU', 'granted', 'face'),
  (2, 5, datetime('now', '-4 hours'), 'OK Bedah Sentral', 'granted', 'face'),
  (16, 5, datetime('now', '-4 hours', '+5 minutes'), 'OK Bedah Sentral', 'granted', 'face'),
  (35, 5, datetime('now', '-7 hours', '-55 minutes'), 'OK Bedah Sentral', 'granted', 'face'),
  (43, 6, datetime('now', '-7 hours', '-35 minutes'), 'Farmasi', 'granted', 'face'),
  (44, 6, datetime('now', '-7 hours', '-30 minutes'), 'Farmasi', 'granted', 'face'),
  (42, 10, datetime('now', '-8 hours', '-8 minutes'), 'NICU', 'granted', 'face'),
  (3, 10, datetime('now', '-2 hours'), 'NICU', 'granted', 'face'),
  (31, 11, datetime('now', '-8 hours', '-12 minutes'), 'ICCU', 'granted', 'face'),
  (67, 13, datetime('now', '-7 hours', '-25 minutes'), 'CSSD', 'granted', 'face'),
  (NULL, 4, datetime('now', '-3 hours'), 'ICU', 'denied', 'face'),
  (NULL, 5, datetime('now', '-2 hours', '-30 minutes'), 'OK Bedah Sentral', 'denied', 'face'),
  (NULL, 6, datetime('now', '-1 hour'), 'Farmasi', 'denied', 'face');
