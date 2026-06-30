import { addGaleri } from './helpers'

const SAMPLE_DATA = [
  {
    judul:      'Upacara HUT RI ke-81',
    url:        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    kategori:   'HUT RI',
    keterangan: 'Upacara bendera memperingati HUT RI ke-81 di lapangan utama.',
    urutan:     1,
  },
  {
    judul:      'Final Voli Putra',
    url:        'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
    kategori:   'Lomba',
    keterangan: 'Pertandingan final voli putra antar RT.',
    urutan:     2,
  },
  {
    judul:      'Tarik Tambang',
    url:        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80',
    kategori:   'Lomba',
    keterangan: 'Lomba tarik tambang yang seru antar warga.',
    urutan:     3,
  },
  {
    judul:      'Karnaval Anak',
    url:        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    kategori:   'Karnaval',
    keterangan: 'Karnaval kostum anak-anak memperingati kemerdekaan.',
    urutan:     4,
  },
  {
    judul:      'Panjat Pinang',
    url:        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    kategori:   'Lomba',
    keterangan: 'Lomba panjat pinang yang selalu dinantikan warga.',
    urutan:     5,
  },
  {
    judul:      'Makan Kerupuk',
    url:        'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
    kategori:   'Lomba',
    keterangan: 'Lomba makan kerupuk yang meriah dan mengundang tawa.',
    urutan:     6,
  },
  {
    judul:      'Malam Resepsi',
    url:        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    kategori:   'Acara',
    keterangan: 'Malam resepsi penutupan Semarak Merdeka 81.',
    urutan:     7,
  },
  {
    judul:      'Juara Umum 2025',
    url:        'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80',
    kategori:   'Acara',
    keterangan: 'Penyerahan piala juara umum kepada RT pemenang.',
    urutan:     8,
  },
]

export async function seedGaleri() {
  for (const item of SAMPLE_DATA) {
    await addGaleri(item)
  }
}
