<template>
  <Transition name="toast">
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
      {{ toast.msg }}
    </div>
  </Transition>

  <main class="adm-main">
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

          <template v-if="h.juara1">
            <div class="podium-compact">
              <div class="podium-row podium-emas-sm"><span>🥇</span><span>{{ h.juara1 }}</span></div>
              <div v-if="h.juara2" class="podium-row podium-perak-sm"><span>🥈</span><span>{{ h.juara2 }}</span></div>
              <div v-if="h.juara3" class="podium-row podium-perunggu-sm"><span>🥉</span><span>{{ h.juara3 }}</span></div>
            </div>
          </template>
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
import { useJadwalStore } from '@/stores/useJadwal'
import { useHasilStore } from '@/stores/useHasil'
import { useTipeStore } from '@/stores/useTipe'
import PaginationBar from '@/components/PaginationBar.vue'
import HasilDetailModal from '@/components/HasilDetailModal.vue'
import { exportToExcel } from '@/utils/exportExcel'

const jadwalStore = useJadwalStore()
const hasilStore = useHasilStore()
const tipeStore = useTipeStore()

const tipeColor = (t) => tipeStore.warna(t)

function mapJadwalToHasil(j) {
  const isVs = j.peserta?.includes(' vs ')
  const rec = {
    id: j.id,
    _source: 'jadwal',
    cabang: j.cabang,
    kat: j.kat || '',
    tgl: j.tgl,
    juara: j.pemenang || '',
    juara1: j.juara1 || '',
    juara2: j.juara2 || '',
    juara3: j.juara3 || '',
    timA: '',
    timB: '',
    skor: '',
  }
  if (isVs) {
    const parts = j.peserta.split(' vs ')
    rec.timA = parts[0]?.trim() || ''
    rec.timB = parts[1]?.trim() || ''
    const m = (j.hasilPertandingan || '').match(/(\d+)\s*[–\-]\s*(\d+)/)
    rec.skor = m ? `${m[1]} – ${m[2]}` : ''
  } else {
    rec.timA = j.peserta || ''
    rec.skor = j.hasilPertandingan || ''
  }
  return rec
}

const hasilFromJadwal = computed(() =>
  jadwalStore.listWithStatus
    .filter((j) => j.hasilPertandingan)
    .map(mapJadwalToHasil),
)

const allHasil = computed(() => {
  const savedJadwalIds = new Set(hasilStore.list.map((h) => h.jadwalId).filter(Boolean))
  const jadwalOnly = hasilFromJadwal.value.filter((h) => !savedJadwalIds.has(h.id))
  return [...hasilStore.list, ...jadwalOnly]
})

const selectedHasil = ref(null)
const search = ref('')
const page = ref(1)
const PER_PAGE = 9

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return allHasil.value.filter(
    (h) =>
      !q ||
      (h.cabang || '').toLowerCase().includes(q) ||
      (h.timA || '').toLowerCase().includes(q) ||
      (h.timB || '').toLowerCase().includes(q) ||
      (h.juara || '').toLowerCase().includes(q),
  )
})

const paginated = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
watch(search, () => {
  page.value = 1
})

function doExport() {
  exportToExcel(
    filtered.value,
    [
      { label: 'No', field: (_, i) => i + 1 },
      { label: 'Cabang', field: 'cabang' },
      { label: 'Tanggal', field: 'tgl' },
      { label: 'Tim A', field: 'timA' },
      { label: 'Tim B', field: 'timB' },
      { label: 'Skor', field: 'skor' },
      { label: 'Juara', field: 'juara' },
    ],
    'hasil-pertandingan',
  )
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

const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg = msg
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => {
    toast.show = false
  }, 3500)
}

const migrating = ref(false)
const pendingSync = computed(() =>
  jadwalStore.listWithStatus.filter((j) => j.hasilPertandingan && !hasilStore.list.some((h) => h.jadwalId === j.id)),
)

function buildHasilRecord(j) {
  const isVs = j.peserta?.includes(' vs ')
  const tglRaw =
    j.tglMulaiRaw ||
    (j.tglDate instanceof Date ? j.tglDate.toISOString().slice(0, 10) : null) ||
    j.tgl ||
    ''

  const rec = {
    cabang: j.cabang || '',
    kat: j.kat || '',
    tgl: tglRaw,
    jadwalId: j.id || '',
    juara: j.pemenang || '',
    juara1: j.juara1 || '',
    juara2: j.juara2 || '',
    juara3: j.juara3 || '',
    timA: '',
    timB: '',
    skor: '',
  }

  if (isVs) {
    const parts = j.peserta.split(' vs ')
    rec.timA = parts[0]?.trim() || ''
    rec.timB = parts[1]?.trim() || ''
    const m = (j.hasilPertandingan || '').match(/(\d+)\s*[–\-]\s*(\d+)/)
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
  let berhasil = 0
  let gagal = 0
  let lastErr = ''

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
      showToast(`${berhasil} berhasil, ${gagal} gagal: ${lastErr.slice(0, 60)}`, 'error')
    } else {
      showToast(`Gagal: ${lastErr.slice(0, 80)}`, 'error')
    }
  } finally {
    migrating.value = false
  }
}

onMounted(() => {
  jadwalStore.fetch()
  hasilStore.fetch()
  tipeStore.fetch()
})
</script>

<style scoped>
.adm-main {
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px 14px 56px;
}

.adm-section {
  background: #fff;
  border: 1px solid #ece7de;
  border-radius: 20px;
  padding: 24px;
}

.hasil-section .section-header {
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.section-eyebrow {
  font: 700 11px/1 'Plus Jakarta Sans';
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #2e7d52;
}

.section-title-lg {
  font: 800 24px/1.05 Archivo;
  color: #1a1613;
  margin: 6px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 8px 0 16px 0;
}

.search-input {
  width: 100%;
  min-width: 220px;
}

.btn-sync,
.btn-export {
  padding: 10px 14px;
  border-radius: 10px;
  font: 700 12px/1 'Plus Jakarta Sans';
  white-space: nowrap;
  cursor: pointer;
}

.btn-sync {
  border: 1.5px solid #2d5b8a;
  background: #2d5b8a;
  color: #fff;
}

.btn-sync:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-export {
  border: 1.5px solid #2e7d52;
  background: #fff;
  color: #2e7d52;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.item-card {
  background: #faf8f3;
  border: 1px solid #e2dcd2;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.item-nama {
  font: 800 14px/1.2 Archivo;
  color: #1a1613;
  max-width: 170px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-tgl {
  font: 600 11px/1 'Plus Jakarta Sans';
  color: #9a9389;
  white-space: nowrap;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.podium-compact {
  background: #fff;
  border: 1px solid #f0ebe2;
  border-radius: 10px;
  padding: 9px 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.podium-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  align-items: center;
  font: 600 13px/1.25 'Plus Jakarta Sans';
  color: #1a1613;
}

.podium-emas-sm {
  font-weight: 800;
  color: #9a6b12;
}

.podium-perak-sm {
  color: #5a6372;
}

.podium-perunggu-sm {
  color: #8a5d3b;
}

.skor-display {
  background: #fff;
  border: 1px solid #f0ebe2;
  border-radius: 10px;
  padding: 9px 10px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}

.skor-display > span:first-child,
.skor-display > span:last-child {
  font: 700 12px/1.2 'Plus Jakarta Sans';
  color: #5a534b;
  text-align: center;
  word-break: break-word;
}

.skor-num {
  font: 900 18px/1 Archivo;
  color: #ce1126;
  background: #fbeaec;
  border-radius: 8px;
  padding: 4px 10px;
}

.tim-menang {
  color: #2e7d52 !important;
  font-weight: 800 !important;
}

.juara-display {
  background: #e7f2eb;
  color: #2e7d52;
  border-radius: 8px;
  padding: 8px 10px;
  text-align: center;
  font: 700 12px/1.35 'Plus Jakarta Sans';
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.btn-detail,
.btn-del {
  flex: 1;
  padding: 9px 10px;
  border-radius: 9px;
  font: 700 12px/1 'Plus Jakarta Sans';
  cursor: pointer;
}

.btn-detail {
  border: 1px solid #e2dcd2;
  background: #fff;
  color: #1a1613;
}

.btn-del {
  border: 1px solid #fbeaec;
  background: #fbeaec;
  color: #ce1126;
}

.btn-confirm-del {
  flex: 1;
  padding: 9px 10px;
  border: 1px solid #ce1126;
  border-radius: 9px;
  background: #ce1126;
  color: #fff;
  font: 700 12px/1 'Plus Jakarta Sans';
  cursor: pointer;
  white-space: nowrap;
}

.btn-cancel-sm {
  flex: 1;
  padding: 9px 10px;
  border: 1px solid #e2dcd2;
  border-radius: 9px;
  background: #fff;
  color: #5a534b;
  font: 700 12px/1 'Plus Jakarta Sans';
  cursor: pointer;
  white-space: nowrap;
}

.empty {
  text-align: center;
  padding: 20px;
  color: #9a9389;
  font: 500 13px/1 'Plus Jakarta Sans';
}

.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  min-width: 260px;
  max-width: 380px;
  font: 600 14px/1.4 'Plus Jakarta Sans';
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  pointer-events: none;
}

.toast.success {
  background: #1a1613;
  color: #fff;
}

.toast.error {
  background: #ce1126;
  color: #fff;
}

.toast-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 13px/1 Archivo;
  flex-shrink: 0;
}

.toast.success .toast-icon {
  background: rgba(255, 255, 255, 0.15);
}

.toast.error .toast-icon {
  background: rgba(0, 0, 0, 0.15);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (min-width: 768px) {
  .adm-main {
    padding: 28px 20px 70px;
  }

  .section-title-lg {
    font-size: 28px;
  }

  .search-input {
    width: 220px;
  }

  .card-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
  }

  .item-card {
    padding: 16px;
  }

  .item-nama {
    max-width: 220px;
    font-size: 15px;
  }

  .item-tgl {
    font-size: 12px;
  }

  .btn-sync,
  .btn-export,
  .btn-detail,
  .btn-del {
    font-size: 13px;
  }
}
</style>
