<template>
  <div>
    <!-- Hero + Countdown -->
    <section class="hero-grid">
      <!-- Hero card -->
      <div class="hero-card">
        <div class="hero-badge">11 Juli – 29 Agustus 2026</div>
        <h1 class="hero-title">Semarak Agustusan <span class="hero-title-accent">ke-81</span></h1>
        <p class="hero-desc">Portal bersama warga Teras Country Residence. Yuk Cek jadwal &amp; hasil pertandingan, klasemen, dan daftar lomba semua di satu tempat.</p>
        <div class="hero-actions">
          <button class="btn-primary" @click="$router.push({ name: 'hasil' })">Lihat Hasil Pertandingan</button>
          <button class="btn-secondary" @click="$router.push({ name: 'klasemen' })">Lihat Klasemen</button>
        </div>
      </div>

      <!-- Foto terbaru -->
      <div v-if="carouselFotos.length" class="hero-carousel">
        <transition name="fade" mode="out-in">
          <img
            :key="currentFoto.id"
            :src="currentFoto.url"
            :alt="currentFoto.judul || 'Foto kegiatan'"
            class="carousel-img"
            role="button"
            tabindex="0"
            @click="$router.push({ name: 'galeri' })"
            @keydown.enter.prevent="$router.push({ name: 'galeri' })"
            @keydown.space.prevent="$router.push({ name: 'galeri' })"
          />
        </transition>
        <div class="carousel-overlay"></div>
        <div class="carousel-tag">Foto Terbaru</div>
        <div v-if="currentFoto.judul" class="carousel-caption">{{ currentFoto.judul }}</div>

        <button v-if="carouselFotos.length > 1" class="carousel-nav carousel-prev" @click="prevSlide" aria-label="Foto sebelumnya">
          <ChevronLeft :size="18" :stroke-width="2.4" />
        </button>
        <button v-if="carouselFotos.length > 1" class="carousel-nav carousel-next" @click="nextSlide" aria-label="Foto berikutnya">
          <ChevronRight :size="18" :stroke-width="2.4" />
        </button>

        <div v-if="carouselFotos.length > 1" class="carousel-dots">
          <button
            v-for="(f, i) in carouselFotos" :key="f.id"
            class="carousel-dot" :class="{ active: i === carouselIndex }"
            @click="goToSlide(i)" :aria-label="`Foto ${i + 1}`"
          ></button>
        </div>
      </div>
      <div v-else-if="!galeriStore.loading" class="hero-carousel hero-carousel-empty">
        Belum ada foto terbaru.
      </div>
    </section>

    <!-- Quick links -->
    <!-- <section class="quick-grid">
      <button class="quick-card" @click="$router.push({ name: 'jadwal' })">
        <div class="quick-icon" style="background:#FBEAEC;color:#CE1126;">📅</div>
        <div class="quick-title">Jadwal Pertandingan</div>
        <div class="quick-desc">Filter per cabang &amp; status, lengkap lokasi dan jam.</div>
      </button>
      <button class="quick-card" @click="$router.push({ name: 'hasil' })">
        <div class="quick-icon" style="background:#E7F2EB;color:#2E7D52;">🏆</div>
        <div class="quick-title">Hasil Pertandingan</div>
        <div class="quick-desc">Skor terbaru &amp; pemenang tiap cabang lomba.</div>
      </button>
      <button class="quick-card" @click="$router.push({ name: 'klasemen' })">
        <div class="quick-icon" style="background:#FBF1DD;color:#9A6B12;">🥇</div>
        <div class="quick-title">Klasemen</div>
        <div class="quick-desc">Perolehan juara per kategori lomba.</div>
      </button>
    </section> -->

    <!-- Jadwal terdekat -->
    <section style="margin-top:44px;">
      <div class="section-eyebrow">Pekan Ini</div>
      <div class="section-header-row">
        <h2 class="section-title">Jadwal Terdekat</h2>
        <button class="link-btn" @click="$router.push({ name: 'jadwal' })">Lihat semua →</button>
      </div>

      <div v-if="jadwalStore.loading" class="jadwal-list">
        <div v-for="n in 5" :key="n" class="skeleton-row"></div>
      </div>

      <div v-else-if="upcomingJadwal.length" class="jadwal-list">
        <div v-for="j in upcomingJadwal" :key="j.id" class="jadwal-row"
          @click="$router.push({ name: 'jadwal' })" role="button" tabindex="0">
          <div class="jadwal-date">
            <div class="jadwal-hari">{{ hariDariTgl(j) }}</div>
            <div class="jadwal-tgl">{{ j.tglMulai || j.tgl }}</div>
            <div class="jadwal-jam">{{ j.jamMulai || j.jam }}</div>
          </div>
          <div class="divider-v"></div>
          <div class="jadwal-info">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="dot" :style="{ background: katColor(j.kat) }"></span>
              <span class="jadwal-cabang">{{ j.cabang }}</span>
            </div>
            <div v-if="j.peserta" class="jadwal-peserta">{{ j.peserta }}</div>
            <div class="jadwal-sub">
              <span v-if="j.babak" class="jadwal-babak">{{ j.babak }}</span>
              {{ lokasiNama(j) }}
            </div>
          </div>
          <StatusBadge :status="j.status" />
        </div>
      </div>

      <div v-else class="empty-section">
        Belum ada jadwal pertandingan yang akan datang.
      </div>
    </section>

    <!-- Hasil terbaru -->
    <section style="margin-top:44px;">
      <div class="section-eyebrow" style="color:#2E7D52;">Hasil Pertandingan</div>
      <div class="section-header-row">
        <h2 class="section-title">Terbaru</h2>
        <button class="link-btn" @click="$router.push({ name: 'hasil' })">Lihat semua →</button>
      </div>

      <div v-if="hasilStore.loading" class="hasil-grid">
        <div v-for="n in 3" :key="n" class="skeleton-card"></div>
      </div>

      <div v-else-if="hasilStore.list.length" class="hasil-grid">
        <div
          v-for="h in hasilStore.list.slice(0, 3)"
          :key="h.id"
          class="hasil-card"
          role="button"
          tabindex="0"
          @click="$router.push({ name: 'hasil' })"
          @keydown.enter.prevent="$router.push({ name: 'hasil' })"
          @keydown.space.prevent="$router.push({ name: 'hasil' })"
        >
          <div class="hasil-head">
            <span class="dot" :style="{ background: katColor(h.kat) }"></span>
            <span class="hasil-cabang">{{ h.cabang }}</span>
            <span class="hasil-tgl">{{ h.tgl }}</span>
          </div>

          <template v-if="!isPerorangan(h)">
            <div class="skor-row">
              <div class="tim">{{ h.timA }}</div>
              <div class="skor">{{ h.skor }}</div>
              <div class="tim tim-r">{{ h.timB }}</div>
            </div>
            <div v-if="h.juara" class="juara-chip">🏆 {{ h.juara }}</div>
          </template>

          <template v-else>
            <div class="podium-mini">
              <div v-if="h.juara1" class="podium-item">🥇 <span>{{ h.juara1 }}</span></div>
              <div v-if="h.juara2" class="podium-item">🥈 <span>{{ h.juara2 }}</span></div>
              <div v-if="h.juara3" class="podium-item">🥉 <span>{{ h.juara3 }}</span></div>
            </div>
          </template>
        </div>
      </div>

      <div v-else class="empty-section">
        Hasil pertandingan belum tersedia.
      </div>
    </section>
    
    <!-- Klasemen -->
    <section style="margin-top:44px;" v-if="hasilStore.loading || klasemenHighlights.length">
      <div class="section-eyebrow" style="color:#2D5B8A;">Klasemen Sementara</div>
      <div class="section-header-row">
        <h2 class="section-title">Voli Putra &amp; Badminton</h2>
        <button class="link-btn" @click="$router.push({ name: 'klasemen' })">Lihat semua →</button>
      </div>

      <div v-if="hasilStore.loading" class="klasemen-grid">
        <div v-for="n in 2" :key="n" class="skeleton-card"></div>
      </div>

      <div v-else-if="klasemenHighlights.length" class="klasemen-grid">
        <div
          v-for="k in klasemenHighlights" :key="k.nama"
          class="klasemen-card" role="button" tabindex="0"
          @click="$router.push({ name: 'klasemen' })"
          @keydown.enter.prevent="$router.push({ name: 'klasemen' })"
          @keydown.space.prevent="$router.push({ name: 'klasemen' })"
        >
          <div class="klasemen-card-title">{{ k.nama }}</div>
          <div class="klasemen-table-wrap">
            <table class="klasemen-mini-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th class="col-tim">Tim</th>
                  <th class="col-num">M</th>
                  <th class="col-num">K</th>
                  <th class="col-num">Poin</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in k.standings" :key="t.nama" :class="{ 'row-lolos': t.rank <= 2 }">
                  <td class="col-rank">{{ t.rank }}</td>
                  <td class="tim-nama">{{ t.nama }}</td>
                  <td class="col-num">{{ t.menang }}</td>
                  <td class="col-num">{{ t.kalah }}</td>
                  <td class="col-num col-poin">{{ t.poin }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="empty-section">
        Klasemen belum tersedia.
      </div>
    </section>

    <!-- Daftar Lomba -->
    <!-- <section style="margin-top:44px;">
      <div class="section-eyebrow" style="color:#2D5B8A;">Cabang Lomba</div>
      <div class="section-header-row">
        <h2 class="section-title">Daftar Lomba</h2>
        <button class="link-btn" @click="$router.push({ name: 'lomba' })">Lihat semua →</button>
      </div>

      <div v-if="kategoriStore.loading" class="lomba-preview-grid">
        <div v-for="n in 6" :key="n" class="skeleton-card"></div>
      </div>

      <div v-else-if="lombaPreview.length" class="lomba-preview-grid">
        <div v-for="kat in lombaPreview" :key="kat.id" class="lomba-preview-card"
          @click="$router.push({ name: 'lomba' })" role="button" tabindex="0">
          <div class="lomba-preview-icon" :style="{ background: kat._color.bg, color: kat._color.color }">
            <svg v-if="kat._icon.type === 'badminton-racket'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12.8" cy="7.6" rx="4.4" ry="5.4" transform="rotate(-20 12.8 7.6)" />
              <path d="M12.8 2.6v10M8.3 7.6h9" transform="rotate(-20 12.8 7.6)" />
              <path d="M10.2 12.6L7.5 19.5" />
            </svg>
            <component v-else :is="kat._icon.icon" :size="22" :stroke-width="1.8" />
          </div>
          <div class="lomba-preview-top">
            <span class="lomba-preview-badge" :style="{ background: tipeStore.bgById(kat.tipeId), color: tipeStore.warnaById(kat.tipeId) }">
              {{ tipeStore.namaById(kat.tipeId) || kat.tipe || '' }}
            </span>
            <span class="lomba-preview-jenis" :class="kat.jenis === 'Perorangan' ? 'jenis-p' : 'jenis-b'">
              {{ kat.jenis || 'Beregu' }}
            </span>
          </div>
          <div class="lomba-preview-nama">{{ kat.nama }}</div>
        </div>
      </div>

      <div v-else class="empty-section">
        Belum ada daftar lomba yang tersedia.
      </div>
    </section> -->


    <!-- Momen Agustusan tahun lalu -->
    <section style="margin-top:44px;">
      <div class="section-eyebrow" style="color:#C0871C;">Momen Terbaru</div>
      <div class="section-header-row">
        <h2 class="section-title">Momen Agustusan Teras Country</h2>
        <button class="link-btn" @click="$router.push({ name: 'galeri' })">Lihat galeri →</button>
      </div>

      <div v-if="galeriStore.loading" class="momen-scroll">
        <div v-for="n in 4" :key="n" class="skeleton-card momen-card"></div>
      </div>

      <div v-else-if="momenFoto.length" class="momen-scroll">
        <div v-for="g in momenFoto" :key="g.id" class="momen-card" @click="$router.push({ name: 'galeri' })" role="button" tabindex="0">
          <div class="momen-img-wrap">
            <img v-if="g.url" :src="g.url" :alt="g.judul" class="momen-img" loading="lazy" @error="e => e.target.style.display='none'" />
            <div v-else class="momen-img-placeholder">🖼️</div>
          </div>
          <div class="momen-body">
            <div class="momen-title">{{ g.judul }}</div>
            <div v-if="g.kategori" class="momen-kat">{{ g.kategori }}</div>
          </div>
        </div>
      </div>

      <div v-else class="empty-section">
        Belum ada foto momen Agustusan tahun lalu.
      </div>
    </section>

    <!-- Sponsor & Media Partner -->
    <section v-if="sponsorStore.loading || sponsorStore.sponsors.length || sponsorStore.mediaPartners.length" style="margin-top:44px; text-align: center;">
      <div class="section-eyebrow" style="color:#9A6B12; ">Terima Kasih Kepada</div>
      <div class="section-header-row sponsor">
        <h2 class="section-title">Sponsor &amp; Media Partner</h2>
      </div>

      <div v-if="sponsorStore.loading" class="sponsor-scroll">
        <div v-for="n in 6" :key="n" class="skeleton-card sponsor-logo-card"></div>
      </div>

      <template v-else>
        <div v-if="sponsorStore.sponsors.length" class="sponsor-group">
          <div class="sponsor-group-label">Sponsor</div>
          <div class="sponsor-scroll">
            <a
              v-for="s in sponsorStore.sponsors" :key="s.id"
              class="sponsor-logo-card"
              :href="s.link || undefined"
              :target="s.link ? '_blank' : undefined"
              :rel="s.link ? 'noopener' : undefined"
              :class="{ 'no-link': !s.link }"
            >
              <img v-if="s.logoUrl" :src="s.logoUrl" :alt="s.nama" class="sponsor-logo-img" loading="lazy" />
              <span v-else class="sponsor-logo-fallback">{{ s.nama }}</span>
            </a>
          </div>
        </div>

        <div v-if="sponsorStore.mediaPartners.length" class="sponsor-group">
          <div class="sponsor-group-label">Media Partner</div>
          <div class="sponsor-scroll">
            <a
              v-for="s in sponsorStore.mediaPartners" :key="s.id"
              class="sponsor-logo-card"
              :href="s.link || undefined"
              :target="s.link ? '_blank' : undefined"
              :rel="s.link ? 'noopener' : undefined"
              :class="{ 'no-link': !s.link }"
            >
              <img v-if="s.logoUrl" :src="s.logoUrl" :alt="s.nama" class="sponsor-logo-img" loading="lazy" />
              <span v-else class="sponsor-logo-fallback">{{ s.nama }}</span>
            </a>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useJadwalStore }    from '@/stores/useJadwal'
import { useHasilStore }     from '@/stores/useHasil'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import { useKategoriStore }  from '@/stores/useKategori'
import { useTipeStore }      from '@/stores/useTipe'
import { useKoridorStore }   from '@/stores/useKoridor'
import { useLokasiStore }    from '@/stores/useLokasi'
import { useGaleriStore }    from '@/stores/useGaleri'
import { useSponsorStore }   from '@/stores/useSponsor'
import StatusBadge from '@/components/StatusBadge.vue'
import {
  Volleyball, Gamepad2, Footprints, HandFist, Utensils,
  CircleDot, TreePalm, Dumbbell, PartyPopper, CalendarDays, Trophy,
  ChevronLeft, ChevronRight,
} from '@lucide/vue'

const jadwalStore   = useJadwalStore()
const hasilStore    = useHasilStore()
const regStore      = useRegistrasiStore()
const kategoriStore = useKategoriStore()
const tipeStore     = useTipeStore()
const koridorStore  = useKoridorStore()
const lokasiStore   = useLokasiStore()
const galeriStore   = useGaleriStore()
const sponsorStore  = useSponsorStore()

const momenFoto = computed(() => galeriStore.list.slice(0, 8))

// Carousel foto terbaru (hero)
const carouselFotos = computed(() => galeriStore.list.slice(0, 8))
const carouselIndex = ref(0)
const currentFoto = computed(() => carouselFotos.value[carouselIndex.value] || {})
let carouselTimer

function nextSlide() {
  if (!carouselFotos.value.length) return
  carouselIndex.value = (carouselIndex.value + 1) % carouselFotos.value.length
}
function prevSlide() {
  if (!carouselFotos.value.length) return
  carouselIndex.value = (carouselIndex.value - 1 + carouselFotos.value.length) % carouselFotos.value.length
}
function goToSlide(i) {
  carouselIndex.value = i
}

watch(carouselFotos, (list) => {
  if (carouselIndex.value >= list.length) carouselIndex.value = 0
})

const upcomingJadwal = computed(() =>
  jadwalStore.listWithStatus.filter(j => j.status !== 'Selesai').slice(0, 3)
)

const lombaPreview = computed(() =>
  [...kategoriStore.list]
    .sort((a, b) => (a.urutan || 999) - (b.urutan || 999))
    .slice(0, 6)
    .map(kat => ({ ...kat, _icon: resolveIcon(kat), _color: resolveColor(kat) }))
)

// Ikon representatif per lomba berdasarkan kata kunci nama.
// 'badminton-racket' dirender sebagai SVG custom (lihat template), sisanya pakai @lucide/vue.
const LOMBA_ICON_KEYWORDS = [
  { test: /voli|volley/i,                icon: Volleyball },
  { test: /mobile legends|e-?sport|valorant|free ?fire/i, icon: Gamepad2 },
  { test: /karung/i,                     icon: Footprints },
  { test: /tarik ?tambang/i,             icon: HandFist },
  { test: /kerupuk/i,                    icon: Utensils },
  { test: /kelereng/i,                   icon: CircleDot },
  { test: /pinang/i,                     icon: TreePalm },
]

const TIPE_ICON_FALLBACK = {
  Olahraga:    Dumbbell,
  Tradisional: PartyPopper,
  'E-Sport':   Gamepad2,
  Acara:       CalendarDays,
}

function resolveIcon(kat) {
  const nama = kat.nama || ''
  if (/futsal|sepak ?bola/i.test(nama))      return { type: 'lucide', icon: Trophy }
  if (/badminton|bulu ?tangkis/i.test(nama)) return { type: 'badminton-racket' }

  const found = LOMBA_ICON_KEYWORDS.find(k => k.test.test(nama))
  if (found) return { type: 'lucide', icon: found.icon }

  const tipeNama = tipeStore.namaById(kat.tipeId) || kat.tipe
  return { type: 'lucide', icon: TIPE_ICON_FALLBACK[tipeNama] || Trophy }
}

// Override warna khusus per lomba (di luar warna default tipe)
const LOMBA_COLOR_OVERRIDE = [
  { test: /voli putra/i, bg: '#E5EDF7', color: '#2D5B8A' },
]

function resolveColor(kat) {
  const found = LOMBA_COLOR_OVERRIDE.find(o => o.test.test(kat.nama || ''))
  if (found) return { bg: found.bg, color: found.color }
  return { bg: tipeStore.bgById(kat.tipeId), color: tipeStore.warnaById(kat.tipeId) }
}

// Countdown ke opening
const TARGET = new Date('2026-07-11T08:00:00+07:00').getTime()
const now    = ref(Date.now())
let timer

const countdown = computed(() => {
  let t = TARGET - now.value; if (t < 0) t = 0
  const pad = n => String(n).padStart(2, '0')
  return {
    Hari:  Math.floor(t / 86400000),
    Jam:   pad(Math.floor(t / 3600000) % 24),
    Menit: pad(Math.floor(t / 60000)   % 60),
    Detik: pad(Math.floor(t / 1000)    % 60),
  }
})

const katColor = (k) => ({
  Olahraga:    '#CE1126',
  Tradisional: '#C0871C',
  'E-Sport':   '#2D5B8A',
  Acara:       '#2E7D52',
})[k] || '#CE1126'

const lokasiNama = (j) => {
  if (j.lokasiId) return lokasiStore.list.find(l => l.id === j.lokasiId)?.nama || j.lokasi || j.venue || ''
  return j.lokasi || j.venue || ''
}

const monthMap = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
}

function hariDariTgl(jadwal) {
  if (jadwal?.hari) return jadwal.hari
  if (jadwal?.tglDate instanceof Date && !Number.isNaN(jadwal.tglDate.getTime())) {
    return jadwal.tglDate.toLocaleDateString('id-ID', { weekday: 'long' })
  }

  const parts = String(jadwal?.tgl || '').trim().split(/\s+/)
  if (parts.length < 2) return '-'

  const tanggal = Number(parts[0])
  const bulan = monthMap[parts[1]]
  if (!tanggal || bulan === undefined) return '-'

  const date = new Date(2026, bulan, tanggal)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', { weekday: 'long' })
}

function truncateWords(text, maxWords) {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '…'
}

function isPerorangan(h) {
  return !!(h.juara1 || h.juara2 || h.juara3) || h.jenis === 'Perorangan'
}

// Klasemen ringkas — hanya Voli Putra & Badminton (yg paling ditunggu warga)
function normalizeTimKey(nama) {
  return (nama || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function cabangKlasemenType(nama) {
  const n = (nama || '').toLowerCase()
  if (n.includes('badminton')) return 'badminton'
  if (n.includes('voli') || n.includes('volly')) return 'voli'
  return null
}

// Poin: badminton menang=1/kalah=0; voli 2-0=3poin, 2-1=2poin, 1-2=1poin, 0-2=0poin
function standingsFor(katNama) {
  const type = cabangKlasemenType(katNama)
  if (!type) return []

  const entries = hasilStore.list.filter(e =>
    e.cabang === katNama && e.timA && e.timB && /(\d+)\s*[–—-]\s*(\d+)/.test(e.skor || '')
  )
  if (!entries.length) return []

  const teams = {}
  function team(nama) {
    const key = normalizeTimKey(nama)
    if (!teams[key]) teams[key] = { nama: (nama || '').trim(), main: 0, menang: 0, kalah: 0, unitFor: 0, unitAgainst: 0, poin: 0 }
    return teams[key]
  }

  entries.forEach(e => {
    const m = e.skor.match(/(\d+)\s*[–—-]\s*(\d+)/)
    const a = Number(m[1])
    const b = Number(m[2])
    const tA = team(e.timA)
    const tB = team(e.timB)
    tA.main++; tB.main++
    tA.unitFor += a; tA.unitAgainst += b
    tB.unitFor += b; tB.unitAgainst += a
    if (a === b) return

    if (type === 'badminton') {
      if (a > b) { tA.menang++; tA.poin += 1; tB.kalah++ }
      else       { tB.menang++; tB.poin += 1; tA.kalah++ }
    } else {
      const winUnit  = Math.max(a, b)
      const loseUnit = Math.min(a, b)
      const [poinMenang, poinKalah] = (winUnit === 2 && loseUnit === 0) ? [3, 0] : [2, 1]
      if (a > b) { tA.menang++; tA.poin += poinMenang; tB.kalah++; tB.poin += poinKalah }
      else       { tB.menang++; tB.poin += poinMenang; tA.kalah++; tA.poin += poinKalah }
    }
  })

  return Object.values(teams)
    .map(t => ({ ...t, selisih: t.unitFor - t.unitAgainst }))
    .sort((x, y) => y.poin - x.poin || y.selisih - x.selisih || y.unitFor - x.unitFor)
    .map((t, i) => ({ ...t, rank: i + 1 }))
}

const kategoriVoliPutra = computed(() =>
  kategoriStore.list.find(k => /voli/i.test(k.nama) && !/putri/i.test(k.nama))
)
const kategoriBadminton = computed(() =>
  kategoriStore.list.find(k => /badminton/i.test(k.nama))
)

const klasemenHighlights = computed(() => {
  const items = []
  for (const kat of [kategoriVoliPutra.value, kategoriBadminton.value]) {
    if (!kat) continue
    const standings = standingsFor(kat.nama).slice(0, 3)
    if (standings.length) items.push({ nama: kat.nama, standings })
  }
  return items
})

onMounted(() => {
  jadwalStore.fetch()
  hasilStore.fetch()
  regStore.fetch()
  kategoriStore.fetch()
  tipeStore.fetch()
  koridorStore.fetch()
  lokasiStore.fetch()
  galeriStore.fetch()
  sponsorStore.fetch()
  timer = setInterval(() => { now.value = Date.now() }, 1000)
  carouselTimer = setInterval(nextSlide, 4000)
})
onUnmounted(() => {
  clearInterval(timer)
  clearInterval(carouselTimer)
})
</script>

<style scoped>
/* ── Hero ───────────────────────────────── */
.hero-grid { display:grid; grid-template-columns:1.15fr .85fr; gap:16px; align-items:stretch; }
.hero-card {
  display:flex; 
  flex-direction:column; 
  justify-content:center;
}
.hero-badge {
  display:inline-flex; align-items:center; gap:8px;
  color:#CE1126; font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.1em; text-transform:uppercase;
}
.hero-title   { margin:16px 0 0; font:900 42px/1.05 Archivo; letter-spacing:-.02em; color:#1A1613; }
.hero-title-accent { color:#CE1126; }
.hero-desc    { margin:16px 0 0; font:500 17px/1.6 'Plus Jakarta Sans'; color:#5A534B; max-width:46ch; }
.hero-actions { display:flex; gap:12px; margin-top:26px; flex-wrap:wrap; }
.btn-primary  { padding:14px 26px; border:none; border-radius:8px; background:#CE1126; color:#fff; font:800 15px/1 'Plus Jakarta Sans'; cursor:pointer; box-shadow:0 8px 20px rgba(206,17,38,.22); }
.btn-secondary{ padding:14px 26px; border:1.5px solid #E0D8CE; border-radius:8px; background:#fff; color:#1A1613; font:800 15px/1 'Plus Jakarta Sans'; cursor:pointer; transition:border-color .15s, color .15s; }
.btn-secondary:hover { border-color:#CE1126; color:#CE1126; }

/* ── Countdown ──────────────────────────── */
.countdown-card { background:#1A1613; border-radius:10px; padding:32px; color:#fff; display:flex; flex-direction:column; }
.cd-label { font:700 12px/1 'Plus Jakarta Sans'; letter-spacing:.14em; text-transform:uppercase; color:#E0A82E; }
.cd-title { font:800 20px/1.2 Archivo; margin-top:8px; }
.cd-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-top:22px; }
.cd-box   { background:rgba(255,255,255,.08); border-radius:14px; padding:14px 6px; text-align:center; }
.cd-num   { font:800 30px/1 Archivo; }
.cd-unit  { font:600 10px/1 'Plus Jakarta Sans'; letter-spacing:.08em; text-transform:uppercase; color:#B8B0A6; margin-top:6px; }
.cd-stats { display:flex; gap:10px; margin-top:20px; }
.cd-stat-box { flex:1; background:rgba(255,255,255,.06); border-radius:12px; padding:12px; text-align:center; }
.cd-stat-val { font:800 22px/1 Archivo; color:#F4C36B; }
.cd-stat-lbl { font:600 10px/1.2 'Plus Jakarta Sans'; color:#B8B0A6; margin-top:5px; }

/* ── Carousel foto terbaru ──────────────── */
.hero-carousel { position:relative; min-height:320px; border-radius:10px; overflow:hidden; background:#1A1613; }
.carousel-img { width:100%; height:100%; object-fit:cover; display:block; position:absolute; inset:0; cursor:pointer; }
.carousel-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(26,22,19,.78) 0%, rgba(26,22,19,0) 55%); pointer-events:none; }
.carousel-tag {
  position:absolute; top:16px; left:16px; z-index:1;
  font:700 12px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase;
  color:#E0A82E; background:rgba(0,0,0,.35); padding:6px 12px; border-radius:999px;
}
.carousel-caption {
  position:absolute; left:18px; right:18px; bottom:42px; z-index:1;
  color:#fff; font:800 17px/1.3 Archivo;
  overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical;
}
.carousel-nav {
  position:absolute; top:50%; transform:translateY(-50%); z-index:1;
  width:34px; height:34px; border-radius:50%; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  background:rgba(255,255,255,.85); color:#1A1613; transition:background .15s;
}
.carousel-nav:hover { background:#fff; }
.carousel-prev { left:12px; }
.carousel-next { right:12px; }
.carousel-dots { position:absolute; bottom:14px; left:0; right:0; z-index:1; display:flex; justify-content:center; gap:6px; }
.carousel-dot { width:7px; height:7px; padding:0; border-radius:50%; border:none; cursor:pointer; background:rgba(255,255,255,.4); transition:all .2s; }
.carousel-dot.active { width:18px; border-radius:4px; background:#fff; }
.hero-carousel-empty {
  display:flex; align-items:center; justify-content:center;
  color:#B8B0A6; font:500 14px/1 'Plus Jakarta Sans';
  border:1.5px dashed rgba(255,255,255,.15);
}
.fade-enter-active, .fade-leave-active { transition:opacity .4s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; }

/* ── Quick links ────────────────────────── */
.quick-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:16px; }
.quick-card {
  text-align:left; background:#fff; border:1.5px solid #F0D3D7; border-radius:8px;
  padding:22px; cursor:pointer; transition:border-color .15s, transform .15s;
}
.quick-card:hover { border-color:#CE1126; transform:translateY(-2px); }
.quick-icon  { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; }
.quick-title { font:800 18px/1.1 Archivo; margin-top:14px; color:#1A1613; }
.quick-desc  { font:500 13px/1.5 'Plus Jakarta Sans'; color:#7A7368; margin-top:6px; }

/* ── Section headers ────────────────────── */
.section-eyebrow  { font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#CE1126; }
.section-title    { font:800 30px/1.05 Archivo; color:#1A1613; letter-spacing:-.01em; margin:9px 0 0; }
.section-header-row { 
  display:flex; 
  align-items:flex-end; 
  justify-content:space-between; 
  gap:16px; 
  flex-wrap:wrap; 
  margin-bottom:20px; 
  &.sponsor {
    justify-content: center;
  }
}
.link-btn { background:transparent; border:none; color:#CE1126; font:700 14px/1 'Plus Jakarta Sans'; cursor:pointer; }

/* ── Skeleton ───────────────────────────── */
.skeleton-row {
  height:76px; border-radius:8px;
  background:linear-gradient(90deg,#F0EBE2 25%,#E8E2DA 50%,#F0EBE2 75%);
  background-size:200% 100%; animation:shimmer 1.4s infinite;
}
.skeleton-card {
  height:130px; border-radius:8px;
  background:linear-gradient(90deg,#F0EBE2 25%,#E8E2DA 50%,#F0EBE2 75%);
  background-size:200% 100%; animation:shimmer 1.4s infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Jadwal terdekat ────────────────────── */
.jadwal-list  { display:flex; flex-direction:column; gap:12px; }
.jadwal-row   {
  display:flex; align-items:center; gap:16px; background:#fff;
  border:1.5px solid #F0D3D7; border-radius:8px; padding:16px 18px; flex-wrap:wrap;
  cursor:pointer; transition:border-color .15s;
}
.jadwal-row:hover { border-color:#CE1126; }
.jadwal-date  { flex:0 0 auto; text-align:center; min-width:64px; }
.jadwal-hari  { font:700 10px/1 'Plus Jakarta Sans'; letter-spacing:.08em; text-transform:uppercase; color:#9A6B12; margin-bottom:3px; }
.jadwal-tgl   { font:800 15px/1 Archivo; color:#CE1126; }
.jadwal-jam   { font:600 13px/1 'Plus Jakarta Sans'; color:#7A7368; margin-top:5px; }
.divider-v    { width:1px; align-self:stretch; background:#ECE7DE; }
.jadwal-info  { flex:1; min-width:160px; }
.jadwal-cabang{ font:700 15px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
.jadwal-peserta{ font:500 13px/1.4 'Plus Jakarta Sans'; color:#5A534B; margin-top:5px; }
.jadwal-sub   { font:500 12px/1.4 'Plus Jakarta Sans'; color:#7A7368; margin-top:4px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.jadwal-babak { font:700 10px/1 'Plus Jakarta Sans'; letter-spacing:.05em; text-transform:uppercase; color:#2D5B8A; background:#E7EEF6; border-radius:4px; padding:2px 7px; }
.dot          { width:9px; height:9px; border-radius:50%; display:inline-block; flex-shrink:0; }

/* ── Daftar Lomba ───────────────────────── */
.lomba-preview-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.lomba-preview-card {
  background:#fff; border:1.5px solid #F0D3D7; border-radius:8px; padding:20px;
  cursor:pointer; transition:border-color .15s, transform .15s;
  display:flex; flex-direction:column;
}
.lomba-preview-card:hover { border-color:#CE1126; transform:translateY(-2px); }
.lomba-preview-icon {
  width:44px; height:44px; border-radius:12px; flex-shrink:0;
  display:flex; align-items:center; justify-content:center; margin-bottom:14px;
}
.lomba-preview-top   { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
.lomba-preview-badge { padding:5px 11px; border-radius:999px; font:700 11px/1 'Plus Jakarta Sans'; letter-spacing:.04em; text-transform:uppercase; }
.lomba-preview-jenis { font:700 10px/1 'Plus Jakarta Sans'; letter-spacing:.06em; text-transform:uppercase; padding:4px 9px; border-radius:6px; }
.jenis-b { background:#E5EDF7; color:#2D5B8A; }
.jenis-p { background:#FBF1DD; color:#C0871C; }
.lomba-preview-nama { font:800 17px/1.2 Archivo; color:#1A1613; }
.lomba-preview-desc { font:500 13px/1.5 'Plus Jakarta Sans'; color:#7A7368; margin-top:8px; flex:1; }

/* ── Hasil terbaru ──────────────────────── */
.hasil-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.hasil-card  { background:#fff; border:1.5px solid #F0D3D7; border-radius:8px; padding:18px; display:flex; flex-direction:column; gap:12px; cursor:pointer; transition:box-shadow .15s ease, border-color .15s ease; }
.hasil-card:hover { border-color:#CE1126; box-shadow:0 8px 24px rgba(206,17,38,.12); }
.hasil-card:focus-visible { outline:3px solid rgba(206,17,38,.25); outline-offset:2px; }
.hasil-head  { display:flex; align-items:center; gap:8px; }
.hasil-cabang{ font:700 14px/1.2 'Plus Jakarta Sans'; color:#1A1613; flex:1; min-width:0; }
.hasil-tgl   { font:500 11px/1 'Plus Jakarta Sans'; color:#9A9389; white-space:nowrap; }

.skor-row    { display:flex; align-items:center; justify-content:center; gap:10px; }
.tim         { flex:1; font:700 13px/1.3 'Plus Jakarta Sans'; color:#5A534B; text-align:right; }
.tim-r       { text-align:left; }
.skor        { flex-shrink:0; font:900 22px/1 Archivo; color:#CE1126; background:#FBEAEC; border-radius:10px; padding:7px 12px; }
.juara-chip  { font:700 13px/1 'Plus Jakarta Sans'; color:#2E7D52; background:#E7F2EB; border-radius:8px; padding:8px 12px; }

.podium-mini { display:flex; flex-direction:column; gap:7px; background:#FAF8F3; border-radius:8px; padding:10px 12px; }
.podium-item { display:flex; align-items:center; gap:8px; font:600 13px/1.3 'Plus Jakarta Sans'; color:#1A1613; }
.podium-item span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* ── Klasemen ────────────────────────────── */
.klasemen-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
.klasemen-card {
  background:#fff; border:1.5px solid #F0D3D7; border-top:3px solid #2D5B8A; border-radius:8px;
  padding:18px 20px; cursor:pointer; transition:border-color .15s, transform .15s;
}
.klasemen-card:hover { border-color:#2D5B8A; transform:translateY(-2px); }
.klasemen-card-title { font:800 16px/1.2 Archivo; color:#1A1613; margin-bottom:14px; }
.klasemen-table-wrap { overflow-x:auto; }
.klasemen-mini-table { width:100%; border-collapse:collapse; min-width:280px; font:500 13px/1.4 'Plus Jakarta Sans'; }
.klasemen-mini-table th {
  padding:8px 10px; text-align:left; font:700 10px/1 'Plus Jakarta Sans'; color:#7A7368;
  letter-spacing:.04em; text-transform:uppercase; border-bottom:1px solid #E2DCD2; white-space:nowrap;
}
.klasemen-mini-table td { padding:9px 10px; border-bottom:1px solid #F0EBE2; white-space:nowrap; }
.klasemen-mini-table tbody tr:last-child td { border-bottom:none; }
.klasemen-mini-table .col-rank { text-align:center; font-weight:800; color:#1A1613; width:1%; }
.klasemen-mini-table .col-num  { text-align:center; width:1%; }
.klasemen-mini-table .col-tim  { width:100%; }
.klasemen-mini-table .col-poin { font-weight:800; color:#2D5B8A; }
.klasemen-mini-table .tim-nama { font:700 13px/1.3 'Plus Jakarta Sans'; color:#1A1613; }
.klasemen-mini-table tbody tr.row-lolos { background:#E9F7EF; }
.klasemen-mini-table tbody tr.row-lolos .col-rank { color:#1E9E5A; }
.klasemen-mini-table tbody tr.row-lolos .tim-nama { color:#157A45; }

/* ── Momen Agustusan tahun lalu ─────────── */
.momen-scroll { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.momen-card {
  background:#fff; border:1.5px solid #F0D3D7; border-radius:10px; overflow:hidden;
  cursor:pointer; transition:transform .18s, box-shadow .18s;
}
.momen-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.10); }
.momen-img-wrap { aspect-ratio:4/3; overflow:hidden; background:#FAF8F3; }
.momen-img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .3s; }
.momen-card:hover .momen-img { transform:scale(1.04); }
.momen-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:32px; }
.momen-body  { padding:10px 12px 12px; }
.momen-title { font:700 13px/1.3 'Plus Jakarta Sans'; color:#1A1613; }
.momen-kat   { margin-top:6px; display:inline-block; padding:3px 9px; border-radius:999px; background:#FFF3CD; color:#856404; font:600 11px/1 'Plus Jakarta Sans'; }

/* ── Sponsor & Media Partner ────────────── */
.sponsor-group { margin-top:20px; }
.sponsor-group:first-child { margin-top:0; }
.sponsor-group-label {
  font:700 12px/1 'Plus Jakarta Sans'; letter-spacing:.08em; text-transform:uppercase;
  color:#7A7368; margin-bottom:12px;
}
.sponsor-scroll { display:flex; flex-wrap:wrap; gap:14px; justify-content: center;}
.sponsor-logo-card {
  flex:0 0 auto; width:150px; height:88px;
  display:flex; align-items:center; justify-content:center;
  background:#fff; border:1.5px solid #F0D3D7; border-radius:10px;
  padding:14px; transition:border-color .15s, transform .15s, box-shadow .15s;
}
a.sponsor-logo-card { cursor:pointer; }
a.sponsor-logo-card:hover { border-color:#CE1126; transform:translateY(-2px); box-shadow:0 8px 20px rgba(206,17,38,.10); }
a.sponsor-logo-card.no-link { cursor:default; }
a.sponsor-logo-card.no-link:hover { border-color:#F0D3D7; transform:none; box-shadow:none; }
.sponsor-logo-img { max-width:100%; max-height:100%; object-fit:contain; }
.sponsor-logo-fallback {
  font:700 13px/1.3 'Plus Jakarta Sans'; color:#5A534B; text-align:center;
  overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical;
}

/* ── Empty ──────────────────────────────── */
.empty-section {
  padding:32px; border:1.5px dashed #E0D8CE; border-radius:10px;
  text-align:center; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans';
}

/* ── Responsive ─────────────────────────── */
@media(max-width:1023px) {
  .hasil-grid { grid-template-columns:repeat(2,1fr); }
  .momen-scroll { grid-template-columns:repeat(3,1fr); }
  .lomba-preview-grid { grid-template-columns:repeat(2,1fr); }
}
@media(max-width:767px) {
  .hero-grid, .quick-grid { grid-template-columns:1fr !important; }
  .klasemen-grid { grid-template-columns:1fr; }
  .hero-grid { gap:16px; }
  .hero-title { font-size:34px !important; }
  .hero-desc { font-size:15px; }
  .countdown-card { padding:20px; }
  .cd-grid { grid-template-columns:repeat(2,1fr); }
  .section-title { font-size:24px; }
  .jadwal-row { padding:14px; gap:10px; }
  .quick-grid { margin-top:12px; gap:10px; }
  .quick-card { padding:16px; }
  .hasil-grid { grid-template-columns:1fr; }
  .hero-card {
    padding: 8px 0 16px;
  }

  .momen-scroll {
    display:flex; grid-template-columns:none; overflow-x:auto; gap:12px;
    padding-bottom:6px; scroll-snap-type:x proximity;
    -webkit-overflow-scrolling:touch; scrollbar-width:none;
  }
  .momen-scroll::-webkit-scrollbar { display:none; }
  .momen-card { flex:0 0 62%; scroll-snap-align:start; }

  .sponsor-logo-card { width:120px; height:72px; padding:10px; }

  .lomba-preview-grid {
    display:flex; grid-template-columns:none; overflow-x:auto; gap:12px;
    padding-bottom:6px; scroll-snap-type:x proximity;
    -webkit-overflow-scrolling:touch; scrollbar-width:none;
  }
  .lomba-preview-grid::-webkit-scrollbar { display:none; }
  .lomba-preview-card { flex:0 0 78%; scroll-snap-align:start; }
}
</style>
