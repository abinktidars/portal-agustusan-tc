<template>
  <div style="min-height:100vh;background:#FCF5F1;">
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<style scoped>
.main-content {
  max-width: 1180px; margin: 0 auto; padding: 34px 22px 70px;
}
@media(max-width:767px) {
  .main-content { padding: 20px 16px 50px; }
}
</style>
