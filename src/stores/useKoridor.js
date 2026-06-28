import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as fb from '@/firebase/helpers'

export const useKoridorStore = defineStore('koridor', () => {
  const list    = ref([])
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try {
      list.value = await fb.getKoridor()
    } catch {
      list.value = []
    } finally {
      loading.value = false
    }
  }

  async function add(data) {
    await fb.addKoridor(data)
    await fetch()
  }

  async function update(id, data) {
    await fb.updateKoridor(id, data)
    await fetch()
  }

  async function remove(id) {
    await fb.deleteKoridor(id)
    await fetch()
  }

  return { list, loading, fetch, add, update, remove }
})
