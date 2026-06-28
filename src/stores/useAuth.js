import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginAdmin, logoutAdmin } from '@/firebase/helpers'
import router from '@/router'

const ROLES_WITH_DASHBOARD = ['admin', 'panitia']

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(!!localStorage.getItem('tcr_admin_logged'))
  const userEmail  = ref(localStorage.getItem('tcr_admin_email') || '')
  const userRole   = ref(localStorage.getItem('tcr_admin_role')  || '')
  const userName   = ref(localStorage.getItem('tcr_admin_nama')  || '')
  const loginError = ref('')
  const loading    = ref(false)

  const canAccessDashboard = computed(() => ROLES_WITH_DASHBOARD.includes(userRole.value))
  const roleLabel = computed(() => ({
    admin:   'Admin',
    panitia: 'Panitia',
    warga:   'Warga',
  }[userRole.value] || userRole.value))

  async function login(email, password) {
    loginError.value = ''
    if (!email || !password) {
      loginError.value = 'Email dan password harus diisi.'
      return
    }
    loading.value = true
    try {
      const user = await loginAdmin(email, password)

      if (!ROLES_WITH_DASHBOARD.includes(user.role)) {
        loginError.value = 'Akun ini tidak memiliki akses ke panel admin.'
        return
      }

      localStorage.setItem('tcr_admin_logged', 'true')
      localStorage.setItem('tcr_admin_email', email)
      localStorage.setItem('tcr_admin_role',  user.role)
      localStorage.setItem('tcr_admin_nama',  user.nama || '')
      isLoggedIn.value = true
      userEmail.value  = email
      userRole.value   = user.role
      userName.value   = user.nama || ''
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
    localStorage.removeItem('tcr_admin_role')
    localStorage.removeItem('tcr_admin_nama')
    isLoggedIn.value = false
    userEmail.value  = ''
    userRole.value   = ''
    userName.value   = ''
    router.push({ name: 'admin-login' })
  }

  return { isLoggedIn, userEmail, userRole, userName, roleLabel, canAccessDashboard, loginError, loading, login, logout }
})
