// src/ui/forms/ui/roles/RoleAccessPanel.js

import React from 'react'
import { Box, Checkbox, FormControl, FormHelperText, FormLabel, Input, Option, Select, Typography } from '@mui/joy'

import { useAuth } from '../../../../app/AuthProvider.js'

import {
  MODULE_ROLE_OPTIONS,
  ROLE_STATUS_OPTIONS,
  SYSTEM_ACCESS_OPTIONS,
} from './roleForm.logic.js'

export default function RoleAccessPanel({ draft, setDraft }) {
  const { user } = useAuth()
  const simulator = draft?.moduleAccess?.squadSimulator || {}

  const isOwnRole = Boolean(
    user?.uid &&
    draft?.authUid &&
    String(user.uid) === String(draft.authUid)
  )

  const isSelfAdmin = Boolean(
    isOwnRole &&
    String(draft?.systemAccess?.level || '') === 'admin'
  )

  const setStatus = (value) => {
    setDraft(prev => ({ ...prev, status: value || 'pending' }))
  }

  const setAuthUid = (value) => {
    setDraft(prev => ({ ...prev, authUid: value }))
  }

  const setSystemLevel = (value) => {
    if (isSelfAdmin) return

    setDraft(prev => ({
      ...prev,
      systemAccess: {
        ...(prev.systemAccess || {}),
        level: value || '',
      },
    }))
  }

  const setSimulatorEnabled = (checked) => {
    setDraft(prev => ({
      ...prev,
      moduleAccess: {
        ...(prev.moduleAccess || {}),
        squadSimulator: {
          ...(prev.moduleAccess?.squadSimulator || {}),
          enabled: checked,
          role: prev.moduleAccess?.squadSimulator?.role || 'owner',
        },
      },
    }))
  }

  const setSimulatorRole = (value) => {
    setDraft(prev => ({
      ...prev,
      moduleAccess: {
        ...(prev.moduleAccess || {}),
        squadSimulator: {
          ...(prev.moduleAccess?.squadSimulator || {}),
          role: value || 'owner',
        },
      },
    }))
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      <Typography level="title-sm">
        הרשאות וגישה למערכת
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 0.75,
        }}
      >
        <FormControl>
          <FormLabel>סטטוס אישור</FormLabel>
          <Select
            size="sm"
            value={draft.status || 'pending'}
            onChange={(_, value) => setStatus(value)}
          >
            {ROLE_STATUS_OPTIONS.map(opt => (
              <Option key={opt.id} value={opt.id}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl disabled={isSelfAdmin}>
          <FormLabel>הרשאת מערכת</FormLabel>
          <Select
            size="sm"
            value={draft?.systemAccess?.level || ''}
            onChange={(_, value) => setSystemLevel(value)}
          >
            {SYSTEM_ACCESS_OPTIONS.map(opt => (
              <Option key={opt.id} value={opt.id}>
                {opt.label}
              </Option>
            ))}
          </Select>

          {isSelfAdmin ? (
            <FormHelperText>
              לא ניתן להסיר הרשאת מנהל מהמשתמש המחובר.
            </FormHelperText>
          ) : null}
        </FormControl>

        <FormControl>
          <FormLabel>Firebase UID</FormLabel>
          <Input
            size="sm"
            value={draft.authUid || ''}
            onChange={(e) => setAuthUid(e.target.value)}
            placeholder="authUid של המשתמש המחובר — אופציונלי"
          />
        </FormControl>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 0.75,
          p: 0.75,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 10,
          bgcolor: 'background.level1',
        }}
      >
        <Checkbox
          checked={Boolean(simulator.enabled)}
          onChange={(e) => setSimulatorEnabled(e.target.checked)}
          label="פתיחת סימולטור בניית סגל"
        />

        <FormControl disabled={!simulator.enabled}>
          <FormLabel>תפקיד במודול</FormLabel>
          <Select
            size="sm"
            value={simulator.role || 'owner'}
            onChange={(_, value) => setSimulatorRole(value)}
          >
            {MODULE_ROLE_OPTIONS.map(opt => (
              <Option key={opt.id} value={opt.id}>
                {opt.label}
              </Option>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  )
}
