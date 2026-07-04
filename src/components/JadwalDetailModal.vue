<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="jadwal" class="modal-backdrop" @click.self="$emit('close')">
        <Transition name="modal-slide">
          <div v-if="jadwal" class="modal-sheet">
            <!-- Header -->
            <div class="modal-header">
              <div class="modal-grip"></div>
              <button class="modal-close" @click="$emit('close')">✕</button>
              <div class="modal-title-row">
                <span class="dot" :style="{ background: katColor(jadwal.kat) }"></span>
                <span class="modal-cabang">{{ jadwal.cabang }}</span>
                <StatusBadge :status="jadwal.status" />
              </div>
              <div class="modal-meta">
                {{ tglRange }}&nbsp;·&nbsp;{{ jadwal.jamMulai }}–{{ jadwal.jamSelesai }} WIB
                <span v-if="lokasiNama" class="modal-meta-sep">·</span>
                <span v-if="lokasiNama">📍 {{ lokasiNama }}</span>
              </div>
            </div>

            <!-- Tabs -->
            <div class="tab-row">
              <button v-for="tab in tabs" :key="tab.key"
                class="tab-btn" :class="{ active: activeTab === tab.key }"
                @click="activeTab = tab.key">
                {{ tab.label }}
              </button>
            </div>

            <!-- Tab Content -->
            <div class="modal-body">

              <!-- DETAIL -->
              <div v-if="activeTab === 'detail'" class="tab-content">
                <div class="info-grid">
                  <!-- Tanggal: 1 blok jika sama, 2 blok jika beda -->
                  <template v-if="isMultiDay">
                    <div class="info-block">
                      <div class="info-label">📅 Tanggal Mulai</div>
                      <div class="info-val">{{ jadwal.tglMulai || jadwal.tgl }}</div>
                    </div>
                    <div class="info-block">
                      <div class="info-label">📅 Tanggal Selesai</div>
                      <div class="info-val">{{ jadwal.tglSelesai }}</div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="info-block">
                      <div class="info-label">📅 Tanggal</div>
                      <div class="info-val">{{ jadwal.tglMulai || jadwal.tgl }}</div>
                    </div>
                  </template>
                  <div class="info-block">
                    <div class="info-label">🕐 Waktu</div>
                    <div class="info-val">{{ jadwal.jamMulai }} – {{ jadwal.jamSelesai }} WIB</div>
                  </div>
                  <div class="info-block">
                    <div class="info-label">📍 Lokasi</div>
                    <div class="info-val">{{ lokasiNama || '—' }}</div>
                  </div>
                  <div v-if="jadwal.babak || jadwal.jenis" class="info-block" style="grid-column: 1 / -1">
                    <div class="info-label">🏷️ Babak & Jenis</div>
                    <div class="info-val" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
                      <span v-if="jadwal.babak" class="babak-chip">{{ jadwal.babak }}</span>
                      <span v-if="jadwal.jenis" class="jenis-chip"
                        :class="jadwal.jenis === 'Beregu' ? 'jenis-beregu' : 'jenis-perorangan'">
                        {{ jadwal.jenis }}
                      </span>
                    </div>
                  </div>
                  <div class="info-block">
                    <div class="info-label">🏷️ Kategori</div>
                    <div class="info-val">
                      <span class="kat-chip" :style="{ background: katBg(jadwal.kat), color: katColor(jadwal.kat) }">
                        {{ jadwal.kat || 'Umum' }}
                      </span>
                    </div>
                  </div>
                  <div v-if="jadwal.peserta" class="info-block" style="grid-column: 1 / -1">
                    <div class="info-label">👥 Babak / Peserta</div>
                    <div class="info-val">{{ jadwal.peserta }}</div>
                  </div>
                  <div v-if="jadwal.keterangan" class="info-block" style="grid-column: 1 / -1">
                    <div class="info-label">📝 Keterangan</div>
                    <div class="info-val">{{ jadwal.keterangan }}</div>
                  </div>
                </div>

                <button v-if="jadwal.status === 'Akan Datang'"
                  class="daftar-btn" @click="$emit('daftar')">
                  Daftar Sekarang →
                </button>
                <button v-if="jadwal.hasilPertandingan"
                  type="button" class="lihat-hasil-btn" @click="goHasil">
                  Lihat Detail Hasil →
                </button>
              </div>

              <!-- PERSYARATAN -->
              <div v-if="activeTab === 'syarat'" class="tab-content">
                <div v-if="jadwal.persyaratan && jadwal.persyaratan.length" class="syarat-list">
                  <div v-for="(s, i) in jadwal.persyaratan" :key="i" class="syarat-item">
                    <span class="syarat-num">{{ i + 1 }}</span>
                    <span class="syarat-text">{{ s }}</span>
                  </div>
                </div>
                <div v-else-if="jadwal.syarat" class="syarat-prose">{{ jadwal.syarat }}</div>
                <div v-else class="empty-tab">
                  <div class="empty-icon">📋</div>
                  <div class="empty-msg">Persyaratan belum tersedia.</div>
                  <div class="empty-sub">Hubungi panitia untuk informasi lebih lanjut.</div>
                </div>
              </div>

              <!-- PESERTA -->
              <div v-if="activeTab === 'peserta'" class="tab-content">
                <div v-if="pesertaList.length" class="peserta-list">
                  <div v-for="(p, i) in pesertaList" :key="p.id || i" class="peserta-card">
                    <div class="peserta-avatar" :style="{ background: katColor(jadwal.kat) }">
                      {{ initial(p) }}
                    </div>
                    <div class="peserta-info">
                      <div class="peserta-nama">{{ namaPeserta(p) }}</div>
                      <div class="peserta-line">
                        {{ isTimPeserta(p) ? 'Tim' : 'Perorangan' }}
                        <span v-if="p.koridorNama || p.koridor"> · {{ p.koridorNama || 'Koridor ' + p.koridor }}</span>
                        <span v-if="p.blokRumah"> · {{ p.blokRumah }}</span>
                      </div>
                      <div v-if="isTimPeserta(p) && p.anggota?.length" class="peserta-anggota">
                        Anggota: {{ p.anggota.filter(a => a).join(', ') }}
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-tab">
                  <div class="empty-icon">👥</div>
                  <div class="empty-msg">Belum ada peserta terdaftar.</div>
                  <div v-if="jadwal.status === 'Akan Datang'" class="empty-sub">
                    Jadilah yang pertama mendaftar!
                  </div>
                </div>
                <div v-if="pesertaList.length" class="peserta-count">
                  {{ pesertaList.length }} peserta / tim terdaftar
                </div>
              </div>

              <!-- HASIL -->
              <div v-if="activeTab === 'hasil'" class="tab-content">
                <div v-if="jadwal.hasilPertandingan" class="hasil-section">

                  <!-- Perorangan: tampilkan podium juara 1/2/3 -->
                  <template v-if="jadwal.juara1">
                    <div v-for="(entry, i) in juaraPodium" :key="i" class="podium-card" :class="entry.cls">
                      <div class="podium-medal">{{ entry.icon }}</div>
                      <div class="podium-info">
                        <div class="podium-label">{{ entry.label }}</div>
                        <div class="podium-nama">{{ entry.nama }}</div>
                      </div>
                    </div>
                  </template>

                  <!-- VS / Bebas: skor + pemenang -->
                  <template v-else>
                    <div class="hasil-card">
                      <div class="hasil-label">🏆 Skor / Hasil</div>
                      <div class="hasil-skor">{{ jadwal.hasilPertandingan }}</div>
                    </div>
                    <div v-if="setDetailList.length" class="set-detail-card">
                      <div class="hasil-label">📊 Detail Set</div>
                      <div class="set-detail-list">
                        <div v-for="(s, i) in setDetailList" :key="i" class="set-detail-row">
                          <span class="set-detail-num">Set {{ i + 1 }}</span>
                          <span class="set-detail-score">{{ s }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="jadwal.pemenang" class="pemenang-card">
                      <div class="pemenang-crown">🥇</div>
                      <div class="pemenang-info">
                        <div class="pemenang-label">Pemenang</div>
                        <div class="pemenang-nama">{{ jadwal.pemenang }}</div>
                      </div>
                    </div>
                  </template>

                  <div v-if="jadwal.catatanHasil" class="catatan-card">
                    <div class="info-label">📝 Catatan</div>
                    <div class="info-val">{{ jadwal.catatanHasil }}</div>
                  </div>

                  <button type="button" class="lihat-hasil-btn" @click="goHasil">
                    Lihat Detail Hasil →
                  </button>
                </div>
                <div v-else class="empty-tab">
                  <div class="empty-icon">{{ jadwal.status === 'Selesai' ? '📊' : '⏳' }}</div>
                  <div class="empty-msg">
                    {{ jadwal.status === 'Berlangsung' ? 'Pertandingan sedang berlangsung.' : 'Hasil belum tersedia.' }}
                  </div>
                  <div class="empty-sub">
                    {{ jadwal.status === 'Akan Datang' ? 'Hasil akan ditampilkan setelah pertandingan selesai.' : '' }}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatusBadge from '@/components/StatusBadge.vue'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import { useLokasiStore }     from '@/stores/useLokasi'
import { useKategoriStore }   from '@/stores/useKategori'

const props = defineProps({ jadwal: { type: Object, default: null } })
const emit = defineEmits(['close', 'daftar'])

const route  = useRoute()
const router = useRouter()
const registrasiStore = useRegistrasiStore()
const lokasiStore     = useLokasiStore()
const kategoriStore   = useKategoriStore()

function goHasil() {
  const isAdmin = route.path.startsWith('/admin')
  emit('close')
  router.push({ name: isAdmin ? 'admin-hasil' : 'hasil' })
}

function isTimPeserta(p) {
  const kat = kategoriStore.list.find(k => k.nama === p.cabang)
  if (kat?.jenis) return kat.jenis === 'Beregu'
  return p.tipe === 'tim'
}

const activeTab = ref('detail')

const tabs = [
  { key: 'detail',  label: 'Detail' },
  { key: 'syarat',  label: 'Persyaratan' },
  { key: 'peserta', label: 'Peserta' },
  { key: 'hasil',   label: 'Hasil' },
]

const tglRange = computed(() => {
  if (!props.jadwal) return ''
  const mulai   = props.jadwal.tglMulai || props.jadwal.tgl || ''
  const selesai = props.jadwal.tglSelesai || ''
  if (!selesai || selesai === mulai) return mulai
  return `${mulai} – ${selesai}`
})

const isMultiDay = computed(() => {
  if (!props.jadwal) return false
  const mulai   = props.jadwal.tglMulai || props.jadwal.tgl || ''
  const selesai = props.jadwal.tglSelesai || ''
  return !!(selesai && selesai !== mulai)
})

const lokasiNama = computed(() => {
  if (!props.jadwal) return ''
  const j = props.jadwal
  if (j.lokasiId) return lokasiStore.list.find(l => l.id === j.lokasiId)?.nama || j.lokasi || j.venue || ''
  return j.lokasi || j.venue || ''
})

const namaPeserta = (p) => p.namaRegu || p.namaKetua || p.nama || '—'

const pesertaNamesInJadwal = computed(() => {
  const raw = props.jadwal?.peserta || ''
  if (!raw) return []
  const parts = raw.includes(' vs ') ? raw.split(' vs ') : raw.split(',')
  return parts.map(s => s.trim().toLowerCase()).filter(Boolean)
})

const pesertaList = computed(() => {
  if (!props.jadwal) return []
  const pool = registrasiStore.list.filter(r => r.cabang === props.jadwal.cabang)
  const names = pesertaNamesInJadwal.value
  if (!names.length) return []
  return pool.filter(r => names.includes(namaPeserta(r).trim().toLowerCase()))
})

const katColor = (k) => ({ Olahraga: '#CE1126', Tradisional: '#C0871C', 'E-Sport': '#2D5B8A', Acara: '#2E7D52' })[k] || '#CE1126'
const katBg = (k) => ({ Olahraga: '#FBEAEC', Tradisional: '#FBF1DD', 'E-Sport': '#E7EEF6', Acara: '#E7F2EB' })[k] || '#FBEAEC'
const initial = (p) => (namaPeserta(p)).charAt(0).toUpperCase()

watch(() => props.jadwal, () => { activeTab.value = 'detail' })

const setDetailList = computed(() => {
  const sd = props.jadwal?.setDetails
  if (!sd) return []
  const arr = Array.isArray(sd) ? sd : String(sd).split(',')
  return arr.map(s => String(s).trim()).filter(Boolean)
})

const juaraPodium = computed(() => {
  if (!props.jadwal) return []
  const entries = [
    { icon: '🥇', label: 'Juara 1', nama: props.jadwal.juara1, cls: 'podium-emas' },
    { icon: '🥈', label: 'Juara 2', nama: props.jadwal.juara2, cls: 'podium-perak' },
    { icon: '🥉', label: 'Juara 3', nama: props.jadwal.juara3, cls: 'podium-perunggu' },
  ]
  return entries.filter(e => e.nama)
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(26, 22, 19, 0.55);
  display: flex; align-items: flex-end; justify-content: center;
}
@media (min-width: 600px) {
  .modal-backdrop { align-items: center; }
}

.modal-sheet {
  width: 100%; max-width: 600px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  max-height: 92dvh;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -4px 32px rgba(0,0,0,.18);
}
@media (min-width: 600px) {
  .modal-sheet { border-radius: 16px; max-height: 85dvh; }
}

.modal-grip {
  width: 40px; height: 4px; background: #E0D9D1; border-radius: 99px;
  margin: 12px auto 0;
  flex-shrink: 0;
}
@media (min-width: 600px) { .modal-grip { display: none; } }

.modal-header {
  padding: 14px 20px 16px;
  border-bottom: 1px solid #F0EBE2;
  flex-shrink: 0;
  position: relative;
}
.modal-close {
  position: absolute; top: 14px; right: 16px;
  background: #F5F2ED; border: none; border-radius: 50%;
  width: 32px; height: 32px; font-size: 13px; cursor: pointer;
  color: #5A534B; display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: #ECE7DE; }

.modal-title-row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  margin-bottom: 6px;
}
.modal-cabang { font: 800 18px/1.2 Archivo; color: #1A1613; }
.modal-meta {
  font: 500 13px/1.4 'Plus Jakarta Sans'; color: #7A7368;
}
.modal-meta-sep { margin: 0 4px; }
.dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

/* Tabs */
.tab-row {
  display: flex; gap: 0;
  border-bottom: 1.5px solid #F0EBE2;
  flex-shrink: 0; overflow-x: auto;
  scrollbar-width: none;
}
.tab-row::-webkit-scrollbar { display: none; }
.tab-btn {
  flex: 1; min-width: 80px; padding: 11px 8px;
  background: none; border: none; cursor: pointer;
  font: 700 13px/1 'Plus Jakarta Sans'; color: #9A9389;
  border-bottom: 2.5px solid transparent;
  transition: color .15s, border-color .15s;
  white-space: nowrap;
}
.tab-btn.active { color: #CE1126; border-bottom-color: #CE1126; }
.tab-btn:hover:not(.active) { color: #5A534B; }

/* Body */
.modal-body {
  flex: 1; overflow-y: auto; padding: 20px;
}
.tab-content { display: flex; flex-direction: column; gap: 14px; }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.info-block { }
.info-label { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #9A9389; margin-bottom: 5px; }
.info-val { font: 600 14px/1.4 'Plus Jakarta Sans'; color: #1A1613; }
.kat-chip   { padding: 4px 10px; border-radius: 999px; font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .04em; text-transform: uppercase; }
.babak-chip { display:inline-block; padding: 4px 10px; border-radius: 6px; font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .05em; text-transform: uppercase; color: #2D5B8A; background: #E7EEF6; }
.jenis-chip { display:inline-block; padding: 4px 10px; border-radius: 6px; font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .05em; text-transform: uppercase; }
.jenis-beregu     { color:#2E7D52; background:#DCF0E5; }
.jenis-perorangan { color:#6B3FA0; background:#F0E8FF; }

.daftar-btn {
  align-self: flex-start; margin-top: 4px;
  padding: 10px 20px; border: 1.5px solid #CE1126; border-radius: 8px;
  background: #CE1126; color: #fff;
  font: 700 13px/1 'Plus Jakarta Sans'; cursor: pointer; transition: all .15s;
}
.daftar-btn:hover { background: #A80E1E; border-color: #A80E1E; }

/* Persyaratan */
.syarat-list { display: flex; flex-direction: column; gap: 10px; }
.syarat-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 14px; background: #FAF8F3; border-radius: 8px;
}
.syarat-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: #CE1126; color: #fff;
  font: 700 11px/22px 'Plus Jakarta Sans'; text-align: center;
  flex-shrink: 0;
}
.syarat-text { font: 500 14px/1.5 'Plus Jakarta Sans'; color: #3A332B; }
.syarat-prose { font: 500 14px/1.7 'Plus Jakarta Sans'; color: #3A332B; white-space: pre-wrap; }

/* Peserta */
.peserta-list { display: flex; flex-direction: column; gap: 10px; }
.peserta-card { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; background: #FAF8F3; border-radius: 10px; }
.peserta-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font: 700 15px/1 Archivo; flex-shrink: 0;
}
.peserta-info { flex: 1; min-width: 0; }
.peserta-nama { font: 700 14px/1.3 Archivo; color: #1A1613; }
.peserta-line { font: 500 12px/1.4 'Plus Jakarta Sans'; color: #7A7368; margin-top: 2px; }
.peserta-anggota { font: 500 12px/1.4 'Plus Jakarta Sans'; color: #9A9389; margin-top: 3px; }
.peserta-count {
  text-align: center; font: 600 12px/1 'Plus Jakarta Sans'; color: #9A9389;
  padding-top: 8px;
}

/* Hasil */
.hasil-section { display: flex; flex-direction: column; gap: 12px; }
.hasil-card {
  background: #DCF0E5; border: 1.5px solid #A8D5BB; border-radius: 12px;
  padding: 16px 18px;
}
.hasil-label { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #2E7D52; margin-bottom: 8px; }
.hasil-skor { font: 800 22px/1.2 Archivo; color: #1A1613; }

.podium-card    { display:flex; align-items:center; gap:14px; border-radius:12px; padding:14px 18px; border:1.5px solid; }
.podium-emas    { background:#FFF8E5; border-color:#F5D06B; }
.podium-perak   { background:#F4F4F6; border-color:#B8B8C8; }
.podium-perunggu{ background:#FDF0E8; border-color:#D4956A; }
.podium-medal   { font-size:28px; flex-shrink:0; }
.podium-label   { font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.08em; text-transform:uppercase; color:#7A7368; margin-bottom:4px; }
.podium-nama    { font:800 16px/1.2 Archivo; color:#1A1613; }
.pemenang-card {
  display: flex; align-items: center; gap: 14px;
  background: #FFF8E5; border: 1.5px solid #F5D06B; border-radius: 12px;
  padding: 14px 18px;
}
.pemenang-crown { font-size: 28px; }
.pemenang-label { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #C0871C; margin-bottom: 4px; }
.pemenang-nama { font: 800 16px/1.2 Archivo; color: #1A1613; }
.catatan-card { background: #FAF8F3; border-radius: 10px; padding: 14px 16px; }
.lihat-hasil-btn {
  align-self: flex-start; margin-top: 2px;
  padding: 10px 20px; border: 1.5px solid #CE1126; border-radius: 8px;
  background: transparent; color: #CE1126;
  font: 700 13px/1 'Plus Jakarta Sans'; cursor: pointer; transition: all .15s;
}
.lihat-hasil-btn:hover { background: #FBEAEC; }
.set-detail-card { background: #FBF1DD; border: 1.5px solid #EBD79A; border-radius: 12px; padding: 14px 18px; }
.set-detail-card .hasil-label { color: #7A5C00; }
.set-detail-list { display: flex; flex-direction: column; gap: 6px; }
.set-detail-row { display: flex; align-items: center; justify-content: space-between; }
.set-detail-num { font: 700 12px/1 'Plus Jakarta Sans'; color: #7A5C00; }
.set-detail-score { font: 800 14px/1 Archivo; color: #1A1613; }

/* Empty */
.empty-tab { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 20px; text-align: center; }
.empty-icon { font-size: 36px; }
.empty-msg { font: 700 15px/1.4 Archivo; color: #3A332B; }
.empty-sub { font: 500 13px/1.5 'Plus Jakarta Sans'; color: #9A9389; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-slide-enter-active { transition: transform .28s cubic-bezier(.22,.68,0,1.2); }
.modal-slide-leave-active { transition: transform .2s ease-in; }
.modal-slide-enter-from, .modal-slide-leave-to { transform: translateY(100%); }
@media (min-width: 600px) {
  .modal-slide-enter-active { transition: transform .25s ease, opacity .2s ease; }
  .modal-slide-leave-active { transition: transform .18s ease-in, opacity .15s ease; }
  .modal-slide-enter-from, .modal-slide-leave-to { transform: translateY(16px) scale(.97); opacity: 0; }
}
</style>
