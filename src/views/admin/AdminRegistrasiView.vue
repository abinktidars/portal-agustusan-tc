<template>
  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Data</div>
          <h2 class="section-title">Daftar Registrasi Peserta</h2>
        </div>
        <div class="header-actions">
          <input v-model="search" type="text" class="tcr-input search-input" placeholder="Cari nama / blok / cabang..." />
          <button class="btn-export" @click="doExport">Export Excel</button>
        </div>
      </div>

      <div class="table-wrap" style="margin-bottom:0;">
        <table class="reg-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama</th>
              <th>No. WA</th>
              <th>Blok</th>
              <th>Cabang</th>
              <th>Tgl Daftar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in paginated" :key="r.id">
              <td class="td-num">{{ (page-1)*PER_PAGE + i + 1 }}</td>
              <td class="td-bold">{{ r.nama }}</td>
              <td><a :href="`https://wa.me/${r.wa}`" target="_blank" class="wa-link">{{ r.wa }}</a></td>
              <td>{{ r.blok || r.blokRumah || '-' }}</td>
              <td><span class="cabang-badge">{{ r.cabang }}</span></td>
              <td>{{ formatDate(r.tglDate || r.createdAt) }}</td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="6" class="empty">{{ search ? 'Tidak ada hasil pencarian' : 'Belum ada pendaftar' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationBar v-model="page" :total="filtered.length" :per-page="PER_PAGE" />
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRegistrasiStore } from '@/stores/useRegistrasi'
import PaginationBar from '@/components/PaginationBar.vue'
import { exportToExcel } from '@/utils/exportExcel'

const regStore = useRegistrasiStore()
const search   = ref('')
const page     = ref(1)
const PER_PAGE = 10

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return regStore.list.filter(r =>
    !q || (r.nama||'').toLowerCase().includes(q) ||
    (r.blok||r.blokRumah||'').toLowerCase().includes(q) ||
    (r.cabang||'').toLowerCase().includes(q)
  )
})
const paginated = computed(() => filtered.value.slice((page.value-1)*PER_PAGE, page.value*PER_PAGE))
watch(search, () => { page.value = 1 })

const formatDate = (d) => {
  if (!d) return '-'
  const dt = d?.seconds ? new Date(d.seconds * 1000) : new Date(d)
  return dt.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
}

function doExport() {
  exportToExcel(filtered.value, [
    { label: 'No',         field: (_, i) => i + 1 },
    { label: 'Nama',       field: 'nama' },
    { label: 'No. WA',     field: 'wa' },
    { label: 'Blok',       field: r => r.blok || r.blokRumah || '' },
    { label: 'Cabang',     field: 'cabang' },
    { label: 'Tgl Daftar', field: r => formatDate(r.tglDate || r.createdAt) },
  ], 'registrasi-peserta')
}

onMounted(() => regStore.fetch())
</script>

<style scoped>
.adm-main    { max-width:1180px; margin:0 auto; padding:34px 22px 70px; }
.adm-section { background:#fff; border:1px solid #ECE7DE; border-radius:20px; padding:28px; }
.section-header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.section-eyebrow{ font:700 13px/1 'Plus Jakarta Sans'; letter-spacing:.12em; text-transform:uppercase; color:#9A6B12; }
.section-title  { font:800 28px/1.05 Archivo; color:#1A1613; margin:8px 0 0; }
.table-wrap  { overflow-x:auto; border:1px solid #ECE7DE; border-radius:14px; }
.reg-table   { width:100%; border-collapse:collapse; font:500 13px/1.6 'Plus Jakarta Sans'; }
.reg-table thead tr { background:#FAF8F3; border-bottom:2px solid #ECE7DE; }
.reg-table th { padding:12px 16px; text-align:left; font:700 12px/1 'Plus Jakarta Sans'; color:#7A7368; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
.reg-table td { padding:14px 16px; border-bottom:1px solid #F0EBE2; }
.reg-table tbody tr:last-child td { border-bottom:none; }
.reg-table tbody tr:hover { background:#FAF8F3; }
.td-num  { text-align:center; color:#9A9389; font:600 13px/1 Archivo; }
.td-bold { font:700 14px/1 'Plus Jakarta Sans'; color:#1A1613; }
.wa-link { color:#CE1126; text-decoration:none; font:600 13px/1 'Plus Jakarta Sans'; }
.cabang-badge { display:inline-flex; padding:4px 10px; border-radius:6px; background:#FCE7EA; color:#CE1126; font:600 12px/1 'Plus Jakarta Sans'; }
.empty   { text-align:center; padding:32px; color:#9A9389; font:500 14px/1 'Plus Jakarta Sans'; }
.header-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.search-input   { width:220px; }
.btn-export     { padding:10px 18px; border:1.5px solid #2E7D52; border-radius:10px; background:#fff; color:#2E7D52; font:700 13px/1 'Plus Jakarta Sans'; cursor:pointer; white-space:nowrap; transition:background .15s; }
.btn-export:hover { background:#E7F2EB; }
</style>
