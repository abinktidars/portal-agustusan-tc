<template>
  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Master Data</div>
          <h2 class="section-title">Kategori Lomba</h2>
        </div>
        <button class="tcr-btn-red" @click="openForm()">+ Tambah Kategori</button>
      </div>

      <form v-if="showForm" @submit.prevent="submit" class="inline-form">
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
          <label class="form-label">Urutan Tampil</label>
          <input v-model.number="form.urutan" type="number" min="1" class="tcr-input" />
        </div>
        <div style="grid-column:1/-1;display:flex;gap:12px;">
          <button type="submit" class="btn-save">{{ form.editId ? 'Update' : 'Simpan' }}</button>
          <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
        </div>
      </form>

      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:46px;">#</th>
              <th>Nama Lomba</th>
              <th>Tipe</th>
              <th style="width:90px;text-align:center;">Urutan</th>
              <th style="width:130px;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(k, i) in store.list" :key="k.id">
              <td class="td-num">{{ i + 1 }}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="dot" :style="{ background: tipeColor(k.tipe) }"></span>
                  <span class="td-bold">{{ k.nama }}</span>
                </div>
              </td>
              <td>
                <span class="tipe-badge" :style="{ background: tipeBg(k.tipe), color: tipeColor(k.tipe) }">{{ k.tipe }}</span>
              </td>
              <td class="td-num">{{ k.urutan }}</td>
              <td>
                <div class="action-group">
                  <button @click="openForm(k)" class="btn-edit">Edit</button>
                  <button @click="hapus(k)" class="btn-del">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="!store.list.length">
              <td colspan="5" class="empty">Belum ada kategori. Tambahkan dulu sebelum membuat jadwal.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useKategoriStore } from '@/stores/useKategori'
import { useTipeStore }     from '@/stores/useTipe'

const store     = useKategoriStore()
const tipeStore = useTipeStore()
const showForm  = ref(false)
const form      = reactive({ nama:'', tipe:'', urutan:1, editId:null })

const tipeColor = (t) => tipeStore.warna(t)
const tipeBg    = (t) => tipeStore.bg(t)

function openForm(k = null) {
  const defaultTipe = tipeStore.list[0]?.nama || ''
  k ? Object.assign(form, { nama:k.nama, tipe:k.tipe, urutan:k.urutan||1, editId:k.id })
    : Object.assign(form, { nama:'', tipe:defaultTipe, urutan:store.list.length+1, editId:null })
  showForm.value = true
}
function resetForm() {
  showForm.value = false
  Object.assign(form, { nama:'', tipe:'', urutan:1, editId:null })
}
async function submit() {
  if (!form.nama.trim()) return
  const p = { nama:form.nama.trim(), tipe:form.tipe, urutan:form.urutan||1 }
  form.editId ? await store.update(form.editId, p) : await store.add(p)
  resetForm()
}
function hapus(k) {
  if (confirm(`Hapus kategori "${k.nama}"?`)) store.remove(k.id)
}
onMounted(() => { tipeStore.fetch(); store.fetch() })
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow{ font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#2D5B8A; }
.section-title  { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }

.inline-form { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; align-items:end; }
.form-label  { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req         { color:#CE1126; }
.btn-save    { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-cancel  { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

.data-table-wrap { border:1px solid #ECE7DE; border-radius:14px; overflow:hidden; }
.data-table  { width:100%; border-collapse:collapse; font:500 13px/1.5 'Plus Jakarta Sans'; }
.data-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.data-table th { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; }
.data-table td { padding:14px 16px; border-bottom:1px solid #F0EBE2; }
.data-table tbody tr:last-child td { border-bottom:none; }
.data-table tbody tr:hover { background:#FAF8F3; }
.td-num  { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold { font:700 14px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.dot     { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; }
.tipe-badge { padding:4px 10px; border-radius:999px; font:600 11px/1 'Plus Jakarta Sans'; }
.action-group { display:flex; gap:6px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.empty    { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
</style>
