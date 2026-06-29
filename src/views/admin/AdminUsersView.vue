<template>
  <main class="adm-main">

    <!-- Panel Hak Akses -->
    <div class="adm-section hak-section">
      <div class="section-eyebrow">Referensi</div>
      <h2 class="section-title" style="margin:8px 0 20px;">Hak Akses per Role</h2>
      <div class="hak-table-wrap">
        <table class="hak-table">
          <thead>
            <tr>
              <th>Menu</th>
              <th class="th-role">Admin</th>
              <th class="th-role">Panitia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in HAK_AKSES" :key="item.menu">
              <td class="menu-col">{{ item.menu }}</td>
              <td class="role-col"><span :class="item.admin ? 'ck ck-yes' : 'ck ck-no'">{{ item.admin ? '✓' : '—' }}</span></td>
              <td class="role-col"><span :class="item.panitia ? 'ck ck-yes' : 'ck ck-no'">{{ item.panitia ? '✓' : '—' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="hak-note">Role <strong>Warga</strong> tidak memiliki akses ke panel admin.</p>
    </div>

    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Manajemen</div>
          <h2 class="section-title">Data User</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari user..." />
          <button class="btn-export" @click="doExport">Export Excel</button>
          <button class="tcr-btn-red" @click="openForm()">+ Tambah User</button>
        </div>
      </div>

      <form v-if="showForm" @submit.prevent="submit" class="inline-form">
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
        <div v-if="formError" style="grid-column:1/-1;">
          <div class="error-box">{{ formError }}</div>
        </div>
        <div style="grid-column:1/-1;display:flex;gap:12px;">
          <button type="submit" :disabled="saving" class="btn-save">
            {{ saving ? 'Menyimpan...' : (form.editId ? 'Update' : 'Simpan') }}
          </button>
          <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
        </div>
      </form>

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
            <tr v-for="(u, i) in paginated" :key="u.id">
              <td class="td-num">{{ (page-1)*PER_PAGE + i + 1 }}</td>
              <td class="td-bold">{{ u.nama || '-' }}</td>
              <td>{{ u.email }}</td>
              <td>
                <span class="role-chip" :class="`role-${u.role}`">{{ ROLE_LABEL[u.role] || u.role }}</span>
              </td>
              <td>
                <div class="action-group">
                  <button @click="openForm(u)" class="btn-edit">Edit</button>
                  <button @click="hapus(u)" class="btn-del">Hapus</button>
                </div>
              </td>
            </tr>
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

const users     = ref([])
const loading   = ref(false)
const saving    = ref(false)
const showForm  = ref(false)
const formError = ref('')
const search    = ref('')
const page      = ref(1)
const PER_PAGE  = 10

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
const form      = reactive({ nama:'', email:'', role:'panitia', password:'', editId:null })

async function fetchUsers() {
  loading.value = true
  try { users.value = await fb.getUsers() } finally { loading.value = false }
}

function openForm(u = null) {
  formError.value = ''
  u ? Object.assign(form, { nama:u.nama, email:u.email, role:u.role, password:'', editId:u.id })
    : Object.assign(form, { nama:'', email:'', role:'panitia', password:'', editId:null })
  showForm.value = true
}
function resetForm() {
  showForm.value = false
  formError.value = ''
  Object.assign(form, { nama:'', email:'', role:'panitia', password:'', editId:null })
}

async function submit() {
  formError.value = ''
  if (!form.nama.trim() || !form.email.trim()) { formError.value = 'Nama dan email wajib diisi.'; return }
  if (!form.editId && !form.password) { formError.value = 'Password wajib diisi untuk user baru.'; return }
  saving.value = true
  try {
    form.editId
      ? await fb.updateUser(form.editId, { email:form.email, password:form.password, role:form.role, nama:form.nama })
      : await fb.addUser({ email:form.email, password:form.password, role:form.role, nama:form.nama })
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
.inline-form { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; align-items:end; }
.form-label  { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req         { color:#CE1126; }
.error-box   { background:#FBEAEC; border:1px solid #F5C9D4; border-radius:12px; padding:12px 14px; font:600 13px/1.4 'Plus Jakarta Sans'; color:#CE1126; }
.btn-save    { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-save:disabled { opacity:.6; cursor:not-allowed; }
.btn-cancel  { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.table-wrap  { border:1px solid #ECE7DE; border-radius:14px; overflow:hidden; overflow-x:auto; }
.reg-table   { width:100%; border-collapse:collapse; font:500 13px/1.6 'Plus Jakarta Sans'; }
.reg-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.reg-table th { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
.reg-table td { padding:14px 16px; border-bottom:1px solid #F0EBE2; }
.reg-table tbody tr:last-child td { border-bottom:none; }
.reg-table tbody tr:hover { background:#FAF8F3; }
.td-num  { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold { font:700 14px/1 'Plus Jakarta Sans'; color:#1A1613; }
.role-chip    { display:inline-flex; padding:4px 12px; border-radius:999px; font:700 11px/1 'Plus Jakarta Sans'; }
.role-admin   { background:#FBEAEC; color:#CE1126; }
.role-panitia { background:#E5EDF7; color:#2D5B8A; }
.role-warga   { background:#E7F2EB; color:#2E7D52; }
.action-group { display:flex; gap:6px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.empty    { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
.header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.search-input   { width:220px; }
.btn-export     { padding:10px 18px; border:1.5px solid #2E7D52; border-radius:10px; background:#fff; color:#2E7D52; font:700 13px/1 'Plus Jakarta Sans'; cursor:pointer; white-space:nowrap; transition:background .15s; }
.btn-export:hover { background:#E7F2EB; }

/* Hak Akses panel */
.hak-section    { margin-bottom:24px; }
.hak-table-wrap { border:1px solid #ECE7DE; border-radius:14px; overflow:hidden; display:inline-block; min-width:360px; }
.hak-table      { border-collapse:collapse; font:500 13px/1.5 'Plus Jakarta Sans'; }
.hak-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.hak-table th   { padding:10px 18px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; }
.th-role        { text-align:center; min-width:90px; }
.hak-table td   { padding:11px 18px; border-bottom:1px solid #F0EBE2; }
.hak-table tbody tr:last-child td { border-bottom:none; }
.menu-col       { font:600 13px/1 'Plus Jakarta Sans'; color:#1A1613; }
.role-col       { text-align:center; }
.ck             { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; font:700 13px/1 Archivo; }
.ck-yes         { background:#E7F2EB; color:#2E7D52; }
.ck-no          { background:#F5F2ED; color:#C9C2B6; }
.hak-note       { font:500 12px/1.5 'Plus Jakarta Sans'; color:#9A9389; margin-top:12px; }

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
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .reg-table { min-width: 480px; }
  .reg-table th { padding: 9px 10px; font-size: 10px; }
  .reg-table td { padding: 9px 10px; font-size: 12px; }
  .td-bold { font-size: 12px; }
  .td-num { font-size: 11px; }
  .empty { padding: 18px 12px; font-size: 12px; }
  .header-actions { gap: 8px; width: 100%; }
  .search-input { width: 100%; min-width: 0; }
  .btn-export { padding: 8px 12px; font-size: 12px; }
  .role-chip { font-size: 10px; padding: 3px 8px; }
  .hak-section { margin-bottom: 14px; }
  .hak-table-wrap { min-width: unset; width: 100%; }
  .hak-table th { padding: 8px 12px; font-size: 10px; }
  .hak-table td { padding: 9px 12px; font-size: 12px; }
  .menu-col { font-size: 12px; }
  .hak-note { font-size: 11px; }
  .error-box { font-size: 12px; padding: 10px 12px; }
}

@media (min-width: 768px) {
  .adm-main { padding: 28px 20px 70px; }
  .adm-section { padding: 24px; border-radius: 20px; }
  .section-title { font-size: 26px; }
  .section-header { gap: 16px; margin-bottom: 20px; }
  .btn-save, .btn-cancel { padding: 12px; font-size: 13px; }
}
</style>
