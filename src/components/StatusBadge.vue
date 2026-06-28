<template>
  <span class="status-badge" :class="cls">{{ status }}</span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ status: String })
const cls = computed(() => ({
  'status-selesai':     props.status === 'Selesai',
  'status-berlangsung': props.status === 'Berlangsung',
  'status-akandatang':  props.status === 'Akan Datang',
}))
</script>
