import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Option,
  Select,
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import RosterIdentityModal from './RosterIdentityModal.js'
import RegularModal from '../../../../../components/modals/RegularModal.js'
import ImportActionArea from '../../../../../components/modals/ImportActionArea.js'
import ClubSlotSelect from '../../../../../components/modals/components/ClubSlotSelect.js'
import ImportModalContextDescription from '../../../../../components/modals/ImportModalContextDescription.js'
import ModalStepper from '../../../../../components/modals/ModalStepper.js'
import { PLAYER_ROSTER_COLUMNS, PLAYER_ROSTER_PLACEHOLDER } from '../logic/rosterImport.constants.js'
import PasteArea from '../../../../../components/modals/paste/PasteArea.js'
import PreviewTable from '../../../../../components/modals/paste/PreviewTable.js'
import StatusCell from '../../../../../components/modals/paste/StatusCell.js'
import TeamSeasonChoiceCards from '../../../../../components/modals/paste/TeamSeasonChoiceCards.js'
import { importModalChromeSx as chromeSx } from '../../../../../components/modals/paste/sx/importModalChrome.sx.js'
import { pasteModalSx as pasteSx } from '../../../../../components/modals/paste/sx/pasteModal.sx.js'
import { rosterImportModalSx as sx } from '../sx/rosterImportModal.sx.js'
import PlayerNameLink from '../../../../../components/playerMeta/PlayerNameLink.js'
import { resolvePlayerUrl } from '../../../../../components/playerMeta/playerUrl.presentation.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../../../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../../../../../logic/routeBuilders.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

const STEPS = ['סגל קודם', 'הדבקת סגל', 'בדיקת זהות', 'בדיקת חסרים ואישור', 'סנכרון']

const PROJECTION_JOB_STATUS = {
  queued: { color: 'neutral', label: 'ממתין', title: 'הסנכרון ממתין להתחלה', description: 'נתוני הסגל נשמרו. בדיקת הסנכרון תתחיל אוטומטית.' },
  processing: { color: 'primary', label: 'בתהליך', title: 'סנכרון נתוני הסגל מתבצע', description: 'המערכת בודקת את מסמכי הסגל, אינדקסי השחקנים ואת שני הצדדים של העברות.' },
  completed: { color: 'success', label: 'הושלם', title: 'סנכרון נתוני הסגל הושלם', description: 'המסמכים הנגזרים וההעברות שנוצרו נבדקו מול הסגל שנשמר.' },
  failed: { color: 'danger', label: 'נכשל', title: 'סנכרון נתוני הסגל נכשל', description: 'הסגל נשמר; אפשר לנסות שוב את בדיקת הסנכרון בלבד.' },
  superseded: { color: 'neutral', label: 'הוחלף', title: 'הטעינה הוחלפה בטעינה חדשה יותר', description: 'לא בוצעו עדכונים נוספים מהטעינה הישנה.' },
}

const playerName = player => String(
  player?.fullName || player?.displayName || player?.name || ''
).trim()

const clubIdOf = club => String(club?.clubId || '').trim()
const teamIdOf = team => String(team?.birthTeamDocumentId || '').trim()
const teamSlotOf = team => Number(team?.birthTeamSlot || team?.teamSlot || 1)

function RosterClubSlotSelect({
  clubOptions,
  clubId,
  teamId,
  clubPlaceholder,
  disabled,
  onChange,
}) {
  const selectedClub = clubOptions.find(club => clubIdOf(club) === String(clubId || '').trim()) || null
  const teamOptions = Array.isArray(selectedClub?.availableTeams) ? selectedClub.availableTeams : []

  return (
    <ClubSlotSelect
      clubOptions={clubOptions}
      clubValue={clubId}
      slotOptions={teamOptions}
      slotValue={teamId}
      disabled={disabled}
      clubPlaceholder={clubPlaceholder}
      getClubValue={clubIdOf}
      getClubLabel={club => club?.label || club?.clubName || ''}
      getSlotValue={teamIdOf}
      getSlotLabel={teamSlotOf}
      onClubChange={club => {
        const team = (club?.availableTeams || []).find(item => teamSlotOf(item) === 1) || null
        onChange?.({ club, team })
      }}
      onSlotChange={nextTeamId => {
        const team = teamOptions.find(item => teamIdOf(item) === String(nextTeamId || '').trim()) || null
        onChange?.({ club: selectedClub, team })
      }}
    />
  )
}

const clubLabelById = new Map(PLAYERS_DATABASE_CLUBS_CATALOG.map(club => [
  String(club.id || '').trim(),
  club.shortName || club.name || club.id,
]))

const identityMembershipLabel = membership => {
  const clubId = String(membership?.clubId || '').trim()
  const clubLabel = clubLabelById.get(clubId) || clubId || 'מועדון לא ידוע'
  const seasonKey = String(membership?.seasonKey || '').trim()
  const slot = Number(membership?.birthTeamSlot) || 1
  return [clubLabel, seasonKey, slot > 1 ? `קבוצה ${slot}` : '']
    .filter(Boolean)
    .join(' · ')
}

function PlayerIdentityMembership({ row }) {
  const memberships = Array.isArray(row?.identityMemberships)
    ? row.identityMemberships
    : []
  const uniqueMemberships = [...new Map(memberships.map(membership => {
    const key = [membership?.clubId, membership?.seasonKey, membership?.birthTeamSlot]
      .map(value => String(value || '').trim())
      .join('::')
    return [key, membership]
  })).values()]

  if (!uniqueMemberships.length) return <Typography level='body-xs'>-</Typography>

  const labels = uniqueMemberships.map(identityMembershipLabel).filter(Boolean)
  return (
    <Typography level='body-xs' color='primary' title={labels.join(' | ')} sx={{ lineHeight: 1.25 }}>
      נמצא: {labels[0]}{labels.length > 1 ? ` (+${labels.length - 1})` : ''}
    </Typography>
  )
}

function PreviousRosterPlayerCell({ player, team, controller }) {
  const playerDocumentId = String(player?.playerDocumentId || '').trim()
  const playerHref = playerDocumentId
    ? PLAYERS_DATABASE_UI_ROUTES.player({
        playerId: playerDocumentId,
        seasonKey: controller.selectedSeasonOption?.seasonKey,
        teamId: team?.birthTeamId || team?.id,
        leagueId: controller.selectedSeasonOption?.leagueId,
        fromTeam: true,
      })
    : ''

  return (
    <Box sx={sx.previousRosterPlayer}>
      <PlayerNameLink
        name={playerName(player)}
        url={resolvePlayerUrl(player?.playerUrl)}
        internalHref={playerHref}
        internalTarget='_blank'
        avatarSrc={playerImage}
        avatarAlt=''
      />
    </Box>
  )
}

function RosterSyncStep({ controller }) {
  const status = PROJECTION_JOB_STATUS[controller.projectionJob?.status] || PROJECTION_JOB_STATUS.queued
  const stageResults = controller.projectionJob?.stageResults || {}
  const transferResult = stageResults.transfers || {}

  return (
    <Box sx={sx.syncPanel}>
      <Stack direction='row' spacing={1.25} alignItems='center'>
        {!['completed', 'failed', 'superseded'].includes(controller.projectionJob?.status) ? (
          <CircularProgress size='sm' color={status.color} />
        ) : null}
        <Box sx={sx.syncHeading}>
          <Chip size='sm' variant='soft' color={status.color}>{status.label}</Chip>
          <Typography level='title-lg' color={status.color}>{status.title}</Typography>
        </Box>
      </Stack>
      <Typography level='body-sm' sx={sx.syncDescription}>{status.description}</Typography>
      <Divider />
      <Box sx={sx.syncScope}>
        <Typography level='title-sm'>מה מסתנכרן?</Typography>
        <Typography level='body-sm'>מסמכי שחקנים, אינדקסי שחקן ועונה, נתוני קבוצה ומועדון, ושני הצדדים של כל העברה שאושרה.</Typography>
        <Typography level='body-xs' sx={sx.syncScopeHint}>מסמך קבוצה־עונה חסר בצד השני של העברה נשאר תקין; הסנכרון אינו יוצר אותו באופן מלאכותי.</Typography>
      </Box>
      {stageResults.canonicalSource ? (
        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
          <Chip size='sm' variant='soft' color='neutral'>{stageResults.canonicalSource.playersCount || 0} שחקנים</Chip>
          <Chip size='sm' variant='soft' color='neutral'>{stageResults.playerIndexes?.playerIndexCount || 0} אינדקסים</Chip>
          <Chip size='sm' variant='soft' color='neutral'>העברות: {transferResult.synchronizedCount || 0}</Chip>
          {transferResult.optionalMissingTeamSeasonCount ? (
            <Chip size='sm' variant='soft' color='warning'>ללא מסמך קבוצה: {transferResult.optionalMissingTeamSeasonCount}</Chip>
          ) : null}
        </Stack>
      ) : null}
      {controller.projectionJob?.error?.message ? (
        <Typography level='body-xs' color='danger' sx={sx.syncError}>{controller.projectionJob.error.message}</Typography>
      ) : null}
      {controller.projectionJob?.status === 'failed' ? (
        <Button color='danger' variant='soft' loading={controller.retryingProjectionJob} onClick={controller.retryProjectionJob} sx={sx.syncRetryButton}>
          נסה שוב
        </Button>
      ) : null}
    </Box>
  )
}

function PreviousRosterStep({ controller, activeSeasonOptionKey, team }) {
  const previousRoster = controller.previousRoster || {}
  const players = Array.isArray(previousRoster.players) ? previousRoster.players : []

  return (
    <Box sx={sx.selectionPanel}>
      <Box sx={sx.choiceSection}>
        <Typography level='title-sm' sx={sx.choiceSectionTitle}>
          עונת פעולה
        </Typography>
        <TeamSeasonChoiceCards
        seasonOptions={controller.seasonOptions}
        activeSeasonOptionKey={activeSeasonOptionKey}
        value={controller.selectedSeasonOptionKey}
        onChange={controller.selectSeasonOption}
        sx={sx.seasonCards}
        />
      </Box>

      {!controller.selectedSeasonOption ? (
        <Card variant='soft'>
          <Typography level='body-sm'>בחר עונה כדי להציג את הסגל של השנה הקודמת.</Typography>
        </Card>
      ) : null}

      {controller.selectedSeasonOption && previousRoster.loading ? (
        <Card variant='soft' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size='sm' />
          <Typography level='body-sm'>טוען את סגל השנה הקודמת...</Typography>
        </Card>
      ) : null}

      {controller.selectedSeasonOption && !previousRoster.loading && !players.length ? (
        <Card variant='soft'>
          <Typography level='title-sm'>אין סגל קודם לשנתון זה</Typography>
          <Typography level='body-sm'>זו טעינת הסגל הראשונה לשנתון זה במערכת.</Typography>
        </Card>
      ) : null}

      {controller.selectedSeasonOption && !previousRoster.loading && players.length ? (
          <Card sx={sx.previousRosterCard}>
          <Typography level='title-sm' sx={{ mb: 0.75 }}>
            סגל עונת {previousRoster.seasonKey || 'קודמת'} · {players.length} שחקנים
          </Typography>
          <Box className='dpScrollThin' sx={sx.previousRosterScroll}>
            <Table stickyHeader size='sm' sx={sx.previousRosterTable}>
              <thead><tr>
                <Box component='th' sx={sx.previousRosterIndexColumn} aria-label='אינדקס פנימי' title='אינדקס פנימי'>
                  {iconUi({ id: 'tag', size: 'sm' })}
                </Box>
                <Box component='th' sx={sx.previousRosterPlayerColumn}>שחקן</Box>
                <Box component='th' sx={sx.previousRosterExternalIdColumn}>מזהה חיצוני</Box>
                <th>עמדה</th>
              </tr></thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player?.playerId || player?.externalPlayerId || `${playerName(player)}-${index}`}>
                    <Box component='td' sx={sx.previousRosterIndexColumn}>{index + 1}</Box>
                    <Box component='td' sx={sx.previousRosterPlayerColumn}>
                      <PreviousRosterPlayerCell player={player} team={team} controller={controller} />
                    </Box>
                    <Box component='td' sx={sx.previousRosterExternalIdColumn}>{player?.externalPlayerId || '-'}</Box>
                    <td>{player?.primaryPosition || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Card>
      ) : null}
    </Box>
  )
}

function MissingRosterStep({ controller }) {
  const players = Array.isArray(controller.missingRosterPlayers) ? controller.missingRosterPlayers : []
  const options = Array.isArray(controller.teamRootOptions) ? controller.teamRootOptions : []
  const missingRosterSummary = {
    left: players.filter(player => player?.missingResolution === 'left').length,
    unresolved: players.filter(player => ![
      'left',
      'unknown',
      'olderAgeException',
    ].includes(player?.missingResolution)).length,
    olderAgeException: players.filter(player => (
      player?.missingResolution === 'olderAgeException'
    )).length,
    unknown: players.filter(player => player?.missingResolution === 'unknown').length,
  }

  if (!players.length) {
    return (
      <Card variant='soft'>
        <Typography level='title-sm'>כל שחקני הסגל הקודם נמצאו בסגל החדש</Typography>
      </Card>
    )
  }

  return (
    <Card sx={{ minWidth: 0, overflow: 'hidden' }}>
      <Box sx={sx.missingRosterHeader}>
        <Box>
          <Typography level='title-sm'>חסרים מהסגל הקודם · {players.length} שחקנים</Typography>
          <Typography level='body-xs' sx={sx.missingRosterDescription}>
            יש לבחור זיהוי לכל שחקן: „עזב” מחייב יעד; „חריג גיל” פנימי; „לא ידוע” נשאר לבדיקה ללא Movement.
          </Typography>
        </Box>
        <Stack direction='row' spacing={0.75} sx={sx.missingRosterSummaryChips}>
          <Chip size='sm' variant='soft' color={missingRosterSummary.left ? 'primary' : 'neutral'}>
            {`עזבו: ${missingRosterSummary.left}`}
          </Chip>
          <Chip size='sm' variant='soft' color={missingRosterSummary.unresolved ? 'danger' : 'neutral'}>
            {`סטטוס חריג: ${missingRosterSummary.unresolved}`}
          </Chip>
          <Chip size='sm' variant='soft' color={missingRosterSummary.olderAgeException ? 'warning' : 'neutral'}>
            {`חריגי גיל שנה שעברה: ${missingRosterSummary.olderAgeException}`}
          </Chip>
          <Chip size='sm' variant='soft' color='neutral'>
            {`לא ידוע: ${missingRosterSummary.unknown}`}
          </Chip>
        </Stack>
      </Box>
      <Box className='dpScrollThin' sx={sx.missingRosterScroll}>
        <Table stickyHeader size='sm' sx={sx.missingRosterTable}>
          <thead><tr>
            <Box component='th' sx={sx.missingStatusColumn}>תקין</Box>
            <Box component='th' sx={sx.missingIndexColumn}>אינדקס</Box>
            <Box component='th' sx={sx.missingPlayerColumn}>שחקן</Box>
            <Box component='th' sx={sx.missingExternalPlayerIdColumn}>מזהה חיצוני</Box>
            <Box component='th' sx={sx.missingResolutionColumn}>זיהוי</Box>
            <Box component='th' sx={sx.missingTargetColumn}>קבוצת יעד</Box>
          </tr></thead>
          <tbody>
            {players.map((player, index) => {
              const playerKey = String(player?.playerId || player?.externalPlayerId || index)
              const isOlderAgeException = player?.missingResolution === 'olderAgeException'
              const hasConfirmedExit = player?.missingResolution === 'left' && Boolean(
                player?.statsMovementTeam?.birthTeamDocumentId
              )
              const hasExplicitUnknown = player?.missingResolution === 'unknown'
              const isResolved = isOlderAgeException || hasConfirmedExit || hasExplicitUnknown
              const statusMessage = isResolved
                ? ''
                : 'יש לבחור זיהוי לשחקן'
              return (
                <tr key={playerKey}>
                  <Box component='td' sx={sx.missingStatusColumn}>
                    <StatusCell valid={isResolved} message={statusMessage} />
                  </Box>
                  <Box component='td' sx={sx.missingIndexColumn}>{index + 1}</Box>
                  <Box component='td' sx={sx.missingPlayerColumn}>
                    <PlayerNameLink
                      name={playerName(player)}
                      url={resolvePlayerUrl(player?.playerUrl)}
                      avatarSrc={playerImage}
                      avatarAlt=''
                    />
                  </Box>
                  <Box component='td' sx={sx.missingExternalPlayerIdColumn}>{player?.externalPlayerId || '-'}</Box>
                  <Box component='td' sx={sx.missingResolutionColumn}>
                    <Select
                      size='sm'
                      value={player?.missingResolution || null}
                      placeholder='בחר זיהוי'
                      onChange={(event, resolution) => {
                        controller.setMissingRosterPlayerResolution({
                          playerKey,
                          resolution: resolution || '',
                        })
                      }}
                      sx={{ minWidth: 108, fontSize: '0.75rem' }}
                    >
                      <Option value='unknown'>לא ידוע</Option>
                      <Option value='olderAgeException'>חריג גיל</Option>
                      <Option value='left'>עזב</Option>
                    </Select>
                  </Box>
                  <Box component='td' sx={sx.missingTargetColumn}>
                    <RosterClubSlotSelect
                      clubOptions={options}
                      clubId={player?.statsMovementTeam?.clubId}
                      teamId={player?.statsMovementTeam?.birthTeamDocumentId}
                      clubPlaceholder='בחר מועדון יעד'
                      disabled={player?.missingResolution !== 'left'}
                      onChange={({ team: target }) => {
                        controller.setMissingRosterPlayerTarget({ playerKey, team: target })
                      }}
                    />
                  </Box>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Box>
    </Card>
  )
}

function JoinedRosterSourceControl({ row, rowIndex, controller }) {
  if (row?.rosterPreviousMatch === true) {
    return <Typography level='body-xs' color='success'>היה בסגל</Typography>
  }

  if (row?.rosterPreviousMatch !== false) {
    return <Typography level='body-xs' color='neutral'>אין סגל קודם</Typography>
  }

  const options = Array.isArray(controller.teamRootOptions) ? controller.teamRootOptions : []
  const isJoined = row?.rosterImportResolution === 'joined'

  return (
    <Box sx={{ minWidth: 0 }}>
      <RosterClubSlotSelect
        clubOptions={options}
        clubId={row?.statsMovementTeam?.clubId}
        teamId={row?.statsMovementTeam?.birthTeamDocumentId}
        clubPlaceholder='מקור'
        disabled={!isJoined}
        onChange={({ team: source }) => {
          controller.setIncomingRosterPlayerSource({ rowIndex, team: source })
        }}
      />
    </Box>
  )
}

function RosterImportResolutionControl({ row, rowIndex, controller }) {
  if (row?.rosterPreviousMatch === true || row?.rosterPreviousMatch !== false) {
    return <Typography level='body-xs' color='neutral'>-</Typography>
  }

  return (
    <Select
      size='sm'
      indicator={null}
      value={row?.rosterImportResolution || null}
      placeholder='בחר זיהוי'
      onChange={(event, value) => {
        controller.setIncomingRosterPlayerResolution({ rowIndex, resolution: value || '' })
      }}
      sx={{ width: '100%', minWidth: 0, fontSize: '0.72rem' }}
    >
      <Option value='joined'>הצטרף</Option>
      <Option value='priorAgeException'>חריג גיל בשנה קודמת</Option>
      <Option value='confirmedInRoster'>כן, בסגל</Option>
    </Select>
  )
}

export default function RosterImportModal({
  team,
  seasonKey,
  activeSeasonOptionKey,
  hasTeamPlayers,
  controller,
}) {
  const [activeStep, setActiveStep] = React.useState(0)
  const [reviewStep, setReviewStep] = React.useState('present')
  const teamUrl = String(
    controller.selectedSeasonOption?.season?.teamUrl || team?.teamUrl || ''
  ).trim()
  const description = (
    <ImportModalContextDescription
      items={[
        { label: team?.name || 'קבוצה', href: teamUrl },
        { label: seasonKey ? `עונה ${seasonKey}` : '' },
      ]}
    />
  )
  const rosterSummary = React.useMemo(() => {
    const rows = Array.isArray(controller.rows) ? controller.rows : []
    const attentionCount = rows.filter((row, rowIndex) => (
      controller.getRowStatus(row, rowIndex)?.valid === false
    )).length
    const joinedCount = rows.filter(row => row?.rosterImportResolution === 'joined').length
    const ageExceptionCount = rows.filter(row => (
      row?.rosterImportResolution === 'priorAgeException'
    )).length

    return [
      { key: 'roster-players', label: `בסגל: ${rows.length}`, color: 'success' },
      { key: 'roster-attention', label: `חריגים לטיפול: ${attentionCount}`, color: attentionCount ? 'danger' : 'neutral' },
      { key: 'roster-joined', label: `הצטרפו: ${joinedCount}`, color: joinedCount ? 'primary' : 'neutral' },
      { key: 'roster-age-exceptions', label: `חריגי גיל: ${ageExceptionCount}`, color: ageExceptionCount ? 'warning' : 'neutral' },
    ]
  }, [controller.getRowStatus, controller.rows])
  const columns = React.useMemo(() => [
    ...PLAYER_ROSTER_COLUMNS
      .filter(column => column.key !== 'playerUrl')
      .map(column => {
        if (column.key === 'index') {
          return {
            ...column,
            sx: sx.previewIndexColumn,
            render: ({ rowIndex }) => rowIndex + 1,
          }
        }
        if (column.key === 'externalPlayerId') {
          return {
            ...column,
            sx: sx.externalPlayerIdColumn,
          }
        }
        if (column.key !== 'fullName') return column
        return {
          ...column,
          sx: sx.playerNameColumn,
          headerSx: sx.playerNameColumnHeader,
          headerContent: <Box sx={sx.playerNameHeader}>שם השחקן</Box>,
          cellContentSx: sx.playerNameCellContent,
          render: ({ row }) => (
            <PlayerNameLink
              name={row.fullName}
              url={resolvePlayerUrl(row.playerUrl)}
              avatarSrc={playerImage}
              avatarAlt=''
            />
          ),
        }
      }),
    {
      key: 'rosterResolution',
      label: 'זיהוי שחקן',
      readOnly: true,
      sx: sx.rosterResolutionColumn,
      render: ({ row, rowIndex }) => (
        <RosterImportResolutionControl row={row} rowIndex={rowIndex} controller={controller} />
      ),
    },
    {
      key: 'rosterMembership',
      label: 'סגל קודם',
      readOnly: true,
      sx: sx.rosterMembershipColumn,
      render: ({ row, rowIndex }) => (
        <JoinedRosterSourceControl row={row} rowIndex={rowIndex} controller={controller} />
      ),
    },
    {
      key: 'identityAction',
      label: 'בדיקת זהות',
      readOnly: true,
      sx: sx.identityColumn,
      render: ({ row, rowIndex }) => (
        row.identityValid !== false ? (
          row.identityResolution
            ? <Typography level='body-xs' color='success'>נפתר</Typography>
            : <PlayerIdentityMembership row={row} />
        ) : (
          <Button size='sm' variant='soft' color='danger' onClick={() => controller.openIdentityReview(rowIndex)}>
            בדוק התאמה
          </Button>
        )
      ),
    },
  ], [
    controller.openIdentityReview,
    controller.setIncomingRosterPlayerSource,
    controller.setIncomingRosterPlayerResolution,
    controller.teamRootOptions,
  ])

  React.useEffect(() => {
    if (controller.open) {
      setActiveStep(0)
      setReviewStep('present')
    }
  }, [controller.open])

  React.useEffect(() => {
    if (controller.projectionJobId) setActiveStep(3)
  }, [controller.projectionJobId])

  const close = () => {
    if (controller.busy) return
    controller.clearPaste()
    controller.close()
  }
  const previewRoster = async () => {
    const previewRows = await controller.parse()
    if (Array.isArray(previewRows) && previewRows.length) setActiveStep(2)
  }
  const confirm = () => {
    if (activeStep === 0) return setActiveStep(1)
    if (activeStep === 1) return previewRoster()
    if (activeStep === 3) return close()
    if (reviewStep === 'present') return setReviewStep('missing')
    return controller.confirm()
  }
  const disabled = activeStep === 3
    ? false
    : controller.busy || Boolean(controller.projectionJobId) || (
      activeStep === 0
      ? !controller.selectedSeasonOption || controller.previousRoster?.loading
      : activeStep === 1
        ? !controller.selectedSeasonOption || !controller.pasteValue
      : controller.hasIdentityErrors ||
          !controller.rows.length ||
          (reviewStep === 'missing' && !controller.hasMissingRosterApprovals)
    )
  const confirmLabel = activeStep === 0
    ? 'המשך להדבקה'
    : activeStep === 1 ? 'הצג בדיקת זהות' : activeStep === 3 ? 'סגור' : reviewStep === 'present' ? 'המשך לבדיקת חסרים' : 'אישור טעינת סגל'
  const footerActions = activeStep === 1 || activeStep === 2 ? (
    <ImportActionArea
      actions={[
        {
          id: 'back',
          label: activeStep === 1 ? 'חזרה לסגל קודם' : 'חזרה לקליטת נתונים',
          iconId: 'back',
          presentationRole: 'back',
          disabled: controller.busy,
          sx: chromeSx.backButton,
          onClick: () => {
            if (activeStep === 2 && reviewStep === 'missing') {
              setReviewStep('present')
              return
            }
            setActiveStep(current => Math.max(0, current - 1))
          },
        },
      ]}
    />
  ) : null

  return (
    <>
      <RegularModal
        open={controller.open}
        title={hasTeamPlayers ? 'טעינת סגל מעודכן' : 'טעינת סגל'}
        description={description}
        iconId='addPlayers'
        confirmLabel={confirmLabel}
        confirmIconId={activeStep === 2 && reviewStep === 'missing' ? 'upload' : 'next'}
        size='xl'
        busy={controller.busy}
        disabled={disabled}
        contentSx={pasteSx.modalContent}
        headerIconSx={chromeSx.modalHeaderIcon}
        footerSx={chromeSx.footer}
        footerActions={footerActions}
        onConfirm={confirm}
        onClose={close}
      >
        <Box sx={{
          display: 'grid',
          minWidth: 0,
          gap: 1.5,
          ...(activeStep === 0 || activeStep === 2 || activeStep === 3 ? {
            height: 'min(720px, calc(100dvh - 230px))',
            minHeight: 0,
            gridTemplateRows: 'auto minmax(0, 1fr)',
            overflow: 'hidden',
          } : {}),
        }}>
          <ModalStepper activeStep={activeStep === 3 ? 4 : reviewStep === 'missing' ? 3 : activeStep} steps={STEPS} />

          {activeStep === 0 ? (
            <PreviousRosterStep
              controller={controller}
              activeSeasonOptionKey={activeSeasonOptionKey}
              team={team}
            />
          ) : null}

          {activeStep === 1 ? (
            <PasteArea
              value={controller.pasteValue}
              placeholder={PLAYER_ROSTER_PLACEHOLDER}
              formatHint='סדר עמודות: אינדקס שחקן · שם שחקן · מזהה חיצוני · קישור שחקן'
              onChange={controller.setPasteValue}
              inputVariant='tall'
              templateText={PLAYER_ROSTER_PLACEHOLDER}
            />
          ) : null}

          {activeStep === 2 && reviewStep === 'present' ? (
            <PreviewTable
              columns={columns}
              rows={controller.rows}
              summary={rosterSummary}
              showSummaryCounts={false}
              onCellChange={controller.changeCell}
              getRowStatus={controller.getRowStatus}
              hoverRow={false}
              statusColumnSx={sx.previewStatusColumn}
              tableSx={sx.previewTable}
            />
          ) : null}

          {activeStep === 2 && reviewStep === 'missing' ? <MissingRosterStep controller={controller} /> : null}

          {activeStep === 3 ? (
            <RosterSyncStep controller={controller} />
          ) : null}
        </Box>
      </RegularModal>

      <RosterIdentityModal
        open={controller.identityReview.open}
        loading={controller.identityReview.loading}
        error={controller.identityReview.error}
        row={controller.identityReview.row}
        candidates={controller.identityReview.candidates}
        onResolve={controller.resolveIdentityReview}
        onClose={controller.closeIdentityReview}
      />
    </>
  )
}
