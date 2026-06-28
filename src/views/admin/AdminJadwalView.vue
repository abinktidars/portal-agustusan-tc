<template>
  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Manajemen</div>
          <h2 class="section-title">Jadwal Pertandingan</h2>
        </div>
        <button class="tcr-btn-red" @click="openForm()">+ Tambah Jadwal</button>
      </div>

      <form v-if="showForm" @submit.prevent="submit" class="inline-form">
        <div style="grid-column:1/-1;">
          <label class="form-label">Kategori Lomba <span class="req">*</span></label>
          <select v-model="form.cabang" @change="onCabangChange" class="tcr-input">
            <option value="">Pilih kategori lomba...</option>
            <option v-for="k in kategoriStore.list" :key="k.id" :value="k.nama">{{ k.nama }} ({{ k.tipe }})</option>
          </select>
          <p v-if="!kategoriStore.list.length" class="hint">
            Belum ada kategori. <RouterLink :to="{ name:'admin-kategori' }">Tambah di sini →</RouterLink>
          </p>
        </div>
        <div>
          <label class="form-label">Tanggal <span class="req">*</span></label>
          <input v-model="form.tgl" type="date" class="tcr-input" />
        </div>
        <div>
          <label class="form-label">Jam <span class="req">*</span></label>
          <input v-model="form.jam" type="time" class="tcr-input" />
        </div>
        <div>
          <label class="form-label">Status</label>
          <select v-model="form.status" class="tcr-input">
            <option>Akan Datang</option>
            <option>Berlangsung</option>
            <option>Selesai</option>
          </select>
        </div>
        <div style="grid-column:1/-1;">
          <label class="form-label">Peserta</label>
          <input v-model="form.peserta" type="text" class="tcr-input" placeholder="Blok A vs Blok B" />
        </div>
        <div style="grid-column:1/-1;">
          <label class="form-label">Lokasi</label>
          <input v-model="form.lokasi" type="text" class="tcr-input" placeholder="Lapangan Utama" />
        </div>
        <div style="grid-column:1/-1;display:flex;gap:12px;">
          <button type="submit" class="btn-save">{{ form.editId ? 'Update' : 'Simpan' }} Jadwal</button>
          <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
        </div>
      </form>

      <!-- Filter -->
      <div class="filter-bar">
        <div class="tcr-scroll" style="display:flex;gap:8px;flex:1;overflow-x:auto;">
          <button class="chip" :class="{ active: filterStatus==='' }" @click="filterStatus=''">Semua Status</button>
          <button v-for="s in ['Akan Datang','Berlangsung','Selesai']" :key="s"
            class="chip" :class="{ active: filterStatus===s }" @click="filterStatus=s">{{ s }}</button>
        </div>
        <span class="filter-count">{{ filtered.length }} jadwal</span>
      </div>

      <div class="card-grid">
        <div v-for="j in filtered" :key="j.id" class="item-card">
          <div class="item-card-header">
            <div style="display:flex;align-items:center;gap:7px;">
              <span class="dot" :style="{ background: tipeColor(j.kat) }"></span>
              <span class="item-nama">{{ j.cabang }}</span>
            </div>
            <span class="status-badge" :class="statusCls(j.status)">{{ j.status }}</span>
          </div>
          <div class="item-meta">📅 {{ j.tgl }} · 🕐 {{ j.jam }}</div>
          <div v-if="j.peserta" class="item-sub">👥 {{ j.peserta }}</div>
          <div v-if="j.lokasi || j.venue" class="item-sub">📍 {{ j.lokasi || j.venue }}</div>
          <div class="item-actions">
            <button @click="openForm(j)" class="btn-edit">Edit</button>
            <button @click="hapus(j)" class="btn-del">Hapus</button>
          </div>
        </div>
        <div v-if="!filtered.length" class="empty" style="grid-column:1/-1;">Belum ada jadwal</div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useKategoriStore } from '@/stores/useKategori'
import { useJadwalStore }   from '@/stores/useJadwal'
import { useTipeStore }     from '@/stores/useTipe'

const kategoriStore = useKategoriStore()
const jadwalStore   = useJadwalStore()
const tipeStore     = useTipeStore()
const showForm      = ref(false)
const filterStatus  = ref('')
const form = reactive({ cabang:'', kat:'', tgl:'', jam:'', peserta:'', lokasi:'', status:'Akan Datang', editId:null })

const tipeColor = (t) => tipeStore.warna(t)
const statusCls  = (s) => ({ 'Berlangsung':'status-berlangsung', 'Selesai':'status-selesai', 'Akan Datang':'status-akandatang' }[s] || 'status-akandatang')

const filtered = computed(() => jadwalStore.list.filter(j => !filterStatus.value || j.status === filterStatus.value))

function onCabangChange() {
  const found = kategoriStore.list.find(k => k.nama === form.cabang)
  form.kat = found ? found.tipe : ''
}

function toInputDate(d) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

function openForm(j = null) {
  if (j) Object.assign(form, { cabang:j.cabang, kat:j.kat||'', tgl:toInputDate(j.tglDate)||j.tgl, jam:j.jam, peserta:j.peserta||'', lokasi:j.lokasi||j.venue||'', status:j.status, editId:j.id })
  else   Object.assign(form, { cabang:'', kat:'', tgl:'', jam:'', peserta:'', lokasi:'', status:'Akan Datang', editId:null })
  showForm.value = true
}
function resetForm() {
  showForm.value = false
  Object.assign(form, { cabang:'', kat:'', tgl:'', jam:'', peserta:'', lokasi:'', status:'Akan Datang', editId:null })
}
async function submit() {
  if (!form.cabang || !form.tgl || !form.jam) return
  const { editId, ...payload } = form
  editId ? await jadwalStore.update(editId, payload) : await jadwalStore.add(payload)
  resetForm()
}
function hapus(j) {
  if (confirm(`Hapus jadwal "${j.cabang}" (${j.tgl})?`)) jadwalStore.remove(j.id)
}
onMounted(() => { tipeStore.fetch(); kategoriStore.fetch(); jadwalStore.fetch() })
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow{ font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#CE1126; }
.section-title  { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }

.inline-form { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; align-items:end; }
.form-label  { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req { color:#CE1126; }
.hint { font:500 12px/1 'Plus Jakarta Sans'; color:#9A9389; margin:6px 0 0; }
.hint a { color:#CE1126; }
.btn-save   { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-cancel { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

.filter-bar   { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
.filter-count { font:600 13px/1 'Plus Jakarta Sans'; color:#7A7368; flex-shrink:0; }

.card-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
.item-card  { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:14px; padding:16px; }
.item-card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:10px; }
.item-nama  { font:800 15px/1.2 Archivo; color:#1A1613; }
.item-meta  { font:600 13px/1.4 'Plus Jakarta Sans'; color:#7A7368; margin-bottom:6px; }
.item-sub   { font:500 12px/1.4 'Plus Jakarta Sans'; color:#5A534B; margin-bottom:5px; }
.item-actions { display:flex; gap:8px; margin-top:12px; }
.dot  { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; margin-top:2px; }
.btn-edit { flex:1; padding:8px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { flex:1; padding:8px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.empty    { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
</style>
