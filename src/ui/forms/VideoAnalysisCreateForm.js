// ui/forms/VideoAnalysisCreateForm.js
import React, { useEffect, useMemo } from 'react'
import{ Box, Sheet, Divider, Typography } from '@mui/joy'

import { vaSx } from './sx/form.sx.js'
import { getVideoModes, getVideoDisabled } from './helpers/videoForm.helpers.js'
import { iconUi } from '../core/icons/iconUi.js'

import VideoLinkField from '../fields/inputUi/videos/VideoLinkField'
import VideoNameField from '../fields/inputUi/videos/VideoNameField'
import YearPicker from '../fields/dateUi/YearPicker.js'
import MonthPicker from '../fields/dateUi/MonthPicker.js'
import MeetingSelectField from '../fields/selectUi/meetings/MeetingSelectField.js'
import TeamSelectField from '../fields/selectUi/teams/TeamSelectField.js'
import PlayerSelectField from '../fields/selectUi/players/PlayerSelectField.js'
import VideoObjectTypeSelectField from '../fields/selectUi/videos/videoAnalysis/VideoObjectTypeSelectField.js'
import VideoContextTypeSelectField from '../fields/selectUi/videos/videoAnalysis/VideoContextTypeSelectField.js'

import {
  VIDEOANALYSIS_OBJECTTYPES,
  VIDEOANALYSIS_CONTEXTTYPES,
} from '../../shared/videoAnalysis/videoAnalysis.constants.js'

const clean = (v) => String(v ?? '').trim()

export default function VideoAnalysisCreateForm({ draft, onDraft, onValidChange, context }) {
  const {
    name = '',
    link = '',
    contextType = '',
    objectType = '',
    year = '',
    month = '',
    meetingId = '',
    teamId = '',
    playerId = '',
  } = draft

  const hasContext = !!context
  const locks = draft?.__locks || {}
  const expected = locks?.expected || {}

  const { isMeetingMode, isEntityMode, isFloating } = useMemo(
    () => getVideoModes(contextType),
    [contextType]
  )

  const disabled = useMemo(
    () => getVideoDisabled(contextType, objectType, hasContext, locks),
    [contextType, objectType, hasContext, locks]
  )

  const showLockNote = !!(
    locks?.lockContextType ||
    locks?.lockObjectType ||
    locks?.lockMeetingId ||
    locks?.lockPlayerId ||
    locks?.lockTeamId
  )

  useEffect(() => {
    const hasLocks = !!locks && Object.keys(locks).length > 0
    if (!hasLocks) return

    const next = { ...draft }
    let changed = false

    if (locks.lockContextType && expected.contextType && next.contextType !== expected.contextType) {
      next.contextType = expected.contextType
      changed = true
    }

    if (locks.lockObjectType && expected.objectType && next.objectType !== expected.objectType) {
      next.objectType = expected.objectType
      changed = true
    }

    if (locks.lockPlayerId && expected.playerId && next.playerId !== expected.playerId) {
      next.playerId = expected.playerId
      changed = true
    }

    if (locks.lockTeamId && expected.teamId && next.teamId !== expected.teamId) {
      next.teamId = expected.teamId
      changed = true
    }

    if (locks.lockMeetingId && expected.meetingId && next.meetingId !== expected.meetingId) {
      next.meetingId = expected.meetingId
      changed = true
    }

    if (changed) onDraft(next)
  }, [
    draft,
    onDraft,
    locks,
    expected?.contextType,
    expected?.objectType,
    expected?.playerId,
    expected?.teamId,
    expected?.meetingId,
  ])

  // Clean dependent fields by mode
  useEffect(() => {
    if (isMeetingMode) {
      if (objectType !== 'meeting' || teamId || playerId) {
        onDraft({ ...draft, objectType: 'meeting', teamId: null, playerId: null })
      }
      return
    }

    if (isEntityMode) {
      if (meetingId) {
        onDraft({ ...draft, meetingId: null })
        return
      }
      if (!objectType || objectType === 'meeting') {
        onDraft({ ...draft, objectType: 'player', teamId: null, playerId: null })
        return
      }
      if (objectType === 'player' && teamId) {
        onDraft({ ...draft, teamId: null })
        return
      }
      if (objectType === 'team' && playerId) {
        onDraft({ ...draft, playerId: null })
        return
      }
      return
    }

    if (isFloating) {
      if (objectType || meetingId || teamId || playerId) {
        onDraft({ ...draft, objectType: '', meetingId: null, teamId: null, playerId: null })
      }
    }
  }, [contextType, objectType])

  const objectTypeOptions = useMemo(() => {
    if (contextType === 'meeting') return VIDEOANALYSIS_OBJECTTYPES.filter((o) => o.id === 'meeting')
    if (contextType === 'entity')
      return VIDEOANALYSIS_OBJECTTYPES.filter((o) => o.id === 'player' || o.id === 'team')
    return VIDEOANALYSIS_OBJECTTYPES
  }, [contextType])

  const contextTypeOptions = useMemo(() => VIDEOANALYSIS_CONTEXTTYPES, [])

  const validity = useMemo(() => {
    const okLink = !!clean(link)
    const okName = !!clean(name)
    const okContext = !!clean(contextType)
    const okYear = !!year
    const okMonth = !!month

    if (!(okLink && okName && okContext && okYear && okMonth)) return { isValid: false }

    if (contextType === 'floating') return { isValid: true }
    if (contextType === 'meeting') return { isValid: !!clean(meetingId) }

    const okObject = !!clean(objectType) && objectType !== 'meeting'
    if (!okObject) return { isValid: false }

    if (objectType === 'player') return { isValid: !!clean(playerId) }
    if (objectType === 'team') return { isValid: !!clean(teamId) }

    return { isValid: false }
  }, [link, name, contextType, objectType, year, month, meetingId, teamId, playerId])

  useEffect(() => {
    onValidChange(validity.isValid)
  }, [validity.isValid, onValidChange])

  return (
    <Box sx={vaSx.root}>
      {/* Basic */}
      <Box sx={vaSx.grid2}>
        <Box sx={vaSx.cell}>
          <VideoNameField value={name} onChange={(v) => onDraft({ ...draft, name: v })} required />
        </Box>
        <Box sx={vaSx.cell}>
          <VideoLinkField value={link} onChange={(v) => onDraft({ ...draft, link: v })} required />
        </Box>
      </Box>

      <Divider sx={vaSx.divider}>
        <Typography level="body-sm">שיוך הוידאו</Typography>
      </Divider>

      {showLockNote && (
        <Sheet variant="soft" color="warning" sx={vaSx.showLo} >
          {iconUi({ id: 'lock' })}
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
            השיוך נקבע לפי מקור הפתיחה ולא ניתן לשינוי
          </Typography>
        </Sheet>
      )}

      {/* Context + Object */}
      <Box sx={vaSx.grid2}>
        <Box sx={vaSx.cell}>
          <VideoContextTypeSelectField
            required
            value={contextType}
            disabled={!!locks.lockContextType}
            onChange={(v) => onDraft({ ...draft, contextType: v, objectType: '', meetingId: null, teamId: null, playerId: null })}
            options={contextTypeOptions}
          />
        </Box>

        <Box sx={vaSx.cell}>
          <VideoObjectTypeSelectField
            required
            value={objectType}
            onChange={(v) => onDraft({ ...draft, objectType: v })}
            options={objectTypeOptions}
            disabled={disabled.disableObjectType}
            readOnly={isMeetingMode || !!locks.lockObjectType}
          />
        </Box>
      </Box>

      <Box sx={vaSx.grid3}>
        <Box sx={vaSx.cell}>
          <MeetingSelectField
            value={meetingId || ''}
            onChange={(v) => onDraft({ ...draft, meetingId: v })}
            options={context?.meetings || []}
            context={context}
            disabled={disabled.disableMeeting}
            required={isMeetingMode}
          />
        </Box>

        <Box sx={vaSx.cell}>
          <PlayerSelectField
            value={playerId || ''}
            onChange={(v) => onDraft({ ...draft, playerId: v })}
            context={context}
            options={context?.players}
            disabled={disabled.disablePlayer}
            required={isEntityMode && objectType === 'player'}
          />
        </Box>

        <Box sx={vaSx.cell}>
          <TeamSelectField
            value={teamId || ''}
            onChange={(v) => onDraft({ ...draft, teamId: v })}
            context={context}
            options={context?.teams}
            clubId={draft?.clubId || ''}
            disabled={disabled.disableTeam}
            required={isEntityMode && objectType === 'team'}
          />
        </Box>
      </Box>

      <Divider sx={vaSx.divider}>
        <Typography level="body-sm">זמנים</Typography>
      </Divider>

      {/* Time */}
      <Box sx={vaSx.grid2}>
        <Box sx={vaSx.cell}>
          <YearPicker value={year} onChange={(v) => onDraft({ ...draft, year: v })} />
        </Box>
        <Box sx={vaSx.cell}>
          <MonthPicker value={month} onChange={(v) => onDraft({ ...draft, month: v })} />
        </Box>
      </Box>
    </Box>
  )
}
