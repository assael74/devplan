import * as React from 'react'
import { Autocomplete, Box, Button, Card, CircularProgress, Option, Select, Table, Typography } from '@mui/joy'

import RosterIdentityModal from './RosterIdentityModal.js'
import RegularModal from '../../../../../components/modals/RegularModal.js'
import WorkTaskStepper from '../../../../../components/modals/workTask/WorkTaskStepper.js'
import TeamSeasonSelect from '../../../../../components/modals/TeamSeasonSelect.js'
import { PLAYER_ROSTER_COLUMNS, PLAYER_ROSTER_PLACEHOLDER } from '../logic/rosterImport.constants.js'
import PasteArea from '../../../../../components/modals/paste/PasteArea.js'
import PreviewTable from '../../../../../components/modals/paste/PreviewTable.js'
import StatusCell from '../../../../../components/modals/paste/StatusCell.js'
import { pasteModalSx as pasteSx } from '../../../../../components/modals/paste/sx/pasteModal.sx.js'
import { rosterImportModalSx as sx } from '../sx/rosterImportModal.sx.js'
import { PlayerUrlIcon } from '../../../stats/table/presentation/teamStatsColumns.presentation.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../../../../catalog/clubs.catalog.js'

const STEPS = ['סגל קודם', 'הדבקת סגל', 'בדיקת זהות', 'בדיקת חסרים ואישור']

const playerName = player => String(
  player?.fullName || player?.displayName || player?.name || ''
).trim()

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

function PreviousRosterStep({ controller }) {
  const previousRoster = controller.previousRoster || {}
  const players = Array.isArray(previousRoster.players) ? previousRoster.players : []

  return (
    <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
      <TeamSeasonSelect
        seasonOptions={controller.seasonOptions}
        value={controller.selectedSeasonOptionKey}
        onChange={controller.selectSeasonOption}
      />

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
        <Card sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography level='title-sm' sx={{ mb: 0.75 }}>
            סגל עונת {previousRoster.seasonKey || 'קודמת'} · {players.length} שחקנים
          </Typography>
          <Box className='dpScrollThin' sx={{ maxHeight: 310, overflow: 'auto' }}>
            <Table stickyHeader size='sm'>
              <thead><tr><th>שחקן</th><th>מזהה חיצוני</th><th>עמדה</th></tr></thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player?.playerId || player?.externalPlayerId || `${playerName(player)}-${index}`}>
                    <td>{playerName(player) || '-'}</td>
                    <td>{player?.externalPlayerId || '-'}</td>
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

  if (!players.length) {
    return (
      <Card variant='soft'>
        <Typography level='title-sm'>כל שחקני הסגל הקודם נמצאו בסגל החדש</Typography>
      </Card>
    )
  }

  return (
    <Card sx={{ minWidth: 0, overflow: 'hidden' }}>
      <Typography level='title-sm'>חסרים מהסגל הקודם · {players.length} שחקנים</Typography>
      <Typography level='body-xs' sx={{ mt: 0.35, mb: 1 }}>
        יש לבחור זיהוי לכל שחקן: „עזב” מחייב יעד וסלוט; „חריג גיל” פנימי; „לא ידוע” נשאר לבדיקה ללא Movement.
      </Typography>
      <Box className='dpScrollThin' sx={{ maxHeight: 360, overflow: 'auto' }}>
            <Table stickyHeader size='sm'>
          <thead><tr>
            <Box component='th' sx={sx.missingStatusColumn}>תקין</Box>
            <Box component='th' sx={sx.missingIndexColumn}>אינדקס</Box>
            <th>שחקן</th><th>מזהה חיצוני</th><th>זיהוי</th><th>קבוצת יעד</th><th>סלוט</th>
          </tr></thead>
          <tbody>
            {players.map((player, index) => {
              const playerKey = String(player?.playerId || player?.externalPlayerId || index)
              const selectedClub = options.find(option => option.clubId === player?.statsMovementTeam?.clubId) || null
              const availableTeams = Array.isArray(selectedClub?.availableTeams) ? selectedClub.availableTeams : []
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
                  <td>
                    <Box sx={sx.playerNameCell}>
                      <Typography level='body-sm' sx={{ minWidth: 0, textAlign: 'left' }}>
                        {playerName(player) || '-'}
                      </Typography>
                      <PlayerUrlIcon playerUrl={player?.playerUrl} />
                    </Box>
                  </td>
                  <td>{player?.externalPlayerId || '-'}</td>
                  <td>
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
                  </td>
                  <td>
                    <Autocomplete
                      size='sm'
                      options={options}
                      value={selectedClub}
                      placeholder='בחר מועדון יעד'
                      disabled={player?.missingResolution !== 'left'}
                      getOptionLabel={option => option?.label || option?.clubName || ''}
                      isOptionEqualToValue={(option, value) => option?.clubId === value?.clubId}
                      onChange={(event, club) => {
                        const target = (club?.availableTeams || []).find(team => Number(team.birthTeamSlot) === 1) || null
                        controller.setMissingRosterPlayerTarget({ playerKey, team: target })
                      }}
                      slotProps={{ listbox: { className: 'dpScrollThin', sx: { fontSize: '0.72rem' } } }}
                      sx={{ minWidth: 160, fontSize: '0.75rem' }}
                    />
                  </td>
                  <td>
                    <Select
                      size='sm'
                      indicator={null}
                      value={player?.statsMovementTeam?.birthTeamDocumentId || null}
                      placeholder='1'
                      disabled={player?.missingResolution !== 'left' || !availableTeams.length}
                      onChange={(event, teamId) => {
                        const target = availableTeams.find(team => team.birthTeamDocumentId === teamId)
                        controller.setMissingRosterPlayerTarget({ playerKey, team: target || null })
                      }}
                      sx={{ minWidth: 42 }}
                    >
                      {availableTeams.map(team => (
                        <Option key={team.birthTeamDocumentId} value={team.birthTeamDocumentId}>{team.birthTeamSlot}</Option>
                      ))}
                    </Select>
                  </td>
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
  const selectedClub = options.find(option => option.clubId === row?.statsMovementTeam?.clubId) || null
  const availableTeams = Array.isArray(selectedClub?.availableTeams) ? selectedClub.availableTeams : []
  const resolution = row?.rosterImportResolution || ''
  const isJoined = resolution === 'joined'

  return (
    <Box sx={{ display: 'flex', gap: 0.4, minWidth: 0 }}>
      <Select
        size='sm'
        indicator={null}
        value={resolution || null}
        placeholder='בחר זיהוי'
        onChange={(event, value) => {
          controller.setIncomingRosterPlayerResolution({ rowIndex, resolution: value || '' })
        }}
        sx={{ minWidth: 86, fontSize: '0.72rem' }}
      >
        <Option value='joined'>הצטרף</Option>
        <Option value='priorAgeException'>חריג גיל בשנה קודמת</Option>
        <Option value='confirmedInRoster'>כן, בסגל</Option>
      </Select>
      <Autocomplete
        size='sm'
        options={options}
        value={selectedClub}
        placeholder='מקור'
        disabled={!isJoined}
        getOptionLabel={option => option?.label || option?.clubName || ''}
        isOptionEqualToValue={(option, value) => option?.clubId === value?.clubId}
        onChange={(event, club) => {
          const source = (club?.availableTeams || []).find(team => Number(team.birthTeamSlot) === 1) || null
          controller.setIncomingRosterPlayerSource({ rowIndex, team: source })
        }}
        slotProps={{ listbox: { className: 'dpScrollThin', sx: { fontSize: '0.72rem' } } }}
        sx={{ minWidth: 190, fontSize: '0.72rem' }}
      />
      <Select
        size='sm'
        indicator={null}
        value={row?.statsMovementTeam?.birthTeamDocumentId || null}
        placeholder='1'
        disabled={!isJoined || !availableTeams.length}
        onChange={(event, teamId) => {
          const source = availableTeams.find(team => team.birthTeamDocumentId === teamId)
          controller.setIncomingRosterPlayerSource({ rowIndex, team: source || null })
        }}
        sx={{ minWidth: 38 }}
      >
        {availableTeams.map(team => (
          <Option key={team.birthTeamDocumentId} value={team.birthTeamDocumentId}>{team.birthTeamSlot}</Option>
        ))}
      </Select>
    </Box>
  )
}

export default function RosterImportModal({ team, seasonKey, hasTeamPlayers, controller }) {
  const [activeStep, setActiveStep] = React.useState(0)
  const [reviewStep, setReviewStep] = React.useState('present')
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
          headerContent: <Box sx={sx.playerNameHeader}>שם השחקן</Box>,
          render: ({ row }) => (
            <Box sx={sx.playerNameCell}>
              <Typography level='body-sm' sx={{ minWidth: 0, textAlign: 'left' }}>
                {row.fullName || '-'}
              </Typography>
              <PlayerUrlIcon playerUrl={row.playerUrl} />
            </Box>
          ),
        }
      }),
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
    if (reviewStep === 'present') return setReviewStep('missing')
    return controller.confirm()
  }
  const disabled = controller.busy || (
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
    : activeStep === 1 ? 'הצג בדיקת זהות' : reviewStep === 'present' ? 'המשך לבדיקת חסרים' : 'אישור טעינת סגל'

  return (
    <>
      <RegularModal
        open={controller.open}
        title={hasTeamPlayers ? 'טעינת סגל מעודכן' : 'טעינת סגל'}
        description={`${team.name} · עונה ${seasonKey || '-'}`}
        confirmLabel={confirmLabel}
        confirmIconId={activeStep === 2 ? 'upload' : 'next'}
        size='xl'
        busy={controller.busy}
        disabled={disabled}
        contentSx={pasteSx.modalContent}
        headerActions={activeStep > 0 ? (
          <Button size='sm' variant='plain' disabled={controller.busy} onClick={() => {
            if (activeStep === 2 && reviewStep === 'missing') return setReviewStep('present')
            return setActiveStep(current => Math.max(0, current - 1))
          }}>
            חזרה
          </Button>
        ) : null}
        onConfirm={confirm}
        onClose={close}
      >
        <Box sx={{
          display: 'grid',
          minWidth: 0,
          gap: 1.5,
          ...(activeStep === 2 ? {
            height: 'min(680px, calc(100dvh - 270px))',
            minHeight: 0,
            gridTemplateRows: 'auto minmax(0, 1fr)',
            overflow: 'hidden',
          } : {}),
        }}>
          <WorkTaskStepper activeStep={reviewStep === 'missing' ? 3 : activeStep} steps={STEPS} />

          {activeStep === 0 ? <PreviousRosterStep controller={controller} /> : null}

          {activeStep === 1 ? (
            <PasteArea
              value={controller.pasteValue}
              placeholder={PLAYER_ROSTER_PLACEHOLDER}
              formatHint='סדר עמודות: אינדקס שחקן · שם שחקן · מזהה חיצוני · קישור שחקן'
              pasteDisabled={!controller.selectedSeasonOption}
              onChange={controller.setPasteValue}
              onPaste={previewRoster}
              onClear={controller.clearPaste}
            />
          ) : null}

          {activeStep === 2 && reviewStep === 'present' ? (
            <PreviewTable
              columns={columns}
              rows={controller.rows}
              onCellChange={controller.changeCell}
              getRowStatus={controller.getRowStatus}
              hoverRow={false}
              statusColumnSx={sx.previewStatusColumn}
              tableSx={sx.previewTable}
            />
          ) : null}

          {activeStep === 2 && reviewStep === 'missing' ? <MissingRosterStep controller={controller} /> : null}
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
