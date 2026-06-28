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
          <button class="btn-export" @click="doExport">Export Excel</button>
          <button class="tcr-btn-red" style="background:#2E7D52;box-shadow:0 6px 16px rgba(46,125,82,.25);" @click="openForm()">+ Tambah Hasil</button>
        </div>
      </div>

      <form v-if="showForm" @submit.prevent="submit" class="inline-form">
        <div style="grid-column:1/-1;">
          <label class="form-label">Kategori Lomba <span class="req">*</span></label>
          <select v-model="form.cabang" @change="onCabangChange" class="tcr-input">
            <option value="">Pilih kategori...</option>
            <option v-for="k in kategoriStore.list" :key="k.id" :value="k.nama">{{ k.nama }} ({{ k.tipe }})</option>
          </select>
        </div>
        <div>
          <label class="form-label">Tanggal <span class="req">*</span></label>
          <input v-model="form.tgl" type="date" class="tcr-input" />
        </div>
        <div>
          <label class="form-label">Tim A <span class="req">*</span></label>
          <input v-model="form.timA" type="text" class="tcr-input" placeholder="Blok A" />
        </div>
        <div>
          <label class="form-label">Tim B <span class="req">*</span></label>
          <input v-model="form.timB" type="text" class="tcr-input" placeholder="Blok B" />
        </div>
        <div>
          <label class="form-label">Skor <span class="req">*</span></label>
          <input v-model="form.skor" type="text" class="tcr-input" placeholder="2 — 1" />
        </div>
        <div>
          <label class="form-label">Juara <span class="req">*</span></label>
          <input v-model="form.juara" type="text" class="tcr-input" placeholder="Blok A" />
        </div>
        <div style="grid-column:1/-1;display:flex;gap:12px;">
          <button type="submit" class="btn-save">Simpan Hasil</button>
          <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
        </div>
      </form>

      <div class="card-grid">
        <div v-for="h in paginated" :key="h.id" class="item-card">
          <div class="item-card-header">
            <div style="display:flex;align-items:center;gap:7px;">
              <span class="dot" :style="{ background: tipeColor(h.kat) }"></span>
              <span class="item-nama">{{ h.cabang }}</span>
            </div>
            <span class="item-tgl">📅 {{ h.tgl }}</span>
          </div>
          <div class="skor-display">{{ h.timA }} <span style="color:#7A7368;">{{ h.skor }}</span> {{ h.timB }}</div>
          <div class="juara-display">🏆 {{ h.juara }}</div>
          <div class="item-actions">
            <button @click="hapus(h)" class="btn-del">Hapus</button>
          </div>
        </div>
        <div v-if="!filtered.length" class="empty" style="grid-column:1/-1;">{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada hasil pertandingan' }}</div>
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

const filtered  = computed(() => {
  const q = search.value.toLowerCase()
  return hasilStore.list.filter(h => !q ||
    (h.cabang||'').toLowerCase().includes(q) ||
    (h.timA||'').toLowerCase().includes(q) ||
    (h.timB||'').toLowerCase().includes(q) ||
    (h.juara||'').toLowerCase().includes(q)
  )
})
const paginated = computed(() => filtered.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))
watch(search, () => { page.value = 1 })

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',      field: (_, i) => i + 1 },
    { label: 'Cabang',  field: 'cabang' },
    { label: 'Tanggal', field: 'tgl' },
    { label: 'Tim A',   field: 'timA' },
    { label: 'Tim B',   field: 'timB' },
    { label: 'Skor',    field: 'skor' },
    { label: 'Juara',   field: 'juara' },
  ], 'hasil-pertandingan')
}
const form          = reactive({ cabang:'', kat:'', tgl:'', timA:'', timB:'', skor:'', juara:'' })

const tipeColor = (t) => tipeStore.warna(t)

function onCabangChange() {
  const found = kategoriStore.list.find(k => k.nama === form.cabang)
  form.kat = found ? found.tipe : ''
}
function openForm() { showForm.value = true }
function resetForm() {
  showForm.value = false
  Object.assign(form, { cabang:'', kat:'', tgl:'', timA:'', timB:'', skor:'', juara:'' })
}
async function submit() {
  if (!form.cabang || !form.tgl || !form.timA || !form.timB || !form.skor || !form.juara) return
  await hasilStore.add({ ...form })
  resetForm()
}
function hapus(h) {
  if (confirm(`Hapus hasil "${h.cabang}"?`)) hasilStore.remove(h.id)
}
onMounted(() => { tipeStore.fetch(); kategoriStore.fetch(); hasilStore.fetch() })
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow{ font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#2E7D52; }
.section-title  { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }
.inline-form { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; align-items:end; }
.form-label  { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req { color:#CE1126; }
.btn-save   { flex:1; padding:13px; border:none; border-radius:12px; background:#2E7D52; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-cancel { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.card-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
.item-card  { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:14px; padding:16px; }
.item-card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:12px; }
.item-nama  { font:800 15px/1.2 Archivo; color:#1A1613; }
.item-tgl   { font:600 12px/1 'Plus Jakarta Sans'; color:#9A9389; flex-shrink:0; }
.dot        { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; margin-top:2px; }
.skor-display  { background:#fff; border-radius:10px; padding:10px; margin-bottom:10px; text-align:center; font:800 18px/1 Archivo; color:#CE1126; }
.juara-display { padding:8px 12px; background:#E7F2EB; border-radius:8px; text-align:center; font:700 12px/1.4 'Plus Jakarta Sans'; color:#2E7D52; margin-bottom:12px; }
.item-actions { display:flex; gap:8px; }
.btn-del { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.empty   { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
.header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.search-input   { width:220px; }
.btn-export     { padding:10px 18px; border:1.5px solid #2E7D52; border-radius:10px; background:#fff; color:#2E7D52; font:700 13px/1 'Plus Jakarta Sans'; cursor:pointer; white-space:nowrap; transition:background .15s; }
.btn-export:hover { background:#E7F2EB; }
</style>
