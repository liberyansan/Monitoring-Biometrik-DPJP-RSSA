# MONITORING Biometrik - RSSA Malang

## Project Overview
- **Nama**: Monitoring Biometrik RSSA
- **RS**: Rumah Sakit dr. Saiful Anwar (RSSA) Malang
- **Tujuan**: Monitoring kehadiran dan kinerja DPJP, PPDS, dan seluruh SDM RSSA melalui biometrik (Face Recognition & Fingerprint)
- **Konteks**: RS Pendidikan (FKUB) - perlu monitoring dual-role DPJP (klinis + pendidikan)

## URLs
- **Sandbox**: https://3000-i5vf5yitz4pkh2o1v8egg-cbeee0f9.sandbox.novita.ai
- **GitHub**: https://github.com/liberyansan/Monitoring-Biometrik-DPJP-RSSA
- **Tech Stack**: Hono + TypeScript + Cloudflare D1 + TailwindCSS + Chart.js

## Login & Role-Based Access

| Username | Password | Role | Akses |
|----------|----------|------|-------|
| `admin` | `admin123` | Super Admin | Full access (CMS, API Mgmt, Audit) |
| `sdm` | `sdm123` | Admin SDM | CMS pegawai, jadwal, departemen, laporan |
| `dept` | `dept123` | Admin Departemen | Read pegawai/jadwal, laporan departemen |
| `viewer` | `viewer123` | Viewer | Dashboard, laporan read-only |

## Fitur yang Sudah Selesai

### Monitoring (Public)
1. **Dashboard Utama** - Statistik real-time (70 pegawai, kehadiran, DPJP, PPDS, compliance)
2. **Overview SDM** - Distribusi 7 kategori, registrasi biometrik, sub-role breakdown
3. **Monitoring DPJP** - Dual-role (klinis + pendidikan), compliance 30 hari, jadwal harian
4. **Monitoring Pendidikan** - PPDS, Fellow, Co-Ass, rotasi, pembimbing
5. **Monitoring Keperawatan** - Shift per unit kritis (ICU, IGD, OK, NICU, ICCU)
6. **Monitoring Kefarmasian** - Apoteker, TTK, shift farmasi
7. **Staffing Monitor** - Alert kekurangan SDM area kritis
8. **Data Pegawai** - 70 pegawai, filter, detail modal
9. **Kehadiran** - Log biometrik, confidence score, metode
10. **Akses Ruangan** - Audit ruangan terbatas (granted/denied)
11. **Perangkat Biometrik** - 15 device (12 aktif, 1 maintenance, 2 nonaktif)
12. **Laporan** - Trend kehadiran 7 hari, compliance DPJP 30 hari

### Halaman Login
- Login form dengan username/password
- Password hashing PBKDF2 (Web Crypto API, 100k iterations)
- Session token (HttpOnly cookie, 8 jam expire)
- Demo account info di halaman login

### CMS (Content Management System)
- **Kelola Pegawai** - CRUD 70+ pegawai, edit form, soft delete
- **Import CSV** - Import data pegawai dari CSV (parse header, validasi)
- **Kelola Departemen** - CRUD 30 departemen, tipe, lokasi, status kritis
- **Kelola Perangkat** - CRUD perangkat biometrik, IP, lokasi, status
- **Kelola Jadwal** - Tab: Jadwal DPJP, Shift Perawat, Rotasi PPDS
- **User Admin** - CRUD admin user (4 role), reset password, aktif/nonaktif

### API Management
- **API Keys** - Generate/revoke key per perangkat, prefix `rssa_xxx`
- **API Key Hash** - Key hash SHA-256, prefix tampil, key asli hanya sekali
- **Rate Limit** - Configurable per key (default 60 req/min)
- **IP Whitelist** - Optional per key
- **API Logs** - Request log dengan status code, response time, error
- **Dokumentasi API** - Inline docs endpoint `POST /api/v1/attendance`

### Webhook & Integrasi SIMRS
- **Webhook Config** - CRUD webhook URL, events, secret
- **Integrasi SIMRS** - Konfigurasi konseptual (base URL, API key, interval sync)
- **Audit Log** - Riwayat seluruh perubahan CMS (create, update, delete, login)

## Arsitektur 7 Kategori SDM

| # | Kategori | Jumlah | Prioritas | Sub-Roles |
|---|---------|--------|-----------|-----------|
| 1 | Tenaga Medis | 14 | P1-P2 | DPJP Konsultan, DPJP Spesialis, Dokter Umum, Dokter Gigi Sp. |
| 2 | Tenaga Pendidikan | 13 | P1-P3 | PPDS Residen, Fellow, Co-Ass |
| 3 | Tenaga Keperawatan | 15 | P1-P2 | Perawat ICU/ICCU/NICU/IGD/OK/Anestesi/Klinis, Bidan |
| 4 | Tenaga Kefarmasian | 4 | P2-P3 | Apoteker, TTK |
| 5 | Tenaga Penunjang Medis | 7 | P3 | Radiografer, Analis Lab, Fisioterapis, Ahli Gizi, Perekam Medis |
| 6 | Manajemen & Administrasi | 9 | P3 | Direksi, Staff SDM, IT, Keuangan, Admisi |
| 7 | Tenaga Penunjang Non-Medis | 8 | P3-P4 | Security, Driver, Teknisi, CSSD, Laundry, Cleaning |

## API Endpoints

### Auth
- `POST /api/auth/login` - Login `{username, password}`
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user info

### Dashboard & Monitoring
- `GET /api/dashboard/stats` - Statistik utama
- `GET /api/dashboard/live-feed?limit=25` - Feed aktivitas
- `GET /api/dashboard/category-attendance` - Kehadiran per kategori
- `GET /api/sdm/summary` - Overview SDM
- `GET /api/dpjp/monitoring?date=` - Jadwal DPJP
- `GET /api/dpjp/:id/profile` - Profil DPJP dual-role
- `GET /api/pendidikan/monitoring` - PPDS, Fellow, Co-Ass
- `GET /api/staffing/monitor` - Staffing area kritis
- `GET /api/shifts?date=&department_id=&shift=&category=` - Jadwal shift
- `GET /api/employees?category=&role=&search=&department_id=&priority=`
- `GET /api/employees/:id` - Detail pegawai
- `GET /api/attendance?date=&category=&type=` - Log kehadiran
- `GET /api/access-logs?date=&type=&room=` - Log akses
- `GET /api/devices` - Perangkat biometrik
- `GET /api/departments` - Departemen

### CMS (Auth Required)
- `POST /api/cms/employees` - Tambah pegawai
- `PUT /api/cms/employees/:id` - Edit pegawai
- `DELETE /api/cms/employees/:id` - Hapus pegawai (soft)
- `POST /api/cms/employees/import` - Import CSV
- `POST /api/cms/departments` - Tambah departemen
- `PUT /api/cms/departments/:id` - Edit departemen
- `POST /api/cms/devices` - Tambah perangkat (super_admin)
- `PUT /api/cms/devices/:id` - Edit perangkat (super_admin)
- `POST /api/cms/dpjp-schedules` - Tambah jadwal DPJP
- `POST /api/cms/shift-schedules` - Tambah shift
- `POST /api/cms/ppds-rotations` - Tambah rotasi PPDS

### Admin (Super Admin)
- `GET/POST/PUT /api/cms/users` - CRUD admin user
- `GET/POST/PUT/DELETE /api/cms/api-keys` - CRUD API keys
- `GET /api/cms/api-logs` - Request log
- `GET/POST/PUT /api/cms/webhooks` - CRUD webhooks
- `GET/PUT /api/cms/simrs-config` - Konfigurasi SIMRS
- `GET /api/cms/audit-logs` - Audit log

### Public API (API Key Required)
- `POST /api/v1/attendance` - Input kehadiran dari perangkat
  - Header: `X-API-Key: rssa_xxx...`
  - Body: `{biometric_id, device_code, method, confidence_score, scan_type}`

### Laporan
- `GET /api/reports/attendance-summary?start=&end=` - Trend kehadiran
- `GET /api/reports/dpjp-compliance?start=&end=` - Compliance DPJP
- `GET /api/reports/access-summary?date=` - Summary akses
- `GET /api/reports/sdm-overview` - Overview biometrik SDM

## Data Architecture
- **Database**: Cloudflare D1 (SQLite)
- **Tables**: employees, departments, devices, attendance, dpjp_schedules, ppds_rotations, shift_schedules, staffing_requirements, access_logs, admin_users, admin_sessions, api_keys, api_request_logs, audit_logs, webhook_configs, simrs_config
- **Migration**: 0001_initial_schema.sql, 0002_expand_sdm.sql, 0003_auth_cms_api.sql
- **Seed**: seed.sql (70 pegawai, 30 departemen, 15 perangkat, 4 admin user, 2 webhook, 8 SIMRS config)
- **Auth**: PBKDF2 password hash, SHA-256 token hash, HttpOnly cookie

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: Development (Sandbox)
- **Tech Stack**: Hono 4 + TypeScript + Cloudflare D1 + TailwindCSS CDN + Chart.js + Font Awesome + Day.js
- **Last Updated**: 2026-02-27

## Fitur yang Belum Diimplementasi
- [ ] Export laporan ke PDF/Excel
- [ ] Notifikasi real-time (WebSocket/Push)
- [ ] Integrasi langsung ke SIMRS (REST API bridge) - konfigurasi sudah konseptual
- [ ] Face Recognition server/middleware (actual biometric processing)
- [ ] Logbook PPDS elektronik
- [ ] Dashboard Direksi/Manajemen (KPI summary)
- [ ] Backup & restore database
- [ ] Multi-language support
