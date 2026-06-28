import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as fb from '@/firebase/helpers'

const FALLBACK = [
  { tipe:'tim',         namaKetua:'Budi Santoso',   cabang:'Voli Putra',       koridor:1, blokRumah:'A5',  ts: Date.now() - 172800000 },
  { tipe:'tim',         namaKetua:'Sari Lestari',   cabang:'Voli Putri',       koridor:2, blokRumah:'B3',  ts: Date.now() - 86400000 },
  { tipe:'perorangan',  nama:'Andi Pratama',         cabang:'Mobile Legends',   koridor:3, blokRumah:'C7',  ts: Date.now() - 18000000 },
  { tipe:'tim',         namaKetua:'Dewi Anggraini', cabang:'Badminton Beregu', koridor:4, blokRumah:'D2',  ts: Date.now() - 7200000 },
]

export const useRegistrasiStore = defineStore('registrasi', () => {
  const list      = ref([])
  const loading   = ref(false)
  const submitted = ref(false)
  const error     = ref('')

  const recent = () => list.value.slice(0, 5).map(r => ({
    initial: ((r.namaRegu || r.namaKetua || r.nama) || '?').charAt(0).toUpperCase(),
    nama:    r.namaRegu || r.namaKetua || r.nama || '—',
    line:    `${r.cabang} · ${r.koridorNama || (r.koridor ? `Koridor ${r.koridor}` : '—')}`,
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

    if (!form.cabang || !form.koridorId || !form.blokRumah?.trim() || !form.wa?.trim()) {
      error.value = 'Mohon lengkapi Cabang, Koridor, Blok Rumah, dan No. WhatsApp.'
      return false
    }

    if (form.tipe === 'tim') {
      if (!form.namaRegu?.trim()) {
        error.value = 'Nama Tim / Regu wajib diisi.'
        return false
      }
      if (!form.namaKetua?.trim()) {
        error.value = 'Nama Ketua Tim wajib diisi.'
        return false
      }
      if (!form.anggota?.some(a => a.trim())) {
        error.value = 'Isi minimal satu nama peserta tim.'
        return false
      }
    } else {
      if (!form.nama?.trim()) {
        error.value = 'Nama Peserta wajib diisi.'
        return false
      }
    }

    try {
      loading.value = true
      await fb.addRegistrasi({ ...form, ts: Date.now() })
      submitted.value = true
      await fetch()
      return true
    } catch (e) {
      error.value = 'Gagal mengirim: ' + e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function add(data) {
    loading.value = true
    try {
      await fb.addRegistrasi({ ...data, ts: Date.now() })
      await fetch()
    } finally {
      loading.value = false
    }
  }

  async function update(id, data) {
    loading.value = true
    try {
      await fb.updateRegistrasi(id, data)
      await fetch()
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    try {
      await fb.deleteRegistrasi(id)
      list.value = list.value.filter(r => r.id !== id)
    } finally {
      loading.value = false
    }
  }

  function reset() {
    submitted.value = false
    error.value = ''
  }

  return { list, loading, submitted, error, recent, fetch, submit, add, update, remove, reset }
})
