<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="hasil" class="modal-backdrop" @click.self="$emit('close')">
        <Transition name="modal-slide">
          <div v-if="hasil" class="modal-sheet">
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-grip"></div>
              <button class="modal-close" @click="$emit('close')">✕</button>
              <div class="modal-title-row">
                <span class="dot" :style="{ background: katColor(hasil.kat) }"></span>
                <span class="modal-cabang">{{ hasil.cabang }}</span>
                <span class="kat-chip" :style="{ background: katBg(hasil.kat), color: katColor(hasil.kat) }">
                  {{ hasil.kat || 'Umum' }}
                </span>
              </div>
              <div class="modal-meta">
                📅 {{ hasil.tgl }}
                <span v-if="jadwalInfo?.babak"> · {{ jadwalInfo.babak }}</span>
                <span v-if="jadwalInfo?.jenis"> · <span class="jenis-inline" :class="jadwalInfo.jenis === 'Beregu' ? 'j-beregu' : 'j-perorangan'">{{ jadwalInfo.jenis }}</span></span>
              </div>
            </div>

            <!-- Body -->
            <div class="modal-body">

              <!-- VS / Score layout (ada timA dan timB) -->
              <template v-if="!hasil.juara1 && hasil.timA && hasil.timB">
                <div class="vs-container">
                  <div class="vs-team">
                    <div class="vs-nama">{{ hasil.timA }}</div>
                    <div v-if="isMenang(hasil.timA)" class="vs-winner-tag">🏆 Menang</div>
                  </div>
                  <div class="vs-middle">
                    <div class="vs-label">VS</div>
                    <div class="skor-big">{{ hasil.skor || '—' }}</div>
                  </div>
                  <div class="vs-team">
                    <div class="vs-nama">{{ hasil.timB }}</div>
                    <div v-if="isMenang(hasil.timB)" class="vs-winner-tag">🏆 Menang</div>
                  </div>
                </div>
                <div v-if="formatSetDetails(hasil.setDetails)" class="set-detail-card">
                  <div class="set-detail-label">Detail Set</div>
                  <div class="set-detail-val">{{ formatSetDetails(hasil.setDetails) }}</div>
                </div>
                <div v-if="hasil.juara" class="pemenang-card">
                  <div class="pemenang-crown">🏆</div>
                  <div class="pemenang-info">
                    <div class="pemenang-label">Pemenang / Juara</div>
                    <div class="pemenang-nama">{{ hasil.juara }}</div>
                  </div>
                </div>
              </template>

              <!-- Mode bebas: hanya teks hasil -->
              <template v-else-if="!hasil.juara1">
                <div class="hasil-card">
                  <div class="hasil-label">🏆 Hasil Pertandingan</div>
                  <div class="hasil-skor">{{ hasil.skor || hasil.hasilPertandingan || '—' }}</div>
                </div>
                <div v-if="hasil.juara" class="pemenang-card">
                  <div class="pemenang-crown">🏆</div>
                  <div class="pemenang-info">
                    <div class="pemenang-label">Pemenang / Juara</div>
                    <div class="pemenang-nama">{{ hasil.juara }}</div>
                  </div>
                </div>
              </template>

              <!-- Podium for perorangan -->
              <template v-else>
                <div class="podium-wrapper">
                  <div v-for="entry in juaraPodium" :key="entry.label"
                    class="podium-card" :class="entry.cls">
                    <div class="podium-medal">{{ entry.icon }}</div>
                    <div class="podium-info">
                      <div class="podium-label">{{ entry.label }}</div>
                      <div class="podium-nama">{{ entry.nama }}</div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Info dari jadwal yang sesuai -->
              <div v-if="jadwalInfo" class="extra-grid">
                <div v-if="lokasiNama" class="info-block">
                  <div class="info-label">📍 Lokasi</div>
                  <div class="info-val">{{ lokasiNama }}</div>
                </div>
                <div v-if="jadwalInfo.jamMulai" class="info-block">
                  <div class="info-label">🕐 Waktu</div>
                  <div class="info-val">{{ jadwalInfo.jamMulai }}–{{ jadwalInfo.jamSelesai }} WIB</div>
                </div>
                <div v-if="jadwalInfo.babak" class="info-block">
                  <div class="info-label">🏟️ Babak</div>
                  <div class="info-val">{{ jadwalInfo.babak }}</div>
                </div>
                <div v-if="jadwalInfo.peserta" class="info-block" style="grid-column:1/-1">
                  <div class="info-label">👥 Peserta / Keterangan</div>
                  <div class="info-val">{{ jadwalInfo.peserta }}</div>
                </div>
                <div v-if="jadwalInfo.keterangan" class="info-block" style="grid-column:1/-1">
                  <div class="info-label">📝 Keterangan Jadwal</div>
                  <div class="info-val">{{ jadwalInfo.keterangan }}</div>
                </div>
              </div>

              <!-- Catatan hasil -->
              <div v-if="hasil.catatan || hasil.catatanHasil" class="catatan-card">
                <div class="info-label">📝 Catatan Hasil</div>
                <div class="info-val">{{ hasil.catatan || hasil.catatanHasil }}</div>
              </div>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useJadwalStore } from '@/stores/useJadwal'
import { useLokasiStore } from '@/stores/useLokasi'

const props = defineProps({ hasil: { type: Object, default: null } })
defineEmits(['close'])

const jadwalStore = useJadwalStore()
const lokasiStore = useLokasiStore()

const jadwalInfo = computed(() => {
  if (!props.hasil) return null
  return jadwalStore.listWithStatus.find(j => j.cabang === props.hasil.cabang) || null
})

const lokasiNama = computed(() => {
  if (!jadwalInfo.value) return ''
  const j = jadwalInfo.value
  if (j.lokasiId) return lokasiStore.list.find(l => l.id === j.lokasiId)?.nama || j.lokasi || j.venue || ''
  return j.lokasi || j.venue || ''
})

const katColor = (k) => ({ Olahraga: '#CE1126', Tradisional: '#C0871C', 'E-Sport': '#2D5B8A', Acara: '#2E7D52' })[k] || '#CE1126'
const katBg    = (k) => ({ Olahraga: '#FBEAEC', Tradisional: '#FBF1DD', 'E-Sport': '#E7EEF6', Acara: '#E7F2EB' })[k] || '#FBEAEC'

const isMenang = (tim) => props.hasil?.juara && tim && props.hasil.juara === tim

function formatSetDetails(setDetails) {
  if (!setDetails) return ''
  if (Array.isArray(setDetails)) return setDetails.filter(Boolean).join(', ')
  return String(setDetails)
}

const juaraPodium = computed(() => {
  if (!props.hasil) return []
  const h = props.hasil
  return [
    { icon: '🥇', label: 'Juara 1', nama: h.juara1, cls: 'podium-emas' },
    { icon: '🥈', label: 'Juara 2', nama: h.juara2, cls: 'podium-perak' },
    { icon: '🥉', label: 'Juara 3', nama: h.juara3, cls: 'podium-perunggu' },
  ].filter(e => e.nama)
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(26, 22, 19, 0.55);
  display: flex; align-items: flex-end; justify-content: center;
}
@media (min-width: 600px) { .modal-backdrop { align-items: center; } }

.modal-sheet {
  width: 100%; max-width: 560px;
  background: #fff; border-radius: 20px 20px 0 0;
  max-height: 90dvh; display: flex; flex-direction: column;
  overflow: hidden; box-shadow: 0 -4px 32px rgba(0,0,0,.18);
}
@media (min-width: 600px) { .modal-sheet { border-radius: 16px; max-height: 82dvh; } }

.modal-grip {
  width: 40px; height: 4px; background: #E0D9D1; border-radius: 99px;
  margin: 12px auto 0; flex-shrink: 0;
}
@media (min-width: 600px) { .modal-grip { display: none; } }

.modal-header {
  padding: 14px 20px 16px;
  border-bottom: 1px solid #F0EBE2;
  flex-shrink: 0; position: relative;
}
.modal-close {
  position: absolute; top: 14px; right: 16px;
  background: #F5F2ED; border: none; border-radius: 50%;
  width: 32px; height: 32px; font-size: 13px; cursor: pointer;
  color: #5A534B; display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: #ECE7DE; }

.modal-title-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;
}
.modal-cabang { font: 800 18px/1.2 Archivo; color: #1A1613; }
.modal-meta   { font: 500 13px/1.4 'Plus Jakarta Sans'; color: #7A7368; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.kat-chip { padding: 3px 10px; border-radius: 999px; font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .04em; text-transform: uppercase; }
.jenis-inline { padding: 2px 8px; border-radius: 6px; font: 700 11px/1 'Plus Jakarta Sans'; }
.j-beregu     { color: #2E7D52; background: #DCF0E5; }
.j-perorangan { color: #6B3FA0; background: #F0E8FF; }

.modal-body {
  flex: 1; overflow-y: auto; padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
}

/* VS Display */
.vs-container {
  display: flex; align-items: stretch; gap: 10px;
  background: #FAF8F3; border: 1.5px solid #E2DCD2; border-radius: 16px;
  padding: 18px 14px; text-align: center;
}
.vs-team {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
}
.vs-nama { font: 800 15px/1.3 Archivo; color: #1A1613; word-break: break-word; }
.vs-winner-tag {
  font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .05em;
  color: #2E7D52; background: #DCF0E5;
  padding: 4px 10px; border-radius: 999px;
}
.vs-middle {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 4px; padding: 0 8px; flex-shrink: 0;
}
.vs-label { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .12em; color: #9A9389; }
.skor-big { font: 900 26px/1 Archivo; color: #CE1126; min-width: 64px; text-align: center; }

.set-detail-card {
  background: #FBF1DD;
  border: 1px solid #F3D7A2;
  border-radius: 12px;
  padding: 12px 14px;
}
.set-detail-label {
  font: 700 11px/1 'Plus Jakarta Sans';
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #9A7A2E;
  margin-bottom: 6px;
}
.set-detail-val {
  font: 700 14px/1.35 'Plus Jakarta Sans';
  color: #1A1613;
}

/* Hasil bebas */
.hasil-card {
  background: #DCF0E5; border: 1.5px solid #A8D5BB; border-radius: 12px; padding: 16px 18px;
}
.hasil-label { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #2E7D52; margin-bottom: 8px; }
.hasil-skor  { font: 800 20px/1.3 Archivo; color: #1A1613; }

/* Pemenang */
.pemenang-card {
  display: flex; align-items: center; gap: 14px;
  background: #FFF8E5; border: 1.5px solid #F5D06B; border-radius: 12px;
  padding: 14px 18px;
}
.pemenang-crown { font-size: 28px; flex-shrink: 0; }
.pemenang-label { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #C0871C; margin-bottom: 4px; }
.pemenang-nama  { font: 800 16px/1.2 Archivo; color: #1A1613; }

/* Podium */
.podium-wrapper { display: flex; flex-direction: column; gap: 10px; }
.podium-card    { display: flex; align-items: center; gap: 14px; border-radius: 12px; padding: 14px 18px; border: 1.5px solid; }
.podium-emas    { background: #FFF8E5; border-color: #F5D06B; }
.podium-perak   { background: #F4F4F6; border-color: #B8B8C8; }
.podium-perunggu{ background: #FDF0E8; border-color: #D4956A; }
.podium-medal   { font-size: 28px; flex-shrink: 0; }
.podium-label   { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #7A7368; margin-bottom: 4px; }
.podium-nama    { font: 800 16px/1.2 Archivo; color: #1A1613; }

/* Extra info from jadwal */
.extra-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  background: #FAF8F3; border: 1px solid #E2DCD2; border-radius: 12px; padding: 14px 16px;
}
.info-block {}
.info-label { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #9A9389; margin-bottom: 5px; }
.info-val   { font: 600 14px/1.4 'Plus Jakarta Sans'; color: #1A1613; }

/* Catatan */
.catatan-card { background: #FAF8F3; border-radius: 10px; padding: 14px 16px; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from,   .modal-fade-leave-to     { opacity: 0; }
.modal-slide-enter-active { transition: transform .28s cubic-bezier(.22,.68,0,1.2); }
.modal-slide-leave-active { transition: transform .2s ease-in; }
.modal-slide-enter-from,  .modal-slide-leave-to    { transform: translateY(100%); }
@media (min-width: 600px) {
  .modal-slide-enter-active { transition: transform .25s ease, opacity .2s ease; }
  .modal-slide-leave-active { transition: transform .18s ease-in, opacity .15s ease; }
  .modal-slide-enter-from,  .modal-slide-leave-to { transform: translateY(16px) scale(.97); opacity: 0; }
}
</style>
