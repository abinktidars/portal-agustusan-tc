<template>
  <div>
    <div class="eyebrow">Hasil Pertandingan</div>
    <h2 class="page-title">Skor &amp; Pemenang</h2>

    <div class="hasil-grid">
      <div v-for="h in hasilStore.list" :key="h.id" class="hasil-card">
        <div class="hasil-header">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <span class="dot" :style="{ background: katColor(h.kat) }"></span>
            <span class="cabang">{{ h.cabang }}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <span v-if="isPerorangan(h)" class="jenis-badge">Perorangan</span>
            <span class="tgl">{{ h.tgl }}</span>
          </div>
        </div>

        <!-- ── Beregu: Tim A vs Tim B ── -->
        <template v-if="!isPerorangan(h)">
          <div class="skor-row">
            <div class="tim">{{ h.timA }}</div>
            <div class="skor">{{ h.skor }}</div>
            <div class="tim tim-right">{{ h.timB }}</div>
          </div>
          <div class="juara-row">
            <span class="juara-label">🏆 Juara:</span>
            <span class="juara-nama">{{ h.juara }}</span>
          </div>
        </template>

        <!-- ── Perorangan: Podium ── -->
        <template v-else>
          <div class="podium-wrap">
            <div v-if="h.juara1" class="podium-item podium-gold">
              <span class="podium-icon">🥇</span>
              <span class="podium-nama">{{ h.juara1 }}</span>
            </div>
            <div v-if="h.juara2" class="podium-item">
              <span class="podium-icon">🥈</span>
              <span class="podium-nama">{{ h.juara2 }}</span>
            </div>
            <div v-if="h.juara3" class="podium-item">
              <span class="podium-icon">🥉</span>
              <span class="podium-nama">{{ h.juara3 }}</span>
            </div>
          </div>
        </template>
      </div>

      <div v-if="!hasilStore.list.length" class="empty-state">
        Belum ada hasil pertandingan yang dicatat.
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHasilStore } from '@/stores/useHasil'

const hasilStore = useHasilStore()

const katColor = (k) => ({
  Olahraga:    '#CE1126',
  Tradisional: '#C0871C',
  'E-Sport':   '#2D5B8A',
  Acara:       '#2E7D52',
})[k] || '#CE1126'

function isPerorangan(h) {
  return !!(h.juara1 || h.juara2 || h.juara3) || h.jenis === 'Perorangan'
}

onMounted(() => hasilStore.fetch())
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #2E7D52; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }

.hasil-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.hasil-card {
  background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; padding: 22px;
  display: flex; flex-direction: column; gap: 0;
}

.hasil-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 10px; flex-wrap: wrap; margin-bottom: 16px;
}
.cabang { font: 800 16px/1.1 Archivo; color: #1A1613; }
.tgl    { font: 600 12px/1 'Plus Jakarta Sans'; color: #9A9389; white-space: nowrap; }
.dot    { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; margin-top: 2px; }

.jenis-badge {
  font: 700 10px/1 'Plus Jakarta Sans'; letter-spacing: .05em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 6px; background: #FBF1DD; color: #C0871C; flex-shrink: 0;
}

/* ── Beregu ── */
.skor-row {
  display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 12px;
}
.tim { flex: 1; min-width: 0; font: 700 15px/1.3 'Plus Jakarta Sans'; color: #5A534B; word-break: break-word; text-align: right; }
.tim-right { text-align: left; }
.skor {
  flex-shrink: 0; font: 900 26px/1 Archivo; color: #CE1126;
  background: #FBEAEC; border-radius: 12px; padding: 8px 14px; white-space: nowrap;
}
.juara-row {
  display: flex; align-items: center; flex-wrap: wrap; gap: 4px;
  background: #E7F2EB; border-radius: 10px; padding: 9px 12px;
}
.juara-label { font: 700 12px/1 'Plus Jakarta Sans'; color: #2E7D52; }
.juara-nama  { font: 700 13px/1 'Plus Jakarta Sans'; color: #1A1613; margin-left: 6px; }

/* ── Perorangan podium ── */
.podium-wrap {
  display: flex; flex-direction: column; gap: 10px;
  background: #FAF8F3; border-radius: 10px; padding: 14px 16px;
}
.podium-item { display: flex; align-items: center; gap: 10px; }
.podium-gold .podium-nama { font-weight: 800; }
.podium-icon { font-size: 22px; line-height: 1; flex-shrink: 0; }
.podium-nama { font: 600 15px/1.3 'Plus Jakarta Sans'; color: #1A1613; }

.empty-state {
  grid-column: 1/-1; text-align: center; padding: 48px;
  font: 500 14px/1.5 'Plus Jakarta Sans'; color: #9A9389;
}

@media(max-width:767px) {
  .hasil-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 26px; }
  .hasil-card { padding: 16px; }
  .skor-row   { gap: 10px; }
  .skor       { font-size: 22px; padding: 7px 12px; }
  .tim        { font-size: 13px; }
  .podium-icon{ font-size: 18px; }
  .podium-nama{ font-size: 13px; }
}
</style>
