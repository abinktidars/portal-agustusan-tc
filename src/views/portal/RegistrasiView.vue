<template>
  <div>
    <div class="eyebrow">Registrasi Lomba</div>
    <h2 class="page-title">Daftarkan Peserta</h2>

    <div class="reg-grid">
      <!-- Form -->
      <div class="form-card">
        <div v-if="regStore.submitted" class="success-box">
          <div class="success-icon">✓</div>
          <div>
            <div class="success-title">Pendaftaran Berhasil!</div>
            <div class="success-desc">
              Pendaftaran sudah masuk. Panitia akan menghubungi via WhatsApp untuk konfirmasi &amp; technical meeting. Sampai jumpa di lapangan! 🇮🇩
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-grid">

            <!-- 1. Cabang Lomba -->
            <div style="grid-column:1/-1;">
              <label class="form-label">Cabang Lomba <span class="req">*</span></label>
              <select v-model="form.cabang" class="tcr-input" :disabled="kategoriStore.loading">
                <option value="">{{ kategoriStore.loading ? 'Memuat daftar lomba…' : 'Pilih cabang lomba…' }}</option>
                <option v-for="k in kategoriStore.list" :key="k.id" :value="k.nama">{{ k.nama }}</option>
              </select>
            </div>

            <!-- 2. Koridor + Blok Rumah + No. WA (selalu tampil setelah cabang dipilih) -->
            <template v-if="form.cabang">
              <div>
                <label class="form-label">Koridor <span class="req">*</span></label>
                <select v-model="form.koridorId" class="tcr-input" :disabled="koridorStore.loading">
                  <option value="">{{ koridorStore.loading ? 'Memuat koridor…' : 'Pilih koridor…' }}</option>
                  <option v-for="k in koridorStore.list" :key="k.id" :value="k.id">{{ k.nama }}</option>
                </select>
              </div>
              <div>
                <label class="form-label">Blok Rumah <span class="req">*</span></label>
                <input v-model="form.blokRumah" class="tcr-input" placeholder="Contoh: A1, B12" />
              </div>
              <div style="grid-column:1/-1;">
                <label class="form-label">No. WhatsApp <span class="req">*</span></label>
                <input v-model="form.wa" class="tcr-input" placeholder="0812xxxx" type="tel" />
              </div>

              <!-- Mode badge -->
              <div style="grid-column:1/-1;">
                <div class="mode-badge" :class="isTeam ? 'mode-tim' : 'mode-perorangan'">
                  <span class="mode-icon">{{ isTeam ? '👥' : '🙋' }}</span>
                  <div>
                    <div class="mode-title">{{ isTeam ? 'Daftar sebagai Ketua Tim' : 'Daftar Perorangan' }}</div>
                    <div class="mode-desc">{{ isTeam ? 'Cabang ini didaftarkan oleh ketua tim beserta daftar anggota.' : 'Cabang ini bisa didaftarkan langsung per peserta.' }}</div>
                  </div>
                </div>
              </div>

              <!-- PERORANGAN: Nama Peserta -->
              <div v-if="!isTeam" style="grid-column:1/-1;">
                <label class="form-label">Nama Peserta <span class="req">*</span></label>
                <input v-model="form.nama" class="tcr-input" placeholder="Nama lengkap peserta" />
              </div>

              <!-- TIM: Nama Regu + Nama Ketua -->
              <template v-if="isTeam">
                <div style="grid-column:1/-1;">
                  <label class="form-label">Nama Tim / Regu <span class="req">*</span></label>
                  <input v-model="form.namaRegu" class="tcr-input" placeholder="cth: Tim Merah Putih, Blok Anggrek" />
                </div>
                <div style="grid-column:1/-1;">
                  <label class="form-label">Nama Ketua Tim <span class="req">*</span></label>
                  <input v-model="form.namaKetua" class="tcr-input" placeholder="Nama lengkap ketua tim" />
                </div>

                <!-- TIM: Daftar Anggota -->
                <div style="grid-column:1/-1;">
                  <label class="form-label">Daftar Nama Anggota <span class="req">*</span></label>
                  <div class="anggota-list">
                    <div v-for="(_, i) in form.anggota" :key="i" class="anggota-row">
                      <span class="anggota-num">{{ i + 1 }}</span>
                      <input v-model="form.anggota[i]" class="tcr-input" :placeholder="`Nama anggota ke-${i + 1}`" />
                      <button v-if="form.anggota.length > 1" type="button" class="anggota-remove" @click="removeAnggota(i)">×</button>
                    </div>
                  </div>
                  <button type="button" class="anggota-add" @click="addAnggota">+ Tambah Anggota</button>
                </div>
              </template>
            </template>

          </div>

          <div v-if="regStore.error" class="error-box">{{ regStore.error }}</div>
          <button v-if="form.cabang" type="submit" class="submit-btn" :disabled="regStore.loading">
            {{ regStore.loading ? 'Mengirim…' : 'Kirim Pendaftaran' }}
          </button>
        </form>
      </div>

      <!-- Sidebar -->
      <div class="sidebar-card">
        <div class="sidebar-label">Pendaftar Terbaru</div>
        <div class="recent-list">
          <div v-for="r in regStore.recent()" :key="r.nama" class="recent-item">
            <div class="recent-avatar">{{ r.initial }}</div>
            <div class="recent-info">
              <div class="recent-nama">{{ r.nama }}</div>
              <div class="recent-line">{{ r.line }}</div>
            </div>
          </div>
        </div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-info">
          Pendaftaran akan ditutup Tanggal 8 Juli 2026.<br> <br>
          Pertanyaan lebih lanjut, hubungi: <br>
          Andie Hans (Ketua Panitia)
          <a
            href="https://wa.me/6281574109182?text=Halo%20Andi%2C%20saya%20ingin%20bertanya%20soal%20registrasi%20lomba"
            target="_blank"
            rel="noopener noreferrer"
            class="wa-link"
          >0815-7410-9182</a>.
        </div>
      </div>
    </div>

    <!-- Daftar Peserta Terdaftar -->
    <div class="peserta-section">
      <div class="peserta-sec-header">
        <div>
          <div class="eyebrow">Peserta Terdaftar</div>
          <p class="peserta-sec-sub">{{ visiblePeserta.length }} peserta telah mendaftar</p>
        </div>
      </div>

      <div class="peserta-list">
        <div v-for="(r, i) in pagedPeserta" :key="r.id || i"
          class="peserta-item" :class="{ 'peserta-open': expandedPeserta === (r.id || i) }"
          @click="togglePeserta(r.id || i)">

          <div class="peserta-main">
            <span class="p-num">{{ (pesertaPage - 1) * PESERTA_PER_PAGE + i + 1 }}</span>
            <div class="p-info">
              <div class="p-nama">{{ r.namaRegu || r.namaKetua || r.nama || '—' }}</div>
              <div class="p-sub">{{ r.cabang }}{{ r.namaRegu && r.namaKetua ? ' · ' + r.namaKetua : '' }}</div>
            </div>
            <span class="p-tipe" :class="isTimReg(r) ? 'p-tim' : 'p-pers'">
              {{ isTimReg(r) ? '👥 Tim' : '🙋 Perorangan' }}
            </span>
            <div class="p-koridor">{{ r.koridorNama || (r.koridor ? `Koridor ${r.koridor}` : '—') }}</div>
            <span class="p-chevron">{{ expandedPeserta === (r.id || i) ? '▲' : '▼' }}</span>
          </div>

          <div v-if="expandedPeserta === (r.id || i)" class="peserta-detail">
            <div class="pd-grid">
              <div v-if="r.namaRegu" class="pd-block">
                <div class="pd-label">Nama Tim</div>
                <div class="pd-val">{{ r.namaRegu }}</div>
              </div>
              <div v-if="r.blokRumah" class="pd-block">
                <div class="pd-label">Blok Rumah</div>
                <div class="pd-val">{{ r.blokRumah }}</div>
              </div>
              <div class="pd-block">
                <div class="pd-label">Koridor</div>
                <div class="pd-val">{{ r.koridorNama || (r.koridor ? `Koridor ${r.koridor}` : '—') }}</div>
              </div>
              <div class="pd-block">
                <div class="pd-label">Jenis</div>
                <div class="pd-val">{{ isTimReg(r) ? 'Beregu / Tim' : 'Perorangan' }}</div>
              </div>
              <div v-if="r.tglDate || r.createdAt" class="pd-block">
                <div class="pd-label">Tgl Daftar</div>
                <div class="pd-val">{{ formatDate(r.tglDate || r.createdAt) }}</div>
              </div>
            </div>
            <div v-if="isTimReg(r) && r.anggota?.length" class="pd-anggota">
              <div class="pd-label">Anggota Tim ({{ r.anggota.length }} orang)</div>
              <ol class="pd-anggota-ol">
                <li v-for="(a, idx) in r.anggota" :key="idx">{{ a }}</li>
              </ol>
            </div>
          </div>
        </div>

        <div v-if="!visiblePeserta.length && !regStore.loading" class="peserta-empty">
          Belum ada peserta terdaftar.
        </div>
      </div>

      <div v-if="pesertaTotalPages > 1" class="pagination">
        <button type="button" class="page-btn" :disabled="pesertaPage === 1" @click="pesertaPage--">‹ Sebelumnya</button>
        <span class="page-info">Halaman {{ pesertaPage }} / {{ pesertaTotalPages }}</span>
        <button type="button" class="page-btn" :disabled="pesertaPage === pesertaTotalPages" @click="pesertaPage++">Selanjutnya ›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import { useKategoriStore }    from '@/stores/useKategori'
import { useKoridorStore }     from '@/stores/useKoridor'

const route         = useRoute()
const regStore      = useRegistrasiStore()
const kategoriStore = useKategoriStore()
const koridorStore  = useKoridorStore()

const form = reactive({
  cabang:    '',
  koridorId: '',
  blokRumah: '',
  wa:        '',
  nama:      '',      // perorangan
  namaRegu:  '',      // tim
  namaKetua: '',      // tim
  anggota:   [''],    // tim
})

const selectedKategori = computed(() => kategoriStore.list.find(k => k.nama === form.cabang))
const isTeam = computed(() => selectedKategori.value?.jenis === 'Beregu')

// Derive tipe dari master kategori agar selalu sinkron dengan perubahan di master
function jenisOf(r) {
  const kat = kategoriStore.list.find(k => k.nama === r.cabang)
  if (kat?.jenis) return kat.jenis
  return r.tipe === 'tim' ? 'Beregu' : 'Perorangan'
}
function isTimReg(r) { return jenisOf(r) === 'Beregu' }

// Reset nama/anggota saat ganti cabang agar tidak tercampur
watch(() => form.cabang, () => {
  form.nama      = ''
  form.namaRegu  = ''
  form.namaKetua = ''
  form.anggota   = ['']
})

function addAnggota() { form.anggota.push('') }
function removeAnggota(i) { form.anggota.splice(i, 1) }

async function handleSubmit() {
  regStore.error = ''

  if (!form.cabang)            { regStore.error = 'Cabang lomba wajib dipilih.';         return }
  if (!form.koridorId)         { regStore.error = 'Koridor wajib dipilih.';              return }
  if (!form.blokRumah.trim())  { regStore.error = 'Blok Rumah wajib diisi.';            return }
  if (!form.wa.trim())         { regStore.error = 'No. WhatsApp wajib diisi.';           return }

  const tipe = isTeam.value ? 'tim' : 'perorangan'

  if (tipe === 'tim') {
    if (!form.namaRegu.trim())             { regStore.error = 'Nama Tim / Regu wajib diisi.';    return }
    if (!form.namaKetua.trim())            { regStore.error = 'Nama Ketua Tim wajib diisi.';     return }
    if (!form.anggota.some(a => a.trim())) { regStore.error = 'Isi minimal satu nama anggota.'; return }
  } else {
    if (!form.nama.trim())                 { regStore.error = 'Nama Peserta wajib diisi.';       return }
  }

  const koridorNama = koridorStore.list.find(k => k.id === form.koridorId)?.nama || ''
  const payload = {
    tipe,
    status:    'new',
    cabang:    form.cabang,
    koridorId: form.koridorId,
    koridorNama,
    blokRumah: form.blokRumah.trim(),
    wa:        form.wa.trim(),
    ...(tipe === 'tim'
      ? { namaRegu: form.namaRegu.trim(), namaKetua: form.namaKetua.trim(), anggota: form.anggota.filter(a => a.trim()) }
      : { nama: form.nama.trim() }),
  }

  const ok = await regStore.submit(payload)
  if (ok) {
    Object.assign(form, { cabang:'', koridorId:'', blokRumah:'', wa:'', nama:'', namaRegu:'', namaKetua:'', anggota:[''] })
  }
}

const expandedPeserta = ref(null)
function togglePeserta(key) {
  expandedPeserta.value = expandedPeserta.value === key ? null : key
}

const visiblePeserta = computed(() => regStore.list.filter(r => r.status !== 'cancel'))

const PESERTA_PER_PAGE = 30
const pesertaPage = ref(1)
const pesertaTotalPages = computed(() => Math.max(1, Math.ceil(visiblePeserta.value.length / PESERTA_PER_PAGE)))
const pagedPeserta = computed(() => {
  const start = (pesertaPage.value - 1) * PESERTA_PER_PAGE
  return visiblePeserta.value.slice(start, start + PESERTA_PER_PAGE)
})
watch(() => visiblePeserta.value.length, () => {
  if (pesertaPage.value > pesertaTotalPages.value) pesertaPage.value = pesertaTotalPages.value
})
const formatDate = (d) => {
  if (!d) return '—'
  const dt = d?.seconds ? new Date(d.seconds * 1000) : new Date(d)
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  regStore.reset()
  regStore.fetch()
  koridorStore.fetch()
  await kategoriStore.fetch()

  // Pre-fill cabang dari query param (dari tombol "Daftar Sekarang" di jadwal)
  const cabangParam = route.query.cabang
  if (cabangParam) {
    const match = kategoriStore.list.find(k => k.nama === cabangParam)
    if (match) {
      form.cabang = match.nama
      await nextTick()
      document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
})
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.reg-grid  { display: grid; grid-template-columns: 1.3fr .7fr; gap: 20px; align-items: start; }

.form-card { background: #fff; border: 1.5px solid #F0D3D7; border-radius: 10px; padding: 28px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-label{ display: block; font: 700 13px/1 'Plus Jakarta Sans'; color: #1A1613; margin-bottom: 8px; }
.req { color: #CE1126; }

/* Mode badge */
.mode-badge {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border-radius: 10px; border: 1.5px solid;
}
.mode-tim        { background: #EEF4FF; border-color: #B8D0F5; }
.mode-perorangan { background: #F0FAF4; border-color: #B3DCBF; }
.mode-icon { font-size: 22px; line-height: 1; flex-shrink: 0; margin-top: 1px; }
.mode-title{ font: 700 14px/1.2 'Plus Jakarta Sans'; color: #1A1613; }
.mode-desc { font: 500 12px/1.4 'Plus Jakarta Sans'; color: #7A7368; margin-top: 4px; }

/* Anggota list */
.anggota-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.anggota-row  { display: flex; align-items: center; gap: 8px; }
.anggota-num  { flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%; background: #F0D3D7;
  display: flex; align-items: center; justify-content: center;
  font: 700 12px/1 'Plus Jakarta Sans'; color: #CE1126; }
.anggota-row .tcr-input { flex: 1; }
.anggota-remove { flex-shrink: 0; width: 28px; height: 28px; border: none; border-radius: 50%;
  background: #FCE7EA; color: #CE1126; font: 700 16px/1 Archivo; cursor: pointer;
  display: flex; align-items: center; justify-content: center; }
.anggota-add { margin-top: 4px; padding: 9px 16px; border: 1.5px dashed #CE1126; border-radius: 8px;
  background: transparent; color: #CE1126; font: 700 13px/1 'Plus Jakarta Sans'; cursor: pointer; width: 100%; }

/* Success & Error */
.success-box  { background: #E7F2EB; border: 1px solid #BFE0CC; border-radius: 14px; padding: 20px;
  display: flex; gap: 14px; align-items: flex-start; margin-bottom: 24px; }
.success-icon { width:40px;height:40px;flex:0 0 auto;border-radius:50%;background:#2E7D52;color:#fff;
  display:flex;align-items:center;justify-content:center;font:800 20px/1 Archivo; }
.success-title{ font: 800 17px/1.2 Archivo; color: #1A6B3E; }
.success-desc { font: 500 14px/1.5 'Plus Jakarta Sans'; color: #3A6B4E; margin-top: 6px; }
.error-box { margin-top: 16px; background: #FCE7EA; border: 1px solid #F2C4CB; border-radius: 11px;
  padding: 12px 14px; font: 600 13px/1.4 'Plus Jakarta Sans'; color: #CE1126; }
.submit-btn { margin-top: 20px; width: 100%; padding: 15px; border: none; border-radius: 12px;
  background: #CE1126; color: #fff; font: 800 16px/1 Archivo; cursor: pointer;
  box-shadow: 0 8px 20px rgba(206,17,38,.28); }
.submit-btn:disabled { opacity: .6; cursor: not-allowed; }

/* Sidebar */
.sidebar-card { background: #1A1613; border-radius: 10px; padding: 24px; color: #fff; }
.sidebar-label{ font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #E0A82E; }
.recent-list  { display: flex; flex-direction: column; gap: 12px; margin-top: 18px; }
.recent-item  { display: flex; align-items: center; gap: 12px; }
.recent-avatar{ width:38px;height:38px;flex:0 0 auto;border-radius:50%;background:#CE1126;color:#fff;
  display:flex;align-items:center;justify-content:center;font:800 15px/1 Archivo; }
.recent-info  { min-width: 0; }
.recent-nama  { font: 700 14px/1.2 'Plus Jakarta Sans'; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.recent-line  { font: 500 12px/1.2 'Plus Jakarta Sans'; color: #B8B0A6; margin-top: 3px; }
.sidebar-divider { height: 1px; background: rgba(255,255,255,.12); margin: 20px 0; }
.sidebar-info { font: 600 13px/1.6 'Plus Jakarta Sans'; color: #B8B0A6; }
.wa-link { color: #F4C36B; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
.wa-link:hover { color: #FFD98B; }

/* Daftar Peserta Section */
.peserta-section    { margin-top: 36px; }
.peserta-sec-header { margin-bottom: 16px; }
.peserta-sec-sub    { font: 500 13px/1 'Plus Jakarta Sans'; color: #7A7368; margin: 6px 0 0; }

.peserta-list { display: flex; flex-direction: column; gap: 0; border: 1.5px solid #F0D3D7; border-radius: 10px; overflow: hidden; background: #fff; }

.peserta-item { border-bottom: 1px solid #F0EBE2; cursor: pointer; transition: background .12s; }
.peserta-item:last-child { border-bottom: none; }
.peserta-item:hover .peserta-main { background: #FAF8F3; }
.peserta-open .peserta-main { background: #FAF8F3; border-bottom: 1px solid #F0D3D7; }

.peserta-main { display: flex; align-items: center; gap: 12px; padding: 14px 18px; flex-wrap: wrap; }
.p-num  { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; background: #F0D3D7; display: flex; align-items: center; justify-content: center; font: 700 12px/1 'Plus Jakarta Sans'; color: #CE1126; }
.p-info { flex: 1; min-width: 140px; }
.p-nama { font: 700 14px/1.2 'Plus Jakarta Sans'; color: #1A1613; }
.p-sub  { font: 500 12px/1 'Plus Jakarta Sans'; color: #9A9389; margin-top: 3px; }
.p-tipe { flex-shrink: 0; padding: 4px 10px; border-radius: 6px; font: 600 11px/1 'Plus Jakarta Sans'; white-space: nowrap; }
.p-tim  { background: #EEF2FF; color: #4338CA; }
.p-pers { background: #FEF3C7; color: #92400E; }
.p-koridor { font: 600 13px/1 'Plus Jakarta Sans'; color: #5A534B; white-space: nowrap; }
.p-chevron { margin-left: auto; font: 700 10px/1 'Plus Jakarta Sans'; color: #9A9389; flex-shrink: 0; }

.peserta-detail { padding: 16px 18px; background: #F7F4EE; display: flex; flex-direction: column; gap: 14px; }
.pd-grid  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.pd-block { }
.pd-label { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #9A9389; margin-bottom: 6px; }
.pd-val   { font: 600 14px/1.3 'Plus Jakarta Sans'; color: #1A1613; }
.pd-anggota    { }
.pd-anggota-ol { margin: 8px 0 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
.pd-anggota-ol li { font: 500 13px/1.5 'Plus Jakarta Sans'; color: #1A1613; }

.peserta-empty { padding: 32px; text-align: center; color: #9A9389; font: 500 14px/1 'Plus Jakarta Sans'; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 18px; }
.page-btn { padding: 9px 18px; border: 1.5px solid #F0D3D7; border-radius: 8px; background: #fff;
  color: #CE1126; font: 700 13px/1 'Plus Jakarta Sans'; cursor: pointer; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-btn:not(:disabled):hover { background: #FCE7EA; }
.page-info { font: 600 13px/1 'Plus Jakarta Sans'; color: #5A534B; }

@media(max-width:767px) {
  .reg-grid, .form-grid { grid-template-columns: 1fr !important; }
  .page-title { font-size: 26px; }
  .form-card { padding: 18px; }
  .sidebar-card { padding: 18px; }
  .pd-grid { grid-template-columns: 1fr 1fr; }
  .p-koridor { display: none; }
}
</style>
