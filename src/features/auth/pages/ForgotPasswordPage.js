import React from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../../app/AuthProvider'
import AuthShell from '../components/AuthShell'
import ForgotPasswordForm from '../components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/hub" replace />

  return (
    <AuthShell
      title="איפוס סיסמה"
      subtitle="הזן את כתובת האימייל שלך ונשלח קישור לאיפוס סיסמה."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
