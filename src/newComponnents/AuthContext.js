import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, query, where, setDoc, getDocs, getDoc } from "firebase/firestore";
import { auth, db } from './FbConfig.js'
import { signUp, signIn } from './a_firestore/rgisterData/RegisterActions.js'
import { signOut as firebaseSignOut } from './a_firestore/rgisterData/RegisterActions.js'

const AuthContext = createContext({
  currentUser: null,
  login: () => Promise,
  register: () => Promise,
})

export const useAuth = () => useContext(AuthContext)

export default function AuthContextProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])
  
  const register = (props) => signUp(props)
  const login = (props) => signIn(props)
  function logout(actions) {
    return firebaseSignOut(actions)
  }

  const value = { currentUser, register, login, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
