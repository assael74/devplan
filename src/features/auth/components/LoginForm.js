import React, { useMemo, useState } from 'react'
import { Alert, Button, FormControl, FormLabel, Input, Link, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../app/AuthProvider'
import { authSx } from '../auth.sx'
import { buildLoginModel, isLoginDisabled, normalizeAuthError } from '../auth.logic'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [model, setModel] = useState(buildLoginModel())
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const disabled = useMemo(() => isLoginDisabled(model, pending), [model, pending])

  const setField = (key, value) => {
    setModel((prev) => ({ ...prev, [key]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (disabled) return

    try {
      setPending(true)
      setError('')
      await login({
        email: model.email,
        password: model.password,
      })
      navigate('/hub', { replace: true })
    } catch (err) {
      setError(normalizeAuthError(err))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {error ? <Alert color="danger">{error}</Alert> : null}

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

      <FormControl>
        <FormLabel>סיסמה</FormLabel>
        <Input
          type="password"
          value={model.password}
          onChange={(e) => setField('password', e.target.value)}
          placeholder="הזן סיסמה"
          autoComplete="current-password"
        />
      </FormControl>

      <div style={authSx.helperRow}>
        <Typography level="body-sm" sx={{ opacity: 0.7 }}>
          גישה למרכז השליטה למשתמשים מורשים בלבד
        </Typography>

        <Link
          component="button"
          type="button"
          onClick={() => navigate('/forgot-password')}
          underline="hover"
        >
          שכחתי סיסמה
        </Link>
      </div>

      <Button loading={pending} disabled={disabled} type="submit" sx={authSx.submitBtn}>
        התחברות
      </Button>
    </form>
  )
}
