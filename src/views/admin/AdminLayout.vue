<template>
  <div style="min-height:100vh;background:#FAF8F3;">
    <header class="admin-header">
      <div class="flag-bar"></div>
      <div class="admin-header-inner">
        <div style="display:flex;align-items:center;gap:12px;">
          <div class="admin-icon">⚙️</div>
          <div>
            <div class="admin-sub">Admin Panel</div>
            <div class="admin-title">Semarak Merdeka 81</div>
          </div>
        </div>
        <div v-if="authStore.isLoggedIn" class="admin-user">
          <div class="user-info">
            <div class="user-label">Admin Login</div>
            <div class="user-email">{{ authStore.userEmail }}</div>
          </div>
          <button class="tcr-btn-red" @click="authStore.logout()">Logout</button>
        </div>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/useAuth'
const authStore = useAuthStore()
</script>

<style scoped>
.admin-header { position: sticky; top: 0; z-index: 50; background: rgba(250,248,243,.9); backdrop-filter: blur(12px); border-bottom: 1px solid #ECE7DE; }
.admin-header-inner { max-width: 1180px; margin: 0 auto; padding: 16px 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.admin-icon  { width:46px;height:46px;border-radius:50%;background:#CE1126;display:flex;align-items:center;justify-content:center;font:800 20px/1 Archivo; }
.admin-sub   { font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .14em; text-transform: uppercase; color: #CE1126; }
.admin-title { font: 800 17px/1.1 Archivo; color: #1A1613; margin-top: 3px; }
.admin-user  { display: flex; align-items: center; gap: 14px; }
.user-info   { text-align: right; padding-right: 14px; border-right: 1px solid #ECE7DE; }
.user-label  { font: 500 12px/1 'Plus Jakarta Sans'; color: #7A7368; }
.user-email  { font: 700 14px/1.2 Archivo; color: #1A1613; margin-top: 3px; }
</style>
