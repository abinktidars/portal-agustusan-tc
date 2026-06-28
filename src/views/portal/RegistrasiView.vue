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

            <!-- Cabang — menentukan mode -->
            <div style="grid-column:1/-1;">
              <label class="form-label">Cabang Lomba <span class="req">*</span></label>
              <select v-model="form.cabang" class="tcr-input">
                <option value="">Pilih cabang lomba…</option>
                <option v-for="c in CABANG_LIST" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>

            <!-- Mode badge -->
            <div v-if="form.cabang" style="grid-column:1/-1;">
              <div class="mode-badge" :class="isTeam ? 'mode-tim' : 'mode-perorangan'">
                <span class="mode-icon">{{ isTeam ? '👥' : '🙋' }}</span>
                <div>
                  <div class="mode-title">{{ isTeam ? 'Daftar sebagai Ketua Tim' : 'Daftar Perorangan' }}</div>
                  <div class="mode-desc">{{ isTeam ? 'Cabang ini didaftarkan oleh ketua tim beserta daftar anggota.' : 'Cabang ini bisa didaftarkan langsung per peserta.' }}</div>
                </div>
              </div>
            </div>

            <!-- INDIVIDUAL: Nama Peserta -->
            <template v-if="!isTeam && form.cabang">
              <div style="grid-column:1/-1;">
                <label class="form-label">Nama Peserta <span class="req">*</span></label>
                <input v-model="form.nama" class="tcr-input" placeholder="Nama lengkap peserta" />
              </div>
            </template>

            <!-- TEAM: Nama Ketua Tim -->
            <template v-if="isTeam">
              <div style="grid-column:1/-1;">
                <label class="form-label">Nama Ketua Tim <span class="req">*</span></label>
                <input v-model="form.namaKetua" class="tcr-input" placeholder="Nama lengkap ketua tim" />
              </div>
            </template>

            <!-- Koridor + Blok Rumah -->
            <template v-if="form.cabang">
              <div>
                <label class="form-label">Koridor <span class="req">*</span></label>
                <select v-model="form.koridor" class="tcr-input">
                  <option value="">Pilih koridor…</option>
                  <option v-for="k in 5" :key="k" :value="k">Koridor {{ k }}</option>
                </select>
              </div>
              <div>
                <label class="form-label">Blok Rumah <span class="req">*</span></label>
                <input v-model="form.blokRumah" class="tcr-input" placeholder="Contoh: A1, B12" />
              </div>

              <!-- No. WhatsApp -->
              <div style="grid-column:1/-1;">
                <label class="form-label">No. WhatsApp <span class="req">*</span></label>
                <input v-model="form.wa" class="tcr-input" placeholder="0812xxxx" type="tel" />
              </div>
            </template>

            <!-- TEAM: Daftar Peserta -->
            <template v-if="isTeam">
              <div style="grid-column:1/-1;">
                <label class="form-label">Daftar Nama Peserta <span class="req">*</span></label>
                <div class="anggota-list">
                  <div v-for="(_, i) in form.anggota" :key="i" class="anggota-row">
                    <span class="anggota-num">{{ i + 1 }}</span>
                    <input v-model="form.anggota[i]" class="tcr-input" :placeholder="`Nama peserta ke-${i + 1}`" />
                    <button v-if="form.anggota.length > 1" type="button" class="anggota-remove" @click="removeAnggota(i)">×</button>
                  </div>
                </div>
                <button type="button" class="anggota-add" @click="addAnggota">+ Tambah Peserta</button>
              </div>
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
          Pertanyaan lebih lanjut, hubungi: <br>
          Andi (Ketua Panitia)
          <a
            href="https://wa.me/6281574109182?text=Halo%20Andi%2C%20saya%20ingin%20bertanya%20soal%20registrasi%20lomba"
            target="_blank"
            rel="noopener noreferrer"
            class="wa-link"
          >0815-7410-9182</a>.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch, onMounted } from 'vue'
import { useRegistrasiStore } from '@/stores/useRegistrasi'

const regStore = useRegistrasiStore()

const TEAM_CABANG = ['Voli Putra', 'Voli Putri', 'Badminton Beregu']
const CABANG_LIST = ['Voli Putra','Voli Putri','Badminton Beregu','Futsal Anak','Mobile Legends','Balap Karung','Tarik Tambang','Makan Kerupuk','Balap Kelereng','Panjat Pinang']

const form = reactive({
  cabang:    '',
  koridor:   '',
  blokRumah: '',
  wa:        '',
  nama:      '',      // perorangan
  namaKetua: '',      // tim
  anggota:   [''],    // tim
})

const isTeam = computed(() => TEAM_CABANG.includes(form.cabang))

// Reset nama/anggota saat ganti cabang agar tidak tercampur
watch(() => form.cabang, () => {
  form.nama      = ''
  form.namaKetua = ''
  form.anggota   = ['']
})

function addAnggota() { form.anggota.push('') }
function removeAnggota(i) { form.anggota.splice(i, 1) }

async function handleSubmit() {
  const tipe = isTeam.value ? 'tim' : 'perorangan'
  const payload = {
    tipe,
    cabang:    form.cabang,
    koridor:   form.koridor,
    blokRumah: form.blokRumah,
    wa:        form.wa,
    ...(tipe === 'tim'
      ? { namaKetua: form.namaKetua, anggota: form.anggota.filter(a => a.trim()) }
      : { nama: form.nama }),
  }
  const ok = await regStore.submit(payload)
  if (ok) {
    Object.assign(form, { cabang:'', koridor:'', blokRumah:'', wa:'', nama:'', namaKetua:'', anggota:[''] })
  }
}

onMounted(() => { regStore.reset(); regStore.fetch() })
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

@media(max-width:767px) {
  .reg-grid, .form-grid { grid-template-columns: 1fr !important; }
  .page-title { font-size: 26px; }
  .form-card { padding: 18px; }
  .sidebar-card { padding: 18px; }
}
</style>
