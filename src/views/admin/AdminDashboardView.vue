<template>
  <Transition name="toast">
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
      {{ toast.msg }}
    </div>
  </Transition>

  <main class="adm-main">

    <!-- Shortcut Menu Utama -->
    <div class="shortcut-section">
      <div class="shortcut-title">Menu Utama</div>
      <div class="shortcut-grid-main">
        
        <!-- Atur Registrasi -->
        <RouterLink :to="{ name: 'admin-registrasi' }" class="shortcut-card registrasi-card">
          <ClipboardList class="shortcut-icon" :size="24" :stroke-width="1.8" />
          <div class="shortcut-content">
            <div class="shortcut-label">Data Registrasi</div>
            <div class="shortcut-count">{{ regStore.list.length }} pendaftar</div>
          </div>
        </RouterLink>

        <!-- Atur Lomba -->
        <RouterLink :to="{ name: 'admin-lomba' }" class="shortcut-card lomba-card">
          <Trophy class="shortcut-icon" :size="24" :stroke-width="1.8" />
          <div class="shortcut-content">
            <div class="shortcut-label">Atur Lomba</div>
            <div class="shortcut-count">{{ kategoriStore.list.length }} lomba</div>
          </div>
        </RouterLink>

        <!-- Kelola Jadwal -->
        <RouterLink :to="{ name: 'admin-jadwal' }" class="shortcut-card jadwal-card">
          <CalendarDays class="shortcut-icon" :size="24" :stroke-width="1.8" />
          <div class="shortcut-content">
            <div class="shortcut-label">Atur Jadwal</div>
            <div class="shortcut-count">{{ jadwalStore.list.length }} jadwal</div>
          </div>
        </RouterLink>

        <!-- Atur Hasil -->
        <RouterLink :to="{ name: 'admin-hasil' }" class="shortcut-card hasil-card">
          <Award class="shortcut-icon" :size="24" :stroke-width="1.8" />
          <div class="shortcut-content">
            <div class="shortcut-label">Atur Hasil</div>
            <div class="shortcut-count">{{ allHasil.length }} hasil</div>
          </div>
        </RouterLink>
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
          <RouterLink :to="{ name: 'admin-hasil' }" class="link-btn">Lihat semua →</RouterLink>
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

          <div class="item-actions" @click.stop>
            <button @click.stop="selectedHasil = h" class="btn-detail">Lihat Detail</button>
            <template v-if="deleteId === h.id">
              <button @click.stop="confirmHapus(h)" class="btn-confirm-del">Ya, Hapus</button>
              <button @click.stop="cancelHapus" class="btn-cancel-sm">Batal</button>
            </template>
            <button v-else @click.stop="requestHapus(h)" class="btn-del">Hapus</button>
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
import { Trophy, CalendarDays, Award, ClipboardList } from '@lucide/vue'
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

const deleteId = ref(null)
function requestHapus(h) { deleteId.value = h.id }
function cancelHapus()    { deleteId.value = null }
function confirmHapus(h) {
  deleteId.value = null
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
.adm-main {
  max-width:1180px;
  margin:0 auto;
  padding:18px 14px 56px;
}
.adm-page-header { margin-bottom:16px; }
.adm-page-title  { font:900 26px/1.05 Archivo; color:#1A1613; margin:0 0 6px; letter-spacing:-.01em; }
.adm-page-desc   { font:500 13px/1.5 'Plus Jakarta Sans'; color:#7A7368; margin:0; max-width:34ch; }

.stats-grid {
  display:grid;
  grid-template-columns:1fr;
  gap:12px;
  margin-bottom:16px;
}
.stat-card {
  background:#fff;
  border:1px solid #ECE7DE;
  border-radius:16px;
  padding:16px;
  display:grid;
  grid-template-columns:auto 1fr;
  gap:10px 12px;
  align-items:center;
}
.stat-icon {
  width:40px;
  height:40px;
  border-radius:12px;
  display:grid;
  place-items:center;
  background:#FAF8F3;
  font-size:20px;
  grid-row:1 / span 2;
}
.stat-val   { font:900 30px/1 Archivo; margin-bottom:0; }
.stat-label { font:700 13px/1.1 'Plus Jakarta Sans'; color:#1A1613; }
.stat-sub   { grid-column:2; font:500 12px/1.3 'Plus Jakarta Sans'; color:#9A9389; margin-top:-2px; }

.row-2 { display:grid; grid-template-columns:1fr; gap:14px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:24px; }
.section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.section-title  { font:800 18px/1 Archivo; color:#1A1613; margin:0; }
.link-btn       { font:600 13px/1 'Plus Jakarta Sans'; color:#CE1126; text-decoration:none; white-space: nowrap;}

.mini-list { display:flex; flex-direction:column; gap:8px; }
.mini-row  {
  display:flex;
  align-items:flex-start;
  gap:10px;
  padding:12px;
  background:#FAF8F3;
  border:1px solid #F0EBE2;
  border-radius:12px;
}
.mini-nama { font:700 13px/1.25 'Plus Jakarta Sans'; color:#1A1613; }
.mini-sub  { font:500 12px/1.35 'Plus Jakarta Sans'; color:#7A7368; margin-top:4px; }
.avatar    { width:32px; height:32px; border-radius:50%; background:#CE1126; color:#fff; display:flex; align-items:center; justify-content:center; font:700 14px/1 Archivo; flex-shrink:0; }

.empty { text-align:center; padding:20px; color:#9A9389; font:500 13px/1 'Plus Jakarta Sans'; }

.hasil-section .section-header { gap: 12px; align-items: flex-start; flex-wrap: wrap; }
.hasil-section {margin-top: 16px;}
.section-eyebrow { font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.1em; text-transform:uppercase; color:#2E7D52; }
.section-title-lg { font:800 24px/1.05 Archivo; color:#1A1613; margin:6px 0 0; }

.header-actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.search-input { width:100%; min-width:220px; }
.btn-sync,
.btn-export {
  padding:10px 14px;
  border-radius:10px;
  font:700 12px/1 'Plus Jakarta Sans';
  white-space:nowrap;
  cursor:pointer;
}
.btn-sync {
  border:1.5px solid #2D5B8A;
  background:#2D5B8A;
  color:#fff;
}
.btn-sync:disabled { opacity:.65; cursor:not-allowed; }
.btn-export {
  border:1.5px solid #2E7D52;
  background:#fff;
  color:#2E7D52;
}

.card-grid { display:grid; grid-template-columns:1fr; gap:12px; }
.item-card {
  background:#FAF8F3;
  border:1px solid #E2DCD2;
  border-radius:14px;
  padding:14px;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.item-card-header { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
.item-nama {
  font:800 14px/1.2 Archivo;
  color:#1A1613;
  max-width:170px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.item-tgl { font:600 11px/1 'Plus Jakarta Sans'; color:#9A9389; white-space:nowrap; }
.dot { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; }

.podium-compact {
  background:#fff;
  border:1px solid #F0EBE2;
  border-radius:10px;
  padding:9px 10px;
  display:flex;
  flex-direction:column;
  gap:7px;
}
.podium-row {
  display:grid;
  grid-template-columns:auto 1fr;
  gap:8px;
  align-items:center;
  font:600 13px/1.25 'Plus Jakarta Sans';
  color:#1A1613;
}
.podium-emas-sm { font-weight:800; color:#9A6B12; }
.podium-perak-sm { color:#5A6372; }
.podium-perunggu-sm { color:#8A5D3B; }

.skor-display {
  background:#fff;
  border:1px solid #F0EBE2;
  border-radius:10px;
  padding:9px 10px;
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  gap:8px;
}
.skor-display > span:first-child,
.skor-display > span:last-child {
  font:700 12px/1.2 'Plus Jakarta Sans';
  color:#5A534B;
  text-align:center;
  word-break:break-word;
}
.skor-num {
  font:900 18px/1 Archivo;
  color:#CE1126;
  background:#FBEAEC;
  border-radius:8px;
  padding:4px 10px;
}
.tim-menang { color:#2E7D52 !important; font-weight:800 !important; }

.juara-display {
  background:#E7F2EB;
  color:#2E7D52;
  border-radius:8px;
  padding:8px 10px;
  text-align:center;
  font:700 12px/1.35 'Plus Jakarta Sans';
}

.item-actions { display:flex; gap:8px; margin-top:auto; flex-wrap:wrap; }
.btn-detail,
.btn-del,
.btn-confirm-del,
.btn-cancel-sm {
  flex:1;
  padding:9px 10px;
  border-radius:9px;
  font:700 12px/1 'Plus Jakarta Sans';
  cursor:pointer;
  white-space:nowrap;
}
.btn-detail { border:1px solid #E2DCD2; background:#fff; color:#1A1613; }
.btn-del { border:1px solid #FBEAEC; background:#FBEAEC; color:#CE1126; }
.btn-confirm-del { border:1px solid #CE1126; background:#CE1126; color:#fff; }
.btn-cancel-sm { border:1px solid #E2DCD2; background:#fff; color:#5A534B; }

/* Shortcut Section */
.shortcut-section {
  margin-bottom:20px;
}
.shortcut-title {
  font:700 13px/1 'Plus Jakarta Sans';
  letter-spacing:.1em;
  text-transform:uppercase;
  color:#9A9389;
  margin-bottom:12px;
  padding:0 4px;
}
.shortcut-grid-main {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:4px;
  margin-bottom:14px;
}
.shortcut-grid-extra {
  display:grid;
  grid-template-columns:1fr;
  gap:12px;
}
.shortcut-grid {
  display:grid;
  grid-template-columns:1fr;
  gap:12px;
}
.shortcut-card {
  background:#fff;
  border:1.5px solid #ECE7DE;
  border-radius:14px;
  padding:8px;
  display:flex;
  align-items:center;
  gap:12px;
  text-decoration:none;
  color:inherit;
  cursor:pointer;
  transition:all .2s ease;
  position:relative;
  min-height:80px;
}
.shortcut-card:hover {
  border-color:#CE1126;
  box-shadow:0 4px 12px rgba(206,17,38,.1);
  transform:translateY(-2px);
}
.shortcut-card:active {
  transform:translateY(0);
}
.shortcut-icon {
  flex-shrink:0;
  display:block;
}
.shortcut-content {
  flex:1;
}
.shortcut-label {
  font:800 14px/1.2 Archivo;
  color:#1A1613;
  margin-bottom:3px;
}
.shortcut-count {
  font:500 12px/1 'Plus Jakarta Sans';
  color:#9A9389;
}
.shortcut-arrow {
  font-size:18px;
  color:#CE1126;
  flex-shrink:0;
  opacity:0;
  transition:opacity .2s ease, transform .2s ease;
}
.shortcut-card:hover .shortcut-arrow {
  opacity:1;
  transform:translateX(4px);
}

/* Card variasi warna untuk type menu */
.jadwal-card { border-color:#D4E4F7; background:linear-gradient(135deg, #fff 0%, #F0F6FC 100%); }
.jadwal-card:hover { border-color:#2D5B8A; box-shadow:0 4px 12px rgba(45,91,138,.12); }
.lomba-card { border-color:#FFF4E0; background:linear-gradient(135deg, #fff 0%, #FFFAF0 100%); }
.lomba-card:hover { border-color:#D4A017; box-shadow:0 4px 12px rgba(212,160,23,.12); }
.registrasi-card { border-color:#FFF0F3; background:linear-gradient(135deg, #fff 0%, #FFF9FB 100%); }
.registrasi-card:hover { border-color:#CE1126; box-shadow:0 4px 12px rgba(206,17,38,.12); }
.hasil-card { border-color:#E7F2EB; background:linear-gradient(135deg, #fff 0%, #F5FAF8 100%); }
.hasil-card:hover { border-color:#2E7D52; box-shadow:0 4px 12px rgba(46,125,82,.12); }
.menu-all-card { border-color:#F9F1E0; background:linear-gradient(135deg, #fff 0%, #FEFAF2 100%); }
.menu-all-card:hover { border-color:#9A6B12; box-shadow:0 4px 12px rgba(154,107,18,.12); }

/* Modal Semua Menu */
.modal-enter-active,
.modal-leave-active {
  transition:opacity .2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity:0;
}

.menu-all-modal {
  position:fixed;
  top:0;
  left:0;
  right:0;
  bottom:0;
  background:rgba(26,22,19,.5);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:100;
  padding:16px;
}
.menu-all-content {
  background:#fff;
  border-radius:20px;
  width:100%;
  max-width:500px;
  max-height:80vh;
  overflow-y:auto;
  box-shadow:0 20px 60px rgba(0,0,0,.2);
}
.menu-all-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:20px 20px 16px;
  border-bottom:1px solid #ECE7DE;
}
.menu-all-title {
  font:800 18px/1 Archivo;
  color:#1A1613;
  margin:0;
}
.menu-close-btn {
  width:32px;
  height:32px;
  border-radius:8px;
  border:1px solid #E2DCD2;
  background:#fff;
  color:#1A1613;
  font:700 20px/1 'Plus Jakarta Sans';
  cursor:pointer;
  padding:0;
  display:flex;
  align-items:center;
  justify-content:center;
  transition:all .2s ease;
}
.menu-close-btn:hover {
  background:#FAF8F3;
  border-color:#CE1126;
}
.menu-all-grid {
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:12px;
  padding:20px;
}
.menu-all-item {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  padding:16px 12px;
  background:#FAF8F3;
  border:1px solid #E2DCD2;
  border-radius:12px;
  text-decoration:none;
  color:#1A1613;
  transition:all .2s ease;
  cursor:pointer;
}
.menu-all-item:hover {
  border-color:#CE1126;
  background:#fff;
  box-shadow:0 4px 12px rgba(206,17,38,.1);
  transform:translateY(-2px);
}
.menu-item-icon {
  font-size:32px;
  line-height:1;
}
.menu-item-label {
  font:700 13px/1.2 'Plus Jakarta Sans';
  text-align:center;
  color:#1A1613;
}

@media (min-width: 768px) {
  .adm-main { padding:28px 20px 70px; }
  .adm-page-header { margin-bottom:24px; }
  .adm-page-title { font-size:30px; }
  .adm-page-desc { font-size:14px; max-width:none; }

  .stats-grid { grid-template-columns:repeat(2,1fr); gap:16px; margin-bottom:24px; }
  .stat-card { padding:20px; grid-template-columns:1fr; gap:0; }
  .stat-icon { grid-row:auto; margin-bottom:12px; }
  .stat-val { font-size:36px; margin-bottom:4px; }
  .stat-sub { grid-column:auto; margin-top:4px; }

  .shortcut-grid-main { grid-template-columns:repeat(2,1fr); gap:14px; }
  .shortcut-card { padding:18px; }
  .shortcut-label { font-size:15px; }

  .row-2 { grid-template-columns:1fr 1fr; gap:20px; }
  .section-header { align-items:center; margin-bottom:18px; }
  .section-title { font-size:18px; }
  .section-title-lg { font-size:28px; }
  .search-input { width:220px; }
  .card-grid { grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
  .item-card { padding:16px; }
  .item-nama { max-width:220px; font-size:15px; }
  .item-tgl { font-size:12px; }
  .btn-sync,
  .btn-export,
  .btn-detail,
  .btn-del { font-size:13px; }
}

@media (min-width: 1100px) {
  .stats-grid { grid-template-columns:repeat(4,1fr); }
  .row-2 { grid-template-columns:1fr 1fr; gap:20px; }
  .adm-section { padding:24px; border-radius:20px; }
  .stat-card { padding:22px; }
}
</style>
