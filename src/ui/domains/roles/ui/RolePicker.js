// src/ui/domains/roles/ui/RolePicker.js

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  Drawer,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Avatar,
  Box,
  Typography,
  Chip,
  Sheet,
  Divider,
} from '@mui/joy'

import SearchRounded from '@mui/icons-material/SearchRounded'
import roleImage from '../../../core/images/roleImage.png'
import { iconUi } from '../../../core/icons/iconUi.js'
import { STAFF_ROLE_OPTIONS } from '../../../../shared/roles/roles.constants.js'
import { rolesSx } from './roles.sx.js'

const asArray = (v) => (Array.isArray(v) ? v : [])
const norm = (v) => String(v ?? '').trim().toLowerCase()

const roleLabelMap = new Map(STAFF_ROLE_OPTIONS.map((r) => [r.id, r.labelH]))
const roleIconMap = new Map(STAFF_ROLE_OPTIONS.map((r) => [r.id, r.idIcon]))

export default function RolePicker({
  open,
  onClose,
  roles = [],
  excludeIds = [],
  onSelect,
  loading = false,
  disabled = false,
  title = 'הוספת איש צוות',
  subtitle = '',
}) {
  const [q, setQ] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)

  useEffect(() => {
    if (!open) {
      setQ('')
      setSelectedRole(null)
    }
  }, [open])

  const excludeSet = useMemo(
    () => new Set(asArray(excludeIds).map((x) => String(x))),
    [excludeIds]
  )

  const available = useMemo(() => {
    return asArray(roles).filter((role) => {
      const id = String(role?.id ?? '')
      return id && !excludeSet.has(id)
    })
  }, [roles, excludeSet])

  const filtered = useMemo(() => {
    const query = norm(q)
    if (!query) return available

    return available.filter((role) => {
      const roleType = String(role?.type ?? '')
      const roleLabel = roleLabelMap.get(roleType) || ''

      const haystack = [
        role?.fullName,
        role?.phone,
        role?.email,
        roleType,
        roleLabel,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [available, q])

  const handleClose = useCallback(() => {
    if (loading) return
    onClose?.()
  }, [loading, onClose])

  const handlePick = useCallback((role) => {
    setSelectedRole(role)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!selectedRole || loading) return
    onSelect?.(selectedRole)
  }, [selectedRole, loading, onSelect])

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
      size="md"
      slotProps={{
        content: {
          sx: rolesSx.drawerContent,
        },
      }}
    >
      <Sheet variant="solid" sx={rolesSx.drawerPanel}>
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={rolesSx.modalTitleWrap}>
            <Box sx={{ minWidth: 0 }}>
              <Typography level="title-md" sx={rolesSx.modalTitle}>
                {title}
              </Typography>

              {!!subtitle && (
                <Typography level="body-xs" sx={rolesSx.modalSubTitle}>
                  {subtitle}
                </Typography>
              )}
            </Box>

            <Chip size="sm" variant="soft" sx={rolesSx.modalCountChip}>
              {filtered.length}
            </Chip>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={rolesSx.modalContent}>
          <Input
            size="sm"
            placeholder="חיפוש לפי שם / טלפון / אימייל / תפקיד"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            startDecorator={<SearchRounded />}
            disabled={disabled || loading}
            sx={rolesSx.modalSearch}
          />

          <Box className="dpScrollThin" sx={rolesSx.modalList}>
            {filtered.map((role) => {
              const id = String(role?.id ?? '')
              const type = String(role?.type ?? '')
              const selected = selectedRole?.id === role?.id
              const roleLabel = roleLabelMap.get(type) || type || 'ללא תפקיד'
              const roleIcon = roleIconMap.get(type) || 'role'
              const sub = [role?.phone, role?.email].filter(Boolean).join(' • ')

              return (
                <Box
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handlePick(role)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handlePick(role)
                  }}
                  sx={rolesSx.modalRow(selected)}
                >
                  <Avatar
                    src={role?.photo || roleImage}
                    alt={role?.fullName || ''}
                    sx={rolesSx.modalAvatar}
                  >
                    {!role?.photo ? String(role?.fullName || '').slice(0, 1) : null}
                  </Avatar>

                  <Box sx={rolesSx.modalRowMain}>
                    <Box sx={rolesSx.modalRowTop}>
                      <Typography level="body-sm" noWrap sx={rolesSx.modalRowName}>
                        {role?.fullName || '—'}
                      </Typography>

                      <Chip
                        size="sm"
                        variant="soft"
                        startDecorator={iconUi({ id: roleIcon })}
                        sx={rolesSx.modalRoleChip}
                      >
                        {roleLabel}
                      </Chip>
                    </Box>

                    {!!sub && (
                      <Typography level="body-xs" noWrap sx={rolesSx.modalRowMeta}>
                        {sub}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={rolesSx.modalRowCheck}>
                    {selected ? iconUi({ id: 'selected' }) : null}
                  </Box>
                </Box>
              )
            })}

            {!filtered.length && (
              <Box sx={rolesSx.modalEmpty}>
                <Typography level="body-sm">אין תוצאות לחיפוש.</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={rolesSx.modalActions}>
          <Button
            variant="soft"
            onClick={handleClose}
            disabled={loading}
            sx={rolesSx.closeBtn}
          >
            סגירה
          </Button>

          <Button
            loading={loading}
            disabled={!selectedRole || loading}
            onClick={handleConfirm}
            sx={rolesSx.conBtn}
          >
            הוספה
          </Button>
        </DialogActions>
      </Sheet>
    </Drawer>
  )
}
