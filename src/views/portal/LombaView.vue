<template>
  <div>
    <div class="eyebrow">Daftar Lomba &amp; Info Kegiatan</div>
    <h2 class="page-title">Cabang yang Dilombakan</h2>

    <!-- Filter chip per tipe -->
    <div ref="chipRowRef" class="tcr-scroll chip-row">
      <button
        v-for="(tipe, i) in tipeChips"
        :key="tipe.id"
        :ref="el => { if(el) chipBtnRefs[i] = el }"
        class="chip"
        :class="{ active: activeTipe === tipe.id }"
        :style="activeTipe === tipe.id
          ? { background: tipe.warna, color: '#fff', borderColor: tipe.warna }
          : {}"
        @click="selectTipe(tipe.id, i)"
      >{{ tipe.nama }}</button>
    </div>

    <!-- Skeleton loading -->
    <div v-if="isLoading" class="lomba-grid">
      <div v-for="n in 6" :key="n" class="skeleton-card"></div>
    </div>

    <!-- Grid kartu lomba -->
    <div v-else class="lomba-grid">
      <div v-for="kat in filtered" :key="kat.id" class="lomba-card">
        <div class="card-top">
          <span
            class="kat-badge"
            :style="{ background: bgFor(kat), color: colorFor(kat) }"
          >{{ namaFor(kat) }}</span>
          <span class="jenis-badge" :class="kat.jenis === 'Perorangan' ? 'jenis-p' : 'jenis-b'">
            {{ kat.jenis || 'Beregu' }}
          </span>
        </div>

        <div class="lomba-nama">{{ kat.nama }}</div>
        <div class="lomba-desc">{{ kat.deskripsi || 'Deskripsi lomba belum diisi.' }}</div>

        <div class="card-actions">
          <button class="daftar-btn" @click="goRegistrasi(kat)">Daftar</button>
          <button class="ketentuan-btn" @click="openModal(kat)">Lihat Ketentuan</button>
        </div>
      </div>
    </div>

    <div v-if="!isLoading && !filtered.length" class="empty-state">
      Belum ada cabang lomba untuk kategori ini.
    </div>

    <!-- Modal detail -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="selected" class="modal-backdrop" @click.self="closeModal">
          <div class="modal-card" role="dialog" aria-modal="true">

            <!-- Modal header -->
            <div class="modal-head" :style="{ borderTopColor: colorFor(selected) }">
              <div class="modal-head-meta">
                <span class="modal-tipe-badge" :style="{ background: bgFor(selected), color: colorFor(selected) }">
                  {{ namaFor(selected) }}
                </span>
                <span class="modal-jenis" :class="selected.jenis === 'Perorangan' ? 'jenis-p' : 'jenis-b'">
                  {{ selected.jenis || 'Beregu' }}
                </span>
              </div>
              <button class="modal-close" @click="closeModal" aria-label="Tutup">×</button>
            </div>
            <h3 class="modal-title">{{ selected.nama }}</h3>

            <div class="modal-body">
              <!-- Deskripsi -->
              <div v-if="selected.deskripsi" class="modal-section">
                <div class="section-label">📋 Deskripsi</div>
                <p class="modal-deskripsi">{{ selected.deskripsi }}</p>
              </div>

              <!-- Persyaratan & peraturan -->
              <div class="modal-section">
                <div class="section-label">📌 Persyaratan &amp; Peraturan</div>
                <ol v-if="peraturanList(selected).length" class="ketentuan-list">
                  <li v-for="(rule, i) in peraturanList(selected)" :key="i">{{ rule }}</li>
                </ol>
                <p v-else class="empty-rules">Ketentuan lomba belum diisi panitia.</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useKategoriStore } from '@/stores/useKategori'
import { useTipeStore }     from '@/stores/useTipe'

const kategoriStore = useKategoriStore()
const tipeStore     = useTipeStore()
const router        = useRouter()

const activeTipe  = ref('semua')
const selected    = ref(null)
const chipRowRef  = ref(null)
const chipBtnRefs = []

const isLoading = computed(() => kategoriStore.loading || tipeStore.loading)

// Tab "Semua" + tipe dari Firestore
const tipeChips = computed(() => [
  { id: 'semua', nama: 'Semua', warna: '#1A1613' },
  ...tipeStore.list,
])

const filtered = computed(() => {
  const list = [...kategoriStore.list].sort((a, b) => (a.urutan || 999) - (b.urutan || 999))
  if (activeTipe.value === 'semua') return list
  return list.filter(k => k.tipeId === activeTipe.value)
})

// Helpers warna dari tipeStore berdasarkan tipeId kategori
function colorFor(kat) { return tipeStore.warnaById(kat.tipeId) || '#7A7368' }
function bgFor(kat)    { return tipeStore.bgById(kat.tipeId)    || '#F0EBE2' }
function namaFor(kat)  { return tipeStore.namaById(kat.tipeId)  || kat.tipe || '' }

// Parse field peraturan (bisa string dengan \n atau array)
function peraturanList(kat) {
  const raw = kat.peraturan ?? kat.ketentuan ?? ''
  if (Array.isArray(raw)) return raw.map(v => String(v).trim()).filter(Boolean)
  return String(raw)
    .split('\n')
    .map(v => v.replace(/^\d+[.)]\s*/, '').trim())
    .filter(Boolean)
}

function scrollToCenter(row, btn) {
  if (!row || !btn) return
  row.scrollTo({ left: btn.offsetLeft - row.clientWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' })
}

async function selectTipe(id, i) {
  activeTipe.value = id
  await nextTick()
  scrollToCenter(chipRowRef.value, chipBtnRefs[i])
}

function openModal(kat)  { selected.value = kat }
function closeModal()    { selected.value = null }

function goRegistrasi(kat) {
  const cabang = kat?.nama || ''
  router.push({ name: 'registrasi', query: cabang ? { cabang } : {} })
}

onMounted(async () => {
  await Promise.all([kategoriStore.fetch(), tipeStore.fetch()])
  await nextTick()
  scrollToCenter(chipRowRef.value, chipBtnRefs[0])
})
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }

/* ── Chips ───────────────────────────────────── */
.chip-row  { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 20px; }

/* ── Skeleton ────────────────────────────────── */
.skeleton-card {
  height: 220px; border-radius: 8px;
  background: linear-gradient(90deg, #F0EBE2 25%, #E8E2DA 50%, #F0EBE2 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Grid ────────────────────────────────────── */
.lomba-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

/* ── Kartu ───────────────────────────────────── */
.lomba-card {
  background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; padding: 22px;
  display: flex; flex-direction: column; gap: 0;
}
.card-top   { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.kat-badge  { padding: 5px 11px; border-radius: 999px; font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .04em; text-transform: uppercase; }
.jenis-badge{ font: 700 10px/1 'Plus Jakarta Sans'; letter-spacing: .06em; text-transform: uppercase; padding: 4px 9px; border-radius: 6px; }
.jenis-b    { background: #E5EDF7; color: #2D5B8A; }
.jenis-p    { background: #FBF1DD; color: #C0871C; }
.lomba-nama { font: 800 19px/1.15 Archivo; color: #1A1613; }
.lomba-desc { font: 500 13px/1.5 'Plus Jakarta Sans'; color: #7A7368; margin-top: 8px; flex: 1; }
.card-actions { margin-top: 18px; display: flex; gap: 8px; }
.daftar-btn {
  flex: 1; padding: 9px 10px; border: 1.5px solid #CE1126; border-radius: 8px;
  background: #CE1126; color: #fff; font: 700 12px/1 'Plus Jakarta Sans';
  cursor: pointer; transition: all .15s;
}
.daftar-btn:hover { filter: brightness(.95); }
.ketentuan-btn {
  flex: 1; padding: 9px 10px; border: 1.5px solid #CE1126; border-radius: 8px;
  background: transparent; color: #CE1126; font: 700 12px/1 'Plus Jakarta Sans';
  cursor: pointer; transition: all .15s;
}
.ketentuan-btn:hover { background: #CE1126; color: #fff; }

/* ── Modal ───────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 80;
  background: rgba(26,22,19,.52);
  display: grid; place-items: center;
  padding: 20px;
}
.modal-card {
  width: min(640px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  background: #fff; border-radius: 14px;
  border: 1.5px solid #F0D3D7;
  border-top: 4px solid #CE1126;
  box-shadow: 0 18px 50px rgba(0,0,0,.18);
}
.modal-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 20px 22px 0;
  border-top: 4px solid transparent;
}
.modal-head-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.modal-tipe-badge{
  padding: 5px 11px; border-radius: 999px;
  font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .04em; text-transform: uppercase;
}
.modal-jenis { font: 700 10px/1 'Plus Jakarta Sans'; letter-spacing: .06em; text-transform: uppercase; padding: 4px 9px; border-radius: 6px; }
.modal-close {
  flex-shrink: 0; border: none; width: 34px; height: 34px; border-radius: 999px;
  cursor: pointer; font: 700 24px/1 Archivo; color: #5A534B; background: #F7F3EC;
}
.modal-title {
  margin: 10px 22px 0;
  font: 800 24px/1.15 Archivo; color: #1A1613;
}

.modal-body { padding: 18px 22px 24px; display: flex; flex-direction: column; gap: 20px; }

.modal-section { display: flex; flex-direction: column; gap: 10px; }
.section-label  { font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #9A9389; }

.modal-deskripsi {
  font: 500 14px/1.6 'Plus Jakarta Sans'; color: #3E382F;
  background: #FAF8F3; border-radius: 10px; padding: 14px 16px; margin: 0;
}

.ketentuan-list {
  margin: 0; padding-left: 20px;
  display: flex; flex-direction: column; gap: 10px;
  color: #3E382F; font: 500 14px/1.6 'Plus Jakarta Sans';
}
.ketentuan-list li::marker { font-weight: 700; color: #CE1126; }

.empty-rules { font: 500 13px/1.5 'Plus Jakarta Sans'; color: #C9C2B6; margin: 0; }

.empty-state {
  margin-top: 16px; padding: 32px; border-radius: 10px;
  border: 1px dashed #D8D2C8; text-align: center;
  color: #7A7368; font: 500 13px/1 'Plus Jakarta Sans';
}

/* ── Transitions ─────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; }

/* ── Responsive ──────────────────────────────── */
@media(max-width:1023px) { .lomba-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width:767px) {
  .lomba-grid  { grid-template-columns: 1fr; }
  .page-title  { font-size: 26px; }
  .lomba-card  { padding: 16px; }
  .modal-card  { border-radius: 12px; }
  .modal-title { font-size: 20px; }
  .modal-body  { padding: 14px 16px 20px; }
  .modal-head  { padding: 16px 16px 0; }
}
</style>
