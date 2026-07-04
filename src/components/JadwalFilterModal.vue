<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-backdrop" @click.self="close">
        <Transition name="modal-slide">
          <div v-if="visible" class="modal-sheet">
            <div class="modal-header">
              <div class="modal-grip"></div>
              <button class="modal-close" @click="close">✕</button>
              <div class="modal-title-row">Filter Jadwal</div>
            </div>

            <div class="modal-body">
              <div class="filter-group">
                <div class="filter-label">Jenis Lomba</div>
                <div class="tcr-scroll chip-row">
                  <button v-for="c in cabangOptions" :key="c"
                    class="chip" :class="{ active: cabang === c }"
                    @click="cabang = c">{{ c }}</button>
                </div>
              </div>

              <div class="filter-group">
                <div class="filter-label">Waktu</div>
                <div class="tcr-scroll chip-row">
                  <button v-for="s in statusOptions" :key="s"
                    class="chip" :class="{ active: status === s }"
                    @click="status = s">{{ s }}</button>
                </div>
                <button class="chip chip-toggle" :class="{ active: mingguIni }"
                  @click="mingguIni = !mingguIni">Minggu Ini</button>
              </div>

              <div class="filter-group">
                <div class="filter-label">Koridor</div>
                <div class="tcr-scroll chip-row">
                  <button class="chip" :class="{ active: !koridorId }"
                    @click="koridorId = ''">Semua</button>
                  <button v-for="k in koridorOptions" :key="k.id"
                    class="chip" :class="{ active: koridorId === k.id }"
                    @click="koridorId = k.id">{{ k.nama }}</button>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-reset" @click="reset">Reset</button>
              <button class="btn-apply" @click="close">Terapkan</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  cabangOptions: { type: Array, default: () => [] },
  koridorOptions: { type: Array, default: () => [] },
})

const visible = defineModel('visible', { type: Boolean, default: false })
const cabang = defineModel('cabang', { type: String, default: 'Semua' })
const status = defineModel('status', { type: String, default: 'Semua' })
const mingguIni = defineModel('mingguIni', { type: Boolean, default: false })
const koridorId = defineModel('koridorId', { type: String, default: '' })

const statusOptions = ['Semua', 'Berlangsung', 'Akan Datang', 'Selesai']

function close() {
  visible.value = false
}

function reset() {
  cabang.value = 'Semua'
  status.value = 'Semua'
  mingguIni.value = false
  koridorId.value = ''
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 900;
  background: rgba(26, 22, 19, 0.55);
  display: flex; align-items: flex-end; justify-content: center;
}
@media (min-width: 600px) {
  .modal-backdrop { align-items: center; }
}

.modal-sheet {
  width: 100%; max-width: 480px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  max-height: 85dvh;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -4px 32px rgba(0,0,0,.18);
}
@media (min-width: 600px) {
  .modal-sheet { border-radius: 16px; max-height: 80dvh; }
}

.modal-grip {
  width: 40px; height: 4px; background: #E0D9D1; border-radius: 99px;
  margin: 12px auto 0;
  flex-shrink: 0;
}
@media (min-width: 600px) { .modal-grip { display: none; } }

.modal-header {
  padding: 14px 20px 16px;
  border-bottom: 1px solid #F0EBE2;
  flex-shrink: 0;
  position: relative;
}
.modal-close {
  position: absolute; top: 14px; right: 16px;
  background: #F5F2ED; border: none; border-radius: 50%;
  width: 32px; height: 32px; font-size: 13px; cursor: pointer;
  color: #5A534B; display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: #ECE7DE; }
.modal-title-row { font: 800 18px/1.2 Archivo; color: #1A1613; }

.modal-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.filter-group { display: flex; flex-direction: column; gap: 8px; }
.filter-label { font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .06em; text-transform: uppercase; color: #9A9389; }
.chip-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.chip-toggle { align-self: flex-start; }

.modal-footer {
  display: flex; gap: 10px; padding: 16px 20px;
  border-top: 1px solid #F0EBE2; flex-shrink: 0;
}
.btn-reset, .btn-apply {
  flex: 1; padding: 12px; border-radius: 10px;
  font: 700 14px/1 'Plus Jakarta Sans'; cursor: pointer; transition: opacity .15s;
}
.btn-reset { background: #F5F2ED; color: #5A534B; border: none; }
.btn-reset:hover { background: #ECE7DE; }
.btn-apply { background: #CE1126; color: #fff; border: none; }
.btn-apply:hover { opacity: .9; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-slide-enter-active { transition: transform .28s cubic-bezier(.22,.68,0,1.2); }
.modal-slide-leave-active { transition: transform .2s ease-in; }
.modal-slide-enter-from, .modal-slide-leave-to { transform: translateY(100%); }
@media (min-width: 600px) {
  .modal-slide-enter-active { transition: transform .25s ease, opacity .2s ease; }
  .modal-slide-leave-active { transition: transform .18s ease-in, opacity .15s ease; }
  .modal-slide-enter-from, .modal-slide-leave-to { transform: translateY(16px) scale(.97); opacity: 0; }
}
</style>
