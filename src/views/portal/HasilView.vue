<template>
  <div>
    <div class="eyebrow">Hasil Pertandingan</div>
    <h2 class="page-title">Skor &amp; Pemenang</h2>
    <div class="hasil-grid">
      <div v-for="h in hasilStore.list" :key="h.id" class="hasil-card">
        <div class="hasil-header">
          <div class="cabang-meta">
            <span class="dot" :style="{ background: katColor(h.kat) }"></span>
            <span class="cabang">{{ h.cabang }}</span>
          </div>
          <div class="tanggal-meta">
            <span class="hari">{{ getHari(h.tgl) }}</span>
            <span class="tgl">{{ h.tgl }}</span>
          </div>
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

function getHari(tanggal) {
  if (!tanggal) return '-'

  const raw = String(tanggal).trim()
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  let date
  if (iso) {
    date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  } else {
    const short = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,})$/)
    if (!short) return '-'

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
    const month = monthMap[short[2]]
    if (month === undefined) return '-'
    date = new Date(new Date().getFullYear(), month, Number(short[1]))
  }

  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)
}

onMounted(() => hasilStore.fetch())
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #2E7D52; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.hasil-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
.hasil-card { background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; padding: 22px; }
.hasil-header { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px; }
.cabang-meta { display: flex; align-items: center; gap: 8px; min-width: 0; }
.cabang { font: 800 16px/1.1 Archivo; color: #1A1613; }
.tanggal-meta { display: flex; align-items: center; gap: 8px; justify-self: end; white-space: nowrap; }
.hari   { font: 700 11px/1 'Plus Jakarta Sans'; color: #2E7D52; background: #E7F2EB; border: 1px solid #BFE0CC; border-radius: 999px; padding: 4px 8px; text-transform: capitalize; }
.tgl    { font: 600 12px/1 'Plus Jakarta Sans'; color: #9A9389; white-space: nowrap; }
.dot    { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.skor-row { display: flex; align-items: center; justify-content: center; gap: 18px; margin: 18px 0; }
.tim  { flex: 1; min-width: 0; font: 700 15px/1.3 'Plus Jakarta Sans'; color: #5A534B; word-break: break-word; }
.tim:first-child { text-align: right; }
.skor { flex-shrink: 0; font: 900 26px/1 Archivo; color: #CE1126; background: #FBEAEC; border-radius: 12px; padding: 8px 14px; white-space: nowrap; }
.juara-row { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; background: #E7F2EB; border-radius: 10px; padding: 9px 12px; }
@media(max-width:767px) {
  .hasil-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 26px; }
  .hasil-card { padding: 14px; border-radius: 10px; }
  .hasil-header { gap: 8px; grid-template-columns: minmax(0, 1fr) auto; }
  .tanggal-meta { gap: 6px; }
  .hari { font-size: 10px; padding: 4px 7px; }
  .skor-row {
    gap: 8px;
    margin: 14px 0;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }
  .skor { font-size: 22px; padding: 7px 12px; }
  .tim { font-size: 13px; }
  .tim:first-child { text-align: left; }
  .tim:last-child { text-align: right; }
  .juara-row { padding: 8px 10px; }
}
</style>
