<template>
  <div>
    <div class="eyebrow">Jadwal Pertandingan</div>
    <h2 class="page-title">Kapan &amp; Di Mana</h2>

    <div ref="cabangRowRef" class="tcr-scroll chip-row">
      <button v-for="(c, i) in jadwalStore.cabangOptions" :key="c"
        :ref="el => { if(el) cabangBtnRefs[i] = el }"
        class="chip" :class="{ active: jadwalStore.filterCabang === c }"
        @click="selectCabang(c, i)">{{ c }}</button>
    </div>
    <div ref="statusRowRef" class="tcr-scroll chip-row" style="padding:10px 0 6px;">
      <button v-for="(s, i) in jadwalStore.statusOptions" :key="s"
        :ref="el => { if(el) statusBtnRefs[i] = el }"
        class="chip" :class="{ active: jadwalStore.filterStatus === s }"
        @click="selectStatus(s, i)">{{ s }}</button>
    </div>

    <div class="jadwal-list">
      <div v-for="j in jadwalStore.filtered" :key="j.id"
        class="jadwal-item" @click="openDetail(j)" role="button" tabindex="0"
        @keydown.enter="openDetail(j)" @keydown.space.prevent="openDetail(j)">
        <div class="jadwal-row">
          <div class="jadwal-date">
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
      <div v-if="!jadwalStore.filtered.length" class="empty-state">Tidak ada jadwal untuk filter ini.</div>
    </div>

    <JadwalDetailModal
      :jadwal="selectedJadwal"
      @close="selectedJadwal = null"
      @daftar="goRegistrasi"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJadwalStore } from '@/stores/useJadwal'
import { useLokasiStore } from '@/stores/useLokasi'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import StatusBadge from '@/components/StatusBadge.vue'
import JadwalDetailModal from '@/components/JadwalDetailModal.vue'

const router = useRouter()
const jadwalStore = useJadwalStore()
const lokasiStore = useLokasiStore()
const registrasiStore = useRegistrasiStore()

const lokasiNama = (j) => {
  if (j.lokasiId) return lokasiStore.list.find(l => l.id === j.lokasiId)?.nama || j.lokasi || j.venue || ''
  return j.lokasi || j.venue || ''
}

const katColor = (k) => ({ Olahraga:'#CE1126', Tradisional:'#C0871C', 'E-Sport':'#2D5B8A', Acara:'#2E7D52' })[k] || '#CE1126'

const selectedJadwal = ref(null)

function openDetail(j) {
  selectedJadwal.value = j
}

function goRegistrasi() {
  selectedJadwal.value = null
  router.push({ name: 'registrasi' })
}

const cabangRowRef  = ref(null)
const statusRowRef  = ref(null)
const cabangBtnRefs = []
const statusBtnRefs = []

function scrollToCenter(row, btn) {
  if (!row || !btn) return
  row.scrollTo({ left: btn.offsetLeft - row.clientWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' })
}

function selectCabang(c, i) {
  jadwalStore.filterCabang = c
  scrollToCenter(cabangRowRef.value, cabangBtnRefs[i])
}

function selectStatus(s, i) {
  jadwalStore.filterStatus = s
  scrollToCenter(statusRowRef.value, statusBtnRefs[i])
}

onMounted(() => {
  jadwalStore.fetch()
  lokasiStore.fetch()
  registrasiStore.fetch()
})
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.chip-row  { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
.jadwal-list { display: flex; flex-direction: column; gap: 12px; margin-top: 18px; }
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
