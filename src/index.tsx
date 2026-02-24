import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// =====================================================
// API ROUTES - Dashboard Statistics
// =====================================================
app.get('/api/dashboard/stats', async (c) => {
  const db = c.env.DB
  const today = new Date().toISOString().split('T')[0]

  const [totalEmployees, totalDPJP, totalPPDS, todayAttendance, activeDevices, schedulesToday, accessDenied, completedSchedules] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM employees WHERE is_active = 1').first(),
    db.prepare("SELECT COUNT(*) as count FROM employees WHERE role = 'dpjp' AND is_active = 1").first(),
    db.prepare("SELECT COUNT(*) as count FROM employees WHERE role = 'ppds' AND is_active = 1").first(),
    db.prepare("SELECT COUNT(DISTINCT employee_id) as count FROM attendance WHERE DATE(scan_time) = ? AND scan_type IN ('clock_in')").bind(today).first(),
    db.prepare("SELECT COUNT(*) as count FROM devices WHERE status = 'active'").first(),
    db.prepare('SELECT COUNT(*) as count FROM dpjp_schedules WHERE schedule_date = ?').bind(today).first(),
    db.prepare("SELECT COUNT(*) as count FROM access_logs WHERE DATE(access_time) = ? AND access_type = 'denied'").bind(today).first(),
    db.prepare("SELECT COUNT(*) as count FROM dpjp_schedules WHERE schedule_date = ? AND status = 'completed'").bind(today).first(),
  ])

  return c.json({
    totalEmployees: (totalEmployees as any)?.count || 0,
    totalDPJP: (totalDPJP as any)?.count || 0,
    totalPPDS: (totalPPDS as any)?.count || 0,
    todayAttendance: (todayAttendance as any)?.count || 0,
    activeDevices: (activeDevices as any)?.count || 0,
    schedulesToday: (schedulesToday as any)?.count || 0,
    accessDenied: (accessDenied as any)?.count || 0,
    completedSchedules: (completedSchedules as any)?.count || 0,
  })
})

// =====================================================
// API ROUTES - Live Attendance Feed
// =====================================================
app.get('/api/dashboard/live-feed', async (c) => {
  const db = c.env.DB
  const limit = parseInt(c.req.query('limit') || '20')

  const result = await db.prepare(`
    SELECT a.*, e.name as employee_name, e.role, e.specialization, d.name as device_name, d.location
    FROM attendance a
    LEFT JOIN employees e ON a.employee_id = e.id
    LEFT JOIN devices d ON a.device_id = d.id
    ORDER BY a.scan_time DESC
    LIMIT ?
  `).bind(limit).all()

  return c.json(result.results)
})

// =====================================================
// API ROUTES - Employees
// =====================================================
app.get('/api/employees', async (c) => {
  const db = c.env.DB
  const role = c.req.query('role')
  const search = c.req.query('search')
  const dept = c.req.query('department_id')

  let query = `
    SELECT e.*, dep.name as department_name, dep.code as department_code
    FROM employees e
    LEFT JOIN departments dep ON e.department_id = dep.id
    WHERE e.is_active = 1
  `
  const params: any[] = []

  if (role) {
    query += ' AND e.role = ?'
    params.push(role)
  }
  if (search) {
    query += ' AND (e.name LIKE ? OR e.nip LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }
  if (dept) {
    query += ' AND e.department_id = ?'
    params.push(parseInt(dept))
  }

  query += ' ORDER BY e.role, e.name'

  const stmt = db.prepare(query)
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all()

  return c.json(result.results)
})

app.get('/api/employees/:id', async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const today = new Date().toISOString().split('T')[0]

  const [employee, todayAttendance, schedules, recentAccess] = await Promise.all([
    db.prepare(`
      SELECT e.*, dep.name as department_name
      FROM employees e LEFT JOIN departments dep ON e.department_id = dep.id
      WHERE e.id = ?
    `).bind(id).first(),
    db.prepare(`
      SELECT * FROM attendance WHERE employee_id = ? AND DATE(scan_time) = ? ORDER BY scan_time
    `).bind(id, today).all(),
    db.prepare(`
      SELECT s.*, dep.name as department_name
      FROM dpjp_schedules s LEFT JOIN departments dep ON s.department_id = dep.id
      WHERE s.employee_id = ? AND s.schedule_date = ?
      ORDER BY s.start_time
    `).bind(id, today).all(),
    db.prepare(`
      SELECT al.*, d.name as device_name
      FROM access_logs al LEFT JOIN devices d ON al.device_id = d.id
      WHERE al.employee_id = ? ORDER BY al.access_time DESC LIMIT 10
    `).bind(id).all()
  ])

  if (!employee) return c.json({ error: 'Employee not found' }, 404)

  return c.json({
    ...employee,
    todayAttendance: todayAttendance.results,
    schedules: schedules.results,
    recentAccess: recentAccess.results
  })
})

// =====================================================
// API ROUTES - Attendance
// =====================================================
app.get('/api/attendance', async (c) => {
  const db = c.env.DB
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]
  const role = c.req.query('role')
  const type = c.req.query('type')

  let query = `
    SELECT a.*, e.name as employee_name, e.nip, e.role, e.specialization,
           d.name as device_name, d.location as device_location,
           dep.name as department_name
    FROM attendance a
    LEFT JOIN employees e ON a.employee_id = e.id
    LEFT JOIN devices d ON a.device_id = d.id
    LEFT JOIN departments dep ON e.department_id = dep.id
    WHERE DATE(a.scan_time) = ?
  `
  const params: any[] = [date]

  if (role) {
    query += ' AND e.role = ?'
    params.push(role)
  }
  if (type) {
    query += ' AND a.scan_type = ?'
    params.push(type)
  }

  query += ' ORDER BY a.scan_time DESC'

  const result = await db.prepare(query).bind(...params).all()
  return c.json(result.results)
})

// Record attendance (from biometric device)
app.post('/api/attendance', async (c) => {
  const db = c.env.DB
  const body = await c.req.json()
  const { biometric_id, device_code, method, confidence_score, scan_type } = body

  // Find employee by biometric_id
  const employee = await db.prepare('SELECT id FROM employees WHERE biometric_id = ?').bind(biometric_id).first()
  if (!employee) return c.json({ error: 'Employee not found' }, 404)

  const device = await db.prepare('SELECT id, location FROM devices WHERE device_code = ?').bind(device_code).first()

  const result = await db.prepare(`
    INSERT INTO attendance (employee_id, device_id, scan_time, scan_type, method, confidence_score, location, status)
    VALUES (?, ?, datetime('now'), ?, ?, ?, ?, 'verified')
  `).bind(
    (employee as any).id,
    device ? (device as any).id : null,
    scan_type || 'clock_in',
    method || 'face',
    confidence_score || 0,
    device ? (device as any).location : 'Unknown'
  ).run()

  return c.json({ success: true, id: result.meta.last_row_id })
})

// =====================================================
// API ROUTES - DPJP Monitoring
// =====================================================
app.get('/api/dpjp/monitoring', async (c) => {
  const db = c.env.DB
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]

  // Get all DPJP schedules with their attendance status
  const schedules = await db.prepare(`
    SELECT s.*, e.name as doctor_name, e.nip, e.specialization, e.photo_url,
           dep.name as department_name,
           (SELECT MIN(a.scan_time) FROM attendance a WHERE a.employee_id = s.employee_id AND DATE(a.scan_time) = s.schedule_date AND a.scan_type = 'clock_in') as actual_clock_in,
           (SELECT MAX(a.scan_time) FROM attendance a WHERE a.employee_id = s.employee_id AND DATE(a.scan_time) = s.schedule_date AND a.scan_type = 'clock_out') as actual_clock_out
    FROM dpjp_schedules s
    LEFT JOIN employees e ON s.employee_id = e.id
    LEFT JOIN departments dep ON s.department_id = dep.id
    WHERE s.schedule_date = ?
    ORDER BY s.start_time
  `).bind(date).all()

  // Calculate compliance
  const totalSchedules = schedules.results.length
  const completed = schedules.results.filter((s: any) => s.status === 'completed').length
  const missed = schedules.results.filter((s: any) => s.status === 'missed').length

  return c.json({
    schedules: schedules.results,
    summary: {
      total: totalSchedules,
      completed,
      missed,
      scheduled: totalSchedules - completed - missed,
      complianceRate: totalSchedules > 0 ? Math.round((completed / totalSchedules) * 100) : 0
    }
  })
})

// =====================================================
// API ROUTES - PPDS Monitoring
// =====================================================
app.get('/api/ppds/monitoring', async (c) => {
  const db = c.env.DB
  const today = new Date().toISOString().split('T')[0]

  const result = await db.prepare(`
    SELECT e.id, e.nip, e.name, e.specialization,
           r.stage, r.start_date, r.end_date,
           dep.name as rotation_department,
           sup.name as supervisor_name,
           (SELECT MIN(a.scan_time) FROM attendance a WHERE a.employee_id = e.id AND DATE(a.scan_time) = ? AND a.scan_type = 'clock_in') as today_clock_in,
           (SELECT MAX(a.scan_time) FROM attendance a WHERE a.employee_id = e.id AND DATE(a.scan_time) = ? AND a.scan_type = 'clock_out') as today_clock_out,
           (SELECT COUNT(*) FROM attendance a WHERE a.employee_id = e.id AND DATE(a.scan_time) >= date(?, '-30 days') AND a.scan_type = 'clock_in') as monthly_attendance_count
    FROM employees e
    LEFT JOIN ppds_rotations r ON e.id = r.employee_id AND r.status = 'active'
    LEFT JOIN departments dep ON r.department_id = dep.id
    LEFT JOIN employees sup ON r.supervisor_id = sup.id
    WHERE e.role = 'ppds' AND e.is_active = 1
    ORDER BY e.name
  `).bind(today, today, today).all()

  return c.json(result.results)
})

// =====================================================
// API ROUTES - Access Logs
// =====================================================
app.get('/api/access-logs', async (c) => {
  const db = c.env.DB
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]
  const type = c.req.query('type') // 'granted' or 'denied'
  const room = c.req.query('room')

  let query = `
    SELECT al.*, e.name as employee_name, e.role, e.nip,
           d.name as device_name, d.location_type
    FROM access_logs al
    LEFT JOIN employees e ON al.employee_id = e.id
    LEFT JOIN devices d ON al.device_id = d.id
    WHERE DATE(al.access_time) = ?
  `
  const params: any[] = [date]

  if (type) {
    query += ' AND al.access_type = ?'
    params.push(type)
  }
  if (room) {
    query += ' AND al.room_name LIKE ?'
    params.push(`%${room}%`)
  }

  query += ' ORDER BY al.access_time DESC'

  const result = await db.prepare(query).bind(...params).all()
  return c.json(result.results)
})

// =====================================================
// API ROUTES - Devices
// =====================================================
app.get('/api/devices', async (c) => {
  const db = c.env.DB
  const result = await db.prepare('SELECT * FROM devices ORDER BY status, name').all()
  return c.json(result.results)
})

// =====================================================
// API ROUTES - Departments
// =====================================================
app.get('/api/departments', async (c) => {
  const db = c.env.DB
  const result = await db.prepare(`
    SELECT d.*, (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id AND e.is_active = 1) as employee_count
    FROM departments d WHERE d.is_active = 1 ORDER BY d.name
  `).all()
  return c.json(result.results)
})

// =====================================================
// API ROUTES - Reports
// =====================================================
app.get('/api/reports/attendance-summary', async (c) => {
  const db = c.env.DB
  const startDate = c.req.query('start') || new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
  const endDate = c.req.query('end') || new Date().toISOString().split('T')[0]

  const result = await db.prepare(`
    SELECT DATE(a.scan_time) as date,
           COUNT(DISTINCT CASE WHEN e.role = 'dpjp' THEN a.employee_id END) as dpjp_present,
           COUNT(DISTINCT CASE WHEN e.role = 'ppds' THEN a.employee_id END) as ppds_present,
           COUNT(DISTINCT CASE WHEN e.role = 'perawat' THEN a.employee_id END) as nurse_present,
           COUNT(DISTINCT CASE WHEN e.role IN ('staff', 'admin') THEN a.employee_id END) as staff_present,
           COUNT(DISTINCT a.employee_id) as total_present
    FROM attendance a
    LEFT JOIN employees e ON a.employee_id = e.id
    WHERE DATE(a.scan_time) BETWEEN ? AND ? AND a.scan_type = 'clock_in'
    GROUP BY DATE(a.scan_time)
    ORDER BY DATE(a.scan_time)
  `).bind(startDate, endDate).all()

  return c.json(result.results)
})

app.get('/api/reports/dpjp-compliance', async (c) => {
  const db = c.env.DB
  const startDate = c.req.query('start') || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  const endDate = c.req.query('end') || new Date().toISOString().split('T')[0]

  const result = await db.prepare(`
    SELECT e.id, e.name, e.specialization,
           COUNT(*) as total_schedules,
           SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) as completed,
           SUM(CASE WHEN s.status = 'missed' THEN 1 ELSE 0 END) as missed,
           SUM(CASE WHEN s.status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
           ROUND(CAST(SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) AS REAL) / COUNT(*) * 100, 1) as compliance_rate
    FROM dpjp_schedules s
    LEFT JOIN employees e ON s.employee_id = e.id
    WHERE s.schedule_date BETWEEN ? AND ?
    GROUP BY e.id
    ORDER BY compliance_rate DESC
  `).bind(startDate, endDate).all()

  return c.json(result.results)
})

app.get('/api/reports/access-summary', async (c) => {
  const db = c.env.DB
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]

  const result = await db.prepare(`
    SELECT al.room_name,
           COUNT(*) as total_access,
           SUM(CASE WHEN al.access_type = 'granted' THEN 1 ELSE 0 END) as granted,
           SUM(CASE WHEN al.access_type = 'denied' THEN 1 ELSE 0 END) as denied
    FROM access_logs al
    WHERE DATE(al.access_time) = ?
    GROUP BY al.room_name
    ORDER BY total_access DESC
  `).bind(date).all()

  return c.json(result.results)
})

// =====================================================
// FRONTEND - Main HTML
// =====================================================
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIMRS Monitoring Biometrik - RSSA</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js"></script>
  <script>dayjs.extend(dayjs_plugin_relativeTime)</script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            rssa: { 50:'#eff6ff', 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd', 400:'#60a5fa', 500:'#1e5fa8', 600:'#1a5192', 700:'#15437c', 800:'#103566', 900:'#0b2750' },
            accent: { 50:'#f0fdf4', 100:'#dcfce7', 200:'#bbf7d0', 300:'#86efac', 400:'#4ade80', 500:'#22c55e', 600:'#16a34a' }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { font-family: 'Inter', sans-serif; }
    .sidebar-link { transition: all 0.2s; border-left: 3px solid transparent; }
    .sidebar-link:hover, .sidebar-link.active { background: rgba(255,255,255,0.1); border-left-color: #60a5fa; }
    .card { transition: all 0.3s; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
    .pulse-dot { animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
    .fade-in { animation: fadeIn 0.3s ease-in; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 9999px; font-weight: 600; text-transform: uppercase; }
    .table-row:hover { background: #f8fafc; }
    .status-online { color:#22c55e; }
    .status-offline { color:#ef4444; }
    .modal-overlay { background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside id="sidebar" class="w-64 bg-gradient-to-b from-rssa-800 to-rssa-900 text-white flex flex-col shadow-xl z-30 flex-shrink-0">
      <div class="p-5 border-b border-rssa-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <i class="fas fa-hospital text-xl text-blue-300"></i>
          </div>
          <div>
            <h1 class="font-bold text-sm leading-tight">SIMRS Biometrik</h1>
            <p class="text-[10px] text-blue-300 font-medium">RS Saiful Anwar Malang</p>
          </div>
        </div>
      </div>
      <nav class="flex-1 py-4 overflow-y-auto">
        <div class="px-4 mb-2 text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Menu Utama</div>
        <a href="#" onclick="showPage('dashboard')" class="sidebar-link active flex items-center gap-3 px-5 py-2.5 text-sm" data-page="dashboard">
          <i class="fas fa-chart-pie w-5 text-center"></i> Dashboard
        </a>
        <a href="#" onclick="showPage('dpjp')" class="sidebar-link flex items-center gap-3 px-5 py-2.5 text-sm" data-page="dpjp">
          <i class="fas fa-user-md w-5 text-center"></i> Monitoring DPJP
        </a>
        <a href="#" onclick="showPage('ppds')" class="sidebar-link flex items-center gap-3 px-5 py-2.5 text-sm" data-page="ppds">
          <i class="fas fa-graduation-cap w-5 text-center"></i> Monitoring PPDS
        </a>
        <a href="#" onclick="showPage('attendance')" class="sidebar-link flex items-center gap-3 px-5 py-2.5 text-sm" data-page="attendance">
          <i class="fas fa-fingerprint w-5 text-center"></i> Kehadiran
        </a>
        <div class="px-4 mt-5 mb-2 text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Manajemen</div>
        <a href="#" onclick="showPage('employees')" class="sidebar-link flex items-center gap-3 px-5 py-2.5 text-sm" data-page="employees">
          <i class="fas fa-users w-5 text-center"></i> Data Pegawai
        </a>
        <a href="#" onclick="showPage('access')" class="sidebar-link flex items-center gap-3 px-5 py-2.5 text-sm" data-page="access">
          <i class="fas fa-door-open w-5 text-center"></i> Akses Ruangan
        </a>
        <a href="#" onclick="showPage('devices')" class="sidebar-link flex items-center gap-3 px-5 py-2.5 text-sm" data-page="devices">
          <i class="fas fa-tablet-alt w-5 text-center"></i> Perangkat
        </a>
        <div class="px-4 mt-5 mb-2 text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Laporan</div>
        <a href="#" onclick="showPage('reports')" class="sidebar-link flex items-center gap-3 px-5 py-2.5 text-sm" data-page="reports">
          <i class="fas fa-file-alt w-5 text-center"></i> Laporan & Analitik
        </a>
      </nav>
      <div class="p-4 border-t border-rssa-700 text-xs text-blue-300">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div>
          <span>Sistem Online</span>
        </div>
        <div class="mt-1 text-[10px] opacity-75">DIKST UB x RSSA &copy; 2026</div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Top Bar -->
      <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div class="flex items-center gap-4">
          <button onclick="toggleSidebar()" class="lg:hidden text-gray-500 hover:text-gray-700">
            <i class="fas fa-bars text-lg"></i>
          </button>
          <div>
            <h2 id="pageTitle" class="text-lg font-bold text-gray-800">Dashboard</h2>
            <p id="pageSubtitle" class="text-xs text-gray-500">Monitoring real-time kehadiran dan kinerja</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div id="currentTime" class="text-sm font-semibold text-gray-800"></div>
            <div id="currentDate" class="text-xs text-gray-500"></div>
          </div>
          <div class="w-9 h-9 bg-rssa-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <div id="content" class="p-6"></div>
    </main>
  </div>

  <!-- Employee Detail Modal -->
  <div id="modal" class="hidden fixed inset-0 z-50 flex items-center justify-center modal-overlay">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
      <div id="modalContent"></div>
    </div>
  </div>

  <script src="/static/app.js"></script>
</body>
</html>`)
})

export default app
