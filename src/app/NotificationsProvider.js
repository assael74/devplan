import { createContext, useContext, useMemo, useState } from 'react'
import useNotifications from '../features/notifications/hooks/useNotifications'

// תתאים את ה-import הזה לשם ההוק הקיים אצלך.
import { useAuth } from './AuthProvider'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const notificationsState = useNotifications({
    userId: user?.uid || null,
    enabled: Boolean(user?.uid),
  })

  const value = useMemo(() => {
    return {
      ...notificationsState,
      open,
      setOpen,
      openNotifications: () => setOpen(true),
      closeNotifications: () => setOpen(false),
      toggleNotifications: () => setOpen((prev) => !prev),
    }
  }, [notificationsState, open])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext)

  if (!context) {
    throw new Error('useNotificationsContext must be used inside NotificationsProvider')
  }

  return context
}
