<template>
  <div>
    <div class="eyebrow">Hasil Cabang Lomba</div>
    <h2 class="page-title">Klasemen Per Kategori</h2>

    <!-- Tipe Tabs -->
    <div class="tipe-tabs">
      <button
        v-for="tipe in tipeStore.list"
        :key="tipe.id"
        class="tipe-tab"
        :class="{ 'tipe-tab--active': activeTipe === tipe.id }"
        :style="activeTipe === tipe.id
          ? { background: tipe.bg, color: tipe.warna, borderColor: tipe.warna }
          : {}"
        @click="activeTipe = tipe.id"
      >{{ tipe.nama }}</button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="kat-grid">
      <div v-for="n in 6" :key="n" class="kat-skeleton"></div>
    </div>

    <template v-else>
      <div v-if="kategoriForActiveTipe.length" class="kat-grid">
        <div
          v-for="kat in kategoriForActiveTipe"
          :key="kat.id"
          class="kat-card"
          :style="{
            '--tc': activeTipeObj?.warna || '#CE1126',
            '--tb': activeTipeObj?.bg    || '#FBEAEC',
          }"
        >
          <div class="kat-card-top">
            <span class="kat-nama">{{ kat.nama }}</span>
            <span class="kat-jenis">{{ kat.jenis || 'Beregu' }}</span>
          </div>

          <!-- Ada hasil -->
          <template v-if="klasemenOf(kat.nama)">
            <!-- Perorangan: podium lengkap -->
            <template v-if="klasemenOf(kat.nama).isPerorangan">
              <div class="podium">
                <div v-if="klasemenOf(kat.nama).juara1" class="podium-item podium-gold">
                  <span class="medal-icon">🥇</span>
                  <span class="podium-nama">{{ klasemenOf(kat.nama).juara1 }}</span>
                </div>
                <div v-if="klasemenOf(kat.nama).juara2" class="podium-item">
                  <span class="medal-icon">🥈</span>
                  <span class="podium-nama">{{ klasemenOf(kat.nama).juara2 }}</span>
                </div>
                <div v-if="klasemenOf(kat.nama).juara3" class="podium-item">
                  <span class="medal-icon">🥉</span>
                  <span class="podium-nama">{{ klasemenOf(kat.nama).juara3 }}</span>
                </div>
              </div>
            </template>

            <!-- Beregu: tampilkan juara saja -->
            <template v-else>
              <div class="podium">
                <div class="podium-item podium-gold">
                  <span class="medal-icon">🏆</span>
                  <span class="podium-nama">{{ klasemenOf(kat.nama).juara1 }}</span>
                </div>
              </div>
            </template>

            <div class="entry-babak" v-if="klasemenOf(kat.nama).babak">
              {{ klasemenOf(kat.nama).babak }}
            </div>
          </template>

          <!-- Belum ada hasil -->
          <template v-else>
            <div class="no-data">
              <span class="no-data-icon">⏳</span>
              <span>Menunggu hasil pertandingan</span>
            </div>
          </template>
        </div>
      </div>

      <div v-else class="empty-tipe">
        Belum ada cabang lomba untuk kategori ini.
      </div>
    </template>

    <p class="note">Klasemen diperbarui otomatis dari data hasil pertandingan.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useHasilStore }    from '@/stores/useHasil'
import { useKategoriStore } from '@/stores/useKategori'
import { useTipeStore }     from '@/stores/useTipe'

const hasilStore    = useHasilStore()
const kategoriStore = useKategoriStore()
const tipeStore     = useTipeStore()

const activeTipe = ref(null)

const isLoading = computed(() =>
  hasilStore.loading || kategoriStore.loading || tipeStore.loading
)

const activeTipeObj = computed(() =>
  tipeStore.list.find(t => t.id === activeTipe.value)
)

const kategoriForActiveTipe = computed(() => {
  if (!activeTipe.value) return []
  return kategoriStore.list.filter(k => k.tipeId === activeTipe.value)
})

// Group hasil by cabang name
const hasilByKabang = computed(() => {
  const map = {}
  hasilStore.list.forEach(h => {
    if (!map[h.cabang]) map[h.cabang] = []
    map[h.cabang].push(h)
  })
  return map
})

// Derivasi klasemen dari hasil — prioritas babak "Final", fallback ke paling baru
function klasemenOf(katNama) {
  const entries = hasilByKabang.value[katNama] || []
  if (!entries.length) return null

  const finalEntry = entries.find(e => /final/i.test(e.babak || ''))
  const entry = finalEntry || entries[0] // entries[0] = paling baru (sorted desc)

  const isPerorangan = !!(entry.juara1 || entry.juara2 || entry.juara3) || entry.jenis === 'Perorangan'

  if (isPerorangan) {
    return {
      isPerorangan: true,
      juara1: entry.juara1 || '',
      juara2: entry.juara2 || '',
      juara3: entry.juara3 || '',
      babak:  entry.babak  || '',
    }
  }

  if (entry.juara) {
    return {
      isPerorangan: false,
      juara1: entry.juara,
      babak:  entry.babak || '',
    }
  }

  return null
}

watch(() => tipeStore.list, (list) => {
  if (list.length && !activeTipe.value) activeTipe.value = list[0].id
})

onMounted(async () => {
  await Promise.all([
    hasilStore.fetch(),
    kategoriStore.fetch(),
    tipeStore.fetch(),
  ])
  if (tipeStore.list.length && !activeTipe.value) {
    activeTipe.value = tipeStore.list[0].id
  }
})
</script>

<style scoped>
.eyebrow    { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #9A6B12; }
.page-title { margin: 9px 0 24px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.note       { font: 500 13px/1.5 'Plus Jakarta Sans'; color: #9A9389; margin-top: 24px; }

/* ── Tipe Tabs ───────────────────────────────── */
.tipe-tabs { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
.tipe-tab {
  padding: 9px 22px; border-radius: 99px; border: 1.5px solid #E0D8CE;
  font: 700 13px/1 'Plus Jakarta Sans'; color: #7A7368; background: #fff;
  cursor: pointer; transition: all .18s;
}
.tipe-tab--active { font-weight: 800; }
.tipe-tab:hover:not(.tipe-tab--active) { border-color: #C9C2B6; color: #1A1613; }

/* ── Skeleton ────────────────────────────────── */
.kat-skeleton {
  height: 160px; border-radius: 8px;
  background: linear-gradient(90deg, #F0EBE2 25%, #E8E2DA 50%, #F0EBE2 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Grid ────────────────────────────────────── */
.kat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

/* ── Kartu ───────────────────────────────────── */
.kat-card {
  background: #fff;
  border: 1.5px solid #F0D3D7;
  border-top: 3px solid var(--tc, #CE1126);
  border-radius: 10px;
  padding: 18px 20px;
  display: flex; flex-direction: column; gap: 16px;
}
.kat-card-top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
}
.kat-nama {
  font: 800 16px/1.2 Archivo; color: #1A1613;
}
.kat-jenis {
  flex-shrink: 0;
  font: 700 10px/1 'Plus Jakarta Sans'; letter-spacing: .07em; text-transform: uppercase;
  color: var(--tc, #CE1126); background: var(--tb, #FBEAEC);
  border-radius: 6px; padding: 4px 9px;
}

/* ── Podium ──────────────────────────────────── */
.podium { display: flex; flex-direction: column; gap: 10px; }
.podium-item { display: flex; align-items: center; gap: 10px; }
.podium-gold .podium-nama { font-weight: 800; color: #1A1613; }
.medal-icon  { font-size: 22px; line-height: 1; flex-shrink: 0; }
.podium-nama { font: 600 14px/1.3 'Plus Jakarta Sans'; color: #3A3530; }

.entry-babak {
  font: 600 11px/1 'Plus Jakarta Sans'; letter-spacing: .06em; text-transform: uppercase;
  color: #9A9389;
}

/* ── Empty states ────────────────────────────── */
.no-data {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 18px 0;
  font: 500 13px/1.4 'Plus Jakarta Sans'; color: #C9C2B6; text-align: center;
}
.no-data-icon { font-size: 24px; }

.empty-tipe {
  font: 500 14px/1.5 'Plus Jakarta Sans'; color: #9A9389;
  padding: 48px 24px; text-align: center;
  background: #F8F6F3; border-radius: 8px; border: 1.5px dashed #E0D8CE;
}

/* ── Responsive ──────────────────────────────── */
@media(max-width:767px) {
  .page-title  { font-size: 26px; }
  .kat-grid    { grid-template-columns: 1fr; }
  .medal-icon  { font-size: 18px; }
  .podium-nama { font-size: 13px; }
}
</style>
