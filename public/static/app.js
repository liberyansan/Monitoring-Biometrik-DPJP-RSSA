// =====================================================
// RSSA Biometric Monitoring System - Frontend v3
// 7 Kategori SDM RS Saiful Anwar Malang
// Enhanced: SDM Overview, DPJP Dual-Role, Farmasi, PPDS
// =====================================================
let charts = {};

const CAT_LABELS = {
  tenaga_medis: 'Tenaga Medis',
  tenaga_pendidikan: 'Tenaga Pendidikan',
  tenaga_keperawatan: 'Tenaga Keperawatan',
  tenaga_kefarmasian: 'Tenaga Kefarmasian',
  tenaga_penunjang_medis: 'Penunjang Medis',
  manajemen_administrasi: 'Manajemen & Admin',
  tenaga_penunjang_non_medis: 'Penunjang Non-Medis'
};
const CAT_COLORS = {
  tenaga_medis: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', hex: '#3b82f6', border: 'border-blue-500' },
  tenaga_pendidikan: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', hex: '#8b5cf6', border: 'border-purple-500' },
  tenaga_keperawatan: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', hex: '#22c55e', border: 'border-green-500' },
  tenaga_kefarmasian: { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50', hex: '#f59e0b', border: 'border-amber-500' },
  tenaga_penunjang_medis: { bg: 'bg-cyan-500', text: 'text-cyan-700', light: 'bg-cyan-50', hex: '#06b6d4', border: 'border-cyan-500' },
  manajemen_administrasi: { bg: 'bg-slate-500', text: 'text-slate-700', light: 'bg-slate-50', hex: '#64748b', border: 'border-slate-500' },
  tenaga_penunjang_non_medis: { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', hex: '#f97316', border: 'border-orange-500' }
};
const CAT_ICONS = {
  tenaga_medis: 'fa-user-md', tenaga_pendidikan: 'fa-graduation-cap', tenaga_keperawatan: 'fa-heartbeat',
  tenaga_kefarmasian: 'fa-pills', tenaga_penunjang_medis: 'fa-x-ray', manajemen_administrasi: 'fa-building',
  tenaga_penunjang_non_medis: 'fa-hard-hat'
};
const SUB_ROLE_LABELS = {
  dpjp_konsultan: 'DPJP Konsultan', dpjp_spesialis: 'DPJP Spesialis', dokter_umum: 'Dokter Umum', dokter_gigi_spesialis: 'Dokter Gigi Sp.',
  ppds_residen: 'PPDS Residen', fellow: 'Fellow', co_ass: 'Co-Ass',
  perawat_icu: 'Perawat ICU', perawat_iccu: 'Perawat ICCU', perawat_nicu: 'Perawat NICU',
  perawat_igd: 'Perawat IGD', perawat_ok: 'Perawat OK', perawat_anestesi: 'Perawat Anestesi',
  perawat_klinis: 'Perawat Klinis', bidan: 'Bidan',
  apoteker: 'Apoteker', ttk: 'TTK', asisten_apoteker: 'Asisten Apoteker',
  radiografer: 'Radiografer', analis_lab: 'Analis Lab', fisioterapis: 'Fisioterapis', ahli_gizi: 'Ahli Gizi', perekam_medis: 'Perekam Medis',
  direksi: 'Direksi', staff_sdm: 'Staff SDM', staff_it: 'Staff IT', staff_keuangan: 'Staff Keuangan', staff_admisi: 'Staff Admisi',
  security: 'Security', driver_ambulans: 'Driver Ambulans', teknisi: 'Teknisi', petugas_cssd: 'CSSD', petugas_laundry: 'Laundry', cleaning_service: 'Cleaning'
};
const EMP_TYPE_LABELS = { pns: 'PNS', pppk: 'PPPK', kontrak: 'Kontrak', outsource: 'Outsource', mitra: 'Mitra' };

// Utilities
const fmt = (d) => d ? dayjs(d).format('HH:mm') : '-';
const fmtDT = (d) => d ? dayjs(d).format('DD/MM/YY HH:mm') : '-';
const fmtDate = (d) => d ? dayjs(d).format('DD/MM/YYYY') : '-';
async function api(path) { return (await fetch(path)).json(); }

function catBadge(cat) {
  const c = CAT_COLORS[cat] || { light: 'bg-gray-50', text: 'text-gray-700' };
  return `<span class="badge ${c.light} ${c.text}">${CAT_LABELS[cat] || cat || '-'}</span>`;
}
function roleBadge(role) {
  const m = { dpjp:'bg-blue-100 text-blue-800', dokter_umum:'bg-sky-100 text-sky-800', dokter_gigi:'bg-indigo-100 text-indigo-800',
    ppds:'bg-purple-100 text-purple-800', fellow:'bg-violet-100 text-violet-800', co_ass:'bg-fuchsia-100 text-fuchsia-800',
    perawat:'bg-green-100 text-green-800', bidan:'bg-emerald-100 text-emerald-800',
    apoteker:'bg-amber-100 text-amber-800', ttk:'bg-yellow-100 text-yellow-800',
    radiografer:'bg-cyan-100 text-cyan-800', analis_lab:'bg-teal-100 text-teal-800',
    fisioterapis:'bg-lime-100 text-lime-800', ahli_gizi:'bg-green-100 text-green-800',
    perekam_medis:'bg-slate-100 text-slate-700',
    direksi:'bg-rose-100 text-rose-800', staff_admin:'bg-gray-100 text-gray-700', staff_it:'bg-sky-100 text-sky-700',
    security:'bg-orange-100 text-orange-800', driver:'bg-amber-100 text-amber-700',
    teknisi:'bg-stone-100 text-stone-700', cssd:'bg-zinc-100 text-zinc-700',
    cleaning:'bg-neutral-100 text-neutral-600', laundry:'bg-stone-100 text-stone-600'
  };
  return `<span class="badge ${m[role] || 'bg-gray-100 text-gray-700'}">${(role||'-').replace(/_/g,' ').toUpperCase()}</span>`;
}
function statusBadge(s) {
  const m = { completed:'bg-green-100 text-green-700', scheduled:'bg-blue-100 text-blue-700', missed:'bg-red-100 text-red-700',
    absent:'bg-red-100 text-red-700', verified:'bg-green-100 text-green-700',
    granted:'bg-green-100 text-green-700', denied:'bg-red-100 text-red-700',
    active:'bg-green-100 text-green-700', inactive:'bg-gray-100 text-gray-600', maintenance:'bg-yellow-100 text-yellow-700' };
  const labels = { completed:'Selesai', scheduled:'Terjadwal', missed:'Tidak Hadir', absent:'Absen', verified:'Terverifikasi',
    granted:'Diizinkan', denied:'Ditolak', active:'Aktif', inactive:'Nonaktif', maintenance:'Maintenance' };
  return `<span class="badge ${m[s] || 'bg-gray-100 text-gray-700'}">${labels[s] || s || '-'}</span>`;
}
function methodIcon(m) {
  if (m==='face') return '<i class="fas fa-smile text-blue-500" title="Face Recognition"></i>';
  if (m==='fingerprint') return '<i class="fas fa-fingerprint text-purple-500" title="Fingerprint"></i>';
  return '<i class="fas fa-keyboard text-gray-400"></i>';
}
function actLabel(t) {
  return { visite:'Visite', operasi:'Operasi', poliklinik:'Poliklinik', tindakan:'Tindakan', konsul:'Konsultasi', jaga:'Jaga/On-Call' }[t] || t;
}
function confBar(score) {
  if (!score) return '<span class="text-xs text-gray-400">-</span>';
  const color = score >= 95 ? 'bg-green-500' : score >= 85 ? 'bg-yellow-500' : 'bg-red-500';
  return `<div class="flex items-center gap-1.5"><div class="w-14 h-1.5 bg-gray-200 rounded-full"><div class="h-full rounded-full ${color}" style="width:${score}%"></div></div><span class="text-[10px] text-gray-500">${score.toFixed(0)}%</span></div>`;
}
function priLabel(p) {
  return {1:'P1',2:'P2',3:'P3',4:'P4'}[p] || '-';
}
function priColor(p) {
  return {1:'bg-red-100 text-red-700',2:'bg-amber-100 text-amber-700',3:'bg-blue-100 text-blue-700',4:'bg-gray-100 text-gray-500'}[p] || 'bg-gray-100 text-gray-500';
}
function empTypeBadge(t) {
  const m = { pns:'bg-blue-100 text-blue-700', pppk:'bg-cyan-100 text-cyan-700', kontrak:'bg-amber-100 text-amber-700', outsource:'bg-orange-100 text-orange-700', mitra:'bg-purple-100 text-purple-700' };
  return `<span class="badge ${m[t] || 'bg-gray-100 text-gray-600'}">${(EMP_TYPE_LABELS[t]||t||'-').toUpperCase()}</span>`;
}
function progressRing(pct, color='rssa-500') {
  return `<div class="relative inline-flex items-center justify-center w-14 h-14">
    <svg class="w-14 h-14 -rotate-90"><circle cx="28" cy="28" r="24" stroke="#e5e7eb" stroke-width="4" fill="none"/>
    <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="${2*Math.PI*24}" stroke-dashoffset="${2*Math.PI*24*(1-pct/100)}" class="text-${color}"/></svg>
    <span class="absolute text-xs font-bold">${pct}%</span></div>`;
}

// Auth state
let currentUser = null;

// Navigation
const PAGES = {
  dashboard: ['Dashboard', 'Monitoring real-time seluruh SDM RSSA'],
  sdmOverview: ['Overview SDM', 'Ringkasan seluruh kategori SDM RS Saiful Anwar'],
  staffing: ['Staffing Monitor', 'Monitoring ketersediaan SDM area kritis'],
  dpjp: ['Monitoring DPJP', 'Jadwal, kehadiran & peran ganda DPJP'],
  pendidikan: ['Monitoring Pendidikan', 'PPDS, Fellow, dan Co-Ass'],
  keperawatan: ['Monitoring Keperawatan', 'Shift perawat, bidan, dan tenaga keperawatan'],
  farmasi: ['Monitoring Kefarmasian', 'Apoteker, TTK, dan distribusi farmasi'],
  attendance: ['Kehadiran Pegawai', 'Data absensi biometrik seluruh pegawai'],
  employees: ['Data Pegawai', 'Database SDM 7 kategori'],
  access: ['Log Akses Ruangan', 'Audit akses ruangan terbatas'],
  devices: ['Perangkat Biometrik', 'Status perangkat biometrik'],
  reports: ['Laporan & Analitik', 'Analisis kehadiran dan kinerja'],
  cmsEmployees: ['Kelola Pegawai', 'CRUD data pegawai & import CSV'],
  cmsDepts: ['Kelola Departemen', 'CRUD data departemen'],
  cmsDevices: ['Kelola Perangkat', 'CRUD perangkat biometrik'],
  cmsSchedules: ['Kelola Jadwal', 'CRUD jadwal DPJP, shift, rotasi'],
  cmsUsers: ['User Admin', 'Manajemen user admin sistem'],
  apiKeys: ['API Keys', 'Manajemen API Key perangkat biometrik'],
  apiLogs: ['API Logs', 'Log request API dari perangkat'],
  webhooks: ['Webhooks', 'Konfigurasi webhook & integrasi SIMRS'],
  auditLogs: ['Audit Log', 'Riwayat perubahan data CMS'],
};

function showPage(page) {
  // CMS/Admin pages require auth
  const cmsPages = ['cmsEmployees','cmsDepts','cmsDevices','cmsSchedules','cmsUsers','apiKeys','apiLogs','webhooks','auditLogs'];
  if (cmsPages.includes(page) && !currentUser) { window.location.href = '/login'; return; }

  document.querySelectorAll('.sidebar-link').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  document.getElementById('pageTitle').textContent = PAGES[page]?.[0] || page;
  document.getElementById('pageSubtitle').textContent = PAGES[page]?.[1] || '';
  const ct = document.getElementById('content');
  ct.innerHTML = '<div class="flex items-center justify-center h-64"><i class="fas fa-spinner fa-spin text-3xl text-rssa-500"></i></div>';
  Object.values(charts).forEach(ch => { try { ch.destroy() } catch(e){} }); charts = {};
  const loaders = { dashboard: loadDashboard, sdmOverview: loadSDMOverview, staffing: loadStaffing, dpjp: loadDPJP, pendidikan: loadPendidikan, keperawatan: loadKeperawatan, farmasi: loadFarmasi, attendance: loadAttendance, employees: loadEmployees, access: loadAccessLogs, devices: loadDevices, reports: loadReports, cmsEmployees: loadCMSEmployees, cmsDepts: loadCMSDepts, cmsDevices: loadCMSDevices, cmsSchedules: loadCMSSchedules, cmsUsers: loadCMSUsers, apiKeys: loadAPIKeys, apiLogs: loadAPILogs, webhooks: loadWebhooks, auditLogs: loadAuditLogs };
  if (loaders[page]) loaders[page]();
}

// =====================================================
// DASHBOARD
// =====================================================
async function loadDashboard() {
  const [stats, catAtt, feed] = await Promise.all([api('/api/dashboard/stats'), api('/api/dashboard/category-attendance'), api('/api/dashboard/live-feed')]);
  const ct = document.getElementById('content');
  const attPct = stats.totalEmployees > 0 ? Math.round(stats.todayAttendance / stats.totalEmployees * 100) : 0;
  const compPct = stats.schedulesToday > 0 ? Math.round(stats.completedSchedules / stats.schedulesToday * 100) : 0;

  const catCards = catAtt.map(ca => {
    const c = CAT_COLORS[ca.category] || { bg:'bg-gray-500', hex:'#999', light:'bg-gray-50', text:'text-gray-700' };
    const icon = CAT_ICONS[ca.category] || 'fa-user';
    const pct = ca.total_employees > 0 ? Math.round(ca.present / ca.total_employees * 100) : 0;
    return `<div class="card bg-white rounded-xl p-3 border border-gray-100 cursor-pointer" onclick="showPage('sdmOverview')">
      <div class="flex items-center gap-2 mb-2">
        <div class="w-7 h-7 ${c.light} rounded-lg flex items-center justify-center"><i class="fas ${icon} ${c.text} text-xs"></i></div>
        <span class="text-[10px] font-semibold text-gray-500 truncate">${CAT_LABELS[ca.category] || ca.category}</span>
      </div>
      <div class="flex items-end justify-between">
        <div><span class="text-lg font-bold ${c.text}">${ca.present}</span><span class="text-[10px] text-gray-400">/${ca.total_employees}</span></div>
        <div class="text-right"><div class="w-14 h-1.5 bg-gray-200 rounded-full mb-0.5"><div class="h-full rounded-full ${c.bg}" style="width:${pct}%"></div></div><span class="text-[9px] text-gray-400">${pct}%</span></div>
      </div>
    </div>`;
  }).join('');

  ct.innerHTML = `<div class="fade-in">
    <!-- Top Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
      <div class="card bg-white rounded-xl p-4 border"><div class="flex items-center justify-between mb-1"><div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><i class="fas fa-users text-blue-500 text-sm"></i></div></div><div class="text-2xl font-bold text-gray-800">${stats.totalEmployees}</div><div class="text-[10px] text-gray-500">Total Pegawai</div></div>
      <div class="card bg-white rounded-xl p-4 border"><div class="flex items-center justify-between mb-1"><div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><i class="fas fa-user-check text-green-500 text-sm"></i></div><span class="text-[10px] font-bold ${attPct>=80?'text-green-600':attPct>=60?'text-yellow-600':'text-red-600'}">${attPct}%</span></div><div class="text-2xl font-bold text-gray-800">${stats.todayAttendance}</div><div class="text-[10px] text-gray-500">Hadir Hari Ini</div></div>
      <div class="card bg-white rounded-xl p-4 border"><div class="flex items-center justify-between mb-1"><div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center"><i class="fas fa-user-md text-indigo-500 text-sm"></i></div></div><div class="text-2xl font-bold text-gray-800">${stats.totalDPJP}</div><div class="text-[10px] text-gray-500">DPJP Aktif</div></div>
      <div class="card bg-white rounded-xl p-4 border"><div class="flex items-center justify-between mb-1"><div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center"><i class="fas fa-graduation-cap text-purple-500 text-sm"></i></div></div><div class="text-2xl font-bold text-gray-800">${stats.totalPPDS}</div><div class="text-[10px] text-gray-500">Tenaga Pendidikan</div></div>
      <div class="card bg-white rounded-xl p-4 border"><div class="flex items-center justify-between mb-1"><div class="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center"><i class="fas fa-calendar-check text-teal-500 text-sm"></i></div><span class="text-[10px] font-bold ${compPct>=80?'text-green-600':'text-amber-600'}">${compPct}%</span></div><div class="text-2xl font-bold text-gray-800">${stats.completedSchedules}/${stats.schedulesToday}</div><div class="text-[10px] text-gray-500">DPJP Compliance</div></div>
      <div class="card bg-white rounded-xl p-4 border"><div class="flex items-center justify-between mb-1"><div class="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center"><i class="fas fa-shield-alt text-red-500 text-sm"></i></div></div><div class="text-2xl font-bold text-gray-800">${stats.accessDenied}</div><div class="text-[10px] text-gray-500">Akses Ditolak</div></div>
    </div>
    <!-- Category Cards -->
    <h3 class="font-semibold text-gray-700 mb-2 text-sm"><i class="fas fa-layer-group text-rssa-500 mr-1"></i> Kehadiran per Kategori SDM</h3>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 mb-5">${catCards}</div>
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <!-- Live Feed -->
      <div class="lg:col-span-3 bg-white rounded-xl border overflow-hidden">
        <div class="px-4 py-2.5 border-b flex items-center justify-between">
          <div class="flex items-center gap-2"><div class="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div><h3 class="font-semibold text-gray-800 text-sm">Aktivitas Terkini</h3></div>
          <span class="text-[10px] text-gray-400">Real-time</span>
        </div>
        <div class="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
          ${feed.map(a => `<div class="px-3 py-2 flex items-center gap-2.5 hover:bg-gray-50 cursor-pointer" onclick="showEmployeeDetail(${a.employee_id})">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${a.scan_type==='clock_in'?'bg-green-50 text-green-500':a.scan_type==='clock_out'?'bg-orange-50 text-orange-500':'bg-blue-50 text-blue-500'}">
              <i class="fas ${a.scan_type==='clock_in'?'fa-sign-in-alt':a.scan_type==='clock_out'?'fa-sign-out-alt':'fa-door-open'}"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1"><span class="text-xs font-medium text-gray-800 truncate">${a.employee_name||'Unknown'}</span>${catBadge(a.category)}</div>
              <div class="text-[10px] text-gray-400 truncate">${a.department_name||''} &middot; ${a.method==='face'?'Face':'Finger'} ${a.confidence_score?a.confidence_score.toFixed(0)+'%':''}</div>
            </div>
            <div class="text-[10px] text-gray-400 flex-shrink-0">${fmt(a.scan_time)}</div>
          </div>`).join('')}
        </div>
      </div>
      <!-- Charts -->
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white rounded-xl border p-4"><h3 class="font-semibold text-gray-800 text-sm mb-2">Distribusi SDM</h3><canvas id="catChart" height="200"></canvas></div>
        <div class="bg-white rounded-xl border p-4"><h3 class="font-semibold text-gray-800 text-sm mb-2">Metode Biometrik</h3><canvas id="methodChart" height="150"></canvas></div>
      </div>
    </div>
  </div>`;

  // Charts
  const ctx1 = document.getElementById('catChart');
  if (ctx1) {
    charts.cat = new Chart(ctx1, {
      type: 'bar', data: {
        labels: catAtt.map(c => (CAT_LABELS[c.category]||c.category).split(' ').slice(0,2).join(' ')),
        datasets: [
          { label: 'Hadir', data: catAtt.map(c => c.present), backgroundColor: catAtt.map(c => (CAT_COLORS[c.category]||{hex:'#999'}).hex), borderRadius: 4 },
          { label: 'Tidak Hadir', data: catAtt.map(c => c.total_employees - c.present), backgroundColor: '#e2e8f0', borderRadius: 4 }
        ]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { stacked: true, ticks: { font: { size: 8 } } }, y: { stacked: true, beginAtZero: true } } }
    });
  }
  const ctx2 = document.getElementById('methodChart');
  if (ctx2) {
    const fc = feed.filter(a => a.method==='face').length, fp = feed.filter(a => a.method==='fingerprint').length;
    charts.method = new Chart(ctx2, {
      type: 'doughnut', data: { labels: ['Face Recognition','Fingerprint'], datasets: [{ data: [fc, fp], backgroundColor: ['#3b82f6','#8b5cf6'], borderWidth: 0 }] },
      options: { responsive: true, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }
    });
  }
}

// =====================================================
// SDM OVERVIEW
// =====================================================
async function loadSDMOverview() {
  const [sdm, catAtt, depts] = await Promise.all([api('/api/sdm/summary'), api('/api/dashboard/category-attendance'), api('/api/departments')]);
  const ct = document.getElementById('content');

  // Aggregate by category
  const catData = {};
  for (const r of sdm.attendance) {
    if (!catData[r.category]) catData[r.category] = { total: 0, present: 0, subRoles: {} };
    catData[r.category].total += r.total;
    catData[r.category].present += r.present;
    if (!catData[r.category].subRoles[r.sub_role]) catData[r.category].subRoles[r.sub_role] = { total: r.total, present: r.present };
    else { catData[r.category].subRoles[r.sub_role].total += r.total; catData[r.category].subRoles[r.sub_role].present += r.present; }
  }

  // Biometric stats
  const bioMap = {};
  for (const b of sdm.biometricStats) bioMap[b.category] = b;

  const catOrder = ['tenaga_medis','tenaga_pendidikan','tenaga_keperawatan','tenaga_kefarmasian','tenaga_penunjang_medis','manajemen_administrasi','tenaga_penunjang_non_medis'];

  ct.innerHTML = `<div class="fade-in">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      <div class="bg-white rounded-xl border p-4"><h3 class="font-semibold text-gray-800 text-sm mb-3"><i class="fas fa-chart-pie text-rssa-500 mr-1"></i> Distribusi SDM per Kategori</h3><canvas id="sdmPieChart" height="220"></canvas></div>
      <div class="bg-white rounded-xl border p-4"><h3 class="font-semibold text-gray-800 text-sm mb-3"><i class="fas fa-fingerprint text-rssa-500 mr-1"></i> Status Registrasi Biometrik</h3><canvas id="biometricChart" height="220"></canvas></div>
    </div>
    <h3 class="font-semibold text-gray-700 text-sm mb-3"><i class="fas fa-sitemap text-rssa-500 mr-1"></i> Detail per Kategori SDM</h3>
    <div class="space-y-3">
      ${catOrder.map(cat => {
        const c = CAT_COLORS[cat] || {};
        const data = catData[cat] || { total: 0, present: 0, subRoles: {} };
        const bio = bioMap[cat] || { face_registered: 0, finger_registered: 0, both_registered: 0, total: 0 };
        const pct = data.total > 0 ? Math.round(data.present / data.total * 100) : 0;
        const bioPct = bio.total > 0 ? Math.round(bio.both_registered / bio.total * 100) : 0;
        return `<div class="bg-white rounded-xl border overflow-hidden">
          <div class="px-4 py-3 border-b flex items-center justify-between cursor-pointer" onclick="this.nextElementSibling.classList.toggle('hidden')">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 ${c.light||'bg-gray-50'} rounded-lg flex items-center justify-center"><i class="fas ${CAT_ICONS[cat]||'fa-user'} ${c.text||'text-gray-500'} text-sm"></i></div>
              <div>
                <div class="font-semibold text-gray-800 text-sm">${CAT_LABELS[cat]}</div>
                <div class="text-[10px] text-gray-400">${data.total} pegawai &middot; ${Object.keys(data.subRoles).length} sub-role</div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="flex items-center gap-2"><span class="text-xs font-bold ${pct>=80?'text-green-600':pct>=60?'text-amber-600':'text-red-600'}">${data.present}/${data.total} hadir</span>
                <div class="w-20 h-1.5 bg-gray-200 rounded-full"><div class="h-full rounded-full ${c.bg||'bg-gray-400'}" style="width:${pct}%"></div></div></div>
              </div>
              <div class="text-right">
                <div class="flex items-center gap-2"><span class="text-[10px] text-gray-400">Biometrik:</span><span class="text-xs font-bold ${bioPct>=80?'text-green-600':'text-amber-600'}">${bioPct}%</span></div>
              </div>
              <i class="fas fa-chevron-down text-gray-400 text-xs"></i>
            </div>
          </div>
          <div class="hidden">
            <table class="w-full"><thead class="bg-gray-50"><tr>
              <th class="px-4 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Sub-Role</th>
              <th class="px-4 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Jumlah</th>
              <th class="px-4 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Hadir</th>
              <th class="px-4 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">%</th>
            </tr></thead><tbody class="divide-y divide-gray-50">
              ${Object.entries(data.subRoles).map(([sr, v]) => {
                const srPct = v.total > 0 ? Math.round(v.present / v.total * 100) : 0;
                return `<tr class="table-row">
                  <td class="px-4 py-2 text-sm text-gray-700">${SUB_ROLE_LABELS[sr]||sr}</td>
                  <td class="px-4 py-2 text-sm text-center font-medium">${v.total}</td>
                  <td class="px-4 py-2 text-sm text-center font-medium ${srPct>=80?'text-green-600':srPct>=60?'text-amber-600':'text-red-600'}">${v.present}</td>
                  <td class="px-4 py-2 text-center"><div class="flex items-center justify-center gap-1"><div class="w-12 h-1.5 bg-gray-200 rounded-full"><div class="h-full rounded-full ${c.bg||'bg-gray-400'}" style="width:${srPct}%"></div></div><span class="text-[10px]">${srPct}%</span></div></td>
                </tr>`;
              }).join('')}
            </tbody></table>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;

  // Charts
  const ctx1 = document.getElementById('sdmPieChart');
  if (ctx1) {
    charts.sdmPie = new Chart(ctx1, {
      type: 'doughnut', data: {
        labels: catOrder.map(c => CAT_LABELS[c]),
        datasets: [{ data: catOrder.map(c => catData[c]?.total||0), backgroundColor: catOrder.map(c => CAT_COLORS[c]?.hex||'#999'), borderWidth: 0 }]
      },
      options: { responsive: true, cutout: '55%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 9 }, padding: 8 } } } }
    });
  }
  const ctx2 = document.getElementById('biometricChart');
  if (ctx2) {
    charts.bio = new Chart(ctx2, {
      type: 'bar', data: {
        labels: catOrder.map(c => (CAT_LABELS[c]||'').split(' ')[0]),
        datasets: [
          { label: 'Face', data: catOrder.map(c => bioMap[c]?.face_registered||0), backgroundColor: '#3b82f6', borderRadius: 3 },
          { label: 'Finger', data: catOrder.map(c => bioMap[c]?.finger_registered||0), backgroundColor: '#8b5cf6', borderRadius: 3 },
          { label: 'Belum', data: catOrder.map(c => { const b = bioMap[c]; return b ? b.total - b.both_registered : 0; }), backgroundColor: '#e2e8f0', borderRadius: 3 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }, scales: { x: { ticks: { font: { size: 8 } } }, y: { beginAtZero: true } } }
    });
  }
}

// =====================================================
// STAFFING MONITOR
// =====================================================
async function loadStaffing() {
  const data = await api('/api/staffing/monitor');
  const ct = document.getElementById('content');
  const understaffed = data.filter(d => d.is_understaffed);
  const shift = data[0]?.current_shift || 'pagi';

  ct.innerHTML = `<div class="fade-in">
    ${understaffed.length > 0 ? `<div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
      <i class="fas fa-exclamation-triangle text-red-500 text-lg mt-0.5"></i>
      <div><h4 class="font-semibold text-red-800 text-sm">Peringatan Kekurangan SDM!</h4>
        <p class="text-xs text-red-600 mt-1">${understaffed.length} area membutuhkan penambahan tenaga pada shift <strong>${shift}</strong>:</p>
        <ul class="mt-1.5 space-y-0.5">${understaffed.map(u => `<li class="text-xs text-red-700">&bull; <strong>${u.department_name}</strong> - ${CAT_LABELS[u.category]||u.category}: ${u.actual_count}/${u.min_count} (min)</li>`).join('')}</ul>
      </div>
    </div>` : `<div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center gap-3">
      <i class="fas fa-check-circle text-green-500 text-lg"></i>
      <div><h4 class="font-semibold text-green-800 text-sm">Staffing Memadai</h4><p class="text-xs text-green-600">Semua area kritis tercukupi pada shift <strong>${shift}</strong>.</p></div>
    </div>`}
    <div class="bg-white rounded-xl border overflow-hidden">
      <div class="px-4 py-2.5 border-b"><h3 class="font-semibold text-gray-800 text-sm"><i class="fas fa-hospital-user text-rssa-500 mr-1"></i> Kebutuhan Staffing - Shift ${shift.charAt(0).toUpperCase()+shift.slice(1)}</h3></div>
      <div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-4 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Unit</th>
        <th class="px-4 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Kategori SDM</th>
        <th class="px-4 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Min</th>
        <th class="px-4 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Ideal</th>
        <th class="px-4 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Hadir</th>
        <th class="px-4 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Status</th>
        <th class="px-4 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Ket</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${data.map(d => `<tr class="table-row ${d.is_understaffed ? 'bg-red-50/50' : ''}">
          <td class="px-4 py-2"><div class="flex items-center gap-1.5">${d.is_critical ? '<i class="fas fa-exclamation-circle text-red-400 text-[10px]"></i>' : ''}<span class="text-sm font-medium text-gray-800">${d.department_name}</span></div></td>
          <td class="px-4 py-2">${catBadge(d.category)}</td>
          <td class="px-4 py-2 text-center text-sm font-medium text-gray-700">${d.min_count}</td>
          <td class="px-4 py-2 text-center text-sm text-gray-500">${d.ideal_count || '-'}</td>
          <td class="px-4 py-2 text-center text-sm font-bold ${d.is_understaffed ? 'text-red-600' : 'text-green-600'}">${d.actual_count}</td>
          <td class="px-4 py-2 text-center">${d.is_understaffed ? '<span class="badge bg-red-100 text-red-700"><i class="fas fa-times mr-0.5"></i>Kurang</span>' : '<span class="badge bg-green-100 text-green-700"><i class="fas fa-check mr-0.5"></i>OK</span>'}</td>
          <td class="px-4 py-2 text-[10px] text-gray-400">${d.notes||''}</td>
        </tr>`).join('')}
      </tbody></table></div>
    </div>
  </div>`;
}

// =====================================================
// DPJP MONITORING (with Dual-Role)
// =====================================================
async function loadDPJP() {
  const today = new Date().toISOString().split('T')[0];
  const [data, dpjpList] = await Promise.all([api(`/api/dpjp/monitoring?date=${today}`), api('/api/employees?role=dpjp')]);
  const ct = document.getElementById('content');
  const s = data.summary;
  const compColor = s.complianceRate >= 80 ? 'green' : s.complianceRate >= 60 ? 'amber' : 'red';

  ct.innerHTML = `<div class="fade-in">
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-gray-800">${s.total}</div><div class="text-[10px] text-gray-500">Total Jadwal</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-green-600">${s.completed}</div><div class="text-[10px] text-gray-500">Selesai</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-blue-600">${s.scheduled}</div><div class="text-[10px] text-gray-500">Terjadwal</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-red-600">${s.missed}</div><div class="text-[10px] text-gray-500">Tidak Hadir</div></div>
      <div class="card bg-gradient-to-r from-${compColor}-500 to-${compColor}-600 rounded-xl p-3 text-white text-center"><div class="text-xl font-bold">${s.complianceRate}%</div><div class="text-[10px] opacity-90">Compliance</div></div>
    </div>
    <!-- DPJP Profile Cards -->
    <h3 class="font-semibold text-gray-700 text-sm mb-2"><i class="fas fa-user-md text-rssa-500 mr-1"></i> Profil DPJP (Dual-Role: Klinis + Pendidikan)</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5" id="dpjpCards">
      ${dpjpList.map(d => `<div class="card bg-white rounded-xl border p-3 cursor-pointer border-l-4 border-l-blue-500" onclick="showDPJPProfile(${d.id})">
        <div class="flex items-start gap-2 mb-2">
          <div class="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">${(d.name||'?').charAt(4)}</div>
          <div class="flex-1 min-w-0"><div class="font-semibold text-gray-800 text-sm truncate">${d.name}</div><div class="text-[10px] text-gray-400 truncate">${d.specialization||'-'} &middot; ${SUB_ROLE_LABELS[d.sub_role]||d.sub_role}</div></div>
        </div>
        <div class="flex items-center gap-2 text-[10px]">
          <span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700"><i class="fas fa-stethoscope mr-0.5"></i>Klinis</span>
          <span class="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700"><i class="fas fa-chalkboard-teacher mr-0.5"></i>Pendidikan</span>
          <span class="px-1.5 py-0.5 rounded bg-gray-50 text-gray-500">${d.department_name}</span>
        </div>
      </div>`).join('')}
    </div>
    <!-- Schedule Table -->
    <div class="bg-white rounded-xl border p-3 mb-3 flex items-center gap-3">
      <label class="text-xs text-gray-600 font-medium">Tanggal:</label>
      <input type="date" value="${today}" onchange="reloadDPJP(this.value)" class="border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rssa-500">
    </div>
    <div class="bg-white rounded-xl border overflow-hidden"><div class="overflow-x-auto">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Dokter</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Spesialisasi</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Aktivitas</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Unit</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Jadwal</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Clock In</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Pasien</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Status</th>
      </tr></thead><tbody id="dpjpBody" class="divide-y divide-gray-50">${renderDPJPRows(data.schedules)}</tbody></table>
    </div></div>
  </div>`;
}

function renderDPJPRows(rows) {
  return rows.map(s => `<tr class="table-row cursor-pointer" onclick="showEmployeeDetail(${s.employee_id})">
    <td class="px-3 py-2"><div class="flex items-center gap-2"><div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-[10px] font-bold">${(s.doctor_name||'?').charAt(4)}</div><div><div class="text-xs font-medium text-gray-800">${s.doctor_name||'-'}</div><div class="text-[9px] text-gray-400">${s.nip||''}</div></div></div></td>
    <td class="px-3 py-2 text-[10px] text-gray-600">${s.specialization||'-'}</td>
    <td class="px-3 py-2"><span class="badge bg-indigo-50 text-indigo-700">${actLabel(s.activity_type)}</span></td>
    <td class="px-3 py-2 text-[10px] text-gray-600">${s.department_name||'-'}</td>
    <td class="px-3 py-2 text-xs font-mono text-gray-700">${s.start_time}-${s.end_time}</td>
    <td class="px-3 py-2 text-xs ${s.actual_clock_in?'text-green-600 font-medium':'text-red-500'}">${s.actual_clock_in?fmt(s.actual_clock_in):'<i class="fas fa-times-circle"></i>'}</td>
    <td class="px-3 py-2 text-xs text-center text-gray-700">${s.patient_count||0}</td>
    <td class="px-3 py-2">${statusBadge(s.status)}</td>
  </tr>`).join('');
}
async function reloadDPJP(date) { const d = await api(`/api/dpjp/monitoring?date=${date}`); document.getElementById('dpjpBody').innerHTML = renderDPJPRows(d.schedules); }

// DPJP Profile Modal (Dual Role)
async function showDPJPProfile(id) {
  const modal = document.getElementById('modal');
  const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = '<div class="p-10 text-center"><i class="fas fa-spinner fa-spin text-2xl text-rssa-500"></i></div>';
  const d = await api(`/api/dpjp/${id}/profile`);
  const dp = d.dpjp;
  const totalSched = d.scheduleHistory.reduce((a,b) => a + b.total, 0);
  const totalCompleted = d.scheduleHistory.reduce((a,b) => a + b.completed, 0);
  const totalMissed = d.scheduleHistory.reduce((a,b) => a + b.missed, 0);
  const compRate = totalSched > 0 ? Math.round(totalCompleted / totalSched * 100) : 0;

  mc.innerHTML = `<div class="p-5">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">${(dp.name||'?').charAt(4)}</div>
        <div>
          <h3 class="text-base font-bold text-gray-800">${dp.name}</h3>
          <p class="text-xs text-gray-500">${dp.nip} &middot; ${dp.specialization||'-'}</p>
          <p class="text-xs text-gray-400">${dp.department_name||''} &middot; ${SUB_ROLE_LABELS[dp.sub_role]||dp.sub_role}</p>
        </div>
      </div>
      <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-lg"></i></button>
    </div>
    <!-- Dual Role Tabs -->
    <div class="flex border-b mb-4">
      <button class="tab-btn active px-4 py-2 text-sm" onclick="showTab(this,'clinical')"><i class="fas fa-stethoscope mr-1"></i>Peran Klinis</button>
      <button class="tab-btn px-4 py-2 text-sm text-gray-500" onclick="showTab(this,'education')"><i class="fas fa-chalkboard-teacher mr-1"></i>Peran Pendidikan</button>
    </div>
    <!-- Clinical Tab -->
    <div id="tab-clinical">
      <div class="grid grid-cols-4 gap-2 mb-4">
        <div class="p-2 bg-gray-50 rounded-lg text-center"><div class="text-lg font-bold text-gray-800">${totalSched}</div><div class="text-[9px] text-gray-400">Total Jadwal (30h)</div></div>
        <div class="p-2 bg-green-50 rounded-lg text-center"><div class="text-lg font-bold text-green-600">${totalCompleted}</div><div class="text-[9px] text-gray-400">Selesai</div></div>
        <div class="p-2 bg-red-50 rounded-lg text-center"><div class="text-lg font-bold text-red-600">${totalMissed}</div><div class="text-[9px] text-gray-400">Tidak Hadir</div></div>
        <div class="p-2 ${compRate>=80?'bg-green-50':'bg-amber-50'} rounded-lg text-center"><div class="text-lg font-bold ${compRate>=80?'text-green-600':'text-amber-600'}">${compRate}%</div><div class="text-[9px] text-gray-400">Compliance</div></div>
      </div>
      <h4 class="font-semibold text-gray-700 text-xs mb-2">Jadwal Hari Ini</h4>
      ${d.todaySchedule.length > 0 ? `<div class="space-y-1 mb-3">${d.todaySchedule.map(s => `<div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
        <div class="flex items-center gap-2"><span class="badge bg-indigo-50 text-indigo-700">${actLabel(s.activity_type)}</span><span class="text-gray-600">${s.department_name||'-'}</span></div>
        <div class="flex items-center gap-2"><span class="font-mono">${s.start_time}-${s.end_time}</span><span class="text-gray-400">${s.patient_count||0} pasien</span>${statusBadge(s.status)}</div>
      </div>`).join('')}</div>` : '<p class="text-xs text-gray-400 italic mb-3">Tidak ada jadwal hari ini</p>'}
    </div>
    <!-- Education Tab -->
    <div id="tab-education" class="hidden">
      <h4 class="font-semibold text-gray-700 text-xs mb-2"><i class="fas fa-users text-purple-500 mr-1"></i>PPDS/Fellow yang Dibimbing</h4>
      ${d.supervisedPPDS.length > 0 ? `<div class="space-y-2 mb-3">${d.supervisedPPDS.map(p => `<div class="p-3 bg-purple-50 rounded-lg">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-semibold text-gray-800">${p.ppds_name}</span>
          ${roleBadge(p.ppds_role)}
        </div>
        <div class="grid grid-cols-3 gap-2 text-[10px] text-gray-600">
          <div><span class="text-gray-400">Spesialisasi:</span><div>${p.ppds_spec||'-'}</div></div>
          <div><span class="text-gray-400">Rotasi:</span><div>${p.rotation_dept||'-'}</div></div>
          <div><span class="text-gray-400">Tahap:</span><div class="font-semibold">${(p.stage||'').toUpperCase()}</div></div>
        </div>
        <div class="text-[10px] text-gray-400 mt-1">${fmtDate(p.start_date)} - ${fmtDate(p.end_date)}</div>
      </div>`).join('')}</div>` : '<p class="text-xs text-gray-400 italic mb-3">Belum ada PPDS/Fellow yang dibimbing</p>'}
      <div class="p-3 bg-blue-50 rounded-lg text-xs">
        <div class="flex items-center gap-2 mb-1"><i class="fas fa-info-circle text-blue-500"></i><span class="font-semibold text-blue-800">Peran Ganda DPJP di RS Pendidikan</span></div>
        <p class="text-blue-600 text-[10px]">Sebagai DPJP di RS Pendidikan, ${dp.name?.split(',')[0]} memiliki tanggung jawab klinis (pelayanan pasien) dan pendidikan (pembimbingan PPDS/Fellow). Monitoring dual-role ini penting untuk memastikan kedua peran terpenuhi.</p>
      </div>
    </div>
  </div>`;
}

function showTab(btn, tabId) {
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.classList.add('text-gray-500'); });
  btn.classList.add('active'); btn.classList.remove('text-gray-500');
  document.querySelectorAll('[id^="tab-"]').forEach(t => t.classList.add('hidden'));
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
}

// =====================================================
// PENDIDIKAN MONITORING (PPDS, Fellow, Co-Ass)
// =====================================================
async function loadPendidikan() {
  const data = await api('/api/pendidikan/monitoring');
  const ct = document.getElementById('content');
  const ppds = data.filter(d => d.role === 'ppds');
  const fellows = data.filter(d => d.role === 'fellow');
  const coass = data.filter(d => d.role === 'co_ass');
  const present = data.filter(d => d.today_clock_in).length;

  ct.innerHTML = `<div class="fade-in">
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-purple-600">${data.length}</div><div class="text-[10px] text-gray-500">Total</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-green-600">${present}</div><div class="text-[10px] text-gray-500">Hadir</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-purple-600">${ppds.length}</div><div class="text-[10px] text-gray-500">PPDS</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-violet-600">${fellows.length}</div><div class="text-[10px] text-gray-500">Fellow</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-fuchsia-600">${coass.length}</div><div class="text-[10px] text-gray-500">Co-Ass</div></div>
    </div>
    ${renderPendidikanSection('PPDS (Residen)', ppds, 'purple')}
    ${fellows.length > 0 ? renderPendidikanSection('Fellow (Sub-Spesialis)', fellows, 'violet') : ''}
    ${coass.length > 0 ? renderPendidikanSection('Co-Ass / Dokter Muda', coass, 'fuchsia') : ''}
  </div>`;
}
function renderPendidikanSection(title, items, color) {
  return `<h3 class="font-semibold text-gray-700 text-sm mt-4 mb-2"><i class="fas fa-graduation-cap text-${color}-500 mr-1"></i> ${title}</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
    ${items.map(p => `<div class="card bg-white rounded-xl border p-3 cursor-pointer" onclick="showEmployeeDetail(${p.id})">
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center text-${color}-600 font-bold text-xs">${(p.name||'?').charAt(4)}</div>
          <div><div class="font-semibold text-gray-800 text-xs">${p.name}</div><div class="text-[10px] text-gray-400">${p.specialization||'-'}</div></div>
        </div>
        <div class="${p.today_clock_in?'text-green-500':'text-red-400'}"><i class="fas fa-circle text-[7px]"></i></div>
      </div>
      <div class="grid grid-cols-2 gap-1.5 text-[10px] text-gray-600">
        <div><span class="text-gray-400">Rotasi:</span><div class="font-medium">${p.rotation_department||'-'}</div></div>
        <div><span class="text-gray-400">Pembimbing:</span><div class="font-medium cursor-pointer text-blue-600" ${p.supervisor_id ? `onclick="event.stopPropagation();showDPJPProfile(${p.supervisor_id})"` : ''}>${p.supervisor_name||'-'}</div></div>
        <div><span class="text-gray-400">Clock In:</span><div class="font-medium ${p.today_clock_in?'text-green-600':'text-red-500'}">${p.today_clock_in?fmt(p.today_clock_in):'Belum'}</div></div>
        <div><span class="text-gray-400">30 Hari:</span><div class="font-medium">${p.monthly_attendance_count||0}/30 hari</div></div>
      </div>
      <div class="mt-1.5 flex items-center gap-1.5">
        ${roleBadge(p.role)}
        <span class="badge ${p.stage==='fellow'?'bg-violet-100 text-violet-700':p.stage==='chief'?'bg-amber-100 text-amber-700':p.stage==='senior'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}">${(p.stage||'junior').toUpperCase()}</span>
        ${p.rotation_status === 'active' ? '<span class="badge bg-green-100 text-green-600">ROTASI AKTIF</span>' : ''}
      </div>
    </div>`).join('')}
  </div>`;
}

// =====================================================
// KEPERAWATAN MONITORING
// =====================================================
async function loadKeperawatan() {
  const [shifts, depts] = await Promise.all([api('/api/shifts?category=tenaga_keperawatan'), api('/api/departments')]);
  const ct = document.getElementById('content');
  const today = new Date().toISOString().split('T')[0];
  const byDept = {};
  shifts.forEach(s => { if (!byDept[s.department_id]) byDept[s.department_id] = { name: s.department_name, code: s.department_code, critical: s.is_critical, items: [] }; byDept[s.department_id].items.push(s); });
  const critDepts = depts.filter(d => d.is_critical);
  const deptOptions = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

  ct.innerHTML = `<div class="fade-in">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-green-600">${shifts.length}</div><div class="text-[10px] text-gray-500">Jadwal Shift</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-blue-600">${shifts.filter(s=>s.actual_clock_in).length}</div><div class="text-[10px] text-gray-500">Sudah Clock In</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-red-600">${shifts.filter(s=>!s.actual_clock_in).length}</div><div class="text-[10px] text-gray-500">Belum Clock In</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-amber-600">${critDepts.length}</div><div class="text-[10px] text-gray-500">Area Kritis</div></div>
    </div>
    <div class="bg-white rounded-xl border p-3 mb-4 flex flex-wrap items-center gap-3">
      <input type="date" id="shiftDate" value="${today}" onchange="reloadShifts()" class="border rounded-lg px-3 py-1.5 text-sm outline-none">
      <select id="shiftDept" onchange="reloadShifts()" class="border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="">Semua Unit</option>${deptOptions}</select>
      <select id="shiftType" onchange="reloadShifts()" class="border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="">Semua Shift</option><option value="pagi">Pagi</option><option value="siang">Siang</option><option value="malam">Malam</option></select>
    </div>
    <div id="shiftContent">${renderShiftGroups(byDept)}</div>
  </div>`;
}
function renderShiftGroups(byDept) {
  return Object.entries(byDept).map(([id, dept]) => `
    <div class="bg-white rounded-xl border mb-3 overflow-hidden">
      <div class="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
        ${dept.critical ? '<i class="fas fa-exclamation-circle text-red-400 text-xs"></i>' : ''}
        <h4 class="font-semibold text-gray-800 text-sm">${dept.name}</h4>
        <span class="text-[10px] text-gray-400">(${dept.items.length})</span>
      </div>
      <table class="w-full"><thead><tr>
        <th class="px-3 py-1.5 text-left text-[9px] font-semibold text-gray-400 uppercase">Nama</th>
        <th class="px-3 py-1.5 text-left text-[9px] font-semibold text-gray-400 uppercase">Role</th>
        <th class="px-3 py-1.5 text-left text-[9px] font-semibold text-gray-400 uppercase">Shift</th>
        <th class="px-3 py-1.5 text-left text-[9px] font-semibold text-gray-400 uppercase">Area</th>
        <th class="px-3 py-1.5 text-left text-[9px] font-semibold text-gray-400 uppercase">Clock In</th>
        <th class="px-3 py-1.5 text-left text-[9px] font-semibold text-gray-400 uppercase">Status</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${dept.items.map(s => `<tr class="table-row cursor-pointer" onclick="showEmployeeDetail(${s.employee_id})">
          <td class="px-3 py-1.5 text-xs font-medium text-gray-800">${s.employee_name} ${s.is_leader?'<i class="fas fa-star text-amber-400 text-[9px]" title="PJ Shift"></i>':''}</td>
          <td class="px-3 py-1.5">${roleBadge(s.role)}</td>
          <td class="px-3 py-1.5 text-[10px] font-mono text-gray-600">${s.shift_type} (${s.start_time}-${s.end_time})</td>
          <td class="px-3 py-1.5 text-[10px] text-gray-600">${s.area||'-'}</td>
          <td class="px-3 py-1.5 text-xs ${s.actual_clock_in?'text-green-600 font-medium':'text-red-400'}">${s.actual_clock_in?fmt(s.actual_clock_in):'Belum'}</td>
          <td class="px-3 py-1.5">${statusBadge(s.status)}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`).join('') || '<p class="text-gray-400 text-center py-8 text-sm">Tidak ada data shift</p>';
}
async function reloadShifts() {
  const date = document.getElementById('shiftDate').value;
  const dept = document.getElementById('shiftDept').value;
  const shift = document.getElementById('shiftType').value;
  let url = `/api/shifts?date=${date}&category=tenaga_keperawatan`;
  if (dept) url += `&department_id=${dept}`;
  if (shift) url += `&shift=${shift}`;
  const data = await api(url);
  const byDept = {};
  data.forEach(s => { if (!byDept[s.department_id]) byDept[s.department_id] = { name: s.department_name, critical: s.is_critical, items: [] }; byDept[s.department_id].items.push(s); });
  document.getElementById('shiftContent').innerHTML = renderShiftGroups(byDept);
}

// =====================================================
// FARMASI MONITORING (New!)
// =====================================================
async function loadFarmasi() {
  const [emps, shifts, attendance] = await Promise.all([
    api('/api/employees?category=tenaga_kefarmasian'),
    api('/api/shifts?category=tenaga_kefarmasian'),
    api('/api/attendance?category=tenaga_kefarmasian'),
  ]);
  const ct = document.getElementById('content');
  const apotekers = emps.filter(e => e.role === 'apoteker');
  const ttks = emps.filter(e => e.role === 'ttk');
  const present = attendance.filter(a => a.scan_type === 'clock_in');

  ct.innerHTML = `<div class="fade-in">
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-amber-600">${emps.length}</div><div class="text-[10px] text-gray-500">Total Kefarmasian</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-amber-700">${apotekers.length}</div><div class="text-[10px] text-gray-500">Apoteker</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-yellow-600">${ttks.length}</div><div class="text-[10px] text-gray-500">TTK</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-green-600">${present.length}</div><div class="text-[10px] text-gray-500">Hadir Hari Ini</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-blue-600">${shifts.length}</div><div class="text-[10px] text-gray-500">Jadwal Shift</div></div>
    </div>
    <!-- Farmasi Staff -->
    <h3 class="font-semibold text-gray-700 text-sm mb-2"><i class="fas fa-pills text-amber-500 mr-1"></i> Tenaga Kefarmasian</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
      ${emps.map(e => {
        const att = present.find(a => a.employee_id === e.id);
        return `<div class="card bg-white rounded-xl border border-l-4 border-l-amber-500 p-3 cursor-pointer" onclick="showEmployeeDetail(${e.id})">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs">${(e.name||'?').charAt(4)}</div>
              <div><div class="font-semibold text-gray-800 text-xs">${e.name}</div><div class="text-[10px] text-gray-400">${e.specialization||'-'}</div></div>
            </div>
            <div class="${att?'text-green-500':'text-red-400'}"><i class="fas fa-circle text-[7px]"></i></div>
          </div>
          <div class="flex items-center gap-1.5">
            ${roleBadge(e.role)} ${empTypeBadge(e.employment_type)}
            <span class="text-[10px] text-gray-400">${e.department_name||'-'}</span>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${shifts.length > 0 ? `<h3 class="font-semibold text-gray-700 text-sm mb-2"><i class="fas fa-calendar text-amber-500 mr-1"></i> Jadwal Shift Farmasi Hari Ini</h3>
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Nama</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Role</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Shift</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Area</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Clock In</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Status</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${shifts.map(s => `<tr class="table-row cursor-pointer" onclick="showEmployeeDetail(${s.employee_id})">
          <td class="px-3 py-2 text-xs font-medium text-gray-800">${s.employee_name} ${s.is_leader?'<i class="fas fa-star text-amber-400 text-[9px]"></i>':''}</td>
          <td class="px-3 py-2">${roleBadge(s.role)}</td>
          <td class="px-3 py-2 text-[10px] font-mono text-gray-600">${s.shift_type} (${s.start_time}-${s.end_time})</td>
          <td class="px-3 py-2 text-[10px] text-gray-600">${s.area||'-'}</td>
          <td class="px-3 py-2 text-xs ${s.actual_clock_in?'text-green-600 font-medium':'text-red-400'}">${s.actual_clock_in?fmt(s.actual_clock_in):'Belum'}</td>
          <td class="px-3 py-2">${statusBadge(s.status)}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>` : ''}
  </div>`;
}

// =====================================================
// ATTENDANCE
// =====================================================
async function loadAttendance() {
  const today = new Date().toISOString().split('T')[0];
  const data = await api(`/api/attendance?date=${today}`);
  const ct = document.getElementById('content');
  const catOpts = Object.entries(CAT_LABELS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');

  ct.innerHTML = `<div class="fade-in">
    <div class="bg-white rounded-xl border p-3 mb-4 flex flex-wrap items-center gap-3">
      <input type="date" id="attDate" value="${today}" onchange="filterAtt()" class="border rounded-lg px-3 py-1.5 text-sm outline-none">
      <select id="attCat" onchange="filterAtt()" class="border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="">Semua Kategori</option>${catOpts}</select>
      <select id="attType" onchange="filterAtt()" class="border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="">Semua Tipe</option><option value="clock_in">Clock In</option><option value="clock_out">Clock Out</option><option value="access">Akses</option></select>
      <span id="attCount" class="text-xs text-gray-400 ml-auto">${data.length} record</span>
    </div>
    <div class="bg-white rounded-xl border overflow-hidden"><div class="overflow-x-auto">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Waktu</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Pegawai</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Kategori</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Tipe</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Metode</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Lokasi</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Confidence</th>
      </tr></thead><tbody id="attBody" class="divide-y divide-gray-50">${renderAttRows(data)}</tbody></table>
    </div></div>
  </div>`;
}
function renderAttRows(data) {
  return data.map(a => `<tr class="table-row cursor-pointer" onclick="showEmployeeDetail(${a.employee_id})">
    <td class="px-3 py-2 text-xs font-mono text-gray-700">${fmt(a.scan_time)}</td>
    <td class="px-3 py-2"><div class="text-xs font-medium text-gray-800">${a.employee_name||'-'}</div><div class="text-[10px] text-gray-400">${a.department_name||''}</div></td>
    <td class="px-3 py-2">${catBadge(a.category)}</td>
    <td class="px-3 py-2"><span class="text-[10px] font-medium ${a.scan_type==='clock_in'?'text-green-600':a.scan_type==='clock_out'?'text-orange-600':'text-blue-600'}">${a.scan_type==='clock_in'?'Masuk':a.scan_type==='clock_out'?'Keluar':'Akses'}</span></td>
    <td class="px-3 py-2 text-center">${methodIcon(a.method)}</td>
    <td class="px-3 py-2 text-[10px] text-gray-600">${a.device_location||a.location||'-'}</td>
    <td class="px-3 py-2">${confBar(a.confidence_score)}</td>
  </tr>`).join('');
}
async function filterAtt() {
  const d = document.getElementById('attDate').value, cat = document.getElementById('attCat').value, t = document.getElementById('attType').value;
  let url = `/api/attendance?date=${d}`;
  if (cat) url += `&category=${cat}`;
  if (t) url += `&type=${t}`;
  const data = await api(url);
  document.getElementById('attBody').innerHTML = renderAttRows(data);
  document.getElementById('attCount').textContent = `${data.length} record`;
}

// =====================================================
// EMPLOYEES
// =====================================================
async function loadEmployees() {
  const [emps, depts] = await Promise.all([api('/api/employees'), api('/api/departments')]);
  const ct = document.getElementById('content');
  const catOpts = Object.entries(CAT_LABELS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('');
  const deptOpts = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

  ct.innerHTML = `<div class="fade-in">
    <div class="bg-white rounded-xl border p-3 mb-4 flex flex-wrap items-center gap-2">
      <input type="text" id="empSearch" placeholder="Cari nama/NIP..." oninput="filterEmps()" class="flex-1 min-w-[160px] border rounded-lg px-3 py-1.5 text-sm outline-none">
      <select id="empCat" onchange="filterEmps()" class="border rounded-lg px-2 py-1.5 text-sm outline-none"><option value="">Semua Kategori</option>${catOpts}</select>
      <select id="empDept" onchange="filterEmps()" class="border rounded-lg px-2 py-1.5 text-sm outline-none"><option value="">Semua Unit</option>${deptOpts}</select>
      <select id="empPri" onchange="filterEmps()" class="border rounded-lg px-2 py-1.5 text-sm outline-none"><option value="">Semua Prioritas</option><option value="1">P1</option><option value="2">P2</option><option value="3">P3</option><option value="4">P4</option></select>
    </div>
    <div class="text-xs text-gray-400 mb-2" id="empCount">${emps.length} pegawai</div>
    <div id="empGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">${renderEmpCards(emps)}</div>
  </div>`;
}
function renderEmpCards(emps) {
  return emps.map(e => {
    const cc = CAT_COLORS[e.category] || { bg:'bg-gray-500', light:'bg-gray-50', text:'text-gray-700', border:'border-gray-300' };
    const priColors = { 1:'border-l-red-500', 2:'border-l-amber-500', 3:'border-l-blue-300', 4:'border-l-gray-300' };
    return `<div class="card bg-white rounded-xl border border-l-4 ${priColors[e.priority_level]||''} p-3 cursor-pointer" onclick="showEmployeeDetail(${e.id})">
      <div class="flex items-start gap-2.5 mb-1.5">
        <div class="w-9 h-9 bg-gradient-to-br from-rssa-500 to-rssa-700 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">${(e.name||'?').charAt(4)}</div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-gray-800 text-sm truncate">${e.name}</div>
          <div class="text-[10px] text-gray-400">${e.nip} &middot; ${empTypeBadge(e.employment_type)}</div>
        </div>
        <span class="badge ${priColor(e.priority_level)}">${priLabel(e.priority_level)}</span>
      </div>
      <div class="space-y-0.5 text-[10px] text-gray-600">
        ${e.specialization?`<div class="truncate"><i class="fas fa-stethoscope w-3 text-gray-400"></i> ${e.specialization}</div>`:''}
        <div><i class="fas fa-building w-3 text-gray-400"></i> ${e.department_name||'-'}</div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="${e.face_registered?'text-green-500':'text-gray-300'}"><i class="fas fa-smile"></i></span>
            <span class="${e.finger_registered?'text-green-500':'text-gray-300'}"><i class="fas fa-fingerprint"></i></span>
          </div>
          <div class="flex items-center gap-1">${catBadge(e.category)} ${roleBadge(e.role)}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}
async function filterEmps() {
  const s = document.getElementById('empSearch').value, cat = document.getElementById('empCat').value, dept = document.getElementById('empDept').value, pri = document.getElementById('empPri').value;
  let url = '/api/employees?';
  if (s) url += `search=${encodeURIComponent(s)}&`;
  if (cat) url += `category=${cat}&`;
  if (dept) url += `department_id=${dept}&`;
  if (pri) url += `priority=${pri}&`;
  const data = await api(url);
  document.getElementById('empGrid').innerHTML = renderEmpCards(data);
  document.getElementById('empCount').textContent = `${data.length} pegawai`;
}

// =====================================================
// ACCESS LOGS
// =====================================================
async function loadAccessLogs() {
  const today = new Date().toISOString().split('T')[0];
  const [logs, summary] = await Promise.all([api(`/api/access-logs?date=${today}`), api(`/api/reports/access-summary?date=${today}`)]);
  const ct = document.getElementById('content');
  ct.innerHTML = `<div class="fade-in">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      ${summary.map(s => `<div class="card bg-white rounded-xl p-3 border"><div class="font-semibold text-gray-800 text-xs mb-1"><i class="fas fa-door-open text-rssa-500 mr-1"></i>${s.room_name}</div><div class="flex gap-3 text-[10px]"><span class="text-green-600"><i class="fas fa-check mr-0.5"></i>${s.granted}</span><span class="text-red-600"><i class="fas fa-ban mr-0.5"></i>${s.denied}</span></div></div>`).join('')}
    </div>
    <div class="bg-white rounded-xl border p-3 mb-4 flex flex-wrap items-center gap-3">
      <input type="date" id="accDate" value="${today}" onchange="filterAcc()" class="border rounded-lg px-3 py-1.5 text-sm outline-none">
      <select id="accType" onchange="filterAcc()" class="border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="">Semua</option><option value="granted">Diizinkan</option><option value="denied">Ditolak</option></select>
      <input type="text" id="accRoom" placeholder="Filter ruangan..." oninput="filterAcc()" class="border rounded-lg px-3 py-1.5 text-sm outline-none">
    </div>
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Waktu</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Pegawai</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Ruangan</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Metode</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Status</th>
      </tr></thead><tbody id="accBody" class="divide-y divide-gray-50">${renderAccRows(logs)}</tbody></table>
    </div>
  </div>`;
}
function renderAccRows(logs) {
  return logs.map(l => `<tr class="table-row ${l.access_type==='denied'?'bg-red-50/50':''}">
    <td class="px-3 py-2 text-xs font-mono text-gray-700">${fmt(l.access_time)}</td>
    <td class="px-3 py-2"><div class="text-xs font-medium text-gray-800">${l.employee_name||'<span class="text-red-500 italic">Tidak Dikenali</span>'}</div><div class="text-[10px] text-gray-400">${l.category?CAT_LABELS[l.category]:'-'}</div></td>
    <td class="px-3 py-2 text-xs text-gray-700"><i class="fas fa-door-open text-gray-400 mr-1"></i>${l.room_name}</td>
    <td class="px-3 py-2 text-center">${methodIcon(l.method)}</td>
    <td class="px-3 py-2">${statusBadge(l.access_type)}</td>
  </tr>`).join('');
}
async function filterAcc() {
  const d = document.getElementById('accDate').value, t = document.getElementById('accType').value, r = document.getElementById('accRoom').value;
  let url = `/api/access-logs?date=${d}`;
  if (t) url += `&type=${t}`;
  if (r) url += `&room=${encodeURIComponent(r)}`;
  document.getElementById('accBody').innerHTML = renderAccRows(await api(url));
}

// =====================================================
// DEVICES
// =====================================================
async function loadDevices() {
  const devs = await api('/api/devices');
  const ct = document.getElementById('content');
  const active = devs.filter(d => d.status==='active').length, maint = devs.filter(d => d.status==='maintenance').length, off = devs.filter(d => d.status==='inactive').length;
  ct.innerHTML = `<div class="fade-in">
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-green-600">${active}</div><div class="text-[10px] text-gray-500">Aktif</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-yellow-600">${maint}</div><div class="text-[10px] text-gray-500">Maintenance</div></div>
      <div class="card bg-white rounded-xl p-3 border text-center"><div class="text-xl font-bold text-red-600">${off}</div><div class="text-[10px] text-gray-500">Nonaktif</div></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      ${devs.map(d => {
        const sColor = d.status==='active'?'green':d.status==='maintenance'?'yellow':'red';
        return `<div class="card bg-white rounded-xl border p-3">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-${sColor}-50 flex items-center justify-center"><i class="${d.type==='face_recognition'?'fas fa-smile':d.type==='fingerprint'?'fas fa-fingerprint':'fas fa-tablet-alt'} text-${sColor}-500 text-sm"></i></div>
              <div><div class="font-semibold text-gray-800 text-xs">${d.name}</div><div class="text-[10px] text-gray-400 font-mono">${d.device_code}</div></div>
            </div>
            ${statusBadge(d.status)}
          </div>
          <div class="space-y-0.5 text-[10px] text-gray-600">
            <div><i class="fas fa-map-marker-alt w-3 text-gray-400"></i> ${d.location}</div>
            <div><i class="fas fa-network-wired w-3 text-gray-400"></i> ${d.ip_address||'-'}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// =====================================================
// REPORTS
// =====================================================
async function loadReports() {
  const [att, comp, sdmOverview] = await Promise.all([api('/api/reports/attendance-summary'), api('/api/reports/dpjp-compliance'), api('/api/reports/sdm-overview')]);
  const ct = document.getElementById('content');

  // SDM Overview summary
  const empTypeStats = {};
  for (const r of sdmOverview) {
    if (!empTypeStats[r.employment_type]) empTypeStats[r.employment_type] = 0;
    empTypeStats[r.employment_type] += r.total;
  }

  ct.innerHTML = `<div class="fade-in">
    <!-- Employment Type Summary -->
    <div class="bg-white rounded-xl border p-4 mb-5">
      <h3 class="font-semibold text-gray-800 text-sm mb-3"><i class="fas fa-id-badge text-rssa-500 mr-1"></i> Komposisi Pegawai berdasarkan Status Kepegawaian</h3>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        ${Object.entries(empTypeStats).map(([t, c]) => `<div class="text-center p-2 rounded-lg bg-gray-50"><div class="text-lg font-bold text-gray-800">${c}</div><div class="text-[10px] text-gray-500">${EMP_TYPE_LABELS[t]||t}</div></div>`).join('')}
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <div class="bg-white rounded-xl border p-4"><h3 class="font-semibold text-gray-800 text-sm mb-3"><i class="fas fa-chart-line text-rssa-500 mr-1"></i>Trend Kehadiran per Kategori (7 Hari)</h3><canvas id="rptAttChart" height="220"></canvas></div>
      <div class="bg-white rounded-xl border p-4"><h3 class="font-semibold text-gray-800 text-sm mb-3"><i class="fas fa-chart-bar text-rssa-500 mr-1"></i>Compliance DPJP (30 Hari)</h3><canvas id="rptCompChart" height="220"></canvas></div>
    </div>
    <!-- Biometric Registration by Category -->
    <div class="bg-white rounded-xl border p-4 mb-5">
      <h3 class="font-semibold text-gray-800 text-sm mb-3"><i class="fas fa-fingerprint text-rssa-500 mr-1"></i> Registrasi Biometrik per Kategori & Status Kerja</h3>
      <div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Kategori</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Status</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Total</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Face</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Finger</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Keduanya</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${sdmOverview.map(r => `<tr class="table-row">
          <td class="px-3 py-2">${catBadge(r.category)}</td>
          <td class="px-3 py-2">${empTypeBadge(r.employment_type)}</td>
          <td class="px-3 py-2 text-center text-xs font-medium">${r.total}</td>
          <td class="px-3 py-2 text-center text-xs ${r.face_reg===r.total?'text-green-600':'text-amber-600'}">${r.face_reg}</td>
          <td class="px-3 py-2 text-center text-xs ${r.finger_reg===r.total?'text-green-600':'text-amber-600'}">${r.finger_reg}</td>
          <td class="px-3 py-2 text-center text-xs font-bold ${r.both_reg===r.total?'text-green-600':'text-amber-600'}">${r.both_reg}/${r.total}</td>
        </tr>`).join('')}
      </tbody></table></div>
    </div>
    <!-- DPJP Compliance Table -->
    <div class="bg-white rounded-xl border overflow-hidden">
      <div class="px-4 py-3 border-b"><h3 class="font-semibold text-gray-800 text-sm"><i class="fas fa-table text-rssa-500 mr-1"></i>Detail Compliance DPJP</h3></div>
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Dokter</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Spesialisasi</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Total</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Selesai</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Tidak Hadir</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Compliance</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${comp.map(c => `<tr class="table-row cursor-pointer" onclick="showDPJPProfile(${c.id})">
          <td class="px-3 py-2 text-xs font-medium text-gray-800">${c.name}</td>
          <td class="px-3 py-2 text-[10px] text-gray-600">${c.specialization||'-'}</td>
          <td class="px-3 py-2 text-xs text-center">${c.total_schedules}</td>
          <td class="px-3 py-2 text-xs text-center text-green-600 font-medium">${c.completed}</td>
          <td class="px-3 py-2 text-xs text-center text-red-600 font-medium">${c.missed}</td>
          <td class="px-3 py-2 text-center"><div class="flex items-center justify-center gap-1.5"><div class="w-14 h-1.5 bg-gray-200 rounded-full"><div class="h-full rounded-full ${c.compliance_rate>=80?'bg-green-500':c.compliance_rate>=60?'bg-yellow-500':'bg-red-500'}" style="width:${c.compliance_rate}%"></div></div><span class="text-[10px] font-semibold ${c.compliance_rate>=80?'text-green-600':c.compliance_rate>=60?'text-yellow-600':'text-red-600'}">${c.compliance_rate}%</span></div></td>
        </tr>`).join('')}
      </tbody></table>
    </div>
  </div>`;

  // Charts
  const ctx1 = document.getElementById('rptAttChart');
  if (ctx1 && att.length > 0) {
    charts.rptAtt = new Chart(ctx1, {
      type:'line', data: {
        labels: att.map(r => dayjs(r.date).format('dd DD/MM')),
        datasets: [
          { label:'Medis', data:att.map(r=>r.medis), borderColor:'#3b82f6', tension:.4, pointRadius: 2 },
          { label:'Pendidikan', data:att.map(r=>r.pendidikan), borderColor:'#8b5cf6', tension:.4, pointRadius: 2 },
          { label:'Keperawatan', data:att.map(r=>r.keperawatan), borderColor:'#22c55e', tension:.4, pointRadius: 2 },
          { label:'Kefarmasian', data:att.map(r=>r.kefarmasian), borderColor:'#f59e0b', tension:.4, pointRadius: 2 },
          { label:'Total', data:att.map(r=>r.total_present), borderColor:'#0b2750', borderWidth:2, tension:.4, pointRadius: 2 },
        ]
      },
      options:{responsive:true,plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}},scales:{y:{beginAtZero:true}}}
    });
  }
  const ctx2 = document.getElementById('rptCompChart');
  if (ctx2 && comp.length > 0) {
    charts.rptComp = new Chart(ctx2, {
      type:'bar', data: {
        labels: comp.map(c => (c.name||'').split(',')[0].replace('dr. ','')),
        datasets: [
          { label:'Selesai', data:comp.map(c=>c.completed), backgroundColor:'#22c55e', borderRadius:3 },
          { label:'Tidak Hadir', data:comp.map(c=>c.missed), backgroundColor:'#ef4444', borderRadius:3 },
          { label:'Terjadwal', data:comp.map(c=>c.scheduled), backgroundColor:'#93c5fd', borderRadius:3 },
        ]
      },
      options:{responsive:true,plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:9}}}},scales:{x:{stacked:true,ticks:{font:{size:7}}},y:{stacked:true,beginAtZero:true}}}
    });
  }
}

// =====================================================
// EMPLOYEE DETAIL MODAL (Enhanced)
// =====================================================
async function showEmployeeDetail(id) {
  if (!id) return;
  const modal = document.getElementById('modal');
  const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = '<div class="p-10 text-center"><i class="fas fa-spinner fa-spin text-2xl text-rssa-500"></i></div>';
  const d = await api(`/api/employees/${id}`);
  const cc = CAT_COLORS[d.category] || { light:'bg-gray-50', text:'text-gray-700', border:'border-gray-300' };
  const priLabels = {1:'P1 - Sangat Tinggi',2:'P2 - Tinggi',3:'P3 - Sedang',4:'P4 - Rendah'};
  const priColors = {1:'text-red-600',2:'text-amber-600',3:'text-blue-600',4:'text-gray-500'};

  mc.innerHTML = `<div class="p-5">
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 bg-gradient-to-br from-rssa-500 to-rssa-700 rounded-full flex items-center justify-center text-white font-bold text-lg">${(d.name||'?').charAt(4)}</div>
        <div>
          <h3 class="text-base font-bold text-gray-800">${d.name}</h3>
          <div class="flex items-center gap-1.5 flex-wrap">${roleBadge(d.role)} ${catBadge(d.category)} ${empTypeBadge(d.employment_type)}</div>
          <p class="text-[10px] text-gray-400 mt-0.5">${d.nip} &middot; ${d.specialization||''} ${d.department_name?'&middot; '+d.department_name:''}</p>
        </div>
      </div>
      <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-lg"></i></button>
    </div>
    <!-- Info Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-[10px]">
      <div class="p-2 bg-gray-50 rounded-lg"><span class="text-gray-400">Prioritas</span><div class="font-semibold ${priColors[d.priority_level]||''}">${priLabels[d.priority_level]||'-'}</div></div>
      <div class="p-2 bg-gray-50 rounded-lg"><span class="text-gray-400">Sub-Role</span><div class="font-semibold text-gray-700">${SUB_ROLE_LABELS[d.sub_role]||d.sub_role||'-'}</div></div>
      <div class="p-2 bg-gray-50 rounded-lg"><span class="text-gray-400">SIP/STR</span><div class="font-semibold text-gray-700">${d.sip_str||'-'}</div></div>
      <div class="p-2 bg-gray-50 rounded-lg"><span class="text-gray-400">Kehadiran 30h</span><div class="font-semibold text-gray-700">${d.attendanceDays30||0} hari</div></div>
    </div>
    <!-- Biometric -->
    <div class="grid grid-cols-2 gap-2 mb-3">
      <div class="flex items-center gap-2 p-2 rounded-lg ${d.face_registered?'bg-green-50':'bg-red-50'}"><i class="fas fa-smile ${d.face_registered?'text-green-500':'text-red-400'}"></i><span class="text-[10px] ${d.face_registered?'text-green-700':'text-red-600'}">${d.face_registered?'Face Terdaftar':'Face Belum'}</span></div>
      <div class="flex items-center gap-2 p-2 rounded-lg ${d.finger_registered?'bg-green-50':'bg-red-50'}"><i class="fas fa-fingerprint ${d.finger_registered?'text-green-500':'text-red-400'}"></i><span class="text-[10px] ${d.finger_registered?'text-green-700':'text-red-600'}">${d.finger_registered?'Fingerprint Terdaftar':'Fingerprint Belum'}</span></div>
    </div>
    <!-- DPJP Compliance -->
    ${d.dpjpCompliance ? `<div class="p-3 bg-blue-50 rounded-lg mb-3">
      <h4 class="font-semibold text-blue-800 text-xs mb-1"><i class="fas fa-chart-bar mr-1"></i>Compliance DPJP (30 Hari)</h4>
      <div class="grid grid-cols-3 gap-2 text-center text-xs">
        <div><span class="text-lg font-bold text-green-600">${d.dpjpCompliance.completed||0}</span><div class="text-[10px] text-gray-500">Selesai</div></div>
        <div><span class="text-lg font-bold text-red-600">${d.dpjpCompliance.missed||0}</span><div class="text-[10px] text-gray-500">Tidak Hadir</div></div>
        <div><span class="text-lg font-bold ${d.dpjpCompliance.total>0?Math.round(d.dpjpCompliance.completed/d.dpjpCompliance.total*100)>=80?'text-green-600':'text-amber-600':'text-gray-400'}">${d.dpjpCompliance.total>0?Math.round(d.dpjpCompliance.completed/d.dpjpCompliance.total*100):0}%</span><div class="text-[10px] text-gray-500">Rate</div></div>
      </div>
    </div>` : ''}
    <!-- Supervised PPDS -->
    ${d.supervisedPPDS && d.supervisedPPDS.length > 0 ? `<div class="p-3 bg-purple-50 rounded-lg mb-3">
      <h4 class="font-semibold text-purple-800 text-xs mb-1"><i class="fas fa-chalkboard-teacher mr-1"></i>PPDS/Fellow yang Dibimbing</h4>
      <div class="space-y-1">${d.supervisedPPDS.map(p => `<div class="flex items-center justify-between text-xs"><span class="font-medium text-gray-700">${p.ppds_name}</span><div class="flex items-center gap-1">${roleBadge(p.ppds_role||p.role)}<span class="text-[10px] text-gray-400">${p.rotation_dept||'-'}</span></div></div>`).join('')}</div>
    </div>` : ''}
    <!-- Rotations (PPDS) -->
    ${d.rotations && d.rotations.length > 0 ? `<div class="p-3 bg-purple-50 rounded-lg mb-3">
      <h4 class="font-semibold text-purple-800 text-xs mb-1"><i class="fas fa-sync-alt mr-1"></i>Rotasi</h4>
      <div class="space-y-1">${d.rotations.map(r => `<div class="flex items-center justify-between text-xs">
        <div><span class="font-medium text-gray-700">${r.department_name||'-'}</span><span class="text-gray-400 ml-1">(${(r.stage||'').toUpperCase()})</span></div>
        <div class="flex items-center gap-1.5"><span class="text-[10px] text-gray-400">${fmtDate(r.start_date)} - ${fmtDate(r.end_date)}</span>${statusBadge(r.status)}<span class="text-[10px] text-gray-400">Pembimbing: ${r.supervisor_name||'-'}</span></div>
      </div>`).join('')}</div>
    </div>` : ''}
    <!-- Today Attendance -->
    <div class="mb-3"><h4 class="font-semibold text-gray-700 text-xs mb-1.5"><i class="fas fa-clock text-rssa-500 mr-1"></i>Kehadiran Hari Ini</h4>
      ${d.todayAttendance?.length>0? d.todayAttendance.map(a=>`<div class="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg text-[10px] mb-0.5">
        <div class="flex items-center gap-1.5">${a.scan_type==='clock_in'?'<i class="fas fa-sign-in-alt text-green-500"></i>':a.scan_type==='clock_out'?'<i class="fas fa-sign-out-alt text-orange-500"></i>':'<i class="fas fa-door-open text-blue-500"></i>'}<span class="capitalize">${a.scan_type.replace('_',' ')}</span></div>
        <div class="flex items-center gap-1.5">${methodIcon(a.method)}<span class="font-mono text-gray-600">${fmt(a.scan_time)}</span><span class="text-gray-400">${a.location||''}</span></div>
      </div>`).join('') : '<p class="text-[10px] text-gray-400 italic">Belum ada data</p>'}
    </div>
    ${d.schedules?.length>0?`<div class="mb-3"><h4 class="font-semibold text-gray-700 text-xs mb-1.5"><i class="fas fa-calendar text-rssa-500 mr-1"></i>Jadwal DPJP Hari Ini</h4>
      ${d.schedules.map(s=>`<div class="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg text-[10px] mb-0.5"><span class="font-medium">${actLabel(s.activity_type)} <span class="text-gray-400">${s.department_name||''}</span></span><div class="flex items-center gap-1.5"><span class="font-mono text-gray-600">${s.start_time}-${s.end_time}</span>${statusBadge(s.status)}</div></div>`).join('')}
    </div>`:''}
    ${d.shifts?.length>0?`<div class="mb-3"><h4 class="font-semibold text-gray-700 text-xs mb-1.5"><i class="fas fa-exchange-alt text-rssa-500 mr-1"></i>Shift Hari Ini</h4>
      ${d.shifts.map(s=>`<div class="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg text-[10px] mb-0.5"><span class="font-medium">${s.department_name} ${s.is_leader?'<i class="fas fa-star text-amber-400"></i>':''} <span class="text-gray-400">${s.area||''}</span></span><div class="flex items-center gap-1.5"><span class="font-mono text-gray-600">${s.shift_type} (${s.start_time}-${s.end_time})</span>${statusBadge(s.status)}</div></div>`).join('')}
    </div>`:''}
    ${d.recentAccess?.length>0?`<div><h4 class="font-semibold text-gray-700 text-xs mb-1.5"><i class="fas fa-door-open text-rssa-500 mr-1"></i>Riwayat Akses</h4>
      ${d.recentAccess.map(a=>`<div class="flex items-center justify-between py-1 text-[10px]"><span>${a.room_name}</span><div class="flex items-center gap-1.5">${statusBadge(a.access_type)}<span class="text-gray-400">${fmtDT(a.access_time)}</span></div></div>`).join('')}
    </div>`:''}
  </div>`;
}
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

// Clock
function tick() {
  const now = new Date();
  const el1 = document.getElementById('currentTime');
  const el2 = document.getElementById('currentDate');
  if (el1) el1.textContent = now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  if (el2) el2.textContent = now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}
setInterval(tick, 1000); tick();

// =====================================================
// AUTH MANAGEMENT
// =====================================================
async function checkAuth() {
  try {
    const r = await fetch('/api/auth/me');
    if (r.ok) {
      currentUser = await r.json();
      updateUIForAuth();
    } else {
      currentUser = null;
      updateUIForAuth();
    }
  } catch(e) { currentUser = null; updateUIForAuth(); }
}

function updateUIForAuth() {
  const loginBtn = document.getElementById('loginBtn');
  const userInfo = document.getElementById('userInfo');
  const cmsMenu = document.getElementById('cmsMenu');
  const adminMenu = document.getElementById('adminMenu');
  
  if (currentUser) {
    if(loginBtn) loginBtn.classList.add('hidden');
    if(userInfo) { userInfo.classList.remove('hidden'); }
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.roleLabel || currentUser.role;
    document.getElementById('userAvatar').textContent = (currentUser.name||'A').charAt(0).toUpperCase();
    
    // Show CMS menu for admin_sdm, admin_dept, super_admin
    if (['super_admin','admin_sdm'].includes(currentUser.role)) {
      if(cmsMenu) cmsMenu.classList.remove('hidden');
    } else if (currentUser.role === 'admin_dept') {
      if(cmsMenu) cmsMenu.classList.remove('hidden');
    }
    // Show admin menu only for super_admin
    if (currentUser.role === 'super_admin') {
      if(adminMenu) adminMenu.classList.remove('hidden');
    }
  } else {
    if(loginBtn) loginBtn.classList.remove('hidden');
    if(userInfo) userInfo.classList.add('hidden');
    if(cmsMenu) cmsMenu.classList.add('hidden');
    if(adminMenu) adminMenu.classList.add('hidden');
  }
}

function toggleUserMenu() {
  document.getElementById('userMenu').classList.toggle('hidden');
}

async function doLogout() {
  await fetch('/api/auth/logout', {method:'POST'});
  currentUser = null;
  localStorage.removeItem('auth_user');
  updateUIForAuth();
  showPage('dashboard');
}

// Helper for auth API calls
async function apiPost(url, data) {
  const r = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
  return r.json();
}
async function apiPut(url, data) {
  const r = await fetch(url, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
  return r.json();
}
async function apiDelete(url) {
  const r = await fetch(url, {method:'DELETE'});
  return r.json();
}

// =====================================================
// CMS: EMPLOYEES (CRUD + Import)
// =====================================================
async function loadCMSEmployees() {
  const [emps, depts] = await Promise.all([api('/api/employees'), api('/api/departments')]);
  const ct = document.getElementById('content');
  const catOpts = Object.entries(CAT_LABELS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
  const deptOpts = depts.map(d=>`<option value="${d.id}">${d.name}</option>`).join('');
  
  ct.innerHTML = `<div class="fade-in">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <input type="text" id="cmsEmpSearch" placeholder="Cari nama/NIP..." oninput="filterCMSEmps()" class="border rounded-lg px-3 py-1.5 text-sm outline-none w-64">
        <select id="cmsEmpCat" onchange="filterCMSEmps()" class="border rounded-lg px-2 py-1.5 text-sm outline-none"><option value="">Semua Kategori</option>${catOpts}</select>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="showImportCSVModal()" class="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 flex items-center gap-1"><i class="fas fa-file-csv"></i> Import CSV</button>
        <button onclick="showAddEmployeeModal()" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600 flex items-center gap-1"><i class="fas fa-plus"></i> Tambah Pegawai</button>
      </div>
    </div>
    <div class="bg-white rounded-xl border overflow-hidden">
      <div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">NIP</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Nama</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Kategori</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Role</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Departemen</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Biometrik</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Aksi</th>
      </tr></thead><tbody id="cmsEmpBody" class="divide-y divide-gray-50">${renderCMSEmpRows(emps)}</tbody></table></div>
    </div>
  </div>`;
}

function renderCMSEmpRows(emps) {
  return emps.map(e => `<tr class="table-row">
    <td class="px-3 py-2 text-xs font-mono text-gray-700">${e.nip}</td>
    <td class="px-3 py-2"><div class="text-xs font-medium text-gray-800">${e.name}</div><div class="text-[9px] text-gray-400">${e.specialization||''}</div></td>
    <td class="px-3 py-2">${catBadge(e.category)}</td>
    <td class="px-3 py-2">${roleBadge(e.role)}</td>
    <td class="px-3 py-2 text-[10px] text-gray-600">${e.department_name||'-'}</td>
    <td class="px-3 py-2 text-center"><span class="${e.face_registered?'text-green-500':'text-gray-300'}"><i class="fas fa-smile"></i></span> <span class="${e.finger_registered?'text-green-500':'text-gray-300'}"><i class="fas fa-fingerprint"></i></span></td>
    <td class="px-3 py-2 text-center">
      <button onclick="showEditEmployeeModal(${e.id})" class="text-blue-500 hover:text-blue-700 text-xs mr-1" title="Edit"><i class="fas fa-edit"></i></button>
      <button onclick="deleteEmployee(${e.id},'${e.name}')" class="text-red-500 hover:text-red-700 text-xs" title="Hapus"><i class="fas fa-trash"></i></button>
    </td>
  </tr>`).join('');
}

async function filterCMSEmps() {
  const s=document.getElementById('cmsEmpSearch').value, cat=document.getElementById('cmsEmpCat').value;
  let url='/api/employees?';
  if(s) url+=`search=${encodeURIComponent(s)}&`;
  if(cat) url+=`category=${cat}&`;
  const data = await api(url);
  document.getElementById('cmsEmpBody').innerHTML = renderCMSEmpRows(data);
}

function showAddEmployeeModal() {
  showEmployeeFormModal(null);
}

async function showEditEmployeeModal(id) {
  const emp = await api(`/api/employees/${id}`);
  showEmployeeFormModal(emp);
}

async function showEmployeeFormModal(emp) {
  const depts = await api('/api/departments');
  const isEdit = !!emp;
  const modal = document.getElementById('modal');
  const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  
  const catOpts = Object.entries(CAT_LABELS).map(([k,v])=>`<option value="${k}" ${emp?.category===k?'selected':''}>${v}</option>`).join('');
  const deptOpts = depts.map(d=>`<option value="${d.id}" ${emp?.department_id==d.id?'selected':''}>${d.name}</option>`).join('');
  const roleOpts = ['dpjp','dokter_umum','dokter_gigi','ppds','fellow','co_ass','perawat','bidan','apoteker','ttk','radiografer','analis_lab','fisioterapis','ahli_gizi','perekam_medis','direksi','staff_admin','staff_it','security','driver','teknisi','cssd','cleaning','laundry'].map(r=>`<option value="${r}" ${emp?.role===r?'selected':''}>${r.replace(/_/g,' ')}</option>`).join('');
  const empTypeOpts = ['pns','pppk','kontrak','outsource','mitra'].map(t=>`<option value="${t}" ${emp?.employment_type===t?'selected':''}>${(EMP_TYPE_LABELS[t]||t)}</option>`).join('');
  
  mc.innerHTML = `<div class="p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-bold text-gray-800"><i class="fas fa-${isEdit?'edit':'plus'} text-rssa-500 mr-2"></i>${isEdit?'Edit':'Tambah'} Pegawai</h3>
      <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-lg"></i></button>
    </div>
    <form id="empForm" onsubmit="saveEmployee(event,${emp?.id||'null'})">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">NIP *</label><input type="text" name="nip" value="${emp?.nip||''}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rssa-500"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Nama *</label><input type="text" name="name" value="${emp?.name||''}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rssa-500"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Kategori *</label><select name="category" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${catOpts}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Role *</label><select name="role" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${roleOpts}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Departemen</label><select name="department_id" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="">- Pilih -</option>${deptOpts}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Spesialisasi</label><input type="text" name="specialization" value="${emp?.specialization||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Sub-Role</label><input type="text" name="sub_role" value="${emp?.sub_role||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Status Kepegawaian</label><select name="employment_type" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${empTypeOpts}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Phone</label><input type="text" name="phone" value="${emp?.phone||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">SIP/STR</label><input type="text" name="sip_str" value="${emp?.sip_str||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Biometric ID</label><input type="text" name="biometric_id" value="${emp?.biometric_id||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Prioritas</label><select name="priority_level" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="1" ${emp?.priority_level==1?'selected':''}>P1 - Sangat Tinggi</option><option value="2" ${emp?.priority_level==2?'selected':''}>P2 - Tinggi</option><option value="3" ${!emp||emp?.priority_level==3?'selected':''}>P3 - Sedang</option><option value="4" ${emp?.priority_level==4?'selected':''}>P4 - Rendah</option></select></div>
      </div>
      <div id="empFormError" class="hidden mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700"></div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
        <button type="submit" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg hover:bg-rssa-600"><i class="fas fa-save mr-1"></i>${isEdit?'Update':'Simpan'}</button>
      </div>
    </form>
  </div>`;
}

async function saveEmployee(e, id) {
  e.preventDefault();
  const form = document.getElementById('empForm');
  const data = Object.fromEntries(new FormData(form));
  if(data.department_id) data.department_id = parseInt(data.department_id);
  if(data.priority_level) data.priority_level = parseInt(data.priority_level);
  try {
    const r = id ? await apiPut(`/api/cms/employees/${id}`, data) : await apiPost('/api/cms/employees', data);
    if(r.success) { closeModal(); loadCMSEmployees(); } 
    else { document.getElementById('empFormError').classList.remove('hidden'); document.getElementById('empFormError').textContent = r.error || 'Gagal menyimpan'; }
  } catch(ex) { document.getElementById('empFormError').classList.remove('hidden'); document.getElementById('empFormError').textContent = 'Error: '+ex.message; }
}

async function deleteEmployee(id, name) {
  if(!confirm(`Hapus pegawai "${name}"? (soft delete)`)) return;
  const r = await apiDelete(`/api/cms/employees/${id}`);
  if(r.success) loadCMSEmployees();
  else alert(r.error || 'Gagal menghapus');
}

function showImportCSVModal() {
  const modal = document.getElementById('modal');
  const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = `<div class="p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-bold text-gray-800"><i class="fas fa-file-csv text-green-600 mr-2"></i>Import CSV Pegawai</h3>
      <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-lg"></i></button>
    </div>
    <div class="mb-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
      <p class="font-semibold mb-1"><i class="fas fa-info-circle mr-1"></i>Format CSV:</p>
      <p>Header: nip, name, role, category, sub_role, specialization, department_id, phone, employment_type, priority_level, sip_str, biometric_id</p>
      <p class="mt-1">Contoh baris: 199001011001,dr. Test,dpjp,tenaga_medis,dpjp_konsultan,Penyakit Dalam,5,08123456789,pns,1,SIP-001,BIO-999</p>
    </div>
    <textarea id="csvInput" rows="10" class="w-full border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-rssa-500" placeholder="Paste CSV data di sini (dengan header)..."></textarea>
    <div id="csvResult" class="hidden mt-3 p-2 rounded-lg text-xs"></div>
    <div class="flex justify-end gap-2 mt-3">
      <button onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
      <button onclick="doImportCSV()" class="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"><i class="fas fa-upload mr-1"></i>Import</button>
    </div>
  </div>`;
}

async function doImportCSV() {
  const text = document.getElementById('csvInput').value.trim();
  if(!text) return;
  const lines = text.split('\n').map(l=>l.trim()).filter(l=>l);
  if(lines.length < 2) { alert('Minimal 2 baris (header + data)'); return; }
  const headers = lines[0].split(',').map(h=>h.trim());
  const csvData = [];
  for(let i=1; i<lines.length; i++) {
    const vals = lines[i].split(',').map(v=>v.trim());
    const row = {};
    headers.forEach((h,j) => { if(vals[j]) row[h] = vals[j]; });
    if(row.department_id) row.department_id = parseInt(row.department_id);
    if(row.priority_level) row.priority_level = parseInt(row.priority_level);
    csvData.push(row);
  }
  const r = await apiPost('/api/cms/employees/import', {csvData});
  const el = document.getElementById('csvResult');
  el.classList.remove('hidden');
  if(r.success) {
    el.className = 'mt-3 p-2 rounded-lg text-xs bg-green-50 text-green-700';
    el.innerHTML = `<i class="fas fa-check-circle mr-1"></i>Berhasil import ${r.imported}/${r.total} pegawai.${r.errors?.length?'<br>Errors: '+r.errors.join('<br>'):''}`;
  } else {
    el.className = 'mt-3 p-2 rounded-lg text-xs bg-red-50 text-red-700';
    el.innerHTML = `<i class="fas fa-times-circle mr-1"></i>${r.error||'Gagal import'}`;
  }
}

// =====================================================
// CMS: DEPARTMENTS
// =====================================================
async function loadCMSDepts() {
  const depts = await api('/api/departments');
  const ct = document.getElementById('content');
  ct.innerHTML = `<div class="fade-in">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-700 text-sm">${depts.length} departemen</h3>
      <button onclick="showDeptFormModal(null)" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600 flex items-center gap-1"><i class="fas fa-plus"></i> Tambah Departemen</button>
    </div>
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Kode</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Nama</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Tipe</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Kritis</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Lokasi</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Pegawai</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Aksi</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${depts.map(d=>`<tr class="table-row">
          <td class="px-3 py-2 text-xs font-mono font-medium text-gray-800">${d.code}</td>
          <td class="px-3 py-2 text-xs text-gray-800">${d.name}</td>
          <td class="px-3 py-2"><span class="badge bg-gray-100 text-gray-600">${d.type}</span></td>
          <td class="px-3 py-2 text-center">${d.is_critical?'<i class="fas fa-exclamation-circle text-red-500"></i>':'-'}</td>
          <td class="px-3 py-2 text-[10px] text-gray-500">${d.floor||''} ${d.building||''}</td>
          <td class="px-3 py-2 text-center text-xs font-medium">${d.employee_count||0}</td>
          <td class="px-3 py-2 text-center"><button onclick="showDeptFormModal(${d.id})" class="text-blue-500 hover:text-blue-700 text-xs" title="Edit"><i class="fas fa-edit"></i></button></td>
        </tr>`).join('')}
      </tbody></table>
    </div>
  </div>`;
}

async function showDeptFormModal(id) {
  let dept = null;
  if(id) { const depts = await api('/api/departments'); dept = depts.find(d=>d.id===id); }
  const modal = document.getElementById('modal');
  const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = `<div class="p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-bold text-gray-800"><i class="fas fa-building text-rssa-500 mr-2"></i>${dept?'Edit':'Tambah'} Departemen</h3>
      <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-lg"></i></button>
    </div>
    <form id="deptForm" onsubmit="saveDept(event,${id||'null'})">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Kode *</label><input type="text" name="code" value="${dept?.code||''}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Nama *</label><input type="text" name="name" value="${dept?.name||''}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Tipe</label><select name="type" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${['unit','poli','instalasi','ruangan'].map(t=>`<option value="${t}" ${dept?.type===t?'selected':''}>${t}</option>`).join('')}</select></div>
        <div class="flex items-center gap-2 pt-5"><input type="checkbox" name="is_critical" ${dept?.is_critical?'checked':''} class="rounded"><label class="text-xs text-gray-600">Area Kritis</label></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Lantai</label><input type="text" name="floor" value="${dept?.floor||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Gedung</label><input type="text" name="building" value="${dept?.building||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
        <button type="submit" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg hover:bg-rssa-600"><i class="fas fa-save mr-1"></i>Simpan</button>
      </div>
    </form>
  </div>`;
}

async function saveDept(e, id) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(document.getElementById('deptForm')));
  data.is_critical = data.is_critical === 'on' ? 1 : 0;
  const r = id ? await apiPut(`/api/cms/departments/${id}`, data) : await apiPost('/api/cms/departments', data);
  if(r.success) { closeModal(); loadCMSDepts(); } else alert(r.error||'Gagal');
}

// =====================================================
// CMS: DEVICES
// =====================================================
async function loadCMSDevices() {
  const devs = await api('/api/devices');
  const ct = document.getElementById('content');
  ct.innerHTML = `<div class="fade-in">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-700 text-sm">${devs.length} perangkat</h3>
      <button onclick="showDeviceFormModal(null)" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600 flex items-center gap-1"><i class="fas fa-plus"></i> Tambah Perangkat</button>
    </div>
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Kode</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Nama</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Tipe</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Lokasi</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">IP</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400 uppercase">Status</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400 uppercase">Aksi</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${devs.map(d=>`<tr class="table-row">
          <td class="px-3 py-2 text-xs font-mono">${d.device_code}</td>
          <td class="px-3 py-2 text-xs text-gray-800">${d.name}</td>
          <td class="px-3 py-2"><span class="badge ${d.type==='face_recognition'?'bg-blue-100 text-blue-700':d.type==='fingerprint'?'bg-purple-100 text-purple-700':'bg-cyan-100 text-cyan-700'}">${d.type}</span></td>
          <td class="px-3 py-2 text-[10px] text-gray-600">${d.location}</td>
          <td class="px-3 py-2 text-[10px] font-mono text-gray-500">${d.ip_address||'-'}</td>
          <td class="px-3 py-2">${statusBadge(d.status)}</td>
          <td class="px-3 py-2 text-center"><button onclick="showDeviceFormModal(${d.id})" class="text-blue-500 hover:text-blue-700 text-xs"><i class="fas fa-edit"></i></button></td>
        </tr>`).join('')}
      </tbody></table>
    </div>
  </div>`;
}

async function showDeviceFormModal(id) {
  let dev = null;
  if(id) { const devs = await api('/api/devices'); dev = devs.find(d=>d.id===id); }
  const modal = document.getElementById('modal'); const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = `<div class="p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-bold text-gray-800"><i class="fas fa-tablet-alt text-rssa-500 mr-2"></i>${dev?'Edit':'Tambah'} Perangkat</h3>
      <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times text-lg"></i></button>
    </div>
    <form id="devForm" onsubmit="saveDevice(event,${id||'null'})">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Kode Device *</label><input type="text" name="device_code" value="${dev?.device_code||''}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Nama *</label><input type="text" name="name" value="${dev?.name||''}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Tipe</label><select name="type" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${['face_recognition','fingerprint','combo'].map(t=>`<option value="${t}" ${dev?.type===t?'selected':''}>${t}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Lokasi *</label><input type="text" name="location" value="${dev?.location||''}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Tipe Lokasi</label><select name="location_type" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${['lobby','unit','icu','ok','farmasi','other'].map(t=>`<option value="${t}" ${dev?.location_type===t?'selected':''}>${t}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">IP Address</label><input type="text" name="ip_address" value="${dev?.ip_address||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Status</label><select name="status" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${['active','inactive','maintenance'].map(t=>`<option value="${t}" ${dev?.status===t?'selected':''}>${t}</option>`).join('')}</select></div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
        <button type="submit" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg hover:bg-rssa-600"><i class="fas fa-save mr-1"></i>Simpan</button>
      </div>
    </form>
  </div>`;
}

async function saveDevice(e, id) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(document.getElementById('devForm')));
  const r = id ? await apiPut(`/api/cms/devices/${id}`, data) : await apiPost('/api/cms/devices', data);
  if(r.success) { closeModal(); loadCMSDevices(); } else alert(r.error||'Gagal');
}

// =====================================================
// CMS: SCHEDULES (DPJP, Shift, Rotation)
// =====================================================
async function loadCMSSchedules() {
  const ct = document.getElementById('content');
  ct.innerHTML = `<div class="fade-in">
    <div class="flex gap-2 border-b mb-4">
      <button class="tab-btn active px-4 py-2 text-sm" onclick="showSchedTab(this,'dpjpSched')">Jadwal DPJP</button>
      <button class="tab-btn px-4 py-2 text-sm text-gray-500" onclick="showSchedTab(this,'shiftSched')">Shift Perawat</button>
      <button class="tab-btn px-4 py-2 text-sm text-gray-500" onclick="showSchedTab(this,'ppdsRot')">Rotasi PPDS</button>
    </div>
    <div id="sched-dpjpSched"></div>
    <div id="sched-shiftSched" class="hidden"></div>
    <div id="sched-ppdsRot" class="hidden"></div>
  </div>`;
  loadDPJPSchedulesCMS();
}

function showSchedTab(btn, tabId) {
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b=>{b.classList.remove('active');b.classList.add('text-gray-500')});
  btn.classList.add('active'); btn.classList.remove('text-gray-500');
  document.querySelectorAll('[id^="sched-"]').forEach(t=>t.classList.add('hidden'));
  document.getElementById(`sched-${tabId}`).classList.remove('hidden');
  if(tabId==='dpjpSched') loadDPJPSchedulesCMS();
  if(tabId==='shiftSched') loadShiftSchedulesCMS();
  if(tabId==='ppdsRot') loadPPDSRotationsCMS();
}

async function loadDPJPSchedulesCMS() {
  const today = new Date().toISOString().split('T')[0];
  const data = await api(`/api/dpjp/monitoring?date=${today}`);
  document.getElementById('sched-dpjpSched').innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm text-gray-500">${data.schedules.length} jadwal hari ini</span>
      <button onclick="showDPJPSchedFormModal()" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600"><i class="fas fa-plus mr-1"></i>Tambah Jadwal DPJP</button>
    </div>
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Dokter</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Aktivitas</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Unit</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Jadwal</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Status</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${data.schedules.map(s=>`<tr class="table-row">
          <td class="px-3 py-2 text-xs">${s.doctor_name||'-'}</td>
          <td class="px-3 py-2"><span class="badge bg-indigo-50 text-indigo-700">${actLabel(s.activity_type)}</span></td>
          <td class="px-3 py-2 text-[10px] text-gray-600">${s.department_name||'-'}</td>
          <td class="px-3 py-2 text-xs font-mono">${s.start_time}-${s.end_time}</td>
          <td class="px-3 py-2">${statusBadge(s.status)}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
}

async function showDPJPSchedFormModal() {
  const [dpjps, depts] = await Promise.all([api('/api/employees?role=dpjp'), api('/api/departments')]);
  const modal = document.getElementById('modal'); const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = `<div class="p-5">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-calendar-plus text-rssa-500 mr-2"></i>Tambah Jadwal DPJP</h3>
    <form onsubmit="saveDPJPSched(event)">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">DPJP *</label><select name="employee_id" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${dpjps.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Tanggal *</label><input type="date" name="schedule_date" value="${new Date().toISOString().split('T')[0]}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Departemen</label><select name="department_id" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${depts.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Aktivitas</label><select name="activity_type" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${['visite','operasi','poliklinik','tindakan','konsul','jaga'].map(a=>`<option value="${a}">${actLabel(a)}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Shift</label><select name="shift" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="pagi">Pagi</option><option value="siang">Siang</option><option value="malam">Malam</option></select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Jam Mulai *</label><input type="time" name="start_time" value="07:00" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Jam Selesai *</label><input type="time" name="end_time" value="14:00" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Jumlah Pasien</label><input type="number" name="patient_count" value="0" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 rounded-lg">Batal</button>
        <button type="submit" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg"><i class="fas fa-save mr-1"></i>Simpan</button>
      </div>
    </form>
  </div>`;
}

async function saveDPJPSched(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.employee_id = parseInt(data.employee_id); data.department_id = parseInt(data.department_id);
  data.patient_count = parseInt(data.patient_count)||0;
  const r = await apiPost('/api/cms/dpjp-schedules', data);
  if(r.success){closeModal();loadDPJPSchedulesCMS()} else alert(r.error||'Gagal');
}

async function loadShiftSchedulesCMS() {
  const shifts = await api('/api/shifts');
  document.getElementById('sched-shiftSched').innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm text-gray-500">${shifts.length} shift hari ini</span>
      <button onclick="showShiftFormModal()" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600"><i class="fas fa-plus mr-1"></i>Tambah Shift</button>
    </div>
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Nama</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Unit</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Shift</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Area</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Status</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${shifts.map(s=>`<tr class="table-row">
          <td class="px-3 py-2 text-xs">${s.employee_name} ${s.is_leader?'<i class="fas fa-star text-amber-400 text-[9px]"></i>':''}</td>
          <td class="px-3 py-2 text-[10px]">${s.department_name||'-'}</td>
          <td class="px-3 py-2 text-xs font-mono">${s.shift_type} (${s.start_time}-${s.end_time})</td>
          <td class="px-3 py-2 text-[10px]">${s.area||'-'}</td>
          <td class="px-3 py-2">${statusBadge(s.status)}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
}

async function showShiftFormModal() {
  const [emps, depts] = await Promise.all([api('/api/employees'), api('/api/departments')]);
  const modal = document.getElementById('modal'); const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = `<div class="p-5">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-calendar-plus text-rssa-500 mr-2"></i>Tambah Jadwal Shift</h3>
    <form onsubmit="saveShift(event)">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Pegawai *</label><select name="employee_id" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${emps.map(e=>`<option value="${e.id}">${e.name}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Tanggal *</label><input type="date" name="schedule_date" value="${new Date().toISOString().split('T')[0]}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Departemen</label><select name="department_id" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${depts.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Shift</label><select name="shift_type" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="pagi">Pagi</option><option value="siang">Siang</option><option value="malam">Malam</option></select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Jam Mulai</label><input type="time" name="start_time" value="07:00" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Jam Selesai</label><input type="time" name="end_time" value="14:00" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Area</label><input type="text" name="area" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none" placeholder="e.g. ICU Bed 1-4"></div>
        <div class="flex items-center gap-2 pt-5"><input type="checkbox" name="is_leader" class="rounded"><label class="text-xs text-gray-600">PJ Shift</label></div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 rounded-lg">Batal</button>
        <button type="submit" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg"><i class="fas fa-save mr-1"></i>Simpan</button>
      </div>
    </form>
  </div>`;
}

async function saveShift(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.employee_id = parseInt(data.employee_id); data.department_id = parseInt(data.department_id);
  data.is_leader = data.is_leader === 'on' ? 1 : 0;
  const r = await apiPost('/api/cms/shift-schedules', data);
  if(r.success){closeModal();loadShiftSchedulesCMS()} else alert(r.error||'Gagal');
}

async function loadPPDSRotationsCMS() {
  const data = await api('/api/pendidikan/monitoring');
  const active = data.filter(d=>d.rotation_status==='active');
  document.getElementById('sched-ppdsRot').innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm text-gray-500">${active.length} rotasi aktif</span>
      <button onclick="showRotationFormModal()" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600"><i class="fas fa-plus mr-1"></i>Tambah Rotasi</button>
    </div>
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Nama</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Spesialisasi</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Rotasi</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Pembimbing</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Periode</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Tahap</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${data.map(p=>`<tr class="table-row">
          <td class="px-3 py-2 text-xs font-medium">${p.name}</td>
          <td class="px-3 py-2 text-[10px]">${p.specialization||'-'}</td>
          <td class="px-3 py-2 text-[10px]">${p.rotation_department||'-'}</td>
          <td class="px-3 py-2 text-[10px]">${p.supervisor_name||'-'}</td>
          <td class="px-3 py-2 text-[10px] font-mono">${fmtDate(p.start_date)} - ${fmtDate(p.end_date)}</td>
          <td class="px-3 py-2"><span class="badge bg-blue-100 text-blue-700">${(p.stage||'').toUpperCase()}</span></td>
        </tr>`).join('')}
      </tbody></table>
    </div>`;
}

async function showRotationFormModal() {
  const [ppds, dpjps, depts] = await Promise.all([api('/api/employees?category=tenaga_pendidikan'), api('/api/employees?role=dpjp'), api('/api/departments')]);
  const modal = document.getElementById('modal'); const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = `<div class="p-5">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-sync-alt text-rssa-500 mr-2"></i>Tambah Rotasi PPDS</h3>
    <form onsubmit="saveRotation(event)">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">PPDS/Fellow *</label><select name="employee_id" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${ppds.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Departemen *</label><select name="department_id" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${depts.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Pembimbing (DPJP)</label><select name="supervisor_id" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="">- Pilih -</option>${dpjps.map(d=>`<option value="${d.id}">${d.name}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Tahap</label><select name="stage" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="junior">Junior</option><option value="senior">Senior</option><option value="chief">Chief</option><option value="fellow">Fellow</option></select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Mulai *</label><input type="date" name="start_date" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Selesai *</label><input type="date" name="end_date" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 rounded-lg">Batal</button>
        <button type="submit" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg"><i class="fas fa-save mr-1"></i>Simpan</button>
      </div>
    </form>
  </div>`;
}

async function saveRotation(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.employee_id = parseInt(data.employee_id); data.department_id = parseInt(data.department_id);
  if(data.supervisor_id) data.supervisor_id = parseInt(data.supervisor_id);
  const r = await apiPost('/api/cms/ppds-rotations', data);
  if(r.success){closeModal();loadPPDSRotationsCMS()} else alert(r.error||'Gagal');
}

// =====================================================
// ADMIN: USER MANAGEMENT
// =====================================================
async function loadCMSUsers() {
  const users = await api('/api/cms/users');
  const ct = document.getElementById('content');
  const roleLbls = { super_admin:'Super Admin', admin_sdm:'Admin SDM', admin_dept:'Admin Dept', viewer:'Viewer' };
  ct.innerHTML = `<div class="fade-in">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-700 text-sm">${users.length} user admin</h3>
      <button onclick="showUserFormModal(null)" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600"><i class="fas fa-plus mr-1"></i>Tambah User</button>
    </div>
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Username</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Nama</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Role</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Status</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Login Terakhir</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400">Aksi</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${users.map(u=>`<tr class="table-row">
          <td class="px-3 py-2 text-xs font-mono font-medium">${u.username}</td>
          <td class="px-3 py-2 text-xs text-gray-800">${u.name}</td>
          <td class="px-3 py-2"><span class="badge ${u.role==='super_admin'?'bg-red-100 text-red-700':u.role==='admin_sdm'?'bg-blue-100 text-blue-700':u.role==='admin_dept'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}">${roleLbls[u.role]||u.role}</span></td>
          <td class="px-3 py-2">${u.is_active?'<span class="badge bg-green-100 text-green-700">Aktif</span>':'<span class="badge bg-red-100 text-red-700">Nonaktif</span>'}</td>
          <td class="px-3 py-2 text-[10px] text-gray-500">${u.last_login?fmtDT(u.last_login):'Belum pernah'}</td>
          <td class="px-3 py-2 text-center"><button onclick="showUserFormModal(${u.id})" class="text-blue-500 hover:text-blue-700 text-xs"><i class="fas fa-edit"></i></button></td>
        </tr>`).join('')}
      </tbody></table>
    </div>
  </div>`;
}

async function showUserFormModal(id) {
  let user = null;
  if(id) { const users = await api('/api/cms/users'); user = users.find(u=>u.id===id); }
  const modal = document.getElementById('modal'); const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  const depts = await api('/api/departments');
  mc.innerHTML = `<div class="p-5">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-user-shield text-rssa-500 mr-2"></i>${user?'Edit':'Tambah'} User Admin</h3>
    <form onsubmit="saveUser(event,${id||'null'})">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Username *</label><input type="text" name="username" value="${user?.username||''}" ${user?'readonly':''} required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none ${user?'bg-gray-100':''}"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Password ${user?'(kosongkan jika tidak diubah)':'*'}</label><input type="password" name="password" ${user?'':'required'} class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Nama *</label><input type="text" name="name" value="${user?.name||''}" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Role *</label><select name="role" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none">${['super_admin','admin_sdm','admin_dept','viewer'].map(r=>`<option value="${r}" ${user?.role===r?'selected':''}>${r.replace(/_/g,' ').toUpperCase()}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Departemen</label><select name="department_id" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="">- Pilih -</option>${depts.map(d=>`<option value="${d.id}" ${user?.department_id==d.id?'selected':''}>${d.name}</option>`).join('')}</select></div>
        ${user?`<div class="flex items-center gap-2 pt-5"><input type="checkbox" name="is_active" ${user.is_active?'checked':''} class="rounded"><label class="text-xs text-gray-600">Aktif</label></div>`:''}
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 rounded-lg">Batal</button>
        <button type="submit" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg"><i class="fas fa-save mr-1"></i>Simpan</button>
      </div>
    </form>
  </div>`;
}

async function saveUser(e, id) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  if(!data.password) delete data.password;
  if(data.department_id) data.department_id = parseInt(data.department_id); else data.department_id = null;
  if(id && data.is_active !== undefined) data.is_active = data.is_active === 'on' ? 1 : 0;
  const r = id ? await apiPut(`/api/cms/users/${id}`, data) : await apiPost('/api/cms/users', data);
  if(r.success){closeModal();loadCMSUsers()} else alert(r.error||'Gagal');
}

// =====================================================
// ADMIN: API KEYS
// =====================================================
async function loadAPIKeys() {
  const keys = await api('/api/cms/api-keys');
  const ct = document.getElementById('content');
  ct.innerHTML = `<div class="fade-in">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold text-gray-700 text-sm">${keys.length} API key</h3>
        <p class="text-[10px] text-gray-400">Satu key per perangkat biometrik</p>
      </div>
      <button onclick="showAPIKeyFormModal()" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600"><i class="fas fa-plus mr-1"></i>Generate API Key</button>
    </div>
    ${keys.length === 0 ? '<div class="bg-gray-50 rounded-xl p-8 text-center text-gray-400"><i class="fas fa-key text-3xl mb-2"></i><p class="text-sm">Belum ada API key. Generate key untuk perangkat biometrik.</p></div>' : `
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Nama</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Prefix</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Perangkat</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400">Requests</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Terakhir</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Status</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400">Aksi</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${keys.map(k=>`<tr class="table-row">
          <td class="px-3 py-2"><div class="text-xs font-medium text-gray-800">${k.name}</div><div class="text-[9px] text-gray-400">${k.description||''}</div></td>
          <td class="px-3 py-2 text-xs font-mono text-gray-500">${k.key_prefix}...</td>
          <td class="px-3 py-2 text-[10px]">${k.device_name?`${k.device_name} (${k.device_code})`:'-'}</td>
          <td class="px-3 py-2 text-center text-xs font-medium">${k.total_requests||0}</td>
          <td class="px-3 py-2 text-[10px] text-gray-500">${k.last_used?fmtDT(k.last_used):'Belum'}</td>
          <td class="px-3 py-2">${k.is_active?'<span class="badge bg-green-100 text-green-700">Aktif</span>':'<span class="badge bg-red-100 text-red-700">Revoked</span>'}</td>
          <td class="px-3 py-2 text-center">${k.is_active?`<button onclick="revokeAPIKey(${k.id},'${k.name}')" class="text-red-500 hover:text-red-700 text-xs" title="Revoke"><i class="fas fa-ban"></i></button>`:''}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`}
    <!-- API Documentation -->
    <div class="mt-5 bg-white rounded-xl border p-4">
      <h3 class="font-semibold text-gray-800 text-sm mb-3"><i class="fas fa-book text-rssa-500 mr-1"></i>Dokumentasi API</h3>
      <div class="bg-gray-900 rounded-lg p-4 text-xs font-mono text-green-400 overflow-x-auto">
        <div class="text-gray-500"># Kirim data kehadiran dari perangkat biometrik</div>
        <div class="text-yellow-400 mt-1">POST /api/v1/attendance</div>
        <div class="text-gray-500 mt-2">Headers:</div>
        <div>&nbsp; X-API-Key: rssa_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</div>
        <div>&nbsp; Content-Type: application/json</div>
        <div class="text-gray-500 mt-2">Body:</div>
        <div class="text-white">{</div>
        <div>&nbsp; "biometric_id": "BIO-001",</div>
        <div>&nbsp; "device_code": "FR-LOBBY-01",</div>
        <div>&nbsp; "method": "face",</div>
        <div>&nbsp; "confidence_score": 98.5,</div>
        <div>&nbsp; "scan_type": "clock_in"</div>
        <div class="text-white">}</div>
        <div class="text-gray-500 mt-2">Response (200):</div>
        <div class="text-white">{"success":true, "id":123, "employee_name":"dr. Ahmad..."}</div>
      </div>
    </div>
  </div>`;
}

async function showAPIKeyFormModal() {
  const devs = await api('/api/devices');
  const modal = document.getElementById('modal'); const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = `<div class="p-5">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-key text-rssa-500 mr-2"></i>Generate API Key</h3>
    <form onsubmit="generateAPIKey(event)">
      <div class="grid grid-cols-1 gap-3">
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Nama Key *</label><input type="text" name="name" required placeholder="e.g. FR Lobby Utama" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label><input type="text" name="description" placeholder="Deskripsi penggunaan" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Perangkat (opsional)</label><select name="device_id" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"><option value="">- Tidak dikaitkan -</option>${devs.map(d=>`<option value="${d.id}">${d.name} (${d.device_code})</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Rate Limit (req/menit)</label><input type="number" name="rate_limit" value="60" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">IP Whitelist (opsional)</label><input type="text" name="ip_whitelist" placeholder="e.g. 192.168.1.0/24" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
      </div>
      <div id="generatedKey" class="hidden mt-3"></div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 rounded-lg">Tutup</button>
        <button type="submit" id="genKeyBtn" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg"><i class="fas fa-key mr-1"></i>Generate</button>
      </div>
    </form>
  </div>`;
}

async function generateAPIKey(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  if(data.device_id) data.device_id = parseInt(data.device_id); else delete data.device_id;
  if(data.rate_limit) data.rate_limit = parseInt(data.rate_limit);
  const r = await apiPost('/api/cms/api-keys', data);
  if(r.success) {
    document.getElementById('genKeyBtn').classList.add('hidden');
    document.getElementById('generatedKey').classList.remove('hidden');
    document.getElementById('generatedKey').innerHTML = `
      <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-xs font-semibold text-green-800 mb-1"><i class="fas fa-check-circle mr-1"></i>API Key berhasil digenerate!</p>
        <p class="text-[10px] text-red-600 mb-2"><i class="fas fa-exclamation-triangle mr-1"></i>Simpan key ini. Tidak akan ditampilkan lagi!</p>
        <div class="bg-white border rounded-lg p-2 font-mono text-xs text-gray-800 break-all select-all">${r.apiKey}</div>
      </div>`;
  } else alert(r.error||'Gagal');
}

async function revokeAPIKey(id, name) {
  if(!confirm(`Revoke API key "${name}"?`)) return;
  const r = await apiDelete(`/api/cms/api-keys/${id}`);
  if(r.success) loadAPIKeys();
}

// =====================================================
// ADMIN: API LOGS
// =====================================================
async function loadAPILogs() {
  const logs = await api('/api/cms/api-logs?limit=100');
  const ct = document.getElementById('content');
  ct.innerHTML = `<div class="fade-in">
    <h3 class="font-semibold text-gray-700 text-sm mb-3">${logs.length} log terakhir</h3>
    ${logs.length === 0 ? '<div class="bg-gray-50 rounded-xl p-8 text-center text-gray-400"><i class="fas fa-stream text-3xl mb-2"></i><p class="text-sm">Belum ada request API.</p></div>' : `
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Waktu</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Key</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Endpoint</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400">Status</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">IP</th>
        <th class="px-3 py-2 text-center text-[10px] font-semibold text-gray-400">Waktu (ms)</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Error</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${logs.map(l=>`<tr class="table-row ${l.status_code>=400?'bg-red-50/50':''}">
          <td class="px-3 py-2 text-[10px] font-mono text-gray-500">${fmtDT(l.created_at)}</td>
          <td class="px-3 py-2 text-[10px]">${l.key_name||'-'} <span class="text-gray-400">${l.key_prefix||''}</span></td>
          <td class="px-3 py-2 text-xs font-mono">${l.method} ${l.endpoint}</td>
          <td class="px-3 py-2 text-center"><span class="badge ${l.status_code<300?'bg-green-100 text-green-700':l.status_code<500?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}">${l.status_code}</span></td>
          <td class="px-3 py-2 text-[10px] font-mono text-gray-500">${l.ip_address||'-'}</td>
          <td class="px-3 py-2 text-center text-[10px] text-gray-500">${l.response_time_ms||'-'}</td>
          <td class="px-3 py-2 text-[10px] text-red-600 truncate max-w-[150px]">${l.error_message||''}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`}
  </div>`;
}

// =====================================================
// ADMIN: WEBHOOKS
// =====================================================
async function loadWebhooks() {
  const [hooks, simrsConf] = await Promise.all([api('/api/cms/webhooks'), api('/api/cms/simrs-config')]);
  const ct = document.getElementById('content');
  const confMap = {}; simrsConf.forEach(c => confMap[c.config_key] = c.config_value);
  
  ct.innerHTML = `<div class="fade-in">
    <div class="flex gap-2 border-b mb-4">
      <button class="tab-btn active px-4 py-2 text-sm" onclick="showWebhookTab(this,'webhookList')">Webhooks</button>
      <button class="tab-btn px-4 py-2 text-sm text-gray-500" onclick="showWebhookTab(this,'simrsConfig')">Integrasi SIMRS</button>
    </div>
    <div id="wh-webhookList">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-500">${hooks.length} webhook</span>
        <button onclick="showWebhookFormModal()" class="px-3 py-1.5 bg-rssa-500 text-white text-xs rounded-lg hover:bg-rssa-600"><i class="fas fa-plus mr-1"></i>Tambah Webhook</button>
      </div>
      ${hooks.length===0?'<div class="bg-gray-50 rounded-xl p-8 text-center text-gray-400"><i class="fas fa-bolt text-3xl mb-2"></i><p class="text-sm">Belum ada webhook.</p></div>':''}
      <div class="space-y-3">
        ${hooks.map(h=>`<div class="bg-white rounded-xl border p-4">
          <div class="flex items-start justify-between mb-2">
            <div><h4 class="font-semibold text-gray-800 text-sm">${h.name}</h4><p class="text-[10px] font-mono text-gray-400 break-all">${h.url}</p></div>
            <div class="flex items-center gap-2">${h.is_active?'<span class="badge bg-green-100 text-green-700">Aktif</span>':'<span class="badge bg-gray-100 text-gray-500">Nonaktif</span>'}</div>
          </div>
          <div class="flex items-center gap-2 text-[10px] text-gray-500">
            <span><i class="fas fa-bolt mr-0.5"></i>Events: ${h.events}</span>
            <span>&middot; Sent: ${h.total_sent||0}</span>
            ${h.last_triggered?`<span>&middot; Last: ${fmtDT(h.last_triggered)}</span>`:''}
          </div>
        </div>`).join('')}
      </div>
    </div>
    <div id="wh-simrsConfig" class="hidden">
      <div class="bg-white rounded-xl border p-4">
        <h3 class="font-semibold text-gray-800 text-sm mb-3"><i class="fas fa-hospital text-rssa-500 mr-1"></i>Konfigurasi Integrasi SIMRS</h3>
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 mb-4">
          <i class="fas fa-info-circle mr-1"></i>Integrasi SIMRS masih dalam tahap konseptual. Konfigurasi ini akan digunakan saat integrasi langsung dengan SIMRS tersedia.
        </div>
        <form onsubmit="saveSIMRSConfig(event)">
          <div class="space-y-3">
            <div><label class="block text-xs font-semibold text-gray-600 mb-1">Base URL API SIMRS</label><input type="text" name="simrs_base_url" value="${confMap.simrs_base_url||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none" placeholder="https://simrs.rssa.go.id/api"></div>
            <div><label class="block text-xs font-semibold text-gray-600 mb-1">API Key SIMRS</label><input type="text" name="simrs_api_key" value="${confMap.simrs_api_key||''}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none" placeholder="API key dari SIMRS"></div>
            <div><label class="block text-xs font-semibold text-gray-600 mb-1">Interval Sync (detik)</label><input type="number" name="simrs_sync_interval" value="${confMap.simrs_sync_interval||300}" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
            <div class="flex items-center gap-2"><input type="checkbox" name="simrs_sync_enabled" ${confMap.simrs_sync_enabled==='true'?'checked':''} class="rounded"><label class="text-xs text-gray-600">Aktifkan sinkronisasi otomatis</label></div>
          </div>
          <div class="flex justify-end mt-4">
            <button type="submit" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg"><i class="fas fa-save mr-1"></i>Simpan Konfigurasi</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
}

function showWebhookTab(btn, tabId) {
  btn.parentElement.querySelectorAll('.tab-btn').forEach(b=>{b.classList.remove('active');b.classList.add('text-gray-500')});
  btn.classList.add('active'); btn.classList.remove('text-gray-500');
  document.querySelectorAll('[id^="wh-"]').forEach(t=>t.classList.add('hidden'));
  document.getElementById(`wh-${tabId}`).classList.remove('hidden');
}

async function showWebhookFormModal() {
  const modal = document.getElementById('modal'); const mc = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  mc.innerHTML = `<div class="p-5">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-bolt text-rssa-500 mr-2"></i>Tambah Webhook</h3>
    <form onsubmit="saveWebhook(event)">
      <div class="grid grid-cols-1 gap-3">
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Nama *</label><input type="text" name="name" required class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">URL *</label><input type="url" name="url" required placeholder="https://..." class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Events</label><input type="text" name="events" value="attendance:created" placeholder="attendance:created,access:denied" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
        <div><label class="block text-xs font-semibold text-gray-600 mb-1">Secret (opsional)</label><input type="text" name="secret" class="w-full border rounded-lg px-3 py-1.5 text-sm outline-none"></div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-gray-600 rounded-lg">Batal</button>
        <button type="submit" class="px-4 py-2 bg-rssa-500 text-white text-sm rounded-lg"><i class="fas fa-save mr-1"></i>Simpan</button>
      </div>
    </form>
  </div>`;
}

async function saveWebhook(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const r = await apiPost('/api/cms/webhooks', data);
  if(r.success){closeModal();loadWebhooks()} else alert(r.error||'Gagal');
}

async function saveSIMRSConfig(e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.simrs_sync_enabled = data.simrs_sync_enabled === 'on' ? 'true' : 'false';
  const r = await apiPut('/api/cms/simrs-config', data);
  if(r.success) alert('Konfigurasi SIMRS berhasil disimpan'); else alert(r.error||'Gagal');
}

// =====================================================
// ADMIN: AUDIT LOGS
// =====================================================
async function loadAuditLogs() {
  const logs = await api('/api/cms/audit-logs?limit=100');
  const ct = document.getElementById('content');
  const actionColors = { login:'bg-blue-100 text-blue-700', create:'bg-green-100 text-green-700', update:'bg-amber-100 text-amber-700', delete:'bg-red-100 text-red-700', import:'bg-purple-100 text-purple-700', revoke:'bg-red-100 text-red-700' };
  ct.innerHTML = `<div class="fade-in">
    <h3 class="font-semibold text-gray-700 text-sm mb-3">${logs.length} log audit terakhir</h3>
    ${logs.length===0?'<div class="bg-gray-50 rounded-xl p-8 text-center text-gray-400"><i class="fas fa-history text-3xl mb-2"></i><p class="text-sm">Belum ada aktivitas.</p></div>':`
    <div class="bg-white rounded-xl border overflow-hidden">
      <table class="w-full"><thead class="bg-gray-50"><tr>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Waktu</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">User</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Aksi</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Tabel</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">ID</th>
        <th class="px-3 py-2 text-left text-[10px] font-semibold text-gray-400">Detail</th>
      </tr></thead><tbody class="divide-y divide-gray-50">
        ${logs.map(l=>`<tr class="table-row">
          <td class="px-3 py-2 text-[10px] font-mono text-gray-500">${fmtDT(l.created_at)}</td>
          <td class="px-3 py-2 text-xs">${l.user_name||'-'} <span class="text-[9px] text-gray-400">${l.username||''}</span></td>
          <td class="px-3 py-2"><span class="badge ${actionColors[l.action]||'bg-gray-100 text-gray-600'}">${l.action}</span></td>
          <td class="px-3 py-2 text-[10px] font-mono text-gray-600">${l.table_name||'-'}</td>
          <td class="px-3 py-2 text-[10px] text-gray-500">${l.record_id||'-'}</td>
          <td class="px-3 py-2 text-[10px] text-gray-400 truncate max-w-[200px]">${l.new_value?l.new_value.substring(0,80)+'...':''}</td>
        </tr>`).join('')}
      </tbody></table>
    </div>`}
  </div>`;
}

// Init
async function initApp() {
  await checkAuth();
  showPage('dashboard');
}
initApp();
