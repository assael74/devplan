// src/application/auth/AuthProvider.js

import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { onAuthStateChanged } from 'firebase/auth'

import { auth } from '../../services/firebase/firebase'
import { authApi } from '../../services/auth/auth.api'
import { registerExternalUser } from '../../services/auth/registerExternalUser.js'
import { clearPlayersDatabaseDocumentCache } from '../../features/playersDatabase/services/cache/index.js'
import { resetPlayersDatabaseTasksSubscription } from '../../features/playersDatabase/services/read/index.js'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let initialized = false
    let previousUserId = ''

    const unsubscribe = onAuthStateChanged(auth, nextUser => {
      const nextUserId = String(nextUser?.uid || '').trim()

      if (initialized && previousUserId !== nextUserId) {
        clearPlayersDatabaseDocumentCache()
        resetPlayersDatabaseTasksSubscription()
      }

      initialized = true
      previousUserId = nextUserId
      setUser(nextUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo(() => {
    return {
      user,
      loading,
      login: authApi.login,
      register: registerExternalUser,
      logout: authApi.logout,
    }
  }, [user, loading])

  return (
    <AuthContext.Provider value={value}>
      {!loading && (
        <Fragment key={String(user?.uid || 'signed-out')}>
          {children}
        </Fragment>
      )}
    </AuthContext.Provider>
  )
}
