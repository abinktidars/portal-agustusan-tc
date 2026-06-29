<template>
  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Klasemen</div>
          <h2 class="section-title">Klasemen Per Kategori Lomba</h2>
        </div>
        <div class="info-note">
          🔄 Klasemen diisi otomatis dari data hasil pertandingan
        </div>
      </div>

      <div v-if="isLoading" class="loading-text">Memuat data...</div>

      <template v-else>
        <div v-for="tipe in tipeStore.list" :key="tipe.id" class="tipe-block">
          <div class="tipe-header" :style="{ background: tipe.bg, borderLeftColor: tipe.warna }">
            <span class="tipe-nama" :style="{ color: tipe.warna }">{{ tipe.nama }}</span>
            <span class="tipe-count">{{ kategoriByTipe(tipe.id).length }} cabang</span>
          </div>

          <div v-if="!kategoriByTipe(tipe.id).length" class="empty-tipe">
            Belum ada kategori untuk tipe ini.
          </div>

          <div v-else class="kat-table-wrap">
            <table class="kat-table">
              <thead>
                <tr>
                  <th>Cabang Lomba</th>
                  <th>Jenis</th>
                  <th>🥇 Juara 1</th>
                  <th>🥈 Juara 2</th>
                  <th>🥉 Juara 3</th>
                  <th>Babak</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="kat in kategoriByTipe(tipe.id)"
                  :key="kat.id"
                  :class="{ 'row-filled': !!klasemenOf(kat.nama) }"
                >
                  <td class="kat-nama-cell">{{ kat.nama }}</td>
                  <td>
                    <span class="jenis-badge" :class="kat.jenis === 'Perorangan' ? 'badge-p' : 'badge-b'">
                      {{ kat.jenis || 'Beregu' }}
                    </span>
                  </td>

                  <template v-if="klasemenOf(kat.nama)">
                    <td class="juara-cell">
                      <span class="juara-nama">{{ klasemenOf(kat.nama).juara1 || '—' }}</span>
                    </td>
                    <td class="juara-cell">
                      <span v-if="klasemenOf(kat.nama).juara2" class="juara-nama">
                        {{ klasemenOf(kat.nama).juara2 }}
                      </span>
                      <span v-else class="belum">—</span>
                    </td>
                    <td class="juara-cell">
                      <span v-if="klasemenOf(kat.nama).juara3" class="juara-nama">
                        {{ klasemenOf(kat.nama).juara3 }}
                      </span>
                      <span v-else class="belum">—</span>
                    </td>
                    <td>
                      <span v-if="klasemenOf(kat.nama).babak" class="babak-badge">
                        {{ klasemenOf(kat.nama).babak }}
                      </span>
                      <span v-else class="belum">—</span>
                    </td>
                  </template>

                  <template v-else>
                    <td colspan="4" class="belum-cell">Belum ada hasil pertandingan</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="!tipeStore.list.length" class="empty-global">
          Belum ada tipe lomba. Tambahkan dulu di menu Tipe Lomba.
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useHasilStore }    from '@/stores/useHasil'
import { useKategoriStore } from '@/stores/useKategori'
import { useTipeStore }     from '@/stores/useTipe'

const hasilStore    = useHasilStore()
const kategoriStore = useKategoriStore()
const tipeStore     = useTipeStore()

const isLoading = computed(() =>
  hasilStore.loading || kategoriStore.loading || tipeStore.loading
)

function kategoriByTipe(tipeId) {
  return kategoriStore.list.filter(k => k.tipeId === tipeId)
}

// Group hasil by cabang name
const hasilByKabang = computed(() => {
  const map = {}
  hasilStore.list.forEach(h => {
    if (!map[h.cabang]) map[h.cabang] = []
    map[h.cabang].push(h)
  })
  return map
})

// Derivasi klasemen dari hasil — sama dengan logika portal
function klasemenOf(katNama) {
  const entries = hasilByKabang.value[katNama] || []
  if (!entries.length) return null

  const finalEntry = entries.find(e => /final/i.test(e.babak || ''))
  const entry = finalEntry || entries[0]

  const isPerorangan = !!(entry.juara1 || entry.juara2 || entry.juara3) || entry.jenis === 'Perorangan'

  if (isPerorangan) {
    return {
      juara1: entry.juara1 || '',
      juara2: entry.juara2 || '',
      juara3: entry.juara3 || '',
      babak:  entry.babak  || '',
    }
  }

  if (entry.juara) {
    return {
      juara1: entry.juara,
      juara2: '',
      juara3: '',
      babak:  entry.babak || '',
    }
  }

  return null
}

onMounted(async () => {
  await Promise.all([
    tipeStore.fetch(),
    kategoriStore.fetch(),
    hasilStore.fetch(),
  ])
})
</script>

<style scoped>
.adm-main    { max-width: 1180px; margin: 0 auto; padding: 34px 22px 70px; }
.adm-section { background: #fff; border: 1px solid #ECE7DE; border-radius: 20px; padding: 28px; }
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
.section-eyebrow{ font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #9A6B12; }
.section-title  { font: 800 28px/1.05 Archivo; color: #1A1613; margin: 8px 0 0; }

.info-note {
  font: 600 13px/1 'Plus Jakarta Sans'; color: #2D5B8A;
  background: #E5EDF7; border-radius: 10px; padding: 10px 16px;
}

.loading-text { font: 500 14px/1 'Plus Jakarta Sans'; color: #9A9389; padding: 32px 0; }

/* ── Tipe block ── */
.tipe-block { margin-bottom: 32px; }
.tipe-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-radius: 10px; border-left: 4px solid;
  margin-bottom: 12px;
}
.tipe-nama  { font: 800 15px/1 Archivo; }
.tipe-count { font: 600 12px/1 'Plus Jakarta Sans'; color: #7A7368; }

/* ── Table ── */
.kat-table-wrap { overflow-x: auto; border: 1px solid #E2DCD2; border-radius: 12px; }
.kat-table {
  width: 100%; border-collapse: collapse;
  font: 500 13px/1.4 'Plus Jakarta Sans';
}
.kat-table thead tr { background: #F8F6F3; }
.kat-table th {
  padding: 11px 14px; text-align: left;
  font: 700 12px/1 'Plus Jakarta Sans'; color: #7A7368;
  letter-spacing: .04em; text-transform: uppercase;
  border-bottom: 1px solid #E2DCD2; white-space: nowrap;
}
.kat-table tbody tr {
  border-bottom: 1px solid #F0EBE2;
  transition: background .12s;
}
.kat-table tbody tr:last-child { border-bottom: none; }
.kat-table tbody tr:hover { background: #FDFCFA; }
.kat-table tbody tr.row-filled td.kat-nama-cell { font-weight: 700; color: #1A1613; }
.kat-table td { padding: 10px 14px; vertical-align: middle; }

.kat-nama-cell { font: 600 14px/1.2 'Plus Jakarta Sans'; color: #1A1613; min-width: 140px; }

.jenis-badge { font: 700 10px/1 'Plus Jakarta Sans'; letter-spacing: .06em; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; white-space: nowrap; }
.badge-b     { background: #E5EDF7; color: #2D5B8A; }
.badge-p     { background: #FBF1DD; color: #C0871C; }

.juara-cell { min-width: 120px; }
.juara-nama { font: 600 13px/1.3 'Plus Jakarta Sans'; color: #1A1613; }
.belum      { color: #C9C2B6; font-style: italic; }
.belum-cell { color: #C9C2B6; font-style: italic; font-size: 13px; }

.babak-badge {
  font: 700 11px/1 'Plus Jakarta Sans'; letter-spacing: .05em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 6px; background: #E7F2EB; color: #2E7D52;
}

.empty-tipe   { font: 500 13px/1 'Plus Jakarta Sans'; color: #C9C2B6; padding: 16px 0 8px; }
.empty-global { font: 500 14px/1.5 'Plus Jakarta Sans'; color: #9A9389; padding: 48px 0; text-align: center; }
</style>
