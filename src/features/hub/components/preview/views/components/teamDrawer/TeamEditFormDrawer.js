// hub/components/preview/views/components/teamDrawer/TeamEditFormDrawer.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import TeamNameField from '../../../../../../../ui/fields/inputUi/teams/TeamNameField.js'
import TeamIfaLinkField from '../../../../../../../ui/fields/inputUi/teams/TeamIfaLinkField.js'
import TeamActiveSelector from '../../../../../../../ui/fields/checkUi/teams/TeamActiveSelector.js'
import TeamProjectSelector from '../../../../../../../ui/fields/checkUi/teams/TeamProjectSelector.js'
import ClubSelectField from '../../../../../../../ui/fields/selectUi/clubs/ClubSelectField.js'
import YearPicker from '../../../../../../../ui/fields/dateUi/YearPicker'
import TeamLeagueNameField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueNameField'
import TeamLeaguePosField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePosField'
import TeamLeaguePointsField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePointsField'
import TeamLeagueLevelField from '../../../../../../../ui/fields/inputUi/teams/TeamLeagueLevelField'
import GoalsAgainstField from '../../../../../../../ui/fields/inputUi/games/GoalsAgainstField'
import GoalsForField from '../../../../../../../ui/fields/inputUi/games/GoalsForField'

import { editDrawerSx as sx } from './sx/editDrawer.sx.js'

export default function TeamEditFormDrawer({ draft, setDraft, team, context }) {
  return (
    <Box sx={sx.content} className="dpScrollThin">
      <Box sx={sx.sectionCardSx}>
        <Typography sx={{ fontWeight: 700, px: 0.25 }}>פרטי קבוצה</Typography>

        <Box sx={{ mt: 1 }}>
          <ClubSelectField
            size="sm"
            value={team?.club?.id || team?.id || ''}
            options={context?.clubs || []}
            disabled
          />
        </Box>

        <Box sx={sx.gridInfoSx}>
          <TeamNameField
            size="sm"
            value={draft.teamName}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, teamName: value || '' }))
            }
          />

          <YearPicker
            size="sm"
            value={draft.teamYear}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, teamYear: value || '' }))
            }
          />
        </Box>

        <Box sx={{ mt: 1 }}>
          <TeamIfaLinkField
            size="sm"
            value={draft.ifaLink}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, ifaLink: value || '' }))
            }
          />
        </Box>

        <Box sx={sx.inlineChecksSx}>
          <TeamActiveSelector
            size="sm"
            value={draft.active}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, active: Boolean(value) }))
            }
          />

          <TeamProjectSelector
            size="sm"
            value={draft.project}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, project: value }))
            }
          />
        </Box>
      </Box>

      <Box sx={sx.sectionCardSx}>
        <Typography sx={{ fontWeight: 700, px: 0.25 }}>ליגה ומיקום</Typography>

        <Box sx={sx.gridLeagueTopSx}>
          <TeamLeagueNameField
            size="sm"
            value={draft.league}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, league: value || '' }))
            }
          />

          <TeamLeagueLevelField
            size="sm"
            value={draft.leagueLevel}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, leagueLevel: value || '' }))
            }
          />
        </Box>

        <Box sx={sx.gridLeagueSx}>
          <TeamLeaguePosField
            size="sm"
            value={draft.leaguePosition}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, leaguePosition: value || '' }))
            }
          />

          <TeamLeaguePointsField
            size="sm"
            value={draft.points}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, points: value || '' }))
            }
          />

          <GoalsForField
            size="sm"
            value={draft.leagueGoalsFor}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, leagueGoalsFor: value || '' }))
            }
          />

          <GoalsAgainstField
            size="sm"
            value={draft.leagueGoalsAgainst}
            onChange={(value) =>
              setDraft((prev) => ({ ...prev, leagueGoalsAgainst: value || '' }))
            }
          />
        </Box>
      </Box>
    </Box>
  )
}
