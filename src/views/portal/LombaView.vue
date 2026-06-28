<template>
  <div>
    <div class="eyebrow">Daftar Lomba &amp; Info Kegiatan</div>
    <h2 class="page-title">Cabang yang Dilombakan</h2>

    <div ref="chipRowRef" class="tcr-scroll chip-row">
      <button v-for="c in cats" :key="c"
        :ref="el => { if(el) chipBtnRefs[cats.indexOf(c)] = el }"
        class="chip" :class="{ active: activeCat === c }"
        @click="selectCat(c, cats.indexOf(c))">{{ c }}</button>
    </div>

    <div class="lomba-grid">
      <div v-for="l in filtered" :key="l.nama" class="lomba-card">
        <span class="kat-badge" :style="{ background: katBg(l.kat), color: katColor(l.kat) }">{{ l.kat }}</span>
        <div class="lomba-nama">{{ l.nama }}</div>
        <div class="lomba-desc">{{ l.deskripsi }}</div>
        <div class="lomba-tags">
          <span class="tag">{{ l.format }}</span>
          <span class="tag">{{ l.jadwal }}</span>
        </div>
        <button class="ketentuan-btn" @click="openKetentuan(l)">Lihat Ketentuan Lomba</button>
      </div>
    </div>

    <div v-if="!lombaStore.loading && !filtered.length" class="empty-state">Belum ada data lomba.</div>

    <div v-if="selectedLomba" class="modal-backdrop" @click.self="closeKetentuan">
      <div class="modal-card" role="dialog" aria-modal="true" :aria-label="`Ketentuan ${selectedLomba.nama}`">
        <div class="modal-head">
          <div>
            <div class="modal-kat" :style="{ color: katColor(selectedLomba.kat) }">{{ selectedLomba.kat }}</div>
            <h3 class="modal-title">Ketentuan {{ selectedLomba.nama }}</h3>
          </div>
          <button class="modal-close" @click="closeKetentuan" aria-label="Tutup">×</button>
        </div>

        <ul class="ketentuan-list">
          <li v-for="(rule, i) in selectedLomba.ketentuan" :key="`${selectedLomba.nama}-${i}`">{{ rule }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useLombaStore } from '@/stores/useLomba'
import { useTipeStore } from '@/stores/useTipe'

const activeCat = ref('Semua')
const selectedLomba = ref(null)
const lombaStore = useLombaStore()
const tipeStore = useTipeStore()
const chipRowRef = ref(null)
const chipBtnRefs = []

const cats = computed(() => ['Semua', ...new Set(lombaStore.sorted.map(l => l.kat))])
const filtered = computed(() => lombaStore.sorted.filter(l => activeCat.value === 'Semua' || l.kat === activeCat.value))
const katColor = (k) => tipeStore.warna(k) || ({ Olahraga:'#CE1126', Tradisional:'#C0871C', 'E-Sport':'#2D5B8A' })[k] || '#CE1126'
const katBg    = (k) => tipeStore.bg(k)    || ({ Olahraga:'#FBEAEC', Tradisional:'#FBF1DD', 'E-Sport':'#E7EEF6' })[k] || '#FBEAEC'

watch(cats, (next) => {
  if (!next.includes(activeCat.value)) activeCat.value = 'Semua'
})

function scrollToCenter(row, btn) {
  if (!row || !btn) return
  row.scrollTo({ left: btn.offsetLeft - row.clientWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' })
}

async function selectCat(cat, index) {
  activeCat.value = cat
  await nextTick()
  scrollToCenter(chipRowRef.value, chipBtnRefs[index])
}

function openKetentuan(lomba) {
  selectedLomba.value = lomba
}

function closeKetentuan() {
  selectedLomba.value = null
}

onMounted(async () => {
  await Promise.all([lombaStore.fetch(), tipeStore.fetch()])
  await nextTick()
  scrollToCenter(chipRowRef.value, chipBtnRefs[0])
})
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.chip-row  { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 20px; }
.lomba-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.lomba-card { background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; padding: 22px; display: flex; flex-direction: column; }
.kat-badge  { display: inline-flex; align-self: flex-start; padding: 5px 11px; border-radius: 999px; font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .04em; text-transform: uppercase; }
.lomba-nama { font: 800 19px/1.15 Archivo; color: #1A1613; margin-top: 14px; }
.lomba-desc { font: 500 13px/1.5 'Plus Jakarta Sans'; color: #7A7368; margin-top: 8px; flex: 1; }
.lomba-tags { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.tag        { font: 600 12px/1 'Plus Jakarta Sans'; color: #5A534B; background: #F5F0E8; border-radius: 8px; padding: 7px 10px; }
.ketentuan-btn { margin-top: 16px; padding: 11px; border: 1.5px solid #CE1126; border-radius: 10px; background: transparent; color: #CE1126; font: 700 13px/1 'Plus Jakarta Sans'; cursor: pointer; transition: all .15s; }
.ketentuan-btn:hover { background: #CE1126; color: #fff; }

.modal-backdrop {
  position: fixed; inset: 0; z-index: 80;
  background: rgba(26, 22, 19, .52);
  display: grid; place-items: center;
  padding: 20px;
}

.modal-card {
  width: min(680px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #F0D3D7;
  box-shadow: 0 18px 50px rgba(0, 0, 0, .2);
  padding: 22px;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.modal-kat {
  font: 700 11px/1 'Plus Jakarta Sans';
  letter-spacing: .08em;
  text-transform: uppercase;
}

.modal-title {
  margin: 8px 0 0;
  font: 800 25px/1.1 Archivo;
  color: #1A1613;
}

.modal-close {
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  cursor: pointer;
  font: 700 24px/1 Archivo;
  color: #5A534B;
  background: #F7F3EC;
}

.ketentuan-list {
  margin: 18px 0 0;
  padding-left: 20px;
  display: grid;
  gap: 10px;
  color: #3E382F;
  font: 500 14px/1.6 'Plus Jakarta Sans';
}

.empty-state {
  margin-top: 16px;
  padding: 20px;
  border-radius: 10px;
  border: 1px dashed #D8D2C8;
  text-align: center;
  color: #7A7368;
  font: 500 13px/1 'Plus Jakarta Sans';
}

@media(max-width:767px) {
  .lomba-grid { grid-template-columns: 1fr; }
  .page-title { font-size: 26px; }
  .lomba-card { padding: 16px; }
  .modal-card { padding: 16px; border-radius: 12px; }
  .modal-title { font-size: 22px; }
}
</style>
