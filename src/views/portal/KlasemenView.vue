<template>
  <div>
    <div class="eyebrow">Hasil Cabang Lomba</div>
    <h2 class="page-title">Klasemen Per Kategori</h2>

    <!-- Tipe Tabs -->
    <div ref="chipRowRef" class="tcr-scroll chip-row">
      <button
        v-for="(tipe, i) in tipeStore.list"
        :key="tipe.id"
        :ref="el => { if (el) chipBtnRefs[i] = el }"
        class="chip"
        :class="{ active: activeTipe === tipe.id }"
        :style="activeTipe === tipe.id
          ? { background: tipe.warna, color: '#fff', borderColor: tipe.warna }
          : {}"
        @click="selectTipe(tipe.id, i)"
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
          :class="{ 'kat-card--full': standingsOf(kat.nama) }"
          :style="{
            '--tc': activeTipeObj?.warna || '#CE1126',
            '--tb': activeTipeObj?.bg    || '#FBEAEC',
          }"
        >
          <div class="kat-card-top">
            <span class="kat-nama">{{ kat.nama }}</span>
            <span class="kat-jenis">{{ kat.jenis || 'Beregu' }}</span>
          </div>

          <!-- Kategori beregu dengan hasil pertandingan (set/gol) → tabel klasemen -->
          <template v-if="standingsOf(kat.nama)">
            <div class="standings-table-wrap">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th class="col-rank">Rank</th>
                    <th class="col-tim">Tim</th>
                    <th class="col-num">Main</th>
                    <th class="col-num">Menang</th>
                    <th v-if="cabangType(kat.nama) === 'futsal'" class="col-num">Seri</th>
                    <th class="col-num">Kalah</th>
                    <th class="col-num">{{ unitLabel(kat.nama) }}</th>
                    <th v-if="cabangType(kat.nama) === 'badminton'" class="col-num">Selisih Set</th>
                    <th class="col-num">Poin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="t in standingsOf(kat.nama)"
                    :key="t.nama"
                    :class="{ 'row-lolos': t.rank <= 2 }"
                  >
                    <td class="col-rank" data-label="Rank">{{ t.rank }}</td>
                    <td class="tim-nama" data-label="Tim">{{ t.nama }}</td>
                    <td class="col-num" data-label="Main">{{ t.main }}</td>
                    <td class="col-num" data-label="Menang">{{ t.menang }}</td>
                    <td v-if="cabangType(kat.nama) === 'futsal'" class="col-num" data-label="Seri">{{ t.seri }}</td>
                    <td class="col-num" data-label="Kalah">{{ t.kalah }}</td>
                    <td class="col-num" :data-label="unitLabel(kat.nama)">
                      <template v-if="cabangType(kat.nama) === 'futsal'">{{ formatSelisih(t.selisih) }}</template>
                      <template v-else>{{ t.unitFor }}-{{ t.unitAgainst }}</template>
                    </td>
                    <td v-if="cabangType(kat.nama) === 'badminton'" class="col-num" data-label="Selisih Set">{{ formatSelisih(t.selisih) }}</td>
                    <td class="col-num col-poin" data-label="Poin">{{ t.poin }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="lolos-caption">
              <span class="lolos-dot"></span>
              2 tim teratas (disorot) lolos ke <strong>Babak Final</strong>
            </div>
          </template>

          <!-- Ada hasil -->
          <template v-else-if="klasemenOf(kat.nama)">
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useHasilStore }      from '@/stores/useHasil'
import { useKategoriStore }   from '@/stores/useKategori'
import { useTipeStore }       from '@/stores/useTipe'
import { useRegistrasiStore } from '@/stores/useRegistrasi'

const hasilStore       = useHasilStore()
const kategoriStore    = useKategoriStore()
const tipeStore        = useTipeStore()
const registrasiStore  = useRegistrasiStore()

const activeTipe  = ref(null)
const chipRowRef  = ref(null)
const chipBtnRefs = []

function scrollToCenter(row, btn) {
  if (!row || !btn) return
  row.scrollTo({ left: btn.offsetLeft - row.clientWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' })
}

async function selectTipe(id, i) {
  activeTipe.value = id
  await nextTick()
  scrollToCenter(chipRowRef.value, chipBtnRefs[i])
}

const isLoading = computed(() =>
  hasilStore.loading || kategoriStore.loading || tipeStore.loading || registrasiStore.loading
)

const activeTipeObj = computed(() =>
  tipeStore.list.find(t => t.id === activeTipe.value)
)

// Kategori yang disembunyikan sementara dari halaman klasemen
const HIDDEN_KATEGORI_PATTERNS = [
  k => /voli/i.test(k) && /putri/i.test(k),
  k => /shooting/i.test(k) && /basket/i.test(k),
]

// Urutan tampil tabel klasemen
const KATEGORI_ORDER = ['voli', 'badminton', 'futsal']

function kategoriOrderIndex(nama) {
  const idx = KATEGORI_ORDER.findIndex(key => new RegExp(key, 'i').test(nama))
  return idx === -1 ? KATEGORI_ORDER.length : idx
}

const kategoriForActiveTipe = computed(() => {
  if (!activeTipe.value) return []
  return kategoriStore.list
    .filter(k => k.tipeId === activeTipe.value)
    .filter(k => !HIDDEN_KATEGORI_PATTERNS.some(match => match(k.nama)))
    .slice()
    .sort((a, b) => kategoriOrderIndex(a.nama) - kategoriOrderIndex(b.nama))
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

// Jenis cabang lomba beregu yang punya aturan poin/label kolom sendiri
function cabangType(nama) {
  const n = (nama || '').toLowerCase()
  if (n.includes('futsal'))    return 'futsal'
  if (n.includes('badminton')) return 'badminton'
  if (n.includes('voli') || n.includes('volly')) return 'voli'
  return 'generic'
}

function unitLabel(katNama) {
  const type = cabangType(katNama)
  if (type === 'futsal')    return 'Selisih Gol'
  if (type === 'badminton') return 'Game'
  return 'Set'
}

function formatSelisih(n) {
  return n > 0 ? `+${n}` : `${n}`
}

// Baris tim yang disembunyikan sementara dari tabel klasemen (data dobel/tidak valid)
const HIDDEN_TIM_PATTERNS = []

function isHiddenTim(katNama, timNama) {
  return HIDDEN_TIM_PATTERNS.some(p => p.kategori(katNama) && p.tim(timNama))
}

// Kunci pembanding nama tim — supaya "Koridor 1" & "koridor  1 " dianggap tim yang sama
function normalizeTimKey(nama) {
  return (nama || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

// Tim yang sudah terdaftar & dikonfirmasi untuk cabang ini, walau belum pernah main
function rosterOf(katNama) {
  const seen  = new Set()
  const names = []
  registrasiStore.list.forEach(r => {
    if (r.cabang !== katNama || r.status !== 'confirm' || r.tipe !== 'tim') return
    const nama = (r.namaRegu || r.namaKetua || r.nama || '').trim()
    const key  = normalizeTimKey(nama)
    if (!nama || seen.has(key)) return
    seen.add(key)
    names.push(nama)
  })
  return names
}

// Klasemen beregu berbasis skor pertandingan (set voli/game badminton/gol futsal).
// Voli: menang 2-0 = 3 poin, menang 2-1 = 2 poin, kalah 1-2 = 1 poin, kalah 0-2 = 0 poin.
// Futsal: menang = 3 poin, seri = 1 poin, kalah = 0 poin.
// Badminton: menang = 1 poin, kalah = 0 poin.
function standingsOf(katNama) {
  const entries = (hasilByKabang.value[katNama] || [])
    .filter(e => e.timA && e.timB && /(\d+)\s*[–—-]\s*(\d+)/.test(e.skor || ''))
  const roster = rosterOf(katNama)
  if (!entries.length && !roster.length) return null

  const type = cabangType(katNama)

  const teams = {}
  function team(nama) {
    const key = normalizeTimKey(nama)
    if (!teams[key]) {
      teams[key] = { nama: (nama || '').trim(), main: 0, menang: 0, seri: 0, kalah: 0, unitFor: 0, unitAgainst: 0, poin: 0 }
    }
    return teams[key]
  }

  roster.forEach(nama => team(nama))

  entries.forEach(e => {
    const m = e.skor.match(/(\d+)\s*[–—-]\s*(\d+)/)
    const a = Number(m[1])
    const b = Number(m[2])

    const tA = team(e.timA)
    const tB = team(e.timB)
    tA.main++; tB.main++
    tA.unitFor += a; tA.unitAgainst += b
    tB.unitFor += b; tB.unitAgainst += a

    if (a === b) {
      if (type === 'futsal') {
        tA.seri++; tB.seri++
        tA.poin += 1; tB.poin += 1
      }
      return
    }

    if (type === 'futsal') {
      if (a > b) { tA.menang++; tA.poin += 3; tB.kalah++ }
      else       { tB.menang++; tB.poin += 3; tA.kalah++ }
    } else if (type === 'badminton') {
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
    .filter(t => !isHiddenTim(katNama, t.nama))
    .map(t => ({ ...t, selisih: t.unitFor - t.unitAgainst }))
    .sort((x, y) => {
      if (y.poin !== x.poin) return y.poin - x.poin
      if (y.selisih !== x.selisih) return y.selisih - x.selisih
      return y.unitFor - x.unitFor
    })
    .map((t, i) => ({ ...t, rank: i + 1 }))
}

watch(() => tipeStore.list, (list) => {
  if (list.length && !activeTipe.value) activeTipe.value = list[0].id
})

onMounted(async () => {
  await Promise.all([
    hasilStore.fetch(),
    kategoriStore.fetch(),
    tipeStore.fetch(),
    registrasiStore.fetch(),
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
.chip-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 20px; }

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
  overflow-x: auto;
}
.kat-card-top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
}
.kat-card--full { grid-column: 1 / -1; }
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

/* ── Tabel Klasemen (beregu berbasis set) ───── */
.standings-table-wrap { overflow-x: auto; border: 1px solid #F0EBE2; border-radius: 8px; }
.standings-table {
  width: 100%; border-collapse: collapse; min-width: 480px;
  font: 500 13px/1.4 'Plus Jakarta Sans';
}
.standings-table thead tr { background: #F8F6F3; }
.standings-table th {
  padding: 10px 12px; text-align: left;
  font: 700 11px/1 'Plus Jakarta Sans'; color: #7A7368;
  letter-spacing: .04em; text-transform: uppercase;
  border-bottom: 1px solid #E2DCD2; white-space: nowrap;
}
.standings-table td {
  padding: 10px 12px; vertical-align: middle;
  border-bottom: 1px solid #F0EBE2;
  white-space: nowrap;
}
.standings-table tbody tr:last-child td { border-bottom: none; }
.standings-table tbody tr:hover { background: #FDFCFA; }
.standings-table .col-rank { text-align: center; font-weight: 800; color: #1A1613; width: 1%; }
.standings-table .col-num  { text-align: center; width: 1%; }
.standings-table .col-tim  { width: 100%; }
.standings-table .col-poin { font-weight: 800; color: var(--tc, #CE1126); }
.standings-table .tim-nama { font: 700 13px/1.3 'Plus Jakarta Sans'; color: #1A1613; white-space: nowrap; }

/* ── Baris lolos ke Babak Final (2 teratas) ─── */
.standings-table tbody tr.row-lolos { background: #E9F7EF; }
.standings-table tbody tr.row-lolos:hover { background: #E9F7EF; }
.standings-table tbody tr.row-lolos td { border-bottom-color: rgba(255,255,255,.6); }
.standings-table tbody tr.row-lolos .col-rank { color: #1E9E5A; }
.standings-table tbody tr.row-lolos .tim-nama { color: #157A45; }

.lolos-caption {
  display: flex; align-items: center; gap: 8px;
  margin-top: 10px;
  font: 500 12px/1.4 'Plus Jakarta Sans'; color: #7A7368;
}
.lolos-caption strong { color: #1A1613; font-weight: 800; }
.lolos-dot {
  flex-shrink: 0; width: 10px; height: 10px; border-radius: 3px;
  background: #E9F7EF; border: 1.5px solid #1E9E5A;
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

/* Klasemen tabel → tetap tabel di layar kecil, dibuat compact per kolom */
@media(max-width:640px) {
  .standings-table-wrap {
    border-radius: 8px;
    -webkit-overflow-scrolling: touch;
  }
  .standings-table { min-width: 0; font-size: 11.5px; }
  .standings-table th,
  .standings-table td { padding: 7px 6px; }
  .standings-table th {
    font-size: 9.5px;
    letter-spacing: .02em;
  }
  .standings-table .tim-nama {
    font-size: 12px;
    line-height: 1.25;
  }
  .standings-table th:first-child,
  .standings-table td:first-child { padding-left: 10px; }
  .standings-table th:last-child,
  .standings-table td:last-child { padding-right: 10px; }
  .standings-table tbody tr.row-lolos .col-rank { font-weight: 800; }

  .lolos-caption { font-size: 11px; }
}
</style>
