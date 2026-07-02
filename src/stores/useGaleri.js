import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getGaleri, addGaleri, updateGaleri, deleteGaleri } from '@/firebase/helpers'

export const useGaleriStore = defineStore('galeri', () => {
  const list    = ref([])
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try { list.value = await getGaleri() }
    finally { loading.value = false }
  }

  function sortByUrutan() {
    list.value.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
  }

  async function add(data, fotoFile, onProgress) {
    const newItem = await addGaleri(data, fotoFile, onProgress)
    list.value.push(newItem)
    sortByUrutan()
    return newItem
  }

  async function update(id, data, fotoFile, onProgress) {
    const updated = await updateGaleri(id, data, fotoFile, onProgress)
    const idx = list.value.findIndex(g => g.id === id)
    if (idx !== -1) list.value[idx] = { ...list.value[idx], ...updated }
    sortByUrutan()
  }

  async function remove(id) {
    await deleteGaleri(id)
    list.value = list.value.filter(g => g.id !== id)
  }

  return { list, loading, fetch, add, update, remove }
})
