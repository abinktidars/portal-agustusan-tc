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
          <h2 class="section-title">Galeri Foto</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari judul / kategori..." />
          <button class="tcr-btn-red" @click="openForm()">+ Tambah Foto</button>
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
        <div class="modal-card">
          <div class="modal-hd">
            <h3 class="modal-ttl">{{ form.editId ? 'Edit' : 'Tambah' }} Foto</h3>
            <button type="button" class="modal-x" @click="resetForm">✕</button>
          </div>
          <form @submit.prevent="submit" class="modal-bd">
            <div class="form-row-2">
              <div>
                <label class="form-label">Judul Foto <span class="req">*</span></label>
                <input v-model="form.judul" type="text" class="tcr-input" placeholder="cth: Final Voli Putra" />
              </div>
              <div>
                <label class="form-label">Kategori</label>
                <input v-model="form.kategori" type="text" class="tcr-input" placeholder="cth: Lomba, HUT RI, Karnaval" />
              </div>
            </div>

            <div class="form-row-full">
              <label class="form-label">Foto</label>
              <input ref="fileInputRef" type="file" accept="image/*" class="file-input-hidden" @change="handleFileChange" />
              <div class="upload-box" :class="{ 'has-preview': form.fotoPreview }" @click="!compressing && fileInputRef.click()">
                <img v-if="form.fotoPreview" :src="form.fotoPreview" alt="preview" class="img-preview" />
                <div v-else class="upload-placeholder">
                  <span class="upload-icon">📷</span>
                  <span>{{ compressing ? 'Memproses foto...' : 'Klik untuk upload foto' }}</span>
                </div>
              </div>
              <button v-if="form.fotoPreview" type="button" class="btn-change-photo" :disabled="compressing" @click="fileInputRef.click()">Ganti Foto</button>
              <div v-if="saving && form.fotoFile" class="upload-progress">
                <div class="upload-progress-bar" :style="{ width: uploadProgress + '%' }"></div>
              </div>
            </div>

            <div class="form-row-2">
              <div>
                <label class="form-label">Keterangan</label>
                <textarea v-model="form.keterangan" class="tcr-input tcr-textarea" rows="3"
                  placeholder="Deskripsi singkat foto..."></textarea>
              </div>
              <div>
                <label class="form-label">Urutan Tampil</label>
                <input v-model.number="form.urutan" type="number" min="1" class="tcr-input" />
              </div>
            </div>

            <div class="form-row-full form-actions">
              <button type="submit" class="btn-save" :disabled="saving || compressing">
                {{ saving ? (form.fotoFile ? `Mengupload... ${uploadProgress}%` : 'Menyimpan...') : (form.editId ? 'Update Foto' : 'Simpan Foto') }}
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
              <th style="width:72px;">Foto</th>
              <th>Judul</th>
              <th style="width:130px;">Kategori</th>
              <th style="width:80px;">Urutan</th>
              <th style="width:130px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="store.loading">
              <tr><td colspan="6" class="empty">Memuat data...</td></tr>
            </template>
            <template v-else>
              <template v-for="(g, i) in paginated" :key="g.id">
                <tr class="data-row" :class="{ 'row-expanded': expandedId === g.id }" @click="toggleDetail(g.id)">
                  <td class="td-num td-galeri-idx">{{ (page - 1) * PER_PAGE + i + 1 }}</td>
                  <td class="td-galeri-thumb">
                    <div class="thumb-wrap">
                      <img v-if="g.url" :src="g.url" :alt="g.judul" class="thumb-img" @error="e => e.target.style.display='none'" />
                      <div v-else class="thumb-empty">🖼️</div>
                    </div>
                  </td>
                  <td class="td-galeri-judul">
                    <span class="td-bold">{{ g.judul }}</span>
                    <div v-if="g.keterangan" class="td-sub">{{ g.keterangan }}</div>
                  </td>
                  <td class="td-galeri-kat">
                    <span v-if="g.kategori" class="kat-badge">{{ g.kategori }}</span>
                    <span v-else class="td-muted">—</span>
                  </td>
                  <td class="td-num td-galeri-urutan">{{ g.urutan ?? '—' }}</td>
                  <td class="td-galeri-aksi">
                    <div class="action-group" @click.stop>
                      <button @click="openForm(g)" class="btn-edit">Edit</button>
                      <button @click="hapus(g)" class="btn-del">Hapus</button>
                    </div>
                  </td>
                </tr>
                <!-- Detail row -->
                <tr v-if="expandedId === g.id" class="detail-row">
                  <td colspan="6">
                    <div class="detail-panel">
                      <div v-if="g.url" class="detail-block">
                        <div class="detail-label">URL Foto</div>
                        <a :href="g.url" target="_blank" rel="noopener" class="detail-link">{{ g.url }}</a>
                      </div>
                      <div v-if="g.keterangan" class="detail-block">
                        <div class="detail-label">Keterangan</div>
                        <p class="detail-text">{{ g.keterangan }}</p>
                      </div>
                      <div v-if="!g.url && !g.keterangan" class="detail-empty">
                        Belum ada detail. Klik Edit untuk menambahkan.
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr v-if="!filtered.length">
                <td colspan="6" class="empty">
                  <template v-if="search">Tidak ada hasil pencarian.</template>
                  <template v-else>
                    <div>Belum ada foto di galeri.</div>
                    <button class="btn-seed" @click="doSeed" :disabled="seeding">
                      {{ seeding ? 'Menambahkan sample...' : '✦ Isi dengan 8 foto sample' }}
                    </button>
                  </template>
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
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useGaleriStore } from '@/stores/useGaleri'
import { seedGaleri } from '@/firebase/seedGaleri'
import { compressImage } from '@/utils/compressImage'
import PaginationBar from '@/components/PaginationBar.vue'

const store      = useGaleriStore()
const showForm   = ref(false)
const expandedId = ref(null)
const search     = ref('')
const page       = ref(1)
const PER_PAGE   = 10

const filtered  = computed(() => {
  const q = search.value.toLowerCase()
  return store.list.filter(g => !q ||
    g.judul.toLowerCase().includes(q) ||
    (g.kategori || '').toLowerCase().includes(q) ||
    (g.keterangan || '').toLowerCase().includes(q)
  )
})
const paginated = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
watch(search, () => { page.value = 1 })

const form  = reactive({ judul: '', kategori: '', keterangan: '', urutan: 1, editId: null, fotoFile: null, fotoPreview: '' })
const toast = reactive({ show: false, msg: '', type: 'success' })
const fileInputRef = ref(null)
const saving = ref(false)
const compressing = ref(false)
const uploadProgress = ref(0)
let toastTimer = null
let progressTimer = null

// Firebase Storage only reports progress per finished chunk (min 256 KB), so a
// compressed photo often uploads as a single chunk with no in-between values.
// Simulate a smooth climb to 90% so the bar doesn't look stuck, then let the
// real/final progress (or the try block) push it to 100%.
function startFakeProgress() {
  clearInterval(progressTimer)
  progressTimer = setInterval(() => {
    if (uploadProgress.value < 90) uploadProgress.value += Math.max(1, Math.round((90 - uploadProgress.value) * 0.15))
  }, 150)
}
function stopFakeProgress() {
  clearInterval(progressTimer)
  progressTimer = null
}
onUnmounted(stopFakeProgress)

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg = msg; toast.type = type; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

function toggleDetail(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function openForm(g = null) {
  if (g) {
    Object.assign(form, { judul: g.judul, kategori: g.kategori || '', keterangan: g.keterangan || '', urutan: g.urutan ?? 1, editId: g.id, fotoFile: null, fotoPreview: g.url || '' })
  } else {
    Object.assign(form, { judul: '', kategori: '', keterangan: '', urutan: store.list.length + 1, editId: null, fotoFile: null, fotoPreview: '' })
  }
  showForm.value = true
  expandedId.value = null
}

function resetForm() {
  showForm.value = false
  stopFakeProgress()
  uploadProgress.value = 0
  if (form.fotoPreview?.startsWith('blob:')) URL.revokeObjectURL(form.fotoPreview)
  Object.assign(form, { judul: '', kategori: '', keterangan: '', urutan: 1, editId: null, fotoFile: null, fotoPreview: '' })
}

async function handleFileChange(e) {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file) return
  if (file.size > 8 * 1024 * 1024) { showToast('Ukuran foto maks 8 MB.', 'error'); return }

  compressing.value = true
  try {
    const compressed = await compressImage(file)
    if (form.fotoPreview?.startsWith('blob:')) URL.revokeObjectURL(form.fotoPreview)
    form.fotoFile = compressed
    form.fotoPreview = URL.createObjectURL(compressed)
  } catch {
    showToast('Gagal memproses foto. Coba foto lain.', 'error')
  } finally {
    compressing.value = false
  }
}

async function submit() {
  if (!form.judul.trim()) { showToast('Judul foto wajib diisi.', 'error'); return }
  const isEdit = !!form.editId
  const p = {
    judul:      form.judul.trim(),
    kategori:   form.kategori.trim(),
    keterangan: form.keterangan.trim(),
    urutan:     form.urutan || 1,
  }
  saving.value = true
  uploadProgress.value = 0
  if (form.fotoFile) startFakeProgress()
  const onProgress = (pct) => { uploadProgress.value = Math.max(uploadProgress.value, pct) }
  try {
    isEdit ? await store.update(form.editId, p, form.fotoFile, onProgress) : await store.add(p, form.fotoFile, onProgress)
    uploadProgress.value = 100
    showToast(isEdit ? `Foto "${p.judul}" berhasil diperbarui.` : `Foto "${p.judul}" berhasil ditambahkan.`)
    resetForm()
  } catch {
    showToast('Gagal menyimpan. Coba lagi.', 'error')
  } finally {
    stopFakeProgress()
    saving.value = false
    uploadProgress.value = 0
  }
}

async function hapus(g) {
  if (!confirm(`Hapus foto "${g.judul}"?`)) return
  try {
    await store.remove(g.id)
    showToast(`Foto "${g.judul}" berhasil dihapus.`)
  } catch {
    showToast('Gagal menghapus. Coba lagi.', 'error')
  }
}

const seeding = ref(false)
async function doSeed() {
  if (!confirm('Tambahkan 8 foto sample ke Firestore?')) return
  seeding.value = true
  try {
    await seedGaleri()
    await store.fetch()
    showToast('8 foto sample berhasil ditambahkan.')
  } catch {
    showToast('Gagal menambahkan sample data.', 'error')
  } finally {
    seeding.value = false
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
.form-row-2   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.form-row-full { display:flex; flex-direction:column; }
.form-actions { flex-direction:row; gap:12px; }
.form-label   { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req          { color:#CE1126; }
.tcr-textarea { resize:vertical; min-height:80px; line-height:1.6; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; }
.btn-save     { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-save:disabled, .btn-cancel:disabled { opacity:.6; cursor:default; }
.btn-cancel   { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

/* upload foto */
.file-input-hidden { display:none; }
.upload-box {
  display:flex; align-items:center; justify-content:center;
  min-height:140px; border:1.5px dashed #E2DCD2; border-radius:12px;
  background:#FAF8F3; cursor:pointer; overflow:hidden; margin-top:6px;
}
.upload-box:hover { border-color:#CE1126; }
.upload-box.has-preview { border-style:solid; padding:0; }
.upload-placeholder { display:flex; flex-direction:column; align-items:center; gap:6px; color:#9A9389; font:600 13px/1 'Plus Jakarta Sans'; padding:24px; }
.upload-icon { font-size:28px; line-height:1; }
.img-preview { max-width:100%; max-height:180px; border-radius:10px; object-fit:cover; }
.btn-change-photo {
  margin-top:8px; align-self:flex-start;
  padding:7px 14px; border:1.5px solid #E2DCD2; border-radius:8px;
  background:transparent; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer;
}
.btn-change-photo:hover { background:#F0EBE2; }
.btn-change-photo:disabled { opacity:.6; cursor:default; }
.upload-progress { margin-top:10px; height:6px; border-radius:999px; background:#F0EBE2; overflow:hidden; }
.upload-progress-bar { height:100%; background:#CE1126; transition:width .2s ease; }

/* table */
.data-table-wrap { border:1px solid #ECE7DE; border-radius:14px; overflow:hidden; }
.data-table  { width:100%; border-collapse:collapse; font:500 13px/1.5 'Plus Jakarta Sans'; }
.data-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.data-table th  { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; }
.data-table td  { padding:12px 16px; border-bottom:1px solid #F0EBE2; vertical-align:middle; }
.data-table tbody tr:last-child td { border-bottom:none; }
.data-row { cursor:pointer; }
.data-row:hover:not(.detail-row) td { background:#FAF8F3; }
.row-expanded td { background:#F0EDE6 !important; }

.td-num   { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold  { font:700 14px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.td-sub   { font:500 12px/1.4 'Plus Jakarta Sans'; color:#7A7368; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:280px; }
.td-muted { color:#7A7368; font-size:13px; }

.thumb-wrap  { width:48px; height:48px; border-radius:8px; overflow:hidden; border:1px solid #E8E1D8; background:#FAF8F3; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.thumb-img   { width:100%; height:100%; object-fit:cover; }
.thumb-empty { font-size:20px; line-height:1; }

.kat-badge   { padding:4px 10px; border-radius:999px; background:#FFF3CD; color:#856404; font:600 11px/1 'Plus Jakarta Sans'; white-space:nowrap; }

.action-group { display:flex; gap:6px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }

/* detail panel */
.detail-row td { padding:0 !important; border-bottom:2px solid #E2DCD2; }
.detail-panel  { padding:20px 24px; background:#F7F4EE; display:flex; flex-direction:column; gap:14px; }
.detail-label  { font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.1em; text-transform:uppercase; color:#9A9389; margin-bottom:6px; }
.detail-text   { font:500 14px/1.7 'Plus Jakarta Sans'; color:#1A1613; margin:0; }
.detail-link   { font:500 13px/1.5 'Plus Jakarta Sans'; color:#2D5B8A; word-break:break-all; }
.detail-empty  { font:500 13px/1 'Plus Jakarta Sans'; color:#9A9389; font-style:italic; }

.empty { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
.btn-seed {
  margin-top:12px; display:inline-block;
  padding:9px 20px; border-radius:10px;
  border:1.5px dashed #CE1126; background:transparent;
  color:#CE1126; font:600 13px/1 'Plus Jakarta Sans'; cursor:pointer;
  transition:background .15s;
}
.btn-seed:hover:not(:disabled) { background:#FBEAEC; }
.btn-seed:disabled { opacity:.5; cursor:default; }

@media(max-width:767px) {
  .adm-main { padding: 16px 12px 50px; }
  .adm-section { padding: 14px; border-radius: 14px; }
  .section-header { gap: 10px; margin-bottom: 12px; }
  .section-title { font-size: 18px; margin: 4px 0 0; }
  .section-eyebrow { font-size: 11px; }
  .inline-form { padding: 12px; gap: 10px; }
  .form-row-2 { grid-template-columns: 1fr; }
  .form-label { font-size: 12px; margin-bottom: 6px; }
  .btn-save, .btn-cancel { padding: 9px 12px; font-size: 12px; border-radius: 8px; }
  .btn-edit, .btn-del { padding: 5px 10px; font-size: 11px; border-radius: 6px; }
  .detail-panel { padding: 14px 12px; }

  /* Mobile card layout */
  .data-table-wrap { border: none; background: transparent; overflow: visible; border-radius: 0; }
  .data-table { display: block; }
  .data-table thead { display: none; }
  .data-table tbody { display: flex; flex-direction: column; gap: 8px; }

  .data-table .data-row {
    display: grid !important;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      "thumb judul judul"
      "thumb kat   aksi";
    column-gap: 10px;
    row-gap: 4px;
    background: #fff;
    border: 1px solid #ECE7DE;
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
  }
  .data-table .row-expanded { border-radius: 12px 12px 0 0 !important; border-bottom-color: transparent !important; }
  .data-table .data-row td { padding: 0 !important; border: none !important; background: transparent !important; vertical-align: middle !important; }

  .td-galeri-idx    { display: none !important; }
  .td-galeri-urutan { display: none !important; }
  .td-galeri-thumb  { grid-area: thumb; align-self: center; }
  .td-galeri-judul  { grid-area: judul; align-self: end; }
  .td-galeri-kat    { grid-area: kat; align-self: start; }
  .td-galeri-aksi   { grid-area: aksi; align-self: center; display: flex; justify-content: flex-end; }

  /* Detail rows */
  .detail-row { display: block !important; }
  .detail-row td { display: block !important; padding: 0 !important; border: none !important; }
  .data-table tbody .detail-row {
    border: 1px solid #ECE7DE !important;
    border-top: none !important;
    border-radius: 0 0 12px 12px;
    background: #FAF8F3;
    margin-top: -8px;
  }

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
