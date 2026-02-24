// =====================================================
// RSSA Biometric Monitoring System - Frontend Application
// =====================================================

const API = '';
let currentPage = 'dashboard';
let charts = {};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function formatTime(dt) {
  if (!dt) return '-';
  return dayjs(dt).format('HH:mm');
}
function formatDateTime(dt) {
  if (!dt) return '-';
  return dayjs(dt).format('DD/MM/YYYY HH:mm');
}
function formatDate(dt) {
  if (!dt) return '-';
  return dayjs(dt).format('DD/MM/YYYY');
}
function timeAgo(dt) {
  if (!dt) return '-';
  return dayjs(dt).fromNow();
}
function roleBadge(role) {
  const map = {
    dpjp: '<span class="badge bg-blue-100 text-blue-800">DPJP</span>',
    ppds: '<span class="badge bg-purple-100 text-purple-800">PPDS</span>',
    perawat: '<span class="badge bg-green-100 text-green-800">Perawat</span>',
    staff: '<span class="badge bg-yellow-100 text-yellow-800">Staff</span>',
    admin: '<span class="badge bg-gray-100 text-gray-800">Admin</span>'
  };
  return map[role] || `<span class="badge bg-gray-100 text-gray-700">${role}</span>`;
}
function statusBadge(status) {
  const map = {
    completed: '<span class="badge bg-green-100 text-green-700"><i class="fas fa-check mr-1"></i>Selesai</span>',
    scheduled: '<span class="badge bg-blue-100 text-blue-700"><i class="fas fa-clock mr-1"></i>Terjadwal</span>',
    missed: '<span class="badge bg-red-100 text-red-700"><i class="fas fa-times mr-1"></i>Tidak Hadir</span>',
    cancelled: '<span class="badge bg-gray-100 text-gray-700"><i class="fas fa-ban mr-1"></i>Batal</span>',
    verified: '<span class="badge bg-green-100 text-green-700">Terverifikasi</span>',
    granted: '<span class="badge bg-green-100 text-green-700"><i class="fas fa-check mr-1"></i>Diizinkan</span>',
    denied: '<span class="badge bg-red-100 text-red-700"><i class="fas fa-ban mr-1"></i>Ditolak</span>',
    active: '<span class="badge bg-green-100 text-green-700">Aktif</span>',
    inactive: '<span class="badge bg-gray-100 text-gray-600">Nonaktif</span>',
    maintenance: '<span class="badge bg-yellow-100 text-yellow-700">Maintenance</span>'
  };
  return map[status] || `<span class="badge bg-gray-100 text-gray-700">${status}</span>`;
}
function methodIcon(method) {
  if (method === 'face') return '<i class="fas fa-smile text-blue-500" title="Face Recognition"></i>';
  if (method === 'fingerprint') return '<i class="fas fa-fingerprint text-purple-500" title="Fingerprint"></i>';
  return '<i class="fas fa-keyboard text-gray-500" title="Manual"></i>';
}
function activityLabel(type) {
  const map = { visite: 'Visite Pasien', operasi: 'Operasi', poliklinik: 'Poliklinik', tindakan: 'Tindakan', konsul: 'Konsultasi', jaga: 'Jaga/On-Call' };
  return map[type] || type;
}

async function fetchAPI(path) {
  const res = await fetch(API + path);
  return res.json();
}

// =====================================================
// NAVIGATION
// =====================================================
function showPage(page) {
  currentPage = page;
  document.querySelectorAll('.sidebar-link').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  const titles = {
    dashboard: ['Dashboard', 'Monitoring real-time kehadiran dan kinerja'],
    dpjp: ['Monitoring DPJP', 'Pantau kehadiran dan jadwal DPJP'],
    ppds: ['Monitoring PPDS', 'Pantau kehadiran dan rotasi PPDS'],
    attendance: ['Kehadiran Pegawai', 'Data absensi biometrik seluruh pegawai'],
    employees: ['Data Pegawai', 'Kelola data pegawai rumah sakit'],
    access: ['Log Akses Ruangan', 'Audit akses ruangan terbatas'],
    devices: ['Perangkat Biometrik', 'Status perangkat face recognition & fingerprint'],
    reports: ['Laporan & Analitik', 'Laporan kehadiran dan kinerja']
  };
  document.getElementById('pageTitle').textContent = titles[page]?.[0] || page;
  document.getElementById('pageSubtitle').textContent = titles[page]?.[1] || '';
  loadPage(page);
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.toggle('hidden');
}

async function loadPage(page) {
  const loaders = {
    dashboard: loadDashboard,
    dpjp: loadDPJP,
    ppds: loadPPDS,
    attendance: loadAttendance,
    employees: loadEmployees,
    access: loadAccessLogs,
    devices: loadDevices,
    reports: loadReports
  };
  const content = document.getElementById('content');
  content.innerHTML = '<div class="flex items-center justify-center h-64"><i class="fas fa-spinner fa-spin text-3xl text-rssa-500"></i></div>';
  if (loaders[page]) await loaders[page]();
}

// =====================================================
// DASHBOARD PAGE
// =====================================================
async function loadDashboard() {
  const [stats, feed] = await Promise.all([
    fetchAPI('/api/dashboard/stats'),
    fetchAPI('/api/dashboard/live-feed')
  ]);

  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="fade-in">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card bg-white rounded-xl p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center"><i class="fas fa-users text-blue-500"></i></div>
            <span class="text-xs text-gray-400">Total</span>
          </div>
          <div class="text-2xl font-bold text-gray-800">${stats.totalEmployees}</div>
          <div class="text-xs text-gray-500 mt-1">Total Pegawai Aktif</div>
        </div>
        <div class="card bg-white rounded-xl p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center"><i class="fas fa-user-check text-green-500"></i></div>
            <span class="text-xs font-semibold text-green-600">${stats.todayAttendance}/${stats.totalEmployees}</span>
          </div>
          <div class="text-2xl font-bold text-gray-800">${stats.todayAttendance}</div>
          <div class="text-xs text-gray-500 mt-1">Hadir Hari Ini</div>
        </div>
        <div class="card bg-white rounded-xl p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center"><i class="fas fa-user-md text-indigo-500"></i></div>
            <span class="text-xs text-gray-400">${stats.totalDPJP} DPJP</span>
          </div>
          <div class="text-2xl font-bold text-gray-800">${stats.completedSchedules}/${stats.schedulesToday}</div>
          <div class="text-xs text-gray-500 mt-1">Jadwal DPJP Selesai</div>
        </div>
        <div class="card bg-white rounded-xl p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center"><i class="fas fa-shield-alt text-red-500"></i></div>
            <span class="text-xs font-semibold text-red-500">${stats.accessDenied > 0 ? '!' : ''}</span>
          </div>
          <div class="text-2xl font-bold text-gray-800">${stats.accessDenied}</div>
          <div class="text-xs text-gray-500 mt-1">Akses Ditolak Hari Ini</div>
        </div>
      </div>

      <!-- Quick Info Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div class="flex items-center gap-2 mb-1"><i class="fas fa-user-md"></i><span class="text-sm font-medium">DPJP</span></div>
          <div class="text-xl font-bold">${stats.totalDPJP}</div>
        </div>
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div class="flex items-center gap-2 mb-1"><i class="fas fa-graduation-cap"></i><span class="text-sm font-medium">PPDS</span></div>
          <div class="text-xl font-bold">${stats.totalPPDS}</div>
        </div>
        <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div class="flex items-center gap-2 mb-1"><i class="fas fa-tablet-alt"></i><span class="text-sm font-medium">Perangkat Aktif</span></div>
          <div class="text-xl font-bold">${stats.activeDevices}</div>
        </div>
        <div class="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <div class="flex items-center gap-2 mb-1"><i class="fas fa-calendar-check"></i><span class="text-sm font-medium">Jadwal Hari Ini</span></div>
          <div class="text-xl font-bold">${stats.schedulesToday}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Live Feed -->
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-500 rounded-full pulse-dot"></div>
              <h3 class="font-semibold text-gray-800">Aktivitas Terkini</h3>
            </div>
            <span class="text-xs text-gray-400">Real-time</span>
          </div>
          <div class="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            ${feed.map(a => `
              <div class="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 rounded-full flex items-center justify-center ${a.scan_type === 'clock_in' ? 'bg-green-50' : a.scan_type === 'clock_out' ? 'bg-orange-50' : 'bg-blue-50'}">
                  ${a.scan_type === 'clock_in' ? '<i class="fas fa-sign-in-alt text-green-500 text-xs"></i>' : a.scan_type === 'clock_out' ? '<i class="fas fa-sign-out-alt text-orange-500 text-xs"></i>' : '<i class="fas fa-door-open text-blue-500 text-xs"></i>'}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-800 truncate">${a.employee_name || 'Unknown'}</span>
                    ${roleBadge(a.role)}
                  </div>
                  <div class="text-xs text-gray-500">${a.location || ''} &middot; ${methodIcon(a.method)} ${a.confidence_score ? a.confidence_score.toFixed(1) + '%' : ''}</div>
                </div>
                <div class="text-xs text-gray-400 whitespace-nowrap">${formatTime(a.scan_time)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Charts -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-800 mb-4">Kehadiran Minggu Ini</h3>
            <canvas id="attendanceChart" height="200"></canvas>
          </div>
          <div class="bg-white rounded-xl border border-gray-100 p-5">
            <h3 class="font-semibold text-gray-800 mb-4">Distribusi Metode Biometrik</h3>
            <canvas id="methodChart" height="150"></canvas>
          </div>
        </div>
      </div>
    </div>
  `;

  // Charts
  await loadDashboardCharts(feed);
}

async function loadDashboardCharts(feed) {
  const reportData = await fetchAPI('/api/reports/attendance-summary');

  // Attendance Chart
  if (charts.attendance) charts.attendance.destroy();
  const ctx1 = document.getElementById('attendanceChart');
  if (ctx1) {
    charts.attendance = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: reportData.map(r => dayjs(r.date).format('dd DD/MM')),
        datasets: [
          { label: 'DPJP', data: reportData.map(r => r.dpjp_present), backgroundColor: '#3b82f6', borderRadius: 4 },
          { label: 'PPDS', data: reportData.map(r => r.ppds_present), backgroundColor: '#8b5cf6', borderRadius: 4 },
          { label: 'Perawat', data: reportData.map(r => r.nurse_present), backgroundColor: '#22c55e', borderRadius: 4 },
          { label: 'Staff', data: reportData.map(r => r.staff_present), backgroundColor: '#f59e0b', borderRadius: 4 },
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
    });
  }

  // Method Chart
  if (charts.method) charts.method.destroy();
  const faceCt = feed.filter(a => a.method === 'face').length;
  const fpCt = feed.filter(a => a.method === 'fingerprint').length;
  const manCt = feed.filter(a => a.method === 'manual').length;
  const ctx2 = document.getElementById('methodChart');
  if (ctx2) {
    charts.method = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Face Recognition', 'Fingerprint', 'Manual'],
        datasets: [{ data: [faceCt, fpCt, manCt], backgroundColor: ['#3b82f6', '#8b5cf6', '#94a3b8'], borderWidth: 0 }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } } }
    });
  }
}

// =====================================================
// DPJP MONITORING PAGE
// =====================================================
async function loadDPJP() {
  const today = new Date().toISOString().split('T')[0];
  const data = await fetchAPI(`/api/dpjp/monitoring?date=${today}`);
  const content = document.getElementById('content');

  const compRate = data.summary.complianceRate;
  const compColor = compRate >= 80 ? 'green' : compRate >= 60 ? 'yellow' : 'red';

  content.innerHTML = `
    <div class="fade-in">
      <!-- Summary -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-3xl font-bold text-gray-800">${data.summary.total}</div>
          <div class="text-xs text-gray-500 mt-1">Total Jadwal</div>
        </div>
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-3xl font-bold text-green-600">${data.summary.completed}</div>
          <div class="text-xs text-gray-500 mt-1">Selesai</div>
        </div>
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-3xl font-bold text-blue-600">${data.summary.scheduled}</div>
          <div class="text-xs text-gray-500 mt-1">Terjadwal</div>
        </div>
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-3xl font-bold text-red-600">${data.summary.missed}</div>
          <div class="text-xs text-gray-500 mt-1">Tidak Hadir</div>
        </div>
        <div class="card bg-gradient-to-r from-${compColor}-500 to-${compColor}-600 rounded-xl p-4 text-white text-center">
          <div class="text-3xl font-bold">${compRate}%</div>
          <div class="text-xs mt-1 opacity-90">Compliance Rate</div>
        </div>
      </div>

      <!-- Date Filter -->
      <div class="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex items-center gap-4">
        <label class="text-sm font-medium text-gray-600">Tanggal:</label>
        <input type="date" value="${today}" onchange="loadDPJPByDate(this.value)" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-rssa-500 focus:border-transparent outline-none">
      </div>

      <!-- Schedule Table -->
      <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dokter</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Spesialisasi</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aktivitas</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Jadwal</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Clock In</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pasien</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              ${data.schedules.map(s => `
                <tr class="table-row cursor-pointer" onclick="showEmployeeDetail(${s.employee_id})">
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">${s.doctor_name?.charAt(4) || '?'}</div>
                      <div>
                        <div class="text-sm font-medium text-gray-800">${s.doctor_name || '-'}</div>
                        <div class="text-xs text-gray-400">${s.nip || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-600">${s.specialization || '-'}</td>
                  <td class="px-5 py-3">
                    <span class="badge bg-indigo-50 text-indigo-700">${activityLabel(s.activity_type)}</span>
                  </td>
                  <td class="px-5 py-3 text-sm text-gray-700 font-mono">${s.start_time} - ${s.end_time}</td>
                  <td class="px-5 py-3 text-sm ${s.actual_clock_in ? 'text-green-600 font-medium' : 'text-red-500'}">${s.actual_clock_in ? formatTime(s.actual_clock_in) : '<i class="fas fa-times-circle"></i> Belum'}</td>
                  <td class="px-5 py-3 text-sm text-gray-700 text-center">${s.patient_count || 0}</td>
                  <td class="px-5 py-3">${statusBadge(s.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function loadDPJPByDate(date) {
  const data = await fetchAPI(`/api/dpjp/monitoring?date=${date}`);
  // Re-render table only
  const tbody = document.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = data.schedules.map(s => `
      <tr class="table-row cursor-pointer" onclick="showEmployeeDetail(${s.employee_id})">
        <td class="px-5 py-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">${s.doctor_name?.charAt(4) || '?'}</div>
            <div>
              <div class="text-sm font-medium text-gray-800">${s.doctor_name || '-'}</div>
              <div class="text-xs text-gray-400">${s.nip || ''}</div>
            </div>
          </div>
        </td>
        <td class="px-5 py-3 text-sm text-gray-600">${s.specialization || '-'}</td>
        <td class="px-5 py-3"><span class="badge bg-indigo-50 text-indigo-700">${activityLabel(s.activity_type)}</span></td>
        <td class="px-5 py-3 text-sm text-gray-700 font-mono">${s.start_time} - ${s.end_time}</td>
        <td class="px-5 py-3 text-sm ${s.actual_clock_in ? 'text-green-600 font-medium' : 'text-red-500'}">${s.actual_clock_in ? formatTime(s.actual_clock_in) : '<i class="fas fa-times-circle"></i> Belum'}</td>
        <td class="px-5 py-3 text-sm text-gray-700 text-center">${s.patient_count || 0}</td>
        <td class="px-5 py-3">${statusBadge(s.status)}</td>
      </tr>
    `).join('');
  }
}

// =====================================================
// PPDS MONITORING PAGE
// =====================================================
async function loadPPDS() {
  const data = await fetchAPI('/api/ppds/monitoring');
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="fade-in">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-2xl font-bold text-purple-600">${data.length}</div>
          <div class="text-xs text-gray-500 mt-1">Total PPDS Aktif</div>
        </div>
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-2xl font-bold text-green-600">${data.filter(p => p.today_clock_in).length}</div>
          <div class="text-xs text-gray-500 mt-1">Hadir Hari Ini</div>
        </div>
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-2xl font-bold text-red-600">${data.filter(p => !p.today_clock_in).length}</div>
          <div class="text-xs text-gray-500 mt-1">Belum Hadir</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${data.map(p => `
          <div class="card bg-white rounded-xl border border-gray-100 p-5 cursor-pointer" onclick="showEmployeeDetail(${p.id})">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">${p.name.charAt(4)}</div>
                <div>
                  <div class="font-semibold text-gray-800">${p.name}</div>
                  <div class="text-xs text-gray-500">${p.specialization || '-'}</div>
                </div>
              </div>
              <div class="${p.today_clock_in ? 'text-green-500' : 'text-red-400'}">
                <i class="fas fa-circle text-xs"></i>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-gray-400 text-xs">Rotasi:</span>
                <div class="font-medium text-gray-700">${p.rotation_department || '-'}</div>
              </div>
              <div>
                <span class="text-gray-400 text-xs">Pembimbing:</span>
                <div class="font-medium text-gray-700">${p.supervisor_name || '-'}</div>
              </div>
              <div>
                <span class="text-gray-400 text-xs">Clock In:</span>
                <div class="font-medium ${p.today_clock_in ? 'text-green-600' : 'text-red-500'}">${p.today_clock_in ? formatTime(p.today_clock_in) : 'Belum Hadir'}</div>
              </div>
              <div>
                <span class="text-gray-400 text-xs">Kehadiran 30 Hari:</span>
                <div class="font-medium text-gray-700">${p.monthly_attendance_count || 0} hari</div>
              </div>
            </div>
            <div class="mt-3 flex items-center gap-2">
              <span class="badge ${p.stage === 'chief' ? 'bg-amber-100 text-amber-700' : p.stage === 'senior' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}">${(p.stage || 'junior').toUpperCase()}</span>
              <span class="text-xs text-gray-400">${formatDate(p.start_date)} - ${formatDate(p.end_date)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// =====================================================
// ATTENDANCE PAGE
// =====================================================
async function loadAttendance() {
  const today = new Date().toISOString().split('T')[0];
  const data = await fetchAPI(`/api/attendance?date=${today}`);
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="fade-in">
      <!-- Filters -->
      <div class="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Tanggal</label>
          <input type="date" id="attDate" value="${today}" onchange="filterAttendance()" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-rssa-500 outline-none">
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Role</label>
          <select id="attRole" onchange="filterAttendance()" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-rssa-500 outline-none">
            <option value="">Semua</option>
            <option value="dpjp">DPJP</option>
            <option value="ppds">PPDS</option>
            <option value="perawat">Perawat</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-medium text-gray-500 block mb-1">Tipe</label>
          <select id="attType" onchange="filterAttendance()" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-rssa-500 outline-none">
            <option value="">Semua</option>
            <option value="clock_in">Clock In</option>
            <option value="clock_out">Clock Out</option>
            <option value="access">Akses</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waktu</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pegawai</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipe</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Metode</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lokasi</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Confidence</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody id="attBody" class="divide-y divide-gray-50">
              ${renderAttendanceRows(data)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderAttendanceRows(data) {
  return data.map(a => `
    <tr class="table-row cursor-pointer" onclick="showEmployeeDetail(${a.employee_id})">
      <td class="px-5 py-3 text-sm font-mono text-gray-700">${formatTime(a.scan_time)}</td>
      <td class="px-5 py-3">
        <div class="text-sm font-medium text-gray-800">${a.employee_name || '-'}</div>
        <div class="text-xs text-gray-400">${a.department_name || ''}</div>
      </td>
      <td class="px-5 py-3">${roleBadge(a.role)}</td>
      <td class="px-5 py-3">
        <span class="text-xs font-medium ${a.scan_type === 'clock_in' ? 'text-green-600' : a.scan_type === 'clock_out' ? 'text-orange-600' : 'text-blue-600'}">
          ${a.scan_type === 'clock_in' ? '<i class="fas fa-sign-in-alt mr-1"></i>Masuk' : a.scan_type === 'clock_out' ? '<i class="fas fa-sign-out-alt mr-1"></i>Keluar' : '<i class="fas fa-door-open mr-1"></i>Akses'}
        </span>
      </td>
      <td class="px-5 py-3 text-center">${methodIcon(a.method)}</td>
      <td class="px-5 py-3 text-sm text-gray-600">${a.device_location || a.location || '-'}</td>
      <td class="px-5 py-3">
        <div class="flex items-center gap-2">
          <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full ${a.confidence_score >= 95 ? 'bg-green-500' : a.confidence_score >= 85 ? 'bg-yellow-500' : 'bg-red-500'}" style="width:${a.confidence_score || 0}%"></div>
          </div>
          <span class="text-xs text-gray-500">${a.confidence_score ? a.confidence_score.toFixed(1) + '%' : '-'}</span>
        </div>
      </td>
      <td class="px-5 py-3">${statusBadge(a.status)}</td>
    </tr>
  `).join('');
}

async function filterAttendance() {
  const date = document.getElementById('attDate').value;
  const role = document.getElementById('attRole').value;
  const type = document.getElementById('attType').value;
  let url = `/api/attendance?date=${date}`;
  if (role) url += `&role=${role}`;
  if (type) url += `&type=${type}`;
  const data = await fetchAPI(url);
  document.getElementById('attBody').innerHTML = renderAttendanceRows(data);
}

// =====================================================
// EMPLOYEES PAGE
// =====================================================
async function loadEmployees() {
  const [employees, departments] = await Promise.all([
    fetchAPI('/api/employees'),
    fetchAPI('/api/departments')
  ]);
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="fade-in">
      <!-- Filters -->
      <div class="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px]">
          <input type="text" id="empSearch" placeholder="Cari nama atau NIP..." oninput="filterEmployees()" class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-rssa-500 outline-none">
        </div>
        <select id="empRole" onchange="filterEmployees()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Semua Role</option>
          <option value="dpjp">DPJP</option>
          <option value="ppds">PPDS</option>
          <option value="perawat">Perawat</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <select id="empDept" onchange="filterEmployees()" class="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">Semua Departemen</option>
          ${departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
        </select>
      </div>

      <!-- Employee Grid -->
      <div id="empGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${renderEmployeeCards(employees)}
      </div>
    </div>
  `;
}

function renderEmployeeCards(employees) {
  return employees.map(e => `
    <div class="card bg-white rounded-xl border border-gray-100 p-5 cursor-pointer" onclick="showEmployeeDetail(${e.id})">
      <div class="flex items-start gap-3 mb-3">
        <div class="w-11 h-11 bg-gradient-to-br from-rssa-500 to-rssa-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          ${e.name.charAt(4) || '?'}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-gray-800 text-sm truncate">${e.name}</div>
          <div class="text-xs text-gray-400">${e.nip}</div>
        </div>
        ${roleBadge(e.role)}
      </div>
      <div class="space-y-1.5 text-xs text-gray-600">
        ${e.specialization ? `<div><i class="fas fa-stethoscope w-4 text-gray-400"></i> ${e.specialization}</div>` : ''}
        <div><i class="fas fa-building w-4 text-gray-400"></i> ${e.department_name || '-'}</div>
        <div class="flex items-center gap-3">
          <span class="${e.face_registered ? 'text-green-500' : 'text-gray-300'}"><i class="fas fa-smile"></i> Face</span>
          <span class="${e.finger_registered ? 'text-green-500' : 'text-gray-300'}"><i class="fas fa-fingerprint"></i> Finger</span>
        </div>
      </div>
    </div>
  `).join('');
}

async function filterEmployees() {
  const search = document.getElementById('empSearch').value;
  const role = document.getElementById('empRole').value;
  const dept = document.getElementById('empDept').value;
  let url = '/api/employees?';
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (role) url += `role=${role}&`;
  if (dept) url += `department_id=${dept}&`;
  const data = await fetchAPI(url);
  document.getElementById('empGrid').innerHTML = renderEmployeeCards(data);
}

// =====================================================
// ACCESS LOGS PAGE
// =====================================================
async function loadAccessLogs() {
  const today = new Date().toISOString().split('T')[0];
  const [logs, summary] = await Promise.all([
    fetchAPI(`/api/access-logs?date=${today}`),
    fetchAPI(`/api/reports/access-summary?date=${today}`)
  ]);
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="fade-in">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        ${summary.map(s => `
          <div class="card bg-white rounded-xl p-4 border border-gray-100">
            <div class="font-semibold text-gray-800 text-sm mb-2"><i class="fas fa-door-open text-rssa-500 mr-1"></i> ${s.room_name}</div>
            <div class="flex items-center gap-4 text-xs">
              <span class="text-green-600"><i class="fas fa-check mr-1"></i>${s.granted} Diizinkan</span>
              <span class="text-red-600"><i class="fas fa-ban mr-1"></i>${s.denied} Ditolak</span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
        <input type="date" id="accDate" value="${today}" onchange="filterAccessLogs()" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none">
        <select id="accType" onchange="filterAccessLogs()" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none">
          <option value="">Semua Status</option>
          <option value="granted">Diizinkan</option>
          <option value="denied">Ditolak</option>
        </select>
        <input type="text" id="accRoom" placeholder="Filter ruangan..." oninput="filterAccessLogs()" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none">
      </div>

      <!-- Logs Table -->
      <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Waktu</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pegawai</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ruangan</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Metode</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody id="accBody" class="divide-y divide-gray-50">
            ${renderAccessRows(logs)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAccessRows(logs) {
  return logs.map(l => `
    <tr class="table-row ${l.access_type === 'denied' ? 'bg-red-50/50' : ''}">
      <td class="px-5 py-3 text-sm font-mono text-gray-700">${formatTime(l.access_time)}</td>
      <td class="px-5 py-3">
        <div class="text-sm font-medium text-gray-800">${l.employee_name || '<span class="text-red-500 italic">Tidak Dikenali</span>'}</div>
        <div class="text-xs text-gray-400">${l.nip || '-'} ${l.role ? '&middot; ' + l.role.toUpperCase() : ''}</div>
      </td>
      <td class="px-5 py-3 text-sm text-gray-700"><i class="fas fa-door-open text-gray-400 mr-1"></i>${l.room_name}</td>
      <td class="px-5 py-3">${methodIcon(l.method)}</td>
      <td class="px-5 py-3">${statusBadge(l.access_type)}</td>
    </tr>
  `).join('');
}

async function filterAccessLogs() {
  const date = document.getElementById('accDate').value;
  const type = document.getElementById('accType').value;
  const room = document.getElementById('accRoom').value;
  let url = `/api/access-logs?date=${date}`;
  if (type) url += `&type=${type}`;
  if (room) url += `&room=${encodeURIComponent(room)}`;
  const data = await fetchAPI(url);
  document.getElementById('accBody').innerHTML = renderAccessRows(data);
}

// =====================================================
// DEVICES PAGE
// =====================================================
async function loadDevices() {
  const devices = await fetchAPI('/api/devices');
  const content = document.getElementById('content');

  const active = devices.filter(d => d.status === 'active').length;
  const maint = devices.filter(d => d.status === 'maintenance').length;
  const offline = devices.filter(d => d.status === 'inactive').length;

  content.innerHTML = `
    <div class="fade-in">
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-2xl font-bold text-green-600">${active}</div>
          <div class="text-xs text-gray-500">Aktif</div>
        </div>
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-2xl font-bold text-yellow-600">${maint}</div>
          <div class="text-xs text-gray-500">Maintenance</div>
        </div>
        <div class="card bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div class="text-2xl font-bold text-red-600">${offline}</div>
          <div class="text-xs text-gray-500">Nonaktif</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${devices.map(d => `
          <div class="card bg-white rounded-xl border border-gray-100 p-5">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center ${d.status === 'active' ? 'bg-green-50' : d.status === 'maintenance' ? 'bg-yellow-50' : 'bg-red-50'}">
                  <i class="${d.type === 'face_recognition' ? 'fas fa-smile' : d.type === 'fingerprint' ? 'fas fa-fingerprint' : 'fas fa-tablet-alt'} ${d.status === 'active' ? 'text-green-500' : d.status === 'maintenance' ? 'text-yellow-500' : 'text-red-500'}"></i>
                </div>
                <div>
                  <div class="font-semibold text-gray-800 text-sm">${d.name}</div>
                  <div class="text-xs text-gray-400 font-mono">${d.device_code}</div>
                </div>
              </div>
              ${statusBadge(d.status)}
            </div>
            <div class="space-y-1 text-xs text-gray-600">
              <div><i class="fas fa-map-marker-alt w-4 text-gray-400"></i> ${d.location}</div>
              <div><i class="fas fa-network-wired w-4 text-gray-400"></i> ${d.ip_address || '-'}</div>
              <div><i class="fas fa-tag w-4 text-gray-400"></i> ${d.type === 'face_recognition' ? 'Face Recognition' : d.type === 'fingerprint' ? 'Fingerprint' : 'Combo (Face + Finger)'}</div>
              <div><i class="fas fa-sync w-4 text-gray-400"></i> Sync: ${d.last_sync ? formatDateTime(d.last_sync) : 'Belum pernah'}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// =====================================================
// REPORTS PAGE
// =====================================================
async function loadReports() {
  const [attendance, compliance] = await Promise.all([
    fetchAPI('/api/reports/attendance-summary'),
    fetchAPI('/api/reports/dpjp-compliance')
  ]);
  const content = document.getElementById('content');

  content.innerHTML = `
    <div class="fade-in">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Attendance Trend -->
        <div class="bg-white rounded-xl border border-gray-100 p-5">
          <h3 class="font-semibold text-gray-800 mb-4"><i class="fas fa-chart-line text-rssa-500 mr-2"></i>Trend Kehadiran (7 Hari)</h3>
          <canvas id="reportAttChart" height="220"></canvas>
        </div>
        <!-- DPJP Compliance -->
        <div class="bg-white rounded-xl border border-gray-100 p-5">
          <h3 class="font-semibold text-gray-800 mb-4"><i class="fas fa-chart-bar text-rssa-500 mr-2"></i>Compliance DPJP (30 Hari)</h3>
          <canvas id="reportCompChart" height="220"></canvas>
        </div>
      </div>

      <!-- DPJP Compliance Table -->
      <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800"><i class="fas fa-table text-rssa-500 mr-2"></i>Detail Compliance DPJP</h3>
        </div>
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dokter</th>
              <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Spesialisasi</th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Selesai</th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Tidak Hadir</th>
              <th class="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Compliance</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            ${compliance.map(c => `
              <tr class="table-row">
                <td class="px-5 py-3 text-sm font-medium text-gray-800">${c.name}</td>
                <td class="px-5 py-3 text-sm text-gray-600">${c.specialization || '-'}</td>
                <td class="px-5 py-3 text-sm text-center text-gray-700">${c.total_schedules}</td>
                <td class="px-5 py-3 text-sm text-center text-green-600 font-medium">${c.completed}</td>
                <td class="px-5 py-3 text-sm text-center text-red-600 font-medium">${c.missed}</td>
                <td class="px-5 py-3 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full rounded-full ${c.compliance_rate >= 80 ? 'bg-green-500' : c.compliance_rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}" style="width:${c.compliance_rate}%"></div>
                    </div>
                    <span class="text-xs font-semibold ${c.compliance_rate >= 80 ? 'text-green-600' : c.compliance_rate >= 60 ? 'text-yellow-600' : 'text-red-600'}">${c.compliance_rate}%</span>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Charts
  if (charts.reportAtt) charts.reportAtt.destroy();
  const ctx1 = document.getElementById('reportAttChart');
  if (ctx1) {
    charts.reportAtt = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: attendance.map(r => dayjs(r.date).format('dd DD/MM')),
        datasets: [
          { label: 'Total Hadir', data: attendance.map(r => r.total_present), borderColor: '#1e5fa8', backgroundColor: 'rgba(30,95,168,0.1)', fill: true, tension: 0.4 },
          { label: 'DPJP', data: attendance.map(r => r.dpjp_present), borderColor: '#3b82f6', borderDash: [5, 5], tension: 0.4 },
          { label: 'PPDS', data: attendance.map(r => r.ppds_present), borderColor: '#8b5cf6', borderDash: [5, 5], tension: 0.4 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }, scales: { y: { beginAtZero: true } } }
    });
  }

  if (charts.reportComp) charts.reportComp.destroy();
  const ctx2 = document.getElementById('reportCompChart');
  if (ctx2) {
    charts.reportComp = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: compliance.map(c => c.name?.split(',')[0]?.replace('dr. ', '')),
        datasets: [
          { label: 'Selesai', data: compliance.map(c => c.completed), backgroundColor: '#22c55e', borderRadius: 4 },
          { label: 'Tidak Hadir', data: compliance.map(c => c.missed), backgroundColor: '#ef4444', borderRadius: 4 },
          { label: 'Terjadwal', data: compliance.map(c => c.scheduled), backgroundColor: '#93c5fd', borderRadius: 4 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
    });
  }
}

// =====================================================
// EMPLOYEE DETAIL MODAL
// =====================================================
async function showEmployeeDetail(id) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  modalContent.innerHTML = '<div class="p-10 text-center"><i class="fas fa-spinner fa-spin text-2xl text-rssa-500"></i></div>';

  const data = await fetchAPI(`/api/employees/${id}`);

  modalContent.innerHTML = `
    <div class="p-6">
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-gradient-to-br from-rssa-500 to-rssa-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
            ${data.name?.charAt(4) || '?'}
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800">${data.name}</h3>
            <p class="text-sm text-gray-500">${data.nip} &middot; ${roleBadge(data.role)}</p>
            <p class="text-xs text-gray-400 mt-1">${data.specialization || ''} ${data.department_name ? '&middot; ' + data.department_name : ''}</p>
          </div>
        </div>
        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl"><i class="fas fa-times"></i></button>
      </div>

      <!-- Biometric Status -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="flex items-center gap-2 p-3 rounded-lg ${data.face_registered ? 'bg-green-50' : 'bg-red-50'}">
          <i class="fas fa-smile ${data.face_registered ? 'text-green-500' : 'text-red-400'}"></i>
          <span class="text-sm ${data.face_registered ? 'text-green-700' : 'text-red-600'}">${data.face_registered ? 'Face Terdaftar' : 'Face Belum Terdaftar'}</span>
        </div>
        <div class="flex items-center gap-2 p-3 rounded-lg ${data.finger_registered ? 'bg-green-50' : 'bg-red-50'}">
          <i class="fas fa-fingerprint ${data.finger_registered ? 'text-green-500' : 'text-red-400'}"></i>
          <span class="text-sm ${data.finger_registered ? 'text-green-700' : 'text-red-600'}">${data.finger_registered ? 'Fingerprint Terdaftar' : 'Fingerprint Belum'}</span>
        </div>
      </div>

      <!-- Today's Attendance -->
      <div class="mb-6">
        <h4 class="font-semibold text-gray-700 mb-3"><i class="fas fa-clock text-rssa-500 mr-1"></i> Kehadiran Hari Ini</h4>
        ${data.todayAttendance && data.todayAttendance.length > 0 ? `
          <div class="space-y-2">
            ${data.todayAttendance.map(a => `
              <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                <div class="flex items-center gap-2">
                  ${a.scan_type === 'clock_in' ? '<i class="fas fa-sign-in-alt text-green-500"></i>' : a.scan_type === 'clock_out' ? '<i class="fas fa-sign-out-alt text-orange-500"></i>' : '<i class="fas fa-door-open text-blue-500"></i>'}
                  <span class="capitalize">${a.scan_type.replace('_', ' ')}</span>
                </div>
                <div class="flex items-center gap-3">
                  ${methodIcon(a.method)}
                  <span class="font-mono text-gray-600">${formatTime(a.scan_time)}</span>
                  <span class="text-xs text-gray-400">${a.location || ''}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p class="text-sm text-gray-400 italic">Belum ada data kehadiran hari ini</p>'}
      </div>

      ${data.schedules && data.schedules.length > 0 ? `
        <!-- Today's Schedules -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-700 mb-3"><i class="fas fa-calendar text-rssa-500 mr-1"></i> Jadwal Hari Ini</h4>
          <div class="space-y-2">
            ${data.schedules.map(s => `
              <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span class="font-medium">${activityLabel(s.activity_type)}</span>
                  <span class="text-gray-400 ml-2">${s.department_name || ''}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="font-mono text-gray-600">${s.start_time} - ${s.end_time}</span>
                  ${statusBadge(s.status)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${data.recentAccess && data.recentAccess.length > 0 ? `
        <!-- Recent Access -->
        <div>
          <h4 class="font-semibold text-gray-700 mb-3"><i class="fas fa-door-open text-rssa-500 mr-1"></i> Riwayat Akses Terakhir</h4>
          <div class="space-y-1">
            ${data.recentAccess.map(a => `
              <div class="flex items-center justify-between py-1.5 text-sm">
                <span>${a.room_name} ${a.device_name ? '(' + a.device_name + ')' : ''}</span>
                <div class="flex items-center gap-2">
                  ${statusBadge(a.access_type)}
                  <span class="text-xs text-gray-400">${formatDateTime(a.access_time)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// Close modal on overlay click
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// =====================================================
// CLOCK
// =====================================================
function updateClock() {
  const now = new Date();
  document.getElementById('currentTime').textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('currentDate').textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock();

// =====================================================
// INIT
// =====================================================
showPage('dashboard');
