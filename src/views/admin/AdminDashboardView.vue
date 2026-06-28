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

.row-2 {
  display:grid;
  grid-template-columns:1fr;
  gap:14px;
}
.adm-section {
  background:#fff;
  border:1px solid #ECE7DE;
  border-radius:18px;
  padding:16px;
}
.section-header {
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  margin-bottom:14px;
}
.section-title  { font:800 16px/1.1 Archivo; color:#1A1613; margin:0; }
.link-btn       { font:600 13px/1.1 'Plus Jakarta Sans'; color:#CE1126; text-decoration:none; white-space:nowrap; }

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

.empty { text-align:center; padding:18px 14px; color:#9A9389; font:500 13px/1.4 'Plus Jakarta Sans'; }

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

  .section-header { align-items:center; margin-bottom:18px; }
  .section-title { font-size:18px; }
}

@media (min-width: 1100px) {
  .stats-grid { grid-template-columns:repeat(4,1fr); }
  .row-2 { grid-template-columns:1fr 1fr; gap:20px; }
  .adm-section { padding:24px; border-radius:20px; }
  .stat-card { padding:22px; }
}
</style>
