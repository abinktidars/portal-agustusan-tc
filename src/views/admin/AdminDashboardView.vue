<template>
  <main class="dash-main">

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card" v-for="s in statCards" :key="s.label">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-val" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="stat-sub">{{ s.subtitle }}</div>
      </div>
    </div>

    <!-- Jadwal section -->
    <section class="admin-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Manajemen</div>
          <h2 class="section-title">Jadwal Pertandingan</h2>
        </div>
        <button class="tcr-btn-red" @click="showJadwalForm = !showJadwalForm">+ Tambah Jadwal</button>
      </div>

      <form v-if="showJadwalForm" @submit.prevent="submitJadwal" class="inline-form">
        <div style="grid-column:1/-1;">
          <label class="form-label">Cabang Lomba <span class="req">*</span></label>
          <select v-model="jadwalForm.cabang" class="tcr-input">
            <option value="">Pilih cabang...</option>
            <option v-for="c in CABANG_LIST" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Tanggal <span class="req">*</span></label>
          <input type="date" v-model="jadwalForm.tgl" class="tcr-input" />
        </div>
        <div>
          <label class="form-label">Jam <span class="req">*</span></label>
          <input type="time" v-model="jadwalForm.jam" class="tcr-input" />
        </div>
        <div>
          <label class="form-label">Status</label>
          <select v-model="jadwalForm.status" class="tcr-input">
            <option>Akan Datang</option><option>Berlangsung</option><option>Selesai</option>
          </select>
        </div>
        <div style="grid-column:1/-1;">
          <label class="form-label">Peserta</label>
          <input type="text" v-model="jadwalForm.peserta" class="tcr-input" placeholder="Blok A vs Blok B" />
        </div>
        <div style="grid-column:1/-1;">
          <label class="form-label">Lokasi</label>
          <input type="text" v-model="jadwalForm.lokasi" class="tcr-input" placeholder="Lapangan Utama" />
        </div>
        <div style="grid-column:1/-1;display:flex;gap:12px;">
          <button type="submit" class="btn-green">Simpan Jadwal</button>
          <button type="button" class="btn-cancel" @click="showJadwalForm = false">Batal</button>
        </div>
      </form>

      <div class="card-grid">
        <div v-for="j in jadwalStore.list" :key="j.id" class="item-card">
          <div class="item-card-header">
            <div class="item-nama">{{ j.cabang }}</div>
            <span class="badge-red">{{ j.status }}</span>
          </div>
          <div class="item-meta">📅 {{ j.tgl }} · 🕐 {{ j.jam }}</div>
          <div v-if="j.peserta" class="item-sub">{{ j.peserta }}</div>
          <div v-if="j.lokasi || j.venue" class="item-sub">📍 {{ j.lokasi || j.venue }}</div>
          <div class="item-actions">
            <button @click="editJadwal(j)" class="btn-action">Edit</button>
            <button @click="jadwalStore.remove(j.id)" class="btn-action">Hapus</button>
          </div>
        </div>
        <div v-if="!jadwalStore.list.length" class="empty">Belum ada jadwal.</div>
      </div>
    </section>

    <!-- Hasil section -->
    <section class="admin-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow" style="color:#2E7D52;">Hasil</div>
          <h2 class="section-title">Hasil Pertandingan</h2>
        </div>
        <button style="background:#2E7D52;" class="tcr-btn-red" @click="showHasilForm = !showHasilForm">+ Tambah Hasil</button>
      </div>

      <form v-if="showHasilForm" @submit.prevent="submitHasil" class="inline-form">
        <div style="grid-column:1/-1;">
          <label class="form-label">Cabang Lomba <span class="req">*</span></label>
          <select v-model="hasilForm.cabang" class="tcr-input">
            <option value="">Pilih cabang...</option>
            <option v-for="c in CABANG_LIST" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Tanggal <span class="req">*</span></label>
          <input type="date" v-model="hasilForm.tgl" class="tcr-input" />
        </div>
        <div>
          <label class="form-label">Tim A <span class="req">*</span></label>
          <input type="text" v-model="hasilForm.timA" class="tcr-input" placeholder="Blok A" />
        </div>
        <div>
          <label class="form-label">Tim B <span class="req">*</span></label>
          <input type="text" v-model="hasilForm.timB" class="tcr-input" placeholder="Blok B" />
        </div>
        <div>
          <label class="form-label">Skor <span class="req">*</span></label>
          <input type="text" v-model="hasilForm.skor" class="tcr-input" placeholder="1 — 2" />
        </div>
        <div>
          <label class="form-label">Juara <span class="req">*</span></label>
          <input type="text" v-model="hasilForm.juara" class="tcr-input" placeholder="Blok B" />
        </div>
        <div style="grid-column:1/-1;display:flex;gap:12px;">
          <button type="submit" class="btn-green">Simpan Hasil</button>
          <button type="button" class="btn-cancel" @click="showHasilForm = false">Batal</button>
        </div>
      </form>

      <div class="card-grid">
        <div v-for="h in hasilStore.list" :key="h.id" class="item-card">
          <div class="item-nama">{{ h.cabang }}</div>
          <div class="item-meta">📅 {{ h.tgl }}</div>
          <div class="skor-display">{{ h.timA }} <span style="color:#7A7368;">{{ h.skor }}</span> {{ h.timB }}</div>
          <div class="juara-display">🏆 {{ h.juara }}</div>
          <div class="item-actions">
            <button @click="hasilStore.remove(h.id)" class="btn-action">Hapus</button>
          </div>
        </div>
        <div v-if="!hasilStore.list.length" class="empty">Belum ada hasil.</div>
      </div>
    </section>

    <!-- Registrasi table -->
    <section class="admin-section">
      <div>
        <div class="section-eyebrow" style="color:#9A6B12;">Data</div>
        <h2 class="section-title">Daftar Registrasi Peserta</h2>
      </div>
      <div class="table-wrap">
        <table class="reg-table">
          <thead>
            <tr>
              <th>Nama</th><th>No. WA</th><th>Blok</th><th>Cabang</th><th>Tgl Daftar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in regStore.list" :key="r.id">
              <td>{{ r.nama }}</td>
              <td><a :href="`https://wa.me/${r.wa}`" target="_blank" class="wa-link">{{ r.wa }}</a></td>
              <td>{{ r.blok || r.blokRumah }}</td>
              <td><span class="cabang-badge">{{ r.cabang }}</span></td>
              <td>{{ formatDate(r.tglDate || r.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!regStore.list.length" class="empty" style="padding:24px;">Belum ada pendaftar.</div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useJadwalStore }    from '@/stores/useJadwal'
import { useHasilStore }     from '@/stores/useHasil'
import { useRegistrasiStore } from '@/stores/useRegistrasi'

const jadwalStore = useJadwalStore()
const hasilStore  = useHasilStore()
const regStore    = useRegistrasiStore()

const CABANG_LIST = ['Voli Putra','Voli Putri','Badminton Beregu','Futsal Anak','Mobile Legends','Balap Karung','Tarik Tambang','Makan Kerupuk','Balap Kelereng','Panjat Pinang']

const showJadwalForm = ref(false)
const showHasilForm  = ref(false)

const jadwalForm = reactive({ cabang:'', tgl:'', jam:'', peserta:'', lokasi:'', status:'Akan Datang', editId: null })
const hasilForm  = reactive({ cabang:'', tgl:'', timA:'', timB:'', skor:'', juara:'' })

const statCards = computed(() => [
  { label:'Jadwal Terjadwal', value: jadwalStore.list.length, color:'#CE1126', subtitle:'Pertandingan' },
  { label:'Hasil Tercatat',   value: hasilStore.list.length,  color:'#2E7D52', subtitle:'Pertandingan' },
  { label:'Pendaftar',        value: regStore.list.length,    color:'#9A6B12', subtitle:'Peserta' },
  { label:'Status',           value: '✓ Aktif',               color:'#2D5B8A', subtitle:'Admin Panel' },
])

const formatDate = (d) => {
  if (!d) return '-'
  const dt = d?.seconds ? new Date(d.seconds * 1000) : new Date(d)
  return dt.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
}

async function submitJadwal() {
  if (!jadwalForm.cabang || !jadwalForm.tgl || !jadwalForm.jam) return
  if (jadwalForm.editId) {
    await jadwalStore.update(jadwalForm.editId, { ...jadwalForm })
    jadwalForm.editId = null
  } else {
    await jadwalStore.add({ ...jadwalForm })
  }
  Object.assign(jadwalForm, { cabang:'', tgl:'', jam:'', peserta:'', lokasi:'', status:'Akan Datang', editId: null })
  showJadwalForm.value = false
}

function editJadwal(j) {
  Object.assign(jadwalForm, { cabang: j.cabang, tgl: j.tgl, jam: j.jam, peserta: j.peserta||'', lokasi: j.lokasi||j.venue||'', status: j.status, editId: j.id })
  showJadwalForm.value = true
}

async function submitHasil() {
  if (!hasilForm.cabang || !hasilForm.tgl || !hasilForm.timA || !hasilForm.timB || !hasilForm.skor || !hasilForm.juara) return
  await hasilStore.add({ ...hasilForm })
  Object.assign(hasilForm, { cabang:'', tgl:'', timA:'', timB:'', skor:'', juara:'' })
  showHasilForm.value = false
}

onMounted(() => {
  jadwalStore.fetch()
  hasilStore.fetch()
  regStore.fetch()
})
</script>

<style scoped>
.dash-main { max-width: 1180px; margin: 0 auto; padding: 34px 22px 70px; }
.stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 34px; }
.stat-card  { background: #fff; border: 1px solid #ECE7DE; border-radius: 16px; padding: 20px; text-align: center; }
.stat-label { font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .1em; text-transform: uppercase; color: #7A7368; margin-bottom: 10px; }
.stat-val   { font: 800 36px/1 Archivo; margin-bottom: 6px; }
.stat-sub   { font: 500 12px/1 'Plus Jakarta Sans'; color: #A89F94; }
.admin-section  { background: #fff; border: 1px solid #ECE7DE; border-radius: 20px; padding: 28px; margin-bottom: 28px; }
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
.section-eyebrow{ font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.section-title  { margin: 9px 0 0; font: 800 30px/1.05 Archivo; color: #1A1613; }
.inline-form { background: #FAF8F3; border: 1px solid #E2DCD2; border-radius: 16px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 16px; align-items: end; }
.form-label { display: block; font: 700 13px/1 'Plus Jakarta Sans'; color: #1A1613; margin-bottom: 8px; }
.req { color: #CE1126; }
.btn-green  { flex:1; padding:13px; border:none; border-radius:12px; background:#2E7D52; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-cancel { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.card-grid  { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 14px; }
.item-card  { background: #FAF8F3; border: 1px solid #E2DCD2; border-radius: 14px; padding: 16px; }
.item-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.item-nama  { font: 800 15px/1.2 Archivo; color: #1A1613; }
.item-meta  { font: 600 13px/1.4 'Plus Jakarta Sans'; color: #7A7368; margin-bottom: 8px; }
.item-sub   { font: 500 12px/1.4 'Plus Jakarta Sans'; color: #5A534B; margin-bottom: 8px; }
.item-actions { display: flex; gap: 8px; margin-top: 12px; }
.btn-action { flex:1; padding:8px; border:1px solid #E2DCD2; border-radius:8px; background:transparent; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.badge-red  { display:inline-flex; padding:4px 10px; border-radius:999px; background:#FBEAEC; font:600 11px/1 'Plus Jakarta Sans'; color:#CE1126; white-space:nowrap; }
.skor-display { background:#fff; border-radius:10px; padding:10px; margin-bottom:12px; text-align:center; font:800 18px/1 Archivo; color:#CE1126; }
.juara-display{ padding:8px 12px; background:#E7F2EB; border-radius:8px; text-align:center; font:700 12px/1.4 'Plus Jakarta Sans'; color:#2E7D52; margin-bottom:12px; }
.table-wrap { overflow-x: auto; border: 1px solid #ECE7DE; border-radius: 14px; }
.reg-table  { width: 100%; border-collapse: collapse; font: 500 13px/1.6 'Plus Jakarta Sans'; }
.reg-table thead tr { background: #FAF8F3; border-bottom: 1px solid #ECE7DE; }
.reg-table th { padding: 14px; text-align: left; font: 700 12px/1 'Plus Jakarta Sans'; color: #1A1613; }
.reg-table td { padding: 14px; border-bottom: 1px solid #ECE7DE; }
.wa-link    { color: #CE1126; text-decoration: none; font: 600 13px/1 'Plus Jakarta Sans'; }
.cabang-badge { display:inline-flex; padding:4px 10px; border-radius:6px; background:#FCE7EA; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; }
.empty { padding: 32px; text-align: center; color: #9A9389; font: 500 14px/1 'Plus Jakarta Sans'; }
@media(max-width:767px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
</style>
