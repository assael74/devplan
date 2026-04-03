import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase/firebase'

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export const authApi = {
  login: async ({ email, password }) => {
    const cleanEmail = normalizeEmail(email)
    const cleanPassword = String(password || '')

    return signInWithEmailAndPassword(auth, cleanEmail, cleanPassword)
  },

  register: async ({ email, password }) => {
    const cleanEmail = normalizeEmail(email)
    const cleanPassword = String(password || '')

    return createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword)
  },

  resetPassword: async ({ email }) => {
    const cleanEmail = normalizeEmail(email)
    return sendPasswordResetEmail(auth, cleanEmail)
  },

  logout: () => signOut(auth),
}
