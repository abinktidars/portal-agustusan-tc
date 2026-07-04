<template>
  <Transition name="splash-fade">
    <div v-if="visible" class="admin-splash">
      <div class="splash-flag-red"></div>
      <div class="splash-flag-white"></div>

      <div class="splash-content">
        <div class="splash-icon-wrap">
          <img src="/static/logo.png" alt="Logo" class="splash-logo" />
        </div>
        <div class="splash-badge">Admin Panel</div>
        <div class="splash-title">Semarak Merdeka 81</div>
        <div class="splash-sub">Teras Country Residence</div>

        <div class="splash-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)

onMounted(() => {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  if (isStandalone) {
    visible.value = true
    setTimeout(() => { visible.value = false }, 2400)
  }
})
</script>

<style scoped>
.admin-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #FAF8F3;
  overflow: hidden;
}

/* Indonesian flag stripes as decorative top/bottom bars */
.splash-flag-red {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 6px;
  background: #CE1126;
}
.splash-flag-white {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 6px;
  background: #CE1126;
  opacity: .3;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  text-align: center;
  padding: 24px;
}

.splash-icon-wrap {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  background: #CE1126;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 28px rgba(206,17,38,.28);
}

.splash-logo {
  width: 52px;
  height: 52px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.splash-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  background: #FBEAEC;
  color: #CE1126;
  font: 700 11px/1.4 'Plus Jakarta Sans', sans-serif;
  letter-spacing: .1em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.splash-title {
  font: 900 26px/1.15 Archivo, sans-serif;
  color: #1A1613;
  margin-bottom: 6px;
}

.splash-sub {
  font: 500 13px/1 'Plus Jakarta Sans', sans-serif;
  color: #9A9389;
  margin-bottom: 36px;
}

/* Loading dots */
.splash-dots {
  display: flex;
  gap: 7px;
}
.splash-dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #CE1126;
  opacity: .25;
  animation: dot-pulse 1.2s ease-in-out infinite;
}
.splash-dots span:nth-child(2) { animation-delay: .2s; }
.splash-dots span:nth-child(3) { animation-delay: .4s; }

@keyframes dot-pulse {
  0%, 80%, 100% { opacity: .2; transform: scale(.8); }
  40%            { opacity: 1;  transform: scale(1);  }
}

/* Transition */
.splash-fade-leave-active {
  transition: opacity .5s ease, transform .5s ease;
}
.splash-fade-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
