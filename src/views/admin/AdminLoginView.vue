<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-eyebrow">Akses Terbatas</div>
      <h1 class="login-title">Login Admin</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div>
          <label class="form-label">Email Admin</label>
          <input v-model="email" type="email" class="tcr-input" placeholder="admin@tcr.local" />
        </div>
        <div>
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="tcr-input" placeholder="••••••••••" />
        </div>
        <div v-if="authStore.loginError" class="error-box">{{ authStore.loginError }}</div>
        <button type="submit" class="submit-btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'Memproses...' : 'Login' }}
        </button>
      </form>
      <div class="login-footer">Hubungi panitia untuk akses admin panel</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/useAuth'

const authStore = useAuthStore()
const email    = ref('')
const password = ref('')

function handleLogin() {
  authStore.login(email.value, password.value)
}
</script>

<style scoped>
.login-wrapper { max-width: 1180px; margin: 0 auto; padding: 60px 22px; display: flex; align-items: center; justify-content: center; min-height: 60vh; }
.login-card    { background: #fff; border: 1px solid #ECE7DE; border-radius: 20px; padding: 40px; max-width: 380px; width: 100%; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
.login-eyebrow { font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; margin-bottom: 12px; }
.login-title   { margin: 0 0 28px; font: 800 32px/1.2 Archivo; color: #1A1613; }
.login-form    { display: flex; flex-direction: column; gap: 16px; }
.form-label    { display: block; font: 700 13px/1 'Plus Jakarta Sans'; color: #1A1613; margin-bottom: 8px; }
.error-box     { background: #FBEAEC; border: 1px solid #F5C9D4; border-radius: 12px; padding: 12px 14px; font: 600 13px/1.4 'Plus Jakarta Sans'; color: #CE1126; }
.submit-btn    { margin-top: 8px; padding: 15px; border: none; border-radius: 12px; background: #CE1126; color: #fff; font: 800 16px/1 Archivo; cursor: pointer; box-shadow: 0 8px 20px rgba(206,17,38,.28); }
.submit-btn:disabled { opacity: .6; cursor: not-allowed; }
.login-footer  { border-top: 1px solid #ECE7DE; margin-top: 24px; padding-top: 16px; text-align: center; font: 500 13px/1.4 'Plus Jakarta Sans'; color: #7A7368; }
</style>
