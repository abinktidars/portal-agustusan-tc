<template>
  <!-- Toast -->
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
          <h2 class="section-title">Koridor</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari koridor..." />
          <button class="btn-export" @click="doExport"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>Export Excel</button>
          <button class="tcr-btn-red" @click="openForm()">+ Tambah Koridor</button>
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
        <div class="modal-card">
          <div class="modal-hd">
            <h3 class="modal-ttl">{{ form.editId ? 'Edit' : 'Tambah' }} Koridor</h3>
            <button type="button" class="modal-x" @click="resetForm">✕</button>
          </div>
          <form @submit.prevent="submit" class="modal-bd">
            <div class="form-row-4">
              <div>
                <label class="form-label">Nama Koridor <span class="req">*</span></label>
                <input v-model="form.nama" type="text" class="tcr-input" placeholder="cth: Koridor A" />
              </div>
              <div>
                <label class="form-label">Nomor Koridor <span class="req">*</span></label>
                <input v-model="form.nomor" type="text" class="tcr-input" placeholder="cth: 01" />
              </div>
              <div>
                <label class="form-label">Ketua Koridor</label>
                <input v-model="form.ketua" type="text" class="tcr-input" placeholder="cth: Bapak Budi" />
              </div>
              <div>
                <label class="form-label">Urutan Tampil</label>
                <input v-model.number="form.urutan" type="number" min="1" class="tcr-input" />
              </div>
            </div>

            <div class="form-row-full">
              <label class="form-label">Warna Koridor</label>
              <div class="color-row">
                <input v-model="form.warna" type="color" class="color-picker" />
                <input v-model="form.warna" type="text" class="tcr-input" placeholder="#CE1126" style="flex:1" />
              </div>
              <div class="preset-colors">
                <button v-for="c in PRESET_COLORS" :key="c" type="button"
                  class="preset-dot" :style="{ background: c }"
                  :class="{ active: form.warna === c }"
                  @click="form.warna = c" />
              </div>
            </div>

            <div class="form-row-full">
              <label class="form-label">Keterangan</label>
              <textarea v-model="form.keterangan" class="tcr-input tcr-textarea" rows="3"
                placeholder="Catatan tambahan tentang koridor ini..."></textarea>
            </div>

            <div class="form-row-full form-actions">
              <button type="submit" class="btn-save">{{ form.editId ? 'Update Koridor' : 'Simpan Koridor' }}</button>
              <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
            </div>
          </form>
        </div>
      </div>

      <!-- TABLE -->
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:40px;">#</th>
              <th>Nama Koridor</th>
              <th style="width:100px;">Nomor</th>
              <th>Ketua</th>
              <th style="width:130px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(k, i) in paginated" :key="k.id">
              <tr class="data-row" :class="{ 'row-expanded': expandedId === k.id }" @click="toggleDetail(k.id)">
                <td class="td-num td-idx">{{ (page - 1) * PER_PAGE + i + 1 }}</td>
                <td class="td-nama">
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span class="dot" :style="{ background: k.warna || '#9A9389' }"></span>
                    <span class="td-bold">{{ k.nama }}</span>
                  </div>
                </td>
                <td class="td-nomor">
                  <span class="nomor-badge" :style="badgeStyle(k.warna)">{{ k.nomor || '—' }}</span>
                </td>
                <td class="td-ketua">{{ k.ketua || '—' }}</td>
                <td class="td-aksi">
                  <div class="action-group" @click.stop>
                    <button @click="openForm(k)" class="btn-edit">Edit</button>
                    <button @click="hapus(k)" class="btn-del">Hapus</button>
                    <span class="chevron" :class="{ open: expandedId === k.id }">›</span>
                  </div>
                </td>
              </tr>
              <!-- Detail row -->
              <tr v-if="expandedId === k.id" class="detail-row">
                <td colspan="5">
                  <div class="detail-panel">
                    <div v-if="k.alamat" class="detail-block">
                      <div class="detail-label">Alamat</div>
                      <p class="detail-text">{{ k.alamat }}</p>
                    </div>
                    <div v-if="k.keterangan" class="detail-block">
                      <div class="detail-label">Keterangan</div>
                      <p class="detail-text">{{ k.keterangan }}</p>
                    </div>
                    <div v-if="!k.alamat && !k.keterangan" class="detail-empty">
                      Belum ada detail. Klik Edit untuk menambahkan.
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!filtered.length">
              <td colspan="7" class="empty">{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada koridor. Tambahkan koridor pertama.' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar v-model="page" :total="filtered.length" :per-page="PER_PAGE" />
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useKoridorStore } from '@/stores/useKoridor'
import PaginationBar from '@/components/PaginationBar.vue'
import { exportToExcel } from '@/utils/exportExcel'

const store    = useKoridorStore()
const showForm = ref(false)
const expandedId = ref(null)
const search   = ref('')
const page     = ref(1)
const PER_PAGE = 10

const PRESET_COLORS = ['#CE1126', '#003580', '#2E7D52', '#D97706', '#7C3AED', '#0E7490', '#BE185D', '#1A1613']

const filtered  = computed(() => {
  const q = search.value.toLowerCase()
  return store.list.filter(k => !q ||
    k.nama.toLowerCase().includes(q) ||
    (k.nomor || '').toLowerCase().includes(q) ||
    (k.ketua || '').toLowerCase().includes(q) ||
    (k.rtRw || '').toLowerCase().includes(q)
  )
})
const paginated = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
watch(search, () => { page.value = 1 })

function badgeStyle(warna) {
  if (!warna) return {}
  const hex = warna.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return { background: `rgba(${r},${g},${b},.12)`, color: warna }
}

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',           field: (_, i) => i + 1 },
    { label: 'Nama Koridor', field: 'nama' },
    { label: 'Nomor',        field: 'nomor' },
    { label: 'Ketua',        field: 'ketua' },
    { label: 'Keterangan',   field: 'keterangan' },
  ], 'koridor')
}

const form  = reactive({ nama: '', nomor: '', ketua: '', urutan: 1, warna: '#CE1126', keterangan: '', editId: null })
const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg = msg; toast.type = type; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

function toggleDetail(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function openForm(k = null) {
  if (k) {
    Object.assign(form, { nama: k.nama, nomor: k.nomor || '', ketua: k.ketua || '', urutan: k.urutan || 1, warna: k.warna || '#CE1126', keterangan: k.keterangan || '', editId: k.id })
  } else {
    Object.assign(form, { nama: '', nomor: '', ketua: '', urutan: store.list.length + 1, warna: '#CE1126', keterangan: '', editId: null })
  }
  showForm.value = true
  expandedId.value = null
}

function resetForm() {
  showForm.value = false
  Object.assign(form, { nama: '', nomor: '', ketua: '', urutan: 1, warna: '#CE1126', keterangan: '', editId: null })
}

async function submit() {
  if (!form.nama.trim())  { showToast('Nama koridor wajib diisi.', 'error'); return }
  if (!form.nomor.trim()) { showToast('Nomor koridor wajib diisi.', 'error'); return }
  const isEdit = !!form.editId
  const p = {
    nama:       form.nama.trim(),
    nomor:      form.nomor.trim(),
    ketua:      form.ketua.trim(),
    urutan:     form.urutan || 1,
    warna:      form.warna,
    keterangan: form.keterangan.trim(),
  }
  try {
    isEdit ? await store.update(form.editId, p) : await store.add(p)
    showToast(isEdit ? `Koridor "${p.nama}" berhasil diperbarui.` : `Koridor "${p.nama}" berhasil ditambahkan.`)
    resetForm()
  } catch {
    showToast('Gagal menyimpan. Coba lagi.', 'error')
  }
}

async function hapus(k) {
  if (!confirm(`Hapus koridor "${k.nama}"?`)) return
  try {
    await store.remove(k.id)
    showToast(`Koridor "${k.nama}" berhasil dihapus.`)
  } catch {
    showToast('Gagal menghapus. Coba lagi.', 'error')
  }
}

onMounted(() => store.fetch())
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header  { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow { font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#2D5B8A; }
.section-title   { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }

/* modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
.modal-card    { background:#fff; border-radius:20px; width:100%; max-width:600px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.25); }
.modal-hd      { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-ttl     { font:800 18px/1.2 Archivo; color:#1A1613; margin:0; }
.modal-x       { width:32px; height:32px; border-radius:50%; border:none; background:#F0EBE2; color:#5A534B; font:700 16px/1 Archivo; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.modal-x:hover { background:#E2DCD2; }
.modal-bd      { padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px; }

/* form */
.inline-form  { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:22px; margin-bottom:24px; display:flex; flex-direction:column; gap:18px; }
.form-row-4   { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:16px; }
.form-row-full { display:flex; flex-direction:column; }
.form-actions { flex-direction:row; gap:12px; }
.form-label   { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req          { color:#CE1126; }
.tcr-textarea { resize:vertical; min-height:80px; line-height:1.6; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; }
.btn-save     { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-cancel   { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

.color-row    { display:flex; align-items:center; gap:8px; }
.color-picker { width:40px; height:38px; border:1.5px solid #E2DCD2; border-radius:8px; padding:2px; cursor:pointer; background:none; }
.preset-colors { display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; }
.preset-dot   { width:22px; height:22px; border-radius:50%; border:2px solid transparent; cursor:pointer; transition:transform .1s; }
.preset-dot:hover { transform:scale(1.15); }
.preset-dot.active { border-color:#1A1613; }

/* table */
.data-table-wrap { border:1px solid #ECE7DE; border-radius:14px; overflow:hidden; }
.data-table  { width:100%; border-collapse:collapse; font:500 13px/1.5 'Plus Jakarta Sans'; }
.data-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.data-table th  { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; }
.data-table td  { padding:14px 16px; border-bottom:1px solid #F0EBE2; vertical-align:top; }
.data-table tbody tr:last-child td { border-bottom:none; }
.data-row { cursor:pointer; }
.data-row:hover:not(.detail-row) td { background:#FAF8F3; }
.row-expanded td { background:#F0EDE6 !important; }

.td-num  { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold { font:700 14px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.dot     { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; }
.nomor-badge { padding:4px 10px; border-radius:999px; font:600 11px/1 'Plus Jakarta Sans'; }

.action-group { display:flex; gap:6px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }

/* detail panel */
.detail-row td { padding:0 !important; border-bottom:2px solid #E2DCD2; }
.detail-panel  { padding:20px 24px; background:#F7F4EE; display:flex; flex-direction:column; gap:18px; }
.detail-label  { font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.1em; text-transform:uppercase; color:#9A9389; margin-bottom:10px; }
.detail-text   { font:500 14px/1.7 'Plus Jakarta Sans'; color:#1A1613; margin:0; }
.detail-empty  { font:500 13px/1 'Plus Jakarta Sans'; color:#9A9389; font-style:italic; }

.empty { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }

@media(max-width:767px) {
  .form-row-4 { grid-template-columns: 1fr 1fr; }
  .action-group { flex-wrap: wrap; }
  .adm-main { padding: 16px 12px 50px; }
  .adm-section { padding: 14px; border-radius: 14px; }
  .section-header { gap: 10px; margin-bottom: 12px; }
  .section-title { font-size: 18px; margin: 4px 0 0; }
  .section-eyebrow { font-size: 11px; }
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
    grid-template-areas: "nama nomor" "ketua aksi";
    column-gap: 10px; row-gap: 6px;
    background: #fff; border: 1px solid #ECE7DE;
    border-radius: 14px; padding: 12px; cursor: pointer;
  }
  .row-expanded { border-radius: 14px 14px 0 0 !important; border-bottom-color: transparent !important; }
  .data-row td { padding: 0 !important; border: none !important; background: transparent !important; vertical-align: middle !important; }
  .td-idx { display: none !important; }
  .td-nama { grid-area: nama; align-self: center; }
  .td-nomor { grid-area: nomor; align-self: center; display: flex; justify-content: flex-end; }
  .td-ketua { grid-area: ketua; align-self: center; font-size: 12px; color: #7A7368; }
  .td-aksi { grid-area: aksi; align-self: center; display: flex; justify-content: flex-end; }
  .detail-row { display: block !important; }
  .detail-row td { display: block !important; padding: 0 !important; border: none !important; }
  .data-table tbody .detail-row {
    border: 1px solid #ECE7DE !important; border-top: none !important;
    border-radius: 0 0 14px 14px; background: #FAF8F3; margin-top: -8px;
  }
  .empty { display: block !important; text-align: center !important; padding: 18px 12px !important; font-size: 12px !important; }
}

/* toast */
.toast {
  position:fixed; bottom:28px; right:28px; z-index:9999;
  display:flex; align-items:center; gap:10px;
  padding:14px 20px; border-radius:12px; min-width:260px; max-width:380px;
  font:600 14px/1.4 'Plus Jakarta Sans'; box-shadow:0 8px 24px rgba(0,0,0,.18);
  pointer-events:none;
}
.toast.success { background:#1A1613; color:#fff; }
.toast.error   { background:#CE1126; color:#fff; }
.toast-icon    { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font:700 13px/1 Archivo; flex-shrink:0; }
.toast.success .toast-icon { background:rgba(255,255,255,.15); }
.toast.error   .toast-icon { background:rgba(0,0,0,.15); }

.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(12px); }
.chevron { display:inline-block; font-size:18px; color:#C4BDB2; line-height:1; transition:transform .2s; user-select:none; }
.chevron.open { transform:rotate(90deg); }
.detail-actions { display:flex; gap:8px; padding-top:14px; border-top:1px solid #E2DCD2; margin-top:2px; }
.detail-actions .btn-edit,
.detail-actions .btn-del { flex:1; padding:10px; text-align:center; font-size:13px; border-radius:10px; }
</style>
