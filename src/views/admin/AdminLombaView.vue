<template>
  <Transition name="toast">
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
      {{ toast.msg }}
    </div>
  </Transition>

  <main class="adm-main">
    <div class="adm-page-header">
      <h1 class="adm-page-title">Lomba</h1>
      <p class="adm-page-desc">Kelola master Tipe Lomba dan Nama Lomba dalam satu halaman.</p>
    </div>

    <section class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Master Data</div>
          <h2 class="section-title">Tipe Lomba</h2>
        </div>
        <button class="tcr-btn-red" @click="openTipeForm()">+ Tambah Tipe</button>
      </div>

      <form v-if="showTipeForm" @submit.prevent="submitTipe" class="inline-form form-3">
        <div>
          <label class="form-label">Nama Tipe <span class="req">*</span></label>
          <input v-model="tipeForm.nama" type="text" class="tcr-input" placeholder="cth: Olahraga" />
        </div>
        <div>
          <label class="form-label">Warna <span class="req">*</span></label>
          <div class="color-field">
            <input v-model="tipeForm.warna" type="color" class="color-picker" />
            <input v-model="tipeForm.warna" type="text" class="tcr-input" placeholder="#CE1126" />
          </div>
        </div>
        <div>
          <label class="form-label">Urutan</label>
          <input v-model.number="tipeForm.urutan" type="number" min="1" class="tcr-input" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-save">{{ tipeForm.editId ? 'Update' : 'Simpan' }} Tipe</button>
          <button type="button" class="btn-cancel" @click="resetTipeForm">Batal</button>
        </div>
      </form>

      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 52px">#</th>
              <th>Tipe</th>
              <th style="width: 140px">Warna</th>
              <th style="width: 90px; text-align: center">Urutan</th>
              <th style="width: 140px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(t, i) in tipeStore.list" :key="t.id">
              <td class="td-num">{{ i + 1 }}</td>
              <td>
                <div class="tipe-cell">
                  <span class="dot" :style="{ background: t.warna }"></span>
                  <span class="td-bold">{{ t.nama }}</span>
                </div>
              </td>
              <td><code class="color-code">{{ t.warna }}</code></td>
              <td class="td-num">{{ t.urutan || '-' }}</td>
              <td>
                <div class="action-group">
                  <button class="btn-edit" @click="openTipeForm(t)">Edit</button>
                  <button class="btn-del" @click="hapusTipe(t)">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="!tipeStore.list.length">
              <td colspan="5" class="empty">Belum ada tipe lomba.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Master Data</div>
          <h2 class="section-title">Nama Lomba</h2>
        </div>
        <button class="tcr-btn-red" @click="openKategoriForm()">+ Tambah Lomba</button>
      </div>

      <form v-if="showKategoriForm" @submit.prevent="submitKategori" class="inline-form form-4">
        <div>
          <label class="form-label">Nama Lomba <span class="req">*</span></label>
          <input v-model="kategoriForm.nama" type="text" class="tcr-input" placeholder="cth: Voli Putra" />
        </div>
        <div>
          <label class="form-label">Tipe <span class="req">*</span></label>
          <select v-model="kategoriForm.tipeId" class="tcr-input">
            <option value="">Pilih tipe...</option>
            <option v-for="t in tipeStore.list" :key="t.id" :value="t.id">{{ t.nama }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Jenis <span class="req">*</span></label>
          <select v-model="kategoriForm.jenis" class="tcr-input">
            <option value="Beregu">Beregu</option>
            <option value="Perorangan">Perorangan</option>
          </select>
        </div>
        <div>
          <label class="form-label">Urutan</label>
          <input v-model.number="kategoriForm.urutan" type="number" min="1" class="tcr-input" />
        </div>
        <div class="form-span-all">
          <label class="form-label">Deskripsi</label>
          <textarea v-model="kategoriForm.deskripsi" class="tcr-input tcr-textarea" rows="2"></textarea>
        </div>
        <div class="form-span-all">
          <label class="form-label">Peraturan</label>
          <textarea v-model="kategoriForm.peraturan" class="tcr-input tcr-textarea" rows="4"></textarea>
        </div>
        <div class="form-actions form-span-all">
          <button type="submit" class="btn-save">{{ kategoriForm.editId ? 'Update' : 'Simpan' }} Lomba</button>
          <button type="button" class="btn-cancel" @click="resetKategoriForm">Batal</button>
        </div>
      </form>

      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 52px">#</th>
              <th>Nama Lomba</th>
              <th style="width: 160px">Tipe</th>
              <th style="width: 120px">Jenis</th>
              <th style="width: 90px; text-align: center">Urutan</th>
              <th style="width: 140px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(k, i) in kategoriStore.list" :key="k.id">
              <td class="td-num">{{ i + 1 }}</td>
              <td class="td-bold">{{ k.nama }}</td>
              <td>
                <span class="tipe-badge" :style="{ background: tipeStore.bgById(k.tipeId) || '#F0EBE2', color: tipeStore.warnaById(k.tipeId) || '#5A534B' }">
                  {{ tipeStore.namaById(k.tipeId) || k.tipe || '-' }}
                </span>
              </td>
              <td>
                <span class="jenis-badge" :class="k.jenis === 'Beregu' ? 'jenis-beregu' : 'jenis-perorangan'">{{ k.jenis || '-' }}</span>
              </td>
              <td class="td-num">{{ k.urutan || '-' }}</td>
              <td>
                <div class="action-group">
                  <button class="btn-edit" @click="openKategoriForm(k)">Edit</button>
                  <button class="btn-del" @click="hapusKategori(k)">Hapus</button>
                </div>
              </td>
            </tr>
            <tr v-if="!kategoriStore.list.length">
              <td colspan="6" class="empty">Belum ada nama lomba.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useTipeStore } from '@/stores/useTipe'
import { useKategoriStore } from '@/stores/useKategori'

const tipeStore = useTipeStore()
const kategoriStore = useKategoriStore()

const toast = reactive({ show: false, msg: '', type: 'success' })
let toastTimer = null

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg = msg
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => {
    toast.show = false
  }, 3000)
}

const showTipeForm = ref(false)
const tipeForm = reactive({ nama: '', warna: '#CE1126', urutan: 1, editId: null })

function openTipeForm(t = null) {
  if (t) {
    Object.assign(tipeForm, { nama: t.nama, warna: t.warna, urutan: t.urutan || 1, editId: t.id })
  } else {
    Object.assign(tipeForm, { nama: '', warna: '#CE1126', urutan: tipeStore.list.length + 1, editId: null })
  }
  showTipeForm.value = true
}

function resetTipeForm() {
  showTipeForm.value = false
  Object.assign(tipeForm, { nama: '', warna: '#CE1126', urutan: 1, editId: null })
}

async function submitTipe() {
  if (!tipeForm.nama.trim()) {
    showToast('Nama tipe wajib diisi.', 'error')
    return
  }

  const payload = {
    nama: tipeForm.nama.trim(),
    warna: tipeForm.warna,
    bg: `rgba(${parseInt(tipeForm.warna.slice(1, 3), 16)},${parseInt(tipeForm.warna.slice(3, 5), 16)},${parseInt(tipeForm.warna.slice(5, 7), 16)},0.12)`,
    urutan: tipeForm.urutan || 1,
  }

  try {
    if (tipeForm.editId) {
      await tipeStore.update(tipeForm.editId, payload)
      showToast(`Tipe "${payload.nama}" diperbarui.`)
    } else {
      await tipeStore.add(payload)
      showToast(`Tipe "${payload.nama}" ditambahkan.`)
    }
    resetTipeForm()
  } catch {
    showToast('Gagal menyimpan tipe.', 'error')
  }
}

async function hapusTipe(t) {
  const terpakai = kategoriStore.list.some((k) => k.tipeId === t.id || k.tipe === t.nama)
  if (terpakai) {
    showToast('Tipe masih dipakai di Nama Lomba dan tidak bisa dihapus.', 'error')
    return
  }

  if (!confirm(`Hapus tipe "${t.nama}"?`)) return
  await tipeStore.remove(t.id)
  showToast(`Tipe "${t.nama}" dihapus.`)
}

const showKategoriForm = ref(false)
const kategoriForm = reactive({
  nama: '',
  tipeId: '',
  jenis: 'Beregu',
  urutan: 1,
  deskripsi: '',
  peraturan: '',
  editId: null,
})

function openKategoriForm(k = null) {
  if (k) {
    const tipeId = k.tipeId || tipeStore.list.find((t) => t.nama === k.tipe)?.id || ''
    Object.assign(kategoriForm, {
      nama: k.nama,
      tipeId,
      jenis: k.jenis || 'Beregu',
      urutan: k.urutan || 1,
      deskripsi: k.deskripsi || '',
      peraturan: k.peraturan || '',
      editId: k.id,
    })
  } else {
    Object.assign(kategoriForm, {
      nama: '',
      tipeId: tipeStore.list[0]?.id || '',
      jenis: 'Beregu',
      urutan: kategoriStore.list.length + 1,
      deskripsi: '',
      peraturan: '',
      editId: null,
    })
  }
  showKategoriForm.value = true
}

function resetKategoriForm() {
  showKategoriForm.value = false
  Object.assign(kategoriForm, {
    nama: '',
    tipeId: '',
    jenis: 'Beregu',
    urutan: 1,
    deskripsi: '',
    peraturan: '',
    editId: null,
  })
}

async function submitKategori() {
  if (!kategoriForm.nama.trim()) {
    showToast('Nama lomba wajib diisi.', 'error')
    return
  }
  if (!kategoriForm.tipeId) {
    showToast('Tipe wajib dipilih.', 'error')
    return
  }

  const payload = {
    nama: kategoriForm.nama.trim(),
    tipeId: kategoriForm.tipeId,
    jenis: kategoriForm.jenis,
    urutan: kategoriForm.urutan || 1,
    deskripsi: kategoriForm.deskripsi.trim(),
    peraturan: kategoriForm.peraturan.trim(),
  }

  try {
    if (kategoriForm.editId) {
      await kategoriStore.update(kategoriForm.editId, payload)
      showToast(`Lomba "${payload.nama}" diperbarui.`)
    } else {
      await kategoriStore.add(payload)
      showToast(`Lomba "${payload.nama}" ditambahkan.`)
    }
    resetKategoriForm()
  } catch {
    showToast('Gagal menyimpan lomba.', 'error')
  }
}

async function hapusKategori(k) {
  if (!confirm(`Hapus lomba "${k.nama}"?`)) return
  await kategoriStore.remove(k.id)
  showToast(`Lomba "${k.nama}" dihapus.`)
}

onMounted(() => {
  tipeStore.fetch()
  kategoriStore.fetch()
})
</script>

<style scoped>
.adm-main {
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px 14px 56px;
}

.adm-page-header {
  margin-bottom: 14px;
}

.adm-page-title {
  font: 900 22px/1.05 Archivo;
  color: #1A1613;
  margin: 0 0 4px;
}

.adm-page-desc {
  font: 500 12px/1.4 'Plus Jakarta Sans';
  color: #7A7368;
  margin: 0;
}

.adm-section {
  background: #fff;
  border: 1px solid #ECE7DE;
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.section-eyebrow {
  font: 700 11px/1 'Plus Jakarta Sans';
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #2D5B8A;
}

.section-title {
  font: 800 18px/1.1 Archivo;
  color: #1A1613;
  margin: 4px 0 0;
}

.inline-form {
  background: #FAF8F3;
  border: 1px solid #E2DCD2;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  display: grid;
  gap: 10px;
}

.form-3 {
  grid-template-columns: 1fr;
}

.form-4 {
  grid-template-columns: 1fr;
}

.form-span-all {
  grid-column: 1 / -1;
}

.form-label {
  display: block;
  font: 700 12px/1 'Plus Jakarta Sans';
  color: #1A1613;
  margin-bottom: 6px;
}

.req {
  color: #CE1126;
}

.color-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker {
  width: 40px;
  height: 40px;
  border: 1px solid #E2DCD2;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 9px 12px;
  border-radius: 8px;
  font: 700 12px/1 'Plus Jakarta Sans';
  cursor: pointer;
}

.btn-save {
  border: none;
  background: #CE1126;
  color: #fff;
}

.btn-cancel {
  border: 1.5px solid #E2DCD2;
  background: #fff;
  color: #1A1613;
}

.data-table-wrap {
  border: 1px solid #ECE7DE;
  border-radius: 12px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: #fff;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 480px;
}

.data-table thead tr {
  background: #FAF8F3;
  border-bottom: 2px solid #ECE7DE;
}

.data-table th {
  padding: 10px 10px;
  text-align: left;
  font: 700 11px/1 'Plus Jakarta Sans';
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #7A7368;
}

.data-table td {
  padding: 10px;
  border-bottom: 1px solid #F0EBE2;
  font-size: 13px;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

/* Table column widths responsiveness */
@media (max-width: 639px) {
  /* Hide Urutan column on mobile (4th column Tipe Lomba table, 5th column Nama Lomba table) */
  .data-table th:nth-child(4),
  .data-table td:nth-child(4) {
    display: none;
  }
  
  /* Reduce width on mobile - Tipe Lomba table */
  .data-table th[style*="width: 140px"] {
    width: 70px !important;
  }
  
  .data-table th[style*="width: 90px"] {
    width: 70px !important;
  }
  
  /* Reduce width on mobile - Nama Lomba table */
  .data-table th[style*="width: 160px"] {
    width: 70px !important;
  }
  
  .data-table th[style*="width: 120px"] {
    width: 70px !important;
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  /* Adjust columns for tablet */
  .data-table th[style*="width: 160px"] {
    width: 120px !important;
  }
  
  .data-table th[style*="width: 120px"] {
    width: 100px !important;
  }
}

.td-num {
  text-align: center;
  color: #9A9389;
  font: 600 12px/1 Archivo;
  white-space: nowrap;
}

.td-bold {
  font: 700 13px/1.2 'Plus Jakarta Sans';
  color: #1A1613;
}

.tipe-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.color-code {
  font: 600 11px/1 monospace;
  background: #F0EBE2;
  color: #5A534B;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  display: inline-block;
}

.tipe-badge {
  padding: 3px 8px;
  border-radius: 999px;
  font: 600 10px/1 'Plus Jakarta Sans';
  white-space: nowrap;
  display: inline-block;
}

.jenis-badge {
  padding: 3px 8px;
  border-radius: 5px;
  font: 600 10px/1 'Plus Jakarta Sans';
  white-space: nowrap;
  display: inline-block;
}

.jenis-beregu {
  background: #EEF2FF;
  color: #4338CA;
}

.jenis-perorangan {
  background: #FEF3C7;
  color: #92400E;
}

.action-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.btn-edit,
.btn-del {
  padding: 5px 10px;
  border-radius: 6px;
  font: 600 11px/1 'Plus Jakarta Sans';
  cursor: pointer;
  white-space: nowrap;
}

.btn-edit {
  border: 1px solid #E2DCD2;
  background: #fff;
  color: #1A1613;
}

.btn-del {
  border: 1px solid #FBEAEC;
  background: #FBEAEC;
  color: #CE1126;
}

.empty {
  text-align: center;
  padding: 18px 14px;
  color: #9A9389;
  font: 500 12px/1.4 'Plus Jakarta Sans';
}

.tcr-textarea {
  resize: vertical;
  min-height: 60px;
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  min-width: 220px;
  font: 600 13px/1.4 'Plus Jakarta Sans';
  box-shadow: 0 8px 24px rgba(0, 0, 0, .18);
}

.toast.success {
  background: #1A1613;
  color: #fff;
}

.toast.error {
  background: #CE1126;
  color: #fff;
}

.toast-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 700 12px/1 Archivo;
}

.toast-enter-active,
.toast-leave-active {
  transition: all .25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (min-width: 640px) {
  .adm-main {
    padding: 20px 16px 56px;
  }

  .form-3 {
    grid-template-columns: 1fr 1fr;
  }

  .form-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-group {
    gap: 6px;
  }

  .data-table {
    min-width: 600px;
  }
}

@media (min-width: 768px) {
  .adm-main {
    padding: 28px 20px 70px;
  }

  .adm-page-header {
    margin-bottom: 24px;
  }

  .adm-page-title {
    font-size: 26px;
    margin-bottom: 6px;
  }

  .adm-page-desc {
    font-size: 13px;
  }

  .adm-section {
    padding: 20px;
    margin-bottom: 18px;
    border-radius: 18px;
  }

  .section-title {
    font-size: 20px;
  }

  .inline-form {
    padding: 14px;
    gap: 12px;
  }

  .form-3 {
    grid-template-columns: 1.3fr 1fr 0.7fr;
  }

  .form-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .data-table th {
    padding: 12px 12px;
    font-size: 11px;
  }

  .data-table td {
    padding: 11px 12px;
    font-size: 13px;
  }

  .btn-save,
  .btn-cancel {
    padding: 10px 14px;
    font-size: 13px;
  }

  .btn-edit,
  .btn-del {
    padding: 6px 12px;
    font-size: 12px;
  }

  .color-picker {
    width: 48px;
    height: 48px;
  }

  .data-table {
    min-width: 700px;
  }
}

@media (min-width: 1024px) {
  .adm-section {
    padding: 24px;
  }

  .data-table {
    min-width: 800px;
  }
}
</style>
