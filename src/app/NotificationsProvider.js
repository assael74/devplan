import { useEffect } from 'react'
import { enableFcm } from '../fcmClient'
import { useAuth } from './AuthProvider'

export function NotificationsProvider({ children }) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return

    enableFcm({
      userId: user.uid,
      vapidKey:
        'BEGyEar2xKum8iOCEJVV96F4m5amZsdXEtdKzFKH0kZe6bkF_OC0yElFoidJl5brU2hRFjb0mKi6hooXs6nrDOk',
    }).catch(console.error)
  }, [user?.uid])

  return children
}
