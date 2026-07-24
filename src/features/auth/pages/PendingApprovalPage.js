// src/features/auth/pages/PendingApprovalPage.js

import React from 'react'
import { Box, Button, Sheet, Typography } from '@mui/joy'

import { useAuth } from '../index.js'

export default function PendingApprovalPage() {
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: 'background.body',
      }}
    >
      <Sheet
        sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 20,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.surface',
          boxShadow: 'sm',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography level="h3">
          ממתין לאישור מנהל
        </Typography>

        <Typography level="body-md" sx={{ mt: 1.5, opacity: 0.75 }}>
          ההרשמה התקבלה, אך הגישה למערכת תיפתח רק לאחר שיוך לקבוצה ומתן הרשאות.
        </Typography>

        {user?.email ? (
          <Typography level="body-sm" sx={{ mt: 1.5, opacity: 0.65 }}>
            {user.email}
          </Typography>
        ) : null}

        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={handleLogout}
          sx={{ mt: 3 }}
        >
          התנתקות
        </Button>
      </Sheet>
    </Box>
  )
}
