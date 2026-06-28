<template>
  <div>
    <div class="eyebrow">Registrasi Lomba</div>
    <h2 class="page-title">Daftarkan Tim Anda</h2>

    <div class="reg-grid">
      <!-- Form -->
      <div class="form-card">
        <div v-if="regStore.submitted" class="success-box">
          <div class="success-icon">✓</div>
          <div>
            <div class="success-title">Pendaftaran Berhasil!</div>
            <div class="success-desc">Tim Anda sudah masuk daftar. Panitia akan menghubungi via WhatsApp untuk konfirmasi &amp; technical meeting. Sampai jumpa di lapangan! 🇮🇩</div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div style="grid-column:1/-1;">
              <label class="form-label">Nama Ketua Tim / Peserta <span class="req">*</span></label>
              <input v-model="form.nama" class="tcr-input" placeholder="Contoh: Budi Santoso" />
            </div>
            <div>
              <label class="form-label">No. WhatsApp <span class="req">*</span></label>
              <input v-model="form.wa" class="tcr-input" placeholder="0812xxxx" />
            </div>
            <div>
              <label class="form-label">Blok / Cluster <span class="req">*</span></label>
              <select v-model="form.blok" class="tcr-input">
                <option value="">Pilih blok…</option>
                <option v-for="b in BLOK_LIST" :key="b" :value="b">{{ b }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Cabang Lomba <span class="req">*</span></label>
              <select v-model="form.cabang" class="tcr-input">
                <option value="">Pilih cabang…</option>
                <option v-for="c in CABANG_LIST" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Nama Tim</label>
              <input v-model="form.tim" class="tcr-input" placeholder="Contoh: Garuda Anggrek" />
            </div>
            <div style="grid-column:1/-1;">
              <label class="form-label">Catatan (opsional)</label>
              <textarea v-model="form.catatan" class="tcr-input" rows="2" placeholder="Jumlah anggota, kebutuhan khusus, dll." style="resize:vertical;"></textarea>
            </div>
          </div>
          <div v-if="regStore.error" class="error-box">{{ regStore.error }}</div>
          <button type="submit" class="submit-btn">Kirim Pendaftaran</button>
        </form>
      </div>

      <!-- Sidebar -->
      <div class="sidebar-card">
        <div class="sidebar-label">Pendaftar Terbaru</div>
        <div class="recent-list">
          <div v-for="r in regStore.recent()" :key="r.nama" class="recent-item">
            <div class="recent-avatar">{{ r.initial }}</div>
            <div>
              <div class="recent-nama">{{ r.nama }}</div>
              <div class="recent-line">{{ r.line }}</div>
            </div>
          </div>
        </div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-info">
          Pendaftaran ditutup <strong style="color:#fff;">8 Juli 2026</strong>. Info &amp; bantuan: Sekretariat Panitia di Pos Satpam Utama atau WA <strong style="color:#F4C36B;">0812-1745-2026</strong>.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useRegistrasiStore } from '@/stores/useRegistrasi'

const regStore = useRegistrasiStore()
const BLOK_LIST   = ['Blok Anggrek','Blok Bougenville','Blok Cempaka','Blok Dahlia','Blok Edelweis']
const CABANG_LIST = ['Voli Putra','Voli Putri','Badminton Beregu','Futsal Anak','Mobile Legends','Balap Karung','Tarik Tambang','Makan Kerupuk','Balap Kelereng','Panjat Pinang']

const form = reactive({ nama:'', wa:'', blok:'', cabang:'', tim:'', catatan:'' })

async function handleSubmit() {
  const ok = await regStore.submit({ ...form })
  if (ok) Object.assign(form, { nama:'', wa:'', blok:'', cabang:'', tim:'', catatan:'' })
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
.success-box  { background: #E7F2EB; border: 1px solid #BFE0CC; border-radius: 14px; padding: 20px; display: flex; gap: 14px; align-items: flex-start; margin-bottom: 24px; }
.success-icon { width:40px;height:40px;flex:0 0 auto;border-radius:50%;background:#2E7D52;color:#fff;display:flex;align-items:center;justify-content:center;font:800 20px/1 Archivo; }
.success-title{ font: 800 17px/1.2 Archivo; color: #1A6B3E; }
.success-desc { font: 500 14px/1.5 'Plus Jakarta Sans'; color: #3A6B4E; margin-top: 6px; }
.error-box { margin-top: 16px; background: #FCE7EA; border: 1px solid #F2C4CB; border-radius: 11px; padding: 12px 14px; font: 600 13px/1.4 'Plus Jakarta Sans'; color: #CE1126; }
.submit-btn { margin-top: 20px; width: 100%; padding: 15px; border: none; border-radius: 12px; background: #CE1126; color: #fff; font: 800 16px/1 Archivo; cursor: pointer; box-shadow: 0 8px 20px rgba(206,17,38,.28); }
.sidebar-card { background: #1A1613; border-radius: 10px; padding: 24px; color: #fff; }
.sidebar-label{ font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #E0A82E; }
.recent-list  { display: flex; flex-direction: column; gap: 12px; margin-top: 18px; }
.recent-item  { display: flex; align-items: center; gap: 12px; }
.recent-avatar{ width:38px;height:38px;flex:0 0 auto;border-radius:50%;background:#CE1126;color:#fff;display:flex;align-items:center;justify-content:center;font:800 15px/1 Archivo; }
.recent-nama  { font: 700 14px/1.2 'Plus Jakarta Sans'; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.recent-line  { font: 500 12px/1.2 'Plus Jakarta Sans'; color: #B8B0A6; margin-top: 3px; }
.sidebar-divider { height: 1px; background: rgba(255,255,255,.12); margin: 20px 0; }
.sidebar-info { font: 600 13px/1.6 'Plus Jakarta Sans'; color: #B8B0A6; }
@media(max-width:767px) { .reg-grid, .form-grid { grid-template-columns: 1fr !important; } }
</style>
