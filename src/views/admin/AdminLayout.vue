<template>
  <div style="min-height:100vh;background:#FAF8F3;">

    <header class="admin-header">
      <div class="flag-bar"></div>

      <div class="admin-topbar">
        <div class="admin-brand" @click="goToDashboard">
          <div class="admin-icon">⚙️</div>
          <div>
            <div class="admin-sub">Admin Panel</div>
            <div class="admin-title">Semarak Merdeka 81</div>
          </div>
        </div>
        <div v-if="authStore.isLoggedIn" class="admin-actions">
          <button class="admin-nav-trigger" @click="isNavOpen = true" aria-label="Buka menu admin">☰</button>
          <details class="admin-user-menu">
            <summary class="admin-user-trigger">
              <span class="user-trigger-icon">👤</span>
            </summary>
            <div class="admin-user-popover">
              <div class="user-info">
                <span class="role-chip" :class="`role-${authStore.userRole}`">{{ authStore.roleLabel }}</span>
                <div class="user-name">{{ authStore.userName || authStore.userEmail }}</div>
              </div>
              <button class="tcr-btn-red admin-logout" @click="authStore.logout()">Keluar</button>
            </div>
          </details>
        </div>
      </div>
    </header>

    <div v-if="authStore.isLoggedIn && isNavOpen" class="admin-nav-modal" @click.self="isNavOpen = false">
      <div class="admin-nav-sheet">
        <div class="admin-nav-head">
          <div class="admin-nav-title">Navigasi Admin</div>
          <button class="admin-nav-close" @click="isNavOpen = false" aria-label="Tutup menu">×</button>
        </div>
        <nav class="admin-nav-modal-grid">
          <RouterLink v-for="item in navItems" :key="item.name"
            :to="{ name: item.name }"
            class="nav-widget"
            :class="{ active: $route.name === item.name }"
            @click="isNavOpen = false">
            <span class="nav-widget-icon">{{ item.icon }}</span>
            <span class="nav-widget-label">{{ item.label }}</span>
          </RouterLink>
        </nav>
      </div>
    </div>

    <RouterView />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuth'
const router = useRouter()
const authStore = useAuthStore()
const isNavOpen = ref(false)

const goToDashboard = () => {
  router.push({ name: 'admin-dashboard' })
}

const ALL_NAV = [
  { name: 'admin-dashboard',  icon: '📊', label: 'Dashboard',      roles: ['admin', 'panitia'] },
  { name: 'admin-lomba',      icon: '🏅', label: 'Lomba',          roles: ['admin'] },
  { name: 'admin-jadwal',     icon: '📅', label: 'Jadwal',         roles: ['admin', 'panitia'] },
  { name: 'admin-hasil',      icon: '🏆', label: 'Hasil',          roles: ['admin', 'panitia'] },
  { name: 'admin-klasemen',   icon: '🥇', label: 'Klasemen',       roles: ['admin', 'panitia'] },
  { name: 'admin-registrasi', icon: '📋', label: 'Registrasi',     roles: ['admin', 'panitia'] },
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
  max-width: 1180px; margin: 0 auto; padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.admin-brand {
  display: flex; align-items: center; gap: 12px; cursor: pointer;
}
.admin-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.admin-icon  { width:40px; height:40px; border-radius:10px; background:#CE1126; display:flex; align-items:center; justify-content:center; font-size:18px; flex: 0 0 auto; }
.admin-sub   { font: 600 10px/1 'Plus Jakarta Sans'; letter-spacing:.14em; text-transform:uppercase; color:#CE1126; }
.admin-title { font: 800 15px/1.2 Archivo; color: #1A1613; margin-top:3px; }

.admin-nav-trigger {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid #E2DCD2;
  background: #fff;
  color: #1A1613;
  font: 700 18px/1 'Plus Jakarta Sans';
  cursor: pointer;
}

.admin-user-menu { position: relative; }
.admin-user-trigger {
  list-style: none;
  display: grid;
  place-items: center;
  align-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid #E2DCD2;
  background: #fff;
  color: #1A1613;
  cursor: pointer;
}
.admin-user-trigger::-webkit-details-marker { display: none; }
.user-trigger-icon { font-size: 16px; line-height: 1; }

.admin-user-popover {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: min(280px, 85vw);
  border-radius: 12px;
  border: 1px solid #E8E1D8;
  background: #fff;
  box-shadow: 0 12px 28px rgba(0,0,0,.14);
  padding: 12px;
  display: grid;
  gap: 10px;
  z-index: 3;
}

.user-info   { display:flex; align-items:center; gap:10px; text-align:left; min-width:0; }
.user-name   { font: 700 13px/1.2 'Plus Jakarta Sans'; color: #1A1613; min-width:0; word-break: break-word; }
.role-chip   { padding:3px 10px; border-radius:999px; font:700 11px/1 'Plus Jakarta Sans'; flex-shrink:0; }
.role-admin  { background:#FBEAEC; color:#CE1126; }
.role-panitia{ background:#E5EDF7; color:#2D5B8A; }
.role-warga  { background:#E7F2EB; color:#2E7D52; }
.admin-logout { padding: 10px 14px; font-size: 13px; width: 100%; }

.admin-nav-modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(26, 22, 19, .44);
  display: grid;
  align-items: end;
}
.admin-nav-sheet {
  background: #FAF8F3;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  border: 1px solid #ECE7DE;
  border-bottom: none;
  padding: 12px 14px 16px;
}
.admin-nav-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.admin-nav-title {
  font: 800 15px/1 Archivo;
  color: #1A1613;
}
.admin-nav-close {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid #E2DCD2;
  background: #fff;
  color: #5A534B;
  font: 700 20px/1 Archivo;
  cursor: pointer;
}

.admin-nav-modal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.nav-widget {
  min-height: 72px;
  padding: 10px 8px;
  border-radius: 12px;
  border: 1px solid #E8E1D8;
  background: #fff;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #5A534B;
  transition: border-color .15s, background .15s, transform .15s;
}
.nav-widget:hover {
  border-color: #D8D0C5;
  transform: translateY(-1px);
}
.nav-widget-icon {
  font-size: 18px;
  line-height: 1;
}
.nav-widget-label {
  font: 700 12px/1.1 'Plus Jakarta Sans';
  text-align: center;
}
.nav-widget.active {
  border-color: #CE1126;
  background: #FBEAEC;
  color: #CE1126;
}

@media (min-width: 768px) {
  .admin-topbar {
    padding: 14px 22px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .admin-brand { flex: 0 0 auto; }
  .admin-nav-sheet {
    width: min(760px, calc(100vw - 24px));
    margin: 0 auto 12px;
    border-radius: 18px;
    border: 1px solid #ECE7DE;
    padding: 14px 16px 16px;
  }
  .admin-nav-modal-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
  .nav-widget { min-height: 76px; }
}
</style>
