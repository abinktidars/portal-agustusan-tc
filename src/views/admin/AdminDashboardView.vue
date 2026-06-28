<template>
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
  </main>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useKategoriStore }   from '@/stores/useKategori'
import { useJadwalStore }     from '@/stores/useJadwal'
import { useHasilStore }      from '@/stores/useHasil'
import { useRegistrasiStore } from '@/stores/useRegistrasi'

const kategoriStore = useKategoriStore()
const jadwalStore   = useJadwalStore()
const hasilStore    = useHasilStore()
const regStore      = useRegistrasiStore()

const statCards = computed(() => [
  { icon:'🏷️', label:'Kategori Lomba',   value: kategoriStore.list.length, sub:'Jenis lomba', color:'#2D5B8A' },
  { icon:'📅', label:'Total Jadwal',     value: jadwalStore.list.length,   sub:'Pertandingan', color:'#CE1126' },
  { icon:'🏆', label:'Hasil Tercatat',   value: hasilStore.list.length,    sub:'Pertandingan selesai', color:'#2E7D52' },
  { icon:'📋', label:'Pendaftar',        value: regStore.list.length,      sub:'Peserta terdaftar', color:'#9A6B12' },
])

const statusCls = (s) => ({ 'Berlangsung':'status-berlangsung', 'Selesai':'status-selesai', 'Akan Datang':'status-akandatang' }[s] || 'status-akandatang')

onMounted(() => {
  kategoriStore.fetch()
  jadwalStore.fetch()
  hasilStore.fetch()
  regStore.fetch()
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

.row-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:24px; }
.section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
.section-title  { font:800 18px/1 Archivo; color:#1A1613; margin:0; }
.link-btn       { font:600 13px/1 'Plus Jakarta Sans'; color:#CE1126; text-decoration:none; }

.mini-list { display:flex; flex-direction:column; gap:10px; }
.mini-row  { display:flex; align-items:center; gap:12px; padding:10px 12px; background:#FAF8F3; border:1px solid #F0EBE2; border-radius:10px; }
.mini-nama { font:700 13px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.mini-sub  { font:500 12px/1.3 'Plus Jakarta Sans'; color:#7A7368; margin-top:3px; }
.avatar    { width:32px; height:32px; border-radius:50%; background:#CE1126; color:#fff; display:flex; align-items:center; justify-content:center; font:700 14px/1 Archivo; flex-shrink:0; }

.empty { text-align:center; padding:20px; color:#9A9389; font:500 13px/1 'Plus Jakarta Sans'; }

@media(max-width:767px) {
  .stats-grid { grid-template-columns:repeat(2,1fr); }
  .row-2 { grid-template-columns:1fr; }
}
</style>
