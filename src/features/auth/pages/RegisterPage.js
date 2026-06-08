// src/features/auth/pages/RegisterPage.js

import React from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../../app/AuthProvider'
import AuthShell from '../components/AuthShell'
import RegisterForm from '../components/RegisterForm'

export default function RegisterPage() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/home" replace />

  return (
    <AuthShell
      title="הרשמה למערכת"
      subtitle="יצירת משתמש חיצוני. הגישה תיפתח לאחר אישור מנהל."
    >
      <RegisterForm />
    </AuthShell>
  )
}
