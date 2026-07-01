<template>
  <div class="app-shell">

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
          <button
            v-if="showInstallBtn"
            class="install-btn"
            @click="handleInstallClick"
            :title="isIOS ? 'Cara Install di iPhone/iPad' : 'Install sebagai aplikasi'"
          >
            <Download :size="14" :stroke-width="2" />
            <span>Install App</span>
          </button>

          <RouterLink :to="{ name: 'beranda' }" class="portal-view-btn" title="Buka Portal" target="_blank" rel="noopener">
            <ExternalLink :size="14" :stroke-width="2" />
            <span>Lihat Portal</span>
          </RouterLink>

          <details class="admin-user-menu">
            <summary class="admin-user-trigger" aria-label="Menu pengguna">
              <span class="user-avatar">{{ initials }}</span>
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

      <!-- Desktop top nav -->
      <nav v-if="authStore.isLoggedIn" class="admin-topnav">
        <div class="admin-topnav-inner">
          <RouterLink
            v-for="item in navItems" :key="item.name"
            :to="{ name: item.name }"
            class="topnav-item"
            :class="{ active: $route.name === item.name }"
          >
            <component :is="item.icon" class="topnav-icon" :size="15" :stroke-width="1.8" />
            <span class="topnav-label">{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>
    </header>

    <!-- Page content -->
    <div class="page-wrap">
      <RouterView />
    </div>

    <!-- ── Mobile bottom nav ────────────────────────── -->
    <nav v-if="authStore.isLoggedIn" class="admin-bottom-nav">
      <RouterLink
        v-for="item in primaryItems" :key="item.name"
        :to="{ name: item.name }"
        class="bottom-item"
        :class="{ active: $route.name === item.name }"
      >
        <component :is="item.icon" class="bottom-icon" :size="22" :stroke-width="1.8" />
        <span class="bottom-label">{{ item.label }}</span>
      </RouterLink>

      <!-- Semua trigger -->
      <button
        class="bottom-item bottom-all"
        :class="{ active: isAllActive }"
        @click="isAllOpen = true"
        aria-label="Semua menu"
      >
        <LayoutGrid class="bottom-icon" :size="22" :stroke-width="1.8" />
        <span class="bottom-label">Semua</span>
      </button>
    </nav>

    <!-- ── All-menu bottom sheet ─────────────────────── -->
    <Transition name="sheet">
      <div v-if="isAllOpen" class="sheet-backdrop" @click.self="isAllOpen = false">
        <div class="sheet-panel">
          <div class="sheet-handle"></div>
          <div class="sheet-head">
            <span class="sheet-title">Semua Menu</span>
            <button class="sheet-close" @click="isAllOpen = false" aria-label="Tutup">×</button>
          </div>
          <nav class="sheet-grid">
            <RouterLink
              v-for="item in secondaryItems" :key="item.name"
              :to="{ name: item.name }"
              class="sheet-item"
              :class="{ active: $route.name === item.name }"
              @click="isAllOpen = false"
            >
              <component :is="item.icon" class="sheet-item-icon" :size="24" :stroke-width="1.8" />
              <span class="sheet-item-label">{{ item.label }}</span>
            </RouterLink>
          </nav>
        </div>
      </div>
    </Transition>

    <!-- Install guide for iOS -->
    <Transition name="sheet">
      <div v-if="isIOSModalOpen" class="sheet-backdrop" @click.self="isIOSModalOpen = false">
        <div class="sheet-panel ios-guide-panel">
          <div class="sheet-handle"></div>
          <div class="sheet-head">
            <span class="sheet-title">Install Admin Panel</span>
            <button class="sheet-close" @click="isIOSModalOpen = false" aria-label="Tutup">×</button>
          </div>

          <div class="ios-guide-body">
            <p class="ios-guide-desc">
              Tambahkan Admin Panel ke layar utama iPhone/iPad kamu untuk akses lebih cepat tanpa buka browser.
            </p>

            <ol class="ios-steps">
              <li class="ios-step">
                <div class="ios-step-num">1</div>
                <div class="ios-step-text">
                  Tap tombol <strong>Bagikan</strong>
                  <span class="ios-share-icon" aria-label="share icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </span>
                  di toolbar Safari (bawah layar atau atas browser).
                </div>
              </li>
              <li class="ios-step">
                <div class="ios-step-num">2</div>
                <div class="ios-step-text">
                  Scroll ke bawah dan tap <strong>"Tambah ke Layar Utama"</strong>.
                </div>
              </li>
              <li class="ios-step">
                <div class="ios-step-num">3</div>
                <div class="ios-step-text">
                  Tap <strong>"Tambah"</strong> di pojok kanan atas. Selesai!
                </div>
              </li>
            </ol>

            <div class="ios-guide-tip">
              <span>💡</span>
              Pastikan kamu membuka halaman ini di <strong>Safari</strong> — browser lain tidak mendukung fitur ini di iOS.
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Splash screen (PWA only) -->
    <AdminSplashScreen />

  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuth'
import { usePWAInstall } from '@/composables/usePWAInstall'
import AdminSplashScreen from '@/components/admin/AdminSplashScreen.vue'
import {
  LayoutDashboard, Trophy, CalendarDays, Award,
  Medal, ClipboardList, MapPin, Images, Users, LayoutGrid, ExternalLink, Download
} from '@lucide/vue'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()
const isAllOpen = ref(false)
const isIOSModalOpen = ref(false)

const { canInstall, isInstalled, isIOS, install } = usePWAInstall()

const showInstallBtn = computed(() =>
  !isInstalled.value && (canInstall.value || isIOS.value)
)

function handleInstallClick() {
  if (isIOS.value) {
    isIOSModalOpen.value = true
  } else {
    install()
  }
}

const goToDashboard = () => router.push({ name: 'admin-dashboard' })

const initials = computed(() => {
  const name = authStore.userName || authStore.userEmail || ''
  return name.slice(0, 2).toUpperCase() || '??'
})

const ALL_NAV = [
  { name: 'admin-dashboard',  icon: LayoutDashboard, label: 'Dashboard',  roles: ['admin', 'panitia'] },
  { name: 'admin-registrasi', icon: ClipboardList,   label: 'Registrasi', roles: ['admin', 'panitia'] },
  { name: 'admin-lomba',      icon: Trophy,          label: 'Lomba',      roles: ['admin'] },
  { name: 'admin-jadwal',     icon: CalendarDays,    label: 'Jadwal',     roles: ['admin', 'panitia'] },
  { name: 'admin-hasil',      icon: Award,           label: 'Hasil',      roles: ['admin', 'panitia'] },
  { name: 'admin-klasemen',   icon: Medal,           label: 'Klasemen',   roles: ['admin', 'panitia'] },
  { name: 'admin-galeri',     icon: Images,          label: 'Galeri',     roles: ['admin'] },
  { name: 'admin-lokasi',     icon: MapPin,          label: 'Lokasi',     roles: ['admin'] },
  { name: 'admin-users',      icon: Users,           label: 'Users',      roles: ['admin'] },
]

const PRIMARY_NAMES = ['admin-dashboard', 'admin-jadwal', 'admin-hasil', 'admin-registrasi']

const navItems = computed(() =>
  ALL_NAV.filter(item => item.roles.includes(authStore.userRole))
)

const primaryItems = computed(() =>
  navItems.value.filter(item => PRIMARY_NAMES.includes(item.name))
)

const secondaryItems = computed(() =>
  navItems.value.filter(item => !PRIMARY_NAMES.includes(item.name))
)

const isAllActive = computed(() =>
  !primaryItems.value.some(item => item.name === route.name)
)
</script>

<style scoped>
/* ── Shell ──────────────────────────────────────────── */
.app-shell { min-height:100vh; background:#FAF8F3; display:flex; flex-direction:column; }
.page-wrap { flex:1; padding-bottom:62px; }

/* ── Header ─────────────────────────────────────────── */
.admin-header {
  position:sticky; top:0; z-index:50;
  background:rgba(250,248,243,.97);
  backdrop-filter:blur(12px);
  border-bottom:1px solid #ECE7DE;
}
.flag-bar { height:4px;}

.admin-topbar {
  max-width:1180px; margin:0 auto; padding:10px 16px;
  display:flex; align-items:center; justify-content:space-between; gap:12px;
}
.admin-brand { display:flex; align-items:center; gap:10px; cursor:pointer; flex-shrink:0; }
.admin-icon  { width:38px; height:38px; border-radius:10px; background:#CE1126; display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
.admin-sub   { font:600 10px/1 'Plus Jakarta Sans'; letter-spacing:.14em; text-transform:uppercase; color:#CE1126; }
.admin-title { font:800 14px/1.2 Archivo; color:#1A1613; margin-top:3px; }

/* ── User menu ──────────────────────────────────────── */
.admin-actions { display:flex; align-items:center; gap:10px; }

.portal-view-btn {
  display:none;
}

@media (min-width: 768px) {
  .portal-view-btn {
    display:flex; align-items:center; gap:6px;
    padding:7px 14px;
    border-radius:999px;
    border:1.5px solid #CE1126;
    color:#CE1126;
    background:#fff;
    font:600 12px/1 'Plus Jakarta Sans';
    text-decoration:none;
    white-space:nowrap;
    transition:background .15s, color .15s;
  }
  .portal-view-btn:hover {
    background:#CE1126;
    color:#fff;
  }
}
.admin-user-menu { position:relative; }
.admin-user-trigger {
  list-style:none; width:36px; height:36px; border-radius:999px;
  border:1.5px solid #E2DCD2; background:#fff; cursor:pointer;
  display:flex; align-items:center; justify-content:center; padding:0;
}
.admin-user-trigger::-webkit-details-marker { display:none; }
.user-avatar { font:700 12px/1 'Plus Jakarta Sans'; color:#CE1126; }

.admin-user-popover {
  position:absolute; right:0; top:calc(100% + 8px);
  width:min(260px, 80vw); border-radius:12px;
  border:1px solid #E8E1D8; background:#fff;
  box-shadow:0 12px 28px rgba(0,0,0,.14);
  padding:12px; display:grid; gap:10px; z-index:99;
}
.user-info   { display:flex; align-items:center; gap:10px; min-width:0; }
.user-name   { font:700 13px/1.2 'Plus Jakarta Sans'; color:#1A1613; word-break:break-word; }
.role-chip   { padding:3px 10px; border-radius:999px; font:700 11px/1 'Plus Jakarta Sans'; flex-shrink:0; }
.role-admin   { background:#FBEAEC; color:#CE1126; }
.role-panitia { background:#E5EDF7; color:#2D5B8A; }
.role-warga   { background:#E7F2EB; color:#2E7D52; }
.admin-logout { padding:10px 14px; font-size:13px; width:100%; }

/* ── Desktop top nav (hidden on mobile) ─────────────── */
.admin-topnav { display:none; }

/* ── Mobile bottom nav ──────────────────────────────── */
.admin-bottom-nav {
  display:flex;
  position:fixed; bottom:0; left:0; right:0; z-index:50;
  background:rgba(250,248,243,.97);
  backdrop-filter:blur(14px);
  border-top:1px solid #ECE7DE;
  padding-bottom:env(safe-area-inset-bottom, 0px);
}

.bottom-item {
  flex:1;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:3px; padding:8px 4px 9px;
  text-decoration:none; background:none; border:none; cursor:pointer;
  color:#9A9389;
  min-height:54px;
  transition:color .15s;
  position:relative;
}
.bottom-item.active { color:#CE1126; }
.bottom-item.active::after {
  content:'';
  position:absolute; top:0; left:20%; right:20%;
  height:2px; border-radius:0 0 3px 3px; background:#CE1126;
}

.bottom-icon  { display:block; flex-shrink:0; }
.bottom-label { font:600 10px/1.1 'Plus Jakarta Sans'; text-align:center; white-space:nowrap; }

/* ── All-menu bottom sheet ──────────────────────────── */
.sheet-backdrop {
  position:fixed; inset:0; z-index:60;
  background:rgba(26,22,19,.46);
  display:flex; align-items:flex-end;
}
.sheet-panel {
  width:100%;
  background:#FAF8F3;
  border-radius:20px 20px 0 0;
  border:1px solid #ECE7DE; border-bottom:none;
  padding:8px 16px calc(16px + env(safe-area-inset-bottom, 0px));
}
.sheet-handle {
  width:36px; height:4px; border-radius:2px;
  background:#D8D0C5; margin:0 auto 14px;
}
.sheet-head {
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:14px;
}
.sheet-title { font:800 16px/1 Archivo; color:#1A1613; }
.sheet-close {
  width:30px; height:30px; border-radius:999px;
  border:1px solid #E2DCD2; background:#fff;
  color:#5A534B; font:700 20px/1 Archivo; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
}

.sheet-grid {
  display:grid;
  grid-template-columns:repeat(4, 1fr);
  gap:10px;
}
.sheet-item {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  gap:6px; padding:14px 8px;
  border-radius:14px;
  border:1px solid #ECE7DE;
  background:#fff;
  text-decoration:none;
  color:#5A534B;
  transition:border-color .15s, background .15s;
}
.sheet-item.active {
  border-color:#CE1126; background:#FBEAEC; color:#CE1126;
}
.sheet-item-icon  { display:block; flex-shrink:0; }
.sheet-item-label { font:700 11px/1.1 'Plus Jakarta Sans'; text-align:center; }

/* sheet transition */
.sheet-enter-active, .sheet-leave-active { transition:opacity .22s ease; }
.sheet-enter-active .sheet-panel, .sheet-leave-active .sheet-panel { transition:transform .28s cubic-bezier(.32,1,.22,1); }
.sheet-enter-from, .sheet-leave-to { opacity:0; }
.sheet-enter-from .sheet-panel, .sheet-leave-to .sheet-panel { transform:translateY(100%); }

/* ── Install button ─────────────────────────────────── */
.install-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1.5px solid #2D5B8A;
  color: #2D5B8A;
  background: #fff;
  font: 600 12px/1 'Plus Jakarta Sans', sans-serif;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, color .15s;
}
.install-btn:hover {
  background: #2D5B8A;
  color: #fff;
}

/* ── iOS Guide panel ─────────────────────────────────── */
.ios-guide-panel { padding-bottom: max(24px, env(safe-area-inset-bottom, 24px)); }

.ios-guide-body { display: grid; gap: 16px; }

.ios-guide-desc {
  font: 400 13.5px/1.55 'Plus Jakarta Sans', sans-serif;
  color: #5A534B;
  margin: 0;
}

.ios-steps {
  list-style: none;
  margin: 0; padding: 0;
  display: grid; gap: 12px;
}

.ios-step {
  display: flex; align-items: flex-start; gap: 12px;
}

.ios-step-num {
  flex-shrink: 0;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: #CE1126;
  color: #fff;
  font: 700 12px/1 'Plus Jakarta Sans', sans-serif;
  display: flex; align-items: center; justify-content: center;
  margin-top: 1px;
}

.ios-step-text {
  font: 400 13.5px/1.55 'Plus Jakarta Sans', sans-serif;
  color: #1A1613;
}
.ios-step-text strong { color: #1A1613; }

.ios-share-icon {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 3px;
  color: #2D5B8A;
}

.ios-guide-tip {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #FFF8E7;
  border: 1px solid #F5DFA0;
  font: 400 12.5px/1.5 'Plus Jakarta Sans', sans-serif;
  color: #6B5A20;
}

/* ── Desktop overrides ──────────────────────────────── */
@media (min-width: 768px) {
  .page-wrap { padding-bottom:0; }
  .admin-topbar { padding:12px 22px; }

  .admin-bottom-nav { display:none; }
  .sheet-backdrop   { display:none; }

  .admin-topnav { display:block; border-top:1px solid #ECE7DE; }
  .admin-topnav-inner {
    max-width:1180px; margin:0 auto; padding:0 22px;
    display:flex; align-items:stretch;
    overflow-x:auto; scrollbar-width:none;
  }
  .admin-topnav-inner::-webkit-scrollbar { display:none; }

  .topnav-item {
    display:flex; align-items:center; gap:6px;
    padding:9px 13px;
    text-decoration:none;
    color:#5A534B;
    font:600 12.5px/1 'Plus Jakarta Sans';
    border-bottom:2px solid transparent;
    white-space:nowrap;
    transition:color .15s, border-color .15s, background .15s;
  }
  .topnav-item:hover { color:#1A1613; background:#F5F2ED; }
  .topnav-item.active { color:#CE1126; border-bottom-color:#CE1126; background:#FDF5F5; }
  .topnav-icon  { display:block; flex-shrink:0; }
}
</style>
