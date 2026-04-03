import React, { useMemo, useState } from 'react'
import { Alert, Button, FormControl, FormLabel, Input, Link } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../app/AuthProvider'
import { authSx } from '../auth.sx'
import { buildForgotPasswordModel, isForgotPasswordDisabled, normalizeAuthError } from '../auth.logic'
import { authApi } from '../../../services/auth/auth.api'

export default function ForgotPasswordForm() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [model, setModel] = useState(() => ({
    ...buildForgotPasswordModel(),
    email: user?.email || '',
  }))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const disabled = useMemo(() => isForgotPasswordDisabled(model, pending), [model, pending])

  const setField = (key, value) => {
    setModel((prev) => ({ ...prev, [key]: value }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (disabled) return

    try {
      setPending(true)
      setError('')
      setSuccess('')
      await authApi.resetPassword({ email: model.email })
      setSuccess('קישור לאיפוס סיסמה נשלח לאימייל שהוזן.')
    } catch (err) {
      setError(normalizeAuthError(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error ? <Alert color="danger">{error}</Alert> : null}
      {success ? <Alert color="success">{success}</Alert> : null}

      <FormControl>
        <FormLabel>אימייל</FormLabel>
        <Input
          type="email"
          value={model.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
          autoFocus
        />
      </FormControl>

      <Button loading={pending} disabled={disabled} type="submit" sx={authSx.submitBtn}>
        שלח קישור לאיפוס
      </Button>

      <Link
        component="button"
        type="button"
        underline="hover"
        onClick={() => navigate('/login')}
      >
        חזרה להתחברות
      </Link>
    </form>
  )
}
