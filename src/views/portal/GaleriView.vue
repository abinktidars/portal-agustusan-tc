<template>
  <div>
    <div class="eyebrow">Galeri Foto</div>
    <h2 class="page-title">Momen Kemerdekaan</h2>
    <p class="desc">Dokumentasi kegiatan akan diunggah panitia. Slot di bawah menanti foto-foto seru dari warga.</p>
    <div class="galeri-grid">
      <div v-for="g in galeri" :key="g" class="galeri-slot">
        <div class="slot-label">foto:</div>
        <div class="slot-name">{{ g }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const galeri = ['HUT RI ke-80','Final Voli Putra','Tarik Tambang','Karnaval Anak','Panjat Pinang','Juara Umum 2025','Makan Kerupuk','Malam Resepsi']
</script>

<style scoped>
.eyebrow   { font: 700 13px/1 'Plus Jakarta Sans'; letter-spacing: .12em; text-transform: uppercase; color: #CE1126; }
.page-title{ margin: 9px 0 8px; font: 800 32px/1.05 Archivo; color: #1A1613; text-transform: uppercase; }
.desc { font: 500 14px/1.5 'Plus Jakarta Sans'; color: #7A7368; margin: 0 0 22px; }
.galeri-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.galeri-slot {
  aspect-ratio: 1/1; border-radius: 14px; border: 1.5px solid #F0D3D7;
  background-image: repeating-linear-gradient(135deg,#F2ECE2 0 10px,#FAF8F3 10px 20px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 14px; text-align: center;
}
.slot-label { font: 600 11px/1.4 ui-monospace,Menlo,monospace; color: #A89F92; }
.slot-name  { font: 600 12px/1.4 ui-monospace,Menlo,monospace; color: #7A7368; margin-top: 4px; }
@media(max-width:767px) { .galeri-grid { grid-template-columns: repeat(2,1fr); } }
</style>
