<template>
  <footer class="app-footer">
    <div class="flag-bar"></div>
    <div class="footer-inner">
      <div>
        <div class="footer-brand">
          <img src="/assets/logo.png" alt="" class="footer-logo" />
          <div>
            <div class="footer-name">Teras Country Residence</div>
            <div class="footer-sub">Panitia HUT RI ke-81</div>
          </div>
        </div>
        <p class="footer-desc">Portal bersama warga untuk seluruh rangkaian lomba &amp; kegiatan kemerdekaan 2026.</p>
      </div>
      <div>
        <div class="footer-heading">Kontak Panitia</div>
        <div class="footer-text">
          <p>
            Andie Hans (Ketua): <a class="footer-link" href="https://wa.me/6281574109182" target="_blank" rel="noopener">+62 815-7410-9182</a><br>
            Ashwin: <a class="footer-link" href="https://wa.me/6281903031903" target="_blank" rel="noopener">+62 819-0303-1903</a><br>
          </p>
        </div>
      </div>
      <div>
        <div class="footer-heading">Periode Acara</div>
        <div class="footer-text">11 Juli – 29 Agustus 2026<br>Puncak: 29 Agustus 2026<br>Lokasi: Lapangan Fasum Teras Country</div>
      </div>
    </div>
    <div class="footer-copy">© 2026 Teras Country Residence <p> Dibuat oleh Tim Media dan Komunikasi Warga TC </p> </div>
  </footer>
</template>

<style scoped>
.app-footer { background: #1A1613; color: #fff; margin-top: 30px; }
.footer-inner {
  max-width: 1180px; margin: 0 auto;
  padding: 40px 22px;
  display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 30px;
}
.footer-brand { display: flex; align-items: center; gap: 12px; }
.footer-logo  { width: 44px; height: 44px; border-radius: 50%; }
.footer-name  { font: 800 16px/1.1 Archivo; }
.footer-sub   { font: 600 12px/1 'Plus Jakarta Sans'; color: #B8B0A6; margin-top: 4px; }
.footer-desc  { font: 500 13px/1.6 'Plus Jakarta Sans'; color: #B8B0A6; margin: 16px 0 0; max-width: 38ch; }
.footer-heading { font: 700 12px/1 'Plus Jakarta Sans'; letter-spacing: .1em; text-transform: uppercase; color: #E0A82E; }
.footer-text    { font: 500 14px/1.9 'Plus Jakarta Sans'; color: #D8D2C8; margin-top: 12px; }
.footer-link    { color: #D8D2C8; text-decoration: underline; text-underline-offset: 2px; }
.footer-link:hover { color: #E0A82E; }
.footer-copy    { border-top: 1px solid rgba(255,255,255,.1); padding: 18px 22px; text-align: center; font: 500 12px/1 'Plus Jakarta Sans'; color: #8A8278; }
@media(max-width:767px) { .footer-inner { grid-template-columns: 1fr; } }
</style>
