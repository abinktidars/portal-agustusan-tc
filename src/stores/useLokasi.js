import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as fb from '@/firebase/helpers'

const FALLBACK = [
  { id:'1', urutan:1, nama:'Lapangan Utama',    alamat:'Tengah cluster, depan pos keamanan',    kapasitas:500, keterangan:'Lapangan serbaguna untuk lomba tradisional, upacara, dan acara besar.' },
  { id:'2', urutan:2, nama:'Lapangan Voli',      alamat:'Blok B, samping taman bermain anak',    kapasitas:200, keterangan:'Lapangan voli standar dengan net permanen. Tersedia lampu sorot untuk pertandingan malam.' },
  { id:'3', urutan:3, nama:'Lapangan Futsal',    alamat:'Blok C, dekat gerbang utara',           kapasitas:150, keterangan:'Lapangan futsal dengan permukaan vinyl. Cocok untuk lomba futsal anak dan dewasa.' },
  { id:'4', urutan:4, nama:'GOR Cluster',        alamat:'Jl. Raya Cluster No. 1, Blok A',        kapasitas:300, keterangan:'Gedung olahraga indoor. Dapat digunakan untuk badminton, tenis meja, dan e-sport.' },
  { id:'5', urutan:5, nama:'Aula RW',            alamat:'Kantor RW, Blok A No. 5',               kapasitas:100, keterangan:'Ruangan indoor ber-AC. Ideal untuk lomba e-sport, rapat, dan kegiatan indoor.' },
  { id:'6', urutan:6, nama:'Jl. Utama Cluster',  alamat:'Jalan utama dari gerbang masuk ke taman', kapasitas:1000, keterangan:'Jalur utama yang digunakan untuk karnaval, pawai, dan balap perlombaan jalan.' },
]

export const useLokasiStore = defineStore('lokasi', () => {
  const list    = ref([])
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try {
      const data = await fb.getLokasi()
      list.value = data.length ? data : FALLBACK
    } catch {
      list.value = FALLBACK
    } finally {
      loading.value = false
    }
  }

  async function add(data) {
    const ref = await fb.addLokasi(data)
    await fetch()
    return ref.id
  }

  async function update(id, data) {
    await fb.updateLokasi(id, data)
    await fetch()
  }

  async function remove(id) {
    await fb.deleteLokasi(id)
    await fetch()
  }

  return { list, loading, fetch, add, update, remove }
})
