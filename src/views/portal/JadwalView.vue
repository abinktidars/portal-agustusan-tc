<template>
  <div>
    <div class="eyebrow">Jadwal Pertandingan</div>
    <h2 class="page-title">Kapan &amp; Di Mana</h2>

    <div class="filter-wrap">
      <div class="filter-icon">
        <button class="filter-btn" @click="filterModalOpen = true">
          <ListFilter :size="15" :stroke-width="2" />
          <span>Filter</span>
          <span v-if="activeFilterCount" class="filter-badge">{{ activeFilterCount }}</span>
        </button>
      </div>
      <div class="filter-row tcr-scroll">
        <button class="chip" :class="{ active: filterMingguIni }"
          @click="filterMingguIni = !filterMingguIni">Minggu Ini</button>
        <button v-for="c in jadwalStore.cabangOptions.filter(c => c !== 'Semua')" :key="c"
          class="chip" :class="{ active: jadwalStore.filterCabang === c }"
          @click="jadwalStore.filterCabang = jadwalStore.filterCabang === c ? 'Semua' : c">{{ c }}</button>
        <button v-for="k in koridorStore.list" :key="k.id"
          class="chip" :class="{ active: filterKoridorId === k.id }"
          @click="filterKoridorId = filterKoridorId === k.id ? '' : k.id">{{ k.nama }}</button>
      </div>
    </div>

    <div class="jadwal-list">
      <div v-for="j in filteredJadwal" :key="j.id"
        class="jadwal-item" @click="openDetail(j)" role="button" tabindex="0"
        @keydown.enter="openDetail(j)" @keydown.space.prevent="openDetail(j)">
        <div class="jadwal-row">
          <div class="jadwal-date">
            <div class="hari">{{ hariDariTgl(j) }}</div>
            <template v-if="j.tglSelesai && j.tglSelesai !== (j.tglMulai || j.tgl)">
              <div class="tgl">{{ j.tglMulai || j.tgl }}</div>
              <div class="tgl-sep">–</div>
              <div class="tgl tgl-end">{{ j.tglSelesai }}</div>
            </template>
            <template v-else>
              <div class="tgl">{{ j.tglMulai || j.tgl }}</div>
            </template>
            <div class="jam">{{ j.jamMulai || j.jam }}</div>
          </div>
          <div class="divider-v"></div>
          <div class="jadwal-info">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="dot" :style="{ background: katColor(j.kat) }"></span>
              <span class="cabang">{{ j.cabang }}</span>
            </div>
            <div v-if="j.babak || j.jenis" class="badges-row">
              <span v-if="j.babak" class="babak">{{ j.babak }}</span>
              <span v-if="j.jenis" class="jenis" :class="j.jenis === 'Beregu' ? 'jenis-beregu' : 'jenis-perorangan'">{{ j.jenis }}</span>
            </div>
            <div class="peserta">{{ j.peserta }}</div>
            <div class="venue">📍 {{ lokasiNama(j) }}</div>
          </div>
          <StatusBadge :status="j.status" />
          <span class="row-arrow">›</span>
        </div>
      </div>
      <div v-if="!filteredJadwal.length" class="empty-state">Tidak ada jadwal untuk filter ini.</div>
    </div>

    <JadwalDetailModal
      :jadwal="selectedJadwal"
      @close="selectedJadwal = null"
      @daftar="goRegistrasi"
    />

    <JadwalFilterModal
      v-model:visible="filterModalOpen"
      v-model:cabang="jadwalStore.filterCabang"
      v-model:status="jadwalStore.filterStatus"
      v-model:mingguIni="filterMingguIni"
      v-model:koridorId="filterKoridorId"
      :cabang-options="jadwalStore.cabangOptions"
      :koridor-options="koridorStore.list"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJadwalStore } from '@/stores/useJadwal'
import { useLokasiStore } from '@/stores/useLokasi'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import { useKoridorStore } from '@/stores/useKoridor'
import { ListFilter } from '@lucide/vue'
import StatusBadge from '@/components/StatusBadge.vue'
import JadwalDetailModal from '@/components/JadwalDetailModal.vue'
import JadwalFilterModal from '@/components/JadwalFilterModal.vue'

const router = useRouter()
const jadwalStore = useJadwalStore()
const lokasiStore = useLokasiStore()
const registrasiStore = useRegistrasiStore()
const koridorStore = useKoridorStore()

const lokasiNama = (j) => {
  if (j.lokasiId) return lokasiStore.list.find(l => l.id === j.lokasiId)?.nama || j.lokasi || j.venue || ''
  return j.lokasi || j.venue || ''
}

const katColor = (k) => ({ Olahraga:'#CE1126', Tradisional:'#C0871C', 'E-Sport':'#2D5B8A', Acara:'#2E7D52' })[k] || '#CE1126'
const monthMap = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  Mei: 4,
  Jun: 5,
  Jul: 6,
  Agu: 7,
  Sep: 8,
  Okt: 9,
  Nov: 10,
  Des: 11,
}

const selectedJadwal = ref(null)

function openDetail(j) {
  selectedJadwal.value = j
}

function goRegistrasi() {
  const cabang = selectedJadwal.value?.cabang || ''
  selectedJadwal.value = null
  router.push({ name: 'registrasi', query: cabang ? { cabang } : {} })
}

function hariDariTgl(jadwal) {
  if (jadwal?.hari) return jadwal.hari
  if (jadwal?.tglDate instanceof Date && !Number.isNaN(jadwal.tglDate.getTime())) {
    return jadwal.tglDate.toLocaleDateString('id-ID', { weekday: 'long' })
  }

  const parts = String(jadwal?.tgl || '').trim().split(/\s+/)
  if (parts.length < 2) return '-'

  const tanggal = Number(parts[0])
  const bulan = monthMap[parts[1]]
  if (!tanggal || bulan === undefined) return '-'

  const date = new Date(2026, bulan, tanggal)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', { weekday: 'long' })
}

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // geser ke Senin
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date) {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

function isMingguIni(jadwal) {
  const mulai = jadwal.tglDate instanceof Date ? jadwal.tglDate : (jadwal.tglDate ? new Date(jadwal.tglDate) : null)
  if (!mulai || Number.isNaN(mulai.getTime())) return false

  const selesai = jadwal.tglSelesaiDate
    ? (jadwal.tglSelesaiDate instanceof Date ? jadwal.tglSelesaiDate : new Date(jadwal.tglSelesaiDate))
    : mulai

  const now = new Date()
  return mulai <= endOfWeek(now) && selesai >= startOfWeek(now)
}

const namaPeserta = (r) => r.namaRegu || r.namaKetua || r.nama || ''

function pesertaNamesInJadwal(jadwal) {
  const raw = jadwal?.peserta || ''
  if (!raw) return []
  const parts = raw.includes(' vs ') ? raw.split(' vs ') : raw.split(',')
  return parts.map(s => s.trim().toLowerCase()).filter(Boolean)
}

function isDalamKoridor(jadwal, koridorId) {
  if (!koridorId) return true
  const names = pesertaNamesInJadwal(jadwal)
  if (!names.length) return false
  return registrasiStore.list.some(r =>
    r.cabang === jadwal.cabang &&
    r.koridorId === koridorId &&
    names.includes(namaPeserta(r).trim().toLowerCase())
  )
}

const filterModalOpen = ref(false)
const filterMingguIni = ref(false)
const filterKoridorId = ref('')

const filteredJadwal = computed(() =>
  jadwalStore.filtered.filter(j =>
    (!filterMingguIni.value || isMingguIni(j)) &&
    isDalamKoridor(j, filterKoridorId.value)
  )
)

const activeFilterCount = computed(() => [
  jadwalStore.filterCabang !== 'Semua',
  jadwalStore.filterStatus !== 'Semua',
  filterMingguIni.value,
  !!filterKoridorId.value,
].filter(Boolean).length)

onMounted(() => {
  jadwalStore.fetch()
  lokasiStore.fetch()
  registrasiStore.fetch()
  koridorStore.fetch()
})
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.tcr-scroll::-webkit-scrollbar {
  height: 0;
}
.filter-wrap {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 8px;
}
.filter-row {
  display: flex;
  align-items: center; 
  gap: 4px;
  overflow-x: auto;
}
.filter-btn {
  display: inline-flex; align-items: center; gap: 8px;
  flex: 0 0 auto;
  padding: 6px 14px; border-radius: 999px;
  border: 1.5px solid #E2DCD2; background: #fff; color: #1A1613;
  font: 700 13px/1 'Plus Jakarta Sans'; cursor: pointer; transition: border-color .15s;
}
.filter-btn:hover { border-color: #CE1126; }
.filter-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 5px; border-radius: 999px;
  background: #CE1126; color: #fff; font: 700 11px/1 'Plus Jakarta Sans';
}
.jadwal-list { display: flex; flex-direction: column; gap: 12px; }
.jadwal-item {
  border: 1.5px solid #F0D3D7; border-radius: 8px; overflow: hidden; background: #fff;
  cursor: pointer; transition: border-color .15s, box-shadow .15s;
  outline: none;
}
.jadwal-item:hover { border-color: #CE1126; box-shadow: 0 2px 12px rgba(206,17,38,.1); }
.jadwal-item:focus-visible { box-shadow: 0 0 0 3px rgba(206,17,38,.25); }
.jadwal-row  { display: flex; align-items: center; gap: 18px; padding: 18px 20px; flex-wrap: wrap; }
.row-arrow { margin-left: auto; font-size: 20px; color: #C8BFB5; flex-shrink: 0; line-height: 1; }
.jadwal-item:hover .row-arrow { color: #CE1126; }
.jadwal-date { flex: 0 0 auto; text-align: center; min-width: 70px; }
.hari       { font: 700 10px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #9A6B12; margin-bottom: 3px; }
.tgl        { font: 800 15px/1 Archivo; color: #CE1126; }
.tgl-sep    { font: 700 11px/1 'Plus Jakarta Sans'; color: #C8BFB5; margin: 2px 0; }
.tgl-end    { color: #C0871C; }
.jam        { font: 600 13px/1 'Plus Jakarta Sans'; color: #7A7368; margin-top: 6px; }
.divider-v { width: 1px; align-self: stretch; background: #ECE7DE; }
.jadwal-info { flex: 1; min-width: 180px; }
.cabang  { font: 800 16px/1.2 Archivo; color: #1A1613; }
.badges-row { display:flex; flex-wrap:wrap; gap:5px; margin-top:5px; }
.babak   { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing:.05em; text-transform:uppercase; color:#2D5B8A; background:#E7EEF6; border-radius:6px; padding:3px 8px; }
.jenis   { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing:.05em; text-transform:uppercase; border-radius:6px; padding:3px 8px; }
.jenis-beregu     { color:#2E7D52; background:#DCF0E5; }
.jenis-perorangan { color:#6B3FA0; background:#F0E8FF; }
.peserta { font: 500 14px/1.4 'Plus Jakarta Sans'; color: #5A534B; margin-top: 6px; }
.venue   { font: 500 13px/1.4 'Plus Jakarta Sans'; color: #9A9389; margin-top: 3px; }
.dot     { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.empty-state { padding: 32px; text-align: center; color: #9A9389; font: 500 14px/1 'Plus Jakarta Sans'; }
@media(max-width:767px) {
  .page-title { font-size: 26px; }
  .jadwal-row { padding: 14px; gap: 10px; }
  .jadwal-info { min-width: 130px; }
  .divider-v { display: none; }
}
</style>
