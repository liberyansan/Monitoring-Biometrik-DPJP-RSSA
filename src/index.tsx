import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()
app.use('/api/*', cors())

// =====================================================
// HELPER: Category labels & priorities
// =====================================================
const CATEGORY_LABELS: Record<string, string> = {
  tenaga_medis: 'Tenaga Medis',
  tenaga_pendidikan: 'Tenaga Pendidikan',
  tenaga_keperawatan: 'Tenaga Keperawatan',
  tenaga_kefarmasian: 'Tenaga Kefarmasian',
  tenaga_penunjang_medis: 'Tenaga Penunjang Medis',
  manajemen_administrasi: 'Manajemen & Administrasi',
  tenaga_penunjang_non_medis: 'Tenaga Penunjang Non-Medis',
}

// =====================================================
// API: Dashboard
// =====================================================
app.get('/api/dashboard/stats', async (c) => {
  const db = c.env.DB
  const today = new Date().toISOString().split('T')[0]
  const [total, byCategory, byPriority, todayAtt, activeDevices, schedToday, accessDenied, compSched, totalDPJP, totalPPDS, shiftCount] = await Promise.all([
    db.prepare('SELECT COUNT(*) as c FROM employees WHERE is_active=1').first(),
    db.prepare(`SELECT category, COUNT(*) as c FROM employees WHERE is_active=1 GROUP BY category`).all(),
    db.prepare(`SELECT priority_level, COUNT(*) as c FROM employees WHERE is_active=1 GROUP BY priority_level ORDER BY priority_level`).all(),
    db.prepare(`SELECT COUNT(DISTINCT employee_id) as c FROM attendance WHERE DATE(scan_time)=? AND scan_type='clock_in'`).bind(today).first(),
    db.prepare(`SELECT COUNT(*) as c FROM devices WHERE status='active'`).first(),
    db.prepare(`SELECT COUNT(*) as c FROM dpjp_schedules WHERE schedule_date=?`).bind(today).first(),
    db.prepare(`SELECT COUNT(*) as c FROM access_logs WHERE DATE(access_time)=? AND access_type='denied'`).bind(today).first(),
    db.prepare(`SELECT COUNT(*) as c FROM dpjp_schedules WHERE schedule_date=? AND status='completed'`).bind(today).first(),
    db.prepare(`SELECT COUNT(*) as c FROM employees WHERE is_active=1 AND role='dpjp'`).first(),
    db.prepare(`SELECT COUNT(*) as c FROM employees WHERE is_active=1 AND category='tenaga_pendidikan'`).first(),
    db.prepare(`SELECT COUNT(*) as c FROM shift_schedules WHERE schedule_date=?`).bind(today).first(),
  ])
  const catMap: Record<string, number> = {}
  for (const r of (byCategory.results as any[])) catMap[r.category] = r.c
  const priMap: Record<number, number> = {}
  for (const r of (byPriority.results as any[])) priMap[r.priority_level] = r.c

  return c.json({
    totalEmployees: (total as any)?.c || 0,
    todayAttendance: (todayAtt as any)?.c || 0,
    activeDevices: (activeDevices as any)?.c || 0,
    schedulesToday: (schedToday as any)?.c || 0,
    accessDenied: (accessDenied as any)?.c || 0,
    completedSchedules: (compSched as any)?.c || 0,
    totalDPJP: (totalDPJP as any)?.c || 0,
    totalPPDS: (totalPPDS as any)?.c || 0,
    shiftCount: (shiftCount as any)?.c || 0,
    categories: catMap,
    priorities: priMap,
  })
})

app.get('/api/dashboard/live-feed', async (c) => {
  const db = c.env.DB
  const limit = parseInt(c.req.query('limit') || '25')
  const r = await db.prepare(`
    SELECT a.*, e.name as employee_name, e.role, e.category, e.sub_role, e.specialization,
           d.name as device_name, d.location, dep.name as department_name
    FROM attendance a LEFT JOIN employees e ON a.employee_id=e.id LEFT JOIN devices d ON a.device_id=d.id
    LEFT JOIN departments dep ON e.department_id=dep.id
    ORDER BY a.scan_time DESC LIMIT ?
  `).bind(limit).all()
  return c.json(r.results)
})

// Attendance per category for today
app.get('/api/dashboard/category-attendance', async (c) => {
  const db = c.env.DB
  const today = new Date().toISOString().split('T')[0]
  const r = await db.prepare(`
    SELECT e.category,
      COUNT(DISTINCT e.id) as total_employees,
      COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END) as present
    FROM employees e
    LEFT JOIN attendance a ON e.id=a.employee_id AND DATE(a.scan_time)=? AND a.scan_type='clock_in'
    WHERE e.is_active=1
    GROUP BY e.category
    ORDER BY e.category
  `).bind(today).all()
  return c.json(r.results)
})

// =====================================================
// API: SDM Summary - Overview per category with sub-roles
// =====================================================
app.get('/api/sdm/summary', async (c) => {
  const db = c.env.DB
  const today = new Date().toISOString().split('T')[0]
  const [bySubRole, attByCategory, biometricStats] = await Promise.all([
    db.prepare(`
      SELECT category, sub_role, employment_type, priority_level, COUNT(*) as c
      FROM employees WHERE is_active=1
      GROUP BY category, sub_role, employment_type, priority_level
      ORDER BY priority_level, category, sub_role
    `).all(),
    db.prepare(`
      SELECT e.category, e.sub_role,
        COUNT(DISTINCT e.id) as total,
        COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END) as present
      FROM employees e
      LEFT JOIN attendance a ON e.id=a.employee_id AND DATE(a.scan_time)=? AND a.scan_type='clock_in'
      WHERE e.is_active=1
      GROUP BY e.category, e.sub_role
    `).bind(today).all(),
    db.prepare(`
      SELECT category,
        SUM(CASE WHEN face_registered=1 THEN 1 ELSE 0 END) as face_registered,
        SUM(CASE WHEN finger_registered=1 THEN 1 ELSE 0 END) as finger_registered,
        SUM(CASE WHEN face_registered=1 AND finger_registered=1 THEN 1 ELSE 0 END) as both_registered,
        COUNT(*) as total
      FROM employees WHERE is_active=1 GROUP BY category
    `).all()
  ])
  return c.json({ bySubRole: bySubRole.results, attendance: attByCategory.results, biometricStats: biometricStats.results })
})

// =====================================================
// API: Staffing Monitor (Area Kritis)
// =====================================================
app.get('/api/staffing/monitor', async (c) => {
  const db = c.env.DB
  const today = new Date().toISOString().split('T')[0]
  const hour = new Date().getUTCHours()
  let currentShift = 'pagi'
  if (hour >= 14 && hour < 21) currentShift = 'siang'
  else if (hour >= 21 || hour < 7) currentShift = 'malam'

  const reqs = await db.prepare(`
    SELECT sr.*, dep.name as department_name, dep.code as department_code, dep.is_critical
    FROM staffing_requirements sr
    LEFT JOIN departments dep ON sr.department_id=dep.id
    WHERE sr.is_active=1 AND sr.shift_type=?
    ORDER BY dep.is_critical DESC, dep.name
  `).bind(currentShift).all()

  const actual = await db.prepare(`
    SELECT ss.department_id, e.category, COUNT(DISTINCT e.id) as present_count
    FROM shift_schedules ss
    LEFT JOIN employees e ON ss.employee_id=e.id
    LEFT JOIN attendance a ON e.id=a.employee_id AND DATE(a.scan_time)=? AND a.scan_type='clock_in'
    WHERE ss.schedule_date=? AND ss.shift_type=? AND a.id IS NOT NULL
    GROUP BY ss.department_id, e.category
  `).bind(today, today, currentShift).all()

  const actualMap: Record<string, number> = {}
  for (const a of (actual.results as any[])) {
    actualMap[`${a.department_id}_${a.category}`] = a.present_count
  }

  const results = (reqs.results as any[]).map(r => ({
    ...r,
    actual_count: actualMap[`${r.department_id}_${r.category}`] || 0,
    is_understaffed: (actualMap[`${r.department_id}_${r.category}`] || 0) < r.min_count,
    current_shift: currentShift,
  }))

  return c.json(results)
})

// =====================================================
// API: Shift Schedules
// =====================================================
app.get('/api/shifts', async (c) => {
  const db = c.env.DB
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]
  const dept = c.req.query('department_id')
  const shift = c.req.query('shift')
  const category = c.req.query('category')

  let q = `
    SELECT ss.*, e.name as employee_name, e.role, e.category, e.sub_role,
           dep.name as department_name, dep.code as department_code, dep.is_critical,
           (SELECT MIN(a.scan_time) FROM attendance a WHERE a.employee_id=ss.employee_id AND DATE(a.scan_time)=ss.schedule_date AND a.scan_type='clock_in') as actual_clock_in
    FROM shift_schedules ss
    LEFT JOIN employees e ON ss.employee_id=e.id
    LEFT JOIN departments dep ON ss.department_id=dep.id
    WHERE ss.schedule_date=?
  `
  const params: any[] = [date]
  if (dept) { q += ' AND ss.department_id=?'; params.push(parseInt(dept)) }
  if (shift) { q += ' AND ss.shift_type=?'; params.push(shift) }
  if (category) { q += ' AND e.category=?'; params.push(category) }
  q += ' ORDER BY dep.is_critical DESC, dep.name, ss.start_time'

  const r = await db.prepare(q).bind(...params).all()
  return c.json(r.results)
})

// =====================================================
// API: Employees (expanded with category)
// =====================================================
app.get('/api/employees', async (c) => {
  const db = c.env.DB
  const { role, category, search, department_id, priority, sub_role, employment_type } = c.req.query() as any
  let q = `SELECT e.*, dep.name as department_name, dep.code as department_code
           FROM employees e LEFT JOIN departments dep ON e.department_id=dep.id WHERE e.is_active=1`
  const p: any[] = []
  if (category) { q += ' AND e.category=?'; p.push(category) }
  if (role) { q += ' AND e.role=?'; p.push(role) }
  if (sub_role) { q += ' AND e.sub_role=?'; p.push(sub_role) }
  if (employment_type) { q += ' AND e.employment_type=?'; p.push(employment_type) }
  if (search) { q += ' AND (e.name LIKE ? OR e.nip LIKE ?)'; p.push(`%${search}%`, `%${search}%`) }
  if (department_id) { q += ' AND e.department_id=?'; p.push(parseInt(department_id)) }
  if (priority) { q += ' AND e.priority_level=?'; p.push(parseInt(priority)) }
  q += ' ORDER BY e.priority_level, e.category, e.name'
  const r = p.length > 0 ? await db.prepare(q).bind(...p).all() : await db.prepare(q).all()
  return c.json(r.results)
})

app.get('/api/employees/:id', async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const today = new Date().toISOString().split('T')[0]
  const [emp, att, sched, shifts, access, rotation] = await Promise.all([
    db.prepare(`SELECT e.*, dep.name as department_name, dep.code as department_code
      FROM employees e LEFT JOIN departments dep ON e.department_id=dep.id WHERE e.id=?`).bind(id).first(),
    db.prepare(`SELECT * FROM attendance WHERE employee_id=? AND DATE(scan_time)=? ORDER BY scan_time`).bind(id, today).all(),
    db.prepare(`SELECT s.*, dep.name as department_name FROM dpjp_schedules s LEFT JOIN departments dep ON s.department_id=dep.id
      WHERE s.employee_id=? AND s.schedule_date=? ORDER BY s.start_time`).bind(id, today).all(),
    db.prepare(`SELECT ss.*, dep.name as department_name FROM shift_schedules ss LEFT JOIN departments dep ON ss.department_id=dep.id
      WHERE ss.employee_id=? AND ss.schedule_date=? ORDER BY ss.start_time`).bind(id, today).all(),
    db.prepare(`SELECT al.*, d.name as device_name FROM access_logs al LEFT JOIN devices d ON al.device_id=d.id
      WHERE al.employee_id=? ORDER BY al.access_time DESC LIMIT 10`).bind(id).all(),
    db.prepare(`SELECT r.*, dep.name as department_name, sup.name as supervisor_name
      FROM ppds_rotations r LEFT JOIN departments dep ON r.department_id=dep.id LEFT JOIN employees sup ON r.supervisor_id=sup.id
      WHERE r.employee_id=? ORDER BY r.status='active' DESC, r.start_date DESC`).bind(id).all(),
  ])
  if (!emp) return c.json({ error: 'Not found' }, 404)

  // Attendance statistics for the last 30 days
  const attStats = await db.prepare(`
    SELECT COUNT(DISTINCT DATE(scan_time)) as attendance_days
    FROM attendance WHERE employee_id=? AND DATE(scan_time)>=date(?,'-30 days') AND scan_type='clock_in'
  `).bind(id, today).first()

  // DPJP schedule compliance for the last 30 days (if applicable)
  let dpjpCompliance: any = null
  if ((emp as any).role === 'dpjp') {
    dpjpCompliance = await db.prepare(`
      SELECT COUNT(*) as total, 
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status='missed' THEN 1 ELSE 0 END) as missed
      FROM dpjp_schedules WHERE employee_id=? AND schedule_date>=date(?,'-30 days')
    `).bind(id, today).first()
  }

  // For DPJP: get supervised PPDS
  let supervisedPPDS: any = null
  if ((emp as any).role === 'dpjp') {
    supervisedPPDS = await db.prepare(`
      SELECT r.*, e.name as ppds_name, e.role, e.specialization, dep.name as rotation_dept
      FROM ppds_rotations r 
      LEFT JOIN employees e ON r.employee_id=e.id 
      LEFT JOIN departments dep ON r.department_id=dep.id
      WHERE r.supervisor_id=? AND r.status='active'
    `).bind(id).all()
  }

  return c.json({
    ...(emp as any),
    todayAttendance: att.results,
    schedules: sched.results,
    shifts: shifts.results,
    recentAccess: access.results,
    rotations: rotation.results,
    attendanceDays30: (attStats as any)?.attendance_days || 0,
    dpjpCompliance: dpjpCompliance,
    supervisedPPDS: supervisedPPDS?.results || null,
  })
})

// =====================================================
// API: Attendance
// =====================================================
app.get('/api/attendance', async (c) => {
  const db = c.env.DB
  const { date: d, role, category, type } = c.req.query() as any
  const date = d || new Date().toISOString().split('T')[0]
  let q = `SELECT a.*, e.name as employee_name, e.nip, e.role, e.category, e.sub_role, e.specialization,
           d.name as device_name, d.location as device_location, dep.name as department_name
           FROM attendance a LEFT JOIN employees e ON a.employee_id=e.id
           LEFT JOIN devices d ON a.device_id=d.id LEFT JOIN departments dep ON e.department_id=dep.id
           WHERE DATE(a.scan_time)=?`
  const p: any[] = [date]
  if (role) { q += ' AND e.role=?'; p.push(role) }
  if (category) { q += ' AND e.category=?'; p.push(category) }
  if (type) { q += ' AND a.scan_type=?'; p.push(type) }
  q += ' ORDER BY a.scan_time DESC'
  const r = await db.prepare(q).bind(...p).all()
  return c.json(r.results)
})

app.post('/api/attendance', async (c) => {
  const db = c.env.DB
  const { biometric_id, device_code, method, confidence_score, scan_type } = await c.req.json()
  const emp = await db.prepare('SELECT id FROM employees WHERE biometric_id=?').bind(biometric_id).first()
  if (!emp) return c.json({ error: 'Employee not found' }, 404)
  const dev = await db.prepare('SELECT id,location FROM devices WHERE device_code=?').bind(device_code).first()
  const r = await db.prepare(`INSERT INTO attendance (employee_id,device_id,scan_time,scan_type,method,confidence_score,location,status)
    VALUES (?,?,datetime('now'),?,?,?,?,'verified')`).bind((emp as any).id, dev ? (dev as any).id : null, scan_type || 'clock_in', method || 'face', confidence_score || 0, dev ? (dev as any).location : 'Unknown').run()
  return c.json({ success: true, id: r.meta.last_row_id })
})

// =====================================================
// API: DPJP Monitoring (with dual-role tracking)
// =====================================================
app.get('/api/dpjp/monitoring', async (c) => {
  const db = c.env.DB
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]
  const schedules = await db.prepare(`
    SELECT s.*, e.name as doctor_name, e.nip, e.specialization, e.sub_role,
           dep.name as department_name,
           (SELECT MIN(a.scan_time) FROM attendance a WHERE a.employee_id=s.employee_id AND DATE(a.scan_time)=s.schedule_date AND a.scan_type='clock_in') as actual_clock_in,
           (SELECT MAX(a.scan_time) FROM attendance a WHERE a.employee_id=s.employee_id AND DATE(a.scan_time)=s.schedule_date AND a.scan_type='clock_out') as actual_clock_out
    FROM dpjp_schedules s LEFT JOIN employees e ON s.employee_id=e.id LEFT JOIN departments dep ON s.department_id=dep.id
    WHERE s.schedule_date=? ORDER BY s.start_time
  `).bind(date).all()
  const total = schedules.results.length
  const completed = schedules.results.filter((s: any) => s.status === 'completed').length
  const missed = schedules.results.filter((s: any) => s.status === 'missed').length
  return c.json({
    schedules: schedules.results,
    summary: { total, completed, missed, scheduled: total - completed - missed, complianceRate: total > 0 ? Math.round((completed / total) * 100) : 0 }
  })
})

// DPJP detail with dual role (klinis + pendidikan)
app.get('/api/dpjp/:id/profile', async (c) => {
  const db = c.env.DB
  const id = parseInt(c.req.param('id'))
  const today = new Date().toISOString().split('T')[0]

  const [dpjp, schedules30d, supervised, todaySchedule] = await Promise.all([
    db.prepare(`SELECT e.*, dep.name as department_name FROM employees e LEFT JOIN departments dep ON e.department_id=dep.id WHERE e.id=? AND e.role='dpjp'`).bind(id).first(),
    db.prepare(`
      SELECT schedule_date, COUNT(*) as total, 
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status='missed' THEN 1 ELSE 0 END) as missed
      FROM dpjp_schedules WHERE employee_id=? AND schedule_date>=date(?,'-30 days')
      GROUP BY schedule_date ORDER BY schedule_date
    `).bind(id, today).all(),
    db.prepare(`
      SELECT r.*, e.name as ppds_name, e.role as ppds_role, e.specialization as ppds_spec, dep.name as rotation_dept
      FROM ppds_rotations r LEFT JOIN employees e ON r.employee_id=e.id LEFT JOIN departments dep ON r.department_id=dep.id
      WHERE r.supervisor_id=? AND r.status='active' ORDER BY e.name
    `).bind(id).all(),
    db.prepare(`
      SELECT s.*, dep.name as department_name
      FROM dpjp_schedules s LEFT JOIN departments dep ON s.department_id=dep.id
      WHERE s.employee_id=? AND s.schedule_date=? ORDER BY s.start_time
    `).bind(id, today).all(),
  ])
  if (!dpjp) return c.json({ error: 'DPJP not found' }, 404)

  return c.json({
    dpjp: dpjp,
    scheduleHistory: schedules30d.results,
    supervisedPPDS: supervised.results,
    todaySchedule: todaySchedule.results,
  })
})

// =====================================================
// API: PPDS/Pendidikan Monitoring
// =====================================================
app.get('/api/pendidikan/monitoring', async (c) => {
  const db = c.env.DB
  const today = new Date().toISOString().split('T')[0]
  const r = await db.prepare(`
    SELECT e.id, e.nip, e.name, e.role, e.sub_role, e.specialization,
           r.stage, r.start_date, r.end_date, r.status as rotation_status,
           dep.name as rotation_department, sup.name as supervisor_name, sup.id as supervisor_id,
           (SELECT MIN(a.scan_time) FROM attendance a WHERE a.employee_id=e.id AND DATE(a.scan_time)=? AND a.scan_type='clock_in') as today_clock_in,
           (SELECT COUNT(DISTINCT DATE(a.scan_time)) FROM attendance a WHERE a.employee_id=e.id AND DATE(a.scan_time)>=date(?,'-30 days') AND a.scan_type='clock_in') as monthly_attendance_count
    FROM employees e
    LEFT JOIN ppds_rotations r ON e.id=r.employee_id AND r.status='active'
    LEFT JOIN departments dep ON r.department_id=dep.id
    LEFT JOIN employees sup ON r.supervisor_id=sup.id
    WHERE e.category='tenaga_pendidikan' AND e.is_active=1
    ORDER BY e.role, e.name
  `).bind(today, today).all()
  return c.json(r.results)
})

// =====================================================
// API: Access Logs, Devices, Departments
// =====================================================
app.get('/api/access-logs', async (c) => {
  const db = c.env.DB
  const { date: d, type, room } = c.req.query() as any
  const date = d || new Date().toISOString().split('T')[0]
  let q = `SELECT al.*, e.name as employee_name, e.role, e.category, e.nip, d.name as device_name, d.location_type
           FROM access_logs al LEFT JOIN employees e ON al.employee_id=e.id LEFT JOIN devices d ON al.device_id=d.id
           WHERE DATE(al.access_time)=?`
  const p: any[] = [date]
  if (type) { q += ' AND al.access_type=?'; p.push(type) }
  if (room) { q += ' AND al.room_name LIKE ?'; p.push(`%${room}%`) }
  q += ' ORDER BY al.access_time DESC'
  const r = await db.prepare(q).bind(...p).all()
  return c.json(r.results)
})

app.get('/api/devices', async (c) => {
  const r = await c.env.DB.prepare('SELECT * FROM devices ORDER BY status, name').all()
  return c.json(r.results)
})

app.get('/api/departments', async (c) => {
  const r = await c.env.DB.prepare(`SELECT d.*, (SELECT COUNT(*) FROM employees e WHERE e.department_id=d.id AND e.is_active=1) as employee_count
    FROM departments d WHERE d.is_active=1 ORDER BY d.is_critical DESC, d.name`).all()
  return c.json(r.results)
})

// =====================================================
// API: Reports
// =====================================================
app.get('/api/reports/attendance-summary', async (c) => {
  const db = c.env.DB
  const start = c.req.query('start') || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const end = c.req.query('end') || new Date().toISOString().split('T')[0]
  const r = await db.prepare(`
    SELECT DATE(a.scan_time) as date,
      COUNT(DISTINCT CASE WHEN e.category='tenaga_medis' THEN a.employee_id END) as medis,
      COUNT(DISTINCT CASE WHEN e.category='tenaga_pendidikan' THEN a.employee_id END) as pendidikan,
      COUNT(DISTINCT CASE WHEN e.category='tenaga_keperawatan' THEN a.employee_id END) as keperawatan,
      COUNT(DISTINCT CASE WHEN e.category='tenaga_kefarmasian' THEN a.employee_id END) as kefarmasian,
      COUNT(DISTINCT CASE WHEN e.category='tenaga_penunjang_medis' THEN a.employee_id END) as penunjang_medis,
      COUNT(DISTINCT CASE WHEN e.category='manajemen_administrasi' THEN a.employee_id END) as administrasi,
      COUNT(DISTINCT CASE WHEN e.category='tenaga_penunjang_non_medis' THEN a.employee_id END) as penunjang_non_medis,
      COUNT(DISTINCT a.employee_id) as total_present
    FROM attendance a LEFT JOIN employees e ON a.employee_id=e.id
    WHERE DATE(a.scan_time) BETWEEN ? AND ? AND a.scan_type='clock_in'
    GROUP BY DATE(a.scan_time) ORDER BY DATE(a.scan_time)
  `).bind(start, end).all()
  return c.json(r.results)
})

app.get('/api/reports/dpjp-compliance', async (c) => {
  const db = c.env.DB
  const start = c.req.query('start') || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const end = c.req.query('end') || new Date().toISOString().split('T')[0]
  const r = await db.prepare(`
    SELECT e.id, e.name, e.specialization, e.sub_role,
      COUNT(*) as total_schedules,
      SUM(CASE WHEN s.status='completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN s.status='missed' THEN 1 ELSE 0 END) as missed,
      SUM(CASE WHEN s.status='scheduled' THEN 1 ELSE 0 END) as scheduled,
      ROUND(CAST(SUM(CASE WHEN s.status='completed' THEN 1 ELSE 0 END) AS REAL)/COUNT(*)*100,1) as compliance_rate
    FROM dpjp_schedules s LEFT JOIN employees e ON s.employee_id=e.id
    WHERE s.schedule_date BETWEEN ? AND ? GROUP BY e.id ORDER BY compliance_rate DESC
  `).bind(start, end).all()
  return c.json(r.results)
})

app.get('/api/reports/access-summary', async (c) => {
  const db = c.env.DB
  const date = c.req.query('date') || new Date().toISOString().split('T')[0]
  const r = await db.prepare(`SELECT room_name, COUNT(*) as total, SUM(CASE WHEN access_type='granted' THEN 1 ELSE 0 END) as granted,
    SUM(CASE WHEN access_type='denied' THEN 1 ELSE 0 END) as denied FROM access_logs WHERE DATE(access_time)=? GROUP BY room_name ORDER BY total DESC`).bind(date).all()
  return c.json(r.results)
})

app.get('/api/reports/sdm-overview', async (c) => {
  const db = c.env.DB
  const r = await db.prepare(`
    SELECT 
      e.category,
      e.employment_type,
      COUNT(*) as total,
      SUM(CASE WHEN e.face_registered=1 THEN 1 ELSE 0 END) as face_reg,
      SUM(CASE WHEN e.finger_registered=1 THEN 1 ELSE 0 END) as finger_reg,
      SUM(CASE WHEN e.face_registered=1 AND e.finger_registered=1 THEN 1 ELSE 0 END) as both_reg
    FROM employees e WHERE e.is_active=1
    GROUP BY e.category, e.employment_type
    ORDER BY e.category, e.employment_type
  `).all()
  return c.json(r.results)
})

// =====================================================
// FRONTEND
// =====================================================
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIMRS Monitoring Biometrik - RSSA Malang</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js"></script>
  <script>dayjs.extend(dayjs_plugin_relativeTime)</script>
  <script>
    tailwind.config = {
      theme: { extend: { colors: {
        rssa: {50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#1e5fa8',600:'#1a5192',700:'#15437c',800:'#103566',900:'#0b2750'}
      }}}
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *{font-family:'Inter',sans-serif}
    .sidebar-link{transition:all .2s;border-left:3px solid transparent}
    .sidebar-link:hover,.sidebar-link.active{background:rgba(255,255,255,.1);border-left-color:#60a5fa}
    .card{transition:all .3s}.card:hover{transform:translateY(-2px);box-shadow:0 10px 25px -5px rgba(0,0,0,.1)}
    .pulse-dot{animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .fade-in{animation:fadeIn .3s ease-in}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
    .badge{font-size:.6rem;padding:2px 8px;border-radius:9999px;font-weight:600;text-transform:uppercase;letter-spacing:.02em}
    .table-row:hover{background:#f8fafc}
    .modal-overlay{background:rgba(0,0,0,.5);backdrop-filter:blur(4px)}
    .tab-btn{transition:all .2s}.tab-btn.active{border-bottom:2px solid #1e5fa8;color:#1e5fa8;font-weight:600}
    .mini-chart{height:4px;border-radius:2px}
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside id="sidebar" class="w-64 bg-gradient-to-b from-rssa-800 to-rssa-900 text-white flex flex-col shadow-xl z-30 flex-shrink-0">
      <div class="p-4 border-b border-rssa-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><i class="fas fa-hospital text-xl text-blue-300"></i></div>
          <div><h1 class="font-bold text-sm leading-tight">SIMRS Biometrik</h1><p class="text-[10px] text-blue-300 font-medium">RS Saiful Anwar Malang</p></div>
        </div>
      </div>
      <nav class="flex-1 py-3 overflow-y-auto">
        <div class="px-4 mb-1.5 text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Utama</div>
        <a href="#" onclick="showPage('dashboard')" class="sidebar-link active flex items-center gap-3 px-5 py-2 text-sm" data-page="dashboard"><i class="fas fa-chart-pie w-5 text-center"></i>Dashboard</a>
        <a href="#" onclick="showPage('sdmOverview')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="sdmOverview"><i class="fas fa-sitemap w-5 text-center"></i>Overview SDM</a>
        <a href="#" onclick="showPage('staffing')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="staffing"><i class="fas fa-hospital-user w-5 text-center"></i>Staffing Monitor</a>
        <div class="px-4 mt-4 mb-1.5 text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Monitoring</div>
        <a href="#" onclick="showPage('dpjp')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="dpjp"><i class="fas fa-user-md w-5 text-center"></i>DPJP</a>
        <a href="#" onclick="showPage('pendidikan')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="pendidikan"><i class="fas fa-graduation-cap w-5 text-center"></i>Pendidikan</a>
        <a href="#" onclick="showPage('keperawatan')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="keperawatan"><i class="fas fa-heartbeat w-5 text-center"></i>Keperawatan</a>
        <a href="#" onclick="showPage('farmasi')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="farmasi"><i class="fas fa-pills w-5 text-center"></i>Kefarmasian</a>
        <a href="#" onclick="showPage('attendance')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="attendance"><i class="fas fa-fingerprint w-5 text-center"></i>Kehadiran</a>
        <div class="px-4 mt-4 mb-1.5 text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Manajemen</div>
        <a href="#" onclick="showPage('employees')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="employees"><i class="fas fa-users w-5 text-center"></i>Data Pegawai</a>
        <a href="#" onclick="showPage('access')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="access"><i class="fas fa-door-open w-5 text-center"></i>Akses Ruangan</a>
        <a href="#" onclick="showPage('devices')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="devices"><i class="fas fa-tablet-alt w-5 text-center"></i>Perangkat</a>
        <div class="px-4 mt-4 mb-1.5 text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Laporan</div>
        <a href="#" onclick="showPage('reports')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="reports"><i class="fas fa-file-alt w-5 text-center"></i>Laporan & Analitik</a>
      </nav>
      <div class="p-3 border-t border-rssa-700 text-xs text-blue-300">
        <div class="flex items-center gap-2"><div class="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div><span>Sistem Online</span></div>
        <div class="mt-1 text-[10px] opacity-75">DIKST UB x RSSA &copy; 2026</div>
      </div>
    </aside>
    <main class="flex-1 overflow-y-auto">
      <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div class="flex items-center gap-4">
          <button onclick="document.getElementById('sidebar').classList.toggle('hidden')" class="lg:hidden text-gray-500"><i class="fas fa-bars text-lg"></i></button>
          <div><h2 id="pageTitle" class="text-lg font-bold text-gray-800">Dashboard</h2><p id="pageSubtitle" class="text-xs text-gray-500">Monitoring real-time seluruh SDM RSSA</p></div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right"><div id="currentTime" class="text-sm font-semibold text-gray-800"></div><div id="currentDate" class="text-xs text-gray-500"></div></div>
          <div class="w-9 h-9 bg-rssa-500 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
        </div>
      </header>
      <div id="content" class="p-6"></div>
    </main>
  </div>
  <div id="modal" class="hidden fixed inset-0 z-50 flex items-center justify-center modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4"><div id="modalContent"></div></div>
  </div>
  <script src="/static/app.js"></script>
</body>
</html>`)
})

export default app
