<template>
  <div>
    <div class="eyebrow">Hasil Pertandingan</div>
    <h2 class="page-title">Skor &amp; Pemenang</h2>

    <div class="hasil-grid">
      <div
        v-for="h in hasilStore.list"
        :key="h.id"
        class="hasil-card"
        role="button"
        tabindex="0"
        @click="openDetail(h)"
        @keydown.enter.prevent="openDetail(h)"
        @keydown.space.prevent="openDetail(h)"
      >
        <div class="hasil-header">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <span class="dot" :style="{ background: katColor(h.kat) }"></span>
            <span class="cabang">{{ h.cabang }}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <span v-if="isPerorangan(h)" class="jenis-badge">Perorangan</span>
            <span v-if="getHari(h.tgl)" class="hari">{{ getHari(h.tgl) }}</span>
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
          <div v-if="formatSetDetails(h.setDetails)" class="set-row-detail">Set: {{ formatSetDetails(h.setDetails) }}</div>
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

    <div v-if="selectedHasil" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-box">
        <div class="modal-head">
          <div>
            <div class="modal-title">Detail Hasil Pertandingan</div>
            <div class="modal-sub">{{ selectedHasil.cabang }} · {{ selectedHasil.tgl }}</div>
          </div>
          <button class="btn-close" type="button" @click="closeDetail">Tutup</button>
        </div>

        <template v-if="!isPerorangan(selectedHasil)">
          <div class="modal-score-row">
            <div class="modal-team">{{ selectedHasil.timA || '-' }}</div>
            <div class="modal-score">{{ selectedHasil.skor || '-' }}</div>
            <div class="modal-team modal-team-right">{{ selectedHasil.timB || '-' }}</div>
          </div>
          <div v-if="formatSetDetails(selectedHasil.setDetails)" class="modal-set-detail">
            Set: {{ formatSetDetails(selectedHasil.setDetails) }}
          </div>
          <div class="modal-juara">
            <span class="modal-label">Pemenang</span>
            <strong>{{ selectedHasil.juara || '-' }}</strong>
          </div>
        </template>

        <template v-else>
          <div class="modal-podium">
            <div v-if="selectedHasil.juara1" class="modal-podium-item">🥇 {{ selectedHasil.juara1 }}</div>
            <div v-if="selectedHasil.juara2" class="modal-podium-item">🥈 {{ selectedHasil.juara2 }}</div>
            <div v-if="selectedHasil.juara3" class="modal-podium-item">🥉 {{ selectedHasil.juara3 }}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useHasilStore } from '@/stores/useHasil'

const hasilStore = useHasilStore()
const selectedHasil = ref(null)

const katColor = (k) => ({
  Olahraga:    '#CE1126',
  Tradisional: '#C0871C',
  'E-Sport':   '#2D5B8A',
  Acara:       '#2E7D52',
})[k] || '#CE1126'

function isPerorangan(h) {
  return !!(h.juara1 || h.juara2 || h.juara3) || h.jenis === 'Perorangan'
}

function formatSetDetails(setDetails) {
  if (!setDetails) return ''
  if (Array.isArray(setDetails)) return setDetails.filter(Boolean).join(', ')
  return String(setDetails)
}

function getHari(tanggal) {
  if (!tanggal) return ''
  const raw = String(tanggal).trim()
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  let date
  if (iso) {
    date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  } else {
    const short = raw.match(/^(\d{1,2})\s+([A-Za-z]{3,})$/)
    if (!short) return ''
    const monthMap = { Jan:0, Feb:1, Mar:2, Apr:3, Mei:4, Jun:5, Jul:6, Agu:7, Sep:8, Okt:9, Nov:10, Des:11 }
    const month = monthMap[short[2]]
    if (month === undefined) return ''
    date = new Date(new Date().getFullYear(), month, Number(short[1]))
  }
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)
}

function openDetail(hasil) {
  selectedHasil.value = hasil
}

function closeDetail() {
  selectedHasil.value = null
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
  cursor: pointer;
  transition: box-shadow .15s ease, border-color .15s ease;
}
.hasil-card:hover { border-color: #CE1126; box-shadow: 0 8px 24px rgba(206, 17, 38, .12); }
.hasil-card:focus-visible { outline: 3px solid rgba(206, 17, 38, .25); outline-offset: 2px; }
.hasil-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 10px; flex-wrap: wrap; margin-bottom: 16px;
}
.cabang { font: 800 16px/1.1 Archivo; color: #1A1613; }
.tanggal-meta { display: flex; align-items: center; gap: 8px; justify-self: end; white-space: nowrap; }
.hari   { font: 700 11px/1 'Plus Jakarta Sans'; color: #2E7D52; background: #E7F2EB; border: 1px solid #BFE0CC; border-radius: 999px; padding: 4px 8px; text-transform: capitalize; }
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
.set-row-detail {
  margin: 0 0 10px;
  text-align: center;
  font: 700 12px/1.3 'Plus Jakarta Sans';
  color: #7A5C00;
  background: #FBF1DD;
  border-radius: 10px;
  padding: 7px 10px;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
}

.modal-box {
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #E2DCD2;
  padding: 18px;
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.modal-title { font: 800 20px/1.1 Archivo; color: #1A1613; }
.modal-sub { margin-top: 6px; font: 600 12px/1 'Plus Jakarta Sans'; color: #7A7368; }

.btn-close {
  border: 1px solid #E2DCD2;
  background: #fff;
  color: #5A534B;
  border-radius: 8px;
  padding: 7px 12px;
  font: 700 12px/1 'Plus Jakarta Sans';
  cursor: pointer;
}

.modal-score-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.modal-team {
  flex: 1;
  text-align: right;
  font: 700 15px/1.3 'Plus Jakarta Sans';
  color: #5A534B;
  min-width: 0;
  word-break: break-word;
}

.modal-team-right { text-align: left; }

.modal-score {
  flex-shrink: 0;
  font: 900 28px/1 Archivo;
  color: #CE1126;
  background: #FBEAEC;
  border-radius: 12px;
  padding: 9px 14px;
}

.modal-set-detail {
  margin-top: 12px;
  text-align: center;
  font: 700 13px/1.35 'Plus Jakarta Sans';
  color: #7A5C00;
  background: #FBF1DD;
  border-radius: 10px;
  padding: 8px 10px;
}

.modal-juara {
  margin-top: 12px;
  background: #E7F2EB;
  color: #1A1613;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.modal-label { font: 700 12px/1 'Plus Jakarta Sans'; color: #2E7D52; }

.modal-podium {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #FAF8F3;
  border-radius: 10px;
  padding: 12px;
}

.modal-podium-item {
  font: 700 14px/1.4 'Plus Jakarta Sans';
  color: #1A1613;
}

@media(max-width:767px) {
  .hasil-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 26px; }
  .hasil-card { padding: 14px; }
  .skor-row   { gap: 10px; }
  .skor       { font-size: 22px; padding: 7px 12px; }
  .tim        { font-size: 13px; }
  .podium-icon{ font-size: 18px; }
  .podium-nama{ font-size: 13px; }
  .hari       { font-size: 10px; padding: 3px 7px; }
  .modal-box { padding: 14px; }
  .modal-title { font-size: 18px; }
  .modal-score { font-size: 22px; }
  .modal-team { font-size: 13px; }
}
</style>
