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

  async function add(data, fotoFile) {
    const ref_ = await addGaleri(data, fotoFile)
    await fetch()
    return ref_
  }

  async function update(id, data, fotoFile) {
    await updateGaleri(id, data, fotoFile)
    await fetch()
  }

  async function remove(id) {
    await deleteGaleri(id)
    list.value = list.value.filter(g => g.id !== id)
  }

  return { list, loading, fetch, add, update, remove }
})
