import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as fb from '@/firebase/helpers'

export const TIPE_OPTIONS = ['Olahraga', 'Tradisional', 'E-Sport', 'Acara']

export const useKategoriStore = defineStore('kategori', () => {
  const list    = ref([])
  const loading = ref(false)

  const visibleList = computed(() => list.value.filter((k) => !k.hidden))

  async function fetch() {
    loading.value = true
    try {
      list.value = await fb.getKategori()
    } catch {
      list.value = []
    } finally {
      loading.value = false
    }
  }

  async function add(data) {
    await fb.addKategori(data)
    await fetch()
  }

  async function update(id, data) {
    await fb.updateKategori(id, data)
    await fetch()
  }

  async function remove(id) {
    await fb.deleteKategori(id)
    await fetch()
  }

  return { list, visibleList, loading, fetch, add, update, remove }
})
