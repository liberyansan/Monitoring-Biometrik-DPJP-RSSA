# SIMRS Monitoring Biometrik - RSSA Malang

## Project Overview
- **Nama**: SIMRS Monitoring Biometrik RSSA
- **RS**: Rumah Sakit dr. Saiful Anwar (RSSA) Malang
- **Tujuan**: Monitoring kehadiran dan kinerja DPJP, PPDS, dan seluruh SDM RSSA melalui biometrik (Face Recognition & Fingerprint)
- **Konteks**: RS Pendidikan (FKUB) - perlu monitoring dual-role DPJP (klinis + pendidikan)

## URLs
- **Sandbox**: https://3000-i5vf5yitz4pkh2o1v8egg-cbeee0f9.sandbox.novita.ai
- **Tech Stack**: Hono + TypeScript + Cloudflare D1 + TailwindCSS + Chart.js

## Fitur yang Sudah Selesai

### 1. Dashboard Utama
- Statistik real-time: total pegawai (70), kehadiran hari ini, DPJP aktif, PPDS, compliance DPJP
- Kehadiran per 7 kategori SDM dengan progress bar
- Live feed aktivitas biometrik terkini
- Chart distribusi SDM & metode biometrik (Face vs Fingerprint)

### 2. Overview SDM (`/api/sdm/summary`)
- Distribusi seluruh 7 kategori SDM dengan detail sub-role
- Accordion view per kategori dengan breakdown kehadiran per sub-role
- Status registrasi biometrik per kategori (Face, Finger, Keduanya)
- Pie chart distribusi & bar chart biometrik

### 3. Monitoring DPJP (`/api/dpjp/monitoring`, `/api/dpjp/:id/profile`)
- **Dual-Role Tracking**: Tab Peran Klinis + Tab Peran Pendidikan
- Jadwal harian dengan filter tanggal
- Compliance rate per DPJP (30 hari)
- Profil DPJP dengan daftar PPDS/Fellow yang dibimbing
- Summary: total jadwal, selesai, terjadwal, tidak hadir

### 4. Monitoring Pendidikan (`/api/pendidikan/monitoring`)
- PPDS (Residen): rotasi aktif, pembimbing (klik untuk lihat profil DPJP), tahapan (junior/senior/chief)
- Fellow (Sub-Spesialis): rotasi, pembimbing
- Co-Ass / Dokter Muda: stase aktif
- Kehadiran 30 hari, clock-in hari ini
- Link interaktif ke profil pembimbing DPJP

### 5. Monitoring Keperawatan (`/api/shifts?category=tenaga_keperawatan`)
- Jadwal shift per unit (ICU, IGD, OK, NICU, ICCU, Rawat Inap, Kamar Bersalin)
- Filter: tanggal, unit, tipe shift (pagi/siang/malam)
- Penanda PJ Shift, area penempatan
- Indikator clock-in dan status shift

### 6. Monitoring Kefarmasian (`/api/employees?category=tenaga_kefarmasian`)
- Profil Apoteker dan TTK
- Jadwal shift farmasi (Rawat Jalan, Rawat Inap, Depo IGD)
- Status kehadiran hari ini

### 7. Staffing Monitor (`/api/staffing/monitor`)
- Monitoring ketersediaan SDM di area kritis (ICU, IGD, OK, NICU, Farmasi, Kamar Bersalin)
- Alert otomatis jika kekurangan tenaga per shift
- Perbandingan: minimum, ideal, aktual hadir

### 8. Data Pegawai (`/api/employees`)
- 70 pegawai dalam 7 kategori SDM
- Filter: kategori, unit, prioritas (P1-P4), pencarian nama/NIP
- Detail modal: profil, biometrik, kehadiran, jadwal, rotasi, akses, compliance DPJP

### 9. Kehadiran (`/api/attendance`)
- Log absensi biometrik seluruh pegawai
- Filter: tanggal, kategori, tipe (clock in/out/akses)
- Confidence score, metode (face/fingerprint), lokasi

### 10. Akses Ruangan (`/api/access-logs`)
- Audit log akses ruangan terbatas (ICU, OK, NICU, ICCU, Farmasi, CSSD)
- Summary akses per ruangan (granted/denied)
- Filter: tanggal, tipe, ruangan

### 11. Perangkat Biometrik (`/api/devices`)
- 15 perangkat (Face Recognition, Fingerprint, Combo)
- Status: aktif (12), maintenance (1), nonaktif (2)
- Lokasi, IP address, tipe perangkat

### 12. Laporan & Analitik
- `GET /api/reports/attendance-summary` - Trend kehadiran 7 hari per kategori
- `GET /api/reports/dpjp-compliance` - Compliance DPJP 30 hari
- `GET /api/reports/access-summary` - Summary akses ruangan
- `GET /api/reports/sdm-overview` - Overview biometrik per kategori & status kerja
- Komposisi pegawai berdasarkan status kepegawaian (PNS, PPPK, Kontrak, Outsource)

## Arsitektur 7 Kategori SDM

| # | Kategori | Jumlah | Prioritas | Sub-Roles |
|---|---------|--------|-----------|-----------|
| 1 | Tenaga Medis | 14 | P1-P2 | DPJP Konsultan, DPJP Spesialis, Dokter Umum, Dokter Gigi Sp. |
| 2 | Tenaga Pendidikan | 13 | P1-P3 | PPDS Residen, Fellow, Co-Ass |
| 3 | Tenaga Keperawatan | 15 | P1-P2 | Perawat ICU/ICCU/NICU/IGD/OK/Anestesi/Klinis, Bidan |
| 4 | Tenaga Kefarmasian | 4 | P2-P3 | Apoteker, TTK |
| 5 | Tenaga Penunjang Medis | 7 | P3 | Radiografer, Analis Lab, Fisioterapis, Ahli Gizi, Perekam Medis |
| 6 | Manajemen & Administrasi | 9 | P3 | Direksi, Staff SDM, Staff IT, Staff Keuangan, Staff Admisi |
| 7 | Tenaga Penunjang Non-Medis | 8 | P3-P4 | Security, Driver Ambulans, Teknisi, CSSD, Laundry, Cleaning |

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Statistik utama
- `GET /api/dashboard/live-feed?limit=25` - Feed aktivitas terkini
- `GET /api/dashboard/category-attendance` - Kehadiran per kategori

### SDM
- `GET /api/sdm/summary` - Overview SDM per sub-role & biometrik

### DPJP
- `GET /api/dpjp/monitoring?date=YYYY-MM-DD` - Jadwal & compliance DPJP
- `GET /api/dpjp/:id/profile` - Profil DPJP dual-role (klinis + pendidikan + supervised PPDS)

### Pendidikan
- `GET /api/pendidikan/monitoring` - PPDS, Fellow, Co-Ass

### Pegawai
- `GET /api/employees?category=&role=&search=&department_id=&priority=&sub_role=&employment_type=`
- `GET /api/employees/:id` - Detail pegawai + attendance stats + rotations + DPJP compliance

### Shift & Staffing
- `GET /api/shifts?date=&department_id=&shift=&category=` - Jadwal shift
- `GET /api/staffing/monitor` - Monitoring ketersediaan SDM area kritis

### Attendance & Access
- `GET /api/attendance?date=&category=&type=&role=` - Log kehadiran
- `POST /api/attendance` - Input kehadiran biometrik `{biometric_id, device_code, method, confidence_score, scan_type}`
- `GET /api/access-logs?date=&type=&room=` - Log akses ruangan

### Perangkat & Departemen
- `GET /api/devices` - Daftar perangkat biometrik
- `GET /api/departments` - Daftar departemen/unit

### Laporan
- `GET /api/reports/attendance-summary?start=&end=` - Trend kehadiran
- `GET /api/reports/dpjp-compliance?start=&end=` - Compliance DPJP
- `GET /api/reports/access-summary?date=` - Summary akses
- `GET /api/reports/sdm-overview` - Overview biometrik SDM

## Data Architecture
- **Database**: Cloudflare D1 (SQLite)
- **Tables**: employees, departments, devices, attendance, dpjp_schedules, ppds_rotations, shift_schedules, staffing_requirements, access_logs
- **Migration**: migrations/0001_initial_schema.sql, migrations/0002_expand_sdm.sql
- **Seed**: seed.sql (70 pegawai, 30 departemen, 15 perangkat)

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: Development (Sandbox)
- **Tech Stack**: Hono 4 + TypeScript + Cloudflare D1 + TailwindCSS CDN + Chart.js + Font Awesome + Day.js
- **Last Updated**: 2026-02-24

## Fitur yang Belum Diimplementasi
- [ ] Export laporan ke PDF/Excel
- [ ] Notifikasi real-time (WebSocket/Push)
- [ ] Integrasi langsung ke SIMRS (REST API bridge)
- [ ] Face Recognition server/middleware (actual biometric processing)
- [ ] Role-based access control (RBAC) untuk admin
- [ ] Logbook PPDS elektronik
- [ ] Dashboard Direksi/Manajemen (KPI summary)
- [ ] Backup & restore database
- [ ] Multi-language support
