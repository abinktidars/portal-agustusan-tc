import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as fb from '@/firebase/helpers'

const FALLBACK = [
  { nama:'Budi Santoso',    blok:'Blok Anggrek',     cabang:'Voli Putra',        tim:'Garuda Anggrek',    ts: Date.now() - 172800000 },
  { nama:'Sari Lestari',    blok:'Blok Dahlia',      cabang:'Voli Putri',        tim:'Srikandi Dahlia',   ts: Date.now() - 86400000 },
  { nama:'Andi Pratama',    blok:'Blok Bougenville', cabang:'Mobile Legends',    tim:'BGV Esport',        ts: Date.now() - 18000000 },
  { nama:'Dewi Anggraini',  blok:'Blok Cempaka',     cabang:'Badminton Beregu',  tim:'Cempaka Smash',     ts: Date.now() - 7200000 },
]

export const useRegistrasiStore = defineStore('registrasi', () => {
  const list    = ref([])
  const loading = ref(false)
  const submitted = ref(false)
  const error   = ref('')

  const recent = () => list.value.slice(0, 5).map(r => ({
    initial: (r.nama || '?').charAt(0).toUpperCase(),
    nama: r.nama,
    line: `${r.cabang} · ${r.blok}`,
  }))

  async function fetch() {
    loading.value = true
    try {
      const data = await fb.getRegistrasi()
      list.value = data.length ? data : FALLBACK
    } catch {
      list.value = FALLBACK
    } finally {
      loading.value = false
    }
  }

  async function submit(form) {
    error.value = ''
    if (!form.nama.trim() || !form.wa.trim() || !form.blok || !form.cabang) {
      error.value = 'Mohon lengkapi Nama, No. WhatsApp, Blok, dan Cabang Lomba.'
      return false
    }
    try {
      await fb.addRegistrasi({ ...form, ts: Date.now() })
      submitted.value = true
      await fetch()
      return true
    } catch (e) {
      error.value = 'Gagal mengirim: ' + e.message
      return false
    }
  }

  function reset() {
    submitted.value = false
    error.value = ''
  }

  return { list, loading, submitted, error, recent, fetch, submit, reset }
})
