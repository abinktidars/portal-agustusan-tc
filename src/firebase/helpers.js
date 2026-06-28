import { db } from './config'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, setDoc, orderBy
} from 'firebase/firestore'

const fmt = (d) => {
  if (!d) return null
  if (d?.seconds) return new Date(d.seconds * 1000)
  return new Date(d)
}

const fmtTgl = (tglStr) => {
  if (!tglStr || tglStr.length < 8) return tglStr
  const d = new Date(tglStr + 'T00:00:00')
  if (isNaN(d)) return tglStr
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// ── JADWAL ────────────────────────────────────────────
export async function getJadwal() {
  const snap = await getDocs(query(collection(db, 'jadwal'), orderBy('tgl')))
  return snap.docs.map(d => {
    const data       = d.data()
    const mulaiRaw   = data.tglMulai || data.tgl
    const selesaiRaw = data.tglSelesai || data.tgl
    return {
      id: d.id,
      ...data,
      tgl:            fmtTgl(mulaiRaw),
      tglMulai:       fmtTgl(mulaiRaw),
      tglSelesai:     fmtTgl(selesaiRaw),
      tglDate:        fmt(mulaiRaw),
      tglSelesaiDate: fmt(selesaiRaw),
      tglMulaiRaw:    mulaiRaw,
      tglSelesaiRaw:  selesaiRaw,
    }
  })
}
export const addJadwal    = (data) => addDoc(collection(db, 'jadwal'), { ...data, createdAt: new Date() })
export const updateJadwal = (id, data) => updateDoc(doc(db, 'jadwal', id), data)
export const deleteJadwal = (id) => deleteDoc(doc(db, 'jadwal', id))

// ── HASIL ─────────────────────────────────────────────
export async function getHasil() {
  const snap = await getDocs(query(collection(db, 'hasil'), orderBy('tgl', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data(), tgl: fmtTgl(d.data().tgl), tglDate: fmt(d.data().tgl) }))
}
export const addHasil    = (data) => addDoc(collection(db, 'hasil'), { ...data, createdAt: new Date() })
export const updateHasil = (id, data) => updateDoc(doc(db, 'hasil', id), data)
export const deleteHasil = (id) => deleteDoc(doc(db, 'hasil', id))

// ── TIPE LOMBA ────────────────────────────────────────
export const getTipe    = () => getDocs(query(collection(db, 'tipe_lomba'), orderBy('urutan'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
export const addTipe    = (data) => addDoc(collection(db, 'tipe_lomba'), { ...data, createdAt: new Date() })
export const updateTipe = (id, data) => updateDoc(doc(db, 'tipe_lomba', id), data)
export const deleteTipe = (id) => deleteDoc(doc(db, 'tipe_lomba', id))

// ── KATEGORI ──────────────────────────────────────────
export const getKategori    = () => getDocs(query(collection(db, 'kategori'), orderBy('urutan'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
export const addKategori    = (data) => addDoc(collection(db, 'kategori'), { ...data, createdAt: new Date() })
export const updateKategori = (id, data) => updateDoc(doc(db, 'kategori', id), data)
export const deleteKategori = (id) => deleteDoc(doc(db, 'kategori', id))

// ── KLASEMEN PER KATEGORI ─────────────────────────────
export const getKlasemen = () =>
  getDocs(collection(db, 'klasemen')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))

// Gunakan kategoriId sebagai document ID agar upsert mudah
export const setKlasemenKategori = (kategoriId, data) =>
  setDoc(doc(db, 'klasemen', kategoriId), { ...data, updatedAt: new Date() }, { merge: true })

export const deleteKlasemenKategori = (kategoriId) =>
  deleteDoc(doc(db, 'klasemen', kategoriId))

// ── REGISTRASI ────────────────────────────────────────
export async function getRegistrasi() {
  const snap = await getDocs(collection(db, 'registrasi'))
  return snap.docs
    .map(d => ({ id: d.id, ...d.data(), tglDate: fmt(d.data().createdAt) }))
    .sort((a, b) => (b.tglDate || 0) - (a.tglDate || 0))
}
export const addRegistrasi    = (data) => addDoc(collection(db, 'registrasi'), { ...data, createdAt: new Date() })
export const updateRegistrasi = (id, data) => updateDoc(doc(db, 'registrasi', id), data)
export const deleteRegistrasi = (id) => deleteDoc(doc(db, 'registrasi', id))

// ── KORIDOR ───────────────────────────────────────────
export const getKoridor    = () => getDocs(query(collection(db, 'koridor'), orderBy('urutan'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
export const addKoridor    = (data) => addDoc(collection(db, 'koridor'), { ...data, createdAt: new Date() })
export const updateKoridor = (id, data) => updateDoc(doc(db, 'koridor', id), data)
export const deleteKoridor = (id) => deleteDoc(doc(db, 'koridor', id))

// ── LOKASI ────────────────────────────────────────────
export const getLokasi    = () => getDocs(query(collection(db, 'lokasi'), orderBy('urutan'))).then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
export const addLokasi    = (data) => addDoc(collection(db, 'lokasi'), { ...data, createdAt: new Date() })
export const updateLokasi = (id, data) => updateDoc(doc(db, 'lokasi', id), data)
export const deleteLokasi = (id) => deleteDoc(doc(db, 'lokasi', id))

// ── USERS ─────────────────────────────────────────────
export const getUsers = () =>
  getDocs(collection(db, 'users')).then(s =>
    s.docs.map(d => ({ id: d.id, email: d.data().email, nama: d.data().nama, role: d.data().role }))
  )

export async function addUser({ email, password, role, nama }) {
  const passwordHash = await sha256(password)
  return addDoc(collection(db, 'users'), { email, passwordHash, role, nama, createdAt: new Date() })
}

export async function updateUser(id, { email, password, role, nama }) {
  const data = { email, role, nama }
  if (password) data.passwordHash = await sha256(password)
  return updateDoc(doc(db, 'users', id), data)
}

export const deleteUser = (id) => deleteDoc(doc(db, 'users', id))

// ── AUTH ──────────────────────────────────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function loginAdmin(email, password) {
  const hash = await sha256(password)
  const q    = query(collection(db, 'users'), where('email', '==', email), where('passwordHash', '==', hash))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('INVALID_CREDENTIALS')
  return snap.docs[0].data()
}

export function logoutAdmin() {
  return Promise.resolve()
}
