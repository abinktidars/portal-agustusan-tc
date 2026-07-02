<template>
  <div>
    <!-- Hero + Countdown -->
    <section class="hero-grid">
      <!-- Hero card -->
      <div class="hero-card">
        <div class="hero-bg-circle"></div>
        <div class="hero-bg-stripe"></div>
        <div style="position:relative;">
          <div class="hero-badge">11 Juli – 31 Agustus 2026</div>
          <h1 class="hero-title">Semarak<br>Kemerdekaan <span style="color:#F4C36B;">ke-81</span></h1>
          <p class="hero-desc">Portal bersama warga Teras Country Residence. Cek jadwal &amp; hasil pertandingan, klasemen, dan daftar lomba — semua di satu tempat.</p>
          <div class="hero-actions">
            <button class="btn-white" @click="$router.push({ name: 'registrasi' })">Daftar Lomba Sekarang</button>
          </div>
        </div>
      </div>

      <!-- Countdown card -->
      <div class="countdown-card">
        <div class="cd-label">Menuju Opening</div>
        <div class="cd-title">Opening Acara<br><span style="color:#F4C36B;">Sabtu, 11 Juli 2026</span></div>
        <div class="cd-grid">
          <div class="cd-box" v-for="(val, lbl) in countdown" :key="lbl">
            <div class="cd-num" :style="lbl === 'Detik' ? 'color:#F4C36B' : ''">{{ val }}</div>
            <div class="cd-unit">{{ lbl }}</div>
          </div>
        </div>
        <div class="cd-stats">
          <div class="cd-stat-box">
            <div class="cd-stat-val">{{ kategoriStore.list.length || '—' }}</div>
            <div class="cd-stat-lbl">Cabang Lomba</div>
          </div>
          <div class="cd-stat-box">
            <div class="cd-stat-val">{{ regStore.list.length || '—' }}</div>
            <div class="cd-stat-lbl">Tim Terdaftar</div>
          </div>
          <div class="cd-stat-box">
            <div class="cd-stat-val">{{ koridorStore.list.length || '—' }}</div>
            <div class="cd-stat-lbl">Koridor</div>
          </div>
        </div>
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
        <div v-for="n in 3" :key="n" class="skeleton-row"></div>
      </div>

      <div v-else-if="jadwalStore.upcoming.length" class="jadwal-list">
        <div v-for="j in jadwalStore.upcoming" :key="j.id" class="jadwal-row"
          @click="$router.push({ name: 'jadwal' })" role="button" tabindex="0">
          <div class="jadwal-date">
            <div class="jadwal-tgl">{{ j.tglMulai || j.tgl }}</div>
            <div class="jadwal-jam">{{ j.jamMulai || j.jam }}</div>
          </div>
          <div class="divider-v"></div>
          <div class="jadwal-info">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="dot" :style="{ background: katColor(j.kat) }"></span>
              <span class="jadwal-cabang">{{ j.cabang }}</span>
            </div>
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

    <!-- Daftar Lomba -->
    <section style="margin-top:44px;">
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
    </section>

    <!-- Hasil terbaru -->
    <!-- <section style="margin-top:44px;">
      <div class="section-eyebrow" style="color:#2E7D52;">Hasil Pertandingan</div>
      <div class="section-header-row">
        <h2 class="section-title">Terbaru</h2>
        <button class="link-btn" @click="$router.push({ name: 'hasil' })">Lihat semua →</button>
      </div>

      <div v-if="hasilStore.loading" class="hasil-grid">
        <div v-for="n in 3" :key="n" class="skeleton-card"></div>
      </div>

      <div v-else-if="hasilStore.list.length" class="hasil-grid">
        <div v-for="h in hasilStore.list.slice(0, 3)" :key="h.id" class="hasil-card">
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
    </section> -->

    <!-- Momen Agustusan tahun lalu -->
    <section style="margin-top:44px;">
      <div class="section-eyebrow" style="color:#C0871C;">Kilas Balik</div>
      <div class="section-header-row">
        <h2 class="section-title">Momen Agustusan Tahun Lalu</h2>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useJadwalStore }    from '@/stores/useJadwal'
import { useHasilStore }     from '@/stores/useHasil'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import { useKategoriStore }  from '@/stores/useKategori'
import { useTipeStore }      from '@/stores/useTipe'
import { useKoridorStore }   from '@/stores/useKoridor'
import { useLokasiStore }    from '@/stores/useLokasi'
import { useGaleriStore }    from '@/stores/useGaleri'
import StatusBadge from '@/components/StatusBadge.vue'
import {
  Volleyball, Gamepad2, Footprints, HandFist, Utensils,
  CircleDot, TreePalm, Dumbbell, PartyPopper, CalendarDays, Trophy,
} from '@lucide/vue'

const jadwalStore   = useJadwalStore()
const hasilStore    = useHasilStore()
const regStore      = useRegistrasiStore()
const kategoriStore = useKategoriStore()
const tipeStore     = useTipeStore()
const koridorStore  = useKoridorStore()
const lokasiStore   = useLokasiStore()
const galeriStore   = useGaleriStore()

const momenFoto = computed(() => galeriStore.list.slice(0, 8))

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

function truncateWords(text, maxWords) {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '…'
}

function isPerorangan(h) {
  return !!(h.juara1 || h.juara2 || h.juara3) || h.jenis === 'Perorangan'
}

onMounted(() => {
  jadwalStore.fetch()
  hasilStore.fetch()
  regStore.fetch()
  kategoriStore.fetch()
  tipeStore.fetch()
  koridorStore.fetch()
  lokasiStore.fetch()
  galeriStore.fetch()
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
/* ── Hero ───────────────────────────────── */
.hero-grid { display:grid; grid-template-columns:1.15fr .85fr; gap:16px; align-items:stretch; }
.hero-card {
  background:#CE1126; border-radius:10px; padding:24px;
  display:flex; flex-direction:column; justify-content:center;
  position:relative; overflow:hidden;
}
.hero-bg-circle {
  position:absolute; top:-50px; right:-50px; width:220px; height:220px;
  border-radius:50%; background:repeating-linear-gradient(45deg,rgba(255,255,255,.16) 0 14px,transparent 14px 28px);
}
.hero-bg-stripe {
  position:absolute; bottom:0; left:0; right:0; height:5px;
  background:repeating-linear-gradient(90deg,#fff 0 15px,transparent 15px 30px); opacity:.5;
}
.hero-badge {
  display:inline-flex; align-items:center; gap:8px; padding:7px 14px;
  border-radius:999px; background:rgba(255,255,255,.18); color:#fff;
  font:700 12px/1 'Plus Jakarta Sans'; letter-spacing:.04em;
}
.hero-title   { margin:18px 0 0; font:900 42px/.98 Archivo; letter-spacing:-.02em; color:#fff; }
.hero-desc    { margin:18px 0 0; font:500 17px/1.6 'Plus Jakarta Sans'; color:rgba(255,255,255,.9); max-width:46ch; }
.hero-actions { display:flex; gap:12px; margin-top:26px; flex-wrap:wrap; }
.btn-white    { padding:14px 24px; border:none; border-radius:8px; background:#fff; color:#CE1126; font:800 15px/1 'Plus Jakarta Sans'; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,.18); }

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
.section-header-row { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:20px; }
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
.jadwal-tgl   { font:800 15px/1 Archivo; color:#CE1126; }
.jadwal-jam   { font:600 13px/1 'Plus Jakarta Sans'; color:#7A7368; margin-top:5px; }
.divider-v    { width:1px; align-self:stretch; background:#ECE7DE; }
.jadwal-info  { flex:1; min-width:160px; }
.jadwal-cabang{ font:700 15px/1.2 'Plus Jakarta Sans'; color:#1A1613; }
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
.hasil-card  { background:#fff; border:1.5px solid #F0D3D7; border-radius:8px; padding:18px; display:flex; flex-direction:column; gap:12px; }
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
  .hero-grid { gap:16px; }
  .hero-title { font-size:34px !important; }
  .hero-desc { font-size:15px; }
  .hero-card { padding:20px; }
  .countdown-card { padding:20px; }
  .cd-grid { grid-template-columns:repeat(2,1fr); }
  .section-title { font-size:24px; }
  .jadwal-row { padding:14px; gap:10px; }
  .quick-grid { margin-top:12px; gap:10px; }
  .quick-card { padding:16px; }
  .hasil-grid { grid-template-columns:1fr; }

  .momen-scroll {
    display:flex; grid-template-columns:none; overflow-x:auto; gap:12px;
    padding-bottom:6px; scroll-snap-type:x proximity;
    -webkit-overflow-scrolling:touch; scrollbar-width:none;
  }
  .momen-scroll::-webkit-scrollbar { display:none; }
  .momen-card { flex:0 0 62%; scroll-snap-align:start; }

  .lomba-preview-grid {
    display:flex; grid-template-columns:none; overflow-x:auto; gap:12px;
    padding-bottom:6px; scroll-snap-type:x proximity;
    -webkit-overflow-scrolling:touch; scrollbar-width:none;
  }
  .lomba-preview-grid::-webkit-scrollbar { display:none; }
  .lomba-preview-card { flex:0 0 78%; scroll-snap-align:start; }
}
</style>
