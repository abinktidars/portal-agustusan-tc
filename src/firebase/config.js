import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseDefaults = {
  apiKey: 'AIzaSyClU1r_57Gs6rLIW9EmFgvoZlcXDS9LbbQ',
  authDomain: 'agustusan-warga-tc.firebaseapp.com',
  projectId: 'agustusan-warga-tc',
  storageBucket: 'agustusan-warga-tc.firebasestorage.app',
  messagingSenderId: '696787245871',
  appId: '1:696787245871:web:8979f84056e0eb5cae5fda',
  measurementId: 'G-4EDNVZB7BM',
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || firebaseDefaults.apiKey,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseDefaults.authDomain,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseDefaults.projectId,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseDefaults.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseDefaults.messagingSenderId,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || firebaseDefaults.appId,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseDefaults.measurementId,
}

const app = initializeApp(firebaseConfig)
export const db      = getFirestore(app)
export const auth    = getAuth(app)
export const storage = getStorage(app)
