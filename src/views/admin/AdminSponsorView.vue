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
          <h2 class="section-title">Sponsor & Media Partner</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari nama..." />
          <button class="tcr-btn-red" @click="openForm()">+ Tambah</button>
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
        <div class="modal-card">
          <div class="modal-hd">
            <h3 class="modal-ttl">{{ form.editId ? 'Edit' : 'Tambah' }} Sponsor / Media Partner</h3>
            <button type="button" class="modal-x" @click="resetForm">✕</button>
          </div>
          <form @submit.prevent="submit" class="modal-bd">
            <div class="form-row-2">
              <div>
                <label class="form-label">Nama <span class="req">*</span></label>
                <input v-model="form.nama" type="text" class="tcr-input" placeholder="cth: Bank Sinarmas" />
              </div>
              <div>
                <label class="form-label">Jenis</label>
                <select v-model="form.jenis" class="tcr-input">
                  <option value="Sponsor">Sponsor</option>
                  <option value="Media Partner">Media Partner</option>
                </select>
              </div>
            </div>

            <div class="form-row-full">
              <label class="form-label">Logo</label>
              <input ref="fileInputRef" type="file" accept="image/*" class="file-input-hidden" @change="handleFileChange" />
              <div class="upload-box" :class="{ 'has-preview': form.logoPreview }" @click="!compressing && fileInputRef.click()">
                <img v-if="form.logoPreview" :src="form.logoPreview" alt="preview" class="img-preview" />
                <div v-else class="upload-placeholder">
                  <span class="upload-icon">🖼️</span>
                  <span>{{ compressing ? 'Memproses logo...' : 'Klik untuk upload logo' }}</span>
                </div>
              </div>
              <button v-if="form.logoPreview" type="button" class="btn-change-photo" :disabled="compressing" @click="fileInputRef.click()">Ganti Logo</button>
              <div v-if="logoError" class="foto-error">⚠ {{ logoError }}</div>
            </div>

            <div class="form-row-2">
              <div>
                <label class="form-label">Link Website</label>
                <input v-model="form.link" type="text" class="tcr-input" placeholder="https://..." />
              </div>
              <div>
                <label class="form-label">Urutan Tampil</label>
                <input v-model.number="form.urutan" type="number" min="1" class="tcr-input" />
              </div>
            </div>

            <div class="form-row-full form-actions">
              <button type="submit" class="btn-save" :disabled="saving || compressing">
                {{ saving ? 'Menyimpan...' : (form.editId ? 'Update' : 'Simpan') }}
              </button>
              <button type="button" class="btn-cancel" @click="resetForm" :disabled="saving">Batal</button>
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
              <th style="width:72px;">Logo</th>
              <th>Nama</th>
              <th style="width:140px;">Jenis</th>
              <th style="width:80px;">Urutan</th>
              <th style="width:130px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="store.loading">
              <tr><td colspan="6" class="empty">Memuat data...</td></tr>
            </template>
            <template v-else>
              <tr v-for="(s, i) in paginated" :key="s.id" class="data-row">
                <td class="td-num td-sponsor-idx">{{ (page - 1) * PER_PAGE + i + 1 }}</td>
                <td class="td-sponsor-thumb">
                  <div class="thumb-wrap">
                    <img v-if="s.logoUrl" :src="s.logoUrl" :alt="s.nama" class="thumb-img" @error="e => e.target.style.display='none'" />
                    <div v-else class="thumb-empty">🖼️</div>
                  </div>
                </td>
                <td class="td-sponsor-nama">
                  <span class="td-bold">{{ s.nama }}</span>
                  <div v-if="s.link" class="td-sub">{{ s.link }}</div>
                </td>
                <td class="td-sponsor-jenis">
                  <span class="kat-badge" :class="{ 'kat-partner': s.jenis === 'Media Partner' }">{{ s.jenis || 'Sponsor' }}</span>
                </td>
                <td class="td-num td-sponsor-urutan">{{ s.urutan ?? '—' }}</td>
                <td class="td-sponsor-aksi">
                  <div class="action-group">
                    <button @click="openForm(s)" class="btn-edit">Edit</button>
                    <button @click="hapus(s)" class="btn-del">Hapus</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filtered.length">
                <td colspan="6" class="empty">
                  <template v-if="search">Tidak ada hasil pencarian.</template>
                  <template v-else>Belum ada data sponsor / media partner.</template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <PaginationBar v-model="page" :total="filtered.length" :per-page="PER_PAGE" />
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useSponsorStore } from '@/stores/useSponsor'
import { compressImageToDataUrl } from '@/utils/compressImage'
import PaginationBar from '@/components/PaginationBar.vue'

const store      = useSponsorStore()
const showForm   = ref(false)
const search     = ref('')
const page       = ref(1)
const PER_PAGE   = 10

const filtered  = computed(() => {
  const q = search.value.toLowerCase()
  return store.list.filter(s => !q ||
    (s.nama || '').toLowerCase().includes(q) ||
    (s.jenis || '').toLowerCase().includes(q)
  )
})
const paginated = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
watch(search, () => { page.value = 1 })

const form  = reactive({ nama: '', jenis: 'Sponsor', link: '', urutan: 1, editId: null, logoDataUrl: null, logoPreview: '' })
const toast = reactive({ show: false, msg: '', type: 'success' })
const fileInputRef = ref(null)
const saving = ref(false)
const compressing = ref(false)
const logoError = ref('')
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg = msg; toast.type = type; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

function openForm(s = null) {
  logoError.value = ''
  if (s) {
    Object.assign(form, { nama: s.nama, jenis: s.jenis || 'Sponsor', link: s.link || '', urutan: s.urutan ?? 1, editId: s.id, logoDataUrl: null, logoPreview: s.logoUrl || '' })
  } else {
    Object.assign(form, { nama: '', jenis: 'Sponsor', link: '', urutan: store.list.length + 1, editId: null, logoDataUrl: null, logoPreview: '' })
  }
  showForm.value = true
}

function resetForm() {
  showForm.value = false
  logoError.value = ''
  Object.assign(form, { nama: '', jenis: 'Sponsor', link: '', urutan: 1, editId: null, logoDataUrl: null, logoPreview: '' })
}

async function handleFileChange(e) {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file) return
  logoError.value = ''
  if (file.size > 30 * 1024 * 1024) { logoError.value = 'Ukuran logo maks 30 MB.'; return }

  compressing.value = true
  try {
    const dataUrl = await compressImageToDataUrl(file, { maxWidth: 600, maxHeight: 600, quality: 0.8, maxBytes: 400 * 1024 })
    form.logoDataUrl = dataUrl
    form.logoPreview = dataUrl
  } catch (err) {
    console.error(err)
    logoError.value = err.message || 'Gagal memproses logo. Coba gambar lain.'
  } finally {
    compressing.value = false
  }
}

async function submit() {
  if (!form.nama.trim()) { showToast('Nama wajib diisi.', 'error'); return }
  if (logoError.value) { showToast('Perbaiki dulu masalah logo sebelum menyimpan.', 'error'); return }
  const isEdit = !!form.editId
  const p = {
    nama:   form.nama.trim(),
    jenis:  form.jenis,
    link:   form.link.trim(),
    urutan: form.urutan || 1,
  }
  saving.value = true
  try {
    isEdit ? await store.update(form.editId, p, form.logoDataUrl) : await store.add(p, form.logoDataUrl)
    showToast(isEdit ? `"${p.nama}" berhasil diperbarui.` : `"${p.nama}" berhasil ditambahkan.`)
    resetForm()
  } catch (err) {
    console.error(err)
    showToast('Gagal menyimpan. Coba lagi.', 'error')
  } finally {
    saving.value = false
  }
}

async function hapus(s) {
  if (!confirm(`Hapus "${s.nama}"?`)) return
  try {
    await store.remove(s.id)
    showToast(`"${s.nama}" berhasil dihapus.`)
  } catch (err) {
    console.error(err)
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
.header-actions  { display:flex; gap:10px; flex-wrap:wrap; }
.search-input    { min-width:200px; }

/* modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
.modal-card    { background:#fff; border-radius:20px; width:100%; max-width:600px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.25); }
.modal-hd      { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-ttl     { font:800 18px/1.2 Archivo; color:#1A1613; margin:0; }
.modal-x       { width:32px; height:32px; border-radius:50%; border:none; background:#F0EBE2; color:#5A534B; font:700 16px/1 Archivo; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.modal-x:hover { background:#E2DCD2; }
.modal-bd      { padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px; }

/* form */
.form-row-2   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.form-row-full { display:flex; flex-direction:column; }
.form-actions { flex-direction:row; gap:12px; }
.form-label   { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req          { color:#CE1126; }
.btn-save     { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-save:disabled, .btn-cancel:disabled { opacity:.6; cursor:default; }
.btn-cancel   { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

/* upload logo */
.file-input-hidden { display:none; }
.upload-box {
  display:flex; align-items:center; justify-content:center;
  min-height:140px; border:1.5px dashed #E2DCD2; border-radius:12px;
  background:#FAF8F3; cursor:pointer; overflow:hidden; margin-top:6px;
}
.upload-box:hover { border-color:#CE1126; }
.upload-box.has-preview { border-style:solid; padding:12px; }
.upload-placeholder { display:flex; flex-direction:column; align-items:center; gap:6px; color:#9A9389; font:600 13px/1 'Plus Jakarta Sans'; padding:24px; }
.upload-icon { font-size:28px; line-height:1; }
.img-preview { max-width:100%; max-height:160px; border-radius:10px; object-fit:contain; }
.btn-change-photo {
  margin-top:8px; align-self:flex-start;
  padding:7px 14px; border:1.5px solid #E2DCD2; border-radius:8px;
  background:transparent; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer;
}
.btn-change-photo:hover { background:#F0EBE2; }
.btn-change-photo:disabled { opacity:.6; cursor:default; }
.foto-error { margin-top:8px; font:600 12px/1.4 'Plus Jakarta Sans'; color:#CE1126; }

/* table */
.data-table-wrap { border:1px solid #ECE7DE; border-radius:14px; overflow:hidden; }
.data-table  { width:100%; border-collapse:collapse; font:500 13px/1.5 'Plus Jakarta Sans'; }
.data-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.data-table th  { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; }
.data-table td  { padding:12px 16px; border-bottom:1px solid #F0EBE2; vertical-align:middle; }
.data-table tbody tr:last-child td { border-bottom:none; }
.data-row:hover td { background:#FAF8F3; }

.td-num   { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold  { font:700 14px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.td-sub   { font:500 12px/1.4 'Plus Jakarta Sans'; color:#7A7368; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px; }

.thumb-wrap  { width:48px; height:48px; border-radius:8px; overflow:hidden; border:1px solid #E8E1D8; background:#FAF8F3; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.thumb-img   { width:100%; height:100%; object-fit:contain; }
.thumb-empty { font-size:20px; line-height:1; }

.kat-badge   { padding:4px 10px; border-radius:999px; background:#E5EDF7; color:#2D5B8A; font:600 11px/1 'Plus Jakarta Sans'; white-space:nowrap; }
.kat-partner { background:#FFF3CD; color:#856404; }

.action-group { display:flex; gap:6px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }

.empty { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }

@media(max-width:767px) {
  .adm-main { padding: 16px 12px 50px; }
  .adm-section { padding: 14px; border-radius: 14px; }
  .section-header { gap: 10px; margin-bottom: 12px; }
  .section-title { font-size: 18px; margin: 4px 0 0; }
  .section-eyebrow { font-size: 11px; }
  .form-row-2 { grid-template-columns: 1fr; }
  .form-label { font-size: 12px; margin-bottom: 6px; }
  .btn-save, .btn-cancel { padding: 9px 12px; font-size: 12px; border-radius: 8px; }
  .btn-edit, .btn-del { padding: 5px 10px; font-size: 11px; border-radius: 6px; }

  /* Mobile card layout */
  .data-table-wrap { border: none; background: transparent; overflow: visible; border-radius: 0; }
  .data-table { display: block; }
  .data-table thead { display: none; }
  .data-table tbody { display: flex; flex-direction: column; gap: 8px; }

  .data-table .data-row {
    display: grid !important;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      "thumb nama  nama"
      "thumb jenis aksi";
    column-gap: 10px;
    row-gap: 4px;
    background: #fff;
    border: 1px solid #ECE7DE;
    border-radius: 12px;
    padding: 10px;
  }
  .data-table .data-row td { padding: 0 !important; border: none !important; background: transparent !important; vertical-align: middle !important; }

  .td-sponsor-idx    { display: none !important; }
  .td-sponsor-urutan { display: none !important; }
  .td-sponsor-thumb  { grid-area: thumb; align-self: center; }
  .td-sponsor-nama   { grid-area: nama; align-self: end; }
  .td-sponsor-jenis  { grid-area: jenis; align-self: start; }
  .td-sponsor-aksi   { grid-area: aksi; align-self: center; display: flex; justify-content: flex-end; }

  .empty { display: block !important; text-align: center !important; padding: 20px !important; font-size: 12px !important; }
}

@media (min-width: 768px) {
  .adm-main { padding: 28px 20px 70px; }
  .adm-section { padding: 24px; border-radius: 20px; }
  .section-title { font-size: 26px; }
  .section-header { gap: 16px; margin-bottom: 20px; }
  .btn-save, .btn-cancel { padding: 12px; font-size: 13px; }
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
</style>
