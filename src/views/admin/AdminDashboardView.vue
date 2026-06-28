<template>
  <Transition name="toast">
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
      {{ toast.msg }}
    </div>
  </Transition>

  <main class="adm-main">
    <div class="adm-page-header">
      <h1 class="adm-page-title">Dashboard</h1>
      <p class="adm-page-desc">Ringkasan data Semarak Kemerdekaan ke-81 Teras Country Residence</p>
    </div>

    <div class="stats-grid">
      <div v-for="s in statCards" :key="s.label" class="stat-card">
        <div class="stat-icon">{{ s.icon }}</div>
        <div class="stat-val" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-sub">{{ s.sub }}</div>
      </div>
    </div>

    <div class="row-2">
      <div class="adm-section">
        <div class="section-header">
          <h2 class="section-title">Jadwal Terdekat</h2>
          <RouterLink :to="{ name: 'admin-jadwal' }" class="link-btn">Kelola →</RouterLink>
        </div>
        <div class="mini-list">
          <div v-for="j in jadwalStore.upcoming" :key="j.id" class="mini-row">
            <div style="flex:1;">
              <div class="mini-nama">{{ j.cabang }}</div>
              <div class="mini-sub">{{ j.tgl }} · {{ j.jam }} · {{ j.lokasi || j.venue || '-' }}</div>
            </div>
            <span class="status-badge" :class="statusCls(j.status)">{{ j.status }}</span>
          </div>
          <div v-if="!jadwalStore.upcoming.length" class="empty">Belum ada jadwal mendatang</div>
        </div>
      </div>

      <div class="adm-section">
        <div class="section-header">
          <h2 class="section-title">Pendaftar Terbaru</h2>
          <RouterLink :to="{ name: 'admin-registrasi' }" class="link-btn">Lihat semua →</RouterLink>
        </div>
        <div class="mini-list">
          <div v-for="r in regStore.list.slice(0,5)" :key="r.id" class="mini-row">
            <div class="avatar">{{ (r.nama || '?').charAt(0).toUpperCase() }}</div>
            <div style="flex:1;">
              <div class="mini-nama">{{ r.nama }}</div>
              <div class="mini-sub">{{ r.cabang }} · {{ r.blok || r.blokRumah }}</div>
            </div>
          </div>
          <div v-if="!regStore.list.length" class="empty">Belum ada pendaftar</div>
        </div>
      </div>
    </div>

    <!-- Hasil Pertandingan -->
    <div class="adm-section hasil-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Hasil</div>
          <h2 class="section-title-lg">Hasil Pertandingan</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari hasil..." />
          <button v-if="pendingSync.length" class="btn-sync" :disabled="migrating" @click="migrasiData">
            {{ migrating ? 'Menyinkronkan...' : `Simpan ke Firebase (${pendingSync.length})` }}
          </button>
          <button class="btn-export" @click="doExport">Export Excel</button>
        </div>
      </div>

      <div class="card-grid">
        <div v-for="h in paginated" :key="h.id" class="item-card" @click="selectedHasil = h">
          <div class="item-card-header">
            <div style="display:flex;align-items:center;gap:7px;">
              <span class="dot" :style="{ background: tipeColor(h.kat) }"></span>
              <span class="item-nama">{{ h.cabang }}</span>
            </div>
            <span class="item-tgl">📅 {{ h.tgl }}</span>
          </div>

          <!-- Podium compact (perorangan: ada juara1) -->
          <template v-if="h.juara1">
            <div class="podium-compact">
              <div class="podium-row podium-emas-sm"><span>🥇</span><span>{{ h.juara1 }}</span></div>
              <div v-if="h.juara2" class="podium-row podium-perak-sm"><span>🥈</span><span>{{ h.juara2 }}</span></div>
              <div v-if="h.juara3" class="podium-row podium-perunggu-sm"><span>🥉</span><span>{{ h.juara3 }}</span></div>
            </div>
          </template>
          <!-- VS display (beregu) -->
          <template v-else>
            <div class="skor-display">
              <span :class="{ 'tim-menang': h.juara === h.timA }">{{ h.timA || '—' }}</span>
              <span class="skor-num">{{ h.skor || '—' }}</span>
              <span :class="{ 'tim-menang': h.juara === h.timB }">{{ h.timB || '—' }}</span>
            </div>
            <div v-if="h.juara" class="juara-display">🏆 {{ h.juara }}</div>
          </template>

          <div class="item-actions">
            <button @click.stop="selectedHasil = h" class="btn-detail">Lihat Detail</button>
            <button @click.stop="hapus(h)" class="btn-del">Hapus</button>
          </div>
        </div>
        <div v-if="!filtered.length" class="empty" style="grid-column:1/-1;">{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada hasil pertandingan' }}</div>
      </div>
      <PaginationBar v-model="page" :total="filtered.length" :per-page="PER_PAGE" />
    </div>
  </main>

  <HasilDetailModal :hasil="selectedHasil" @close="selectedHasil = null" />
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useKategoriStore }   from '@/stores/useKategori'
import { useJadwalStore }     from '@/stores/useJadwal'
import { useHasilStore }      from '@/stores/useHasil'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import { useTipeStore }       from '@/stores/useTipe'
import PaginationBar from '@/components/PaginationBar.vue'
import HasilDetailModal from '@/components/HasilDetailModal.vue'
import { exportToExcel } from '@/utils/exportExcel'

const kategoriStore = useKategoriStore()
const jadwalStore   = useJadwalStore()
const hasilStore    = useHasilStore()
const regStore      = useRegistrasiStore()
const tipeStore     = useTipeStore()

const statusCls = (s) => ({ 'Berlangsung':'status-berlangsung', 'Selesai':'status-selesai', 'Akan Datang':'status-akandatang' }[s] || 'status-akandatang')
const tipeColor = (t) => tipeStore.warna(t)

// --- hasil: gabungkan koleksi hasil + jadwal yang punya hasilPertandingan ---
function mapJadwalToHasil(j) {
  const isVs = j.peserta?.includes(' vs ')
  const rec = {
    id: j.id, _source: 'jadwal',
    cabang: j.cabang, kat: j.kat || '', tgl: j.tgl,
    juara: j.pemenang || '',
    juara1: j.juara1 || '', juara2: j.juara2 || '', juara3: j.juara3 || '',
    timA: '', timB: '', skor: '',
  }
  if (isVs) {
    const parts = j.peserta.split(' vs ')
    rec.timA = parts[0]?.trim() || ''
    rec.timB = parts[1]?.trim() || ''
    const m  = (j.hasilPertandingan || '').match(/(\d+)\s*[–\-]\s*(\d+)/)
    rec.skor = m ? `${m[1]} – ${m[2]}` : ''
  } else {
    rec.timA = j.peserta || ''
    rec.skor = j.hasilPertandingan || ''
  }
  return rec
}

const hasilFromJadwal = computed(() =>
  jadwalStore.listWithStatus
    .filter(j => j.hasilPertandingan)
    .map(mapJadwalToHasil)
)

// hasilStore: sudah disimpan via saveHasil (punya jadwalId)
// hasilFromJadwal: data lama yang hanya ada di jadwal (tidak punya jadwalId di koleksi hasil)
const allHasil = computed(() => {
  const savedJadwalIds = new Set(hasilStore.list.map(h => h.jadwalId).filter(Boolean))
  const jadwalOnly = hasilFromJadwal.value.filter(h => !savedJadwalIds.has(h.id))
  return [...hasilStore.list, ...jadwalOnly]
})

// --- stat cards ---
const statCards = computed(() => [
  { icon:'🏷️', label:'Kategori Lomba',   value: kategoriStore.list.length,  sub:'Jenis lomba', color:'#2D5B8A' },
  { icon:'📅', label:'Total Jadwal',     value: jadwalStore.list.length,    sub:'Pertandingan', color:'#CE1126' },
  { icon:'🏆', label:'Hasil Tercatat',   value: allHasil.value.length,      sub:'Pertandingan selesai', color:'#2E7D52' },
  { icon:'📋', label:'Pendaftar',        value: regStore.list.length,       sub:'Peserta terdaftar', color:'#9A6B12' },
])

// --- hasil ---
const selectedHasil = ref(null)
const search   = ref('')
const page     = ref(1)
const PER_PAGE = 9

const filtered  = computed(() => {
  const q = search.value.toLowerCase()
  return allHasil.value.filter(h => !q ||
    (h.cabang||'').toLowerCase().includes(q) ||
    (h.timA||'').toLowerCase().includes(q) ||
    (h.timB||'').toLowerCase().includes(q) ||
    (h.juara||'').toLowerCase().includes(q)
  )
})
const paginated = computed(() => filtered.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))
watch(search, () => { page.value = 1 })

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',      field: (_, i) => i + 1 },
    { label: 'Cabang',  field: 'cabang' },
    { label: 'Tanggal', field: 'tgl' },
    { label: 'Tim A',   field: 'timA' },
    { label: 'Tim B',   field: 'timB' },
    { label: 'Skor',    field: 'skor' },
    { label: 'Juara',   field: 'juara' },
  ], 'hasil-pertandingan')
}

function hapus(h) {
  if (!confirm(`Hapus hasil "${h.cabang}"?`)) return
  if (h._source === 'jadwal') {
    jadwalStore.update(h.id, { hasilPertandingan: null, pemenang: null, juara1: null, juara2: null, juara3: null })
  } else {
    hasilStore.remove(h.id)
  }
}

// --- toast ---
const toast    = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg = msg; toast.type = type; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3500)
}

// --- migrasi data lama ke koleksi hasil ---
const migrating   = ref(false)
const pendingSync = computed(() =>
  jadwalStore.listWithStatus.filter(j =>
    j.hasilPertandingan && !hasilStore.list.some(h => h.jadwalId === j.id)
  )
)

function buildHasilRecord(j) {
  const isVs  = j.peserta?.includes(' vs ')
  const tglRaw = j.tglMulaiRaw
    || (j.tglDate instanceof Date ? j.tglDate.toISOString().slice(0, 10) : null)
    || j.tgl
    || ''
  const rec = {
    cabang:   j.cabang   || '',
    kat:      j.kat      || '',
    tgl:      tglRaw,
    jadwalId: j.id       || '',
    juara:    j.pemenang || '',
    juara1:   j.juara1   || '',
    juara2:   j.juara2   || '',
    juara3:   j.juara3   || '',
    timA: '', timB: '', skor: '',
  }
  if (isVs) {
    const parts = j.peserta.split(' vs ')
    rec.timA = parts[0]?.trim() || ''
    rec.timB = parts[1]?.trim() || ''
    const m  = (j.hasilPertandingan || '').match(/(\d+)\s*[–\-]\s*(\d+)/)
    rec.skor = m ? `${m[1]} – ${m[2]}` : ''
  } else {
    rec.timA = j.peserta || ''
    rec.skor = j.hasilPertandingan || ''
  }
  return rec
}

async function migrasiData() {
  if (!pendingSync.value.length || migrating.value) return
  migrating.value = true
  const toProcess = [...pendingSync.value]
  let berhasil = 0, gagal = 0, lastErr = ''
  try {
    for (const j of toProcess) {
      try {
        await hasilStore.add(buildHasilRecord(j))
        berhasil++
      } catch (e) {
        gagal++
        lastErr = e?.message || String(e)
        console.error(`[migrasi] gagal simpan ${j.cabang}:`, e)
      }
    }
    if (gagal === 0) {
      showToast(`${berhasil} hasil berhasil disimpan ke Firebase.`)
    } else if (berhasil > 0) {
      showToast(`${berhasil} berhasil, ${gagal} gagal: ${lastErr.slice(0,60)}`, 'error')
    } else {
      showToast(`Gagal: ${lastErr.slice(0, 80)}`, 'error')
    }
  } finally {
    migrating.value = false
  }
}

onMounted(() => {
  kategoriStore.fetch()
  jadwalStore.fetch()
  hasilStore.fetch()
  regStore.fetch()
  tipeStore.fetch()
})
</script>

<style scoped>
.adm-main        { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-page-header { margin-bottom:28px; }
.adm-page-title  { font:900 30px/1.1 Archivo; color:#1A1613; margin:0 0 6px; letter-spacing:-.01em; }
.adm-page-desc   { font:500 14px/1.5 'Plus Jakarta Sans'; color:#7A7368; margin:0; }

.stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
.stat-card  { background:#fff; border:1px solid #ECE7DE; border-radius:16px; padding:22px; }
.stat-icon  { font-size:22px; margin-bottom:12px; }
.stat-val   { font:900 38px/1 Archivo; margin-bottom:4px; }
.stat-label { font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; }
.stat-sub   { font:500 12px/1 'Plus Jakarta Sans'; color:#9A9389; margin-top:4px; }

.row-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:28px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:24px; }
.section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; flex-wrap:wrap; gap:12px; }
.section-title  { font:800 18px/1 Archivo; color:#1A1613; margin:0; }
.link-btn       { font:600 13px/1 'Plus Jakarta Sans'; color:#CE1126; text-decoration:none; }

.mini-list { display:flex; flex-direction:column; gap:10px; }
.mini-row  { display:flex; align-items:center; gap:12px; padding:10px 12px; background:#FAF8F3; border:1px solid #F0EBE2; border-radius:10px; }
.mini-nama { font:700 13px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.mini-sub  { font:500 12px/1.3 'Plus Jakarta Sans'; color:#7A7368; margin-top:3px; }
.avatar    { width:32px; height:32px; border-radius:50%; background:#CE1126; color:#fff; display:flex; align-items:center; justify-content:center; font:700 14px/1 Archivo; flex-shrink:0; }

.empty { text-align:center; padding:20px; color:#9A9389; font:500 13px/1 'Plus Jakarta Sans'; }

/* hasil section */
.hasil-section { padding:28px; }
.section-eyebrow { font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#2E7D52; margin-bottom:4px; }
.section-title-lg { font:800 28px/1.05 Archivo; color:#1A1613; margin:0; }
.header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.search-input   { width:220px; }
.btn-export     { padding:10px 18px; border:1.5px solid #2E7D52; border-radius:10px; background:#fff; color:#2E7D52; font:700 13px/1 'Plus Jakarta Sans'; cursor:pointer; white-space:nowrap; transition:background .15s; }
.btn-export:hover { background:#E7F2EB; }
.card-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
.item-card  { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:14px; padding:16px; cursor:pointer; transition:box-shadow .15s, border-color .15s; }
.item-card:hover { box-shadow:0 4px 18px rgba(0,0,0,.08); border-color:#C8C0B4; }
.item-card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:12px; }
.item-nama  { font:800 15px/1.2 Archivo; color:#1A1613; }
.item-tgl   { font:600 12px/1 'Plus Jakarta Sans'; color:#9A9389; flex-shrink:0; }
.dot        { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; margin-top:2px; }
.skor-display  { background:#fff; border-radius:10px; padding:10px 12px; margin-bottom:10px; display:flex; align-items:center; justify-content:center; gap:8px; font:800 14px/1.3 Archivo; color:#1A1613; }
.skor-num   { font:900 20px/1 Archivo; color:#CE1126; flex-shrink:0; }
.tim-menang { color:#2E7D52; }
.juara-display { padding:7px 12px; background:#E7F2EB; border-radius:8px; text-align:center; font:700 12px/1.4 'Plus Jakarta Sans'; color:#2E7D52; margin-bottom:10px; }
/* Podium compact */
.podium-compact { display:flex; flex-direction:column; gap:5px; margin-bottom:10px; }
.podium-row { display:flex; align-items:center; gap:7px; padding:6px 10px; border-radius:7px; font:700 13px/1.3 'Plus Jakarta Sans'; color:#1A1613; }
.podium-emas-sm    { background:#FFF8E5; border:1px solid #F5D06B; }
.podium-perak-sm   { background:#F4F4F6; border:1px solid #C8C8D8; }
.podium-perunggu-sm{ background:#FDF0E8; border:1px solid #D4956A; }
/* Actions */
.item-actions { display:flex; gap:8px; }
.btn-detail { flex:1; padding:6px 10px; border:1.5px solid #E2DCD2; border-radius:8px; background:#fff; color:#5A534B; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; transition:background .12s; }
.btn-detail:hover { background:#F0EBE2; }
.btn-del { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }

.btn-sync { padding:10px 16px; border:1.5px solid #2D5B8A; border-radius:10px; background:#E7EEF6; color:#2D5B8A; font:700 13px/1 'Plus Jakarta Sans'; cursor:pointer; white-space:nowrap; transition:background .15s; }
.btn-sync:hover:not(:disabled) { background:#2D5B8A; color:#fff; }
.btn-sync:disabled { opacity:.6; cursor:not-allowed; }

/* Toast */
.toast {
  position:fixed; top:20px; right:20px; z-index:9999;
  padding:13px 18px; border-radius:12px; font:700 13px/1.5 'Plus Jakarta Sans';
  display:flex; align-items:flex-start; gap:10px; max-width:420px;
  box-shadow:0 4px 20px rgba(0,0,0,.18);
}
.toast.success { background:#1E5C38; color:#fff; }
.toast.error   { background:#CE1126; color:#fff; }
.toast-icon    { font-size:16px; }
.toast-enter-active,.toast-leave-active { transition:all .25s ease; }
.toast-enter-from,.toast-leave-to { opacity:0; transform:translateY(-8px) scale(.96); }

@media(max-width:767px) {
  .stats-grid { grid-template-columns:repeat(2,1fr); }
  .row-2 { grid-template-columns:1fr; }
}
</style>
