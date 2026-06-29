import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as fb from '@/firebase/helpers'

const FALLBACK = [
  { id:'1', cabang:'Voli Putra',      kat:'Olahraga',    tgl:'19 Jul', timA:'Blok Anggrek',    timB:'Blok Dahlia',     skor:'2 — 1', juara:'Blok Anggrek' },
  { id:'2', cabang:'Voli Putri',      kat:'Olahraga',    tgl:'26 Jul', timA:'Blok Bougenville', timB:'Blok Cempaka',    skor:'2 — 0', juara:'Blok Bougenville' },
  { id:'3', cabang:'Futsal Anak',     kat:'Olahraga',    tgl:'20 Jul', timA:'Blok Edelweis',   timB:'Blok Cempaka',    skor:'3 — 2', juara:'Blok Edelweis' },
  { id:'4', cabang:'Balap Karung',    kat:'Tradisional', tgl:'11 Jul', timA:'Final Anak',       timB:'5 Peserta',       skor:'🏁',    juara:'Rafi (Blok Dahlia)' },
  { id:'5', cabang:'Makan Kerupuk',   kat:'Tradisional', tgl:'11 Jul', timA:'Final Umum',       timB:'8 Peserta',       skor:'🏁',    juara:'Pak Tono (Blok Anggrek)' },
  { id:'6', cabang:'Tarik Tambang',   kat:'Tradisional', tgl:'12 Jul', timA:'Blok Dahlia',      timB:'Blok Anggrek',    skor:'2 — 1', juara:'Blok Dahlia' },
]

export const useHasilStore = defineStore('hasil', () => {
  const list    = ref([])
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try {
      list.value = await fb.getHasil()
    } catch {
      list.value = []
    } finally {
      loading.value = false
    }
  }

  async function add(data) {
    await fb.addHasil(data)
    await fetch()
  }
  async function addBatch(records) {
    await Promise.all(records.map(r => fb.addHasil(r)))
    await fetch()
  }
  async function update(id, data) {
    await fb.updateHasil(id, data)
    await fetch()
  }
  async function remove(id) {
    await fb.deleteHasil(id)
    await fetch()
  }

  return { list, loading, fetch, add, addBatch, update, remove }
})
