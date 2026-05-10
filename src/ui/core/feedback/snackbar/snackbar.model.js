// src/ui/snackbar/snackbar.model.js

export const SNACK_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
}

export const SNACK_ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
}

export const SNACK_ENTITY = {
  PLAYER: 'player',
  TEAM: 'team',
  CLUB: 'club',
  MEETING: 'meeting',
  PAYMENT: 'payment',
  VIDEO: 'video',
}

export const DEFAULT_DURATIONS = {
  success: 2200,
  error: 8000, // אפשר להפוך ל-null כדי שלא ייסגר אוטומטית
}

export const DEFAULTS = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
  maxSnack: 3, // כמה לשמור בתור (תצוגה בפועל אחד אחד)
  dedupeWindowMs: 1500,
}
