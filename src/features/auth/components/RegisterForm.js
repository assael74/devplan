// src/features/auth/components/RegisterForm.js

import React, { useMemo, useState } from 'react'
import { Alert, Button, FormControl, FormLabel, Input, Link, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../app/AuthProvider'
import { authSx } from '../auth.sx'
import { buildRegisterModel, isRegisterDisabled, normalizeAuthError } from '../auth.logic'

export default function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [model, setModel] = useState(buildRegisterModel())
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const disabled = useMemo(() => isRegisterDisabled(model, pending), [model, pending])

  const setField = (key, value) => {
    setModel(prev => ({ ...prev, [key]: value }))
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

      await register({
        fullName: model.fullName,
        phone: model.phone,
        email: model.email,
        password: model.password,
      })

      setSuccess('ההרשמה התקבלה. הגישה תיפתח לאחר אישור מנהל.')
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
        <FormLabel>שם מלא</FormLabel>
        <Input
          value={model.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
          placeholder="שם מלא"
          autoComplete="name"
          autoFocus
        />
      </FormControl>

      <FormControl>
        <FormLabel>טלפון</FormLabel>
        <Input
          value={model.phone}
          onChange={(e) => setField('phone', e.target.value)}
          placeholder="050-0000000"
          autoComplete="tel"
        />
      </FormControl>

      <FormControl>
        <FormLabel>אימייל</FormLabel>
        <Input
          type="email"
          value={model.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="name@example.com"
          autoComplete="email"
        />
      </FormControl>

      <FormControl>
        <FormLabel>סיסמה</FormLabel>
        <Input
          type="password"
          value={model.password}
          onChange={(e) => setField('password', e.target.value)}
          placeholder="לפחות 6 תווים"
          autoComplete="new-password"
        />
      </FormControl>

      <FormControl>
        <FormLabel>אימות סיסמה</FormLabel>
        <Input
          type="password"
          value={model.confirmPassword}
          onChange={(e) => setField('confirmPassword', e.target.value)}
          placeholder="הזן שוב את הסיסמה"
          autoComplete="new-password"
        />
      </FormControl>

      <Typography level="body-sm" sx={{ opacity: 0.7 }}>
        ההרשמה אינה פותחת גישה מיידית. מנהל המערכת יאשר את המשתמש וישייך אותו לקבוצה.
      </Typography>

      <Button loading={pending} disabled={disabled} type="submit" sx={authSx.submitBtn}>
        הרשמה
      </Button>

      <Link
        component="button"
        type="button"
        underline="hover"
        onClick={() => navigate('/login')}
      >
        כבר יש לי משתמש
      </Link>
    </form>
  )
}
