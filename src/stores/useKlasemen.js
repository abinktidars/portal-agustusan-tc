import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as fb from '@/firebase/helpers'

export const useKlasemenStore = defineStore('klasemen', () => {
  const list    = ref([])
  const loading = ref(false)

  // Map kategoriId → klasemen entry untuk O(1) lookup
  const byKategori = computed(() => {
    const m = {}
    list.value.forEach(k => { m[k.kategoriId || k.id] = k })
    return m
  })

  async function fetch() {
    loading.value = true
    try {
      list.value = await fb.getKlasemen()
    } catch {
      list.value = []
    } finally {
      loading.value = false
    }
  }

  async function set(kategoriId, data) {
    await fb.setKlasemenKategori(kategoriId, data)
    await fetch()
  }

  async function remove(kategoriId) {
    await fb.deleteKlasemenKategori(kategoriId)
    await fetch()
  }

  return { list, loading, byKategori, fetch, set, remove }
})
