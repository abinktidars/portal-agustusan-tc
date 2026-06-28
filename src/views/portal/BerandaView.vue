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
          <p class="hero-desc">Portal bersama warga Teras Country Residence. Cek jadwal &amp; hasil pertandingan, klasemen antar koridor, dan daftar lomba, semua di satu tempat. </p>
          <div class="hero-actions">
            <button class="btn-white" @click="$router.push({ name: 'registrasi' })">Daftar Lomba Sekarang</button>
            <button class="btn-outline" @click="$router.push({ name: 'jadwal' })">Lihat Jadwal</button>
          </div>
        </div>
      </div>

      <!-- Countdown card -->
      <div class="countdown-card">
        <div class="cd-label">Menuju Puncak Acara</div>
        <div class="cd-title">Upacara &amp; Karnaval<br><span style="color:#F4C36B;">17 Agustus 2026</span></div>
        <div class="cd-grid">
          <div class="cd-box" v-for="(val, lbl) in countdown" :key="lbl" :style="lbl==='Detik'?'color:#F4C36B':''">
            <div class="cd-num" :style="lbl==='Detik'?'color:#F4C36B':''">{{ val }}</div>
            <div class="cd-unit">{{ lbl }}</div>
          </div>
        </div>
        <div class="cd-stats">
          <div class="cd-stat-box">
            <div class="cd-stat-val">{{ jadwalStore.CABANG_LIST.length }}</div>
            <div class="cd-stat-lbl">Cabang Lomba</div>
          </div>
          <div class="cd-stat-box">
            <div class="cd-stat-val">{{ regStore.list.length }}</div>
            <div class="cd-stat-lbl">Tim Terdaftar</div>
          </div>
          <div class="cd-stat-box">
            <div class="cd-stat-val">5</div>
            <div class="cd-stat-lbl">Blok Bertanding</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick links -->
    <section class="quick-grid">
      <button class="quick-card" @click="$router.push({ name: 'jadwal' })">
        <div class="quick-icon" style="background:#FBEAEC;color:#CE1126;">J</div>
        <div class="quick-title">Jadwal Pertandingan</div>
        <div class="quick-desc">Filter per cabang &amp; status, lengkap lokasi dan jam.</div>
      </button>
      <button class="quick-card" @click="$router.push({ name: 'hasil' })">
        <div class="quick-icon" style="background:#E7F2EB;color:#2E7D52;">H</div>
        <div class="quick-title">Hasil Pertandingan</div>
        <div class="quick-desc">Skor terbaru &amp; pemenang tiap cabang.</div>
      </button>
      <button class="quick-card" @click="$router.push({ name: 'klasemen' })">
        <div class="quick-icon" style="background:#FBF1DD;color:#9A6B12;">K</div>
        <div class="quick-title">Klasemen Blok</div>
        <div class="quick-desc">Perolehan medali &amp; poin antar-blok.</div>
      </button>
    </section>

    <!-- Jadwal terdekat -->
    <section style="margin-top:44px;">
      <div class="section-eyebrow">Pekan Ini</div>
      <div class="section-header-row">
        <h2 class="section-title">Jadwal Terdekat</h2>
        <button class="link-btn" @click="$router.push({ name: 'jadwal' })">Lihat semua →</button>
      </div>
      <div class="jadwal-list">
        <div v-for="j in jadwalStore.upcoming" :key="j.id" class="jadwal-row">
          <div class="jadwal-date">
            <div class="jadwal-tgl">{{ j.tgl }}</div>
            <div class="jadwal-jam">{{ j.jam }}</div>
          </div>
          <div class="divider-v"></div>
          <div class="jadwal-info">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="dot" :style="{ background: katColor(j.kat) }"></span>
              <span class="jadwal-cabang">{{ j.cabang }}</span>
            </div>
            <div class="jadwal-sub">{{ j.peserta }} · {{ j.venue }}</div>
          </div>
          <StatusBadge :status="j.status" />
        </div>
      </div>
    </section>

    <!-- Klasemen top 3 -->
    <section style="margin-top:44px;">
      <div class="section-eyebrow" style="color:#9A6B12;">Klasemen Sementara</div>
      <h2 class="section-title" style="margin:9px 0 20px;">3 Blok Teratas</h2>
      <div class="klasemen-grid">
        <div v-for="k in klasemenStore.top3" :key="k.nama" class="klasemen-card" :style="{ borderTopColor: k.accent }">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div class="kl-rank" :style="{ color: k.accent }">#{{ k.rank }}</div>
            <div class="kl-poin">{{ k.poin }}<span class="kl-poin-lbl"> poin</span></div>
          </div>
          <div class="kl-nama">{{ k.nama }}</div>
          <div class="kl-medals">
            <span>🥇 {{ k.emas }}</span>
            <span>🥈 {{ k.perak }}</span>
            <span>🥉 {{ k.perunggu }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useJadwalStore }    from '@/stores/useJadwal'
import { useKlasemenStore }  from '@/stores/useKlasemen'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import StatusBadge from '@/components/StatusBadge.vue'

const jadwalStore   = useJadwalStore()
const klasemenStore = useKlasemenStore()
const regStore      = useRegistrasiStore()

const TARGET = new Date('2026-08-17T08:00:00+07:00').getTime()
const now    = ref(Date.now())
let timer

const countdown = computed(() => {
  let t = TARGET - now.value; if (t < 0) t = 0
  const pad = n => String(n).padStart(2,'0')
  return {
    Hari:  Math.floor(t / 86400000),
    Jam:   pad(Math.floor(t / 3600000) % 24),
    Menit: pad(Math.floor(t / 60000)   % 60),
    Detik: pad(Math.floor(t / 1000)    % 60),
  }
})

const katColor = (k) => ({ Olahraga:'#CE1126', Tradisional:'#C0871C', 'E-Sport':'#2D5B8A', Acara:'#2E7D52' })[k] || '#CE1126'

onMounted(() => {
  jadwalStore.fetch()
  klasemenStore.fetch()
  regStore.fetch()
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.hero-grid { display:grid; grid-template-columns:1.15fr .85fr; gap:16px; align-items:stretch; }
.hero-card {
  background: #CE1126; border-radius: 10px; padding: 24px;
  display: flex; flex-direction: column; justify-content: center;
  position: relative; overflow: hidden;
}
.hero-bg-circle {
  position: absolute; top: -50px; right: -50px; width: 220px; height: 220px;
  border-radius: 50%; background: repeating-linear-gradient(45deg,rgba(255,255,255,.16) 0 14px,transparent 14px 28px);
}
.hero-bg-stripe {
  position: absolute; bottom: 0; left: 0; right: 0; height: 8px;
  background: repeating-linear-gradient(90deg,#fff 0 24px,transparent 24px 48px); opacity: .5;
}
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px;
  border-radius: 999px; background: rgba(255,255,255,.18); color: #fff;
  font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .04em;
}
.hero-title { margin: 18px 0 0; font: 900 42px/.98 Archivo; letter-spacing: -.02em; color: #fff; }
.hero-desc  { margin: 18px 0 0; font: 500 17px/1.6 'Plus Jakarta Sans'; color: rgba(255,255,255,.9); max-width: 46ch; }
.hero-actions { display: flex; gap: 12px; margin-top: 26px; flex-wrap: wrap; }
.btn-white   { padding: 14px 24px; border: none; border-radius: 8px; background: #fff; color: #CE1126; font: 800 15px/1 'Plus Jakarta Sans'; cursor: pointer; box-shadow: 0 8px 20px rgba(0,0,0,.18); }
.btn-outline { padding: 14px 24px; border: 1.5px solid rgba(255,255,255,.7); border-radius: 8px; background: transparent; color: #fff; font: 700 15px/1 'Plus Jakarta Sans'; cursor: pointer; }

.countdown-card { background: #1A1613; border-radius: 10px; padding: 32px; color: #fff; display: flex; flex-direction: column; }
.cd-label { font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .14em; text-transform: uppercase; color: #E0A82E; }
.cd-title { font: 800 20px/1.2 Archivo; margin-top: 8px; }
.cd-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-top: 22px; }
.cd-box   { background: rgba(255,255,255,.08); border-radius: 14px; padding: 14px 6px; text-align: center; }
.cd-num   { font: 800 30px/1 Archivo; }
.cd-unit  { font: 600 10px/1 'Plus Jakarta Sans'; letter-spacing: .08em; text-transform: uppercase; color: #B8B0A6; margin-top: 6px; }
.cd-stats { display: flex; gap: 10px; margin-top: auto; padding-top: 22px; }
.cd-stat-box { flex: 1; background: rgba(255,255,255,.06); border-radius: 12px; padding: 12px; text-align: center; }
.cd-stat-val { font: 800 22px/1 Archivo; color: #F4C36B; }
.cd-stat-lbl { font: 600 10px/1.2 'Plus Jakarta Sans'; color: #B8B0A6; margin-top: 5px; }

.quick-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 16px; }
.quick-card {
  text-align: left; background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px;
  padding: 22px; cursor: pointer; transition: border-color .15s, transform .15s;
}
.quick-card:hover { border-color: #CE1126; transform: translateY(-2px); }
.quick-icon  { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font: 800 18px/1 Archivo; }
.quick-title { font: 800 18px/1.1 Archivo; margin-top: 14px; color: #1A1613; }
.quick-desc  { font: 500 13px/1.5 'Plus Jakarta Sans'; color: #7A7368; margin-top: 6px; }

.section-eyebrow { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.section-title   { font: 800 30px/1.05 Archivo; color: #1A1613; letter-spacing: -.01em; margin: 9px 0 0; }
.section-header-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.link-btn { background: transparent; border: none; color: #CE1126; font: 700 14px/1 'Plus Jakarta Sans'; cursor: pointer; }

.jadwal-list  { display: flex; flex-direction: column; gap: 12px; }
.jadwal-row   { display: flex; align-items: center; gap: 16px; background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; padding: 16px 18px; flex-wrap: wrap; }
.jadwal-date  { flex: 0 0 auto; text-align: center; min-width: 64px; }
.jadwal-tgl   { font: 800 15px/1 Archivo; color: #CE1126; }
.jadwal-jam   { font: 600 13px/1 'Plus Jakarta Sans'; color: #7A7368; margin-top: 5px; }
.divider-v    { width: 1px; align-self: stretch; background: #ECE7DE; }
.jadwal-info  { flex: 1; min-width: 160px; }
.jadwal-cabang{ font: 700 15px/1.2 'Plus Jakarta Sans'; color: #1A1613; }
.jadwal-sub   { font: 500 13px/1.4 'Plus Jakarta Sans'; color: #7A7368; margin-top: 4px; }
.dot          { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }

.klasemen-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.klasemen-card { background: #fff; border: 1.5px solid #F0D3D7; border-radius: 8px; padding: 22px; border-top: 4px solid; }
.kl-rank  { font: 900 34px/1 Archivo; }
.kl-poin  { font: 800 26px/1 Archivo; color: #1A1613; }
.kl-poin-lbl { font: 600 12px/1 'Plus Jakarta Sans'; color: #7A7368; }
.kl-nama  { font: 800 18px/1.2 Archivo; color: #1A1613; margin-top: 14px; }
.kl-medals{ display: flex; gap: 14px; margin-top: 12px; font: 600 13px/1 'Plus Jakarta Sans'; color: #7A7368; }

@media(max-width:767px) {
  .hero-grid, .quick-grid, .klasemen-grid { grid-template-columns: 1fr !important; }
  .hero-grid { gap: 16px; }
  .hero-title { font-size: 34px !important; }
  .hero-desc { font-size: 15px; }
  .hero-card { padding: 20px; }
  .countdown-card { padding: 20px; }
  .cd-grid { grid-template-columns: repeat(2,1fr); }
  .section-title { font-size: 24px; }
  .jadwal-row { padding: 14px; gap: 10px; }
  .quick-grid { margin-top: 12px; gap: 10px; }
  .quick-card { padding: 16px; }
  .klasemen-card { padding: 16px; }
}
</style>
