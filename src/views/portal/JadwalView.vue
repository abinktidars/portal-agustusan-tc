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
      <div v-for="j in jadwalStore.filtered" :key="j.id" class="jadwal-row">
        <div class="jadwal-date">
          <div class="tgl">{{ j.tgl }}</div>
          <div class="jam">{{ j.jam }}</div>
        </div>
        <div class="divider-v"></div>
        <div class="jadwal-info">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="dot" :style="{ background: katColor(j.kat) }"></span>
            <span class="cabang">{{ j.cabang }}</span>
          </div>
          <div class="peserta">{{ j.peserta }}</div>
          <div class="venue">📍 {{ j.venue }}</div>
        </div>
        <StatusBadge :status="j.status" />
      </div>
      <div v-if="!jadwalStore.filtered.length" class="empty-state">Tidak ada jadwal untuk filter ini.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useJadwalStore } from '@/stores/useJadwal'
import StatusBadge from '@/components/StatusBadge.vue'

const jadwalStore = useJadwalStore()
const katColor = (k) => ({ Olahraga:'#CE1126', Tradisional:'#C0871C', 'E-Sport':'#2D5B8A', Acara:'#2E7D52' })[k] || '#CE1126'

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

onMounted(() => jadwalStore.fetch())
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.chip-row  { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
.jadwal-list { display: flex; flex-direction: column; gap: 12px; margin-top: 18px; }
.jadwal-row  { display: flex; align-items: center; gap: 18px; background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; padding: 18px 20px; flex-wrap: wrap; }
.jadwal-date { flex: 0 0 auto; text-align: center; min-width: 70px; }
.tgl  { font: 800 16px/1 Archivo; color: #CE1126; }
.jam  { font: 600 13px/1 'Plus Jakarta Sans'; color: #7A7368; margin-top: 6px; }
.divider-v { width: 1px; align-self: stretch; background: #ECE7DE; }
.jadwal-info { flex: 1; min-width: 180px; }
.cabang  { font: 800 16px/1.2 Archivo; color: #1A1613; }
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
