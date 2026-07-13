<template>
  <div>
    <div class="eyebrow">Galeri Foto</div>
    <h2 class="page-title">Momen Kemerdekaan</h2>
    <p class="desc">Dokumentasi kegiatan Semarak Agustusan HUT RI ke 81 dari warga Teras Country Residence.</p>

    <!-- Filter kategori -->
    <div v-if="kategoris.length" class="filter-bar">
      <button
        v-for="k in ['Semua', ...kategoris]" :key="k"
        class="filter-btn"
        :class="{ active: activeKat === k }"
        @click="activeKat = k"
      >{{ k }}</button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="empty-state">Memuat galeri...</div>

    <!-- Grid -->
    <div v-else-if="filtered.length" class="galeri-grid">
      <div
        v-for="g in filtered" :key="g.id"
        class="galeri-card"
        @click="open(g)"
      >
        <div class="card-img-wrap">
          <img v-if="g.url" :src="g.url" :alt="g.judul" class="card-img" loading="lazy" @error="e => e.target.style.display='none'" />
          <div v-else class="card-img-placeholder">🖼️</div>
        </div>
        <div class="card-body">
          <div class="card-title">{{ g.judul }}</div>
          <div v-if="g.kategori" class="card-kat">{{ g.kategori }}</div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">Belum ada foto di galeri.</div>

    <!-- Lightbox -->
    <Transition name="lb">
      <div v-if="active" class="lightbox" @click.self="active = null">
        <button class="lb-close" @click="active = null" aria-label="Tutup">×</button>
        <div class="lb-content">
          <img v-if="active.url" :src="active.url" :alt="active.judul" class="lb-img" />
          <div v-else class="lb-placeholder">🖼️</div>
          <div class="lb-info">
            <div class="lb-title">{{ active.judul }}</div>
            <div v-if="active.kategori" class="lb-kat">{{ active.kategori }}</div>
            <p v-if="active.keterangan" class="lb-desc">{{ active.keterangan }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGaleriStore } from '@/stores/useGaleri'

const store     = useGaleriStore()
const activeKat = ref('Semua')
const active    = ref(null)

const kategoris = computed(() => {
  const set = new Set(store.list.map(g => g.kategori).filter(Boolean))
  return [...set]
})

const filtered = computed(() => {
  if (activeKat.value === 'Semua') return store.list
  return store.list.filter(g => g.kategori === activeKat.value)
})

function open(g) { active.value = g }

onMounted(() => store.fetch())
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.page-title{ margin: 9px 0 8px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.desc { font: 500 14px/1.5 'Plus Jakarta Sans'; color: #7A7368; margin: 0 0 20px; }

.filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.filter-btn {
  padding: 6px 14px; border-radius: 999px; border: 1.5px solid #E2DCD2;
  background: #fff; color: #5A534B; font: 600 12px/1 'Plus Jakarta Sans'; cursor: pointer;
  transition: all .15s;
}
.filter-btn:hover { border-color: #CE1126; color: #CE1126; }
.filter-btn.active { background: #CE1126; border-color: #CE1126; color: #fff; }

.galeri-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.galeri-card {
  border-radius: 14px; border: 1.5px solid #ECE7DE;
  background: #fff; overflow: hidden; cursor: pointer;
  transition: transform .18s, box-shadow .18s;
}
.galeri-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,.10); }

.card-img-wrap { aspect-ratio: 4/3; overflow: hidden; background: #FAF8F3; }
.card-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .3s; }
.galeri-card:hover .card-img { transform: scale(1.04); }
.card-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 36px; }

.card-body  { padding: 10px 12px 12px; }
.card-title { font: 700 13px/1.3 'Plus Jakarta Sans'; color: #1A1613; }
.card-kat   { margin-top: 6px; display: inline-block; padding: 3px 9px; border-radius: 999px; background: #FFF3CD; color: #856404; font: 600 11px/1 'Plus Jakarta Sans'; }

.empty-state { padding: 32px 0; color: #9A9389; font: 500 14px/1 'Plus Jakarta Sans'; text-align: center; }

/* Lightbox */
.lightbox {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(26,22,19,.88);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.lb-close {
  position: absolute; top: 16px; right: 16px;
  width: 40px; height: 40px; border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.1); color: #fff;
  font: 700 24px/1 Archivo; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.lb-content {
  max-width: 860px; width: 100%;
  background: #1A1613; border-radius: 16px; overflow: hidden;
  display: flex; flex-direction: column;
}
.lb-img { width: 100%; max-height: 70vh; object-fit: contain; display: block; }
.lb-placeholder { width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; font-size: 56px; }
.lb-info  { padding: 14px 18px 18px; }
.lb-title { font: 700 16px/1.2 Archivo; color: #fff; }
.lb-kat   { margin-top: 6px; display: inline-block; padding: 3px 9px; border-radius: 999px; background: rgba(255,243,205,.15); color: #FFC107; font: 600 11px/1 'Plus Jakarta Sans'; }
.lb-desc  { font: 500 13px/1.6 'Plus Jakarta Sans'; color: rgba(255,255,255,.65); margin: 10px 0 0; }

.lb-enter-active, .lb-leave-active { transition: opacity .22s ease; }
.lb-enter-from, .lb-leave-to { opacity: 0; }

@media (min-width: 480px) {
  .galeri-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 640px) {
  .galeri-grid { grid-template-columns: repeat(3, 1fr); }
  .lb-content { flex-direction: row; max-height: 80vh; }
  .lb-img { width: 60%; max-height: 80vh; }
  .lb-info { width: 40%; padding: 20px; overflow-y: auto; }
  .lb-title { font-size: 18px; }
}

@media (min-width: 1024px) {
  .galeri-grid { grid-template-columns: repeat(4, 1fr); }
  .page-title { font-size: 38px; }
}
</style>
