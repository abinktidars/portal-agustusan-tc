<template>
  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Manajemen</div>
          <h2 class="section-title">Jadwal Pertandingan</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari jadwal..." />
          <button class="tcr-btn-red" @click="openForm()">+ Tambah Jadwal</button>
        </div>
      </div>

      <!-- Modal Form Jadwal -->
      <div v-if="showForm" class="form-modal-overlay" @click.self="resetForm">
        <div class="form-modal-card">
          <div class="modal-hd">
            <h3 class="modal-ttl">{{ form.editId ? 'Edit' : 'Tambah' }} Jadwal</h3>
            <button type="button" class="modal-x" @click="resetForm">✕</button>
          </div>
          <form @submit.prevent="submit" class="modal-bd">
            <div>
              <label class="form-label">Kategori Lomba <span class="req">*</span></label>
              <select v-model="form.cabang" @change="onCabangChange" class="tcr-input">
                <option value="">Pilih kategori lomba...</option>
                <option v-for="k in kategoriStore.list" :key="k.id" :value="k.nama">{{ k.nama }} ({{ k.tipe || k.jenis }})</option>
              </select>
              <p v-if="!kategoriStore.list.length" class="hint">
                Belum ada kategori. <RouterLink :to="{ name:'admin-lomba' }">Tambah di sini →</RouterLink>
              </p>
            </div>

            <div class="modal-form-grid">
              <div>
                <label class="form-label">Tanggal Mulai <span class="req">*</span></label>
                <input v-model="form.tglMulai" type="date" class="tcr-input" />
              </div>
              <div>
                <label class="form-label">Tanggal Selesai <span class="req">*</span></label>
                <input v-model="form.tglSelesai" type="date" class="tcr-input" :min="form.tglMulai" />
              </div>
              <div>
                <label class="form-label">Jam Mulai <span class="req">*</span></label>
                <input v-model="form.jamMulai" type="time" class="tcr-input" />
              </div>
              <div>
                <label class="form-label">Jam Selesai <span class="req">*</span></label>
                <input v-model="form.jamSelesai" type="time" class="tcr-input" />
              </div>
            </div>

            <div>
              <label class="form-label">Babak</label>
              <input v-model="form.babak" list="babak-opts" type="text" class="tcr-input"
                placeholder="cth: Penyisihan, Semifinal, Final" />
              <datalist id="babak-opts">
                <option value="Penyisihan" />
                <option value="Babak Grup" />
                <option value="Perempat Final" />
                <option value="Semifinal" />
                <option value="Final" />
                <option value="Grand Final" />
                <option value="Puncak Acara" />
              </datalist>
            </div>

            <!-- Peserta Picker (smart) -->
            <div>
              <label class="form-label">Peserta</label>

              <!-- Beregu: Tim A vs Tim B -->
              <template v-if="form.jenis === 'Beregu' && registrasiForCabang.length">
                <div class="peserta-vs-row">
                  <select v-model="selectedTimA" class="tcr-input" @change="buildPeserta">
                    <option value="">Tim A — pilih dari pendaftar...</option>
                    <option v-for="r in registrasiForCabang" :key="r.id" :value="r.id">{{ r.label }}</option>
                  </select>
                  <span class="vs-sep">VS</span>
                  <select v-model="selectedTimB" class="tcr-input" @change="buildPeserta">
                    <option value="">Tim B — pilih dari pendaftar...</option>
                    <option v-for="r in registrasiForCabang" :key="r.id" :value="r.id">{{ r.label }}</option>
                  </select>
                </div>
              </template>

              <!-- Perorangan: toggle chips -->
              <template v-else-if="form.jenis === 'Perorangan' && registrasiForCabang.length">
                <div class="peserta-chip-wrap">
                  <button v-for="r in registrasiForCabang" :key="r.id"
                    type="button"
                    class="peserta-chip" :class="{ active: selectedPesertaList.includes(r.id) }"
                    @click="togglePeserta(r.id)">
                    {{ r.label }}
                  </button>
                </div>
              </template>

              <!-- Manual text (always shown, auto-updated by pickers) -->
              <input v-model="form.peserta" type="text" class="tcr-input"
                :style="registrasiForCabang.length ? 'margin-top:10px' : ''"
                :placeholder="form.jenis === 'Beregu' ? 'Tim A vs Tim B' : form.jenis === 'Perorangan' ? 'Nama peserta (dipisah koma)' : 'cth: Blok Anggrek vs Blok Dahlia'" />
              <p v-if="registrasiForCabang.length" class="hint">Dipilih dari pendaftar atau isi teks manual di atas.</p>
              <p v-else-if="form.cabang && !registrasiForCabang.length" class="hint">Belum ada pendaftar yang dikonfirmasi untuk {{ form.cabang }}. Isi manual.</p>
            </div>

            <div>
              <label class="form-label">Lokasi</label>
              <select v-model="form.lokasiId" class="tcr-input">
                <option value="">Pilih lokasi...</option>
                <option v-for="l in lokasiStore.list" :key="l.id" :value="l.id">{{ l.nama }}{{ l.alamat ? ' — ' + l.alamat : '' }}</option>
                <option value="__manual__">Isi Manual...</option>
              </select>
              <input v-if="form.lokasiId === '__manual__'" v-model="form.lokasiManual" type="text" class="tcr-input"
                style="margin-top:8px;" placeholder="Nama lokasi manual" />
              <p v-if="!lokasiStore.list.length" class="hint">
                Belum ada lokasi. <RouterLink :to="{ name:'admin-lokasi' }">Tambah di sini →</RouterLink>
              </p>
            </div>
            <div style="display:flex;gap:12px;">
              <button type="submit" class="btn-save">{{ form.editId ? 'Update' : 'Simpan' }} Jadwal</button>
              <button type="button" class="btn-cancel" @click="resetForm">Batal</button>
            </div>
          </form>
        </div>
      </div>

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
        <div v-for="j in paginated" :key="j.id" class="item-card" @click="selectedJadwal = j">
          <div class="item-card-header">
            <div style="display:flex;align-items:center;gap:7px;">
              <span class="dot" :style="{ background: tipeColor(j.kat) }"></span>
              <span class="item-nama">{{ j.cabang }}</span>
            </div>
            <span class="status-badge" :class="statusCls(j.status)">{{ j.status }}</span>
          </div>
          <div class="item-meta">📅 {{ tglRange(j) }} · 🕐 {{ j.jamMulai || j.jam }}–{{ j.jamSelesai }}</div>
          <div v-if="j.babak || j.jenis" class="item-badges">
            <span v-if="j.babak" class="item-babak">{{ j.babak }}</span>
            <span v-if="j.jenis" class="item-jenis" :class="j.jenis === 'Beregu' ? 'jenis-beregu' : 'jenis-perorangan'">{{ j.jenis }}</span>
          </div>
          <div v-if="j.peserta" class="item-sub">👥 {{ j.peserta }}</div>
          <div v-if="lokasiNama(j)" class="item-sub">📍 {{ lokasiNama(j) }}</div>
          <div v-if="j.hasilPertandingan" class="item-hasil">
            🏆 <strong>{{ j.hasilPertandingan }}</strong>
            <span v-if="j.pemenang"> · Pemenang: <strong>{{ j.pemenang }}</strong></span>
          </div>
          <div v-if="formatSetDetails(j.setDetails)" class="item-set-detail">Set: {{ formatSetDetails(j.setDetails) }}</div>
          <div class="item-actions" @click.stop>
            <button v-if="j.status === 'Berlangsung' || j.status === 'Selesai'"
              @click="openHasilForm(j)"
              :class="j.hasilPertandingan ? 'btn-hasil-edit' : 'btn-hasil-catat'">
              {{ j.hasilPertandingan ? 'Edit Hasil' : 'Catat Hasil' }}
            </button>
            <!-- Tombol hapus hasil (jika ada hasil) -->
            <template v-if="j.hasilPertandingan">
              <template v-if="deleteResultId === j.id">
                <button @click="confirmHapusHasil(j)" class="btn-confirm-del">Ya, Hapus</button>
                <button @click="cancelHapusHasil" class="btn-cancel-sm">Batal</button>
              </template>
              <button v-else @click="requestHapusHasil(j)" class="btn-del">Hapus Hasil</button>
            </template>
            <!-- Tombol edit & hapus jadwal (jika tidak ada hasil) -->
            <template v-else>
              <button @click="openForm(j)" class="btn-edit">Edit</button>
              <template v-if="deleteId === j.id">
                <button @click="confirmHapus(j)" class="btn-confirm-del">Ya, Hapus</button>
                <button @click="cancelHapus" class="btn-cancel-sm">Batal</button>
              </template>
              <button v-else @click="requestHapus(j)" class="btn-del">Hapus</button>
            </template>
          </div>
        </div>
        <div v-if="!filtered.length" class="empty" style="grid-column:1/-1;">Belum ada jadwal</div>
      </div>
      <PaginationBar v-model="page" :total="filtered.length" :per-page="PER_PAGE" />
    </div>
  </main>

  <!-- Modal Detail Jadwal -->
  <JadwalDetailModal
    :jadwal="selectedJadwal"
    @close="selectedJadwal = null"
    @daftar="selectedJadwal = null"
  />

  <!-- Modal Catat Hasil -->
  <div v-if="showHasilModal" class="modal-overlay" @click.self="closeHasilModal">
    <div class="modal-box">
      <div class="modal-title">{{ hasilTarget?.hasilPertandingan ? 'Edit' : 'Catat' }} Hasil Pertandingan</div>
      <div class="modal-sub">{{ hasilTarget?.cabang }} · {{ hasilTarget?.tgl }} · {{ hasilTarget?.jamMulai }}–{{ hasilTarget?.jamSelesai }}</div>

      <!-- Mode VS: input skor per tim -->
      <template v-if="isVsMatch">
        <div v-if="isVoliMatch" class="set-section">
          <div class="set-title">Detail Set (maks 3 set)</div>
          <div v-for="(setItem, idx) in visibleVoliSets" :key="idx" class="set-row">
            <div class="set-label">Set {{ idx + 1 }}</div>
            <input v-model="setItem.skorA" type="number" min="0" class="set-input" :placeholder="teamNames[0] || 'Tim A'" />
            <span class="set-sep">-</span>
            <input v-model="setItem.skorB" type="number" min="0" class="set-input" :placeholder="teamNames[1] || 'Tim B'" />
          </div>
          <div class="set-hint">Isi set 1 dan 2 dulu. Set 3 otomatis muncul jika skor set sementara 1-1.</div>
          <label class="form-label" style="margin-top:12px;">Skor Akhir (Otomatis)</label>
          <div class="score-row score-row-readonly">
            <div class="score-team">
              <div class="score-team-name">{{ teamNames[0] }}</div>
              <input :value="voliMatchScore.menangA" type="number" min="0" class="score-input" placeholder="0" readonly />
            </div>
            <div class="score-vs-sep">VS</div>
            <div class="score-team">
              <div class="score-team-name">{{ teamNames[1] }}</div>
              <input :value="voliMatchScore.menangB" type="number" min="0" class="score-input" placeholder="0" readonly />
            </div>
          </div>
          <div v-if="voliSetSummary" class="set-summary">Set: {{ voliSetSummary }}</div>
        </div>
        <template v-else>
          <label class="form-label">Skor Akhir <span class="req">*</span></label>
          <div class="score-row">
            <div class="score-team">
              <div class="score-team-name">{{ teamNames[0] }}</div>
              <input v-model="hasilForm.skorA" type="number" min="0" class="score-input" placeholder="0" />
            </div>
            <div class="score-vs-sep">VS</div>
            <div class="score-team">
              <div class="score-team-name">{{ teamNames[1] }}</div>
              <input v-model="hasilForm.skorB" type="number" min="0" class="score-input" placeholder="0" />
            </div>
          </div>
        </template>
        <div v-if="autoPemenang" class="auto-pemenang">
          🏆 Pemenang: <strong>{{ autoPemenang }}</strong>
        </div>
        <div v-else-if="(isVoliMatch && parsedVoliSets.length === 3) || (!isVoliMatch && hasilForm.skorA !== '' && hasilForm.skorB !== '')" class="auto-pemenang auto-seri">
          🤝 Seri / Draw
        </div>
      </template>

      <!-- Mode Perorangan: Juara 1, 2, 3 -->
      <template v-else-if="isPerorangan">
        <div class="juara-list">
          <div v-for="(juara, i) in ['juara1','juara2','juara3']" :key="juara" class="juara-item">
            <div class="juara-medal">{{ ['🥇','🥈','🥉'][i] }}</div>
            <div class="juara-field">
              <label class="form-label">
                Juara {{ i + 1 }} <span v-if="i === 0" class="req">*</span>
                <span v-else style="color:#9A9389;font-weight:500"> (opsional)</span>
              </label>
              <select v-model="hasilForm[juara]" class="tcr-input">
                <option value="">— Pilih Juara {{ i + 1 }} —</option>
                <option v-for="s in pesertaSuggestions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>
        </div>
      </template>

      <!-- Mode bebas: teks + pemenang -->
      <template v-else>
        <label class="form-label">Hasil / Keterangan <span class="req">*</span></label>
        <input v-model="hasilForm.hasilPertandingan" type="text" class="tcr-input"
          placeholder="cth: Juara 1 Blok Anggrek" />

        <label class="form-label" style="margin-top:14px;">Pemenang / Juara</label>
        <div v-if="pesertaSuggestions.length > 1" class="pemenang-chips">
          <button v-for="s in pesertaSuggestions" :key="s" type="button"
            class="peserta-chip" :class="{ active: hasilForm.pemenang === s }"
            @click="hasilForm.pemenang = s">{{ s }}</button>
        </div>
        <input v-model="hasilForm.pemenang" type="text" class="tcr-input"
          :style="pesertaSuggestions.length > 1 ? 'margin-top:8px' : ''"
          placeholder="Nama pemenang atau juara" />
      </template>

      <div style="display:flex;gap:10px;margin-top:18px;">
        <button @click="saveHasil" class="btn-save"
          :disabled="!canSaveHasil">
          Simpan Hasil
        </button>
        <button @click="closeHasilModal" class="btn-cancel">Batal</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useKategoriStore }   from '@/stores/useKategori'
import { useJadwalStore }     from '@/stores/useJadwal'
import { useHasilStore }      from '@/stores/useHasil'
import { useTipeStore }       from '@/stores/useTipe'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import { useLokasiStore }     from '@/stores/useLokasi'
import PaginationBar from '@/components/PaginationBar.vue'
import JadwalDetailModal from '@/components/JadwalDetailModal.vue'
import { exportToExcel } from '@/utils/exportExcel'

const kategoriStore   = useKategoriStore()
const jadwalStore     = useJadwalStore()
const hasilStore      = useHasilStore()
const tipeStore       = useTipeStore()
const registrasiStore = useRegistrasiStore()
const lokasiStore     = useLokasiStore()

const showForm      = ref(false)
const filterStatus  = ref('')
const search        = ref('')
const page          = ref(1)
const PER_PAGE      = 9
const selectedJadwal = ref(null)

const showHasilModal = ref(false)
const hasilTarget    = ref(null)
const hasilForm      = reactive({
  hasilPertandingan: '',
  pemenang: '',
  skorA: '',
  skorB: '',
  juara1: '',
  juara2: '',
  juara3: '',
  sets: [
    { skorA: '', skorB: '' },
    { skorA: '', skorB: '' },
    { skorA: '', skorB: '' },
  ],
})

const isVsMatch   = computed(() => !!hasilTarget.value?.peserta?.includes(' vs '))
const isPerorangan = computed(() => hasilTarget.value?.jenis === 'Perorangan' && !isVsMatch.value)
const isVoliMatch = computed(() => {
  const cabang = (hasilTarget.value?.cabang || '').toLowerCase()
  return isVsMatch.value && (cabang.includes('voli') || cabang.includes('volly'))
})
const teamNames   = computed(() => {
  if (!isVsMatch.value) return []
  return hasilTarget.value.peserta.split(' vs ').map(s => s.trim())
})
const parsedVoliSets = computed(() =>
  hasilForm.sets
    .map((s, idx) => ({
      idx,
      aRaw: String(s.skorA).trim(),
      bRaw: String(s.skorB).trim(),
    }))
    .filter(s => s.aRaw !== '' && s.bRaw !== '')
    .map(s => ({ idx: s.idx, a: Number(s.aRaw), b: Number(s.bRaw) }))
    .filter(s => Number.isFinite(s.a) && Number.isFinite(s.b))
)
const hasPartialVoliSet = computed(() =>
  hasilForm.sets.some(s => {
    const a = String(s.skorA).trim()
    const b = String(s.skorB).trim()
    return (a && !b) || (!a && b)
  })
)
const firstTwoVoliSets = computed(() => parsedVoliSets.value.filter(s => s.idx < 2))
const firstTwoVoliComplete = computed(() => firstTwoVoliSets.value.length === 2)
const firstTwoVoliScore = computed(() => {
  let menangA = 0
  let menangB = 0
  for (const setItem of firstTwoVoliSets.value) {
    if (setItem.a > setItem.b) menangA++
    if (setItem.b > setItem.a) menangB++
  }
  return { menangA, menangB }
})
const voliNeedsThirdSet = computed(() =>
  isVoliMatch.value
  && firstTwoVoliComplete.value
  && firstTwoVoliScore.value.menangA === 1
  && firstTwoVoliScore.value.menangB === 1
)
const visibleVoliSets = computed(() =>
  (voliNeedsThirdSet.value ? hasilForm.sets.slice(0, 3) : hasilForm.sets.slice(0, 2))
)
const hasPartialVisibleVoliSet = computed(() =>
  visibleVoliSets.value.some(s => {
    const a = String(s.skorA).trim()
    const b = String(s.skorB).trim()
    return (a && !b) || (!a && b)
  })
)
const voliSetSummary = computed(() => parsedVoliSets.value.map(s => `${s.a}-${s.b}`).join(', '))
const voliMatchScore = computed(() => {
  let menangA = 0
  let menangB = 0
  for (const setItem of parsedVoliSets.value) {
    if (setItem.a > setItem.b) menangA++
    if (setItem.b > setItem.a) menangB++
  }
  return { menangA, menangB }
})
const autoPemenang = computed(() => {
  if (!isVsMatch.value) return ''
  if (isVoliMatch.value && parsedVoliSets.value.length) {
    if (voliMatchScore.value.menangA > voliMatchScore.value.menangB) return teamNames.value[0]
    if (voliMatchScore.value.menangB > voliMatchScore.value.menangA) return teamNames.value[1]
    return ''
  }
  if (hasilForm.skorA === '' || hasilForm.skorB === '') return ''
  const a = Number(hasilForm.skorA), b = Number(hasilForm.skorB)
  if (a > b) return teamNames.value[0]
  if (b > a) return teamNames.value[1]
  return ''
})
const canSaveHasil = computed(() => {
  if (isVsMatch.value) {
    if (!isVoliMatch.value) return hasilForm.skorA !== '' && hasilForm.skorB !== ''
    if (!firstTwoVoliComplete.value) return false
    if (hasPartialVisibleVoliSet.value) return false
    if (voliNeedsThirdSet.value) return parsedVoliSets.value.length === 3
    return true
  }
  if (isPerorangan.value) return !!hasilForm.juara1.trim()
  return !!hasilForm.hasilPertandingan.trim()
})
watch(voliNeedsThirdSet, (needsThird) => {
  if (!needsThird) {
    hasilForm.sets[2].skorA = ''
    hasilForm.sets[2].skorB = ''
  }
})
const pesertaSuggestions = computed(() => {
  const p = hasilTarget.value?.peserta
  if (!p) return []
  if (p.includes(',')) return p.split(',').map(s => s.trim()).filter(Boolean)
  if (isPerorangan.value) return [p.trim()]
  return []
})

const form = reactive({ cabang:'', kat:'', jenis:'', babak:'', tglMulai:'', tglSelesai:'', jamMulai:'', jamSelesai:'', peserta:'', lokasiId:'', lokasiManual:'', editId:null })

// peserta selection state
const selectedTimA        = ref('')
const selectedTimB        = ref('')
const selectedPesertaList = ref([])

const tipeColor = (t) => tipeStore.warna(t)
const statusCls = (s) => ({ 'Berlangsung':'status-berlangsung', 'Selesai':'status-selesai', 'Akan Datang':'status-akandatang' }[s] || 'status-akandatang')
const tglRange  = (j) => {
  const mulai   = j.tglMulai || j.tgl || ''
  const selesai = j.tglSelesai || ''
  if (!selesai || selesai === mulai) return mulai
  return `${mulai} – ${selesai}`
}
const lokasiNama = (j) => {
  if (j.lokasiId) return lokasiStore.list.find(l => l.id === j.lokasiId)?.nama || j.lokasi || j.venue || ''
  return j.lokasi || j.venue || ''
}

// registrasi entries matching current cabang, mapped to { id, label }
const registrasiForCabang = computed(() => {
  if (!form.cabang) return []
  return registrasiStore.list
    .filter(r => r.cabang === form.cabang && r.status === 'confirm')
    .map(r => ({
      id: r.id || String(Math.random()),
      label: r.tipe === 'tim'
        ? `${r.namaRegu || r.namaKetua || '—'}${r.blokRumah ? ' (' + r.blokRumah + ')' : ''}`
        : `${r.nama || r.namaKetua || '—'}${r.blokRumah ? ' (' + r.blokRumah + ')' : ''}`
    }))
})

function buildPeserta() {
  const a = registrasiForCabang.value.find(r => r.id === selectedTimA.value)
  const b = registrasiForCabang.value.find(r => r.id === selectedTimB.value)
  if (a && b) form.peserta = `${a.label} vs ${b.label}`
  else if (a) form.peserta = a.label
  else if (b) form.peserta = b.label
}

function togglePeserta(id) {
  const idx = selectedPesertaList.value.indexOf(id)
  if (idx >= 0) selectedPesertaList.value.splice(idx, 1)
  else selectedPesertaList.value.push(id)
  const names = selectedPesertaList.value
    .map(pid => registrasiForCabang.value.find(r => r.id === pid)?.label)
    .filter(Boolean)
  form.peserta = names.join(', ')
}

const filtered  = computed(() => {
  const q = search.value.toLowerCase()
  return jadwalStore.listWithStatus.filter(j =>
    (!filterStatus.value || j.status === filterStatus.value) &&
    (!q || (j.cabang||'').toLowerCase().includes(q) || (j.peserta||'').toLowerCase().includes(q) || lokasiNama(j).toLowerCase().includes(q))
  )
})
const paginated = computed(() => filtered.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))
watch([filterStatus, search], () => { page.value = 1 })

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',          field: (_, i) => i + 1 },
    { label: 'Cabang',      field: 'cabang' },
    { label: 'Tanggal',     field: 'tgl' },
    { label: 'Jam Mulai',   field: r => r.jamMulai || r.jam || '' },
    { label: 'Jam Selesai', field: r => r.jamSelesai || '' },
    { label: 'Peserta',     field: 'peserta' },
    { label: 'Lokasi',      field: r => lokasiNama(r) },
    { label: 'Status',      field: 'status' },
    { label: 'Hasil',       field: r => r.hasilPertandingan || '' },
    { label: 'Pemenang',    field: r => r.pemenang || '' },
  ], 'jadwal-pertandingan')
}

function onCabangChange() {
  const found = kategoriStore.list.find(k => k.nama === form.cabang)
  form.kat   = found ? (found.tipe || '') : ''
  form.jenis = found ? (found.jenis || '') : ''
  // reset peserta selections when cabang changes
  selectedTimA.value        = ''
  selectedTimB.value        = ''
  selectedPesertaList.value = []
  form.peserta = ''
}

function toInputDate(d) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

function openForm(j = null) {
  selectedTimA.value        = ''
  selectedTimB.value        = ''
  selectedPesertaList.value = []
  if (j) {
    const found   = kategoriStore.list.find(k => k.nama === j.cabang)
    const hasId   = j.lokasiId && lokasiStore.list.some(l => l.id === j.lokasiId)
    const manual  = !hasId && (j.lokasi || j.venue || '')
    const rawMulai   = j.tglMulaiRaw || toInputDate(j.tglDate) || j.tgl || ''
    const rawSelesai = j.tglSelesaiRaw || toInputDate(j.tglSelesaiDate) || rawMulai
    Object.assign(form, {
      cabang:      j.cabang,
      kat:         j.kat || '',
      jenis:       found?.jenis || '',
      babak:       j.babak || '',
      tglMulai:    rawMulai,
      tglSelesai:  rawSelesai,
      jamMulai:    j.jamMulai || j.jam || '',
      jamSelesai:  j.jamSelesai || '',
      peserta:     j.peserta || '',
      lokasiId:    hasId ? j.lokasiId : (manual ? '__manual__' : ''),
      lokasiManual:manual || '',
      editId:      j.id
    })
  } else {
    Object.assign(form, { cabang:'', kat:'', jenis:'', babak:'', tglMulai:'', tglSelesai:'', jamMulai:'', jamSelesai:'', peserta:'', lokasiId:'', lokasiManual:'', editId:null })
  }
  showForm.value = true
}

function resetForm() {
  showForm.value = false
  selectedTimA.value        = ''
  selectedTimB.value        = ''
  selectedPesertaList.value = []
  Object.assign(form, { cabang:'', kat:'', jenis:'', babak:'', tglMulai:'', tglSelesai:'', jamMulai:'', jamSelesai:'', peserta:'', lokasiId:'', lokasiManual:'', editId:null })
}

async function submit() {
  if (!form.cabang || !form.tglMulai || !form.jamMulai || !form.jamSelesai) {
    alert('Kategori, Tanggal, dan Jam wajib diisi!')
    return
  }
  const { editId, lokasiId, lokasiManual, ...rest } = form

  let finalLokasiId = lokasiId === '__manual__' ? null : (lokasiId || null)

  if (lokasiId === '__manual__' && lokasiManual.trim()) {
    const existing = lokasiStore.list.find(l => l.nama.toLowerCase() === lokasiManual.trim().toLowerCase())
    if (existing) {
      finalLokasiId = existing.id
    } else {
      finalLokasiId = await lokasiStore.add({
        nama:       lokasiManual.trim(),
        alamat:     '',
        kapasitas:  0,
        urutan:     lokasiStore.list.length + 1,
        keterangan: '',
      })
    }
  }

  // tgl = tglMulai (raw) untuk Firestore ordering, simpan juga tglMulai & tglSelesai
  const payload = {
    ...rest,
    tgl:      form.tglMulai,
    tglSelesai: form.tglSelesai || form.tglMulai,
    lokasiId: finalLokasiId,
  }
  editId ? await jadwalStore.update(editId, payload) : await jadwalStore.add(payload)
  resetForm()
}

const deleteId = ref(null)
const deleteResultId = ref(null)

function requestHapus(j) { deleteId.value = j.id }
function cancelHapus()    { deleteId.value = null }
function confirmHapus(j)  { deleteId.value = null; jadwalStore.remove(j.id) }

function requestHapusHasil(j) { deleteResultId.value = j.id }
function cancelHapusHasil()    { deleteResultId.value = null }
function confirmHapusHasil(j) {
  deleteResultId.value = null
  jadwalStore.update(j.id, {
    hasilPertandingan: null,
    pemenang: null,
    juara1: null,
    juara2: null,
    juara3: null,
    setDetails: null,
  })
}

function resetVoliSets() {
  hasilForm.sets.forEach(setItem => {
    setItem.skorA = ''
    setItem.skorB = ''
  })
}

function formatSetDetails(setDetails) {
  if (!setDetails) return ''
  if (Array.isArray(setDetails)) return setDetails.filter(Boolean).join(', ')
  return String(setDetails)
}

function hydrateVoliSets(setDetails) {
  resetVoliSets()
  const values = Array.isArray(setDetails)
    ? setDetails
    : (setDetails ? String(setDetails).split(',') : [])
  values.slice(0, 3).forEach((v, idx) => {
    const m = String(v).match(/(\d+)\s*[–\-]\s*(\d+)/)
    if (!m) return
    hasilForm.sets[idx].skorA = m[1]
    hasilForm.sets[idx].skorB = m[2]
  })
}

function openHasilForm(j) {
  hasilTarget.value = j
  hasilForm.pemenang            = j.pemenang  || ''
  hasilForm.hasilPertandingan   = ''
  hasilForm.skorA               = ''
  hasilForm.skorB               = ''
  hasilForm.juara1              = j.juara1    || ''
  hasilForm.juara2              = j.juara2    || ''
  hasilForm.juara3              = j.juara3    || ''
  resetVoliSets()
  if (j.peserta?.includes(' vs ') && j.hasilPertandingan) {
    const m = j.hasilPertandingan.match(/(\d+)\s*[–\-]\s*(\d+)/)
    if (m) { hasilForm.skorA = m[1]; hasilForm.skorB = m[2] }
    if ((j.cabang || '').toLowerCase().includes('voli') || (j.cabang || '').toLowerCase().includes('volly')) {
      hydrateVoliSets(j.setDetails)
    }
  } else if (j.jenis !== 'Perorangan') {
    hasilForm.hasilPertandingan = j.hasilPertandingan || ''
  }
  showHasilModal.value = true
}

function closeHasilModal() {
  showHasilModal.value        = false
  hasilTarget.value           = null
  hasilForm.hasilPertandingan = ''
  hasilForm.pemenang          = ''
  hasilForm.skorA             = ''
  hasilForm.skorB             = ''
  hasilForm.juara1            = ''
  hasilForm.juara2            = ''
  hasilForm.juara3            = ''
  resetVoliSets()
}

async function saveHasil() {
  if (!hasilTarget.value) return
  const j = hasilTarget.value
  let hasil, pemenang, extra = {}

  // Base record untuk koleksi hasil
  const tglRaw = j.tglMulaiRaw
    || (j.tglDate instanceof Date ? j.tglDate.toISOString().slice(0, 10) : null)
    || j.tgl
  const hasilRecord = {
    cabang:   j.cabang,
    kat:      j.kat || '',
    tgl:      tglRaw,
    jadwalId: j.id,
  }

  if (isVsMatch.value) {
    let a = 0
    let b = 0
    let setDetails = []

    if (isVoliMatch.value) {
      if (hasPartialVisibleVoliSet.value) {
        alert('Detail set voli harus diisi lengkap (kiri-kanan).')
        return
      }
      if (!firstTwoVoliComplete.value) {
        alert('Isi set 1 dan set 2 untuk pertandingan voli.')
        return
      }
      if (voliNeedsThirdSet.value && parsedVoliSets.value.length !== 3) {
        alert('Karena skor set sementara 1-1, isi set 3 untuk pertandingan voli.')
        return
      }
      a = voliMatchScore.value.menangA
      b = voliMatchScore.value.menangB
      setDetails = parsedVoliSets.value.map(s => `${s.a}-${s.b}`)
      hasilForm.skorA = String(a)
      hasilForm.skorB = String(b)
      extra = { ...extra, setDetails }
    } else {
      if (hasilForm.skorA === '' || hasilForm.skorB === '') return
      a = Number(hasilForm.skorA)
      b = Number(hasilForm.skorB)
    }

    hasil    = `${teamNames.value[0]} ${a} – ${b} ${teamNames.value[1]}`
    pemenang = autoPemenang.value || 'Seri'
    Object.assign(hasilRecord, {
      timA:  teamNames.value[0],
      timB:  teamNames.value[1],
      skor:  `${a} – ${b}`,
      juara: pemenang,
      ...(extra.setDetails ? { setDetails: extra.setDetails } : {}),
    })
  } else if (isPerorangan.value) {
    if (!hasilForm.juara1.trim()) return
    const parts = [`Juara 1: ${hasilForm.juara1.trim()}`]
    if (hasilForm.juara2.trim()) parts.push(`Juara 2: ${hasilForm.juara2.trim()}`)
    if (hasilForm.juara3.trim()) parts.push(`Juara 3: ${hasilForm.juara3.trim()}`)
    hasil    = parts.join(' · ')
    pemenang = hasilForm.juara1.trim()
    extra    = { juara1: hasilForm.juara1.trim(), juara2: hasilForm.juara2.trim(), juara3: hasilForm.juara3.trim() }
    Object.assign(hasilRecord, {
      juara:  pemenang,
      juara1: hasilForm.juara1.trim(),
      juara2: hasilForm.juara2.trim(),
      juara3: hasilForm.juara3.trim(),
    })
  } else {
    if (!hasilForm.hasilPertandingan.trim()) return
    hasil    = hasilForm.hasilPertandingan.trim()
    pemenang = hasilForm.pemenang.trim()
    Object.assign(hasilRecord, {
      timA:  j.peserta || '',
      timB:  '',
      skor:  hasil,
      juara: pemenang,
    })
  }

  // Simpan ke jadwal (perilaku lama, tetap dipertahankan)
  await jadwalStore.update(j.id, { hasilPertandingan: hasil, pemenang, setDetails: null, ...extra })

  // Simpan ke koleksi hasil (baru)
  await hasilStore.fetch()  // refresh dulu agar list terkini
  const existing = hasilStore.list.find(h => h.jadwalId === j.id)
  if (existing) {
    await hasilStore.update(existing.id, hasilRecord)
  } else {
    await hasilStore.add(hasilRecord)
  }

  closeHasilModal()
}

onMounted(() => { tipeStore.fetch(); kategoriStore.fetch(); jadwalStore.fetch(); hasilStore.fetch(); registrasiStore.fetch(); lokasiStore.fetch() })
</script>

<style scoped>
.form-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
.form-modal-card    { background:#fff; border-radius:20px; width:100%; max-width:680px; max-height:90vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,.25); }
.modal-hd      { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-ttl     { font:800 18px/1.2 Archivo; color:#1A1613; margin:0; }
.modal-x       { width:32px; height:32px; border-radius:50%; border:none; background:#F0EBE2; color:#5A534B; font:700 16px/1 Archivo; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.modal-x:hover { background:#E2DCD2; }
.modal-bd      { padding:20px 24px 24px; display:flex; flex-direction:column; gap:16px; }
.modal-form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; }
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow{ font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#CE1126; }
.section-title  { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }

.inline-form { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:16px; padding:20px; margin-bottom:24px; display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; align-items:end; }
.form-label  { display:block; font:700 13px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.req { color:#CE1126; }
.hint { font:500 12px/1.4 'Plus Jakarta Sans'; color:#9A9389; margin:6px 0 0; }
.hint a { color:#CE1126; }
.btn-save   { flex:1; padding:13px; border:none; border-radius:12px; background:#CE1126; color:#fff; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-cancel { flex:1; padding:13px; border:1.5px solid #E2DCD2; border-radius:12px; background:transparent; color:#1A1613; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

/* peserta picker */
.peserta-vs-row { display:flex; align-items:center; gap:10px; }
.peserta-vs-row .tcr-input { flex:1; }
.vs-sep { font:800 14px/1 Archivo; color:#CE1126; flex-shrink:0; letter-spacing:.05em; }
.peserta-chip-wrap { display:flex; flex-wrap:wrap; gap:8px; }
.peserta-chip { padding:8px 14px; border:1.5px solid #E2DCD2; border-radius:8px; background:#fff; color:#5A534B; font:600 13px/1 'Plus Jakarta Sans'; cursor:pointer; transition:all .15s; }
.peserta-chip.active { border-color:#CE1126; background:#FBEAEC; color:#CE1126; }
.peserta-chip:hover:not(.active) { border-color:#C0871C; background:#FBF1DD; }

.filter-bar   { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
.filter-count { font:600 13px/1 'Plus Jakarta Sans'; color:#7A7368; flex-shrink:0; }

.card-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }
.item-card  { background:#FAF8F3; border:1px solid #E2DCD2; border-radius:14px; padding:16px; cursor:pointer; transition:border-color .15s, box-shadow .15s; }
.item-card:hover { border-color:#CE1126; box-shadow:0 2px 12px rgba(206,17,38,.1); }
.item-card-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:10px; }
.item-nama  { font:800 15px/1.2 Archivo; color:#1A1613; }
.item-meta  { font:600 13px/1.4 'Plus Jakarta Sans'; color:#7A7368; margin-bottom:6px; }
.item-badges { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px; }
.item-babak  { font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.05em; text-transform:uppercase; color:#2D5B8A; background:#E7EEF6; border-radius:6px; padding:3px 8px; }
.item-jenis  { font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.05em; text-transform:uppercase; border-radius:6px; padding:3px 8px; }
.jenis-beregu     { color:#2E7D52; background:#DCF0E5; }
.jenis-perorangan { color:#6B3FA0; background:#F0E8FF; }
.item-sub   { font:500 12px/1.4 'Plus Jakarta Sans'; color:#5A534B; margin-bottom:5px; }
.item-actions { display:flex; gap:8px; margin-top:12px; }
.dot  { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; margin-top:2px; }
.btn-edit { padding:6px 14px; border:1px solid #E2DCD2; border-radius:8px; background:#fff; color:#1A1613; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.btn-del  { padding:6px 14px; border:1px solid #FBEAEC; border-radius:8px; background:#FBEAEC; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; cursor:pointer; }
.empty    { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
.item-hasil { font:600 12px/1.4 'Plus Jakarta Sans'; color:#1E5C38; background:#DCF0E5; border-radius:8px; padding:7px 10px; margin-bottom:6px; }
.item-set-detail { font:600 11px/1.35 'Plus Jakarta Sans'; color:#7A5C00; background:#FBF1DD; border-radius:8px; padding:6px 10px; margin-bottom:6px; }
.btn-hasil-catat       { padding:6px 12px; border:1.5px solid #2E7D52; border-radius:8px; background:#E7F2EB; color:#2E7D52; font:700 12px/1 'Plus Jakarta Sans'; cursor:pointer; transition:background .15s; white-space:nowrap; }
.btn-hasil-catat:hover { background:#2E7D52; color:#fff; }
.btn-hasil-edit        { padding:6px 12px; border:1.5px solid #C0871C; border-radius:8px; background:#FBF1DD; color:#C0871C; font:700 12px/1 'Plus Jakarta Sans'; cursor:pointer; transition:background .15s; white-space:nowrap; }
.btn-hasil-edit:hover  { background:#C0871C; color:#fff; }
.btn-confirm-del { padding:6px 10px; border:1px solid #CE1126; border-radius:7px; background:#CE1126; color:#fff; font:700 11px/1 'Plus Jakarta Sans'; cursor:pointer; white-space:nowrap; }
.btn-cancel-sm   { padding:6px 10px; border:1px solid #E2DCD2; border-radius:7px; background:#fff; color:#5A534B; font:700 11px/1 'Plus Jakarta Sans'; cursor:pointer; white-space:nowrap; }

.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; }
.modal-box     { background:#fff; border-radius:18px; padding:28px; width:100%; max-width:460px; box-shadow:0 8px 40px rgba(0,0,0,.22); }
.modal-title   { font:800 20px/1.2 Archivo; color:#1A1613; margin-bottom:4px; }
.modal-sub     { font:500 13px/1.4 'Plus Jakarta Sans'; color:#7A7368; margin-bottom:20px; }
.pemenang-chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:4px; }
.juara-list     { display:flex; flex-direction:column; gap:14px; }
.juara-item     { display:flex; align-items:flex-start; gap:12px; }
.juara-medal    { font-size:22px; line-height:1; padding-top:22px; flex-shrink:0; }
.juara-field    { flex:1; }
.score-row      { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.score-team     { flex:1; text-align:center; }
.score-team-name{ font:700 12px/1.4 'Plus Jakarta Sans'; color:#5A534B; margin-bottom:8px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.score-input    { width:100%; text-align:center; font:800 32px/1 Archivo; color:#CE1126; border:2px solid #E2DCD2; border-radius:12px; padding:12px 8px; background:#FAF8F3; outline:none; }
.score-input:focus { border-color:#CE1126; background:#fff; }
.score-row-readonly .score-input { background:#F1ECE2; color:#7A7368; border-color:#D8D0C1; cursor:not-allowed; }
.score-row-readonly .score-input:focus { background:#F1ECE2; border-color:#D8D0C1; }
.score-vs-sep   { font:800 18px/1 Archivo; color:#9A9389; flex-shrink:0; }
.auto-pemenang  { background:#DCF0E5; border-radius:10px; padding:10px 14px; font:600 14px/1.4 'Plus Jakarta Sans'; color:#1E5C38; text-align:center; }
.auto-seri      { background:#FBF1DD; color:#7A5C00; }
.set-section    { margin:-2px 0 12px; background:#FAF8F3; border:1px solid #E2DCD2; border-radius:12px; padding:10px; }
.set-title      { font:700 12px/1 'Plus Jakarta Sans'; color:#1A1613; margin-bottom:8px; }
.set-row        { display:grid; grid-template-columns:52px 1fr auto 1fr; align-items:center; gap:8px; margin-bottom:8px; }
.set-row:last-child { margin-bottom:0; }
.set-label      { font:700 11px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.04em; text-transform:uppercase; }
.set-input      { width:100%; text-align:center; font:700 14px/1 'Plus Jakarta Sans'; color:#1A1613; border:1.5px solid #E2DCD2; border-radius:8px; padding:8px 6px; background:#fff; outline:none; }
.set-input:focus{ border-color:#CE1126; }
.set-sep        { font:800 14px/1 Archivo; color:#9A9389; }
.set-hint       { font:500 11px/1.35 'Plus Jakarta Sans'; color:#9A9389; margin-top:4px; }
.set-summary    { margin-top:6px; font:700 11px/1.35 'Plus Jakarta Sans'; color:#7A5C00; background:#FBF1DD; border-radius:8px; padding:6px 8px; }

@media (max-width: 767px) {
  .adm-main { padding: 16px 12px 50px; }
  .adm-section { padding: 14px; border-radius: 14px; }
  .section-header { gap: 10px; margin-bottom: 12px; }
  .section-title { font-size: 18px; margin: 4px 0 0; }
  .section-eyebrow { font-size: 11px; letter-spacing: .08em; }
  .inline-form { padding: 12px; gap: 10px; grid-template-columns: 1fr; }
  .form-label { font-size: 12px; margin-bottom: 6px; }
  .btn-save, .btn-cancel { padding: 9px 12px; font-size: 12px; border-radius: 8px; }
  .btn-edit, .btn-del { padding: 5px 10px; font-size: 11px; border-radius: 6px; }
  .empty { padding: 18px 12px; font-size: 12px; }
  .filter-bar { gap: 8px; margin-bottom: 14px; }
  .filter-count { font-size: 12px; }
  .peserta-vs-row { flex-direction: column; gap: 6px; }
  .vs-sep { text-align: center; }
  .peserta-chip { padding: 6px 10px; font-size: 12px; }
  .item-card { padding: 12px; }
  .item-nama { font-size: 13px; }
  .item-meta, .item-sub { font-size: 12px; }
  .card-grid { gap: 10px; }
  .item-actions { gap: 6px; }
  .modal-box { padding: 16px 14px; border-radius: 14px; }
  .modal-title { font-size: 16px; }
  .modal-sub { font-size: 12px; margin-bottom: 14px; }
  .score-input { font-size: 22px; padding: 10px 6px; }
}

@media (min-width: 768px) {
  .adm-main { padding: 28px 20px 70px; }
  .adm-section { padding: 24px; border-radius: 20px; }
  .section-title { font-size: 26px; }
  .section-header { gap: 16px; margin-bottom: 20px; }
  .btn-save, .btn-cancel { padding: 12px; font-size: 13px; }
}
</style>
