import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: () => import('@/views/portal/PortalLayout.vue'),
      children: [
        { path: '', name: 'beranda',     component: () => import('@/views/portal/BerandaView.vue') },
        { path: 'jadwal',    name: 'jadwal',     component: () => import('@/views/portal/JadwalView.vue') },
        { path: 'hasil',     name: 'hasil',      component: () => import('@/views/portal/HasilView.vue') },
        { path: 'klasemen',  name: 'klasemen',   component: () => import('@/views/portal/KlasemenView.vue') },
        { path: 'lomba',     name: 'lomba',      component: () => import('@/views/portal/LombaView.vue') },
        { path: 'registrasi',name: 'registrasi', component: () => import('@/views/portal/RegistrasiView.vue') },
        { path: 'kabar',     name: 'kabar',      component: () => import('@/views/portal/KabarView.vue') },
        { path: 'galeri',    name: 'galeri',     component: () => import('@/views/portal/GaleriView.vue') },
      ]
    },
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      children: [
        { path: '',        name: 'admin-login',     component: () => import('@/views/admin/AdminLoginView.vue') },
        { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/AdminDashboardView.vue'), meta: { requiresAuth: true } },
      ]
    }
  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const logged = localStorage.getItem('tcr_admin_logged')
    if (!logged) return { name: 'admin-login' }
  }
})

export default router
