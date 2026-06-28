<template>
  <header class="app-header">
    <div class="flag-bar"></div>
    <div class="header-inner">
      <div class="brand" @click="$router.push({ name: 'beranda' })">
        <img src="/assets/logo.png" alt="TCR" class="brand-logo" />
        <div>
          <div class="brand-sub">Teras Country Residence</div>
          <div class="brand-title">Semarak Merdeka 81</div>
        </div>
      </div>
      <button class="tcr-btn-red hide-mobile" @click="$router.push({ name: 'registrasi' })">Daftar Lomba</button>
    </div>
    <nav class="header-nav tcr-scroll">
      <button
        v-for="item in navItems"
        :key="item.name"
        class="nav-btn"
        :class="{ active: route.name === item.name }"
        @click="$router.push({ name: item.name })"
      >{{ item.label }}</button>
    </nav>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const navItems = [
  { name: 'beranda',     label: 'Beranda' },
  { name: 'jadwal',      label: 'Jadwal' },
  { name: 'hasil',       label: 'Hasil' },
  { name: 'klasemen',    label: 'Klasemen' },
  { name: 'lomba',       label: 'Lomba' },
  { name: 'registrasi',  label: 'Registrasi' },
  { name: 'kabar',       label: 'Kabar' },
  { name: 'galeri',      label: 'Galeri' },
]
</script>

<style scoped>
.app-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(250,248,243,.9);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid #CE1126;
}
.header-inner {
  max-width: 1180px; margin: 0 auto;
  padding: 12px 22px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.brand {
  display: flex; align-items: center; gap: 12px; cursor: pointer;
}
.brand-logo {
  width: 46px; height: 46px; border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,.12); flex: 0 0 auto;
}
.brand-sub   { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .14em; text-transform: uppercase; color: #CE1126; }
.brand-title { font: 800 17px/1.1 Archivo; color: #1A1613; margin-top: 3px; white-space: nowrap; }
.header-nav {
  display: flex; gap: 7px; overflow-x: auto; padding: 0 22px 10px;
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
</style>
