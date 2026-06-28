<template>
  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Master Data</div>
          <h2 class="section-title">Tipe Lomba</h2>
        </div>
        <button class="tcr-btn-red" @click="openForm()">+ Tambah Tipe</button>
      </div>

      <form v-if="showForm" @submit.prevent="submit" class="inline-form">
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
        <div style="grid-column:1/-1;">
          <label class="form-label">Preview</label>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="tipe-badge" :style="{ background: bgFromWarna(form.warna), color: form.warna }">
              {{ form.nama || 'Nama Tipe' }}
            </span>
            <span class="dot-preview" :style="{ background: form.warna }"></span>
            <span style="font:500 13px/1 'Plus Jakarta Sans';color:#7A7368;">Tampil seperti ini di kategori &amp; jadwal</span>
          </div>
        </div>
        <div style="grid-column:1/-1;display:flex;gap:12px;">
          <button type="submit" class="btn-save">{{ form.editId ? 'Update' : 'Simpan' }} Tipe</button>
          <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
        </div>
      </form>

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
            <tr v-for="(t, i) in store.list" :key="t.id">
              <td class="td-num">{{ i + 1 }}</td>
              <td class="td-bold">{{ t.nama }}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="color-swatch" :style="{ background: t.warna }"></span>
                  <code class="color-code">{{ t.warna }}</code>
                </div>
              </td>
              <td>
                <span class="tipe-badge" :style="{ background: store.bg(t.nama), color: t.warna }">{{ t.nama }}</span>
              </td>
              <td class="td-num">{{ t.urutan }}</td>
              <td>
                <div class="action-group">
                  <button @click="openForm(t)" class="btn-edit">Edit</button>
                  <button @click="hapus(t)" class="btn-del">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="!store.list.length">
              <td colspan="6" class="empty">Belum ada tipe lomba</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="info-note">
        💡 Tipe lomba digunakan untuk mengelompokkan kategori lomba dan menentukan warna tampilan di portal.
      </p>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useTipeStore } from '@/stores/useTipe'

const store    = useTipeStore()
const showForm = ref(false)
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

async function submit() {
  if (!form.nama.trim() || !form.warna) return
  const bg = bgFromWarna(form.warna)
  const payload = { nama:form.nama.trim(), warna:form.warna, bg, urutan:form.urutan||1 }
  form.editId ? await store.update(form.editId, payload) : await store.add(payload)
  resetForm()
}

function hapus(t) {
  if (confirm(`Hapus tipe "${t.nama}"? Kategori yang menggunakan tipe ini tidak ikut terhapus.`)) store.remove(t.id)
}

onMounted(() => store.fetch())
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow{ font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#CE1126; }
.section-title  { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }

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

.data-table-wrap { border:1px solid #ECE7DE; border-radius:14px; overflow:hidden; overflow-x:auto; }
.data-table  { width:100%; border-collapse:collapse; font:500 13px/1.5 'Plus Jakarta Sans'; min-width:560px; }
.data-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.data-table th { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; }
.data-table td { padding:14px 16px; border-bottom:1px solid #F0EBE2; vertical-align:middle; }
.data-table tbody tr:last-child td { border-bottom:none; }
.data-table tbody tr:hover { background:#FAF8F3; }
.td-num     { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold    { font:700 14px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.color-swatch { width:20px; height:20px; border-radius:6px; display:inline-block; flex-shrink:0; }
.color-code { font:600 12px/1 monospace; color:#5A534B; background:#F0EBE2; padding:3px 7px; border-radius:6px; }
.action-group { display:flex; gap:6px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.empty    { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
.info-note { font:500 13px/1.5 'Plus Jakarta Sans'; color:#9A9389; margin:16px 0 0; }
</style>
