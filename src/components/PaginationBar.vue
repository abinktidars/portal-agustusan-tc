<template>
  <div v-if="totalPages > 1 || total > 0" class="pg-wrap">
    <div class="pg-info">
      Menampilkan <strong>{{ from }}–{{ to }}</strong> dari <strong>{{ total }}</strong> data
    </div>
    <div class="pg-controls">
      <button class="pg-btn" :disabled="modelValue <= 1" @click="$emit('update:modelValue', modelValue - 1)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <template v-for="p in pages" :key="p">
        <span v-if="p === '...'" class="pg-ellipsis">…</span>
        <button v-else class="pg-btn" :class="{ active: p === modelValue }" @click="$emit('update:modelValue', p)">{{ p }}</button>
      </template>
      <button class="pg-btn" :disabled="modelValue >= totalPages" @click="$emit('update:modelValue', modelValue + 1)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 1 },
  total:      { type: Number, required: true },
  perPage:    { type: Number, default: 10 },
})
defineEmits(['update:modelValue'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const from = computed(() => props.total === 0 ? 0 : (props.modelValue - 1) * props.perPage + 1)
const to   = computed(() => Math.min(props.modelValue * props.perPage, props.total))

const pages = computed(() => {
  const n = totalPages.value, cur = props.modelValue
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1)
  const result = []
  result.push(1)
  if (cur > 3) result.push('...')
  for (let i = Math.max(2, cur - 1); i <= Math.min(n - 1, cur + 1); i++) result.push(i)
  if (cur < n - 2) result.push('...')
  result.push(n)
  return result
})
</script>

<style scoped>
.pg-wrap     { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 0 4px; flex-wrap:wrap; }
.pg-info     { font:500 13px/1 'Plus Jakarta Sans'; color:#7A7368; }
.pg-info strong { font-weight:700; color:#1A1613; }
.pg-controls { display:flex; align-items:center; gap:4px; }
.pg-btn {
  min-width:34px; height:34px; padding:0 6px; border-radius:8px;
  border:1px solid #E2DCD2; background:#fff; color:#1A1613;
  font:600 13px/1 'Plus Jakarta Sans'; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  transition:background .15s, border-color .15s, color .15s;
}
.pg-btn:hover:not(:disabled):not(.active) { background:#FAF8F3; border-color:#C8C1B6; }
.pg-btn.active  { background:#CE1126; border-color:#CE1126; color:#fff; }
.pg-btn:disabled{ opacity:.35; cursor:not-allowed; }
.pg-ellipsis { padding:0 4px; color:#9A9389; font:600 13px/34px 'Plus Jakarta Sans'; }
</style>
