import React from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../../app/AuthProvider'
import AuthShell from '../components/AuthShell'
import LoginForm from '../components/LoginForm'

export default function LoginPage() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/hub" replace />

  return (
    <AuthShell
      title="התחברות למערכת"
      subtitle="התחבר כדי לגשת למרכז השליטה ולנתוני המערכת."
    >
      <LoginForm />
    </AuthShell>
  )
}
