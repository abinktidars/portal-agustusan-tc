import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as fb from '@/firebase/helpers'

// Fallback jika Firestore belum ada data
const FALLBACK = [
  { id:'_1', nama:'Olahraga',    warna:'#CE1126', bg:'#FBEAEC', urutan:1 },
  { id:'_2', nama:'Tradisional', warna:'#C0871C', bg:'#FBF1DD', urutan:2 },
  { id:'_3', nama:'E-Sport',     warna:'#2D5B8A', bg:'#E5EDF7', urutan:3 },
  { id:'_4', nama:'Acara',       warna:'#2E7D52', bg:'#E7F2EB', urutan:4 },
]

export const useTipeStore = defineStore('tipe', () => {
  const list    = ref([])
  const loading = ref(false)

  // Map nama → warna & bg untuk dipakai di semua view
  const colorMap = computed(() => {
    const m = {}
    list.value.forEach(t => { m[t.nama] = { warna: t.warna, bg: t.bg || t.warna + '22' } })
    return m
  })

  const namaList = computed(() => list.value.map(t => t.nama))

  function warna(nama) { return colorMap.value[nama]?.warna || '#7A7368' }
  function bg(nama)    { return colorMap.value[nama]?.bg    || '#F0EBE2' }

  // Lookup by Firestore document ID (untuk relasi tipeId)
  function findById(id)   { return list.value.find(t => t.id === id) }
  function namaById(id)   { return findById(id)?.nama   || '' }
  function warnaById(id)  { return findById(id)?.warna  || '#7A7368' }
  function bgById(id)     { return findById(id)?.bg      || '#F0EBE2' }

  async function fetch() {
    loading.value = true
    try {
      const data = await fb.getTipe()
      list.value = data.length ? data : FALLBACK
    } catch {
      list.value = FALLBACK
    } finally {
      loading.value = false
    }
  }

  async function add(data)        { await fb.addTipe(data);       await fetch() }
  async function update(id, data) { await fb.updateTipe(id, data); await fetch() }
  async function remove(id)       { await fb.deleteTipe(id);       await fetch() }

  return { list, loading, colorMap, namaList, warna, bg, findById, namaById, warnaById, bgById, fetch, add, update, remove }
})
