import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAg0bpW1SO32OYcJcJFCV9trs4f89tKkC8",
  authDomain: "devplan-b4454.firebaseapp.com",
  projectId: "devplan-b4454",
  storageBucket: "devplan-b4454.appspot.com",
  messagingSenderId: "330298199313",
  appId: "1:330298199313:web:764aafdaa0470e790e50b0",
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
