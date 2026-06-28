<template>
  <div>
    <div class="eyebrow">Daftar Lomba &amp; Info Kegiatan</div>
    <h2 class="page-title">Cabang yang Dilombakan</h2>

    <div class="tcr-scroll chip-row">
      <button v-for="c in cats" :key="c"
        class="chip" :class="{ active: activeCat === c }"
        @click="activeCat = c">{{ c }}</button>
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
        <button class="daftar-btn" @click="$router.push({ name: 'registrasi' })">Daftar Cabang Ini</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeCat = ref('Semua')
const cats = ['Semua','Olahraga','Tradisional','E-Sport']

const ALL_LOMBA = [
  { nama:'Voli Putra',        kat:'Olahraga',    format:'Beregu',        jadwal:'19 Jul – 15 Agu', deskripsi:'Turnamen bola voli antar-blok kategori putra, sistem gugur menuju final.' },
  { nama:'Voli Putri',        kat:'Olahraga',    format:'Beregu',        jadwal:'26 Jul – 16 Agu', deskripsi:'Turnamen bola voli antar-blok kategori putri, semarak sportivitas warga.' },
  { nama:'Badminton Beregu',  kat:'Olahraga',    format:'Beregu',        jadwal:'08 – 14 Agu',     deskripsi:'Bulu tangkis beregu (tunggal & ganda) memperebutkan Piala Bergilir TCR.' },
  { nama:'Futsal Anak',       kat:'Olahraga',    format:'Tim 5 Anak',    jadwal:'02 – 14 Agu',     deskripsi:'Futsal khusus anak-anak warga, ajang seru sekaligus belajar kerja sama tim.' },
  { nama:'Mobile Legends',    kat:'E-Sport',     format:'Tim 5 Pemain',  jadwal:'01 – 15 Agu',     deskripsi:'Turnamen e-sport 5v5, terbuka untuk remaja & dewasa tiap blok.' },
  { nama:'Balap Karung',      kat:'Tradisional', format:'Perorangan',    jadwal:'11 Jul',           deskripsi:'Lomba tradisional klasik kategori anak & dewasa, dijamin penuh tawa.' },
  { nama:'Tarik Tambang',     kat:'Tradisional', format:'Tim 8 Orang',   jadwal:'09 – 12 Agu',     deskripsi:'Adu kekompakan & kekuatan tim antar-blok, salah satu favorit warga.' },
  { nama:'Makan Kerupuk',     kat:'Tradisional', format:'Perorangan',    jadwal:'11 Jul',           deskripsi:'Lomba khas 17-an untuk semua umur, siapa tercepat menghabiskan kerupuk.' },
  { nama:'Balap Kelereng',    kat:'Tradisional', format:'Perorangan',    jadwal:'12 Jul',           deskripsi:'Uji fokus & keseimbangan membawa kelereng di atas sendok hingga garis finis.' },
  { nama:'Panjat Pinang',     kat:'Tradisional', format:'Tim 5 Orang',   jadwal:'17 Agu',           deskripsi:'Puncak acara! Adu strategi tim memanjat meraih hadiah utama di puncak pinang.' },
]
const filtered = computed(() => ALL_LOMBA.filter(l => activeCat.value === 'Semua' || l.kat === activeCat.value))
const katColor = (k) => ({ Olahraga:'#CE1126', Tradisional:'#C0871C', 'E-Sport':'#2D5B8A' })[k] || '#CE1126'
const katBg    = (k) => ({ Olahraga:'#FBEAEC', Tradisional:'#FBF1DD', 'E-Sport':'#E7EEF6' })[k] || '#FBEAEC'
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
.daftar-btn { margin-top: 16px; padding: 11px; border: 1.5px solid #CE1126; border-radius: 10px; background: transparent; color: #CE1126; font: 700 13px/1 'Plus Jakarta Sans'; cursor: pointer; transition: all .15s; }
.daftar-btn:hover { background: #CE1126; color: #fff; }
@media(max-width:767px) { .lomba-grid { grid-template-columns: 1fr; } }
</style>
