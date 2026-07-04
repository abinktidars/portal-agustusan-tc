<template>
  <!-- Toast -->
  <Transition name="toast">
    <div v-if="toast.show" class="toast" :class="toast.type">
      <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
      {{ toast.msg }}
    </div>
  </Transition>

  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Data</div>
          <h2 class="section-title">Registrasi Peserta</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari nama / blok / cabang..." />
          <select v-model="filterCabang" class="tcr-input filter-select">
            <option value="">Semua Jenis Lomba</option>
            <option v-for="k in kategoriStore.list" :key="k.id" :value="k.nama">{{ k.nama }}</option>
          </select>
          <select v-model="filterKoridor" class="tcr-input filter-select">
            <option value="">Semua Koridor</option>
            <option v-for="k in koridorStore.list" :key="k.id" :value="k.id">{{ k.nama }}</option>
          </select>
          <select v-model="filterStatus" class="tcr-input filter-select">
            <option value="">Semua Status</option>
            <option value="new">Baru</option>
            <option value="confirm">Diterima</option>
            <option value="cancel">Ditolak</option>
          </select>
          <button class="btn-export" @click="doExport"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>Export Excel</button>
          <button class="tcr-btn-red" @click="openForm()">+ Tambah Registrasi</button>
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="showForm" class="modal-overlay" @click.self="resetForm">
        <div class="modal-card">
          <div class="modal-hd">
            <h3 class="modal-ttl">{{ form.editId ? 'Edit' : 'Tambah' }} Registrasi</h3>
            <button type="button" class="modal-x" @click="resetForm">✕</button>
          </div>
          <form @submit.prevent="submit" class="modal-bd">
            <div class="form-row-main">
              <div>
                <label class="form-label">Cabang Lomba <span class="req">*</span></label>
                <select v-model="form.cabang" class="tcr-input" :disabled="!!form.editId">
                  <option value="">Pilih cabang…</option>
                  <option v-for="k in kategoriStore.list" :key="k.id" :value="k.nama">{{ k.nama }}</option>
                </select>
              </div>
              <div>
                <label class="form-label">Koridor <span class="req">*</span></label>
                <select v-model="form.koridorId" class="tcr-input" :disabled="koridorStore.loading">
                  <option value="">{{ koridorStore.loading ? 'Memuat…' : 'Pilih koridor…' }}</option>
                  <option v-for="k in koridorStore.list" :key="k.id" :value="k.id">{{ k.nama }}</option>
                </select>
              </div>
              <div>
                <label class="form-label">Blok Rumah <span class="req">*</span></label>
                <input v-model="form.blokRumah" class="tcr-input" placeholder="Contoh: A1, B12" />
              </div>
              <div>
                <label class="form-label">No. WhatsApp <span class="req">*</span></label>
                <input v-model="form.wa" class="tcr-input" type="tel" placeholder="0812xxxx" />
              </div>
            </div>

            <!-- Perorangan: nama peserta -->
            <div v-if="form.cabang && !isTeam" class="form-row-full">
              <label class="form-label">Nama Peserta <span class="req">*</span></label>
              <input v-model="form.nama" class="tcr-input" placeholder="Nama lengkap peserta" />
            </div>

            <!-- Tim: nama regu + nama ketua -->
            <div v-if="form.cabang && isTeam" class="form-row-2">
              <div>
                <label class="form-label">Nama Tim / Regu <span class="req">*</span></label>
                <input v-model="form.namaRegu" class="tcr-input" placeholder="cth: Tim Merah Putih, Blok Anggrek" />
              </div>
              <div>
                <label class="form-label">Nama Ketua Tim <span class="req">*</span></label>
                <input v-model="form.namaKetua" class="tcr-input" placeholder="Nama lengkap ketua tim" />
              </div>
            </div>

            <!-- Tim: daftar anggota -->
            <div v-if="form.cabang && isTeam" class="form-row-full">
              <label class="form-label">Daftar Nama Anggota <span class="req">*</span></label>
              <div class="anggota-list">
                <div v-for="(_, i) in form.anggota" :key="i" class="anggota-row">
                  <span class="anggota-num">{{ i + 1 }}</span>
                  <input v-model="form.anggota[i]" class="tcr-input" :placeholder="`Nama anggota ke-${i + 1}`" />
                  <button v-if="form.anggota.length > 1" type="button" class="anggota-remove" @click="form.anggota.splice(i, 1)">×</button>
                </div>
              </div>
              <button type="button" class="anggota-add" @click="form.anggota.push('')">+ Tambah Anggota</button>
            </div>

            <div class="form-row-full form-actions">
              <button type="submit" class="btn-save" :disabled="saving">
                {{ saving ? 'Menyimpan…' : (form.editId ? 'Update Registrasi' : 'Simpan Registrasi') }}
              </button>
              <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Bulk action bar -->
      <Transition name="bulk-bar">
        <div v-if="selectedIds.length" class="bulk-bar">
          <span class="bulk-count">{{ selectedIds.length }} dipilih</span>
          <div class="bulk-actions">
            <button class="bulk-btn bulk-confirm" @click="bulkSetStatus('confirm')">✓ Terima</button>
            <button class="bulk-btn bulk-cancel"  @click="bulkSetStatus('cancel')">✕ Tolak</button>
          </div>
          <button class="bulk-clear" @click="selectedIds = []">✕ Batal Pilih</button>
        </div>
      </Transition>

      <!-- TABLE -->
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:36px" class="th-check">
                <input type="checkbox" class="row-check" :checked="allSelected" :indeterminate.prop="someSelected" @change="toggleAll" />
              </th>
              <th style="width:36px">#</th>
              <th>Nama</th>
              <th style="width:120px">Status</th>
              <th style="width:100px">Tipe</th>
              <th>Cabang</th>
              <th style="width:70px">Blok</th>
              <th style="width:100px">No. WA</th>
              <th style="width:100px">Tgl Daftar</th>
              <th style="width:110px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(r, i) in paginated" :key="r.id">
              <tr class="data-row" :class="{ 'row-expanded': expandedId === r.id, 'row-selected': selectedIds.includes(r.id) }" @click="toggleDetail(r.id)">
                <td class="td-check" @click.stop>
                  <input type="checkbox" class="row-check" :value="r.id" v-model="selectedIds" />
                </td>
                <td class="td-num td-idx">{{ (page-1)*PER_PAGE + i + 1 }}</td>
                <td class="td-nama">
                  <div class="td-bold">{{ r.namaRegu || r.namaKetua || r.nama || '—' }}</div>
                  <div v-if="isTimReg(r) && r.namaRegu && r.namaKetua" class="td-sub">Ketua: {{ r.namaKetua }}</div>
                  <div v-if="isTimReg(r) && r.anggota?.length" class="td-sub">{{ r.anggota.length }} anggota</div>
                  <div class="td-sub">Diinput: {{ creatorLabel(r) }}</div>
                </td>
                <td class="td-status">
                  <span class="status-chip" :class="statusCls(r.status)">{{ statusLabel(r.status) }}</span>
                </td>
                <td class="td-tipe">
                  <span class="tipe-chip" :class="isTimReg(r) ? 'chip-tim' : 'chip-pers'">
                    {{ isTimReg(r) ? '👥 Tim' : '🙋 Pers.' }}
                  </span>
                  <span class="cabang-badge td-cabang-mobile">{{ r.cabang }}</span>
                </td>
                <td class="td-cabang"><span class="cabang-badge">{{ r.cabang }}</span></td>
                <td class="td-blok">{{ r.blokRumah || '-' }}</td>
                <td class="td-wa"><a :href="`https://wa.me/${r.wa}`" target="_blank" class="wa-link" @click.stop>{{ r.wa }}</a></td>
                <td class="td-tgl">{{ formatDate(r.tglDate || r.createdAt) }}</td>
                <td class="td-aksi">
                  <div class="action-group">
                    <span class="action-buttons" @click.stop>
                      <button @click="openForm(r)" class="btn-edit">Edit</button>
                      <button @click="hapus(r)" class="btn-del">Hapus</button>
                    </span>
                    <span class="chevron" :class="{ open: expandedId === r.id }">›</span>
                  </div>
                </td>
              </tr>

              <!-- Detail row (expanded) -->
              <tr v-if="expandedId === r.id" class="detail-row">
                <td colspan="10">
                  <div class="detail-panel">
                    <div class="detail-cols">
                      <div class="detail-block">
                        <div class="detail-label">Koridor</div>
                        <div class="detail-val">{{ r.koridorNama || (r.koridor ? `Koridor ${r.koridor}` : '—') }}</div>
                      </div>
                      <div class="detail-block">
                        <div class="detail-label">Blok Rumah</div>
                        <div class="detail-val">{{ r.blokRumah }}</div>
                      </div>
                      <div class="detail-block">
                        <div class="detail-label">No. WhatsApp</div>
                        <div class="detail-val">
                          <a :href="`https://wa.me/${r.wa}`" target="_blank" class="wa-link">{{ r.wa }}</a>
                        </div>
                      </div>
                      <div class="detail-block">
                        <div class="detail-label">Tgl Daftar</div>
                        <div class="detail-val">{{ formatDate(r.tglDate || r.createdAt) }}</div>
                      </div>
                      <div class="detail-block">
                        <div class="detail-label">Diinput Oleh</div>
                        <div class="detail-val">{{ creatorLabel(r) }}</div>
                      </div>
                      <div v-if="updaterLabel(r)" class="detail-block">
                        <div class="detail-label">Terakhir Diubah Oleh</div>
                        <div class="detail-val">{{ updaterLabel(r) }}</div>
                      </div>
                    </div>

                    <!-- Perorangan -->
                    <div v-if="!isTimReg(r)" class="detail-block">
                      <div class="detail-label">Nama Peserta</div>
                      <div class="detail-val detail-nama">{{ r.nama }}</div>
                    </div>

                    <!-- Tim -->
                    <template v-if="isTimReg(r)">
                      <div v-if="r.namaRegu" class="detail-block">
                        <div class="detail-label">Nama Tim / Regu</div>
                        <div class="detail-val detail-nama">{{ r.namaRegu }}</div>
                      </div>
                      <div class="detail-block">
                        <div class="detail-label">Ketua Tim</div>
                        <div class="detail-val detail-nama detail-ketua">{{ r.namaKetua }}</div>
                      </div>
                      <div v-if="r.anggota?.length" class="detail-block">
                        <div class="detail-label">Anggota Tim ({{ r.anggota.length }} orang)</div>
                        <ol class="anggota-ol">
                          <li v-for="(a, idx) in r.anggota" :key="idx">{{ a }}</li>
                        </ol>
                      </div>
                    </template>

                    <div class="detail-actions" @click.stop>
                      <button @click="openForm(r)" class="btn-edit">Edit</button>
                      <button @click="hapus(r)" class="btn-del">Hapus</button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="!filtered.length">
              <td colspan="10" class="empty">
                {{ search || filterCabang || filterKoridor || filterStatus ? 'Tidak ada hasil pencarian' : 'Belum ada pendaftar.' }}
              </td>
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
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import { useKategoriStore }   from '@/stores/useKategori'
import { useKoridorStore }    from '@/stores/useKoridor'
import { useAuthStore }       from '@/stores/useAuth'
import PaginationBar from '@/components/PaginationBar.vue'
import { exportToExcel } from '@/utils/exportExcel'

const regStore      = useRegistrasiStore()
const kategoriStore = useKategoriStore()
const koridorStore  = useKoridorStore()
const authStore     = useAuthStore()

const showForm     = ref(false)
const expandedId   = ref(null)
const search       = ref('')
const filterCabang  = ref('')
const filterKoridor = ref('')
const filterStatus = ref('')
const page         = ref(1)
const PER_PAGE   = 10
const saving     = ref(false)
const selectedIds = ref([])

const form  = reactive({ cabang:'', koridorId:'', blokRumah:'', wa:'', nama:'', namaRegu:'', namaKetua:'', anggota:[''], editId:null })
const toast = reactive({ show:false, msg:'', type:'success' })
let toastTimer = null

const selectedKategori = computed(() => kategoriStore.list.find(k => k.nama === form.cabang))
const isTeam = computed(() => selectedKategori.value?.jenis === 'Beregu')

// Derive tipe dari master kategori (bukan dari r.tipe yang tersimpan)
// Sehingga perubahan jenis di master langsung tercermin di tabel
function jenisOf(r) {
  const kat = kategoriStore.list.find(k => k.nama === r.cabang)
  if (kat?.jenis) return kat.jenis          // 'Beregu' | 'Perorangan'
  return r.tipe === 'tim' ? 'Beregu' : 'Perorangan'  // fallback ke data lama
}
function isTimReg(r) { return jenisOf(r) === 'Beregu' }

const allSelected  = computed(() => filtered.value.length > 0 && filtered.value.every(r => selectedIds.value.includes(r.id)))
const someSelected = computed(() => selectedIds.value.length > 0 && !allSelected.value)

const STATUS_MAP = { new: 'Baru', confirm: 'Diterima', cancel: 'Ditolak' }
const statusLabel = (s) => STATUS_MAP[s] || 'Baru'
const statusCls   = (s) => ({ new:'s-new', confirm:'s-confirm', cancel:'s-cancel' }[s] || 's-new')

function whoLabel(who) {
  if (!who) return null
  if (who.type === 'self') return 'Pendaftaran mandiri (via website)'
  return who.nama || who.email || 'Admin'
}
const creatorLabel = (r) => whoLabel(r.inputBy) || 'Tidak diketahui'
const updaterLabel = (r) => whoLabel(r.updatedBy)

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filtered.value.map(r => r.id).filter(Boolean)
  }
}

async function bulkSetStatus(status) {
  if (!selectedIds.value.length) return
  const label = STATUS_MAP[status] || status
  if (!confirm(`Set ${selectedIds.value.length} pendaftar ke status "${label}"?`)) return
  try {
    await Promise.all(selectedIds.value.map(id => regStore.update(id, { status })))
    showToast(`${selectedIds.value.length} registrasi diubah ke "${label}".`)
    selectedIds.value = []
    await regStore.fetch()
  } catch {
    showToast('Gagal mengubah status. Coba lagi.', 'error')
  }
}

watch(() => form.cabang, () => {
  if (!form.editId) { form.nama = ''; form.namaRegu = ''; form.namaKetua = ''; form.anggota = [''] }
})

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return regStore.list.filter(r => {
    const matchQ = !q ||
      (r.namaRegu || '').toLowerCase().includes(q) ||
      (r.namaKetua || r.nama || '').toLowerCase().includes(q) ||
      (r.blokRumah || '').toLowerCase().includes(q) ||
      (r.cabang || '').toLowerCase().includes(q)
    const matchCabang  = !filterCabang.value  || r.cabang === filterCabang.value
    const matchKoridor = !filterKoridor.value || r.koridorId === filterKoridor.value
    const matchStatus  = !filterStatus.value  || (r.status || 'new') === filterStatus.value
    return matchQ && matchCabang && matchKoridor && matchStatus
  })
})
const paginated = computed(() => filtered.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))
watch([search, filterCabang, filterKoridor, filterStatus], () => { page.value = 1; selectedIds.value = [] })

const formatDate = (d) => {
  if (!d) return '-'
  const dt = d?.seconds ? new Date(d.seconds * 1000) : new Date(d)
  return dt.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
}

function showToast(msg, type = 'success') {
  clearTimeout(toastTimer)
  toast.msg = msg; toast.type = type; toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}

function toggleDetail(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function openForm(r = null) {
  if (r) {
    Object.assign(form, {
      cabang:    r.cabang,
      koridorId: r.koridorId || '',
      blokRumah: r.blokRumah || '',
      wa:        r.wa || '',
      nama:      r.nama || '',
      namaRegu:  r.namaRegu || '',
      namaKetua: r.namaKetua || '',
      anggota:   r.anggota?.length ? [...r.anggota] : [''],
      editId:    r.id,
    })
  } else {
    Object.assign(form, { cabang:'', koridorId:'', blokRumah:'', wa:'', nama:'', namaRegu:'', namaKetua:'', anggota:[''], editId:null })
  }
  showForm.value = true
  expandedId.value = null
}

function resetForm() {
  showForm.value = false
  Object.assign(form, { cabang:'', koridorId:'', blokRumah:'', wa:'', nama:'', namaRegu:'', namaKetua:'', anggota:[''], editId:null })
}

async function submit() {
  if (!form.cabang)             { showToast('Cabang lomba wajib dipilih.', 'error'); return }
  if (!form.koridorId)          { showToast('Koridor wajib dipilih.', 'error'); return }
  if (!form.blokRumah.trim())   { showToast('Blok Rumah wajib diisi.', 'error'); return }
  if (!form.wa.trim())          { showToast('No. WhatsApp wajib diisi.', 'error'); return }

  const tipe = isTeam.value ? 'tim' : 'perorangan'
  if (tipe === 'tim') {
    if (!form.namaRegu.trim())               { showToast('Nama Tim / Regu wajib diisi.', 'error'); return }
    if (!form.namaKetua.trim())              { showToast('Nama Ketua Tim wajib diisi.', 'error'); return }
    if (!form.anggota.some(a => a.trim()))   { showToast('Isi minimal satu nama anggota.', 'error'); return }
  } else {
    if (!form.nama.trim())                   { showToast('Nama Peserta wajib diisi.', 'error'); return }
  }

  const isEdit = !!form.editId
  const koridorNama = koridorStore.list.find(k => k.id === form.koridorId)?.nama || ''
  const adminInfo = { type: 'admin', uid: authStore.userId || null, nama: authStore.userName || '', email: authStore.userEmail || '' }
  const payload = {
    cabang:      form.cabang,
    koridorId:   form.koridorId,
    koridorNama,
    blokRumah:   form.blokRumah.trim(),
    wa:          form.wa.trim(),
    tipe,
    ...(tipe === 'tim'
      ? { namaRegu: form.namaRegu.trim(), namaKetua: form.namaKetua.trim(), anggota: form.anggota.filter(a => a.trim()) }
      : { nama: form.nama.trim() }),
    ...(isEdit ? { updatedBy: adminInfo } : { inputBy: adminInfo }),
  }

  saving.value = true
  try {
    if (isEdit) {
      await regStore.update(form.editId, payload)
      showToast(`Registrasi "${payload.namaRegu || payload.namaKetua || payload.nama}" berhasil diperbarui.`)
    } else {
      await regStore.add(payload)
      showToast(`Registrasi "${payload.namaRegu || payload.namaKetua || payload.nama}" berhasil ditambahkan.`)
    }
    resetForm()
  } catch {
    showToast('Gagal menyimpan. Coba lagi.', 'error')
  } finally {
    saving.value = false
  }
}

async function hapus(r) {
  const nama = r.namaRegu || r.namaKetua || r.nama || 'peserta ini'
  if (!confirm(`Hapus registrasi "${nama}" (${r.cabang})?`)) return
  try {
    await regStore.remove(r.id)
    if (expandedId.value === r.id) expandedId.value = null
    showToast(`Registrasi "${nama}" berhasil dihapus.`)
  } catch {
    showToast('Gagal menghapus. Coba lagi.', 'error')
  }
}

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',          field: (_, i) => i + 1 },
    { label: 'Nama Tim',    field: r => r.namaRegu || '' },
    { label: 'Ketua / Peserta', field: r => r.namaKetua || r.nama || '' },
    { label: 'Status',      field: r => statusLabel(r.status) },
    { label: 'Tipe',        field: r => jenisOf(r) },
    { label: 'Cabang',      field: 'cabang' },
    { label: 'Blok Rumah',  field: 'blokRumah' },
    { label: 'Koridor',     field: r => r.koridorNama || (r.koridor ? `Koridor ${r.koridor}` : '') },
    { label: 'No. WA',      field: 'wa' },
    { label: 'Anggota',     field: r => r.anggota?.join(', ') || '' },
    { label: 'Tgl Daftar',  field: r => formatDate(r.tglDate || r.createdAt) },
    { label: 'Diinput Oleh', field: r => creatorLabel(r) },
    { label: 'Terakhir Diubah Oleh', field: r => updaterLabel(r) || '' },
  ], 'registrasi-peserta')
}

onMounted(() => { regStore.fetch(); kategoriStore.fetch(); koridorStore.fetch() })
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header  { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow { font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#9A6B12; }
.section-title   { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }
.filter-select   { min-width:140px; }
/* modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
.modal-card    { background:#fff; border-radius:20px; width:100%; max-width:640px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.25); }
.modal-hd      { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-ttl     { font:800 18px/1.2 Archivo; color:#1A1613; margin:0; }
.modal-x       { width:32px; height:32px; border-radius:50%; border:none; background:#F0EBE2; color:#5A534B; font:700 16px/1 Archivo; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.modal-x:hover { background:#E2DCD2; }
.modal-bd      { padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px; }

/* Inline form */
.inline-form    { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:22px; margin-bottom:24px; display:flex; flex-direction:column; gap:18px; }
.form-row-main  { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:16px; }
.form-row-2     { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.form-row-full  { display:flex; flex-direction:column; }
.form-actions   { flex-direction:row; gap:12px; }
.form-label     { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req            { color:#CE1126; }
.btn-save   { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-save:disabled { opacity:.6; cursor:not-allowed; }
.btn-cancel { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

/* Anggota list inside form */
.anggota-list { display:flex; flex-direction:column; gap:8px; margin-bottom:10px; }
.anggota-row  { display:flex; align-items:center; gap:8px; }
.anggota-num  { flex-shrink:0; width:24px; height:24px; border-radius:50%; background:#F0D3D7; display:flex; align-items:center; justify-content:center; font:700 12px/1 'Plus Jakarta Sans'; color:#CE1126; }
.anggota-row .tcr-input { flex:1; }
.anggota-remove { flex-shrink:0; width:28px; height:28px; border:none; border-radius:50%; background:#FCE7EA; color:#CE1126; font:700 16px/1 Archivo; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.anggota-add { padding:9px 16px; border:1.5px dashed #CE1126; border-radius:8px; background:transparent; color:#CE1126; font:700 13px/1 'Plus Jakarta Sans'; cursor:pointer; width:100%; margin-top:4px; }

/* Bulk bar */
.bulk-bar { display:flex; align-items:center; gap:12px; padding:12px 16px; background:#1A1613; border-radius:12px; margin-bottom:14px; flex-wrap:wrap; }
.bulk-count { font:700 13px/1 'Plus Jakarta Sans'; color:#fff; flex-shrink:0; }
.bulk-actions { display:flex; gap:8px; flex:1; flex-wrap:wrap; }
.bulk-btn { padding:7px 14px; border:none; border-radius:8px; font:700 12px/1 'Plus Jakarta Sans'; cursor:pointer; transition:opacity .15s; }
.bulk-btn:hover { opacity:.85; }
.bulk-confirm { background:#2E7D52; color:#fff; }
.bulk-cancel  { background:#CE1126; color:#fff; }
.bulk-clear { margin-left:auto; padding:7px 12px; border:1px solid rgba(255,255,255,.2); border-radius:8px; background:transparent; color:#ccc; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; flex-shrink:0; }
.bulk-clear:hover { background:rgba(255,255,255,.08); }
.bulk-bar-enter-active, .bulk-bar-leave-active { transition:all .2s ease; }
.bulk-bar-enter-from, .bulk-bar-leave-to { opacity:0; transform:translateY(-6px); }

/* Status chips */
.status-chip { display:inline-flex; align-items:center; padding:4px 10px; border-radius:6px; font:700 11px/1 'Plus Jakarta Sans'; white-space:nowrap; }
.s-new     { background:#F0EBE2; color:#7A7368; }
.s-confirm { background:#E7F2EB; color:#2E7D52; }
.s-cancel  { background:#FCE7EA; color:#CE1126; }

/* Checkbox column */
.th-check, .td-check { text-align:center; padding-left:10px !important; padding-right:6px !important; }
.row-check { width:16px; height:16px; cursor:pointer; accent-color:#CE1126; }
.row-selected td { background:#FEF3F4 !important; }

/* Table */
.data-table-wrap { border:1px solid #ECE7DE; border-radius:14px; overflow-x:auto; }
.data-table  { width:100%; border-collapse:collapse; font:500 13px/1.5 'Plus Jakarta Sans'; }
.data-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.data-table th { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; }
.data-table td { padding:12px 16px; border-bottom:1px solid #F0EBE2; vertical-align:middle; }
.data-table tbody tr:last-child td { border-bottom:none; }
.data-row { cursor:pointer; }
.data-row:hover:not(.detail-row) td { background:#FAF8F3; }
.row-expanded td { background:#F0EDE6 !important; }

.td-num  { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold { font:700 14px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.td-sub  { font:500 11px/1 'Plus Jakarta Sans'; color:#9A9389; margin-top:3px; }
.wa-link { color:#CE1126; text-decoration:none; font:600 13px/1 'Plus Jakarta Sans'; }
.cabang-badge { display:inline-flex; padding:4px 10px; border-radius:6px; background:#FCE7EA; color:#CE1126; font:600 11px/1 'Plus Jakarta Sans'; white-space:nowrap; }

.tipe-chip  { display:inline-flex; padding:4px 10px; border-radius:6px; font:600 11px/1 'Plus Jakarta Sans'; white-space:nowrap; }
.chip-tim   { background:#EEF2FF; color:#4338CA; }
.chip-pers  { background:#FEF3C7; color:#92400E; }
.td-cabang-mobile { display:none; }

.action-group { display:flex; align-items:center; gap:6px; }
.action-buttons { display:flex; gap:6px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }

.empty { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }

/* Detail expanded row */
.detail-row td { padding:0 !important; border-bottom:2px solid #E2DCD2; }
.detail-panel  { padding:20px 24px; background:#F7F4EE; display:flex; flex-direction:column; gap:16px; }
.detail-cols   { display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; }
.detail-block  { }
.detail-label  { font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.1em; text-transform:uppercase; color:#9A9389; margin-bottom:8px; }
.detail-val    { font:600 14px/1.3 'Plus Jakarta Sans'; color:#1A1613; }
.detail-nama   { font:700 16px/1.2 'Plus Jakarta Sans'; }
.detail-ketua  { color:#CE1126; }
.anggota-ol    { margin:0; padding-left:20px; display:flex; flex-direction:column; gap:5px; }
.anggota-ol li { font:500 14px/1.6 'Plus Jakarta Sans'; color:#1A1613; }

/* Toast */
.toast {
  position:fixed; bottom:28px; right:28px; z-index:9999;
  display:flex; align-items:center; gap:10px;
  padding:14px 20px; border-radius:12px; min-width:260px; max-width:380px;
  font:600 14px/1.4 'Plus Jakarta Sans'; box-shadow:0 8px 24px rgba(0,0,0,.18);
  pointer-events:none;
}
.toast.success { background:#1A1613; color:#fff; }
.toast.error   { background:#CE1126; color:#fff; }
.toast-icon    { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font:700 13px/1 Archivo; flex-shrink:0; }
.toast.success .toast-icon { background:rgba(255,255,255,.15); }
.toast.error   .toast-icon { background:rgba(0,0,0,.15); }
.toast-enter-active, .toast-leave-active { transition:all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(12px); }
.chevron { display:inline-block; font-size:18px; color:#C4BDB2; line-height:1; transition:transform .2s; user-select:none; }
.chevron.open { transform:rotate(90deg); }
.detail-actions { display:none; gap:8px; padding-top:14px; border-top:1px solid #E2DCD2; margin-top:2px; }
.detail-actions .btn-edit,
.detail-actions .btn-del { flex:1; padding:10px; text-align:center; font-size:13px; border-radius:10px; }

@media(max-width:900px) {
  .form-row-main { grid-template-columns:1fr 1fr; }
  .detail-cols   { grid-template-columns:1fr 1fr; }
}
@media(max-width:600px) {
  .form-row-main { grid-template-columns:1fr; }
  .form-row-2    { grid-template-columns:1fr; }
  .detail-cols   { grid-template-columns:1fr; }
  .action-group  { flex-wrap:wrap; }
}

@media (max-width: 767px) {
  .adm-main { padding: 16px 12px 50px; }
  .adm-section { padding: 14px; border-radius: 14px; }
  .section-header { gap: 10px; margin-bottom: 12px; }
  .section-title { font-size: 18px; margin: 4px 0 0; }
  .section-eyebrow { font-size: 11px; letter-spacing: .08em; }
  .inline-form { padding: 12px; gap: 10px; }
  .form-label { font-size: 12px; margin-bottom: 6px; }
  .btn-save, .btn-cancel { padding: 9px 12px; font-size: 12px; border-radius: 8px; }
  .btn-edit, .btn-del { padding: 5px 10px; font-size: 11px; border-radius: 6px; }
  .td-bold { font-size: 12px; }
  .td-num { font-size: 11px; }

  /* ── Mobile card layout ── */
  .data-table-wrap { border: none; background: transparent; overflow: visible; border-radius: 0; }
  .data-table { display: block; }
  .data-table thead { display: none; }
  .data-table tbody { display: flex; flex-direction: column; gap: 8px; }
  .data-row {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      "chk nama   status"
      "chk badges aksi";
    column-gap: 8px; row-gap: 6px;
    background: #fff; border: 1px solid #ECE7DE;
    border-radius: 14px; padding: 12px;
    cursor: pointer;
    max-width: 100%;
  }
  .row-expanded { border-radius: 14px 14px 0 0 !important; border-bottom-color: transparent !important; }
  .row-selected { background: #FEF3F4 !important; }
  .data-row td { padding: 0 !important; border: none !important; background: transparent !important; vertical-align: middle !important; min-width: 0; }
  .td-idx { display: none !important; }
  .td-check  { grid-area: chk; align-self: start; padding-top: 2px !important; }
  .td-nama   { grid-area: nama; align-self: center; min-width: 0; }
  .td-nama .td-bold, .td-nama .td-sub { overflow-wrap: anywhere; }
  .td-status { grid-area: status; align-self: start; display: flex; justify-content: flex-end; flex-shrink: 0; }
  .td-tipe   { grid-area: badges; align-self: center; display: flex; align-items: center; gap: 6px; min-width: 0; }
  .td-cabang { display: none !important; }
  .td-blok   { display: none !important; }
  .td-wa     { display: none !important; }
  .td-tgl    { display: none !important; }
  .td-aksi   { grid-area: aksi; align-self: center; display: flex; justify-content: flex-end; flex-shrink: 0; }
  .td-aksi .action-buttons { display: none !important; }
  .td-cabang-mobile {
    display: inline-flex !important;
    min-width: 0; flex-shrink: 1;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .tipe-chip { flex-shrink: 0; }

  .detail-row { display: block !important; }
  .detail-row td { display: block !important; padding: 0 !important; border: none !important; }
  .data-table tbody .detail-row {
    border: 1px solid #ECE7DE !important; border-top: none !important;
    border-radius: 0 0 14px 14px; background: #FAF8F3; margin-top: -8px;
  }
  .empty { display: block !important; text-align: center !important; padding: 18px 12px !important; font-size: 12px !important; }
  .bulk-bar { padding: 10px 12px; gap: 8px; }
  .bulk-count { font-size: 12px; }
  .bulk-btn { padding: 6px 10px; font-size: 11px; }
  .detail-panel { padding: 14px 12px; gap: 12px; }
  .detail-label { font-size: 10px; margin-bottom: 6px; }
  .detail-val { font-size: 12px; }
  .anggota-add { font-size: 12px; padding: 8px 12px; }
  .detail-actions { display: flex; }
  .detail-actions .btn-edit,
  .detail-actions .btn-del { flex: 1; padding: 10px; text-align: center; font-size: 13px; border-radius: 10px; }
}

@media (min-width: 768px) {
  .adm-main { padding: 28px 20px 70px; }
  .adm-section { padding: 24px; border-radius: 20px; }
  .section-title { font-size: 26px; }
  .section-header { gap: 16px; margin-bottom: 20px; }
  .btn-save, .btn-cancel { padding: 12px; font-size: 13px; }
}
</style>
