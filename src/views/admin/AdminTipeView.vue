<template>
  <Transition name="toast">
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
      {{ toast.msg }}
    </div>
  </Transition>

  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Master Data</div>
          <h2 class="section-title">Tipe Lomba</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari tipe..." />
          <button class="btn-export" @click="doExport"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>Export Excel</button>
          <button class="tcr-btn-red" @click="openForm()">+ Tambah Tipe</button>
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
        <div class="modal-card">
          <div class="modal-hd">
            <h3 class="modal-ttl">{{ form.editId ? 'Edit' : 'Tambah' }} Tipe</h3>
            <button type="button" class="modal-x" @click="resetForm">✕</button>
          </div>
          <form @submit.prevent="submit" class="modal-bd">
            <div>
              <label class="form-label">Nama Tipe <span class="req">*</span></label>
              <input v-model="form.nama" type="text" class="tcr-input" placeholder="cth: Olahraga" />
            </div>
            <div>
              <label class="form-label">Warna <span class="req">*</span></label>
              <div class="color-field">
                <input v-model="form.warna" type="color" class="color-picker" />
                <input v-model="form.warna" type="text" class="tcr-input" placeholder="#CE1126" style="font-family:monospace;" />
              </div>
              <div class="color-presets">
                <button v-for="c in PRESET_COLORS" :key="c.warna" type="button"
                  class="preset-dot" :style="{ background: c.warna }"
                  :title="c.label"
                  @click="pickPreset(c)">
                </button>
              </div>
            </div>
            <div>
              <label class="form-label">Urutan Tampil</label>
              <input v-model.number="form.urutan" type="number" min="1" class="tcr-input" />
            </div>
            <div>
              <label class="form-label">Preview</label>
              <div style="display:flex;align-items:center;gap:10px;">
                <span class="tipe-badge" :style="{ background: bgFromWarna(form.warna), color: form.warna }">
                  {{ form.nama || 'Nama Tipe' }}
                </span>
                <span class="dot-preview" :style="{ background: form.warna }"></span>
                <span style="font:500 13px/1 'Plus Jakarta Sans';color:#7A7368;">Tampil seperti ini di kategori &amp; jadwal</span>
              </div>
            </div>
            <div style="display:flex;gap:12px;">
              <button type="submit" class="btn-save">{{ form.editId ? 'Update' : 'Simpan' }} Tipe</button>
              <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
            </div>
          </form>
        </div>
      </div>

      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:46px;">#</th>
              <th>Nama Tipe</th>
              <th>Warna</th>
              <th>Badge Preview</th>
              <th style="width:90px;text-align:center;">Urutan</th>
              <th style="width:130px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(t, i) in paginated" :key="t.id">
              <tr class="data-row" :class="{ 'row-expanded': expandedId === t.id }" @click="toggleDetail(t.id)">
                <td class="td-num td-idx">{{ (page-1)*PER_PAGE + i + 1 }}</td>
                <td class="td-bold td-nama">{{ t.nama }}</td>
                <td class="td-warna">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span class="color-swatch" :style="{ background: t.warna }"></span>
                    <code class="color-code">{{ t.warna }}</code>
                  </div>
                </td>
                <td class="td-preview">
                  <span class="tipe-badge" :style="{ background: store.bg(t.nama), color: t.warna }">{{ t.nama }}</span>
                </td>
                <td class="td-num td-urutan">{{ t.urutan }}</td>
                <td class="td-aksi">
                  <div class="action-group" @click.stop>
                    <button @click="openForm(t)" class="btn-edit">Edit</button>
                    <button @click="hapus(t)" class="btn-del">Hapus</button>
                    <span class="chevron" :class="{ open: expandedId === t.id }">›</span>
                  </div>
                </td>
              </tr>
              <tr v-if="expandedId === t.id" class="detail-row">
                <td colspan="6">
                  <div class="detail-panel">
                    <div class="detail-block">
                      <div class="detail-label">Warna</div>
                      <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
                        <span class="color-swatch" :style="{ background: t.warna }"></span>
                        <code class="color-code">{{ t.warna }}</code>
                      </div>
                    </div>
                    <div class="detail-block">
                      <div class="detail-label">Badge Preview</div>
                      <span class="tipe-badge" :style="{ background: store.bg(t.nama), color: t.warna }" style="margin-top:6px;display:inline-block;">{{ t.nama }}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!filtered.length">
              <td colspan="6" class="empty">{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada tipe lomba' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar v-model="page" :total="filtered.length" :per-page="PER_PAGE" />

      <p class="info-note">
        💡 Tipe lomba digunakan untuk mengelompokkan kategori lomba dan menentukan warna tampilan di portal.
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useTipeStore }     from '@/stores/useTipe'
import { useKategoriStore } from '@/stores/useKategori'
import PaginationBar from '@/components/PaginationBar.vue'
import { exportToExcel } from '@/utils/exportExcel'

const store         = useTipeStore()
const kategoriStore = useKategoriStore()
const showForm   = ref(false)
const expandedId = ref(null)
const search     = ref('')
const page     = ref(1)
const PER_PAGE = 10
const toast    = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg = msg; toast.type = type; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

const filtered  = computed(() => {
  const q = search.value.toLowerCase()
  return store.list.filter(t => !q || t.nama.toLowerCase().includes(q))
})
const paginated = computed(() => filtered.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))
watch(search, () => { page.value = 1 })

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',     field: (_, i) => i + 1 },
    { label: 'Nama Tipe', field: 'nama' },
    { label: 'Warna',  field: 'warna' },
    { label: 'Urutan', field: 'urutan' },
  ], 'tipe-lomba')
}
const form     = reactive({ nama:'', warna:'#CE1126', urutan:1, editId:null })

const PRESET_COLORS = [
  { label:'Merah',   warna:'#CE1126' },
  { label:'Emas',    warna:'#C0871C' },
  { label:'Biru',    warna:'#2D5B8A' },
  { label:'Hijau',   warna:'#2E7D52' },
  { label:'Ungu',    warna:'#6B3FA0' },
  { label:'Oranye',  warna:'#D4620A' },
  { label:'Abu',     warna:'#5A534B' },
  { label:'Hitam',   warna:'#1A1613' },
]

// Buat warna background dari warna teks (lighten ~90%)
function bgFromWarna(hex) {
  try {
    const r = parseInt(hex.slice(1,3),16)
    const g = parseInt(hex.slice(3,5),16)
    const b = parseInt(hex.slice(5,7),16)
    return `rgba(${r},${g},${b},0.12)`
  } catch { return '#F0EBE2' }
}

function pickPreset(c) {
  form.warna = c.warna
}

function openForm(t = null) {
  t ? Object.assign(form, { nama:t.nama, warna:t.warna, urutan:t.urutan||1, editId:t.id })
    : Object.assign(form, { nama:'', warna:'#CE1126', urutan:store.list.length+1, editId:null })
  showForm.value = true
}
function resetForm() {
  showForm.value = false
  Object.assign(form, { nama:'', warna:'#CE1126', urutan:1, editId:null })
}

function toggleDetail(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function submit() {
  if (!form.nama.trim()) { showToast('Nama tipe wajib diisi.', 'error'); return }
  if (!form.warna)       { showToast('Warna wajib dipilih.', 'error'); return }
  const isEdit = !!form.editId
  const bg      = bgFromWarna(form.warna)
  const payload = { nama: form.nama.trim(), warna: form.warna, bg, urutan: form.urutan || 1 }
  try {
    isEdit ? await store.update(form.editId, payload) : await store.add(payload)
    showToast(isEdit ? `Tipe "${payload.nama}" berhasil diperbarui.` : `Tipe "${payload.nama}" berhasil ditambahkan.`)
    resetForm()
  } catch {
    showToast('Gagal menyimpan. Coba lagi.', 'error')
  }
}

async function hapus(t) {
  await kategoriStore.fetch()
  const terpakai = kategoriStore.list.filter(k => k.tipeId === t.id || k.tipe === t.nama)
  if (terpakai.length) {
    const namaKat = terpakai.map(k => k.nama).join(', ')
    showToast(`Tidak bisa dihapus — digunakan oleh ${terpakai.length} kategori: ${namaKat}.`, 'error')
    return
  }
  if (!confirm(`Hapus tipe "${t.nama}"?`)) return
  try {
    await store.remove(t.id)
    showToast(`Tipe "${t.nama}" berhasil dihapus.`)
  } catch {
    showToast('Gagal menghapus. Coba lagi.', 'error')
  }
}

onMounted(() => { store.fetch(); kategoriStore.fetch() })
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow{ font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#CE1126; }
.section-title  { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }

/* modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
.modal-card    { background:#fff; border-radius:20px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.25); }
.modal-hd      { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-ttl     { font:800 18px/1.2 Archivo; color:#1A1613; margin:0; }
.modal-x       { width:32px; height:32px; border-radius:50%; border:none; background:#F0EBE2; color:#5A534B; font:700 16px/1 Archivo; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.modal-x:hover { background:#E2DCD2; }
.modal-bd      { padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px; }

.inline-form { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; align-items:start; }
.form-label  { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req         { color:#CE1126; }

.color-field   { display:flex; align-items:center; gap:8px; }
.color-picker  { width:44px; height:44px; padding:2px; border:1.5px solid #E2DCD2; border-radius:8px; cursor:pointer; background:#fff; flex-shrink:0; }
.color-presets { display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; }
.preset-dot    { width:24px; height:24px; border-radius:50%; border:2px solid transparent; cursor:pointer; transition:transform .15s, border-color .15s; }
.preset-dot:hover { transform:scale(1.2); border-color:#fff; box-shadow:0 0 0 2px #E2DCD2; }
.dot-preview   { width:12px; height:12px; border-radius:50%; display:inline-block; }
.tipe-badge    { padding:5px 14px; border-radius:999px; font:700 12px/1 'Plus Jakarta Sans'; }

.btn-save   { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-cancel { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

.data-table-wrap { border:1px solid #ECE7DE; border-radius:14px; overflow:hidden; }
.data-table  { width:100%; border-collapse:collapse; font:500 13px/1.5 'Plus Jakarta Sans'; }
.data-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.data-table th { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; }
.data-table td { padding:14px 16px; border-bottom:1px solid #F0EBE2; vertical-align:middle; }
.data-table tbody tr:last-child td { border-bottom:none; }
.data-row { cursor:pointer; }
.data-row:hover:not(.detail-row) td { background:#FAF8F3; }
.row-expanded td { background:#F0EDE6 !important; }
.td-num     { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold    { font:700 14px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.color-swatch { width:20px; height:20px; border-radius:6px; display:inline-block; flex-shrink:0; }
.color-code { font:600 12px/1 monospace; color:#5A534B; background:#F0EBE2; padding:3px 7px; border-radius:6px; }
.action-group { display:flex; gap:6px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.empty    { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
.detail-row td { padding:0 !important; border-bottom:2px solid #E2DCD2; }
.detail-panel  { padding:20px 24px; background:#F7F4EE; display:flex; flex-direction:column; gap:14px; }
.detail-block  { }
.detail-label  { font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.1em; text-transform:uppercase; color:#9A9389; margin-bottom:8px; display:block; }
.detail-empty  { font:500 13px/1 'Plus Jakarta Sans'; color:#9A9389; font-style:italic; }
.chevron { display:inline-block; font-size:18px; color:#C4BDB2; line-height:1; transition:transform .2s; user-select:none; }
.chevron.open { transform:rotate(90deg); }
.detail-actions { display:flex; gap:8px; padding-top:14px; border-top:1px solid #E2DCD2; margin-top:2px; }
.detail-actions .btn-edit,
.detail-actions .btn-del { flex:1; padding:10px; text-align:center; font-size:13px; border-radius:10px; }
.info-note { font:500 13px/1.5 'Plus Jakarta Sans'; color:#9A9389; margin:16px 0 0; }
.toast { position:fixed; bottom:28px; right:28px; z-index:9999; display:flex; align-items:center; gap:10px; padding:14px 20px; border-radius:12px; min-width:260px; max-width:380px; font:600 14px/1.4 'Plus Jakarta Sans'; box-shadow:0 8px 24px rgba(0,0,0,.18); pointer-events:none; }
.toast.success { background:#1A1613; color:#fff; }
.toast.error   { background:#CE1126; color:#fff; }
.toast-icon    { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font:700 13px/1 Archivo; flex-shrink:0; }
.toast.success .toast-icon { background:rgba(255,255,255,.15); }
.toast.error   .toast-icon { background:rgba(0,0,0,.15); }
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(12px); }

@media(max-width:767px) {
  .adm-main { padding: 16px 12px 50px; }
  .adm-section { padding: 14px; border-radius: 14px; }
  .section-header { gap: 10px; margin-bottom: 12px; }
  .section-title { font-size: 18px; margin: 4px 0 0; }
  .inline-form { padding: 12px; gap: 10px; }
  .form-label { font-size: 12px; margin-bottom: 6px; }
  .btn-save, .btn-cancel { padding: 9px 12px; font-size: 12px; border-radius: 8px; }
  .btn-edit, .btn-del { padding: 5px 10px; font-size: 11px; border-radius: 6px; }
  /* ── Mobile card layout ── */
  .data-table-wrap { border: none; background: transparent; overflow: visible; border-radius: 0; }
  .data-table { display: block; }
  .data-table thead { display: none; }
  .data-table tbody { display: flex; flex-direction: column; gap: 8px; }
  .data-row {
    display: grid !important;
    grid-template-columns: 1fr auto;
    grid-template-areas: "nama preview" "warna aksi";
    column-gap: 10px; row-gap: 6px;
    background: #fff; border: 1px solid #ECE7DE;
    border-radius: 14px; padding: 12px; cursor: pointer;
  }
  .row-expanded { border-radius: 14px 14px 0 0 !important; border-bottom-color: transparent !important; }
  .data-row td { padding: 0 !important; border: none !important; background: transparent !important; vertical-align: middle !important; }
  .td-idx, .td-urutan { display: none !important; }
  .td-nama { grid-area: nama; align-self: center; }
  .td-preview { grid-area: preview; align-self: center; display: flex; justify-content: flex-end; }
  .td-warna { grid-area: warna; align-self: center; }
  .td-aksi { grid-area: aksi; align-self: center; display: flex; justify-content: flex-end; align-items: center; }
  .detail-row { display: block !important; }
  .detail-row td { display: block !important; padding: 0 !important; border: none !important; }
  .data-table tbody .detail-row {
    border: 1px solid #ECE7DE !important; border-top: none !important;
    border-radius: 0 0 14px 14px; background: #FAF8F3; margin-top: -8px;
  }
  .empty { display: block !important; text-align: center !important; padding: 18px 12px !important; font-size: 12px !important; }
}

@media(min-width:768px) {
  .adm-main { padding: 28px 20px 70px; }
  .adm-section { padding: 24px; border-radius: 20px; }
  .section-title { font-size: 26px; }
  .section-header { gap: 16px; margin-bottom: 20px; }
  .btn-save, .btn-cancel { padding: 12px; font-size: 13px; }
}
</style>
