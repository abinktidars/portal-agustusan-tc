import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as fb from '@/firebase/helpers'

const CABANG_LIST = ['Voli Putra','Voli Putri','Badminton Beregu','Futsal Anak','Mobile Legends','Balap Karung','Tarik Tambang','Makan Kerupuk','Balap Kelereng','Panjat Pinang']

const FALLBACK = [
  { id:'1',  tgl:'11 Jul', tglDate:new Date('2025-07-11'), jamMulai:'08:00', jamSelesai:'10:00', cabang:'Balap Karung',       kat:'Tradisional', peserta:'Penyisihan — Kategori Anak',        venue:'Jl. Utama Cluster' },
  { id:'2',  tgl:'11 Jul', tglDate:new Date('2025-07-11'), jamMulai:'10:00', jamSelesai:'12:00', cabang:'Makan Kerupuk',      kat:'Tradisional', peserta:'Penyisihan — Umum',                 venue:'Lapangan Tengah' },
  { id:'3',  tgl:'19 Jul', tglDate:new Date('2025-07-19'), jamMulai:'16:00', jamSelesai:'18:00', cabang:'Voli Putra',         kat:'Olahraga',    peserta:'Blok Anggrek vs Blok Dahlia',       venue:'Lapangan Voli' },
  { id:'4',  tgl:'26 Jul', tglDate:new Date('2025-07-26'), jamMulai:'16:00', jamSelesai:'18:00', cabang:'Voli Putri',         kat:'Olahraga',    peserta:'Blok Bougenville vs Blok Cempaka',  venue:'Lapangan Voli' },
  { id:'5',  tgl:'01 Agu', tglDate:new Date('2025-08-01'), jamMulai:'19:30', jamSelesai:'22:00', cabang:'Mobile Legends',     kat:'E-Sport',     peserta:'Penyisihan Grup A',                 venue:'Aula RW' },
  { id:'6',  tgl:'02 Agu', tglDate:new Date('2025-08-02'), jamMulai:'16:00', jamSelesai:'18:00', cabang:'Futsal Anak',        kat:'Olahraga',    peserta:'Blok Anggrek vs Blok Edelweis',     venue:'Lapangan Futsal' },
  { id:'7',  tgl:'08 Agu', tglDate:new Date('2025-08-08'), jamMulai:'15:30', jamSelesai:'18:00', cabang:'Badminton Beregu',   kat:'Olahraga',    peserta:'Blok Dahlia vs Blok Bougenville',   venue:'GOR Cluster' },
  { id:'8',  tgl:'09 Agu', tglDate:new Date('2025-08-09'), jamMulai:'16:00', jamSelesai:'18:00', cabang:'Tarik Tambang',      kat:'Tradisional', peserta:'Semifinal — 4 Blok',                venue:'Lapangan Tengah' },
  { id:'9',  tgl:'15 Agu', tglDate:new Date('2025-08-15'), jamMulai:'08:00', jamSelesai:'11:00', cabang:'Voli Putra',         kat:'Olahraga',    peserta:'Babak Final',                       venue:'Lapangan Voli' },
  { id:'10', tgl:'15 Agu', tglDate:new Date('2025-08-15'), jamMulai:'20:00', jamSelesai:'23:00', cabang:'Mobile Legends',     kat:'E-Sport',     peserta:'Grand Final',                       venue:'Aula RW' },
  { id:'11', tgl:'17 Agu', tglDate:new Date('2025-08-17'), jamMulai:'07:00', jamSelesai:'10:00', cabang:'Upacara & Karnaval', kat:'Acara',       peserta:'Seluruh Warga',                     venue:'Jl. Utama Cluster' },
  { id:'12', tgl:'17 Agu', tglDate:new Date('2025-08-17'), jamMulai:'13:00', jamSelesai:'17:00', cabang:'Panjat Pinang',      kat:'Tradisional', peserta:'Puncak Acara — Final',              venue:'Lapangan Tengah' },
]

function computeStatus(j) {
  if (j.hasilPertandingan) return 'Selesai'
  if (!j.tglDate || !j.jamMulai) return 'Akan Datang'
  const [hM, mM] = j.jamMulai.split(':').map(Number)
  const [hS, mS] = (j.jamSelesai || '23:59').split(':').map(Number)
  const startDate = j.tglDate instanceof Date ? j.tglDate : new Date(j.tglDate)
  const endDate   = j.tglSelesaiDate
    ? (j.tglSelesaiDate instanceof Date ? j.tglSelesaiDate : new Date(j.tglSelesaiDate))
    : new Date(startDate)
  const start = new Date(startDate)
  start.setHours(hM, mM, 0, 0)
  const end = new Date(endDate)
  end.setHours(hS, mS, 0, 0)
  const now = new Date()
  if (now < start) return 'Akan Datang'
  if (now <= end)  return 'Berlangsung'
  return 'Selesai'
}

export const useJadwalStore = defineStore('jadwal', () => {
  const list    = ref([])
  const loading = ref(false)
  const filterCabang = ref('Semua')
  const filterStatus = ref('Semua')

  const cabangOptions = computed(() => ['Semua', ...new Set(list.value.map(j => j.cabang))])
  const statusOptions  = ['Semua', 'Berlangsung', 'Akan Datang', 'Selesai']

  function startTimestamp(j) {
    const tglDate = j.tglDate instanceof Date ? j.tglDate : (j.tglDate ? new Date(j.tglDate) : null)
    if (!tglDate || Number.isNaN(tglDate.getTime())) return Infinity
    const jam = j.jamMulai || j.jam || '00:00'
    const [h, m] = jam.split(':').map(Number)
    const start = new Date(tglDate)
    start.setHours(h || 0, m || 0, 0, 0)
    return start.getTime()
  }

  const listWithStatus = computed(() =>
    list.value
      .map(j => ({ ...j, status: computeStatus(j) }))
      .sort((a, b) => startTimestamp(a) - startTimestamp(b))
  )

  const filtered = computed(() => listWithStatus.value.filter(j =>
    (filterCabang.value === 'Semua' || j.cabang === filterCabang.value) &&
    (filterStatus.value  === 'Semua' || j.status  === filterStatus.value)
  ))

  const upcoming = computed(() => listWithStatus.value.filter(j => j.status !== 'Selesai').slice(0, 3))

  async function fetch() {
    loading.value = true
    try {
      const data = await fb.getJadwal()
      list.value = data.length ? data : FALLBACK
    } catch {
      list.value = FALLBACK
    } finally {
      loading.value = false
    }
  }

  async function add(data) {
    await fb.addJadwal(data)
    await fetch()
  }
  async function update(id, data) {
    await fb.updateJadwal(id, data)
    await fetch()
  }
  async function remove(id) {
    await fb.deleteJadwal(id)
    await fetch()
  }

  return { list, listWithStatus, loading, filterCabang, filterStatus, cabangOptions, statusOptions, filtered, upcoming, fetch, add, update, remove, computeStatus, CABANG_LIST }
})
