<template>
  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Manajemen</div>
          <h2 class="section-title">Data User</h2>
        </div>
        <button class="tcr-btn-red" @click="openForm()">+ Tambah User</button>
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
            <tr v-for="(u, i) in users" :key="u.id">
              <td class="td-num">{{ i + 1 }}</td>
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
            <tr v-if="!users.length && !loading">
              <td colspan="5" class="empty">Belum ada user</td>
            </tr>
            <tr v-if="loading">
              <td colspan="5" class="empty">Memuat...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as fb from '@/firebase/helpers'

const ROLE_LABEL = { admin:'Admin', panitia:'Panitia', warga:'Warga' }

const users     = ref([])
const loading   = ref(false)
const saving    = ref(false)
const showForm  = ref(false)
const formError = ref('')
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
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
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
</style>
