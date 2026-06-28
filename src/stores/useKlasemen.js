import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as fb from '@/firebase/helpers'

const ACCENTS = ['#E0A82E', '#9AA0A6', '#C0871C']

const FALLBACK = [
  { nama:'Blok Anggrek',    emas:3, perak:2, perunggu:1 },
  { nama:'Blok Dahlia',     emas:2, perak:3, perunggu:2 },
  { nama:'Blok Bougenville',emas:2, perak:2, perunggu:3 },
  { nama:'Blok Cempaka',    emas:1, perak:2, perunggu:2 },
  { nama:'Blok Edelweis',   emas:1, perak:1, perunggu:3 },
]

export const useKlasemenStore = defineStore('klasemen', () => {
  const list    = ref([])
  const loading = ref(false)

  const ranked = computed(() =>
    [...list.value]
      .map(k => ({ ...k, poin: k.emas * 5 + k.perak * 3 + k.perunggu }))
      .sort((a, b) => b.poin - a.poin)
      .map((k, i) => ({
        ...k,
        rank:      i + 1,
        rankLabel: i + 1,
        accent:    i < 3 ? ACCENTS[i] : '#C9C2B6',
        rowBg:     i === 0 ? '#FFFBF2' : '#fff',
      }))
  )

  const top3 = computed(() => ranked.value.slice(0, 3))

  async function fetch() {
    loading.value = true
    try {
      const data = await fb.getKlasemen()
      list.value = data.length ? data : FALLBACK
    } catch {
      list.value = FALLBACK
    } finally {
      loading.value = false
    }
  }

  return { list, loading, ranked, top3, fetch }
})
