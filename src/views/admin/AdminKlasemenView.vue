<template>
  <main class="adm-main">
    <div class="adm-section">
      <div class="section-header">
        <div>
          <div class="section-eyebrow">Klasemen</div>
          <h2 class="section-title">Klasemen Per Kategori Lomba</h2>
        </div>
      </div>

      <div v-if="isLoading" class="loading-text">Memuat data...</div>

      <template v-else>
        <div v-for="tipe in tipeStore.list" :key="tipe.id" class="tipe-block">
          <!-- Tipe header -->
          <div class="tipe-header" :style="{ background: tipe.bg, borderLeftColor: tipe.warna }">
            <span class="tipe-nama" :style="{ color: tipe.warna }">{{ tipe.nama }}</span>
            <span class="tipe-count">{{ kategoriByTipe(tipe.id).length }} cabang</span>
          </div>

          <!-- Empty tipe -->
          <div v-if="!kategoriByTipe(tipe.id).length" class="empty-tipe">
            Belum ada kategori untuk tipe ini.
          </div>

          <!-- Kategori table -->
          <div v-else class="kat-table-wrap">
            <table class="kat-table">
              <thead>
                <tr>
                  <th>Cabang Lomba</th>
                  <th>Jenis</th>
                  <th>🥇 Juara 1</th>
                  <th>🥈 Juara 2</th>
                  <th>🥉 Juara 3</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="kat in kategoriByTipe(tipe.id)" :key="kat.id"
                  :class="{ 'row-editing': editId === kat.id, 'row-filled': !!klasemenOf(kat.id) }">

                  <!-- Edit mode -->
                  <template v-if="editId === kat.id">
                    <td class="kat-nama-cell"><strong>{{ kat.nama }}</strong></td>
                    <td>
                      <span class="jenis-badge" :class="kat.jenis === 'Perorangan' ? 'badge-p' : 'badge-b'">
                        {{ kat.jenis || 'Beregu' }}
                      </span>
                    </td>
                    <td>
                      <input
                        v-model="editForm.juara1"
                        class="tcr-input input-sm"
                        :placeholder="kat.jenis === 'Perorangan' ? 'Nama peserta' : 'Blok / tim'"
                      />
                    </td>
                    <td>
                      <input v-model="editForm.juara2" class="tcr-input input-sm" placeholder="Nama / blok" />
                    </td>
                    <td>
                      <input v-model="editForm.juara3" class="tcr-input input-sm" placeholder="Nama / blok" />
                    </td>
                    <td class="action-cell">
                      <button @click="saveEdit(kat)" class="btn-save-sm">Simpan</button>
                      <button @click="cancelEdit" class="btn-cancel-sm">Batal</button>
                    </td>
                  </template>

                  <!-- View mode -->
                  <template v-else>
                    <td class="kat-nama-cell">{{ kat.nama }}</td>
                    <td>
                      <span class="jenis-badge" :class="kat.jenis === 'Perorangan' ? 'badge-p' : 'badge-b'">
                        {{ kat.jenis || 'Beregu' }}
                      </span>
                    </td>
                    <td class="juara-cell">
                      <span v-if="klasemenOf(kat.id)?.juara1" class="juara-nama">
                        {{ klasemenOf(kat.id).juara1 }}
                      </span>
                      <span v-else class="belum">—</span>
                    </td>
                    <td class="juara-cell">
                      <span v-if="klasemenOf(kat.id)?.juara2" class="juara-nama">
                        {{ klasemenOf(kat.id).juara2 }}
                      </span>
                      <span v-else class="belum">—</span>
                    </td>
                    <td class="juara-cell">
                      <span v-if="klasemenOf(kat.id)?.juara3" class="juara-nama">
                        {{ klasemenOf(kat.id).juara3 }}
                      </span>
                      <span v-else class="belum">—</span>
                    </td>
                    <td class="action-cell">
                      <button @click="openEdit(kat)" class="btn-edit-sm">
                        {{ klasemenOf(kat.id) ? 'Edit' : '+ Isi' }}
                      </button>
                      <button
                        v-if="klasemenOf(kat.id)"
                        @click="hapus(kat)"
                        class="btn-del-sm"
                      >Hapus</button>
                    </td>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useKlasemenStore } from '@/stores/useKlasemen'
import { useKategoriStore } from '@/stores/useKategori'
import { useTipeStore }     from '@/stores/useTipe'

const klasemenStore = useKlasemenStore()
const kategoriStore = useKategoriStore()
const tipeStore     = useTipeStore()

const editId   = ref(null)
const editForm = reactive({ juara1: '', juara2: '', juara3: '' })

const isLoading = computed(() =>
  klasemenStore.loading || kategoriStore.loading || tipeStore.loading
)

function kategoriByTipe(tipeId) {
  return kategoriStore.list.filter(k => k.tipeId === tipeId)
}

function klasemenOf(kategoriId) {
  return klasemenStore.byKategori[kategoriId] || null
}

function openEdit(kat) {
  editId.value = kat.id
  const existing = klasemenOf(kat.id)
  editForm.juara1 = existing?.juara1 || ''
  editForm.juara2 = existing?.juara2 || ''
  editForm.juara3 = existing?.juara3 || ''
}

function cancelEdit() {
  editId.value = null
  Object.assign(editForm, { juara1: '', juara2: '', juara3: '' })
}

async function saveEdit(kat) {
  if (!editForm.juara1.trim()) return
  await klasemenStore.set(kat.id, {
    kategoriId:   kat.id,
    kategoriNama: kat.nama,
    tipeId:       kat.tipeId,
    jenis:        kat.jenis || 'Beregu',
    juara1:       editForm.juara1.trim(),
    juara2:       editForm.juara2.trim(),
    juara3:       editForm.juara3.trim(),
  })
  cancelEdit()
}

async function hapus(kat) {
  if (!confirm(`Hapus data klasemen "${kat.nama}"?`)) return
  await klasemenStore.remove(kat.id)
}

onMounted(async () => {
  await Promise.all([
    tipeStore.fetch(),
    kategoriStore.fetch(),
    klasemenStore.fetch(),
  ])
})
</script>

<style scoped>
.adm-main    { max-width: 1180px; margin: 0 auto; padding: 34px 22px 70px; }
.adm-section { background: #fff; border: 1px solid #ECE7DE; border-radius: 20px; padding: 28px; }
.section-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
.section-eyebrow{ font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #9A6B12; }
.section-title  { font: 800 28px/1.05 Archivo; color: #1A1613; margin: 8px 0 0; }

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
.kat-table thead tr {
  background: #F8F6F3;
}
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
.kat-table tbody tr.row-editing { background: #FFFBF2; }
.kat-table tbody tr.row-filled td.kat-nama-cell { font-weight: 700; color: #1A1613; }
.kat-table td { padding: 10px 14px; vertical-align: middle; }

.kat-nama-cell { font: 600 14px/1.2 'Plus Jakarta Sans'; color: #1A1613; min-width: 140px; }

/* Jenis badges */
.jenis-badge { font: 700 10px/1 'Plus Jakarta Sans'; letter-spacing: .06em; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; white-space: nowrap; }
.badge-b     { background: #E5EDF7; color: #2D5B8A; }
.badge-p     { background: #FBF1DD; color: #C0871C; }

/* Juara cells */
.juara-cell { min-width: 120px; }
.juara-nama { font: 600 13px/1.3 'Plus Jakarta Sans'; color: #1A1613; }
.belum      { color: #C9C2B6; font-style: italic; }

/* Edit input */
.input-sm { padding: 7px 10px !important; font-size: 13px !important; min-width: 110px; }

/* Action cells */
.action-cell { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.btn-edit-sm   { padding: 6px 12px; border-radius: 8px; border: 1.5px solid #C0871C; background: #FBF1DD; color: #C0871C; font: 700 12px/1 'Plus Jakarta Sans'; cursor: pointer; }
.btn-save-sm   { padding: 6px 12px; border-radius: 8px; border: none; background: #2E7D52; color: #fff; font: 700 12px/1 'Plus Jakarta Sans'; cursor: pointer; }
.btn-cancel-sm { padding: 6px 12px; border-radius: 8px; border: 1.5px solid #E2DCD2; background: transparent; color: #7A7368; font: 700 12px/1 'Plus Jakarta Sans'; cursor: pointer; }
.btn-del-sm    { padding: 6px 12px; border-radius: 8px; border: 1px solid #FBEAEC; background: #FBEAEC; color: #CE1126; font: 700 12px/1 'Plus Jakarta Sans'; cursor: pointer; }

.empty-tipe   { font: 500 13px/1 'Plus Jakarta Sans'; color: #C9C2B6; padding: 16px 0 8px; }
.empty-global { font: 500 14px/1.5 'Plus Jakarta Sans'; color: #9A9389; padding: 48px 0; text-align: center; }
</style>
