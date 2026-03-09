import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../FbConfig';
import { useNavigate } from 'react-router-dom'
import { Box, Button, Input, Typography } from '@mui/joy'
import { useAuth } from '../../AuthContext.js'

export default function AuthForm() {
  const { login, register } = useAuth()

  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        await register({
          email,
          password,
          userName,
          userRole,
          actions: {
            setAlert: (msg) => console.log('Alert:', msg),
          },
        })
        navigate('/Clubs')
      } else {
        await login({ email, password })
        navigate('/Clubs')
      }
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('איפוס נשלח למייל');
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 3,
          mt: -10,
          borderRadius: 'lg',
          boxShadow: 'md',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.body',
        }}
      >
        <Typography level="h4" textAlign="center">
          {isRegister ? 'הרשמה' : 'התחברות'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Input
              type="email"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {isRegister && (
              <>
                <Input
                  type="text"
                  placeholder="שם משתמש"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="תפקיד (לדוגמה: אנליסט)"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                />
              </>
            )}

            {error && (
              <Typography level="body-sm" color="danger">
                {error}
              </Typography>
            )}

            <Button type="submit" loading={loading}>
              {isRegister ? 'צור חשבון' : 'התחבר'}
            </Button>

            <Button variant="plain" color="neutral" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'כבר יש לי חשבון' : 'אין לך חשבון? הירשם'}
            </Button>

            <Button variant="plain" color="neutral" onClick={() => resetPassword(email)}>
              ? שכחת סיסמא
            </Button>

          </Box>
        </form>
      </Box>
    </Box>
  )
}
