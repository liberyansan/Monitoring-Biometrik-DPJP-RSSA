import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { hashPassword, verifyPassword, generateToken, hashToken, generateApiKey, hashPassword as hashPw, hasPermission, ROLE_LABELS } from './auth'

type Bindings = { DB: D1Database }
type AuthUser = { id: number; username: string; name: string; role: string; department_id: number | null }
type Variables = { user?: AuthUser }
const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()
app.use('/api/*', cors())

// =====================================================
// AUTH MIDDLEWARE
// =====================================================
async function getAuthUser(c: any): Promise<AuthUser | null> {
  const cookie = c.req.header('Cookie') || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  const headerToken = c.req.header('Authorization')?.replace('Bearer ', '');
  const token = match?.[1] || headerToken;
  if (!token) return null;
  const tokenHash = await hashToken(token);
  const session = await c.env.DB.prepare(
    `SELECT s.*, u.username, u.name, u.role, u.department_id, u.is_active 
     FROM admin_sessions s JOIN admin_users u ON s.user_id=u.id 
     WHERE s.token_hash=? AND s.expires_at>datetime('now') AND u.is_active=1`
  ).bind(tokenHash).first();
  if (!session) return null;
  return { id: session.user_id, username: session.username, name: session.name, role: session.role, department_id: session.department_id };
}

// Auth guard middleware for CMS routes
const authRequired = async (c: any, next: any) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Unauthorized', redirect: '/login' }, 401);
  c.set('user', user);
  await next();
};

const adminRequired = async (c: any, next: any) => {
  const user = c.get('user') as AuthUser;
  if (!user || !hasPermission(user.role, 'cms:employees')) return c.json({ error: 'Forbidden' }, 403);
  await next();
};

const superAdminRequired = async (c: any, next: any) => {
  const user = c.get('user') as AuthUser;
  if (!user || user.role !== 'super_admin') return c.json({ error: 'Forbidden - Super Admin only' }, 403);
  await next();
};

// =====================================================
// HELPER: Category labels & priorities (kept from v3)
// =====================================================
const CATEGORY_LABELS: Record<string, string> = {
  tenaga_medis: 'Tenaga Medis', tenaga_pendidikan: 'Tenaga Pendidikan',
  tenaga_keperawatan: 'Tenaga Keperawatan', tenaga_kefarmasian: 'Tenaga Kefarmasian',
  tenaga_penunjang_medis: 'Tenaga Penunjang Medis', manajemen_administrasi: 'Manajemen & Administrasi',
  tenaga_penunjang_non_medis: 'Tenaga Penunjang Non-Medis',
};

// Helper: audit log
async function auditLog(db: D1Database, userId: number | null, action: string, tableName: string, recordId: number | null, oldVal?: any, newVal?: any) {
  await db.prepare(`INSERT INTO audit_logs (user_id, action, table_name, record_id, old_value, new_value) VALUES (?,?,?,?,?,?)`)
    .bind(userId, action, tableName, recordId, oldVal ? JSON.stringify(oldVal) : null, newVal ? JSON.stringify(newVal) : null).run();
}

// =====================================================
// AUTH API: Login, Logout, Session
// =====================================================
app.post('/api/auth/login', async (c) => {
  const db = c.env.DB;
  const { username, password } = await c.req.json();
  if (!username || !password) return c.json({ error: 'Username dan password harus diisi' }, 400);
  
  const user = await db.prepare('SELECT * FROM admin_users WHERE username=? AND is_active=1').bind(username).first() as any;
  if (!user) return c.json({ error: 'Username atau password salah' }, 401);
  
  const valid = await verifyPassword(password, user.password_hash, user.salt);
  if (!valid) return c.json({ error: 'Username atau password salah' }, 401);
  
  const token = generateToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 hours
  
  await db.prepare(`INSERT INTO admin_sessions (user_id, token_hash, expires_at, ip_address) VALUES (?,?,?,?)`)
    .bind(user.id, tokenHash, expiresAt, c.req.header('CF-Connecting-IP') || 'unknown').run();
  
  await db.prepare('UPDATE admin_users SET last_login=datetime("now") WHERE id=?').bind(user.id).run();
  await auditLog(db, user.id, 'login', 'admin_users', user.id);
  
  return c.json({
    success: true, token,
    user: { id: user.id, username: user.username, name: user.name, role: user.role, roleLabel: ROLE_LABELS[user.role] || user.role }
  }, 200, { 'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800` });
});

app.post('/api/auth/logout', async (c) => {
  const cookie = c.req.header('Cookie') || '';
  const match = cookie.match(/auth_token=([^;]+)/);
  if (match) {
    const tokenHash = await hashToken(match[1]);
    await c.env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(tokenHash).run();
  }
  return c.json({ success: true }, 200, { 'Set-Cookie': 'auth_token=; Path=/; HttpOnly; Max-Age=0' });
});

app.get('/api/auth/me', async (c) => {
  const user = await getAuthUser(c);
  if (!user) return c.json({ error: 'Not authenticated' }, 401);
  return c.json({ ...user, roleLabel: ROLE_LABELS[user.role] || user.role });
});

// =====================================================
// DASHBOARD APIs (existing - unchanged)
// =====================================================
app.get('/api/dashboard/stats', async (c) => {
  const db = c.env.DB; const today = new Date().toISOString().split('T')[0];
  const [total, byCategory, byPriority, todayAtt, activeDevices, schedToday, accessDenied, compSched, totalDPJP, totalPPDS, shiftCount] = await Promise.all([
    db.prepare('SELECT COUNT(*) as c FROM employees WHERE is_active=1').first(),
    db.prepare('SELECT category, COUNT(*) as c FROM employees WHERE is_active=1 GROUP BY category').all(),
    db.prepare('SELECT priority_level, COUNT(*) as c FROM employees WHERE is_active=1 GROUP BY priority_level ORDER BY priority_level').all(),
    db.prepare("SELECT COUNT(DISTINCT employee_id) as c FROM attendance WHERE DATE(scan_time)=? AND scan_type='clock_in'").bind(today).first(),
    db.prepare("SELECT COUNT(*) as c FROM devices WHERE status='active'").first(),
    db.prepare('SELECT COUNT(*) as c FROM dpjp_schedules WHERE schedule_date=?').bind(today).first(),
    db.prepare("SELECT COUNT(*) as c FROM access_logs WHERE DATE(access_time)=? AND access_type='denied'").bind(today).first(),
    db.prepare("SELECT COUNT(*) as c FROM dpjp_schedules WHERE schedule_date=? AND status='completed'").bind(today).first(),
    db.prepare("SELECT COUNT(*) as c FROM employees WHERE is_active=1 AND role='dpjp'").first(),
    db.prepare("SELECT COUNT(*) as c FROM employees WHERE is_active=1 AND category='tenaga_pendidikan'").first(),
    db.prepare('SELECT COUNT(*) as c FROM shift_schedules WHERE schedule_date=?').bind(today).first(),
  ]);
  const catMap: Record<string, number> = {}; for (const r of (byCategory.results as any[])) catMap[r.category] = r.c;
  const priMap: Record<number, number> = {}; for (const r of (byPriority.results as any[])) priMap[r.priority_level] = r.c;
  return c.json({ totalEmployees: (total as any)?.c||0, todayAttendance: (todayAtt as any)?.c||0, activeDevices: (activeDevices as any)?.c||0, schedulesToday: (schedToday as any)?.c||0, accessDenied: (accessDenied as any)?.c||0, completedSchedules: (compSched as any)?.c||0, totalDPJP: (totalDPJP as any)?.c||0, totalPPDS: (totalPPDS as any)?.c||0, shiftCount: (shiftCount as any)?.c||0, categories: catMap, priorities: priMap });
});

app.get('/api/dashboard/live-feed', async (c) => {
  const limit = parseInt(c.req.query('limit') || '25');
  const r = await c.env.DB.prepare(`SELECT a.*, e.name as employee_name, e.role, e.category, e.sub_role, e.specialization, d.name as device_name, d.location, dep.name as department_name FROM attendance a LEFT JOIN employees e ON a.employee_id=e.id LEFT JOIN devices d ON a.device_id=d.id LEFT JOIN departments dep ON e.department_id=dep.id ORDER BY a.scan_time DESC LIMIT ?`).bind(limit).all();
  return c.json(r.results);
});

app.get('/api/dashboard/category-attendance', async (c) => {
  const today = new Date().toISOString().split('T')[0];
  const r = await c.env.DB.prepare(`SELECT e.category, COUNT(DISTINCT e.id) as total_employees, COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END) as present FROM employees e LEFT JOIN attendance a ON e.id=a.employee_id AND DATE(a.scan_time)=? AND a.scan_type='clock_in' WHERE e.is_active=1 GROUP BY e.category ORDER BY e.category`).bind(today).all();
  return c.json(r.results);
});

// =====================================================
// SDM Summary (existing)
// =====================================================
app.get('/api/sdm/summary', async (c) => {
  const db = c.env.DB; const today = new Date().toISOString().split('T')[0];
  const [bySubRole, attByCategory, biometricStats] = await Promise.all([
    db.prepare('SELECT category, sub_role, employment_type, priority_level, COUNT(*) as c FROM employees WHERE is_active=1 GROUP BY category, sub_role, employment_type, priority_level ORDER BY priority_level, category, sub_role').all(),
    db.prepare("SELECT e.category, e.sub_role, COUNT(DISTINCT e.id) as total, COUNT(DISTINCT CASE WHEN a.id IS NOT NULL THEN e.id END) as present FROM employees e LEFT JOIN attendance a ON e.id=a.employee_id AND DATE(a.scan_time)=? AND a.scan_type='clock_in' WHERE e.is_active=1 GROUP BY e.category, e.sub_role").bind(today).all(),
    db.prepare('SELECT category, SUM(CASE WHEN face_registered=1 THEN 1 ELSE 0 END) as face_registered, SUM(CASE WHEN finger_registered=1 THEN 1 ELSE 0 END) as finger_registered, SUM(CASE WHEN face_registered=1 AND finger_registered=1 THEN 1 ELSE 0 END) as both_registered, COUNT(*) as total FROM employees WHERE is_active=1 GROUP BY category').all()
  ]);
  return c.json({ bySubRole: bySubRole.results, attendance: attByCategory.results, biometricStats: biometricStats.results });
});

// =====================================================
// Staffing Monitor (existing)
// =====================================================
app.get('/api/staffing/monitor', async (c) => {
  const db = c.env.DB; const today = new Date().toISOString().split('T')[0];
  const hour = new Date().getUTCHours();
  let currentShift = 'pagi'; if (hour>=14&&hour<21) currentShift='siang'; else if (hour>=21||hour<7) currentShift='malam';
  const reqs = await db.prepare('SELECT sr.*, dep.name as department_name, dep.code as department_code, dep.is_critical FROM staffing_requirements sr LEFT JOIN departments dep ON sr.department_id=dep.id WHERE sr.is_active=1 AND sr.shift_type=? ORDER BY dep.is_critical DESC, dep.name').bind(currentShift).all();
  const actual = await db.prepare("SELECT ss.department_id, e.category, COUNT(DISTINCT e.id) as present_count FROM shift_schedules ss LEFT JOIN employees e ON ss.employee_id=e.id LEFT JOIN attendance a ON e.id=a.employee_id AND DATE(a.scan_time)=? AND a.scan_type='clock_in' WHERE ss.schedule_date=? AND ss.shift_type=? AND a.id IS NOT NULL GROUP BY ss.department_id, e.category").bind(today,today,currentShift).all();
  const actualMap: Record<string,number>={}; for(const a of (actual.results as any[])) actualMap[`${a.department_id}_${a.category}`]=a.present_count;
  return c.json((reqs.results as any[]).map(r=>({...r,actual_count:actualMap[`${r.department_id}_${r.category}`]||0,is_understaffed:(actualMap[`${r.department_id}_${r.category}`]||0)<r.min_count,current_shift:currentShift})));
});

// =====================================================
// Shift Schedules (existing)
// =====================================================
app.get('/api/shifts', async (c) => {
  const db = c.env.DB; const date = c.req.query('date')||new Date().toISOString().split('T')[0];
  const dept=c.req.query('department_id'), shift=c.req.query('shift'), category=c.req.query('category');
  let q=`SELECT ss.*, e.name as employee_name, e.role, e.category, e.sub_role, dep.name as department_name, dep.code as department_code, dep.is_critical, (SELECT MIN(a.scan_time) FROM attendance a WHERE a.employee_id=ss.employee_id AND DATE(a.scan_time)=ss.schedule_date AND a.scan_type='clock_in') as actual_clock_in FROM shift_schedules ss LEFT JOIN employees e ON ss.employee_id=e.id LEFT JOIN departments dep ON ss.department_id=dep.id WHERE ss.schedule_date=?`;
  const p:any[]=[date]; if(dept){q+=' AND ss.department_id=?';p.push(parseInt(dept))} if(shift){q+=' AND ss.shift_type=?';p.push(shift)} if(category){q+=' AND e.category=?';p.push(category)}
  q+=' ORDER BY dep.is_critical DESC, dep.name, ss.start_time';
  return c.json((await db.prepare(q).bind(...p).all()).results);
});

// =====================================================
// Employees (existing + CMS CRUD)
// =====================================================
app.get('/api/employees', async (c) => {
  const db=c.env.DB; const{role,category,search,department_id,priority,sub_role,employment_type}=c.req.query() as any;
  let q='SELECT e.*, dep.name as department_name, dep.code as department_code FROM employees e LEFT JOIN departments dep ON e.department_id=dep.id WHERE e.is_active=1';
  const p:any[]=[];
  if(category){q+=' AND e.category=?';p.push(category)} if(role){q+=' AND e.role=?';p.push(role)} if(sub_role){q+=' AND e.sub_role=?';p.push(sub_role)} if(employment_type){q+=' AND e.employment_type=?';p.push(employment_type)} if(search){q+=' AND (e.name LIKE ? OR e.nip LIKE ?)';p.push(`%${search}%`,`%${search}%`)} if(department_id){q+=' AND e.department_id=?';p.push(parseInt(department_id))} if(priority){q+=' AND e.priority_level=?';p.push(parseInt(priority))}
  q+=' ORDER BY e.priority_level, e.category, e.name';
  return c.json(p.length>0?(await db.prepare(q).bind(...p).all()).results:(await db.prepare(q).all()).results);
});

app.get('/api/employees/:id', async (c) => {
  const db=c.env.DB; const id=parseInt(c.req.param('id')); const today=new Date().toISOString().split('T')[0];
  const [emp,att,sched,shifts,access,rotation]=await Promise.all([
    db.prepare('SELECT e.*, dep.name as department_name, dep.code as department_code FROM employees e LEFT JOIN departments dep ON e.department_id=dep.id WHERE e.id=?').bind(id).first(),
    db.prepare("SELECT * FROM attendance WHERE employee_id=? AND DATE(scan_time)=? ORDER BY scan_time").bind(id,today).all(),
    db.prepare('SELECT s.*, dep.name as department_name FROM dpjp_schedules s LEFT JOIN departments dep ON s.department_id=dep.id WHERE s.employee_id=? AND s.schedule_date=? ORDER BY s.start_time').bind(id,today).all(),
    db.prepare('SELECT ss.*, dep.name as department_name FROM shift_schedules ss LEFT JOIN departments dep ON ss.department_id=dep.id WHERE ss.employee_id=? AND ss.schedule_date=? ORDER BY ss.start_time').bind(id,today).all(),
    db.prepare('SELECT al.*, d.name as device_name FROM access_logs al LEFT JOIN devices d ON al.device_id=d.id WHERE al.employee_id=? ORDER BY al.access_time DESC LIMIT 10').bind(id).all(),
    db.prepare("SELECT r.*, dep.name as department_name, sup.name as supervisor_name FROM ppds_rotations r LEFT JOIN departments dep ON r.department_id=dep.id LEFT JOIN employees sup ON r.supervisor_id=sup.id WHERE r.employee_id=? ORDER BY r.status='active' DESC, r.start_date DESC").bind(id).all(),
  ]);
  if(!emp) return c.json({error:'Not found'},404);
  const attStats=await db.prepare("SELECT COUNT(DISTINCT DATE(scan_time)) as attendance_days FROM attendance WHERE employee_id=? AND DATE(scan_time)>=date(?,'-30 days') AND scan_type='clock_in'").bind(id,today).first();
  let dpjpCompliance:any=null,supervisedPPDS:any=null;
  if((emp as any).role==='dpjp'){
    dpjpCompliance=await db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN status='missed' THEN 1 ELSE 0 END) as missed FROM dpjp_schedules WHERE employee_id=? AND schedule_date>=date(?,'-30 days')").bind(id,today).first();
    supervisedPPDS=(await db.prepare("SELECT r.*, e.name as ppds_name, e.role, e.specialization, dep.name as rotation_dept FROM ppds_rotations r LEFT JOIN employees e ON r.employee_id=e.id LEFT JOIN departments dep ON r.department_id=dep.id WHERE r.supervisor_id=? AND r.status='active'").bind(id).all()).results;
  }
  return c.json({...(emp as any),todayAttendance:att.results,schedules:sched.results,shifts:shifts.results,recentAccess:access.results,rotations:rotation.results,attendanceDays30:(attStats as any)?.attendance_days||0,dpjpCompliance,supervisedPPDS});
});

// =====================================================
// CMS: Employee CRUD (protected)
// =====================================================
app.post('/api/cms/employees', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  const{nip,name,role,specialization,department_id,phone,category,sub_role,employment_type,priority_level,sip_str,biometric_id}=data;
  if(!nip||!name||!role) return c.json({error:'NIP, nama, dan role harus diisi'},400);
  const r=await db.prepare(`INSERT INTO employees (nip,name,role,specialization,department_id,phone,category,sub_role,employment_type,priority_level,sip_str,biometric_id,face_registered,finger_registered,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,0,1)`)
    .bind(nip,name,role,specialization||null,department_id||null,phone||null,category||'manajemen_administrasi',sub_role||null,employment_type||'kontrak',priority_level||3,sip_str||null,biometric_id||null).run();
  await auditLog(db,user.id,'create','employees',r.meta.last_row_id as number,null,data);
  return c.json({success:true,id:r.meta.last_row_id});
});

app.put('/api/cms/employees/:id', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const id=parseInt(c.req.param('id'));
  const old=await db.prepare('SELECT * FROM employees WHERE id=?').bind(id).first();
  if(!old) return c.json({error:'Not found'},404);
  const data=await c.req.json();
  const fields=['nip','name','role','specialization','department_id','phone','category','sub_role','employment_type','priority_level','sip_str','biometric_id','face_registered','finger_registered','is_active'];
  const sets:string[]=[], vals:any[]=[];
  for(const f of fields){ if(data[f]!==undefined){sets.push(`${f}=?`);vals.push(data[f])} }
  if(sets.length===0) return c.json({error:'No fields to update'},400);
  sets.push("updated_at=datetime('now')"); vals.push(id);
  await db.prepare(`UPDATE employees SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
  await auditLog(db,user.id,'update','employees',id,old,data);
  return c.json({success:true});
});

app.delete('/api/cms/employees/:id', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const id=parseInt(c.req.param('id'));
  await db.prepare("UPDATE employees SET is_active=0, updated_at=datetime('now') WHERE id=?").bind(id).run();
  await auditLog(db,user.id,'delete','employees',id);
  return c.json({success:true});
});

// CSV Import
app.post('/api/cms/employees/import', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!;
  const body=await c.req.json();
  const{csvData}=body; // expect array of row objects
  if(!Array.isArray(csvData)||csvData.length===0) return c.json({error:'Data CSV kosong'},400);
  let imported=0,errors:string[]=[];
  for(const row of csvData){
    try{
      if(!row.nip||!row.name||!row.role){errors.push(`Baris tanpa NIP/nama/role: ${JSON.stringify(row)}`);continue}
      await db.prepare(`INSERT OR IGNORE INTO employees (nip,name,role,specialization,department_id,phone,category,sub_role,employment_type,priority_level,sip_str,biometric_id,face_registered,finger_registered,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0,0,1)`)
        .bind(row.nip,row.name,row.role,row.specialization||null,row.department_id||null,row.phone||null,row.category||'manajemen_administrasi',row.sub_role||null,row.employment_type||'kontrak',row.priority_level||3,row.sip_str||null,row.biometric_id||null).run();
      imported++;
    }catch(e:any){errors.push(`Error NIP ${row.nip}: ${e.message}`)}
  }
  await auditLog(db,user.id,'import','employees',null,null,{imported,total:csvData.length});
  return c.json({success:true,imported,total:csvData.length,errors});
});

// =====================================================
// CMS: Department CRUD
// =====================================================
app.post('/api/cms/departments', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  const r=await db.prepare('INSERT INTO departments (code,name,type,is_critical,floor,building,is_active) VALUES (?,?,?,?,?,?,1)')
    .bind(data.code,data.name,data.type||'unit',data.is_critical||0,data.floor||null,data.building||null).run();
  await auditLog(db,user.id,'create','departments',r.meta.last_row_id as number,null,data);
  return c.json({success:true,id:r.meta.last_row_id});
});

app.put('/api/cms/departments/:id', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const id=parseInt(c.req.param('id'));
  const data=await c.req.json();
  const fields=['code','name','type','is_critical','floor','building','is_active'];
  const sets:string[]=[],vals:any[]=[];
  for(const f of fields){if(data[f]!==undefined){sets.push(`${f}=?`);vals.push(data[f])}} vals.push(id);
  if(sets.length===0) return c.json({error:'No fields'},400);
  await db.prepare(`UPDATE departments SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
  await auditLog(db,user.id,'update','departments',id,null,data);
  return c.json({success:true});
});

// =====================================================
// CMS: Device CRUD
// =====================================================
app.post('/api/cms/devices', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  const r=await db.prepare('INSERT INTO devices (device_code,name,type,location,location_type,ip_address,status) VALUES (?,?,?,?,?,?,?)')
    .bind(data.device_code,data.name,data.type||'face_recognition',data.location,data.location_type||'entrance',data.ip_address||null,data.status||'active').run();
  await auditLog(db,user.id,'create','devices',r.meta.last_row_id as number,null,data);
  return c.json({success:true,id:r.meta.last_row_id});
});

app.put('/api/cms/devices/:id', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const id=parseInt(c.req.param('id'));
  const data=await c.req.json();
  const fields=['device_code','name','type','location','location_type','ip_address','status'];
  const sets:string[]=[],vals:any[]=[];
  for(const f of fields){if(data[f]!==undefined){sets.push(`${f}=?`);vals.push(data[f])}} vals.push(id);
  await db.prepare(`UPDATE devices SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
  await auditLog(db,user.id,'update','devices',id,null,data);
  return c.json({success:true});
});

// =====================================================
// CMS: DPJP Schedule CRUD
// =====================================================
app.post('/api/cms/dpjp-schedules', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  const r=await db.prepare('INSERT INTO dpjp_schedules (employee_id,schedule_date,shift,start_time,end_time,department_id,activity_type,patient_count,status) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(data.employee_id,data.schedule_date,data.shift||'pagi',data.start_time,data.end_time,data.department_id,data.activity_type||'visite',data.patient_count||0,data.status||'scheduled').run();
  await auditLog(db,user.id,'create','dpjp_schedules',r.meta.last_row_id as number,null,data);
  return c.json({success:true,id:r.meta.last_row_id});
});

app.put('/api/cms/dpjp-schedules/:id', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const id=parseInt(c.req.param('id'));
  const data=await c.req.json();
  const fields=['employee_id','schedule_date','shift','start_time','end_time','department_id','activity_type','patient_count','status'];
  const sets:string[]=[],vals:any[]=[];
  for(const f of fields){if(data[f]!==undefined){sets.push(`${f}=?`);vals.push(data[f])}} vals.push(id);
  await db.prepare(`UPDATE dpjp_schedules SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
  await auditLog(db,user.id,'update','dpjp_schedules',id,null,data);
  return c.json({success:true});
});

// =====================================================
// CMS: PPDS Rotation CRUD
// =====================================================
app.post('/api/cms/ppds-rotations', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  const r=await db.prepare('INSERT INTO ppds_rotations (employee_id,department_id,supervisor_id,start_date,end_date,stage,status) VALUES (?,?,?,?,?,?,?)')
    .bind(data.employee_id,data.department_id,data.supervisor_id||null,data.start_date,data.end_date,data.stage||'junior',data.status||'active').run();
  await auditLog(db,user.id,'create','ppds_rotations',r.meta.last_row_id as number,null,data);
  return c.json({success:true,id:r.meta.last_row_id});
});

// =====================================================
// CMS: Shift Schedule CRUD  
// =====================================================
app.post('/api/cms/shift-schedules', authRequired, adminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  const r=await db.prepare('INSERT INTO shift_schedules (employee_id,schedule_date,shift_type,start_time,end_time,department_id,area,is_leader,status) VALUES (?,?,?,?,?,?,?,?,?)')
    .bind(data.employee_id,data.schedule_date,data.shift_type||'pagi',data.start_time,data.end_time,data.department_id,data.area||null,data.is_leader||0,data.status||'scheduled').run();
  await auditLog(db,user.id,'create','shift_schedules',r.meta.last_row_id as number,null,data);
  return c.json({success:true,id:r.meta.last_row_id});
});

// =====================================================
// CMS: Admin User Management (super_admin only)
// =====================================================
app.get('/api/cms/users', authRequired, superAdminRequired, async (c) => {
  const r=await c.env.DB.prepare('SELECT id,username,name,role,department_id,is_active,last_login,created_at FROM admin_users ORDER BY role,name').all();
  return c.json(r.results);
});

app.post('/api/cms/users', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  if(!data.username||!data.password||!data.name||!data.role) return c.json({error:'Username, password, nama, dan role harus diisi'},400);
  const exists=await db.prepare('SELECT id FROM admin_users WHERE username=?').bind(data.username).first();
  if(exists) return c.json({error:'Username sudah digunakan'},400);
  const{hash,salt}=await hashPassword(data.password);
  const r=await db.prepare('INSERT INTO admin_users (username,password_hash,salt,name,role,department_id,is_active) VALUES (?,?,?,?,?,?,1)')
    .bind(data.username,hash,salt,data.name,data.role,data.department_id||null).run();
  await auditLog(db,user.id,'create','admin_users',r.meta.last_row_id as number,null,{username:data.username,role:data.role});
  return c.json({success:true,id:r.meta.last_row_id});
});

app.put('/api/cms/users/:id', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const id=parseInt(c.req.param('id'));
  const data=await c.req.json();
  const sets:string[]=[],vals:any[]=[];
  if(data.name){sets.push('name=?');vals.push(data.name)}
  if(data.role){sets.push('role=?');vals.push(data.role)}
  if(data.department_id!==undefined){sets.push('department_id=?');vals.push(data.department_id)}
  if(data.is_active!==undefined){sets.push('is_active=?');vals.push(data.is_active)}
  if(data.password){const{hash,salt}=await hashPassword(data.password);sets.push('password_hash=?,salt=?');vals.push(hash,salt)}
  sets.push("updated_at=datetime('now')"); vals.push(id);
  await db.prepare(`UPDATE admin_users SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
  await auditLog(db,user.id,'update','admin_users',id,null,{...data,password:data.password?'[changed]':undefined});
  return c.json({success:true});
});

// =====================================================
// API KEY Management (super_admin only)
// =====================================================
app.get('/api/cms/api-keys', authRequired, superAdminRequired, async (c) => {
  const r=await c.env.DB.prepare('SELECT k.*, d.name as device_name, d.device_code, u.name as created_by_name FROM api_keys k LEFT JOIN devices d ON k.device_id=d.id LEFT JOIN admin_users u ON k.created_by=u.id ORDER BY k.is_active DESC, k.created_at DESC').all();
  return c.json(r.results);
});

app.post('/api/cms/api-keys', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  if(!data.name) return c.json({error:'Nama API key harus diisi'},400);
  const{key,prefix}=generateApiKey();
  const keyHash=await hashToken(key);
  const r=await db.prepare('INSERT INTO api_keys (key_prefix,key_hash,name,description,device_id,permissions,rate_limit,ip_whitelist,is_active,created_by) VALUES (?,?,?,?,?,?,?,?,1,?)')
    .bind(prefix,keyHash,data.name,data.description||null,data.device_id||null,data.permissions||'attendance:write',data.rate_limit||60,data.ip_whitelist||null,user.id).run();
  await auditLog(db,user.id,'create','api_keys',r.meta.last_row_id as number,null,{name:data.name});
  return c.json({success:true,id:r.meta.last_row_id,apiKey:key,prefix,message:'Simpan API key ini. Tidak akan ditampilkan lagi.'});
});

app.put('/api/cms/api-keys/:id', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const id=parseInt(c.req.param('id'));
  const data=await c.req.json();
  const sets:string[]=[],vals:any[]=[];
  if(data.name){sets.push('name=?');vals.push(data.name)}
  if(data.description!==undefined){sets.push('description=?');vals.push(data.description)}
  if(data.device_id!==undefined){sets.push('device_id=?');vals.push(data.device_id)}
  if(data.permissions){sets.push('permissions=?');vals.push(data.permissions)}
  if(data.rate_limit){sets.push('rate_limit=?');vals.push(data.rate_limit)}
  if(data.ip_whitelist!==undefined){sets.push('ip_whitelist=?');vals.push(data.ip_whitelist)}
  if(data.is_active!==undefined){sets.push('is_active=?');vals.push(data.is_active)}
  sets.push("updated_at=datetime('now')"); vals.push(id);
  await db.prepare(`UPDATE api_keys SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
  await auditLog(db,user.id,'update','api_keys',id,null,data);
  return c.json({success:true});
});

app.delete('/api/cms/api-keys/:id', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const id=parseInt(c.req.param('id'));
  await c.env.DB.prepare("UPDATE api_keys SET is_active=0, updated_at=datetime('now') WHERE id=?").bind(id).run();
  await auditLog(db,user.id,'revoke','api_keys',id);
  return c.json({success:true});
});

// API Request Logs
app.get('/api/cms/api-logs', authRequired, superAdminRequired, async (c) => {
  const limit=parseInt(c.req.query('limit')||'100');
  const r=await c.env.DB.prepare('SELECT l.*, k.name as key_name, k.key_prefix FROM api_request_logs l LEFT JOIN api_keys k ON l.api_key_id=k.id ORDER BY l.created_at DESC LIMIT ?').bind(limit).all();
  return c.json(r.results);
});

// =====================================================
// Webhook Management (super_admin only)
// =====================================================
app.get('/api/cms/webhooks', authRequired, superAdminRequired, async (c) => {
  return c.json((await c.env.DB.prepare('SELECT * FROM webhook_configs ORDER BY is_active DESC, name').all()).results);
});

app.post('/api/cms/webhooks', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  const r=await db.prepare('INSERT INTO webhook_configs (name,url,events,headers,secret,is_active) VALUES (?,?,?,?,?,1)')
    .bind(data.name,data.url,data.events||'attendance:created',data.headers||null,data.secret||null).run();
  await auditLog(db,user.id,'create','webhook_configs',r.meta.last_row_id as number,null,data);
  return c.json({success:true,id:r.meta.last_row_id});
});

app.put('/api/cms/webhooks/:id', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const id=parseInt(c.req.param('id'));
  const data=await c.req.json();
  const fields=['name','url','events','headers','secret','is_active'];
  const sets:string[]=[],vals:any[]=[];
  for(const f of fields){if(data[f]!==undefined){sets.push(`${f}=?`);vals.push(data[f])}} sets.push("updated_at=datetime('now')"); vals.push(id);
  await db.prepare(`UPDATE webhook_configs SET ${sets.join(',')} WHERE id=?`).bind(...vals).run();
  await auditLog(db,user.id,'update','webhook_configs',id,null,data);
  return c.json({success:true});
});

// SIMRS Config
app.get('/api/cms/simrs-config', authRequired, superAdminRequired, async (c) => {
  return c.json((await c.env.DB.prepare('SELECT * FROM simrs_config ORDER BY config_key').all()).results);
});

app.put('/api/cms/simrs-config', authRequired, superAdminRequired, async (c) => {
  const db=c.env.DB; const user=c.get('user')!; const data=await c.req.json();
  for(const[k,v] of Object.entries(data)){
    await db.prepare("INSERT OR REPLACE INTO simrs_config (config_key,config_value,updated_at) VALUES (?,?,datetime('now'))").bind(k,v as string).run();
  }
  await auditLog(db,user.id,'update','simrs_config',null,null,data);
  return c.json({success:true});
});

// Audit Logs
app.get('/api/cms/audit-logs', authRequired, superAdminRequired, async (c) => {
  const limit=parseInt(c.req.query('limit')||'100');
  const r=await c.env.DB.prepare('SELECT a.*, u.name as user_name, u.username FROM audit_logs a LEFT JOIN admin_users u ON a.user_id=u.id ORDER BY a.created_at DESC LIMIT ?').bind(limit).all();
  return c.json(r.results);
});

// =====================================================
// PUBLIC API v1: Attendance from biometric devices (API key auth)
// =====================================================
app.post('/api/v1/attendance', async (c) => {
  const db=c.env.DB;
  const apiKey=c.req.header('X-API-Key');
  if(!apiKey) return c.json({error:'API key required'},401);
  const keyHash=await hashToken(apiKey);
  const key=await db.prepare("SELECT * FROM api_keys WHERE key_hash=? AND is_active=1 AND (expires_at IS NULL OR expires_at>datetime('now'))").bind(keyHash).first() as any;
  if(!key) {
    await db.prepare("INSERT INTO api_request_logs (endpoint,method,status_code,ip_address) VALUES ('/api/v1/attendance','POST',401,?)").bind(c.req.header('CF-Connecting-IP')||'unknown').run();
    return c.json({error:'Invalid API key'},401);
  }
  const start=Date.now();
  try{
    const{biometric_id,device_code,method,confidence_score,scan_type}=await c.req.json();
    const emp=await db.prepare('SELECT id,name,department_id FROM employees WHERE biometric_id=? AND is_active=1').bind(biometric_id).first() as any;
    if(!emp){
      await db.prepare("INSERT INTO api_request_logs (api_key_id,endpoint,method,status_code,ip_address,response_time_ms,error_message) VALUES (?,'/api/v1/attendance','POST',404,?,?,?)").bind(key.id,c.req.header('CF-Connecting-IP')||'unknown',Date.now()-start,`Employee not found: ${biometric_id}`).run();
      return c.json({error:'Employee not found'},404);
    }
    const dev=await db.prepare('SELECT id,location FROM devices WHERE device_code=?').bind(device_code||key.device_id).first() as any;
    const r=await db.prepare("INSERT INTO attendance (employee_id,device_id,scan_time,scan_type,method,confidence_score,location,status) VALUES (?,?,datetime('now'),?,?,?,?,'verified')")
      .bind(emp.id,dev?dev.id:null,scan_type||'clock_in',method||'face',confidence_score||0,dev?dev.location:'Unknown').run();
    await db.prepare("UPDATE api_keys SET last_used=datetime('now'),total_requests=total_requests+1 WHERE id=?").bind(key.id).run();
    await db.prepare("INSERT INTO api_request_logs (api_key_id,endpoint,method,status_code,ip_address,response_time_ms) VALUES (?,'/api/v1/attendance','POST',200,?,?)").bind(key.id,c.req.header('CF-Connecting-IP')||'unknown',Date.now()-start).run();
    return c.json({success:true,id:r.meta.last_row_id,employee_name:emp.name});
  }catch(e:any){
    await db.prepare("INSERT INTO api_request_logs (api_key_id,endpoint,method,status_code,ip_address,response_time_ms,error_message) VALUES (?,'/api/v1/attendance','POST',500,?,?,?)").bind(key.id,c.req.header('CF-Connecting-IP')||'unknown',Date.now()-start,e.message).run();
    return c.json({error:e.message},500);
  }
});

// Legacy attendance endpoint (internal)
app.get('/api/attendance', async (c) => {
  const db=c.env.DB; const{date:d,role,category,type}=c.req.query() as any; const date=d||new Date().toISOString().split('T')[0];
  let q='SELECT a.*, e.name as employee_name, e.nip, e.role, e.category, e.sub_role, e.specialization, d.name as device_name, d.location as device_location, dep.name as department_name FROM attendance a LEFT JOIN employees e ON a.employee_id=e.id LEFT JOIN devices d ON a.device_id=d.id LEFT JOIN departments dep ON e.department_id=dep.id WHERE DATE(a.scan_time)=?';
  const p:any[]=[date]; if(role){q+=' AND e.role=?';p.push(role)} if(category){q+=' AND e.category=?';p.push(category)} if(type){q+=' AND a.scan_type=?';p.push(type)}
  q+=' ORDER BY a.scan_time DESC';
  return c.json((await db.prepare(q).bind(...p).all()).results);
});

app.post('/api/attendance', async (c) => {
  const db=c.env.DB; const{biometric_id,device_code,method,confidence_score,scan_type}=await c.req.json();
  const emp=await db.prepare('SELECT id FROM employees WHERE biometric_id=?').bind(biometric_id).first() as any;
  if(!emp) return c.json({error:'Employee not found'},404);
  const dev=await db.prepare('SELECT id,location FROM devices WHERE device_code=?').bind(device_code).first() as any;
  const r=await db.prepare("INSERT INTO attendance (employee_id,device_id,scan_time,scan_type,method,confidence_score,location,status) VALUES (?,?,datetime('now'),?,?,?,?,'verified')").bind(emp.id,dev?dev.id:null,scan_type||'clock_in',method||'face',confidence_score||0,dev?dev.location:'Unknown').run();
  return c.json({success:true,id:r.meta.last_row_id});
});

// =====================================================
// DPJP Monitoring (existing)
// =====================================================
app.get('/api/dpjp/monitoring', async (c) => {
  const db=c.env.DB; const date=c.req.query('date')||new Date().toISOString().split('T')[0];
  const schedules=await db.prepare("SELECT s.*, e.name as doctor_name, e.nip, e.specialization, e.sub_role, dep.name as department_name, (SELECT MIN(a.scan_time) FROM attendance a WHERE a.employee_id=s.employee_id AND DATE(a.scan_time)=s.schedule_date AND a.scan_type='clock_in') as actual_clock_in, (SELECT MAX(a.scan_time) FROM attendance a WHERE a.employee_id=s.employee_id AND DATE(a.scan_time)=s.schedule_date AND a.scan_type='clock_out') as actual_clock_out FROM dpjp_schedules s LEFT JOIN employees e ON s.employee_id=e.id LEFT JOIN departments dep ON s.department_id=dep.id WHERE s.schedule_date=? ORDER BY s.start_time").bind(date).all();
  const total=schedules.results.length,completed=schedules.results.filter((s:any)=>s.status==='completed').length,missed=schedules.results.filter((s:any)=>s.status==='missed').length;
  return c.json({schedules:schedules.results,summary:{total,completed,missed,scheduled:total-completed-missed,complianceRate:total>0?Math.round(completed/total*100):0}});
});

app.get('/api/dpjp/:id/profile', async (c) => {
  const db=c.env.DB; const id=parseInt(c.req.param('id')); const today=new Date().toISOString().split('T')[0];
  const[dpjp,schedules30d,supervised,todaySchedule]=await Promise.all([
    db.prepare("SELECT e.*, dep.name as department_name FROM employees e LEFT JOIN departments dep ON e.department_id=dep.id WHERE e.id=? AND e.role='dpjp'").bind(id).first(),
    db.prepare("SELECT schedule_date, COUNT(*) as total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN status='missed' THEN 1 ELSE 0 END) as missed FROM dpjp_schedules WHERE employee_id=? AND schedule_date>=date(?,'-30 days') GROUP BY schedule_date ORDER BY schedule_date").bind(id,today).all(),
    db.prepare("SELECT r.*, e.name as ppds_name, e.role as ppds_role, e.specialization as ppds_spec, dep.name as rotation_dept FROM ppds_rotations r LEFT JOIN employees e ON r.employee_id=e.id LEFT JOIN departments dep ON r.department_id=dep.id WHERE r.supervisor_id=? AND r.status='active' ORDER BY e.name").bind(id).all(),
    db.prepare('SELECT s.*, dep.name as department_name FROM dpjp_schedules s LEFT JOIN departments dep ON s.department_id=dep.id WHERE s.employee_id=? AND s.schedule_date=? ORDER BY s.start_time').bind(id,today).all(),
  ]);
  if(!dpjp) return c.json({error:'DPJP not found'},404);
  return c.json({dpjp,scheduleHistory:schedules30d.results,supervisedPPDS:supervised.results,todaySchedule:todaySchedule.results});
});

// =====================================================
// Pendidikan Monitoring (existing)
// =====================================================
app.get('/api/pendidikan/monitoring', async (c) => {
  const db=c.env.DB; const today=new Date().toISOString().split('T')[0];
  const r=await db.prepare("SELECT e.id, e.nip, e.name, e.role, e.sub_role, e.specialization, r.stage, r.start_date, r.end_date, r.status as rotation_status, dep.name as rotation_department, sup.name as supervisor_name, sup.id as supervisor_id, (SELECT MIN(a.scan_time) FROM attendance a WHERE a.employee_id=e.id AND DATE(a.scan_time)=? AND a.scan_type='clock_in') as today_clock_in, (SELECT COUNT(DISTINCT DATE(a.scan_time)) FROM attendance a WHERE a.employee_id=e.id AND DATE(a.scan_time)>=date(?,'-30 days') AND a.scan_type='clock_in') as monthly_attendance_count FROM employees e LEFT JOIN ppds_rotations r ON e.id=r.employee_id AND r.status='active' LEFT JOIN departments dep ON r.department_id=dep.id LEFT JOIN employees sup ON r.supervisor_id=sup.id WHERE e.category='tenaga_pendidikan' AND e.is_active=1 ORDER BY e.role, e.name").bind(today,today).all();
  return c.json(r.results);
});

// =====================================================
// Access Logs, Devices, Departments (existing)
// =====================================================
app.get('/api/access-logs', async (c) => {
  const db=c.env.DB; const{date:d,type,room}=c.req.query() as any; const date=d||new Date().toISOString().split('T')[0];
  let q='SELECT al.*, e.name as employee_name, e.role, e.category, e.nip, d.name as device_name, d.location_type FROM access_logs al LEFT JOIN employees e ON al.employee_id=e.id LEFT JOIN devices d ON al.device_id=d.id WHERE DATE(al.access_time)=?';
  const p:any[]=[date]; if(type){q+=' AND al.access_type=?';p.push(type)} if(room){q+=' AND al.room_name LIKE ?';p.push(`%${room}%`)}
  q+=' ORDER BY al.access_time DESC';
  return c.json((await db.prepare(q).bind(...p).all()).results);
});

app.get('/api/devices', async (c) => { return c.json((await c.env.DB.prepare('SELECT * FROM devices ORDER BY status, name').all()).results); });

app.get('/api/departments', async (c) => {
  return c.json((await c.env.DB.prepare("SELECT d.*, (SELECT COUNT(*) FROM employees e WHERE e.department_id=d.id AND e.is_active=1) as employee_count FROM departments d WHERE d.is_active=1 ORDER BY d.is_critical DESC, d.name").all()).results);
});

// =====================================================
// Reports (existing)
// =====================================================
app.get('/api/reports/attendance-summary', async (c) => {
  const db=c.env.DB; const start=c.req.query('start')||new Date(Date.now()-7*86400000).toISOString().split('T')[0]; const end=c.req.query('end')||new Date().toISOString().split('T')[0];
  return c.json((await db.prepare("SELECT DATE(a.scan_time) as date, COUNT(DISTINCT CASE WHEN e.category='tenaga_medis' THEN a.employee_id END) as medis, COUNT(DISTINCT CASE WHEN e.category='tenaga_pendidikan' THEN a.employee_id END) as pendidikan, COUNT(DISTINCT CASE WHEN e.category='tenaga_keperawatan' THEN a.employee_id END) as keperawatan, COUNT(DISTINCT CASE WHEN e.category='tenaga_kefarmasian' THEN a.employee_id END) as kefarmasian, COUNT(DISTINCT CASE WHEN e.category='tenaga_penunjang_medis' THEN a.employee_id END) as penunjang_medis, COUNT(DISTINCT CASE WHEN e.category='manajemen_administrasi' THEN a.employee_id END) as administrasi, COUNT(DISTINCT CASE WHEN e.category='tenaga_penunjang_non_medis' THEN a.employee_id END) as penunjang_non_medis, COUNT(DISTINCT a.employee_id) as total_present FROM attendance a LEFT JOIN employees e ON a.employee_id=e.id WHERE DATE(a.scan_time) BETWEEN ? AND ? AND a.scan_type='clock_in' GROUP BY DATE(a.scan_time) ORDER BY DATE(a.scan_time)").bind(start,end).all()).results);
});

app.get('/api/reports/dpjp-compliance', async (c) => {
  const db=c.env.DB; const start=c.req.query('start')||new Date(Date.now()-30*86400000).toISOString().split('T')[0]; const end=c.req.query('end')||new Date().toISOString().split('T')[0];
  return c.json((await db.prepare("SELECT e.id, e.name, e.specialization, e.sub_role, COUNT(*) as total_schedules, SUM(CASE WHEN s.status='completed' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN s.status='missed' THEN 1 ELSE 0 END) as missed, SUM(CASE WHEN s.status='scheduled' THEN 1 ELSE 0 END) as scheduled, ROUND(CAST(SUM(CASE WHEN s.status='completed' THEN 1 ELSE 0 END) AS REAL)/COUNT(*)*100,1) as compliance_rate FROM dpjp_schedules s LEFT JOIN employees e ON s.employee_id=e.id WHERE s.schedule_date BETWEEN ? AND ? GROUP BY e.id ORDER BY compliance_rate DESC").bind(start,end).all()).results);
});

app.get('/api/reports/access-summary', async (c) => {
  const date=c.req.query('date')||new Date().toISOString().split('T')[0];
  return c.json((await c.env.DB.prepare("SELECT room_name, COUNT(*) as total, SUM(CASE WHEN access_type='granted' THEN 1 ELSE 0 END) as granted, SUM(CASE WHEN access_type='denied' THEN 1 ELSE 0 END) as denied FROM access_logs WHERE DATE(access_time)=? GROUP BY room_name ORDER BY total DESC").bind(date).all()).results);
});

app.get('/api/reports/sdm-overview', async (c) => {
  return c.json((await c.env.DB.prepare("SELECT e.category, e.employment_type, COUNT(*) as total, SUM(CASE WHEN e.face_registered=1 THEN 1 ELSE 0 END) as face_reg, SUM(CASE WHEN e.finger_registered=1 THEN 1 ELSE 0 END) as finger_reg, SUM(CASE WHEN e.face_registered=1 AND e.finger_registered=1 THEN 1 ELSE 0 END) as both_reg FROM employees e WHERE e.is_active=1 GROUP BY e.category, e.employment_type ORDER BY e.category, e.employment_type").all()).results);
});

// =====================================================
// LOGIN PAGE
// =====================================================
app.get('/login', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="id"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login - Monitoring Biometrik RSSA</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<script>tailwind.config={theme:{extend:{colors:{rssa:{500:'#1e5fa8',600:'#1a5192',700:'#15437c',800:'#103566',900:'#0b2750'}}}}}</script>
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');*{font-family:'Inter',sans-serif}
.login-bg{background:linear-gradient(135deg,#0b2750 0%,#1e5fa8 50%,#103566 100%);min-height:100vh}</style>
</head>
<body class="login-bg flex items-center justify-center p-4">
<div class="w-full max-w-md">
  <div class="text-center mb-6">
    <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm"><i class="fas fa-hospital text-3xl text-white"></i></div>
    <h1 class="text-2xl font-bold text-white">MONITORING Biometrik</h1>
    <p class="text-sm text-blue-200 mt-1">RS dr. Saiful Anwar Malang</p>
  </div>
  <div class="bg-white rounded-2xl shadow-2xl p-8">
    <h2 class="text-lg font-bold text-gray-800 mb-1">Masuk ke Sistem</h2>
    <p class="text-xs text-gray-500 mb-6">Masukkan username dan password Anda</p>
    <div id="error" class="hidden bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700 flex items-center gap-2"><i class="fas fa-exclamation-circle"></i><span id="errorText"></span></div>
    <form onsubmit="doLogin(event)">
      <div class="mb-4">
        <label class="block text-xs font-semibold text-gray-600 mb-1">Username</label>
        <div class="relative"><i class="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input type="text" id="username" class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rssa-500 focus:border-rssa-500 outline-none" placeholder="Masukkan username" required autofocus></div>
      </div>
      <div class="mb-6">
        <label class="block text-xs font-semibold text-gray-600 mb-1">Password</label>
        <div class="relative"><i class="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
        <input type="password" id="password" class="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rssa-500 focus:border-rssa-500 outline-none" placeholder="Masukkan password" required>
        <button type="button" onclick="togglePw()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><i id="pwIcon" class="fas fa-eye text-sm"></i></button></div>
      </div>
      <button type="submit" id="loginBtn" class="w-full bg-gradient-to-r from-rssa-600 to-rssa-800 text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
        <i class="fas fa-sign-in-alt"></i> Masuk
      </button>
    </form>
    <div class="mt-6 pt-4 border-t text-center">
      <p class="text-[10px] text-gray-400">Demo Accounts:</p>
      <div class="grid grid-cols-2 gap-1 mt-1 text-[9px] text-gray-400">
        <span>admin / admin123</span><span>sdm / sdm123</span>
        <span>dept / dept123</span><span>viewer / viewer123</span>
      </div>
    </div>
  </div>
  <div class="text-center mt-4 text-[10px] text-blue-300/60">DIKST UB x RSSA &copy; 2026</div>
</div>
<script>
function togglePw(){const p=document.getElementById('password'),i=document.getElementById('pwIcon');if(p.type==='password'){p.type='text';i.className='fas fa-eye-slash text-sm'}else{p.type='password';i.className='fas fa-eye text-sm'}}
async function doLogin(e){
  e.preventDefault();
  const btn=document.getElementById('loginBtn');btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Memproses...';btn.disabled=true;
  const err=document.getElementById('error');err.classList.add('hidden');
  try{
    const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:document.getElementById('username').value,password:document.getElementById('password').value})});
    const d=await r.json();
    if(d.success){localStorage.setItem('auth_user',JSON.stringify(d.user));window.location.href='/'}
    else{err.classList.remove('hidden');document.getElementById('errorText').textContent=d.error||'Login gagal'}
  }catch(ex){err.classList.remove('hidden');document.getElementById('errorText').textContent='Koneksi gagal'}
  btn.innerHTML='<i class="fas fa-sign-in-alt"></i> Masuk';btn.disabled=false;
}
</script>
</body></html>`);
});

// =====================================================
// MAIN APP (Frontend with CMS + API Management)
// =====================================================
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MONITORING Biometrik - RSSA Malang</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js"></script>
  <script>dayjs.extend(dayjs_plugin_relativeTime)</script>
  <script>tailwind.config={theme:{extend:{colors:{rssa:{50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#1e5fa8',600:'#1a5192',700:'#15437c',800:'#103566',900:'#0b2750'}}}}}</script>
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
    <aside id="sidebar" class="w-64 bg-gradient-to-b from-rssa-800 to-rssa-900 text-white flex flex-col shadow-xl z-30 flex-shrink-0">
      <div class="p-4 border-b border-rssa-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><i class="fas fa-hospital text-xl text-blue-300"></i></div>
          <div><h1 class="font-bold text-sm leading-tight">MONITORING Biometrik</h1><p class="text-[10px] text-blue-300 font-medium">RS Saiful Anwar Malang</p></div>
        </div>
      </div>
      <nav class="flex-1 py-3 overflow-y-auto" id="sidebarNav">
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
        <div id="cmsMenu" class="hidden">
          <div class="px-4 mt-4 mb-1.5 text-[10px] text-yellow-300 font-semibold uppercase tracking-wider"><i class="fas fa-lock mr-1"></i>CMS</div>
          <a href="#" onclick="showPage('cmsEmployees')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="cmsEmployees"><i class="fas fa-user-edit w-5 text-center"></i>Kelola Pegawai</a>
          <a href="#" onclick="showPage('cmsDepts')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="cmsDepts"><i class="fas fa-building w-5 text-center"></i>Kelola Departemen</a>
          <a href="#" onclick="showPage('cmsDevices')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="cmsDevices"><i class="fas fa-tablet-alt w-5 text-center"></i>Kelola Perangkat</a>
          <a href="#" onclick="showPage('cmsSchedules')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="cmsSchedules"><i class="fas fa-calendar-alt w-5 text-center"></i>Kelola Jadwal</a>
        </div>
        <div id="adminMenu" class="hidden">
          <div class="px-4 mt-4 mb-1.5 text-[10px] text-red-300 font-semibold uppercase tracking-wider"><i class="fas fa-shield-alt mr-1"></i>Admin</div>
          <a href="#" onclick="showPage('cmsUsers')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="cmsUsers"><i class="fas fa-user-shield w-5 text-center"></i>User Admin</a>
          <a href="#" onclick="showPage('apiKeys')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="apiKeys"><i class="fas fa-key w-5 text-center"></i>API Keys</a>
          <a href="#" onclick="showPage('apiLogs')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="apiLogs"><i class="fas fa-stream w-5 text-center"></i>API Logs</a>
          <a href="#" onclick="showPage('webhooks')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="webhooks"><i class="fas fa-bolt w-5 text-center"></i>Webhooks</a>
          <a href="#" onclick="showPage('auditLogs')" class="sidebar-link flex items-center gap-3 px-5 py-2 text-sm" data-page="auditLogs"><i class="fas fa-history w-5 text-center"></i>Audit Log</a>
        </div>
      </nav>
      <div class="p-3 border-t border-rssa-700">
        <div id="userInfo" class="hidden mb-2">
          <div class="flex items-center gap-2 cursor-pointer" onclick="toggleUserMenu()">
            <div id="userAvatar" class="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
            <div class="flex-1 min-w-0"><div id="userName" class="text-xs font-medium text-white truncate">Admin</div><div id="userRole" class="text-[9px] text-blue-300">Super Admin</div></div>
            <i class="fas fa-ellipsis-v text-blue-300 text-xs"></i>
          </div>
          <div id="userMenu" class="hidden mt-2 bg-rssa-700/50 rounded-lg p-2">
            <button onclick="doLogout()" class="w-full text-left px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 rounded flex items-center gap-2"><i class="fas fa-sign-out-alt w-4"></i>Keluar</button>
          </div>
        </div>
        <div class="flex items-center gap-2 text-xs text-blue-300"><div class="w-2 h-2 bg-green-400 rounded-full pulse-dot"></div><span>Sistem Online</span></div>
        <div class="mt-1 text-[10px] opacity-75 text-blue-300">DIKST UB x RSSA &copy; 2026</div>
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
          <button id="loginBtn" onclick="window.location.href='/login'" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600 flex items-center gap-1"><i class="fas fa-sign-in-alt"></i>Login</button>
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
</html>`);
});

export default app
