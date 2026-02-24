# SIMRS Monitoring Biometrik - RSSA

## Project Overview
- **Name**: SIMRS Monitoring Biometrik RSSA
- **Institution**: RS Saiful Anwar (RSSA) Malang / DIKST Universitas Brawijaya
- **Goal**: Sistem monitoring kehadiran dan kinerja dokter (DPJP), PPDS, dan seluruh pegawai RS melalui biometrik (Face Recognition & Fingerprint), terintegrasi dengan SIMRS
- **Tech Stack**: Hono + TypeScript + Cloudflare Pages + D1 Database + TailwindCSS + Chart.js

## Fitur yang Sudah Selesai

### 1. Dashboard Real-time
- Statistik kehadiran hari ini (total hadir, DPJP, PPDS, akses ditolak)
- Live feed aktivitas biometrik terkini
- Grafik kehadiran mingguan (bar chart stacked by role)
- Distribusi metode biometrik (doughnut chart: face vs fingerprint)

### 2. Monitoring DPJP
- Tabel jadwal DPJP harian (visite, operasi, poliklinik, tindakan, jaga)
- Tracking clock-in aktual vs jadwal
- Compliance rate per hari
- Filter berdasarkan tanggal
- Jumlah pasien per jadwal

### 3. Monitoring PPDS
- Kartu informasi per PPDS (nama, rotasi, pembimbing, stage)
- Status kehadiran hari ini
- Kehadiran 30 hari terakhir
- Info rotasi (departemen, tanggal, tahap: junior/senior/chief)

### 4. Kehadiran / Absensi
- Tabel kehadiran lengkap dengan filter (tanggal, role, tipe scan)
- Metode biometrik (face recognition / fingerprint)
- Confidence score dengan visual bar
- Tipe: Clock In, Clock Out, Akses Ruangan

### 5. Data Pegawai
- Grid kartu pegawai dengan informasi lengkap
- Filter: search nama/NIP, role, departemen
- Status biometrik (face & fingerprint registered)
- Detail modal per pegawai

### 6. Log Akses Ruangan
- Audit log akses ke ruangan terbatas (ICU, OK, Farmasi)
- Summary per ruangan (granted vs denied)
- Filter: tanggal, status, ruangan
- Highlight akses ditolak

### 7. Perangkat Biometrik
- Status semua device (aktif, maintenance, nonaktif)
- Info lokasi, IP, tipe (face/fingerprint/combo)
- Terakhir sync

### 8. Laporan & Analitik
- Trend kehadiran 7 hari (line chart)
- Compliance DPJP 30 hari (bar chart + tabel detail)
- Compliance rate per dokter dengan visual progress bar

## API Endpoints

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/dashboard/stats` | Statistik dashboard |
| GET | `/api/dashboard/live-feed?limit=20` | Feed aktivitas terkini |
| GET | `/api/employees?role=&search=&department_id=` | Daftar pegawai |
| GET | `/api/employees/:id` | Detail pegawai + kehadiran + jadwal |
| GET | `/api/attendance?date=&role=&type=` | Data kehadiran |
| POST | `/api/attendance` | Record kehadiran dari device biometrik |
| GET | `/api/dpjp/monitoring?date=` | Monitoring jadwal DPJP |
| GET | `/api/ppds/monitoring` | Monitoring PPDS |
| GET | `/api/access-logs?date=&type=&room=` | Log akses ruangan |
| GET | `/api/devices` | Daftar perangkat biometrik |
| GET | `/api/departments` | Daftar departemen |
| GET | `/api/reports/attendance-summary?start=&end=` | Laporan kehadiran |
| GET | `/api/reports/dpjp-compliance?start=&end=` | Laporan compliance DPJP |
| GET | `/api/reports/access-summary?date=` | Summary akses ruangan |

## Data Architecture

### Database: Cloudflare D1 (SQLite)
- **departments** - Unit kerja/departemen RS
- **employees** - Data pegawai (DPJP, PPDS, perawat, staff)
- **devices** - Perangkat biometrik (face recognition, fingerprint, combo)
- **attendance** - Record kehadiran/absensi
- **dpjp_schedules** - Jadwal DPJP (visite, operasi, poliklinik, dll)
- **ppds_rotations** - Rotasi PPDS
- **access_logs** - Log akses ruangan terbatas

### Arsitektur Sistem
```
[Device Biometrik] → [Bio-Server/Middleware] → [SIMRS API + D1 DB] → [Dashboard]
       ↓                      ↓                       ↓
  Face/Finger            Verifikasi              Pencatatan
  Scan                   Identitas &             Real-time &
                         Hak Akses               Laporan
```

## Cara Penggunaan

1. **Dashboard**: Buka halaman utama untuk melihat ringkasan kehadiran real-time
2. **Monitoring DPJP**: Klik menu "Monitoring DPJP" untuk melihat jadwal dan kehadiran dokter
3. **Monitoring PPDS**: Klik menu "Monitoring PPDS" untuk tracking PPDS yang sedang rotasi
4. **Kehadiran**: Lihat semua data absensi biometrik dengan berbagai filter
5. **Akses Ruangan**: Audit siapa saja yang akses ruangan ICU, OK, Farmasi
6. **Laporan**: Lihat trend dan analitik kehadiran serta compliance

## Fitur Integrasi Biometrik (API untuk Device)

Device biometrik mengirim data ke endpoint `POST /api/attendance`:
```json
{
  "biometric_id": "BIO-001",
  "device_code": "FR-LOBBY-01",
  "method": "face",
  "confidence_score": 98.5,
  "scan_type": "clock_in"
}
```

## Development

```bash
# Install dependencies
npm install

# Setup database
npm run db:migrate:local
npm run db:seed

# Build & run
npm run build
npm run dev:sandbox

# Reset database
npm run db:reset
```

## Deployment
- **Platform**: Cloudflare Pages
- **Database**: Cloudflare D1
- **Status**: Development / Ready for deployment
- **Last Updated**: 2026-02-24

## Rencana Pengembangan Selanjutnya
- [ ] Integrasi real dengan hardware Face Recognition (Hikvision/ZKTeco)
- [ ] Push notification untuk DPJP yang belum clock-in
- [ ] Export laporan ke PDF/Excel
- [ ] Integrasi SIMRS live (jadwal operasi, visite, poliklinik)
- [ ] Role-based access control (admin, manajemen, kepala unit)
- [ ] Foto capture saat scan biometrik
- [ ] Multi-shift management yang lebih detail
- [ ] Integrasi dengan sistem penggajian
