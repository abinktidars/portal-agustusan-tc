<template>
  <div>
    <div class="eyebrow">Klasemen Antar-Koridor</div>
    <h2 class="page-title">Perolehan Medali &amp; Poin</h2>
    <div class="table-wrap">
      <div class="table-head">
        <div>Peringkat</div>
        <div>Koridor</div>
        <div style="text-align:center;">🥇</div>
        <div style="text-align:center;">🥈</div>
        <div style="text-align:center;">🥉</div>
        <div style="text-align:right;">Poin</div>
      </div>
      <div v-for="k in klasemenStore.ranked" :key="k.nama" class="table-row" :style="{ background: k.rowBg }">
        <div class="desktop-row">
          <div class="rank" :style="{ color: k.accent }">{{ k.rank }}</div>
          <div class="nama">{{ k.nama }}</div>
          <div class="medal">{{ k.emas }}</div>
          <div class="medal">{{ k.perak }}</div>
          <div class="medal">{{ k.perunggu }}</div>
          <div class="poin" style="text-align:right;">{{ k.poin }}</div>
        </div>
        <div class="mobile-row">
          <div class="mobile-top">
            <div class="mobile-rank" :style="{ color: k.accent }">#{{ k.rank }}</div>
            <div class="mobile-name-wrap">
              <div class="nama">{{ k.nama }}</div>
              <div class="mobile-subtitle">Koridor</div>
            </div>
            <div class="poin mobile-poin">{{ k.poin }}</div>
          </div>
          <div class="mobile-stats">
            <div class="mobile-stat">
              <span>🥇</span>
              <strong>{{ k.emas }}</strong>
            </div>
            <div class="mobile-stat">
              <span>🥈</span>
              <strong>{{ k.perak }}</strong>
            </div>
            <div class="mobile-stat">
              <span>🥉</span>
              <strong>{{ k.perunggu }}</strong>
            </div>
          </div>
        </div>
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
  border-top: 1px solid #F0EBE2;
  padding: 16px 20px;
}
.desktop-row {
  display: grid; grid-template-columns: 60px 1fr 70px 70px 70px 90px; gap: 8px; align-items: center;
}
.mobile-row { display: none; }
.rank  { font: 900 22px/1 Archivo; }
.nama  { font: 800 16px/1.1 Archivo; color: #1A1613; }
.medal { text-align: center; font: 700 16px/1 'Plus Jakarta Sans'; color: #5A534B; }
.poin  { font: 900 22px/1 Archivo; color: #CE1126; }
.note  { font: 500 13px/1.5 'Plus Jakarta Sans'; color: #9A9389; margin-top: 14px; }
@media(max-width:767px) {
  .page-title { font-size: 26px; }
  .table-head { display: none; }
  .table-row { padding: 12px; }
  .desktop-row { display: none; }
  .mobile-row {
    display: grid;
    gap: 10px;
  }
  .mobile-top {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
  }
  .mobile-rank {
    min-width: 34px;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: rgba(255,255,255,.78);
    border: 1px solid rgba(240,211,215,.9);
    font: 900 16px/1 Archivo;
  }
  .mobile-name-wrap { min-width: 0; }
  .mobile-subtitle {
    margin-top: 3px;
    font: 600 11px/1 'Plus Jakarta Sans';
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #9A9389;
  }
  .mobile-poin {
    font-size: 18px;
    text-align: right;
  }
  .mobile-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .mobile-stat {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 8px;
    border-radius: 12px;
    background: rgba(255,255,255,.7);
    border: 1px solid rgba(226,220,210,.9);
    font: 700 13px/1 'Plus Jakarta Sans';
    color: #5A534B;
  }
  .mobile-stat strong { color: #1A1613; }
}
</style>
