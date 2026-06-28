import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: () => import('@/views/portal/PortalLayout.vue'),
      children: [
        { path: '',          name: 'beranda',    component: () => import('@/views/portal/BerandaView.vue') },
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
        { path: '',           name: 'admin-login',      component: () => import('@/views/admin/AdminLoginView.vue') },
        { path: 'dashboard',  name: 'admin-dashboard',  component: () => import('@/views/admin/AdminDashboardView.vue'),  meta: { requiresAuth: true } },
        { path: 'tipe',       name: 'admin-tipe',       component: () => import('@/views/admin/AdminTipeView.vue'),       meta: { requiresAuth: true } },
        { path: 'kategori',   name: 'admin-kategori',   component: () => import('@/views/admin/AdminKategoriView.vue'),   meta: { requiresAuth: true } },
        { path: 'jadwal',     name: 'admin-jadwal',     component: () => import('@/views/admin/AdminJadwalView.vue'),     meta: { requiresAuth: true } },
        { path: 'hasil',      name: 'admin-hasil',      component: () => import('@/views/admin/AdminHasilView.vue'),      meta: { requiresAuth: true } },
        { path: 'registrasi', name: 'admin-registrasi', component: () => import('@/views/admin/AdminRegistrasiView.vue'), meta: { requiresAuth: true } },
        { path: 'users',      name: 'admin-users',      component: () => import('@/views/admin/AdminUsersView.vue'),      meta: { requiresAuth: true } },
      ]
    }
  ]
})

const ROLES_WITH_DASHBOARD = ['admin', 'panitia']

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const logged = localStorage.getItem('tcr_admin_logged')
    const role   = localStorage.getItem('tcr_admin_role')
    if (!logged || !ROLES_WITH_DASHBOARD.includes(role)) return { name: 'admin-login' }
  }
})

export default router
