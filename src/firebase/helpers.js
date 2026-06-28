import { db, auth } from './config'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, setDoc, orderBy
} from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'

const fmt = (d) => {
  if (!d) return null
  if (d?.seconds) return new Date(d.seconds * 1000)
  return new Date(d)
}

// ── JADWAL ────────────────────────────────────────────
export async function getJadwal() {
  const snap = await getDocs(query(collection(db, 'jadwal'), orderBy('tgl')))
  return snap.docs.map(d => ({ id: d.id, ...d.data(), tglDate: fmt(d.data().tgl) }))
}
export const addJadwal    = (data) => addDoc(collection(db, 'jadwal'), { ...data, createdAt: new Date() })
export const updateJadwal = (id, data) => updateDoc(doc(db, 'jadwal', id), data)
export const deleteJadwal = (id) => deleteDoc(doc(db, 'jadwal', id))

// ── HASIL ─────────────────────────────────────────────
export async function getHasil() {
  const snap = await getDocs(query(collection(db, 'hasil'), orderBy('tgl', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data(), tglDate: fmt(d.data().tgl) }))
}
export const addHasil    = (data) => addDoc(collection(db, 'hasil'), { ...data, createdAt: new Date() })
export const updateHasil = (id, data) => updateDoc(doc(db, 'hasil', id), data)
export const deleteHasil = (id) => deleteDoc(doc(db, 'hasil', id))

// ── KLASEMEN ──────────────────────────────────────────
export async function getKlasemen() {
  const snap = await getDocs(collection(db, 'klasemen'))
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.poin || 0) - (a.poin || 0))
}
export async function upsertKlasemen(nama, data) {
  const q = query(collection(db, 'klasemen'), where('nama', '==', nama))
  const snap = await getDocs(q)
  if (snap.empty) return setDoc(doc(collection(db, 'klasemen')), { nama, ...data })
  return updateDoc(snap.docs[0].ref, data)
}

// ── REGISTRASI ────────────────────────────────────────
export async function getRegistrasi() {
  const snap = await getDocs(collection(db, 'registrasi'))
  return snap.docs
    .map(d => ({ id: d.id, ...d.data(), tglDate: fmt(d.data().createdAt) }))
    .sort((a, b) => (b.tglDate || 0) - (a.tglDate || 0))
}
export const addRegistrasi = (data) => addDoc(collection(db, 'registrasi'), { ...data, createdAt: new Date() })

// ── AUTH ──────────────────────────────────────────────
export const loginAdmin  = (email, password) => signInWithEmailAndPassword(auth, email, password)
export const logoutAdmin = () => signOut(auth)
