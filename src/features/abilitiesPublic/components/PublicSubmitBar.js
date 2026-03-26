import React from 'react'
import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Sheet from '@mui/joy/Sheet'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

export default function PublicSubmitBar({ form }) {
  const { ready, handleSubmit, submitting, submitError } = form

  return (
    <Sheet
      variant="solid"
      color="neutral"
      invertedColors
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        borderTopLeftRadius: 'md',
        borderTopRightRadius: 'md',
        boxShadow: 'lg',
      }}
    >
      <Box sx={{ maxWidth: 720, mx: 'auto', px: 1.5, py: 1.25 }}>
        <Stack spacing={1}>
          {submitError ? (
            <Typography level="body-xs" color="danger">
              {submitError}
            </Typography>
          ) : null}

          <Button
            size="lg"
            fullWidth
            loading={submitting}
            disabled={!ready || submitting}
            onClick={handleSubmit}
          >
            שליחת הטופס
          </Button>
        </Stack>
      </Box>
    </Sheet>
  )
}
