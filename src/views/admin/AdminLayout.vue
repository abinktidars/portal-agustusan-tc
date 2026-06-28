<template>
  <div style="min-height:100vh;background:#FAF8F3;">

    <header class="admin-header">
      <div class="flag-bar"></div>

      <div class="admin-topbar">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="admin-icon">⚙️</div>
          <div>
            <div class="admin-sub">Admin Panel</div>
            <div class="admin-title">Semarak Merdeka 81</div>
          </div>
        </div>
        <div v-if="authStore.isLoggedIn" class="admin-user">
          <div class="user-info">
            <span class="role-chip" :class="`role-${authStore.userRole}`">{{ authStore.roleLabel }}</span>
            <div class="user-name">{{ authStore.userName || authStore.userEmail }}</div>
          </div>
          <button class="tcr-btn-red" style="padding:9px 18px;font-size:13px;" @click="authStore.logout()">Keluar</button>
        </div>
      </div>

      <nav v-if="authStore.isLoggedIn" class="admin-nav tcr-scroll">
        <RouterLink v-for="item in navItems" :key="item.name"
          :to="{ name: item.name }"
          class="nav-link"
          :class="{ active: $route.name === item.name }">
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/useAuth'
const authStore = useAuthStore()

const ALL_NAV = [
  { name: 'admin-dashboard',  icon: '📊', label: 'Dashboard',      roles: ['admin', 'panitia'] },
  { name: 'admin-tipe',       icon: '🎨', label: 'Tipe Lomba',     roles: ['admin'] },
  { name: 'admin-kategori',   icon: '🏷️', label: 'Kategori Lomba', roles: ['admin'] },
  { name: 'admin-jadwal',     icon: '📅', label: 'Jadwal',         roles: ['admin', 'panitia'] },
  { name: 'admin-klasemen',   icon: '🥇', label: 'Klasemen',       roles: ['admin', 'panitia'] },
  { name: 'admin-registrasi', icon: '📋', label: 'Registrasi',     roles: ['admin', 'panitia'] },
  { name: 'admin-koridor',    icon: '🏘️', label: 'Koridor',        roles: ['admin'] },
  { name: 'admin-lokasi',     icon: '📍', label: 'Lokasi',         roles: ['admin'] },
  { name: 'admin-users',      icon: '👥', label: 'Data User',      roles: ['admin'] },
]

const navItems = computed(() =>
  ALL_NAV.filter(item => item.roles.includes(authStore.userRole))
)
</script>

<style scoped>
.admin-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(250,248,243,.96);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #ECE7DE;
}

.admin-topbar {
  max-width: 1180px; margin: 0 auto; padding: 14px 22px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.admin-icon  { width:42px; height:42px; border-radius:10px; background:#CE1126; display:flex; align-items:center; justify-content:center; font-size:18px; }
.admin-sub   { font: 600 10px/1 'Plus Jakarta Sans'; letter-spacing:.14em; text-transform:uppercase; color:#CE1126; }
.admin-title { font: 800 16px/1.2 Archivo; color: #1A1613; margin-top:3px; }

.admin-user  { display:flex; align-items:center; gap:14px; }
.user-info   { display:flex; align-items:center; gap:10px; text-align:right; }
.user-name   { font: 700 13px/1.2 'Plus Jakarta Sans'; color: #1A1613; }
.role-chip   { padding:3px 10px; border-radius:999px; font:700 11px/1 'Plus Jakarta Sans'; flex-shrink:0; }
.role-admin  { background:#FBEAEC; color:#CE1126; }
.role-panitia{ background:#E5EDF7; color:#2D5B8A; }
.role-warga  { background:#E7F2EB; color:#2E7D52; }

.admin-nav {
  max-width: 1180px; margin: 0 auto; padding: 0 22px;
  display: flex; gap: 2px;
  overflow-x: auto; border-top: 1px solid #ECE7DE;
}
.nav-link {
  display: flex; align-items: center; gap: 6px;
  padding: 11px 14px;
  color: #7A7368; font: 600 13px/1 'Plus Jakarta Sans';
  text-decoration: none; white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: color .15s, border-color .15s;
}
.nav-link:hover { color: #1A1613; }
.nav-link.active { color: #CE1126; border-bottom-color: #CE1126; font-weight: 700; }
</style>
