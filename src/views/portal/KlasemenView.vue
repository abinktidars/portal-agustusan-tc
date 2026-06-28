<template>
  <div>
    <div class="eyebrow">Klasemen Antar-Blok</div>
    <h2 class="page-title">Perolehan Medali &amp; Poin</h2>
    <div class="table-wrap">
      <div class="table-head">
        <div>Peringkat</div><div>Blok</div>
        <div style="text-align:center;">🥇</div>
        <div style="text-align:center;">🥈</div>
        <div style="text-align:center;">🥉</div>
        <div style="text-align:right;">Poin</div>
      </div>
      <div v-for="k in klasemenStore.ranked" :key="k.nama" class="table-row" :style="{ background: k.rowBg }">
        <div class="rank" :style="{ color: k.accent }">{{ k.rank }}</div>
        <div class="nama">{{ k.nama }}</div>
        <div class="medal">{{ k.emas }}</div>
        <div class="medal">{{ k.perak }}</div>
        <div class="medal">{{ k.perunggu }}</div>
        <div class="poin" style="text-align:right;">{{ k.poin }}</div>
      </div>
    </div>
    <p class="note">Poin dihitung dari: emas ×5, perak ×3, perunggu ×1. Diperbarui setiap selesai pertandingan oleh panitia.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useKlasemenStore } from '@/stores/useKlasemen'
const klasemenStore = useKlasemenStore()
onMounted(() => klasemenStore.fetch())
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #9A6B12; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.table-wrap { background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; overflow: hidden; }
.table-head {
  display: grid; grid-template-columns: 60px 1fr 70px 70px 70px 90px; gap: 8px;
  padding: 14px 20px; background: #1A1613; color: #fff;
  font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .04em; text-transform: uppercase; align-items: center;
}
.table-row {
  display: grid; grid-template-columns: 60px 1fr 70px 70px 70px 90px; gap: 8px;
  padding: 16px 20px; border-top: 1px solid #F0EBE2; align-items: center;
}
.rank  { font: 900 22px/1 Archivo; }
.nama  { font: 800 16px/1.1 Archivo; color: #1A1613; }
.medal { text-align: center; font: 700 16px/1 'Plus Jakarta Sans'; color: #5A534B; }
.poin  { font: 900 22px/1 Archivo; color: #CE1126; }
.note  { font: 500 13px/1.5 'Plus Jakarta Sans'; color: #9A9389; margin-top: 14px; }
@media(max-width:767px) {
  .table-head, .table-row { grid-template-columns: 40px 1fr 50px 50px 50px 60px; gap: 4px; padding: 12px; }
}
</style>
