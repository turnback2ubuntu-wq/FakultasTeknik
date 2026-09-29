/**
 * PORTAL AKREDITASI DKPS & REKAPITULASI PDDIKTI - SINTA
 * Universitas PGRI Ronggolawe Tuban (UNIROW)
 * Vanilla JavaScript SPA Engine
 */

let state = {
  activeProdi: 'komparasi', // 'komparasi' | 'informatika' | 'industri'
  activeTab: 'overview',     // 'overview' | 'dosen' | 'scopus' | 'scholar' | 'garuda' | 'riset_pkm' | 'hki_buku' | 'kurikulum' | 'mahasiswa'
  dosenViewMode: 'cards',    // 'cards' | 'table'
  searchQuery: '',
  theme: localStorage.getItem('dkps_theme') || 'dark',
  currentPage: 1,
  pageSize: 15,
  activeModalDosen: null
};

// Charts references
let chartInstances = {};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupGlobalListeners();
  renderApp();
});

function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.innerHTML = state.theme === 'dark' ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('dkps_theme', state.theme);
  initTheme();
  // Re-render charts with updated theme colors
  if (state.activeProdi === 'komparasi') {
    renderComparativeCharts();
  }
}

function setupGlobalListeners() {
  // Theme Toggle
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Global search input
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase().trim();
      state.currentPage = 1;
      renderActiveTabContent();
    });
  }

  // Modal Close
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close-btn');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function switchProdi(prodiKey) {
  state.activeProdi = prodiKey;
  state.activeTab = 'overview';
  state.searchQuery = '';
  state.currentPage = 1;

  // Clear global search input
  const searchInput = document.getElementById('global-search');
  if (searchInput) searchInput.value = '';

  // Update switcher button classes
  document.querySelectorAll('.prodi-btn').forEach(btn => {
    btn.classList.remove('active', 'industri-active', 'compare-active');
    if (btn.dataset.prodi === prodiKey) {
      btn.classList.add('active');
      if (prodiKey === 'industri') btn.classList.add('industri-active');
      if (prodiKey === 'komparasi') btn.classList.add('compare-active');
    }
  });

  renderApp();
}

function switchTab(tabKey) {
  state.activeTab = tabKey;
  state.searchQuery = '';
  state.currentPage = 1;
  const searchInput = document.getElementById('global-search');
  if (searchInput) searchInput.value = '';

  renderTabsNav();
  renderActiveTabContent();
}

function renderApp() {
  const container = document.getElementById('app-main-content');
  if (!container) return;

  if (state.activeProdi === 'komparasi') {
    renderComparativeView(container);
  } else {
    renderSingleProdiView(container, state.activeProdi);
  }
}

/* ===================================================================
   1. KOMPARASI FAKULTAS TEKNIK (INFORMATIKA VS INDUSTRI)
   =================================================================== */

function renderComparativeView(container) {
  const ifData = APP_DATA.informatika;
  const tiData = APP_DATA.industri;

  // Totals calculations
  const ifDosenCount = ifData.dosen_sinta.length;
  const tiDosenCount = tiData.dosen_sinta.length;
  const ifScopusCount = ifData.scopus.length;
  const tiScopusCount = tiData.scopus.length;
  const ifScholarCount = ifData.gscholar.length;
  const tiScholarCount = tiData.gscholar.length;
  const ifGarudaCount = ifData.garuda.length;
  const tiGarudaCount = tiData.garuda.length;
  const ifRisetCount = ifData.penelitian.length;
  const tiRisetCount = tiData.penelitian.length;
  const ifPkmCount = ifData.pengabdian.length;
  const tiPkmCount = tiData.pengabdian.length;
  const ifHkiCount = ifData.hki.length;
  const tiHkiCount = tiData.hki.length;
  const ifBukuCount = ifData.buku.length;
  const tiBukuCount = tiData.buku.length;

  const ifSintaTotal = ifData.dosen_sinta.reduce((acc, d) => acc + (parseInt(d['Overall Score'] || d['SINTA Overall'] || 0) || 0), 0);
  const tiSintaTotal = tiData.dosen_sinta.reduce((acc, d) => acc + (parseInt(d['SINTA Overall'] || d['Overall Score'] || 0) || 0), 0);

  container.innerHTML = `
    <div class="hero-banner">
      <span class="hero-pill-badge">🏛️ FAKULTAS TEKNIK UNIROW • DASHBOARD TERPADU</span>
      <h2 class="hero-title">Komparasi Data Akreditasi & Kinerja Tridharma</h2>
      <p class="hero-desc">
        Visualisasi perbandingan kuantitatif antara <strong>S1 Teknik Informatika</strong> dan <strong>S1 Teknik Industri</strong> berdasarkan pangkalan data resmi <strong>PDDikti</strong> dan <strong>SINTA Kemdiktisaintek RI</strong> per September 2026.
      </p>
    </div>

    <!-- Side-by-side Hero Overview -->
    <div class="compare-hero">
      <div class="compare-box if-box">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h3>💻 S1 Teknik Informatika</h3>
            <p style="color:var(--text-secondary); font-size:12.5px;">Kode Prodi: 55201 • Akreditasi: <strong>Baik Sekali</strong></p>
          </div>
          <button class="btn-primary-outline" onclick="switchProdi('informatika')">Eksplorasi Detail →</button>
        </div>
        <div style="margin-top:16px; display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
          <div style="background:var(--bg-input); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div style="font-size:18px; font-weight:800; color:var(--primary-500);">${ifDosenCount}</div>
            <div style="font-size:11px; color:var(--text-muted);">Dosen DTPS (S2)</div>
          </div>
          <div style="background:var(--bg-input); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div style="font-size:18px; font-weight:800; color:var(--accent-cyan);">438</div>
            <div style="font-size:11px; color:var(--text-muted);">Mahasiswa Aktif</div>
          </div>
          <div style="background:var(--bg-input); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div style="font-size:18px; font-weight:800; color:var(--accent-purple);">${ifSintaTotal.toLocaleString()}</div>
            <div style="font-size:11px; color:var(--text-muted);">Skor SINTA Total</div>
          </div>
        </div>
      </div>

      <div class="compare-box ti-box">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h3>🏭 S1 Teknik Industri</h3>
            <p style="color:var(--text-secondary); font-size:12.5px;">Kode Prodi: 26201 • Akreditasi: <strong>Baik Sekali</strong></p>
          </div>
          <button class="btn-primary-outline" style="border-color:rgba(16,185,129,0.4); color:#10b981;" onclick="switchProdi('industri')">Eksplorasi Detail →</button>
        </div>
        <div style="margin-top:16px; display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
          <div style="background:var(--bg-input); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div style="font-size:18px; font-weight:800; color:#10b981;">${tiDosenCount}</div>
            <div style="font-size:11px; color:var(--text-muted);">DTPS (1 S3, 8 S2)</div>
          </div>
          <div style="background:var(--bg-input); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div style="font-size:18px; font-weight:800; color:var(--accent-cyan);">437</div>
            <div style="font-size:11px; color:var(--text-muted);">Mahasiswa Aktif</div>
          </div>
          <div style="background:var(--bg-input); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div style="font-size:18px; font-weight:800; color:var(--accent-amber);">${tiSintaTotal.toLocaleString()}</div>
            <div style="font-size:11px; color:var(--text-muted);">Skor SINTA Total</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparative KPI Grid -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-blue">👥</div>
        <div class="kpi-label">Kecukupan DTPS</div>
        <div class="kpi-value">${ifDosenCount} vs ${tiDosenCount}</div>
        <div class="kpi-desc">Standar Minimal: 5 Dosen (Terpenuhi)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-emerald">⚖️</div>
        <div class="kpi-label">Rasio Dosen : Mahasiswa</div>
        <div class="kpi-value">1:31 vs 1:31</div>
        <div class="kpi-desc">Standar SN-Dikti ≤ 1:35 (Sangat Sehat)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-purple">🌐</div>
        <div class="kpi-label">Publikasi Scopus</div>
        <div class="kpi-value">${ifScopusCount} vs ${tiScopusCount}</div>
        <div class="kpi-desc">Artikel Internasional Bereputasi</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-amber">📚</div>
        <div class="kpi-label">Google Scholar & Sitasi</div>
        <div class="kpi-value">1.675 vs 1.334</div>
        <div class="kpi-desc">Total Sitasi Akademik Google Scholar</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-rose">🔬</div>
        <div class="kpi-label">Hibah Riset Penelitian</div>
        <div class="kpi-value">${ifRisetCount} vs ${tiRisetCount}</div>
        <div class="kpi-desc">Judul Riset Terdata di SINTA</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-blue">💡</div>
        <div class="kpi-label">Perolehan HKI & Paten</div>
        <div class="kpi-value">${ifHkiCount} vs ${tiHkiCount}</div>
        <div class="kpi-desc">Sertifikat DJKI Kemenkumham RI</div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <div class="chart-title">📊 Perbandingan Luaran Tridharma</div>
            <div class="chart-subtitle">Scopus, Riset, PkM, HKI, dan Buku Ajar</div>
          </div>
        </div>
        <div class="chart-canvas-wrap">
          <canvas id="chart-tridharma-compare"></canvas>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div>
            <div class="chart-title">📈 Tren Historis Mahasiswa Aktif</div>
            <div class="chart-subtitle">10 Semester Terakhir (2020/2021 - 2025/2026)</div>
          </div>
        </div>
        <div class="chart-canvas-wrap">
          <canvas id="chart-mhs-trend-compare"></canvas>
        </div>
      </div>
    </div>

    <!-- Download Central -->
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>📥 Unduh Berkas Master Excel (.xlsx)</h3>
          <p>Seluruh data PDDikti & SINTA terintegrasi lengkap 22 sheet untuk keperluan akreditasi</p>
        </div>
      </div>
      <div style="padding: 20px; display:flex; gap:16px; flex-wrap:wrap;">
        <a href="REKAP_SEMUA_DATA_PDDIKTI_DAN_SINTA.xlsx" download class="btn-primary-outline" style="padding:12px 20px; font-size:13px;">
          📊 Unduh Master Excel Teknik Informatika (22 Sheet .xlsx)
        </a>
        <a href="Teknik Industri/REKAP_SEMUA_DATA_PDDIKTI_DAN_SINTA.xlsx" download class="btn-primary-outline" style="padding:12px 20px; font-size:13px; border-color:rgba(16,185,129,0.4); color:#10b981;">
          📊 Unduh Master Excel Teknik Industri (22 Sheet .xlsx)
        </a>
      </div>
    </div>
  `;

  // Initialize Charts
  setTimeout(renderComparativeCharts, 50);
}

function renderComparativeCharts() {
  const isDark = state.theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  // Destroy previous instances
  if (chartInstances.tridharma) chartInstances.tridharma.destroy();
  if (chartInstances.mhs) chartInstances.mhs.destroy();

  const ctxTridharma = document.getElementById('chart-tridharma-compare');
  if (ctxTridharma && typeof Chart !== 'undefined') {
    chartInstances.tridharma = new Chart(ctxTridharma, {
      type: 'bar',
      data: {
        labels: ['Scopus', 'Scholar (x10)', 'Garuda', 'Penelitian', 'PkM', 'HKI/Paten', 'Buku Ajar'],
        datasets: [
          {
            label: 'Teknik Informatika',
            data: [10, 70.5, 510, 12, 15, 12, 12],
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderColor: '#3b82f6',
            borderRadius: 6
          },
          {
            label: 'Teknik Industri',
            data: [11, 90.0, 222, 502, 139, 131, 3],
            backgroundColor: 'rgba(16, 185, 129, 0.85)',
            borderColor: '#10b981',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } } }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  const ctxMhs = document.getElementById('chart-mhs-trend-compare');
  if (ctxMhs && typeof Chart !== 'undefined') {
    // 10 recent semesters
    const semesters = ['2020/21 Ganjil', '2020/21 Genap', '2021/22 Ganjil', '2021/22 Genap', '2022/23 Ganjil', '2022/23 Genap', '2023/24 Ganjil', '2023/24 Genap', '2024/25 Ganjil', '2024/25 Genap'];
    const ifMhs = [280, 276, 268, 267, 325, 324, 379, 379, 437, 438];
    const tiMhs = [280, 276, 268, 267, 325, 324, 379, 379, 437, 436];

    chartInstances.mhs = new Chart(ctxMhs, {
      type: 'line',
      data: {
        labels: semesters,
        datasets: [
          {
            label: 'Teknik Informatika',
            data: ifMhs,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5
          },
          {
            label: 'Teknik Industri',
            data: tiMhs,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } } }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }
}

/* ===================================================================
   2. SINGLE PRODI VIEW (INFORMATIKA ATAU INDUSTRI)
   =================================================================== */

function renderSingleProdiView(container, prodiKey) {
  const isIF = prodiKey === 'informatika';
  const prodiName = isIF ? 'S1 Teknik Informatika' : 'S1 Teknik Industri';
  const prodiCode = isIF ? '55201' : '26201';
  const pddiktiData = APP_DATA[prodiKey];

  container.innerHTML = `
    <div class="hero-banner">
      <span class="hero-pill-badge">${isIF ? '💻 TEKNOLOGI INFORMASI' : '🏭 REKAYASA INDUSTRI'} • KODE PRODI: ${prodiCode}</span>
      <h2 class="hero-title">${prodiName}</h2>
      <p class="hero-desc">
        Pusat Data Kuantitatif & Rekapitulasi Tridharma Resmi Program Studi ${prodiName}, Fakultas Teknik, Universitas PGRI Ronggolawe Tuban. Terakreditasi <strong>Baik Sekali</strong>.
      </p>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-nav" id="prodi-subtabs-nav"></div>

    <!-- Tab Content Area -->
    <div id="prodi-tab-content"></div>
  `;

  renderTabsNav();
  renderActiveTabContent();
}

function renderTabsNav() {
  const nav = document.getElementById('prodi-subtabs-nav');
  if (!nav) return;

  const prodiKey = state.activeProdi;
  const data = APP_DATA[prodiKey];

  const tabs = [
    { key: 'overview', label: '📊 Ringkasan & Profil', badge: 'Akreditasi' },
    { key: 'dosen', label: '👨‍🏫 Dosen DTPS', badge: data.dosen_sinta.length },
    { key: 'scopus', label: '🌐 Scopus', badge: data.scopus.length },
    { key: 'scholar', label: '📚 Google Scholar', badge: data.gscholar.length },
    { key: 'garuda', label: '🇮🇩 Garuda / SINTA', badge: data.garuda.length },
    { key: 'riset_pkm', label: '🔬 Riset & PkM', badge: data.penelitian.length + data.pengabdian.length },
    { key: 'hki_buku', label: '💡 HKI & Buku', badge: data.hki.length + data.buku.length },
    { key: 'kurikulum', label: '📖 Kurikulum & Matkul', badge: data.kurikulum.length },
    { key: 'mahasiswa', label: '👥 Mahasiswa', badge: '49 Sem' },
  ];

  nav.innerHTML = tabs.map(t => `
    <button class="tab-link ${state.activeTab === t.key ? 'active' : ''}" onclick="switchTab('${t.key}')">
      ${t.label}
      <span class="tab-badge">${t.badge}</span>
    </button>
  `).join('');
}

function renderActiveTabContent() {
  const container = document.getElementById('prodi-tab-content');
  if (!container) return;

  const prodiKey = state.activeProdi;
  const data = APP_DATA[prodiKey];

  switch (state.activeTab) {
    case 'overview':
      renderTabOverview(container, data, prodiKey);
      break;
    case 'dosen':
      renderTabDosen(container, data, prodiKey);
      break;
    case 'scopus':
      renderTabScopus(container, data, prodiKey);
      break;
    case 'scholar':
      renderTabScholar(container, data, prodiKey);
      break;
    case 'garuda':
      renderTabGaruda(container, data, prodiKey);
      break;
    case 'riset_pkm':
      renderTabRisetPkM(container, data, prodiKey);
      break;
    case 'hki_buku':
      renderTabHKIBuku(container, data, prodiKey);
      break;
    case 'kurikulum':
      renderTabKurikulum(container, data, prodiKey);
      break;
    case 'mahasiswa':
      renderTabMahasiswa(container, data, prodiKey);
      break;
    default:
      renderTabOverview(container, data, prodiKey);
  }
}

/* ===================================================================
   TAB RENDERERS
   =================================================================== */

// 1. Overview Tab
function renderTabOverview(container, data, prodiKey) {
  const isIF = prodiKey === 'informatika';
  const dosenCount = data.dosen_sinta.length;
  const scopusCount = data.scopus.length;
  const scholarCount = data.gscholar.length;
  const sintaTotal = data.dosen_sinta.reduce((acc, d) => acc + (parseInt(d['SINTA Overall'] || d['Overall Score'] || 0) || 0), 0);

  container.innerHTML = `
    <!-- KPI Overview -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-blue">👨‍🏫</div>
        <div class="kpi-label">Dosen Tetap (DTPS)</div>
        <div class="kpi-value">${dosenCount} Dosen</div>
        <div class="kpi-desc">100% S2/S3 & Tersertifikasi Serdik</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-emerald">🎓</div>
        <div class="kpi-label">Peringkat Akreditasi</div>
        <div class="kpi-value" style="color:var(--accent-emerald);">Baik Sekali</div>
        <div class="kpi-desc">Standar LAM / BAN-PT (Status Aktif)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-purple">🌐</div>
        <div class="kpi-label">Publikasi Scopus</div>
        <div class="kpi-value">${scopusCount} Artikel</div>
        <div class="kpi-desc">Jurnal Internasional Bereputasi</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon-wrap kpi-icon-amber">⚡</div>
        <div class="kpi-label">Total Skor SINTA</div>
        <div class="kpi-value">${sintaTotal.toLocaleString()}</div>
        <div class="kpi-desc">Akumulasi Skor SINTA Overall DTPS</div>
      </div>
    </div>

    <!-- Identitas Table -->
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>📌 Profil Resmi Program Studi & Perguruan Tinggi (PDDikti)</h3>
          <p>Data identitas dan izin operasional resmi Kementerian Pendidikan Tinggi, Sains, dan Teknologi</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <tbody>
            <tr><td style="width:280px; font-weight:700;">Nama Program Studi</td><td>${isIF ? 'S1 Teknik Informatika' : 'S1 Teknik Industri'}</td></tr>
            <tr><td style="font-weight:700;">Kode Program Studi</td><td>${isIF ? '55201' : '26201'}</td></tr>
            <tr><td style="font-weight:700;">Perguruan Tinggi</td><td>Universitas PGRI Ronggolawe Tuban (Kode PT: 071073 | SINTA Affiliation ID: 2100)</td></tr>
            <tr><td style="font-weight:700;">Unit Pengelola (UPPS)</td><td>Fakultas Teknik</td></tr>
            <tr><td style="font-weight:700;">Peringkat Akreditasi</td><td><span class="badge badge-emerald">Baik Sekali</span> (Status: Aktif)</td></tr>
            <tr><td style="font-weight:700;">SK Izin Penyelenggaraan</td><td>${isIF ? '9895/D/T/K-VII/2011' : '180/D/O/2007'}</td></tr>
            <tr><td style="font-weight:700;">Rasio Dosen : Mahasiswa</td><td><span class="badge badge-blue">${isIF ? '1 : 31.43' : '1 : 31.21'}</span> (Sesuai SN-Dikti ≤ 1:35)</td></tr>
            <tr><td style="font-weight:700;">Rentang Biaya Kuliah</td><td>Rp 3.960.000,- per semester</td></tr>
            <tr><td style="font-weight:700;">Alamat Kampus</td><td>Jl. Manunggal No. 61, Tuban, Jawa Timur 62381</td></tr>
            <tr><td style="font-weight:700;">Website & Kontak</td><td>${isIF ? 'http://informatika.unirow.ac.id/ | prodi@informatika.unirow.ac.id' : 'http://industri.unirow.ac.id/ | prodi@industri.unirow.ac.id'} | Telp: (0356) 322233</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 2. Dosen DTPS Tab
function renderTabDosen(container, data, prodiKey) {
  const dosenList = data.dosen_sinta;
  const filtered = filterList(dosenList, ['Nama Dosen', 'NIDN', 'SINTA ID', 'Pendidikan Pascasarjana']);

  container.innerHTML = `
    <div class="table-toolbar" style="margin-bottom:20px; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
      <div class="table-title-area">
        <h3>Dosen Tetap Penugasan Program Studi (DTPS)</h3>
        <p>Menampilkan ${filtered.length} dosen tetap ber-NIDN aktif lengkap dengan metrik SINTA</p>
      </div>
      <div class="table-controls">
        <input type="text" class="table-search-input" placeholder="Cari dosen, NIDN..." value="${state.searchQuery}" oninput="onTabSearch(this.value)">
      </div>
    </div>

    <div class="dosen-cards-grid">
      ${filtered.map(d => {
        const name = d['Nama Dosen'] || d['nama_dosen'] || '-';
        const nidn = d['NIDN'] || d['nidn'] || '-';
        const sintaId = d['SINTA ID'] || d['sinta_id'] || '-';
        const sintaOv = d['SINTA Overall'] || d['Overall Score'] || d['sinta_score_overall'] || '0';
        const scopusArt = d['Scopus Articles'] || d['scopus_art'] || (d['Scopus (Art/H)'] ? d['Scopus (Art/H)'].split('/')[0].trim() : '0');
        const scholarCit = d['Scholar Citations'] || d['gscholar_cit'] || (d['Scholar (Art/Cit/H)'] ? d['Scholar (Art/Cit/H)'].split('/')[1]?.trim() : '0');

        return `
          <div class="dosen-card" onclick="openDosenModal('${escapeHtml(name)}', '${prodiKey}')">
            <div>
              <div class="dosen-header">
                <div class="dosen-avatar">${getInitials(name)}</div>
                <div class="dosen-info">
                  <h4>${escapeHtml(name)}</h4>
                  <div class="dosen-nidn">NIDN: ${nidn}</div>
                  <div style="margin-top:4px;">
                    <span class="badge badge-emerald">Serdik: V</span>
                    <span class="badge badge-blue">SINTA ID: ${sintaId}</span>
                  </div>
                </div>
              </div>
              <div class="dosen-metrics-grid">
                <div>
                  <div class="dosen-metric-val" style="color:var(--primary-500);">${sintaOv}</div>
                  <div class="dosen-metric-lbl">SINTA Ov.</div>
                </div>
                <div>
                  <div class="dosen-metric-val" style="color:var(--accent-purple);">${scopusArt}</div>
                  <div class="dosen-metric-lbl">Scopus Art.</div>
                </div>
                <div>
                  <div class="dosen-metric-val" style="color:var(--accent-amber);">${scholarCit}</div>
                  <div class="dosen-metric-lbl">Sitasi Scholar</div>
                </div>
              </div>
            </div>
            <div class="dosen-footer">
              <span>Klik untuk melihat dossier lengkap</span>
              <span style="font-weight:700;">→</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// 3. Scopus Tab
function renderTabScopus(container, data, prodiKey) {
  const list = data.scopus;
  const filtered = filterList(list, ['Judul', 'Judul Artikel Ilmiah', 'Nama Dosen', 'Penulis DTPS', 'Nama Dosen DTPS', 'Jurnal', 'Nama Jurnal / Prosiding']);

  container.innerHTML = `
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>Publikasi Internasional Terindeks Scopus (${filtered.length} Artikel)</h3>
          <p>Seluruh publikasi bereputasi terindeks Scopus karya dosen DTPS</p>
        </div>
        <div class="table-controls">
          <input type="text" class="table-search-input" placeholder="Cari judul, penulis..." value="${state.searchQuery}" oninput="onTabSearch(this.value)">
          <button class="btn-primary-outline" onclick="exportCurrentTableToCSV('Scopus_${prodiKey}.csv')">📥 Ekspor CSV</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table" id="export-target-table">
          <thead>
            <tr>
              <th style="width:50px;">No</th>
              <th>Judul Artikel Ilmiah</th>
              <th>Penulis (DTPS)</th>
              <th style="width:80px;">Quartile</th>
              <th style="width:70px;">Tahun</th>
              <th style="width:70px;">Sitasi</th>
              <th>Nama Jurnal / Prosiding</th>
              <th style="width:90px;">Tautan</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? '<tr><td colspan="8" style="text-align:center; padding:24px;">Tidak ada data artikel.</td></tr>' :
              filtered.map((item, idx) => {
                const title = item['Judul'] || item['Judul Artikel Ilmiah'] || '-';
                const author = item['Nama Dosen'] || item['Penulis DTPS'] || item['Nama Dosen DTPS'] || '-';
                const q = item['Quartile'] || '-';
                const year = item['Tahun'] || '-';
                const cit = item['Sitasi'] || '0';
                const pub = item['Jurnal'] || item['Nama Jurnal / Prosiding'] || item['publikasi'] || '-';
                const link = item['Link'] || item['Link / DOI'] || item['link'] || '';

                let qBadge = 'badge-noq';
                if (q.includes('Q2')) qBadge = 'badge-q2';
                else if (q.includes('Q3')) qBadge = 'badge-q3';
                else if (q.includes('Q4')) qBadge = 'badge-q4';

                return `
                  <tr>
                    <td style="text-align:center;">${idx + 1}</td>
                    <td style="font-weight:600; color:var(--text-primary);">${escapeHtml(title)}</td>
                    <td style="white-space:nowrap;"><strong>${escapeHtml(author)}</strong></td>
                    <td style="text-align:center;"><span class="badge ${qBadge}">${q}</span></td>
                    <td style="text-align:center;">${year}</td>
                    <td style="text-align:center;"><span class="badge badge-amber">${cit} cit</span></td>
                    <td>${escapeHtml(pub)}</td>
                    <td style="text-align:center;">
                      ${link ? `<a href="${link}" target="_blank" rel="noopener" class="badge badge-blue">Lihat DOI ↗</a>` : '-'}
                    </td>
                  </tr>
                `;
              }).join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 4. Google Scholar Tab (Paginated)
function renderTabScholar(container, data, prodiKey) {
  const list = data.gscholar;
  const filtered = filterList(list, ['Judul', 'Nama Dosen', 'Nama Dosen DTPS', 'Jurnal', 'Jurnal / Penerbit']);
  const paginated = paginateList(filtered, state.currentPage, state.pageSize);

  container.innerHTML = `
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>Publikasi Google Scholar (${filtered.length} Dokumen Terdaftar)</h3>
          <p>Menampilkan halaman ${state.currentPage} dari ${paginated.totalPages}</p>
        </div>
        <div class="table-controls">
          <input type="text" class="table-search-input" placeholder="Cari artikel scholar..." value="${state.searchQuery}" oninput="onTabSearch(this.value)">
          <button class="btn-primary-outline" onclick="exportCurrentTableToCSV('GoogleScholar_${prodiKey}.csv')">📥 Ekspor CSV</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table" id="export-target-table">
          <thead>
            <tr>
              <th style="width:50px;">No</th>
              <th>Judul Publikasi</th>
              <th>Penulis</th>
              <th style="width:70px;">Tahun</th>
              <th style="width:80px;">Sitasi</th>
              <th>Jurnal / Penerbit</th>
              <th style="width:80px;">Tautan</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.items.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding:24px;">Tidak ada artikel ditemukan.</td></tr>' :
              paginated.items.map((item, idx) => {
                const globalIdx = (state.currentPage - 1) * state.pageSize + idx + 1;
                const title = item['Judul'] || item['judul'] || '-';
                const author = item['Nama Dosen'] || item['Nama Dosen DTPS'] || item['nama_dosen'] || '-';
                const year = item['Tahun'] || item['tahun'] || '-';
                const cit = item['Sitasi'] || item['sitasi'] || '0';
                const pub = item['Jurnal'] || item['Jurnal / Penerbit'] || item['publikasi'] || '-';
                const link = item['Link'] || item['link'] || '';

                return `
                  <tr>
                    <td style="text-align:center;">${globalIdx}</td>
                    <td style="font-weight:600;">${escapeHtml(title)}</td>
                    <td style="white-space:nowrap;">${escapeHtml(author)}</td>
                    <td style="text-align:center;">${year}</td>
                    <td style="text-align:center;"><span class="badge badge-amber">${cit}</span></td>
                    <td>${escapeHtml(pub)}</td>
                    <td style="text-align:center;">${link ? `<a href="${link}" target="_blank" rel="noopener" class="badge badge-blue">Tautan ↗</a>` : '-'}</td>
                  </tr>
                `;
              }).join('')
            }
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div>Menampilkan ${paginated.start} - ${paginated.end} dari total ${filtered.length} artikel</div>
        <div class="pagination-controls">
          <button class="page-btn" ${state.currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${state.currentPage - 1})">← Sebelumnya</button>
          <span style="padding:0 8px; font-weight:600;">Halaman ${state.currentPage} / ${paginated.totalPages || 1}</span>
          <button class="page-btn" ${state.currentPage >= paginated.totalPages ? 'disabled' : ''} onclick="changePage(${state.currentPage + 1})">Selanjutnya →</button>
        </div>
      </div>
    </div>
  `;
}

// 5. Garuda Tab (Paginated)
function renderTabGaruda(container, data, prodiKey) {
  const list = data.garuda;
  const filtered = filterList(list, ['Judul', 'Nama Dosen', 'Nama Dosen DTPS', 'Jurnal', 'Nama Jurnal']);
  const paginated = paginateList(filtered, state.currentPage, state.pageSize);

  container.innerHTML = `
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>Publikasi Jurnal Nasional Garuda / SINTA (${filtered.length} Artikel)</h3>
          <p>Publikasi pada jurnal nasional terakreditasi karya dosen</p>
        </div>
        <div class="table-controls">
          <input type="text" class="table-search-input" placeholder="Cari jurnal nasional..." value="${state.searchQuery}" oninput="onTabSearch(this.value)">
          <button class="btn-primary-outline" onclick="exportCurrentTableToCSV('Garuda_${prodiKey}.csv')">📥 Ekspor CSV</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table" id="export-target-table">
          <thead>
            <tr>
              <th style="width:50px;">No</th>
              <th>Judul Artikel Ilmiah</th>
              <th>Penulis</th>
              <th style="width:70px;">Tahun</th>
              <th>Nama Jurnal Nasional</th>
              <th style="width:80px;">Tautan</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.items.map((item, idx) => {
              const globalIdx = (state.currentPage - 1) * state.pageSize + idx + 1;
              return `
                <tr>
                  <td style="text-align:center;">${globalIdx}</td>
                  <td style="font-weight:600;">${escapeHtml(item['Judul'] || item['judul'] || '-')}</td>
                  <td style="white-space:nowrap;">${escapeHtml(item['Nama Dosen'] || item['Nama Dosen DTPS'] || item['nama_dosen'] || '-')}</td>
                  <td style="text-align:center;">${item['Tahun'] || item['tahun'] || '-'}</td>
                  <td>${escapeHtml(item['Jurnal'] || item['Nama Jurnal'] || item['publikasi'] || '-')}</td>
                  <td style="text-align:center;">
                    ${item['Link'] || item['link'] ? `<a href="${item['Link'] || item['link']}" target="_blank" rel="noopener" class="badge badge-emerald">Buka ↗</a>` : '-'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div>Menampilkan ${paginated.start} - ${paginated.end} dari total ${filtered.length} artikel</div>
        <div class="pagination-controls">
          <button class="page-btn" ${state.currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${state.currentPage - 1})">← Sebelumnya</button>
          <span style="padding:0 8px; font-weight:600;">Halaman ${state.currentPage} / ${paginated.totalPages || 1}</span>
          <button class="page-btn" ${state.currentPage >= paginated.totalPages ? 'disabled' : ''} onclick="changePage(${state.currentPage + 1})">Selanjutnya →</button>
        </div>
      </div>
    </div>
  `;
}

// 6. Riset & PkM Tab
function renderTabRisetPkM(container, data, prodiKey) {
  const risetList = data.penelitian;
  const pkmList = data.pengabdian;

  container.innerHTML = `
    <!-- Penelitian Table -->
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>🔬 Rekam Jejak Riset & Hibah Penelitian (${risetList.length} Kegiatan)</h3>
          <p>Kegiatan penelitian didanai hibah DRTPM, Kemdikbudristek, dan riset internal</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:50px;">No</th>
              <th>Ketua / Pelaksana</th>
              <th>Judul Kegiatan Riset</th>
              <th>Skema Pendanaan</th>
              <th style="width:70px;">Tahun</th>
              <th>Dana</th>
            </tr>
          </thead>
          <tbody>
            ${risetList.slice(0, 25).map((item, idx) => `
              <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td style="white-space:nowrap; font-weight:600;">${escapeHtml(item['Ketua'] || item['Ketua / Dosen'] || item['nama_dosen'] || '-')}</td>
                <td>${escapeHtml(item['Judul'] || item['Judul Penelitian'] || '-')}</td>
                <td><span class="badge badge-purple">${escapeHtml(item['Skema'] || item['Skema Pendanaan'] || '-')}</span></td>
                <td style="text-align:center;">${item['Tahun'] || item['tahun'] || '-'}</td>
                <td style="font-weight:600; color:var(--accent-emerald);">${escapeHtml(item['Dana'] || item['Nominal Dana (Rp)'] || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${risetList.length > 25 ? `<div class="table-footer"><span>Menampilkan sampel 25 judul dari total ${risetList.length} riset terdaftar. Seluruh data dapat diunduh di berkas Master Excel.</span></div>` : ''}
    </div>

    <!-- PkM Table -->
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>🤝 Pengabdian Kepada Masyarakat (${pkmList.length} Kegiatan)</h3>
          <p>Program pemberdayaan masyarakat, UMKM, dan industri mitra binaan</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:50px;">No</th>
              <th>Ketua / Pelaksana</th>
              <th>Judul Program PkM</th>
              <th>Skema Pendanaan</th>
              <th style="width:70px;">Tahun</th>
            </tr>
          </thead>
          <tbody>
            ${pkmList.slice(0, 25).map((item, idx) => `
              <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td style="white-space:nowrap; font-weight:600;">${escapeHtml(item['Ketua'] || item['Ketua / Dosen'] || item['nama_dosen'] || '-')}</td>
                <td>${escapeHtml(item['Judul'] || item['Judul Kegiatan PkM'] || '-')}</td>
                <td><span class="badge badge-blue">${escapeHtml(item['Skema'] || item['Skema Pendanaan'] || '-')}</span></td>
                <td style="text-align:center;">${item['Tahun'] || item['tahun'] || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 7. HKI & Buku Ajar Tab
function renderTabHKIBuku(container, data, prodiKey) {
  const hkiList = data.hki;
  const bukuList = data.buku;

  container.innerHTML = `
    <!-- HKI Table -->
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>💡 Hak Kekayaan Intelektual / Paten (${hkiList.length} Sertifikat Terdaftar)</h3>
          <p>Karya cipta piranti lunak, algoritma, desain sistem industri terdaftar resmi DJKI</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:50px;">No</th>
              <th>Inventor / Penulis</th>
              <th>Judul Ciptaan / Paten</th>
              <th style="width:70px;">Tahun</th>
              <th>Keterangan / Nomor Pendaftaran</th>
            </tr>
          </thead>
          <tbody>
            ${hkiList.slice(0, 25).map((item, idx) => `
              <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td style="white-space:nowrap; font-weight:600;">${escapeHtml(item['Inventor'] || item['Inventor / Dosen'] || item['nama_dosen'] || '-')}</td>
                <td style="font-weight:600; color:var(--text-primary);">${escapeHtml(item['Judul'] || item['Judul Ciptaan / Paten'] || '-')}</td>
                <td style="text-align:center;"><span class="badge badge-emerald">${item['Tahun'] || item['tahun'] || '-'}</span></td>
                <td style="font-size:11.5px; color:var(--text-muted);">${escapeHtml(item['Deskripsi'] || item['Keterangan / Nomor Pendaftaran'] || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Buku Table -->
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>📖 Buku Ajar & Referensi Ber-ISBN (${bukuList.length} Buku)</h3>
          <p>Buku teks ajar, modul praktikum, dan monograf ber-ISBN karya dosen DTPS</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:50px;">No</th>
              <th>Penulis</th>
              <th>Judul Buku</th>
              <th style="width:70px;">Tahun</th>
              <th>Penerbit / Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            ${bukuList.map((item, idx) => `
              <tr>
                <td style="text-align:center;">${idx + 1}</td>
                <td style="white-space:nowrap; font-weight:600;">${escapeHtml(item['Penulis'] || item['Penulis / Dosen'] || item['nama_dosen'] || '-')}</td>
                <td style="font-weight:700; color:var(--primary-500);">${escapeHtml(item['Judul'] || item['Judul Buku Ajar / Monograf'] || '-')}</td>
                <td style="text-align:center;"><span class="badge badge-amber">${item['Tahun'] || item['tahun'] || '-'}</span></td>
                <td>${escapeHtml(item['Deskripsi'] || item['Deskripsi / ISBN'] || 'Buku Ber-ISBN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// 8. Kurikulum Tab
function renderTabKurikulum(container, data, prodiKey) {
  const list = data.kurikulum;
  const filtered = filterList(list, ['Kode MK', 'Kode Mata Kuliah', 'Nama Mata Kuliah', 'Dosen Pengampu']);
  const paginated = paginateList(filtered, state.currentPage, state.pageSize);

  container.innerHTML = `
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>📖 Struktur Kurikulum & Mata Kuliah (${filtered.length} Mata Kuliah)</h3>
          <p>Mata kuliah terkonstruksi dari pangkalan data riwayat pengajaran PDDikti</p>
        </div>
        <div class="table-controls">
          <input type="text" class="table-search-input" placeholder="Cari nama mata kuliah, kode MK..." value="${state.searchQuery}" oninput="onTabSearch(this.value)">
          <button class="btn-primary-outline" onclick="exportCurrentTableToCSV('Kurikulum_${prodiKey}.csv')">📥 Ekspor CSV</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table" id="export-target-table">
          <thead>
            <tr>
              <th style="width:50px;">No</th>
              <th style="width:90px;">Kode MK</th>
              <th>Nama Mata Kuliah</th>
              <th style="width:130px;">Semester Terakhir</th>
              <th style="width:90px;">Total Kelas</th>
              <th>Dosen Pengampu</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.items.map((item, idx) => {
              const globalIdx = (state.currentPage - 1) * state.pageSize + idx + 1;
              return `
                <tr>
                  <td style="text-align:center;">${globalIdx}</td>
                  <td style="font-family:monospace; font-weight:700; color:var(--primary-500);">${escapeHtml(item['Kode MK'] || item['Kode Mata Kuliah'] || item['kode_matkul'] || '-')}</td>
                  <td style="font-weight:600;">${escapeHtml(item['Nama Mata Kuliah'] || item['nama_matkul'] || '-')}</td>
                  <td style="text-align:center;"><span class="badge badge-purple">${item['Semester Terakhir'] || item['semester_terakhir'] || '-'}</span></td>
                  <td style="text-align:center; font-weight:700;">${item['Total Kelas'] || item['Total Kelas Diajarkan'] || item['total_kali_diajarkan'] || '1'}</td>
                  <td>${escapeHtml(item['Dosen Pengampu'] || item['dosen_pengampu'] || '-')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <div class="table-footer">
        <div>Menampilkan ${paginated.start} - ${paginated.end} dari total ${filtered.length} mata kuliah</div>
        <div class="pagination-controls">
          <button class="page-btn" ${state.currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${state.currentPage - 1})">← Sebelumnya</button>
          <span style="padding:0 8px; font-weight:600;">Halaman ${state.currentPage} / ${paginated.totalPages || 1}</span>
          <button class="page-btn" ${state.currentPage >= paginated.totalPages ? 'disabled' : ''} onclick="changePage(${state.currentPage + 1})">Selanjutnya →</button>
        </div>
      </div>
    </div>
  `;
}

// 9. Mahasiswa Tab
function renderTabMahasiswa(container, data, prodiKey) {
  const mhsHistory = data.mhs_historis;

  container.innerHTML = `
    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-title-area">
          <h3>👥 Deret Waktu Historis Mahasiswa & Dosen (49 Semester Terakhir)</h3>
          <p>Catatan resmi PDDikti dari semester 20021 hingga semester terkini 20242</p>
        </div>
        <div class="table-controls">
          <button class="btn-primary-outline" onclick="exportCurrentTableToCSV('Mahasiswa_Historis_${prodiKey}.csv')">📥 Ekspor CSV</button>
        </div>
      </div>
      <div class="table-responsive">
        <table class="data-table" id="export-target-table">
          <thead>
            <tr>
              <th style="width:50px;">No</th>
              <th>Tahun Akademik / Semester</th>
              <th style="width:140px; text-align:center;">Mahasiswa Aktif</th>
              <th style="width:140px; text-align:center;">Dosen Homebase</th>
              <th style="width:140px; text-align:center;">Dosen Pengajar</th>
              <th style="width:150px; text-align:center;">Rasio Dosen : Mhs</th>
            </tr>
          </thead>
          <tbody>
            ${mhsHistory.map((item, idx) => {
              const sem = item['Tahun Akademik / Semester'] || item['Semester'] || item['semester'] || '-';
              const mhs = item['Mahasiswa Aktif'] || item['jumlah_mahasiswa'] || 0;
              const dos = item['Dosen Tetap Homebase'] || item['Dosen Tetap'] || item['jumlah_dosen'] || 0;
              const ajar = item['Dosen Pengajar'] || item['Dosen Ajar'] || item['jumlah_dosen_ajar'] || 0;
              const rasio = dos > 0 ? `1 : ${(mhs / dos).toFixed(1)}` : '-';

              return `
                <tr>
                  <td style="text-align:center;">${idx + 1}</td>
                  <td style="font-weight:600;">${escapeHtml(sem)}</td>
                  <td style="text-align:center; font-weight:700; color:var(--primary-500);">${mhs}</td>
                  <td style="text-align:center;">${dos}</td>
                  <td style="text-align:center;">${ajar}</td>
                  <td style="text-align:center;"><span class="badge badge-emerald">${rasio}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ===================================================================
   MODAL DOSEN DOSSIER
   =================================================================== */

function openDosenModal(dosenName, prodiKey) {
  const data = APP_DATA[prodiKey];
  const sintaInfo = data.dosen_sinta.find(d => (d['Nama Dosen'] || d['nama_dosen'] || '').toLowerCase().includes(dosenName.toLowerCase())) || {};
  const lengkapInfo = data.dosen_lengkap.find(d => (d['Nama Dosen'] || d['nama_dosen'] || '').toLowerCase().includes(dosenName.toLowerCase())) || {};

  // Find publications
  const scopusList = data.scopus.filter(d => (d['Nama Dosen'] || d['Penulis DTPS'] || d['Nama Dosen DTPS'] || '').toLowerCase().includes(dosenName.toLowerCase()));
  const scholarList = data.gscholar.filter(d => (d['Nama Dosen'] || d['Nama Dosen DTPS'] || '').toLowerCase().includes(dosenName.toLowerCase()));

  const modalOverlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');

  if (!modalOverlay || !modalTitle || !modalContent) return;

  modalTitle.innerHTML = `👨‍🏫 Dossier Akademik: ${escapeHtml(dosenName)}`;

  modalContent.innerHTML = `
    <div style="display:flex; align-items:flex-start; gap:16px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid var(--border-subtle);">
      <div class="dosen-avatar" style="width:64px; height:64px; font-size:22px;">${getInitials(dosenName)}</div>
      <div>
        <h3 style="font-size:18px; font-weight:800; margin-bottom:4px;">${escapeHtml(dosenName)}</h3>
        <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:6px;">
          NIDN: <strong>${sintaInfo['NIDN'] || lengkapInfo['NIDN'] || '-'}</strong> • Jabatan: <strong>${lengkapInfo['Jabatan Akademik'] || 'Asisten Ahli'}</strong>
        </p>
        <div>
          <span class="badge badge-emerald">Serdik: Terverifikasi</span>
          <span class="badge badge-blue">SINTA ID: ${sintaInfo['SINTA ID'] || '-'}</span>
          <span class="badge badge-purple">${prodiKey === 'informatika' ? 'Teknik Informatika' : 'Teknik Industri'}</span>
        </div>
      </div>
    </div>

    <!-- Riwayat Studi -->
    <div style="margin-bottom:20px;">
      <h4 style="font-size:14px; font-weight:700; margin-bottom:8px; color:var(--primary-500);">🎓 Riwayat Pendidikan</h4>
      <div style="background:var(--bg-input); padding:14px; border-radius:var(--radius-md); font-size:12.5px; line-height:1.6;">
        <div><strong>• S1:</strong> ${lengkapInfo['S1 PT'] || '-'} (${lengkapInfo['S1 Prodi'] || '-'}) ${lengkapInfo['S1 Gelar'] ? ' - ' + lengkapInfo['S1 Gelar'] : ''}</div>
        <div><strong>• S2:</strong> ${lengkapInfo['S2 PT'] || '-'} (${lengkapInfo['S2 Prodi'] || '-'}) ${lengkapInfo['S2 Gelar'] ? ' - ' + lengkapInfo['S2 Gelar'] : ''}</div>
        ${lengkapInfo['S3 PT'] && lengkapInfo['S3 PT'] !== '-' ? `<div><strong>• S3 (Doktor):</strong> ${lengkapInfo['S3 PT']} (${lengkapInfo['S3 Prodi'] || '-'}) ${lengkapInfo['S3 Gelar'] ? ' - ' + lengkapInfo['S3 Gelar'] : ''}</div>` : ''}
      </div>
    </div>

    <!-- Metrik SINTA -->
    <div style="margin-bottom:20px;">
      <h4 style="font-size:14px; font-weight:700; margin-bottom:8px; color:var(--primary-500);">📊 Metrik SINTA & Sitasi</h4>
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px;">
        <div style="background:var(--bg-input); padding:12px; border-radius:var(--radius-sm); text-align:center;">
          <div style="font-size:20px; font-weight:800; color:var(--primary-500);">${sintaInfo['SINTA Overall'] || sintaInfo['Overall Score'] || '0'}</div>
          <div style="font-size:11px; color:var(--text-muted);">SINTA Overall</div>
        </div>
        <div style="background:var(--bg-input); padding:12px; border-radius:var(--radius-sm); text-align:center;">
          <div style="font-size:20px; font-weight:800; color:var(--accent-purple);">${sintaInfo['Scopus Articles'] || (sintaInfo['Scopus (Art/H)'] ? sintaInfo['Scopus (Art/H)'].split('/')[0].trim() : '0')}</div>
          <div style="font-size:11px; color:var(--text-muted);">Scopus Art.</div>
        </div>
        <div style="background:var(--bg-input); padding:12px; border-radius:var(--radius-sm); text-align:center;">
          <div style="font-size:20px; font-weight:800; color:var(--accent-cyan);">${scholarList.length}</div>
          <div style="font-size:11px; color:var(--text-muted);">Scholar Art.</div>
        </div>
        <div style="background:var(--bg-input); padding:12px; border-radius:var(--radius-sm); text-align:center;">
          <div style="font-size:20px; font-weight:800; color:var(--accent-amber);">${sintaInfo['Scholar Citations'] || (sintaInfo['Scholar (Art/Cit/H)'] ? sintaInfo['Scholar (Art/Cit/H)'].split('/')[1]?.trim() : '0')}</div>
          <div style="font-size:11px; color:var(--text-muted);">Total Sitasi</div>
        </div>
      </div>
    </div>

    <!-- Scopus List -->
    <div>
      <h4 style="font-size:14px; font-weight:700; margin-bottom:8px; color:var(--primary-500);">🌐 Artikel Scopus Terindeks (${scopusList.length})</h4>
      ${scopusList.length === 0 ? '<p style="font-size:12px; color:var(--text-muted);">Belum ada artikel Scopus tercatat.</p>' : `
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${scopusList.map(a => `
            <div style="background:var(--bg-input); padding:10px 12px; border-radius:var(--radius-sm); font-size:12px;">
              <div style="font-weight:700; margin-bottom:2px;">${escapeHtml(a['Judul'] || a['Judul Artikel Ilmiah'] || '-')}</div>
              <div style="display:flex; align-items:center; gap:8px; color:var(--text-secondary); font-size:11px;">
                <span class="badge badge-q3">${a['Quartile'] || '-'}</span>
                <span>Tahun: ${a['Tahun'] || '-'}</span>
                <span>Sitasi: ${a['Sitasi'] || '0'}</span>
                <span>${escapeHtml(a['Jurnal'] || a['Nama Jurnal / Prosiding'] || '')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  modalOverlay.classList.add('active');
}

function closeModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) modalOverlay.classList.remove('active');
}

/* ===================================================================
   HELPERS & UTILITIES
   =================================================================== */

function onTabSearch(val) {
  state.searchQuery = val.toLowerCase().trim();
  state.currentPage = 1;
  renderActiveTabContent();
}

function filterList(list, keys) {
  if (!state.searchQuery) return list;
  return list.filter(item => {
    return keys.some(k => {
      const val = item[k];
      return val && String(val).toLowerCase().includes(state.searchQuery);
    });
  });
}

function paginateList(list, page, pageSize) {
  const total = list.length;
  const totalPages = Math.ceil(total / pageSize);
  const cur = Math.max(1, Math.min(page, totalPages || 1));
  const start = (cur - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  return {
    items: list.slice(start, end),
    total,
    totalPages,
    start: total > 0 ? start + 1 : 0,
    end
  };
}

function changePage(newPage) {
  state.currentPage = newPage;
  renderActiveTabContent();
}

function getInitials(name) {
  if (!name) return 'DS';
  const parts = name.replace(/Dr\.|S\.T|S\.Kom|M\.T|M\.Kom|S\.E|M\.S\.M|S\.Si|M\.Si/gi, '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0][0] || 'D').toUpperCase();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function exportCurrentTableToCSV(filename) {
  const table = document.getElementById('export-target-table');
  if (!table) return alert('Tabel tidak ditemukan untuk diekspor.');

  let csv = [];
  const rows = table.querySelectorAll('tr');
  rows.forEach(r => {
    let row = [];
    r.querySelectorAll('th, td').forEach(c => {
      let txt = c.innerText.replace(/"/g, '""').trim();
      row.push(`"${txt}"`);
    });
    csv.push(row.join(','));
  });

  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || 'data_export.csv';
  link.click();
}
