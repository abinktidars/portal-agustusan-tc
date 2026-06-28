<template>
  <div>
    <div class="eyebrow">Hasil Pertandingan</div>
    <h2 class="page-title">Skor &amp; Pemenang</h2>
    <div class="hasil-grid">
      <div v-for="h in hasilStore.list" :key="h.id" class="hasil-card">
        <div class="hasil-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="dot" :style="{ background: katColor(h.kat) }"></span>
            <span class="cabang">{{ h.cabang }}</span>
          </div>
          <span class="tgl">{{ h.tgl }}</span>
        </div>
        <div class="skor-row">
          <div class="tim">{{ h.timA }}</div>
          <div class="skor">{{ h.skor }}</div>
          <div class="tim">{{ h.timB }}</div>
        </div>
        <div class="juara-row">
          <span style="font:700 12px/1 'Plus Jakarta Sans';color:#2E7D52;">🏆 Juara:</span>
          <span style="font:700 13px/1 'Plus Jakarta Sans';color:#1A1613;margin-left:6px;">{{ h.juara }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHasilStore } from '@/stores/useHasil'
const hasilStore = useHasilStore()
const katColor = (k) => ({ Olahraga:'#CE1126', Tradisional:'#C0871C', 'E-Sport':'#2D5B8A', Acara:'#2E7D52' })[k] || '#CE1126'
onMounted(() => hasilStore.fetch())
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #2E7D52; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.hasil-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
.hasil-card { background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; padding: 22px; }
.hasil-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.cabang { font: 800 16px/1.1 Archivo; color: #1A1613; }
.tgl    { font: 600 12px/1 'Plus Jakarta Sans'; color: #9A9389; }
.dot    { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.skor-row { display: flex; align-items: center; justify-content: center; gap: 18px; margin: 18px 0; }
.tim  { flex: 1; font: 700 15px/1.3 'Plus Jakarta Sans'; color: #5A534B; }
.tim:first-child { text-align: right; }
.skor { font: 900 26px/1 Archivo; color: #CE1126; background: #FBEAEC; border-radius: 12px; padding: 8px 14px; white-space: nowrap; }
.juara-row { display: flex; align-items: center; background: #E7F2EB; border-radius: 10px; padding: 9px 12px; }
@media(max-width:767px) {
  .hasil-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 26px; }
  .hasil-card { padding: 16px; }
}
</style>
