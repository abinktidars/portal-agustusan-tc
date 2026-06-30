import { ref, computed, onMounted, onUnmounted } from 'vue'

export function usePWAInstall() {
  const deferredPrompt = ref(null)
  const isInstalled = ref(false)
  const isIOS = ref(false)

  const canInstall = computed(() => !!deferredPrompt.value)

  // iOS: show guide if on iOS Safari and not already installed as PWA
  const showIOSGuide = computed(() =>
    isIOS.value && !isInstalled.value
  )

  const handleBeforeInstall = (e) => {
    e.preventDefault()
    deferredPrompt.value = e
  }

  const handleAppInstalled = () => {
    isInstalled.value = true
    deferredPrompt.value = null
  }

  const install = async () => {
    if (!deferredPrompt.value) return
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    if (outcome === 'accepted') isInstalled.value = true
  }

  onMounted(() => {
    isInstalled.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    isIOS.value =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !window.MSStream &&
      !isInstalled.value

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    window.removeEventListener('appinstalled', handleAppInstalled)
  })

  return { canInstall, isInstalled, isIOS, showIOSGuide, install }
}
