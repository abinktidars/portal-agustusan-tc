import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as fb from '@/firebase/helpers'

const FALLBACK = [
  {
    nama:'Voli Putra', kat:'Olahraga', format:'Beregu', jadwal:'19 Jul – 15 Agu',
    deskripsi:'Turnamen bola voli antar-blok kategori putra, sistem gugur menuju final.',
    ketentuan:[
      'Setiap tim maksimal 10 pemain dan minimal 6 pemain aktif.',
      'Pertandingan menggunakan sistem best of 3 set.',
      'Wajib hadir 15 menit sebelum jadwal mulai.',
      'Keputusan wasit bersifat final dan tidak dapat diganggu gugat.',
    ],
    urutan: 1,
  },
  {
    nama:'Voli Putri', kat:'Olahraga', format:'Beregu', jadwal:'26 Jul – 16 Agu',
    deskripsi:'Turnamen bola voli antar-blok kategori putri, semarak sportivitas warga.',
    ketentuan:[
      'Setiap tim maksimal 10 pemain dan minimal 6 pemain aktif.',
      'Pertandingan menggunakan sistem best of 3 set.',
      'Pergantian pemain mengikuti aturan panitia dan wasit lapangan.',
      'Keputusan wasit bersifat final dan tidak dapat diganggu gugat.',
    ],
    urutan: 2,
  },
  {
    nama:'Badminton Beregu', kat:'Olahraga', format:'Beregu', jadwal:'08 – 14 Agu',
    deskripsi:'Bulu tangkis beregu (tunggal & ganda) memperebutkan Piala Bergilir TCR.',
    ketentuan:[
      'Satu regu terdiri dari 5-7 pemain.',
      'Format pertandingan: tunggal putra, ganda putra, dan ganda campuran (opsional).',
      'Sistem rally point 21 dengan kemenangan 2 gim.',
      'Raket pribadi diperbolehkan, shuttlecock disediakan panitia.',
    ],
    urutan: 3,
  },
  {
    nama:'Futsal Anak', kat:'Olahraga', format:'Tim 5 Anak', jadwal:'02 – 14 Agu',
    deskripsi:'Futsal khusus anak-anak warga, ajang seru sekaligus belajar kerja sama tim.',
    ketentuan:[
      'Peserta wajib kategori anak sesuai ketentuan umur panitia.',
      'Setiap tim terdiri dari 5 pemain inti + maksimal 3 cadangan.',
      'Durasi pertandingan 2 x 10 menit.',
      'Wajib menggunakan perlengkapan olahraga yang aman.',
    ],
    urutan: 4,
  },
  {
    nama:'Mobile Legends', kat:'E-Sport', format:'Tim 5 Pemain', jadwal:'01 – 15 Agu',
    deskripsi:'Turnamen e-sport 5v5, terbuka untuk remaja & dewasa tiap blok.',
    ketentuan:[
      'Satu tim terdiri dari 5 pemain inti dan maksimal 2 cadangan.',
      'Format pertandingan BO1 untuk penyisihan, BO3 untuk semifinal/final.',
      'Semua akun wajib milik sendiri dan tidak boleh joki.',
      'Keterlambatan lebih dari 10 menit dinyatakan WO.',
    ],
    urutan: 5,
  },
  {
    nama:'Balap Karung', kat:'Tradisional', format:'Perorangan', jadwal:'11 Jul',
    deskripsi:'Lomba tradisional klasik kategori anak & dewasa, dijamin penuh tawa.',
    ketentuan:[
      'Peserta mengikuti kategori yang ditentukan (anak/dewasa).',
      'Start dan finish mengikuti aba-aba panitia.',
      'Peserta yang keluar lintasan harus kembali ke titik keluar.',
      'Pemenang ditentukan dari urutan finish tercepat.',
    ],
    urutan: 6,
  },
  {
    nama:'Tarik Tambang', kat:'Tradisional', format:'Tim 8 Orang', jadwal:'09 – 12 Agu',
    deskripsi:'Adu kekompakan & kekuatan tim antar-blok, salah satu favorit warga.',
    ketentuan:[
      'Setiap tim terdiri dari 8 orang + 2 cadangan.',
      'Pertandingan menggunakan sistem best of 3 ronde.',
      'Sepatu dengan paku tajam tidak diperbolehkan.',
      'Tim dinyatakan menang jika berhasil menarik batas tengah lawan.',
    ],
    urutan: 7,
  },
  {
    nama:'Makan Kerupuk', kat:'Tradisional', format:'Perorangan', jadwal:'11 Jul',
    deskripsi:'Lomba khas 17-an untuk semua umur, siapa tercepat menghabiskan kerupuk.',
    ketentuan:[
      'Peserta tidak boleh menggunakan tangan selama lomba berlangsung.',
      'Posisi kerupuk dan tali ditentukan oleh panitia.',
      'Peserta harus berdiri di area yang ditentukan.',
      'Pemenang adalah peserta yang paling cepat menghabiskan kerupuk.',
    ],
    urutan: 8,
  },
  {
    nama:'Balap Kelereng', kat:'Tradisional', format:'Perorangan', jadwal:'12 Jul',
    deskripsi:'Uji fokus & keseimbangan membawa kelereng di atas sendok hingga garis finis.',
    ketentuan:[
      'Kelereng harus tetap berada di atas sendok sampai garis finish.',
      'Sendok wajib digigit di mulut, tangan tidak boleh membantu.',
      'Jika kelereng jatuh, peserta kembali ke titik awal.',
      'Pemenang ditentukan berdasarkan waktu tercepat.',
    ],
    urutan: 9,
  },
  {
    nama:'Panjat Pinang', kat:'Tradisional', format:'Tim 5 Orang', jadwal:'17 Agu',
    deskripsi:'Puncak acara! Adu strategi tim memanjat meraih hadiah utama di puncak pinang.',
    ketentuan:[
      'Satu tim terdiri dari 5 orang peserta.',
      'Peserta wajib menggunakan pakaian yang aman dan tidak berbahaya.',
      'Strategi tim bebas selama tidak membahayakan peserta lain.',
      'Tim pertama yang berhasil mengambil hadiah utama dinyatakan menang.',
    ],
    urutan: 10,
  },
]

function parseKetentuan(raw) {
  if (Array.isArray(raw)) {
    return raw.map(v => String(v || '').trim()).filter(Boolean)
  }

  if (typeof raw === 'string') {
    return raw
      .split('\n')
      .map(v => v.replace(/^\d+[.)]\s*/, '').trim())
      .filter(Boolean)
  }

  return []
}

function normalizeLomba(item, idx = 0) {
  const ketentuanRaw =
    item.ketentuan ??
    item.ketentuanLomba ??
    item.ketentuan_lomba ??
    item.peraturan

  const ketentuan = parseKetentuan(ketentuanRaw)

  return {
    id: item.id || String(idx + 1),
    nama: item.nama || item.cabang || `Lomba ${idx + 1}`,
    kat: item.kat || item.tipe || 'Olahraga',
    format: item.format || item.jenis || 'Perorangan',
    jadwal: item.jadwal || item.periode || item.tanggal || '-',
    deskripsi: item.deskripsi || item.desc || '',
    ketentuan: ketentuan.length ? ketentuan : ['Ketentuan lomba belum diisi panitia.'],
    urutan: Number(item.urutan || idx + 1),
  }
}

export const useLombaStore = defineStore('lomba', () => {
  const list = ref([])
  const loading = ref(false)

  const sorted = computed(() =>
    [...list.value].sort((a, b) => (a.urutan || 999) - (b.urutan || 999))
  )

  async function fetch() {
    loading.value = true
    try {
      const data = await fb.getLomba()
      list.value = data.length
        ? data.map((item, idx) => normalizeLomba(item, idx))
        : FALLBACK.map((item, idx) => normalizeLomba(item, idx))
    } catch {
      list.value = FALLBACK.map((item, idx) => normalizeLomba(item, idx))
    } finally {
      loading.value = false
    }
  }

  return { list, sorted, loading, fetch }
})
