<template>
  <div style="min-height:100vh;background:#FCF5F1;">
    <AppHeader />
    <main style="max-width:1180px;margin:0 auto;padding:34px 22px 70px;">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>
