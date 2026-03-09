import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase/firebase'

export const authApi = {
  login: ({ email, password }) =>
    signInWithEmailAndPassword(auth, email, password),

  register: ({ email, password }) =>
    createUserWithEmailAndPassword(auth, email, password),

  logout: () => signOut(auth),
}
