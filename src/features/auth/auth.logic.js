export function buildLoginModel() {
  return {
    email: '',
    password: '',
  }
}

export function buildForgotPasswordModel() {
  return {
    email: '',
  }
}

export function normalizeAuthError(error) {
  const code = String(error?.code || '')

  const map = {
    'auth/invalid-email': 'כתובת האימייל אינה תקינה.',
    'auth/missing-password': 'יש להזין סיסמה.',
    'auth/invalid-credential': 'אימייל או סיסמה שגויים.',
    'auth/user-not-found': 'לא נמצא משתמש עם האימייל הזה.',
    'auth/wrong-password': 'הסיסמה שגויה.',
    'auth/too-many-requests': 'בוצעו יותר מדי ניסיונות. נסה שוב מאוחר יותר.',
    'auth/network-request-failed': 'בעיית רשת. בדוק חיבור ונסה שוב.',
  }

  return map[code] || 'הפעולה נכשלה. נסה שוב.'
}

export function isLoginDisabled(model, pending) {
  if (pending) return true
  const email = String(model?.email || '').trim()
  const password = String(model?.password || '')
  return !email || !password
}

export function isForgotPasswordDisabled(model, pending) {
  if (pending) return true
  const email = String(model?.email || '').trim()
  return !email
}
