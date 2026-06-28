import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginAdmin, logoutAdmin } from '@/firebase/helpers'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(!!localStorage.getItem('tcr_admin_logged'))
  const userEmail  = ref(localStorage.getItem('tcr_admin_email') || '')
  const loginError = ref('')
  const loading    = ref(false)

  async function login(email, password) {
    loginError.value = ''
    if (!email || !password) {
      loginError.value = 'Email dan password harus diisi.'
      return
    }
    loading.value = true
    try {
      await loginAdmin(email, password)
      localStorage.setItem('tcr_admin_logged', 'true')
      localStorage.setItem('tcr_admin_email', email)
      isLoggedIn.value = true
      userEmail.value  = email
      router.push({ name: 'admin-dashboard' })
    } catch {
      loginError.value = 'Email atau password salah.'
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try { await logoutAdmin() } catch {}
    localStorage.removeItem('tcr_admin_logged')
    localStorage.removeItem('tcr_admin_email')
    isLoggedIn.value = false
    userEmail.value  = ''
    router.push({ name: 'admin-login' })
  }

  return { isLoggedIn, userEmail, loginError, loading, login, logout }
})
