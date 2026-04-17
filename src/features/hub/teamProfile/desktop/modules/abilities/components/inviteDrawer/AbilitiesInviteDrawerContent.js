// hub/playerProfile/modules/abilities/components/inviteDrawer/AbilitiesInviteDrawerContent.js

import React from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Input,
  Sheet,
  Typography,
} from '@mui/joy'

import RoleSelectField from '../../../../../../../../ui/fields/selectUi/roles/RoleSelectField.js'
import AbilitiesMultiSelectField from '../../../../../../../../ui/fields/selectUi/abilities/AbilitiesMultiSelectField.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { editDrawerSx as sx } from './sx/drawer.sx.js'
import {
  clean,
  resolveRolePhoto,
} from './logic/abilitiesInvite.logic.js'

export default function AbilitiesInviteDrawerContent({
  createdState,
  roles,
  selectedEvaluatorId,
  setSelectedEvaluatorId,
  selectedDomains,
  setSelectedDomains,
  evaluator,
  error,
  setError,
  createdLink,
  copied,
  handleCopy,
  handleWhatsapp,
  createdWhatsappText,
}) {
  return (
    <Box sx={sx.content} className="dpScrollThin">
      {!createdState ? (
        <Sheet
          variant="outlined"
          sx={{ p: 1.25, borderRadius: 'md', display: 'grid', gap: 1 }}
        >
          <Typography level="title-sm">בחירת מעריך</Typography>

          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
            המעריך נלקח מתוך אנשי הצוות של הקונטקסט והוא שדה חובה לפני יצירת קישור
          </Typography>

          <RoleSelectField
            value={selectedEvaluatorId || ''}
            onChange={(value) => {
              setSelectedEvaluatorId(clean(value))
              setError('')
            }}
            options={roles}
          />

          {evaluator ? (
            <Sheet variant="soft" sx={sx.evalSelect}>
              <Avatar src={resolveRolePhoto(evaluator.photo)} />

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography level="body-sm">{evaluator.fullName || 'ללא שם'}</Typography>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  {evaluator.type || 'איש צוות'}
                </Typography>
              </Box>

              <Chip size="sm" color="success" variant="soft">
                נבחר
              </Chip>
            </Sheet>
          ) : (
            <Typography level="body-xs" color="danger">
              יש לבחור מעריך לפני יצירת הקישור
            </Typography>
          )}

          <Box sx={{ display: 'grid', gap: 0.75 }}>
            <Typography level="title-sm">דומיינים לשליחה</Typography>

            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
              בחר אילו אזורי יכולת יופיעו למעריך בטופס
            </Typography>

            <AbilitiesMultiSelectField
              value={selectedDomains || []}
              onChange={(value) => {
                setSelectedDomains(value)
                setError('')
              }}
              placeholder="בחירת דומיינים לשליחה"
            />
          </Box>
        </Sheet>

      ) : (
        <Sheet
          variant="outlined"
          sx={{
            p: 1.25,
            borderRadius: 'md',
            display: 'grid',
            gap: 1.25,
          }}
        >
          <Sheet
            variant="soft"
            color="success"
            sx={{
              p: 1,
              borderRadius: 'md',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {iconUi({ id: 'check' })}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography level="body-sm">הקישור מוכן לשיתוף</Typography>
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                הטופס ייפתח ריק וימולא על ידי המשתמש מהטלפון
              </Typography>
            </Box>
          </Sheet>

          <Box>
            <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.tertiary' }}>
              קישור לשיתוף
            </Typography>
            <Input value={createdLink} readOnly />
          </Box>

          <Box>
            <Typography level="body-xs" sx={{ mb: 0.5, color: 'text.tertiary' }}>
              מעריך נבחר
            </Typography>

            <Sheet variant="soft" sx={sx.evalSheet}>
              <Avatar src={resolveRolePhoto(createdState?.invite?.evaluator?.photo)} />

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography level="body-sm">
                  {clean(createdState?.invite?.evaluator?.fullName) || 'ללא שם'}
                </Typography>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  {clean(createdState?.invite?.evaluator?.type) || 'איש צוות'}
                </Typography>
              </Box>
            </Sheet>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              onClick={handleWhatsapp}
              disabled={!createdWhatsappText}
              startDecorator={iconUi({ id: 'whatsapp' })}
              sx={sx.conBut}
            >
              שלח בוואטסאפ
            </Button>

            <Button
              variant="outlined"
              color="neutral"
              onClick={handleCopy}
              disabled={!createdLink}
              startDecorator={iconUi({ id: 'copy' })}
            >
              {copied ? 'הועתק' : 'העתק קישור'}
            </Button>
          </Box>
        </Sheet>
      )}

      {error ? (
        <Typography level="body-sm" color="danger">
          {error}
        </Typography>
      ) : null}
    </Box>
  )
}
