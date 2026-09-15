import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/joy'

import { LeaguePath } from '../../../components/club/ClubInsightPrimitives.js'
import DataTable from '../../../components/tables/dataTable/index.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import JsonViewerModal from '../../../components/modals/JsonViewerModal.js'
import {
  getTeamById,
  readClubPageDocument,
} from '../../../../services/read/index.js'
import { downloadJson } from '../logic/clubsMasterDownload.logic.js'
import { buildClubExpandedTeamColumns } from '../logic/clubExpandedTeamTable.columns.js'
import { buildClubExpandedModel } from '../../../../model/pages/clubPresentation.model.js'
import {
  getClubCollapseView,
} from '../../../../domain/clubIntelligence/index.js'
import { clubsPageSx as sx } from '../sx/clubsPage.sx.js'

function ClubTeamsTable({ title, teams, onOpenTeam, onOpenTeamDocumentJson }) {
  if (!teams.length) return null
  const columns = buildClubExpandedTeamColumns({
    onOpenTeam,
    onOpenTeamDocumentJson,
    sx,
  })

  return (
    <Box sx={sx.teamTableSection}>
      {title ? (
        <Typography level='title-sm' sx={sx.teamTableTitle}>
          {title}
        </Typography>
      ) : null}
      <DataTable
        columns={columns}
        rows={teams}
        getRowKey={team => team.teamId}
        wrapSx={sx.expandedTableWrap}
        tableSx={sx.expandedTable}
      />
    </Box>
  )
}

export default function ClubExpandedRow({
  club,
  model,
  onOpenTeam,
  onOpenClub,
}) {
  const [clubDocumentJson, setClubDocumentJson] = useState(null)
  const [clubMasterEntryJson, setClubMasterEntryJson] = useState(null)
  const [teamDocumentJson, setTeamDocumentJson] = useState(null)
  const [openSecondaryLeaguePaths, setOpenSecondaryLeaguePaths] = useState({})
  const [seasonView, setSeasonView] = useState('current')
  const collapseView = useMemo(() => getClubCollapseView(model.intelligence), [model.intelligence])
  const selectedSeasonModel = useMemo(() => buildClubExpandedModel({
    teams: seasonView === 'previous'
      ? collapseView.previousTeams
      : collapseView.currentTeams,
    seasonKey: (model.seasonOptions || []).find(option => option.value === seasonView)?.seasonKey,
    levelSpotlights: collapseView.spotlightGroups.leagueVsClubLevel,
  }), [collapseView, model.seasonOptions, seasonView])

  const handleOpenClubDocumentJson = async () => {
    setClubDocumentJson({ data: { status: 'loading' } })

    try {
      const document = await readClubPageDocument({ clubId: club?.clubId })
      setClubDocumentJson({
        data: document || { error: 'מסמך המועדון הקנוני לא נמצא' },
      })
    } catch (error) {
      setClubDocumentJson({
        data: { error: error?.message || 'טעינת מסמך המועדון הקנוני נכשלה' },
      })
    }
  }

  const handleOpenTeamDocumentJson = async team => {
    setTeamDocumentJson({ team, data: { status: 'loading' } })
    try {
      const document = await getTeamById(team?.teamId)
      setTeamDocumentJson({
        team,
        data: document || { error: 'מסמך הקבוצה הקנוני לא נמצא' },
      })
    } catch (error) {
      setTeamDocumentJson({
        team,
        data: { error: error?.message || 'טעינת מסמך הקבוצה הקנוני נכשלה' },
      })
    }
  }

  return (
    <Box className="dpScrollThin" sx={sx.expanded}>
      {selectedSeasonModel.seasons.map(season => {
        const secondaryPath = season.path?.secondary?.find(item => (
          Number(item?.slot) === 2 && item?.path?.length
        ))
        const isSecondaryPathOpen = Boolean(openSecondaryLeaguePaths[season.seasonKey])
        const primaryTeams = season.primaryTeams || []
        const secondaryTeams = season.secondaryTeams || []

        return (
          <Box key={season.seasonKey} sx={sx.seasonContent}>
          <Box sx={sx.expandedSeasonHeader}>
            <Box sx={sx.expandedSeasonTitleGroup}>
              <Typography level='title-sm' sx={sx.expandedSeasonTitle}>
                קבוצות המועדון · עונת מועדון ·
              </Typography>
              <Box sx={sx.clubSeasonPicker}>
                {(model.seasonOptions || []).map(option => (
                  <Chip
                    key={option.value}
                    size='sm'
                    variant={seasonView === option.value ? 'solid' : 'outlined'}
                    color={seasonView === option.value ? 'primary' : 'neutral'}
                    sx={sx.clubSeasonPickerChip}
                    aria-pressed={seasonView === option.value}
                    onClick={() => setSeasonView(option.value)}
                  >
                    {option.seasonKey}
                  </Chip>
                ))}
              </Box>
            </Box>
            <Box sx={sx.expandedSeasonActions}>
              <Button
                size='sm'
                variant='plain'
                sx={sx.expandedSeasonClubButton}
                onClick={() => onOpenClub(club)}
              >
                {`לעמוד ${club?.name || 'המועדון'}`}
              </Button>
              <Dropdown>
                <Tooltip title='מסמכי מועדון'>
                  <MenuButton
                    size='sm'
                    variant='outlined'
                    aria-label='מסמכי מועדון'
                    sx={sx.clubDocumentMenuButton}
                  >
                    {iconUi({ id: 'dataShow', style: { fontSize: 13 } })}
                  </MenuButton>
                </Tooltip>
                <Menu placement='bottom-start'>
                  <MenuItem onClick={handleOpenClubDocumentJson}>
                    מסמך מועדון קנוני
                  </MenuItem>
                  <MenuItem onClick={() => setClubMasterEntryJson({ data: club || {} })}>
                    אובייקט מועדון ב־Clubs Master
                  </MenuItem>
                </Menu>
              </Dropdown>
            </Box>
          </Box>

          <ClubTeamsTable
            title=''
            teams={primaryTeams}
            onOpenTeam={onOpenTeam}
            onOpenTeamDocumentJson={handleOpenTeamDocumentJson}
          />

          {secondaryPath || secondaryTeams.length ? (
            <Box sx={sx.secondaryLeaguePath}>
              <Button
                size='sm'
                variant='plain'
                sx={sx.secondaryLeaguePathButton}
                aria-expanded={isSecondaryPathOpen}
                aria-controls={`secondary-league-path-${season.seasonKey}`}
                onClick={() => setOpenSecondaryLeaguePaths(previous => ({
                  ...previous,
                  [season.seasonKey]: !previous[season.seasonKey],
                }))}
              >
                אזור קבוצות שניות
              </Button>
              {isSecondaryPathOpen ? (
                <Box
                  id={`secondary-league-path-${season.seasonKey}`}
                  sx={sx.secondaryLeaguePathContent}
                >
                  {secondaryPath ? (
                    <LeaguePath
                      model={{ primary: secondaryPath.path, secondary: [] }}
                      showSecondary={false}
                    />
                  ) : null}
                  <ClubTeamsTable
                    title='קבוצה שניה'
                    teams={secondaryTeams}
                    onOpenTeam={onOpenTeam}
                    onOpenTeamDocumentJson={handleOpenTeamDocumentJson}
                  />
                </Box>
              ) : null}
            </Box>
          ) : null}

          </Box>
        )
      })}

      <JsonViewerModal
        open={Boolean(clubDocumentJson)}
        title={`Club Document · ${club?.name || 'מועדון'}`}
        description='תצוגת מסמך המועדון הקנוני'
        data={clubDocumentJson?.data || {}}
        onClose={() => setClubDocumentJson(null)}
        onDownload={() => downloadJson(
          clubDocumentJson?.data || {},
          `club-document-${club?.clubId || 'club'}.json`
        )}
      />

      <JsonViewerModal
        open={Boolean(teamDocumentJson)}
        title={`Team Document · ${teamDocumentJson?.team?.teamName || ''}`}
        description='תצוגת מסמך הקבוצה הקנוני'
        data={teamDocumentJson?.data || {}}
        onClose={() => setTeamDocumentJson(null)}
        onDownload={() => downloadJson(
          teamDocumentJson?.data || {},
          `team-document-${teamDocumentJson?.team?.teamId || 'team'}.json`
        )}
      />

      <JsonViewerModal
        open={Boolean(clubMasterEntryJson)}
        title={`Clubs Master · ${club?.name || 'מועדון'}`}
        description='אובייקט המועדון מתוך מסמך Clubs Master'
        data={clubMasterEntryJson?.data || {}}
        onClose={() => setClubMasterEntryJson(null)}
        onDownload={() => downloadJson(
          clubMasterEntryJson?.data || {},
          `clubs-master-${club?.clubId || 'club'}.json`
        )}
      />
    </Box>
  )
}
