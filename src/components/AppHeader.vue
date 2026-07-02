<template>
  <header class="app-header">
    <div class="flag-bar"></div>
    <div class="header-inner">
      <div class="brand" @click="$router.push({ name: 'beranda' })">
        <div class="brand-logo">
          <img src="/assets/logo.png" alt="TCR" class="brand-logo" />
        </div>
        <div class="brand-center">
          <div class="brand-sub">Teras Country Residence</div>
          <div class="brand-title">Semarak Agustusan TC</div>
        </div>
        <div class="brand-logo">
          <img src="/assets/logo-81.png" alt="TCR" class="hut81" />
        </div>
      </div>
      <button class="tcr-btn-red hide-mobile" @click="$router.push({ name: 'registrasi' })">Daftar Lomba</button>
    </div>
    <nav ref="navRef" class="header-nav tcr-scroll">
      <button
        v-for="(item, i) in navItems"
        :key="item.name"
        :ref="el => { if(el) btnRefs[i] = el }"
        class="nav-btn"
        :class="{ active: route.name === item.name }"
        @click="handleNavClick(item, i)"
      >{{ item.label }}</button>
    </nav>
  </header>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()
const navRef  = ref(null)
const btnRefs = []

const navItems = [
  { name: 'beranda',     label: 'Beranda' },
  { name: 'lomba',       label: 'Lomba' },
  { name: 'jadwal',      label: 'Jadwal' },
  { name: 'hasil',       label: 'Hasil' },
  { name: 'registrasi',  label: 'Registrasi' },
  { name: 'klasemen',    label: 'Klasemen' },
  { name: 'galeri',      label: 'Galeri' },
]

function scrollToCenter(btn) {
  const nav = navRef.value
  if (!nav || !btn) return
  nav.scrollTo({ left: btn.offsetLeft - nav.clientWidth / 2 + btn.offsetWidth / 2, behavior: 'smooth' })
}

function handleNavClick(item, i) {
  router.push({ name: item.name })
  scrollToCenter(btnRefs[i])
}

watch(() => route.name, async () => {
  await nextTick()
  const i = navItems.findIndex(n => n.name === route.name)
  if (i !== -1) scrollToCenter(btnRefs[i])
}, { immediate: true })
</script>

<style scoped>
.app-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(250,248,243,.9);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid #CE1126;
}
.header-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 12px 22px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.brand {
  display: flex; align-items: center; gap: 12px; cursor: pointer;
}
.brand-logo {
  display: flex;
  gap: 2px;
}
.brand-logo img {
  width: 50px;
}
.brand-center {
  text-align: center;
}
.brand-sub   { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .14em; text-transform: uppercase; color: #CE1126; }
.brand-title { font: 800 17px/1.1 Archivo; color: #1A1613; margin-top: 3px; white-space: nowrap; }
.header-nav {
  display: flex; gap: 7px; overflow-x: auto; padding: 0 22px 10px;
  max-width: 1200px; margin: 0 auto;
}
.nav-btn {
  flex: 0 0 auto; padding: 9px 16px; border: none; border-radius: 999px;
  font: 600 14px/1 'Plus Jakarta Sans'; cursor: pointer; white-space: nowrap;
  background: transparent; color: #5A534B; transition: all .15s;
}
.nav-btn.active {
  background: #CE1126; color: #fff;
  box-shadow: 0 4px 12px rgba(206,17,38,.28);
}
@media(max-width:767px) {
  .hide-mobile { display: none; }
  .header-inner { 
    padding: 10px 16px; 
    justify-content: center;
  }
  .header-nav { padding: 0 16px 4px; }
  .brand-title { font-size: 15px; }
}
</style>
