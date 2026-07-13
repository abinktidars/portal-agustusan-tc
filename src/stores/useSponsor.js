import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSponsor, addSponsor, updateSponsor, deleteSponsor } from '@/firebase/helpers'

export const useSponsorStore = defineStore('sponsor', () => {
  const list    = ref([])
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try { list.value = await getSponsor() }
    finally { loading.value = false }
  }

  function sortByUrutan() {
    list.value.sort((a, b) => (a.urutan ?? 0) - (b.urutan ?? 0))
  }

  const sponsors = computed(() => list.value.filter(s => s.jenis !== 'Media Partner'))
  const mediaPartners = computed(() => list.value.filter(s => s.jenis === 'Media Partner'))

  async function add(data, logoDataUrl) {
    const newItem = await addSponsor(data, logoDataUrl)
    list.value.push(newItem)
    sortByUrutan()
    return newItem
  }

  async function update(id, data, logoDataUrl) {
    const updated = await updateSponsor(id, data, logoDataUrl)
    const idx = list.value.findIndex(s => s.id === id)
    if (idx !== -1) list.value[idx] = { ...list.value[idx], ...updated }
    sortByUrutan()
  }

  async function remove(id) {
    await deleteSponsor(id)
    list.value = list.value.filter(s => s.id !== id)
  }

  return { list, loading, sponsors, mediaPartners, fetch, add, update, remove }
})
