<template>
  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Hasil</div>
          <h2 class="section-title">Hasil Pertandingan</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari hasil..." />
          <button class="btn-export" @click="doExport"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>Export Excel</button>
          <button class="tcr-btn-red" style="background:#2E7D52;box-shadow:0 6px 16px rgba(46,125,82,.25);" @click="openForm()">+ Tambah Hasil</button>
        </div>
      </div>

      <!-- Modal Form Hasil -->
      <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
        <div class="modal-card">
          <div class="modal-hd">
            <h3 class="modal-ttl">Tambah Hasil Pertandingan</h3>
            <button type="button" class="modal-x" @click="resetForm">✕</button>
          </div>
          <form @submit.prevent="submit" class="modal-bd">
            <!-- Cabang -->
            <div>
              <label class="form-label">Kategori Lomba <span class="req">*</span></label>
              <select v-model="form.cabang" @change="onCabangChange" class="tcr-input">
                <option value="">Pilih kategori...</option>
                <option v-for="k in kategoriStore.list" :key="k.id" :value="k.nama">
                  {{ k.nama }}
                  <template v-if="k.jenis"> — {{ k.jenis }}</template>
                </option>
              </select>
            </div>

            <!-- Jenis indicator -->
            <div v-if="form.cabang">
              <div class="jenis-indicator" :class="isPerorangan ? 'ind-perorangan' : 'ind-beregu'">
                {{ isPerorangan ? '👤 Kompetisi Perorangan — isi juara 1, 2, 3' : '🤝 Kompetisi Beregu — isi Tim A vs Tim B' }}
              </div>
            </div>

            <!-- Tanggal -->
            <div>
              <label class="form-label">Tanggal <span class="req">*</span></label>
              <input v-model="form.tgl" type="date" class="tcr-input" />
            </div>

            <!-- ─── BEREGU fields ─── -->
            <template v-if="!isPerorangan">
              <div class="modal-form-grid">
                <div>
                  <label class="form-label">Tim A <span class="req">*</span></label>
                  <input v-model="form.timA" type="text" class="tcr-input" placeholder="Blok A / nama regu" />
                </div>
                <div>
                  <label class="form-label">Tim B <span class="req">*</span></label>
                  <input v-model="form.timB" type="text" class="tcr-input" placeholder="Blok B / nama regu" />
                </div>
                <div>
                  <label class="form-label">Skor <span class="req">*</span></label>
                  <input v-model="form.skor" type="text" class="tcr-input" placeholder="2 — 1" />
                </div>
                <div>
                  <label class="form-label">Juara <span class="req">*</span></label>
                  <input v-model="form.juara" type="text" class="tcr-input" placeholder="Nama pemenang / blok" />
                </div>
              </div>
            </template>

            <!-- ─── PERORANGAN fields ─── -->
            <template v-else>
              <div>
                <label class="form-label">🥇 Juara 1 <span class="req">*</span></label>
                <input v-model="form.juara1" type="text" class="tcr-input" placeholder="Nama peserta / blok" />
              </div>
              <div>
                <label class="form-label">🥈 Juara 2</label>
                <input v-model="form.juara2" type="text" class="tcr-input" placeholder="Nama peserta / blok" />
              </div>
              <div>
                <label class="form-label">🥉 Juara 3</label>
                <input v-model="form.juara3" type="text" class="tcr-input" placeholder="Nama peserta / blok" />
              </div>
            </template>

            <div style="display:flex;gap:12px;">
              <button type="submit" class="btn-save">Simpan Hasil</button>
              <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card-grid">
        <div v-for="h in paginated" :key="h.id" class="item-card">
          <div class="item-card-header">
            <div style="display:flex;align-items:center;gap:7px;min-width:0;">
              <span class="dot" :style="{ background: tipeColor(h.kat) }"></span>
              <span class="item-nama">{{ h.cabang }}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
              <span v-if="isPeorangan(h)" class="jenis-badge badge-perorangan">Perorangan</span>
              <span v-else class="jenis-badge badge-beregu">Beregu</span>
              <span class="item-tgl">📅 {{ h.tgl }}</span>
            </div>
          </div>

          <!-- Beregu: skor VS -->
          <template v-if="!isPeorangan(h)">
            <div class="skor-display">
              <span class="skor-tim">{{ h.timA }}</span>
              <span class="skor-val">{{ h.skor }}</span>
              <span class="skor-tim">{{ h.timB }}</span>
            </div>
            <div class="juara-display">🏆 {{ h.juara }}</div>
          </template>

          <!-- Perorangan: podium -->
          <template v-else>
            <div class="podium-display">
              <div v-if="h.juara1" class="podium-row podium-gold">
                <span class="podium-icon">🥇</span>
                <span class="podium-nama">{{ h.juara1 }}</span>
              </div>
              <div v-if="h.juara2" class="podium-row">
                <span class="podium-icon">🥈</span>
                <span class="podium-nama">{{ h.juara2 }}</span>
              </div>
              <div v-if="h.juara3" class="podium-row">
                <span class="podium-icon">🥉</span>
                <span class="podium-nama">{{ h.juara3 }}</span>
              </div>
            </div>
          </template>

          <div class="item-actions">
            <button @click="hapus(h)" class="btn-del">Hapus</button>
          </div>
        </div>
        <div v-if="!filtered.length" class="empty" style="grid-column:1/-1;">
          {{ search ? 'Tidak ada hasil pencarian' : 'Belum ada hasil pertandingan' }}
        </div>
      </div>
      <PaginationBar v-model="page" :total="filtered.length" :per-page="PER_PAGE" />
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useKategoriStore } from '@/stores/useKategori'
import { useHasilStore }    from '@/stores/useHasil'
import { useTipeStore }     from '@/stores/useTipe'
import PaginationBar from '@/components/PaginationBar.vue'
import { exportToExcel } from '@/utils/exportExcel'

const kategoriStore = useKategoriStore()
const hasilStore    = useHasilStore()
const tipeStore     = useTipeStore()
const showForm      = ref(false)
const search        = ref('')
const page          = ref(1)
const PER_PAGE      = 9

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return hasilStore.list.filter(h => !q ||
    (h.cabang  || '').toLowerCase().includes(q) ||
    (h.timA    || '').toLowerCase().includes(q) ||
    (h.timB    || '').toLowerCase().includes(q) ||
    (h.juara   || '').toLowerCase().includes(q) ||
    (h.juara1  || '').toLowerCase().includes(q) ||
    (h.juara2  || '').toLowerCase().includes(q) ||
    (h.juara3  || '').toLowerCase().includes(q)
  )
})
const paginated = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
watch(search, () => { page.value = 1 })

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',      field: (_, i) => i + 1 },
    { label: 'Cabang',  field: 'cabang' },
    { label: 'Jenis',   field: 'jenis' },
    { label: 'Tanggal', field: 'tgl' },
    { label: 'Tim A',   field: 'timA' },
    { label: 'Tim B',   field: 'timB' },
    { label: 'Skor',    field: 'skor' },
    { label: 'Juara',   field: 'juara' },
    { label: 'Juara 1', field: 'juara1' },
    { label: 'Juara 2', field: 'juara2' },
    { label: 'Juara 3', field: 'juara3' },
  ], 'hasil-pertandingan')
}

const form = reactive({
  cabang: '', kat: '', jenis: '', tgl: '',
  timA: '', timB: '', skor: '', juara: '',
  juara1: '', juara2: '', juara3: '',
})

const tipeColor = (t) => tipeStore.warna(t)

// True jika kategori yang dipilih adalah Perorangan
const isPerorangan = computed(() => {
  const found = kategoriStore.list.find(k => k.nama === form.cabang)
  return found?.jenis === 'Perorangan'
})

// True untuk cek display di kartu (data lama mungkin tidak punya jenis)
function isPeorangan(h) {
  return !!(h.juara1 || h.juara2 || h.juara3) || h.jenis === 'Perorangan'
}

function onCabangChange() {
  const found = kategoriStore.list.find(k => k.nama === form.cabang)
  if (found) {
    form.kat   = found.tipe || tipeStore.namaById(found.tipeId) || ''
    form.jenis = found.jenis || 'Beregu'
  } else {
    form.kat   = ''
    form.jenis = ''
  }
  // Reset semua field hasil saat ganti cabang
  Object.assign(form, { timA: '', timB: '', skor: '', juara: '', juara1: '', juara2: '', juara3: '' })
}

function openForm() { showForm.value = true }

function resetForm() {
  showForm.value = false
  Object.assign(form, {
    cabang: '', kat: '', jenis: '', tgl: '',
    timA: '', timB: '', skor: '', juara: '',
    juara1: '', juara2: '', juara3: '',
  })
}

async function submit() {
  if (!form.cabang || !form.tgl) return
  if (isPerorangan.value) {
    if (!form.juara1) return
  } else {
    if (!form.timA || !form.timB || !form.skor || !form.juara) return
  }
  await hasilStore.add({ ...form })
  resetForm()
}

function hapus(h) {
  if (confirm(`Hapus hasil "${h.cabang}"?`)) hasilStore.remove(h.id)
}

onMounted(() => {
  tipeStore.fetch()
  kategoriStore.fetch()
  hasilStore.fetch()
})
</script>

<style scoped>
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
.modal-card    { background:#fff; border-radius:20px; width:100%; max-width:600px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.25); }
.modal-hd      { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-ttl     { font:800 18px/1.2 Archivo; color:#1A1613; margin:0; }
.modal-x       { width:32px; height:32px; border-radius:50%; border:none; background:#F0EBE2; color:#5A534B; font:700 16px/1 Archivo; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.modal-x:hover { background:#E2DCD2; }
.modal-bd      { padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px; }
.modal-form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; }
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow{ font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#2E7D52; }
.section-title  { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }
.inline-form { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; align-items:end; }
.form-label  { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req { color:#CE1126; }

/* Jenis indicator strip */
.jenis-indicator {
  padding: 10px 14px; border-radius: 10px;
  font: 600 13px/1 'Plus Jakarta Sans';
}
.ind-beregu    { background: #E5EDF7; color: #2D5B8A; }
.ind-perorangan{ background: #FBF1DD; color: #C0871C; }

.btn-save   { flex:1; padding:13px; border:none; border-radius:12px; background:#2E7D52; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-cancel { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

.card-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
.item-card  { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:10px; }
.item-card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
.item-nama  { font:800 15px/1.2 Archivo; color:#1A1613; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.item-tgl   { font:600 12px/1 'Plus Jakarta Sans'; color:#9A9389; flex-shrink:0; }
.dot        { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; margin-top:2px; }

/* Jenis badges */
.jenis-badge     { font:700 10px/1 'Plus Jakarta Sans'; letter-spacing:.05em; text-transform:uppercase; padding:3px 8px; border-radius:6px; flex-shrink:0; }
.badge-beregu    { background:#E5EDF7; color:#2D5B8A; }
.badge-perorangan{ background:#FBF1DD; color:#C0871C; }

/* Beregu display */
.skor-display { background:#fff; border-radius:10px; padding:10px 12px; display:flex; align-items:center; justify-content:center; gap:8px; }
.skor-tim { flex:1; font:700 13px/1.3 'Plus Jakarta Sans'; color:#5A534B; text-align:center; word-break:break-word; }
.skor-val { flex-shrink:0; font:900 20px/1 Archivo; color:#CE1126; background:#FBEAEC; border-radius:8px; padding:5px 10px; white-space:nowrap; }
.juara-display { padding:8px 12px; background:#E7F2EB; border-radius:8px; text-align:center; font:700 12px/1.4 'Plus Jakarta Sans'; color:#2E7D52; }

/* Perorangan podium display */
.podium-display { background:#fff; border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:8px; }
.podium-row     { display:flex; align-items:center; gap:9px; }
.podium-gold .podium-nama { font-weight:800; }
.podium-icon    { font-size:18px; line-height:1; flex-shrink:0; }
.podium-nama    { font:600 14px/1.3 'Plus Jakarta Sans'; color:#1A1613; }

.item-actions { display:flex; gap:8px; margin-top:auto; }
.btn-del { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.empty   { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
@media (max-width: 767px) {
  .adm-main { padding: 16px 12px 50px; }
  .adm-section { padding: 14px; border-radius: 14px; }
  .section-header { gap: 10px; margin-bottom: 12px; }
  .section-title { font-size: 18px; margin: 4px 0 0; }
  .section-eyebrow { font-size: 11px; letter-spacing: .08em; }
  .inline-form { padding: 12px; gap: 10px; grid-template-columns: 1fr; }
  .form-label { font-size: 12px; margin-bottom: 6px; }
  .btn-save, .btn-cancel { padding: 9px 12px; font-size: 12px; border-radius: 8px; }
  .btn-del { padding: 5px 10px; font-size: 11px; border-radius: 6px; }
  .empty { padding: 18px 12px; font-size: 12px; }
  .item-card { padding: 12px; }
  .item-nama { font-size: 13px; }
  .item-tgl { font-size: 11px; }
  .card-grid { gap: 10px; }
  .item-actions { gap: 6px; }
  .podium-nama { font-size: 12px; }
  .skor-tim { font-size: 12px; }
  .skor-val { font-size: 16px; padding: 4px 8px; }
  .juara-display { font-size: 11px; padding: 6px 10px; }
}

@media (min-width: 768px) {
  .adm-main { padding: 28px 20px 70px; }
  .adm-section { padding: 24px; border-radius: 20px; }
  .section-title { font-size: 26px; }
  .section-header { gap: 16px; margin-bottom: 20px; }
  .btn-save, .btn-cancel { padding: 12px; font-size: 13px; }
}
</style>
