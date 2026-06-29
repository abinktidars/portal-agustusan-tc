<template>
  <main class="adm-main">

    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Manajemen</div>
          <h2 class="section-title">Data User</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari user..." />
          <button class="btn-export" @click="doExport"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>Export Excel</button>
          <button class="tcr-btn-red" @click="openForm()">+ Tambah User</button>
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
        <div class="modal-card">
          <div class="modal-hd">
            <h3 class="modal-ttl">{{ form.editId ? 'Edit' : 'Tambah' }} User</h3>
            <button type="button" class="modal-x" @click="resetForm">✕</button>
          </div>
          <form @submit.prevent="submit" class="modal-bd">
            <!-- Foto -->
            <div class="foto-field">
              <label class="form-label">Foto Profil</label>
              <div class="foto-picker">
                <div class="foto-preview" @click="$refs.fotoInput.click()">
                  <img v-if="fotoPreview" :src="fotoPreview" class="foto-img" alt="preview" />
                  <div v-else class="foto-placeholder">
                    <span class="foto-icon">📷</span>
                    <span class="foto-hint">Klik untuk pilih foto</span>
                  </div>
                  <div class="foto-overlay">Ganti Foto</div>
                </div>
                <div class="foto-info">
                  <p class="foto-desc">JPG, PNG, atau WEBP. Maks 2 MB.</p>
                  <button v-if="fotoPreview" type="button" class="btn-hapus-foto" @click="hapusFoto">Hapus foto</button>
                </div>
              </div>
              <input ref="fotoInput" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="onFotoChange" />
            </div>

            <div>
              <label class="form-label">Nama <span class="req">*</span></label>
              <input v-model="form.nama" type="text" class="tcr-input" placeholder="Nama lengkap" />
            </div>
            <div>
              <label class="form-label">Email <span class="req">*</span></label>
              <input v-model="form.email" type="email" class="tcr-input" placeholder="user@wargatc.com" />
            </div>
            <div>
              <label class="form-label">Role <span class="req">*</span></label>
              <select v-model="form.role" class="tcr-input">
                <option value="admin">Admin</option>
                <option value="panitia">Panitia</option>
                <option value="warga">Warga</option>
              </select>
            </div>
            <div>
              <label class="form-label">
                Password <span v-if="!form.editId" class="req">*</span>
                <span v-else style="font-weight:400;color:#9A9389;"> (kosongkan jika tidak diubah)</span>
              </label>
              <input v-model="form.password" type="password" class="tcr-input" placeholder="••••••••" />
            </div>
            <div v-if="formError">
              <div class="error-box">{{ formError }}</div>
            </div>
            <div style="display:flex;gap:12px;">
              <button type="submit" :disabled="saving" class="btn-save">
                {{ saving ? 'Menyimpan...' : (form.editId ? 'Update' : 'Simpan') }}
              </button>
              <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
            </div>
          </form>
        </div>
      </div>

      <div class="table-wrap">
        <table class="reg-table">
          <thead>
            <tr>
              <th style="width:46px;">#</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th style="width:130px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(u, i) in paginated" :key="u.id">
              <tr class="tr-clickable" :class="{ 'tr-expanded': expandedId === u.id }" @click="toggleExpand(u.id)">
                <td class="td-num">{{ (page-1)*PER_PAGE + i + 1 }}</td>
                <td class="td-nama">
                  <div class="nama-cell">
                    <div class="user-avatar" :class="`av-${u.role}`">
                      <img v-if="u.fotoUrl" :src="u.fotoUrl" class="av-img" :alt="u.nama" />
                      <span v-else class="av-initials">{{ initials(u) }}</span>
                    </div>
                    <span class="td-bold">{{ u.nama || '-' }}</span>
                  </div>
                </td>
                <td class="td-email">{{ u.email }}</td>
                <td class="td-role">
                  <span class="role-chip" :class="`role-${u.role}`">{{ ROLE_LABEL[u.role] || u.role }}</span>
                </td>
                <td class="td-aksi">
                  <div class="action-group" @click.stop>
                    <button @click="openForm(u)" class="btn-edit">Edit</button>
                    <button @click="hapus(u)" class="btn-del">Hapus</button>
                    <span class="chevron" :class="{ open: expandedId === u.id }">›</span>
                  </div>
                </td>
              </tr>
              <tr v-if="expandedId === u.id" class="tr-detail">
                <td colspan="5">
                  <div class="expand-body">
                    <div class="expand-label">Hak Akses</div>
                    <template v-if="u.role === 'warga'">
                      <span class="hak-empty-inline">Tidak ada akses ke panel admin</span>
                    </template>
                    <template v-else>
                      <div class="hak-list">
                        <div
                          v-for="item in HAK_AKSES" :key="item.menu"
                          class="hak-row"
                          :class="item[u.role] ? 'row-yes' : 'row-no'"
                        >
                          <span class="hak-ck">{{ item[u.role] ? '✓' : '—' }}</span>
                          <span class="hak-name">{{ item.menu }}</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!filtered.length && !loading">
              <td colspan="5" class="empty">{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada user' }}</td>
            </tr>
            <tr v-if="loading">
              <td colspan="5" class="empty">Memuat...</td>
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
import * as fb from '@/firebase/helpers'
import PaginationBar from '@/components/PaginationBar.vue'
import { exportToExcel } from '@/utils/exportExcel'

const ROLE_LABEL = { admin:'Admin', panitia:'Panitia', warga:'Warga' }

const HAK_AKSES = [
  { menu: '📊 Dashboard',      admin: true,  panitia: true  },
  { menu: '🎨 Tipe Lomba',     admin: true,  panitia: false },
  { menu: '🏷️ Kategori Lomba', admin: true,  panitia: false },
  { menu: '📅 Jadwal',         admin: true,  panitia: true  },
  { menu: '🥇 Klasemen',       admin: true,  panitia: true  },
  { menu: '📋 Registrasi',     admin: true,  panitia: true  },
  { menu: '🏘️ Koridor',        admin: true,  panitia: false },
  { menu: '📍 Lokasi',         admin: true,  panitia: false },
  { menu: '👥 Data User',      admin: true,  panitia: false },
]

const users      = ref([])
const loading    = ref(false)
const saving     = ref(false)
const showForm   = ref(false)
const formError  = ref('')
const search     = ref('')
const page       = ref(1)
const PER_PAGE   = 10
const expandedId = ref(null)
const fotoInput  = ref(null)
const fotoFile   = ref(null)
const fotoPreview = ref(null)

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function initials(u) {
  const name = u.nama || u.email || ''
  return name.slice(0, 2).toUpperCase()
}

function onFotoChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { formError.value = 'Ukuran foto maks 2 MB.'; return }
  fotoFile.value = file
  fotoPreview.value = URL.createObjectURL(file)
  formError.value = ''
  e.target.value = ''
}

function hapusFoto() {
  fotoFile.value = null
  fotoPreview.value = null
}

const filtered  = computed(() => {
  const q = search.value.toLowerCase()
  return users.value.filter(u => !q ||
    (u.nama||'').toLowerCase().includes(q) ||
    (u.email||'').toLowerCase().includes(q) ||
    (u.role||'').toLowerCase().includes(q)
  )
})
const paginated = computed(() => filtered.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))
watch(search, () => { page.value = 1 })

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',    field: (_, i) => i + 1 },
    { label: 'Nama',  field: 'nama' },
    { label: 'Email', field: 'email' },
    { label: 'Role',  field: r => ROLE_LABEL[r.role] || r.role },
  ], 'data-user')
}

const form = reactive({ nama:'', email:'', role:'panitia', password:'', editId:null })

async function fetchUsers() {
  loading.value = true
  try { users.value = await fb.getUsers() } finally { loading.value = false }
}

function openForm(u = null) {
  formError.value = ''
  fotoFile.value = null
  if (u) {
    Object.assign(form, { nama:u.nama, email:u.email, role:u.role, password:'', editId:u.id })
    fotoPreview.value = u.fotoUrl || null
  } else {
    Object.assign(form, { nama:'', email:'', role:'panitia', password:'', editId:null })
    fotoPreview.value = null
  }
  showForm.value = true
}

function resetForm() {
  showForm.value = false
  formError.value = ''
  fotoFile.value = null
  fotoPreview.value = null
  Object.assign(form, { nama:'', email:'', role:'panitia', password:'', editId:null })
}

async function submit() {
  formError.value = ''
  if (!form.nama.trim() || !form.email.trim()) { formError.value = 'Nama dan email wajib diisi.'; return }
  if (!form.editId && !form.password) { formError.value = 'Password wajib diisi untuk user baru.'; return }
  saving.value = true
  try {
    form.editId
      ? await fb.updateUser(form.editId, { email:form.email, password:form.password, role:form.role, nama:form.nama, fotoFile:fotoFile.value })
      : await fb.addUser({ email:form.email, password:form.password, role:form.role, nama:form.nama, fotoFile:fotoFile.value })
    await fetchUsers()
    resetForm()
  } catch (e) {
    formError.value = 'Gagal menyimpan: ' + e.message
  } finally {
    saving.value = false
  }
}

async function hapus(u) {
  if (!confirm(`Hapus user "${u.nama || u.email}"?`)) return
  await fb.deleteUser(u.id)
  await fetchUsers()
}

onMounted(fetchUsers)
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; display:flex; flex-direction:column; gap:24px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow{ font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#CE1126; }
.section-title  { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }
/* modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
.modal-card    { background:#fff; border-radius:20px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.25); }
.modal-hd      { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-ttl     { font:800 18px/1.2 Archivo; color:#1A1613; margin:0; }
.modal-x       { width:32px; height:32px; border-radius:50%; border:none; background:#F0EBE2; color:#5A534B; font:700 16px/1 Archivo; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.modal-x:hover { background:#E2DCD2; }
.modal-bd      { padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px; }

.inline-form { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; align-items:end; }
.form-label  { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req         { color:#CE1126; }
.error-box   { background:#FBEAEC; border:1px solid #F5C9D4; border-radius:12px; padding:12px 14px; font:600 13px/1.4 'Plus Jakarta Sans'; color:#CE1126; }
.btn-save    { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-save:disabled { opacity:.6; cursor:not-allowed; }
.btn-cancel  { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

/* Foto picker */
.foto-field   { }
.foto-picker  { display:flex; align-items:center; gap:16px; }
.foto-preview {
  position:relative; width:80px; height:80px; border-radius:50%;
  border:2px dashed #D8D0C5; background:#F5F2ED;
  cursor:pointer; overflow:hidden; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  transition:border-color .15s;
}
.foto-preview:hover { border-color:#CE1126; }
.foto-preview:hover .foto-overlay { opacity:1; }
.foto-img     { width:100%; height:100%; object-fit:cover; display:block; }
.foto-placeholder { display:flex; flex-direction:column; align-items:center; gap:4px; }
.foto-icon    { font-size:20px; line-height:1; }
.foto-hint    { font:600 9px/1.2 'Plus Jakarta Sans'; color:#9A9389; text-align:center; }
.foto-overlay {
  position:absolute; inset:0; border-radius:50%;
  background:rgba(26,22,19,.5);
  display:flex; align-items:center; justify-content:center;
  font:700 10px/1 'Plus Jakarta Sans'; color:#fff; letter-spacing:.04em;
  opacity:0; transition:opacity .15s;
}
.foto-info    { display:flex; flex-direction:column; gap:8px; }
.foto-desc    { font:500 12px/1.4 'Plus Jakarta Sans'; color:#9A9389; margin:0; }
.btn-hapus-foto { padding:5px 12px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 11px/1 'Plus Jakarta Sans'; cursor:pointer; width:fit-content; }

.table-wrap  { border:1px solid #ECE7DE; border-radius:14px; overflow:hidden; overflow-x:auto; }
.reg-table   { width:100%; border-collapse:collapse; font:500 13px/1.6 'Plus Jakarta Sans'; }
.reg-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.reg-table th { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
.reg-table td { padding:12px 16px; border-bottom:1px solid #F0EBE2; }
.reg-table tbody tr:last-child td { border-bottom:none; }
.reg-table tbody tr:hover { background:#FAF8F3; }
.tr-clickable { cursor:pointer; }
.td-num  { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }

/* Avatar in table */
.nama-cell   { display:flex; align-items:center; gap:10px; }
.user-avatar {
  width:34px; height:34px; border-radius:50%; flex-shrink:0;
  display:flex; align-items:center; justify-content:center;
  overflow:hidden;
}
.av-admin   { background:#FBEAEC; }
.av-panitia { background:#E5EDF7; }
.av-warga   { background:#E7F2EB; }
.av-img     { width:100%; height:100%; object-fit:cover; display:block; }
.av-initials { font:700 12px/1 'Plus Jakarta Sans'; color:#5A534B; }
.av-admin .av-initials   { color:#CE1126; }
.av-panitia .av-initials { color:#2D5B8A; }
.av-warga .av-initials   { color:#2E7D52; }

.td-bold { font:700 14px/1 'Plus Jakarta Sans'; color:#1A1613; }
.role-chip    { display:inline-flex; padding:4px 12px; border-radius:999px; font:700 11px/1 'Plus Jakarta Sans'; }
.role-admin   { background:#FBEAEC; color:#CE1126; }
.role-panitia { background:#E5EDF7; color:#2D5B8A; }
.role-warga   { background:#E7F2EB; color:#2E7D52; }
.action-group { display:flex; gap:6px; align-items:center; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.empty    { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
/* Expand / collapse row */
.tr-expanded td   { border-bottom:none; background:#FAF8F3; }
.tr-detail td     { padding:0; border-bottom:1px solid #F0EBE2; background:#FAF8F3; }
.expand-body      { padding:12px 16px 16px; display:flex; flex-direction:column; gap:10px; }
.expand-label     { font:700 11px/1 'Plus Jakarta Sans'; color:#9A9389; text-transform:uppercase; letter-spacing:.08em; }
.hak-list         { display:flex; flex-direction:column; gap:4px; }
.hak-row          { display:flex; align-items:center; gap:8px; padding:5px 10px; border-radius:8px; }
.row-yes          { background:#F0FAF4; }
.row-no           { background:#F8F6F2; }
.hak-ck           { width:18px; height:18px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font:700 11px/1 Archivo; flex-shrink:0; }
.row-yes .hak-ck  { background:#D1EFD8; color:#2E7D52; }
.row-no  .hak-ck  { background:#E8E3DC; color:#B0A99E; }
.hak-name         { font:500 13px/1 'Plus Jakarta Sans'; color:#1A1613; }
.row-no  .hak-name{ color:#B0A99E; }
.hak-empty-inline { font:500 12px/1 'Plus Jakarta Sans'; color:#9A9389; }
.detail-actions { display:flex; gap:8px; padding-top:12px; border-top:1px solid #E2DCD2; margin-top:4px; }
.detail-actions .btn-edit,
.detail-actions .btn-del { flex:1; padding:10px; text-align:center; font-size:13px; border-radius:10px; }

.chevron      { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; font-size:16px; color:#C9C2B6; transition:transform .2s ease; transform:rotate(0deg); line-height:1; }
.chevron.open { transform:rotate(90deg); color:#CE1126; }

@media (max-width: 767px) {
  .adm-main { padding: 16px 12px 50px; gap: 14px; }
  .adm-section { padding: 14px; border-radius: 14px; }
  .section-header { gap: 10px; margin-bottom: 12px; }
  .section-title { font-size: 18px; margin: 4px 0 0; }
  .section-eyebrow { font-size: 11px; letter-spacing: .08em; }
  .inline-form { padding: 12px; gap: 10px; grid-template-columns: 1fr; }
  .form-label { font-size: 12px; margin-bottom: 6px; }
  .btn-save, .btn-cancel { padding: 9px 12px; font-size: 12px; border-radius: 8px; }
  .btn-edit, .btn-del { padding: 5px 10px; font-size: 11px; border-radius: 6px; }
  .role-chip { font-size: 10px; padding: 3px 8px; }
  .expand-body { padding: 8px 12px 12px; gap: 8px; }
  .hak-row { padding: 4px 8px; }
  .hak-name { font-size: 12px; }
  .error-box { font-size: 12px; padding: 10px 12px; }
  .foto-preview { width: 64px; height: 64px; }

  /* ── Card layout — tabel tanpa scroll horizontal ── */
  .table-wrap { border: none; background: transparent; overflow: visible; border-radius: 0; }
  .reg-table  { display: block; }
  .reg-table thead { display: none; }
  .reg-table tbody { display: flex; flex-direction: column; gap: 8px; }

  .tr-clickable {
    display: grid !important;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "nama role"
      "email aksi";
    column-gap: 10px;
    row-gap: 6px;
    background: #fff;
    border: 1px solid #ECE7DE;
    border-radius: 14px;
    padding: 12px;
  }
  .tr-expanded {
    border-radius: 14px 14px 0 0;
    border-bottom-color: transparent;
  }

  /* Reset td defaults in card mode */
  .tr-clickable td { padding: 0; border: none; background: transparent; }

  .td-num   { display: none; }
  .td-nama  { grid-area: nama; align-self: center; }
  .td-email { grid-area: email; align-self: center; font-size: 11px; color: #9A9389; }
  .td-role  { grid-area: role; align-self: center; display: flex; justify-content: flex-end; }
  .td-aksi  { grid-area: aksi; align-self: center; display: flex; justify-content: flex-end; }

  .user-avatar  { width: 30px; height: 30px; }
  .av-initials  { font-size: 10px; }
  .td-bold      { font-size: 13px; }

  .tr-detail    { display: block !important; }
  .tr-detail td { display: block; padding: 0; border: none; }
  /* Visual: detail row connects to the card above */
  .reg-table tbody .tr-detail {
    border: 1px solid #ECE7DE;
    border-top: none;
    border-radius: 0 0 14px 14px;
    background: #FAF8F3;
    margin-top: -8px;
    padding-top: 0;
  }

  .empty { padding: 18px 12px; font-size: 12px; text-align: center; }
}

@media (min-width: 768px) {
  .adm-main { padding: 28px 20px 70px; }
  .adm-section { padding: 24px; border-radius: 20px; }
  .section-title { font-size: 26px; }
  .section-header { gap: 16px; margin-bottom: 20px; }
  .btn-save, .btn-cancel { padding: 12px; font-size: 13px; }
}
</style>
