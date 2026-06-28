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
          <h2 class="section-title">Kategori Lomba</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari kategori..." />
          <button class="btn-export" @click="doExport">Export Excel</button>
          <button class="tcr-btn-red" @click="openForm()">+ Tambah Kategori</button>
        </div>
      </div>

      <!-- FORM -->
      <form v-if="showForm" @submit.prevent="submit" class="inline-form">
        <div class="form-row-4">
          <div>
            <label class="form-label">Nama Lomba <span class="req">*</span></label>
            <input v-model="form.nama" type="text" class="tcr-input" placeholder="cth: Voli Putra" />
          </div>
          <div>
            <label class="form-label">Tipe <span class="req">*</span></label>
            <select v-model="form.tipe" class="tcr-input">
              <option value="">Pilih tipe...</option>
              <option v-for="t in tipeStore.list" :key="t.id" :value="t.nama">{{ t.nama }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">Jenis <span class="req">*</span></label>
            <select v-model="form.jenis" class="tcr-input">
              <option value="Beregu">Beregu</option>
              <option value="Perorangan">Perorangan</option>
            </select>
          </div>
          <div>
            <label class="form-label">Urutan Tampil</label>
            <input v-model.number="form.urutan" type="number" min="1" class="tcr-input" />
          </div>
        </div>

        <div class="form-row-full">
          <label class="form-label">Deskripsi Lomba</label>
          <textarea v-model="form.deskripsi" class="tcr-input tcr-textarea" rows="3"
            placeholder="Jelaskan singkat tentang cabang lomba ini..."></textarea>
        </div>

        <div class="form-row-full">
          <label class="form-label">Peraturan &amp; Syarat Ketentuan</label>
          <div class="rules-hint">Gunakan baris baru untuk setiap poin peraturan</div>
          <textarea v-model="form.peraturan" class="tcr-input tcr-textarea" rows="8"
            placeholder="1. Peserta wajib hadir 15 menit sebelum pertandingan&#10;2. Setiap tim terdiri dari maksimal 6 orang&#10;3. Pakaian olahraga wajib digunakan&#10;..."></textarea>
        </div>

        <div class="form-row-full form-actions">
          <button type="submit" class="btn-save">{{ form.editId ? 'Update Kategori' : 'Simpan Kategori' }}</button>
          <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
        </div>
      </form>

      <!-- TABLE -->
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:40px;">#</th>
              <th>Nama Lomba</th>
              <th>Tipe</th>
              <th style="width:110px;">Jenis</th>
              <th style="width:80px;text-align:center;">Urutan</th>
              <th style="width:130px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(k, i) in paginated" :key="k.id">
              <tr class="data-row" :class="{ 'row-expanded': expandedId === k.id }" @click="toggleDetail(k.id)">
                <td class="td-num">{{ (page-1)*PER_PAGE + i + 1 }}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span class="dot" :style="{ background: tipeColor(k.tipe) }"></span>
                    <span class="td-bold">{{ k.nama }}</span>
                  </div>
                </td>
                <td>
                  <span class="tipe-badge" :style="{ background: tipeBg(k.tipe), color: tipeColor(k.tipe) }">{{ k.tipe }}</span>
                </td>
                <td>
                  <span class="jenis-badge" :class="k.jenis === 'Beregu' ? 'jenis-beregu' : 'jenis-perorangan'">
                    {{ k.jenis || '—' }}
                  </span>
                </td>
                <td class="td-num">{{ k.urutan }}</td>
                <td>
                  <div class="action-group" @click.stop>
                    <button @click="openForm(k)" class="btn-edit">Edit</button>
                    <button @click="hapus(k)" class="btn-del">Hapus</button>
                  </div>
                </td>
              </tr>
              <!-- Detail row -->
              <tr v-if="expandedId === k.id" class="detail-row">
                <td colspan="6">
                  <div class="detail-panel">
                    <div v-if="k.deskripsi" class="detail-block">
                      <div class="detail-label">Deskripsi Lomba</div>
                      <p class="detail-text">{{ k.deskripsi }}</p>
                    </div>
                    <div v-if="k.peraturan" class="detail-block">
                      <div class="detail-label">Peraturan &amp; Syarat Ketentuan</div>
                      <ol class="rules-list">
                        <li v-for="(line, idx) in parseRules(k.peraturan)" :key="idx">{{ line }}</li>
                      </ol>
                    </div>
                    <div v-if="!k.deskripsi && !k.peraturan" class="detail-empty">
                      Belum ada deskripsi dan peraturan. Klik Edit untuk menambahkan.
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!filtered.length">
              <td colspan="6" class="empty">{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada kategori. Tambahkan dulu sebelum membuat jadwal.' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar v-model="page" :total="filtered.length" :per-page="PER_PAGE" />
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onActivated } from 'vue'
import { useKategoriStore } from '@/stores/useKategori'
import { useTipeStore }     from '@/stores/useTipe'
import PaginationBar from '@/components/PaginationBar.vue'
import { exportToExcel } from '@/utils/exportExcel'

const store     = useKategoriStore()
const tipeStore = useTipeStore()
const showForm  = ref(false)
const expandedId = ref(null)
const search    = ref('')
const page      = ref(1)
const PER_PAGE  = 10

const filtered  = computed(() => {
  const q = search.value.toLowerCase()
  return store.list.filter(k => !q ||
    k.nama.toLowerCase().includes(q) ||
    (k.tipe||'').toLowerCase().includes(q) ||
    (k.jenis||'').toLowerCase().includes(q)
  )
})
const paginated = computed(() => filtered.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))
watch(search, () => { page.value = 1 })

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',       field: (_, i) => i + 1 },
    { label: 'Nama Lomba', field: 'nama' },
    { label: 'Tipe',     field: 'tipe' },
    { label: 'Jenis',    field: 'jenis' },
    { label: 'Urutan',   field: 'urutan' },
    { label: 'Deskripsi', field: 'deskripsi' },
    { label: 'Peraturan', field: 'peraturan' },
  ], 'kategori-lomba')
}
const form  = reactive({ nama:'', tipe:'', jenis:'Beregu', urutan:1, deskripsi:'', peraturan:'', editId:null })
const toast = reactive({ show:false, msg:'', type:'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg = msg; toast.type = type; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

const tipeColor = (t) => tipeStore.warna(t)
const tipeBg    = (t) => tipeStore.bg(t)

function parseRules(text) {
  return text.split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
}

function toggleDetail(id) {
  expandedId.value = expandedId.value === id ? null : id
}

async function openForm(k = null) {
  await tipeStore.fetch()
  const defaultTipe = tipeStore.list[0]?.nama || ''
  k ? Object.assign(form, { nama:k.nama, tipe:k.tipe, jenis:k.jenis||'Beregu', urutan:k.urutan||1, deskripsi:k.deskripsi||'', peraturan:k.peraturan||'', editId:k.id })
    : Object.assign(form, { nama:'', tipe:defaultTipe, jenis:'Beregu', urutan:store.list.length+1, deskripsi:'', peraturan:'', editId:null })
  showForm.value = true
  expandedId.value = null
}

function resetForm() {
  showForm.value = false
  Object.assign(form, { nama:'', tipe:'', jenis:'Beregu', urutan:1, deskripsi:'', peraturan:'', editId:null })
}

async function submit() {
  if (!form.nama.trim()) { showToast('Nama lomba wajib diisi.', 'error'); return }
  if (!form.tipe)        { showToast('Tipe lomba wajib dipilih.', 'error'); return }
  const isEdit = !!form.editId
  const p = {
    nama:      form.nama.trim(),
    tipe:      form.tipe,
    jenis:     form.jenis,
    urutan:    form.urutan || 1,
    deskripsi: form.deskripsi.trim(),
    peraturan: form.peraturan.trim(),
  }
  try {
    isEdit ? await store.update(form.editId, p) : await store.add(p)
    showToast(isEdit ? `Kategori "${p.nama}" berhasil diperbarui.` : `Kategori "${p.nama}" berhasil ditambahkan.`)
    resetForm()
  } catch {
    showToast('Gagal menyimpan. Coba lagi.', 'error')
  }
}

async function hapus(k) {
  if (!confirm(`Hapus kategori "${k.nama}"?`)) return
  try {
    await store.remove(k.id)
    showToast(`Kategori "${k.nama}" berhasil dihapus.`)
  } catch {
    showToast('Gagal menghapus. Coba lagi.', 'error')
  }
}

onMounted(()    => { tipeStore.fetch(); store.fetch() })
onActivated(()  => { tipeStore.fetch() })
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header  { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow { font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#2D5B8A; }
.section-title   { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }

/* form */
.inline-form    { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:22px; margin-bottom:24px; display:flex; flex-direction:column; gap:18px; }
.form-row-4     { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:16px; }
.form-row-full  { display:flex; flex-direction:column; }
.form-actions   { flex-direction:row; gap:12px; }
.form-label     { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req            { color:#CE1126; }
.rules-hint     { font:500 12px/1.4 'Plus Jakarta Sans'; color:#9A9389; margin-bottom:8px; }
.tcr-textarea   { resize:vertical; min-height:80px; line-height:1.6; font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; }
.btn-save   { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-cancel { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

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

.td-num   { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold  { font:700 14px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.dot      { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; }
.tipe-badge { padding:4px 10px; border-radius:999px; font:600 11px/1 'Plus Jakarta Sans'; }
.jenis-badge     { padding:4px 10px; border-radius:6px; font:600 11px/1 'Plus Jakarta Sans'; }
.jenis-beregu    { background:#EEF2FF; color:#4338CA; }
.jenis-perorangan{ background:#FEF3C7; color:#92400E; }

.action-group { display:flex; gap:6px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }

/* detail panel */
.detail-row td { padding:0 !important; border-bottom:2px solid #E2DCD2; }
.detail-panel  { padding:20px 24px; background:#F7F4EE; display:flex; flex-direction:column; gap:18px; }
.detail-block  { }
.detail-label  { font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.1em; text-transform:uppercase; color:#9A9389; margin-bottom:10px; }
.detail-text   { font:500 14px/1.7 'Plus Jakarta Sans'; color:#1A1613; margin:0; }
.rules-list    { margin:0; padding-left:20px; display:flex; flex-direction:column; gap:6px; }
.rules-list li { font:500 14px/1.6 'Plus Jakarta Sans'; color:#1A1613; }
.detail-empty  { font:500 13px/1 'Plus Jakarta Sans'; color:#9A9389; font-style:italic; }

.empty { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }

@media(max-width:767px) {
  .form-row-4 { grid-template-columns:1fr 1fr; }
  .action-group { flex-wrap:wrap; }
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
.header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.search-input   { width:220px; }
.btn-export     { padding:10px 18px; border:1.5px solid #2E7D52; border-radius:10px; background:#fff; color:#2E7D52; font:700 13px/1 'Plus Jakarta Sans'; cursor:pointer; white-space:nowrap; transition:background .15s; }
.btn-export:hover { background:#E7F2EB; }
</style>
