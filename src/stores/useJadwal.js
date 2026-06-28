import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as fb from '@/firebase/helpers'

const CABANG_LIST = ['Voli Putra','Voli Putri','Badminton Beregu','Futsal Anak','Mobile Legends','Balap Karung','Tarik Tambang','Makan Kerupuk','Balap Kelereng','Panjat Pinang']

const FALLBACK = [
  { id:'1', tgl:'11 Jul', jam:'08.00', cabang:'Balap Karung',      kat:'Tradisional', peserta:'Penyisihan — Kategori Anak',         venue:'Jl. Utama Cluster',  status:'Selesai' },
  { id:'2', tgl:'11 Jul', jam:'10.00', cabang:'Makan Kerupuk',     kat:'Tradisional', peserta:'Penyisihan — Umum',                  venue:'Lapangan Tengah',    status:'Selesai' },
  { id:'3', tgl:'19 Jul', jam:'16.00', cabang:'Voli Putra',        kat:'Olahraga',    peserta:'Blok Anggrek vs Blok Dahlia',        venue:'Lapangan Voli',      status:'Selesai' },
  { id:'4', tgl:'26 Jul', jam:'16.00', cabang:'Voli Putri',        kat:'Olahraga',    peserta:'Blok Bougenville vs Blok Cempaka',   venue:'Lapangan Voli',      status:'Selesai' },
  { id:'5', tgl:'01 Agu', jam:'19.30', cabang:'Mobile Legends',    kat:'E-Sport',     peserta:'Penyisihan Grup A',                  venue:'Aula RW',            status:'Berlangsung' },
  { id:'6', tgl:'02 Agu', jam:'16.00', cabang:'Futsal Anak',       kat:'Olahraga',    peserta:'Blok Anggrek vs Blok Edelweis',      venue:'Lapangan Futsal',    status:'Akan Datang' },
  { id:'7', tgl:'08 Agu', jam:'15.30', cabang:'Badminton Beregu',  kat:'Olahraga',    peserta:'Blok Dahlia vs Blok Bougenville',    venue:'GOR Cluster',        status:'Akan Datang' },
  { id:'8', tgl:'09 Agu', jam:'16.00', cabang:'Tarik Tambang',     kat:'Tradisional', peserta:'Semifinal — 4 Blok',                 venue:'Lapangan Tengah',    status:'Akan Datang' },
  { id:'9', tgl:'15 Agu', jam:'08.00', cabang:'Voli Putra',        kat:'Olahraga',    peserta:'Babak Final',                        venue:'Lapangan Voli',      status:'Akan Datang' },
  { id:'10',tgl:'15 Agu', jam:'20.00', cabang:'Mobile Legends',    kat:'E-Sport',     peserta:'Grand Final',                        venue:'Aula RW',            status:'Akan Datang' },
  { id:'11',tgl:'17 Agu', jam:'07.00', cabang:'Upacara & Karnaval',kat:'Acara',       peserta:'Seluruh Warga',                      venue:'Jl. Utama Cluster',  status:'Akan Datang' },
  { id:'12',tgl:'17 Agu', jam:'13.00', cabang:'Panjat Pinang',     kat:'Tradisional', peserta:'Puncak Acara — Final',               venue:'Lapangan Tengah',    status:'Akan Datang' },
]

export const useJadwalStore = defineStore('jadwal', () => {
  const list    = ref([])
  const loading = ref(false)
  const filterCabang = ref('Semua')
  const filterStatus = ref('Semua')

  const cabangOptions = computed(() => ['Semua', ...new Set(list.value.map(j => j.cabang))])
  const statusOptions  = ['Semua', 'Berlangsung', 'Akan Datang', 'Selesai']

  const filtered = computed(() => list.value.filter(j =>
    (filterCabang.value === 'Semua' || j.cabang === filterCabang.value) &&
    (filterStatus.value  === 'Semua' || j.status  === filterStatus.value)
  ))

  const upcoming = computed(() => list.value.filter(j => j.status !== 'Selesai').slice(0, 3))

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

  return { list, loading, filterCabang, filterStatus, cabangOptions, statusOptions, filtered, upcoming, fetch, add, update, remove, CABANG_LIST }
})
