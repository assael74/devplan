// src/features/hub/teamProfile/modules/management/TeamManagementInfoCard.js

import React from 'react'
import { Box, Sheet, Typography, Button, Chip, Divider } from '@mui/joy'

import TeamNameField from '../../../../../../../ui/fields/inputUi/teams/TeamNameField.js'
import TeamIfaLinkField from '../../../../../../../ui/fields/inputUi/teams/TeamIfaLinkField.js'
import TeamActiveSelector from '../../../../../../../ui/fields/checkUi/teams/TeamActiveSelector.js'
import TeamProjectSelector from '../../../../../../../ui/fields/checkUi/teams/TeamProjectSelector.js'
import ClubNameField from '../../../../../../../ui/fields/inputUi/clubs/ClubNameField.js'
import YearPicker from '../../../../../../../ui/fields/dateUi/YearPicker'

import TeamLeagueNameField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueNameField'
import TeamLeaguePosField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePosField'
import TeamLeaguePointsField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePointsField'
import TeamLeagueLevelField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueLevelField'
import GoalsAgainstField from '../../../../../../../ui/fields/inputUi/games/GoalsAgainstField'
import GoalsForField from '../../../../../../../ui/fields/inputUi/games/GoalsForField'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi'

import { teamManagementModuleSx as sx } from '../sx/teamManagement.module.sx.js'

export default function TeamManagementInfoCard({
  draft,
  clubName,
  isDirty,
  canSave,
  onDraft,
  onConfirm,
  onReset,
  pending,
}) {
  return (
    <Sheet variant="soft" sx={sx.card}>
      {/* ✅ header: title + dirty + actions right */}
      <Box sx={sx.cardHeader}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Typography level="title-sm" sx={{ whiteSpace: 'nowrap' }}>
            ניהול קבוצה
          </Typography>
          {isDirty ? (
            <Chip size="sm" variant="soft" color="warning">
              לא נשמר
            </Chip>
          ) : null}
        </Box>

        <Box sx={sx.actions}>
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            disabled={!isDirty}
            onClick={onReset}
            startDecorator={iconUi({id: 'reset'})}
          >
            איפוס
          </Button>
          <Button
            size="sm"
            variant="solid"
            disabled={pending || !isDirty}
            onClick={onConfirm}
            loading={pending}
            sx={sx.confBtn}
            startDecorator={iconUi({id: 'save'})}
          >
            אישור
          </Button>
        </Box>
      </Box>

      <Box sx={sx.firstRow}>
        <Box sx={sx.chipsRow}>
          <TeamActiveSelector
            value={draft.active}
            onChange={(v) => onDraft({ ...draft, active: v })}
          />
          <TeamProjectSelector
            value={draft.project}
            onChange={(v) => onDraft({ ...draft, project: v })}
          />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <YearPicker
            label="שנתון"
            size='sm'
            value={draft.teamYear}
            onChange={(v) => onDraft({ ...draft, teamYear: v })}
            range={{ past: 20, future: 0 }}
            size="sm"
          />
        </Box>
      </Box>

      <Box sx={sx.secondRow}>
        <TeamNameField
          value={draft.teamName}
          size='sm'
          onChange={(v) => onDraft({ ...draft, teamName: v })}
        />

        <ClubNameField
          value={clubName}
          onChange={() => {}}
          readOnly
          required
          disabled={false}
          helperText=""
        />
      </Box>

      <Box sx={sx.thirdRow}>
        <TeamIfaLinkField
          value={draft.ifaLink}
          onChange={(v) => onDraft({ ...draft, ifaLink: v })}
        />
      </Box>

      <Divider sx={{ my: 2 }}>
        <Typography level="body-sm" sx={{ fontWeight: 700 }}>
          המצב בליגה
        </Typography>
      </Divider>

      <Box sx={sx.fourthRow}>
        <TeamLeagueNameField
          value={draft.league || ''}
          size="sm"
          onChange={(v) => onDraft({ ...draft, league: v })}
        />

        <TeamLeagueLevelField
          value={draft.leagueLevel || ''}
          size="sm"
          onChange={(v) => onDraft({ ...draft, leagueLevel: v })}
        />

        <TeamLeaguePosField
          value={draft.leaguePosition || ''}
          size="sm"
          onChange={(v) => onDraft({ ...draft, leaguePosition: v })}
        />
      </Box>

      <Box sx={sx.fifthRow}>
        <TeamLeaguePointsField
          value={draft.points || ''}
          size="sm"
          onChange={(v) => onDraft({ ...draft, points: v })}
        />

        <GoalsForField
          value={draft.leagueGoalsFor ?? ''}
          size="sm"
          onChange={(v) => onDraft({ ...draft, leagueGoalsFor: v })}
        />

        <GoalsAgainstField
          value={draft.leagueGoalsAgainst ?? ''}
          size="sm"
          onChange={(v) => onDraft({ ...draft, leagueGoalsAgainst: v })}
        />
      </Box>
    </Sheet>
  )
}
