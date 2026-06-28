<template>
  <div>
    <div class="eyebrow">Pengumuman &amp; Berita</div>
    <h2 class="page-title">Kabar Panitia</h2>
    <div class="kabar-list">
      <div v-for="p in pengumuman" :key="p.judul" class="kabar-card" :style="{ borderLeftColor: tagColor(p.tag) }">
        <div class="kabar-meta">
          <span class="tag" :style="{ background: tagBg(p.tag), color: tagColor(p.tag) }">{{ p.tag }}</span>
          <span class="tgl">{{ p.tgl }}</span>
        </div>
        <div class="kabar-judul">{{ p.judul }}</div>
        <div class="kabar-isi">{{ p.isi }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const TAG_MAP = {
  Penting:  ['#CE1126','#FCE7EA'],
  Info:     ['#2D5B8A','#E7EEF6'],
  Kegiatan: ['#2E7D52','#E7F2EB'],
}
const tagColor = (t) => (TAG_MAP[t] || TAG_MAP.Info)[0]
const tagBg    = (t) => (TAG_MAP[t] || TAG_MAP.Info)[1]

const pengumuman = [
  { tag:'Penting',  tgl:'20 Jun 2026', judul:'Pendaftaran Lomba Resmi Dibuka!', isi:'Pendaftaran seluruh cabang lomba dibuka 20 Juni – 8 Juli 2026 melalui portal ini atau sekretariat panitia. Satu peserta boleh ikut lebih dari satu cabang.' },
  { tag:'Info',     tgl:'18 Jun 2026', judul:'Technical Meeting Koordinator Blok', isi:'TM wajib bagi koordinator tiap blok pada 9 Juli 2026 pukul 19.30 di Aula RW untuk pengundian grup, aturan main, dan jadwal pertandingan.' },
  { tag:'Kegiatan', tgl:'15 Jun 2026', judul:'Lomba Hias Gapura & Kebersihan Blok', isi:'Penilaian dekorasi dan kebersihan antar-blok berlangsung sepanjang Agustus. Ayo percantik gapura dan lingkungan blok masing-masing!' },
  { tag:'Info',     tgl:'10 Jun 2026', judul:'Total Hadiah Naik 20% Tahun Ini', isi:'Terima kasih atas iuran warga & dukungan sponsor. Total hadiah tahun ini meningkat dari tahun lalu — tersedia trofi, medali, dan hadiah menarik.' },
]
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.page-title{ margin: 9px 0 22px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.kabar-list { display: flex; flex-direction: column; gap: 14px; }
.kabar-card { background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; padding: 22px; border-left: 4px solid; }
.kabar-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tag  { display: inline-flex; padding: 5px 11px; border-radius: 999px; font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .04em; text-transform: uppercase; }
.tgl  { font: 600 12px/1 'Plus Jakarta Sans'; color: #9A9389; }
.kabar-judul { font: 800 19px/1.2 Archivo; color: #1A1613; margin-top: 12px; }
.kabar-isi   { font: 500 14px/1.6 'Plus Jakarta Sans'; color: #5A534B; margin-top: 8px; }
@media(max-width:767px) {
  .page-title { font-size: 26px; }
  .kabar-card { padding: 16px; }
  .kabar-judul { font-size: 17px; }
}
</style>
