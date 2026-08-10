// src/features/playersDatabase/ui/components/modals/RosterIdentityModal.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Stack,
  Table,
  Typography,
} from '@mui/joy'

import RegularModal from './RegularModal.js'
import { rosterIdentityModalSx as sx } from './sx/rosterIdentityModal.sx.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const normalizePlayerUrl = value => {
  const playerUrl = clean(value)
  if (!playerUrl) return ''
  if (/^https?:\/\//i.test(playerUrl)) return playerUrl

  const path = playerUrl.startsWith('/')
    ? playerUrl
    : `/${playerUrl}`

  return `https://www.football.org.il${path}`
}

function PlayerName({ name, playerUrl, level = 'body-sm' }) {
  const safeUrl = normalizePlayerUrl(playerUrl)

  if (!safeUrl) {
    return (
      <Typography
        level={level}
        sx={sx.playerName}
      >
        {name || '-'}
      </Typography>
    )
  }

  return (
    <Typography
      component='a'
      href={safeUrl}
      target='_blank'
      rel='noopener noreferrer'
      referrerPolicy='no-referrer'
      level={level}
      sx={[sx.playerName, sx.playerLink]}
    >
      {name || '-'}
    </Typography>
  )
}

function MetaValue({ label, value }) {
  return (
    <Box sx={sx.metaItem}>
      <Typography
        level='body-xs'
        sx={sx.metaLabel}
      >
        {label}
      </Typography>

      <Typography
        level='body-sm'
        sx={sx.metaValue}
      >
        {value || '-'}
      </Typography>
    </Box>
  )
}

function IncomingPlayer({ row }) {
  return (
    <Card
      variant='soft'
      sx={sx.incomingCard}
    >
      <Typography
        level='title-sm'
        sx={sx.sectionTitle}
      >
        השחקן שמגיע בטעינה
      </Typography>

      <PlayerName
        name={row?.fullName}
        playerUrl={row?.playerUrl}
        level='title-md'
      />

      <Box sx={sx.metaGrid}>
        <MetaValue
          label='מזהה התאחדות'
          value={row?.externalPlayerId}
        />

        <MetaValue
          label='שנתון'
          value={row?.birthYear || row?.identityBirthYear}
        />
      </Box>
    </Card>
  )
}

function CandidateCard({ candidate, selected, onSelect }) {
  const latestSeason = candidate.seasons?.[0]

  return (
    <Card
      variant={selected ? 'soft' : 'outlined'}
      sx={[
        sx.candidateCard,
        selected ? sx.candidateCardSelected : null,
      ]}
    >
      <Box sx={sx.candidateHeader}>
        <Box>
          <PlayerName
            name={candidate.displayName}
            playerUrl={candidate.playerUrl}
            level='title-sm'
          />

          <Typography
            level='body-xs'
            sx={sx.candidateMeta}
          >
            מזהה התאחדות: {candidate.externalPlayerId || '-'}
          </Typography>
        </Box>

        <Button
          size='sm'
          variant={selected ? 'solid' : 'outlined'}
          onClick={onSelect}
        >
          {selected ? 'נבחר' : 'בדוק שחקן זה'}
        </Button>
      </Box>

      {latestSeason ? (
        <Typography
          level='body-xs'
          sx={sx.candidateMeta}
        >
          אחרון במאגר: {latestSeason.seasonKey || latestSeason.seasonId || '-'}
          {' · '}
          {latestSeason.teamName || '-'}
        </Typography>
      ) : null}
    </Card>
  )
}

function MatchChips({ incoming, candidate }) {
  const incomingName = clean(incoming?.fullName).toLowerCase()
  const candidateName = clean(candidate?.displayName).toLowerCase()
  const incomingYear = Number(
    incoming?.identityBirthYear ||
    incoming?.birthYear
  )
  const candidateYear = Number(candidate?.identityBirthYear)
  const sameName = Boolean(
    incomingName &&
    candidateName &&
    incomingName === candidateName
  )
  const sameYear = Boolean(
    incomingYear &&
    candidateYear &&
    incomingYear === candidateYear
  )
  const differentExternalId = Boolean(
    clean(incoming?.externalPlayerId) &&
    clean(candidate?.externalPlayerId) &&
    clean(incoming.externalPlayerId) !== clean(candidate.externalPlayerId)
  )

  return (
    <Stack
      direction='row'
      spacing={0.75}
      sx={sx.matchChips}
    >
      <Chip
        size='sm'
        variant='soft'
        color={sameName ? 'success' : 'neutral'}
      >
        {sameName ? 'אותו שם' : 'שם שונה'}
      </Chip>

      <Chip
        size='sm'
        variant='soft'
        color={sameYear ? 'success' : 'warning'}
      >
        {sameYear ? 'אותו שנתון' : 'שנתון שונה'}
      </Chip>

      {differentExternalId ? (
        <Chip
          size='sm'
          variant='soft'
          color='danger'
        >
          מזהה התאחדות שונה
        </Chip>
      ) : null}
    </Stack>
  )
}

function CandidateHistory({ candidate }) {
  const seasons = Array.isArray(candidate?.seasons)
    ? candidate.seasons
    : []

  if (!seasons.length) {
    return (
      <Typography
        level='body-sm'
        sx={sx.emptyText}
      >
        לא נמצאה היסטוריית עונות נוספת במאגר.
      </Typography>
    )
  }

  return (
    <Box
      className='dpScrollThin'
      sx={sx.historyWrap}
    >
      <Table
        size='sm'
        stickyHeader
        sx={sx.historyTable}
      >
        <thead>
          <tr>
            <th>שחקן</th>
            <th>עונה</th>
            <th>קבוצה</th>
            <th>קבוצת גיל</th>
            <th>שנתון</th>
            <th>מזהה</th>
          </tr>
        </thead>

        <tbody>
          {seasons.map(season => (
            <tr key={season.id || `${season.playerId}-${season.seasonKey}`}>
              <td>
                <PlayerName
                  name={season.displayName || candidate.displayName}
                  playerUrl={season.playerUrl}
                />
              </td>
              <td>{season.seasonKey || season.seasonId || '-'}</td>
              <td>{season.teamName || '-'}</td>
              <td>{season.ageGroupLabel || season.ageGroupId || '-'}</td>
              <td>{season.birthYear || '-'}</td>
              <td>{season.externalPlayerId || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  )
}

export default function RosterIdentityModal({
  open,
  loading,
  error,
  row,
  candidates,
  onResolve,
  onClose,
}) {
  const [selectedPlayerId, setSelectedPlayerId] = React.useState('')

  React.useEffect(() => {
    if (!open) return

    setSelectedPlayerId(
      clean(candidates?.[0]?.playerId)
    )
  }, [candidates, open])

  const selectedCandidate = candidates.find(candidate => (
    clean(candidate.playerId) === selectedPlayerId
  )) || candidates[0] || null

  return (
    <RegularModal
      open={open}
      title='בדיקת זהות שחקן'
      description='השווה בין השחקן שמגיע בטעינה לבין המידע שכבר קיים במאגר.'
      iconId='warning'
      size='xl'
      busy={loading}
      hideFooter
      contentSx={sx.modalContent}
      onClose={onClose}
    >
      <Box sx={sx.content}>
        <IncomingPlayer row={row} />

        <Box sx={sx.section}>
          <Typography
            level='title-sm'
            sx={sx.sectionTitle}
          >
            התאמות אפשריות במאגר
          </Typography>

          {error ? (
            <Typography
              level='body-sm'
              color='danger'
            >
              {error}
            </Typography>
          ) : null}

          {!loading && !candidates.length ? (
            <Typography
              level='body-sm'
              sx={sx.emptyText}
            >
              לא נמצאו פרטים נוספים להצגה עבור ההתנגשות.
            </Typography>
          ) : null}

          <Box sx={sx.candidatesGrid}>
            {candidates.map(candidate => (
              <CandidateCard
                key={candidate.playerId}
                candidate={candidate}
                selected={
                  clean(candidate.playerId) ===
                  clean(selectedCandidate?.playerId)
                }
                onSelect={() => setSelectedPlayerId(
                  clean(candidate.playerId)
                )}
              />
            ))}
          </Box>
        </Box>

        {selectedCandidate ? (
          <>
            <Divider />

            <Box sx={sx.section}>
              <Typography
                level='title-sm'
                sx={sx.sectionTitle}
              >
                השוואה לשחקן שנבחר
              </Typography>

              <PlayerName
                name={selectedCandidate.displayName}
                playerUrl={selectedCandidate.playerUrl}
                level='title-md'
              />

              <MatchChips
                incoming={row}
                candidate={selectedCandidate}
              />

              <Box sx={sx.metaGrid}>
                <MetaValue
                  label='מזהה במאגר'
                  value={selectedCandidate.externalPlayerId}
                />

                <MetaValue
                  label='מזהה בטעינה'
                  value={row?.externalPlayerId}
                />

                <MetaValue
                  label='שנתון זהות במאגר'
                  value={selectedCandidate.identityBirthYear}
                />
              </Box>
            </Box>

            <Box sx={sx.section}>
              <Typography
                level='title-sm'
                sx={sx.sectionTitle}
              >
                היסטוריית השחקן במאגר
              </Typography>

              <CandidateHistory candidate={selectedCandidate} />
            </Box>

            <Card
              variant='outlined'
              sx={sx.decisionCard}
            >
              <Typography
                level='title-sm'
                sx={sx.sectionTitle}
              >
                החלטה
              </Typography>

              <Typography
                level='body-xs'
                sx={sx.decisionHelp}
              >
                פתח את שמות השחקנים המקושרים לאתר ההתאחדות לפני קבלת החלטה.
              </Typography>

              <Stack
                direction={{
                  xs: 'column',
                  md: 'row',
                }}
                spacing={1}
                sx={sx.decisionActions}
              >
                <Button
                  color='success'
                  onClick={() => onResolve({
                    action: 'useExisting',
                    candidate: selectedCandidate,
                  })}
                >
                  אותו שחקן · השתמש במזהה הקיים
                </Button>

                <Button
                  variant='outlined'
                  onClick={() => onResolve({
                    action: 'newPlayer',
                    candidate: selectedCandidate,
                  })}
                >
                  זה שחקן אחר
                </Button>

                <Button
                  variant='soft'
                  color='warning'
                  onClick={() => onResolve({
                    action: 'incomingIdCorrect',
                    candidate: selectedCandidate,
                  })}
                >
                  אותו שחקן · המזהה החדש נכון
                </Button>
              </Stack>

              <Typography
                level='body-xs'
                sx={sx.pendingHelp}
              >
                בחירה ב״המזהה החדש נכון״ אינה משנה אוטומטית היסטוריה קיימת;
                השורה תישאר חסומה עד לעדכון זהות מבוקר.
              </Typography>
            </Card>
          </>
        ) : null}
      </Box>
    </RegularModal>
  )
}
