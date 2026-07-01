// src/features/playersDatabase/components/scan/ScanCenterPage.js

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Input,
  Option,
  Select,
  Sheet,
  Typography,
} from '@mui/joy'

import { ReportPrintButton } from '../../../../ui/patterns/reportPrint/index.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { getPlayerGeneralPosition } from '../../../../shared/players/player.positions.utils.js'
import { LAYER_TITLES, POSITION_LAYERS } from '../../../../shared/players/players.constants.js'
import { SCOUT_PROFILES } from '../../../../shared/players/scouting/index.js'
import { updateLeagueTeamLink } from '../../services/pdbLeague.firestore.js'
import { updatePlayerSeasonPosition } from '../../services/pdbPlayers.firestore.js'
import { markLeagueBoardCacheDirty } from '../leagues/board/hook/leagueBoardCache.js'
import TeamLinkModal from '../leagues/page/TeamLinkModal.js'
import { useScanCenter } from './useScanCenter.js'
import {
  SCAN_SCOPE_OPTIONS,
  SCAN_PROFILE_OPTIONS,
  SCAN_STATUS_OPTIONS,
  getProfileBreakdownRows,
  getScanStatusColor,
  getScanStatusLabel,
} from './scanCenter.logic.js'
import { scanCenterSx as sx } from './scanCenter.sx.js'
import { ReportShell } from '../../../../ui/patterns/reports/index.js'

const scopeLabel = {
  database: 'דאטה בייס',
  year: 'שנתון',
  league: 'ליגה',
}

const clean = value => String(value ?? '').trim()

const profileIconFallback = {
  game_changer: 'gameChanger',
  gameChanger: 'gameChanger',
  promoted_talent: 'promotedTalent',
  promotedTalent: 'promotedTalent',
  lineup_banker: 'lineupBanker',
  lineupBanker: 'lineupBanker',
  last_station: 'lastStation',
  lastStation: 'lastStation',
  back_threat: 'backThreat',
  backThreat: 'backThreat',
  pro_anchor: 'proAnchor',
  proAnchor: 'proAnchor',
  single_engine: 'singleEngine',
  singleEngine: 'singleEngine',
  clear_scorer: 'clearScorer',
  clearScorer: 'clearScorer',
  killer_efficiency: 'killerEfficiency',
  killerEfficiency: 'killerEfficiency',
  target_worker: 'targetWorker',
  targetWorker: 'targetWorker',
  secondary_threat: 'secondaryThreat',
  secondaryThreat: 'secondaryThreat',
}

const scoutProfileById = SCOUT_PROFILES.reduce((acc, profile) => {
  acc[profile.id] = profile
  if (profile.idIcon) acc[profile.idIcon] = profile
  return acc
}, {})

const valueOrDash = value => {
  const text = clean(value)
  return text || '-'
}

const listText = value => (
  Array.isArray(value) && value.length
    ? value.filter(Boolean).join(', ')
    : valueOrDash(value)
)

const MIDFIELD_LAYERS = ['atMidfield', 'midfield', 'dmMid']

const layerOptions = [
  { id: 'attack', layers: ['attack'], label: LAYER_TITLES.attack },
  { id: 'midfield', layers: MIDFIELD_LAYERS, label: LAYER_TITLES.midfield },
  { id: 'defense', layers: ['defense'], label: LAYER_TITLES.defense },
  { id: 'goalkeeper', layers: ['goalkeeper'], label: LAYER_TITLES.goalkeeper },
]

const normalizeLayer = layer => {
  const value = clean(layer)
  return MIDFIELD_LAYERS.includes(value) ? 'midfield' : value
}

const getLayerOption = layer =>
  layerOptions.find(option => option.id === normalizeLayer(layer))

const getPositionOptions = layer => {
  const option = getLayerOption(layer)
  if (!option) return []

  return option.layers.flatMap(item => POSITION_LAYERS[item] || [])
}

const getPlayerPositionInfo = player => {
  const primaryPosition = clean(player.primaryPosition)
  const positions = Array.isArray(player.positions)
    ? player.positions.filter(Boolean)
    : clean(player.positions)
      ? [clean(player.positions)]
      : []
  const documentLayer = clean(player.positionLayer)

  if (documentLayer) {
    return {
      primaryPosition,
      positions,
      layerKey: normalizeLayer(documentLayer),
      layerLabel: LAYER_TITLES[documentLayer] || documentLayer,
      missingDocumentLayer: false,
      sourceLabel: 'חוליה מהמסמך',
      sourceColor: 'neutral',
    }
  }

  const inferred = getPlayerGeneralPosition({
    primaryPosition,
    positions,
  })

  return {
    primaryPosition,
    positions,
    layerKey: normalizeLayer(inferred.layerKey),
    layerLabel: inferred.layerLabel || '-',
    missingDocumentLayer: true,
    sourceLabel: inferred.layerKey ? 'חוליה משוערת' : 'חסרה חוליה',
    sourceColor: inferred.layerKey ? 'warning' : 'danger',
  }
}

const getPlayerProfileInfo = player => (
  player.scoutProfiles?.[player.profileId] ||
  player.eligibleScoutProfiles?.[player.profileId] ||
  player.rawScoutProfiles?.[player.profileId] ||
  {}
)

const getPlayerProfileChips = player => {
  if (Array.isArray(player.matchedProfileIds) && player.matchedProfileIds.length) {
    return player.matchedProfileIds.map((profileId, index) => ({
      id: clean(profileId),
      label:
        clean(player.matchedProfileLabels?.[index]) ||
        scoutProfileById[clean(profileId)]?.label ||
        player.profileLabel ||
        clean(profileId),
      idIcon:
        scoutProfileById[clean(profileId)]?.idIcon ||
        profileIconFallback[clean(profileId)],
    }))
  }

  const maps = [
    player.scoutProfiles || {},
    player.eligibleScoutProfiles || {},
  ]
  const rows = maps.flatMap(map => Object.values(map || {}))
    .map(item => ({
      id: clean(item.profileId || item.id || item.profileLabel),
      label: clean(item.profileLabel || item.label),
      score: item.score,
      idIcon:
        clean(item.idIcon) ||
        scoutProfileById[clean(item.profileId || item.id)]?.idIcon ||
        profileIconFallback[clean(item.profileId || item.id)],
    }))
    .filter(item => item.label)

  const uniqueRows = Array.from(rows.reduce((map, item) => {
    if (!map.has(item.label)) map.set(item.label, item)
    return map
  }, new Map()).values())

  if (uniqueRows.length) return uniqueRows

  return player.profileLabel
    ? [{
      id: clean(player.profileId || player.profileLabel),
      label: player.profileLabel,
      idIcon:
        scoutProfileById[clean(player.profileId)]?.idIcon ||
        profileIconFallback[clean(player.profileId)],
    }]
    : []
}

function InlineEntityLink({ href, children, level = 'body-xs' }) {
  if (!href) return <span>{children}</span>

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noreferrer"
      sx={sx.entityLink}
      onClick={event => event.stopPropagation()}
    >
      <Typography level={level} sx={level === 'title-sm' ? sx.rowTitle : null}>
        {children}
      </Typography>
    </Box>
  )
}

function StatCell({ label, value }) {
  return (
    <Box sx={sx.scanStatCell}>
      <Typography level="body-xs" sx={sx.scanStatLabel}>
        {label}
      </Typography>

      <Typography level="body-sm" sx={sx.scanStatValue}>
        {valueOrDash(value)}
      </Typography>
    </Box>
  )
}

function ScanPlayerResult({ player, onEditLink }) {
  const current = player.current || {}
  const games = current.games ?? player.games
  const starts = current.starts ?? player.starts
  const position = getPlayerPositionInfo(player)
  const profile = getPlayerProfileInfo(player)
  const profileChips = getPlayerProfileChips(player)
  const score = profile.score ?? player.bestScoutScore
  const reliability =
    profile.reliabilityLevel ||
    player.bestScoutReliabilityLevel ||
    profile.reliabilityScore ||
    player.bestScoutReliabilityScore
  const [selectedLayer, setSelectedLayer] = React.useState(position.layerKey || '')
  const [selectedPosition, setSelectedPosition] = React.useState(position.primaryPosition || '')
  const [savedLayer, setSavedLayer] = React.useState(position.layerKey || '')
  const [savedPosition, setSavedPosition] = React.useState(position.primaryPosition || '')
  const [positionSaved, setPositionSaved] = React.useState(!position.missingDocumentLayer)
  const [savingPosition, setSavingPosition] = React.useState(false)
  const [positionError, setPositionError] = React.useState('')
  const positionOptions = getPositionOptions(selectedLayer)
  const playerUrl = clean(player.playerUrl || player.source?.playerUrl)
  const leagueUrl = clean(player.leagueUrl || player.source?.leagueUrl)
  const teamUrl = clean(player.teamUrl || player.source?.teamUrl)
  const hasPositionDraft =
    clean(selectedLayer) !== clean(savedLayer) ||
    clean(selectedPosition) !== clean(savedPosition)
  const showPositionStatus = !positionSaved || hasPositionDraft

  React.useEffect(() => {
    setSelectedLayer(position.layerKey || '')
    setSelectedPosition(position.primaryPosition || '')
    setSavedLayer(position.layerKey || '')
    setSavedPosition(position.primaryPosition || '')
    setPositionSaved(!position.missingDocumentLayer)
    setPositionError('')
  }, [
    player.id,
    player.searchDocId,
    position.layerKey,
    position.primaryPosition,
    position.missingDocumentLayer,
  ])

  const handleLayerChange = value => {
    const nextLayer = clean(value)
    const stillValid = getPositionOptions(nextLayer)
      .some(option => option.code === selectedPosition)

    setSelectedLayer(nextLayer)
    if (!stillValid) setSelectedPosition('')
  }

  const savePosition = async () => {
    if (!hasPositionDraft || savingPosition) return

    const patch = {
      positionLayer: clean(selectedLayer),
      primaryPosition: clean(selectedPosition),
      positions: clean(selectedPosition) ? [clean(selectedPosition)] : [],
    }

    setSavingPosition(true)
    setPositionError('')

    try {
      await updatePlayerSeasonPosition(player, patch)
      markLeagueBoardCacheDirty()
      setSavedLayer(patch.positionLayer)
      setSavedPosition(patch.primaryPosition)
      setPositionSaved(Boolean(patch.positionLayer))
    } catch (err) {
      setPositionError(err?.message || 'שמירת עמדה נכשלה')
    } finally {
      setSavingPosition(false)
    }
  }

  return (
    <Box sx={sx.scanResultRow}>
      <Box sx={sx.scanResultMain}>
        <Box sx={sx.scanIdentityCell}>
          <InlineEntityLink href={playerUrl} level="title-sm">
            {player.fullName || player.playerName || player.name || '-'}
          </InlineEntityLink>

          <Typography level="body-xs" sx={sx.scanSubtext}>
            <InlineEntityLink href={leagueUrl}>
              {valueOrDash(player.leagueName)}
            </InlineEntityLink>
            <Box component="span" sx={sx.subtextDivider}>|</Box>
            <InlineEntityLink href={teamUrl}>
              {valueOrDash(player.clubName || player.teamName)}
            </InlineEntityLink>
            <Box component="span" sx={sx.subtextDivider}>|</Box>
            <Box component="span">{valueOrDash(player.birthYear || player.teamBirthYear)}</Box>
          </Typography>
        </Box>

        <Box sx={sx.scanPositionCell}>
          <Select
            size="sm"
            variant="plain"
            value={selectedLayer || null}
            placeholder="חוליה"
            sx={sx.scanSelect}
            onClick={event => event.stopPropagation()}
            onChange={(event, value) => {
              event?.stopPropagation?.()
              handleLayerChange(value)
            }}
          >
            {layerOptions.map(option => (
              <Option key={option.id} value={option.id}>
                {option.label}
              </Option>
            ))}
          </Select>

          <Select
            size="sm"
            variant="plain"
            value={selectedPosition || null}
            placeholder="עמדה"
            disabled={!selectedLayer}
            sx={sx.scanSelect}
            onClick={event => event.stopPropagation()}
            onChange={(event, value) => {
              event?.stopPropagation?.()
              setSelectedPosition(clean(value))
            }}
          >
            {positionOptions.map(option => (
              <Option key={option.code} value={option.code}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Box>

        <Box sx={sx.scanStatsTable}>
          <StatCell label="מש׳" value={games} />
          <StatCell label="דק׳" value={current.minutes ?? player.minutes} />
          <StatCell label="שערים" value={current.goals ?? player.goals} />
          <StatCell label="צהוב" value={current.yellowCards ?? player.yellowCards} />
          <StatCell label="פתח" value={`${valueOrDash(starts)}/${valueOrDash(games)}`} />
        </Box>
      </Box>

      <Box sx={sx.scanStatusRow}>
        <Box sx={sx.scanStatusLeft}>
          {showPositionStatus ? (
            <Chip size="sm" variant="soft" color={position.sourceColor}>
              {hasPositionDraft ? 'ממתין לאישור עמדה' : position.sourceLabel}
            </Chip>
          ) : null}

          {profileChips.map(item => (
            <Chip
              key={item.id || item.label}
              size="sm"
              variant="soft"
              color="primary"
              startDecorator={item.idIcon ? iconUi({ id: item.idIcon, size: 'small' }) : null}
            >
              {item.label}
            </Chip>
          ))}

          {position.positions.length ? (
            <Typography level="body-xs" sx={sx.rowMeta}>
              עמדות מקור: {listText(position.positions)}
            </Typography>
          ) : null}
        </Box>

        <Box sx={sx.scanStatusActions}>
          {positionError ? (
            <Typography level="body-xs" sx={sx.errorInline}>
              {positionError}
            </Typography>
          ) : null}

          {hasPositionDraft ? (
            <Button
              size="sm"
              color="success"
              variant="soft"
              loading={savingPosition}
              disabled={!clean(selectedLayer)}
              onClick={savePosition}
            >
              אשר בחירה
            </Button>
          ) : null}

          {reliability ? (
            <Chip size="sm" variant="soft" color="neutral">
              ודאות {reliability}
            </Chip>
          ) : null}

          {score != null ? (
            <Chip size="sm" variant="soft" color="neutral">
              ציון {score}
            </Chip>
          ) : null}

          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            sx={sx.editIconButton}
            title="עריכה"
            onClick={() => onEditLink?.(player)}
          >
            {iconUi({ id: 'edit', size: 'small' })}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

function ScanPlayersReport({ row, resultRows = [] }) {
  return (
    <Box className="dpPrintSection" sx={sx.printSection}>
      <ReportShell
        title="שחקנים חיצוניים מומלצים"
        reportDate={new Date().toLocaleDateString('en-CA')}
        reportType="player-scan"
        status="active"
        entity={{
          name: row?.title || '-',
          subtitle: row?.subtitle || '',
        }}
        metaItems={[
          { label: 'פרופיל סריקה', value: row?.title || '-' },
          { label: 'שחקנים בדוח', value: resultRows.length || 0 },
          { label: 'ליגות', value: row?.leaguesCount || 0 },
        ]}
      >
        <Box component="table" sx={sx.printTable}>
          <thead>
            <tr>
              <th></th>
              <th>שחקן</th>
              <th>ליגה</th>
              <th>מועדון</th>
              <th>שנתון</th>
              <th>חוליה</th>
              <th>עמדה</th>
              <th>דק׳</th>
              <th>שערים</th>
              <th>פתח</th>
            </tr>
          </thead>

          <tbody>
            {resultRows.map((player, index) => {
              const current = player.current || {}
              const games = current.games ?? player.games
              const starts = current.starts ?? player.starts
              const position = getPlayerPositionInfo(player)

              return (
                <tr key={player.searchDocId || player.id}>
                  <td>{index + 1}</td>
                  <td>{valueOrDash(player.fullName || player.playerName || player.name)}</td>
                  <td>{valueOrDash(player.leagueName)}</td>
                  <td>{valueOrDash(player.clubName || player.teamName)}</td>
                  <td>{valueOrDash(player.birthYear || player.teamBirthYear)}</td>
                  <td>{clean(position.layerLabel) === '-' ? '' : position.layerLabel}</td>
                  <td>{clean(position.primaryPosition)}</td>
                  <td>{valueOrDash(current.minutes ?? player.minutes)}</td>
                  <td>{valueOrDash(current.goals ?? player.goals)}</td>
                  <td>{`${valueOrDash(starts)}/${valueOrDash(games)}`}</td>
                </tr>
              )
            })}
          </tbody>
        </Box>

        <Box sx={sx.reportBoxes}>
          <Box sx={sx.reportEmptyBox} />
          <Box sx={sx.reportEmptyBox} />
          <Box sx={sx.reportEmptyBox} />
        </Box>
      </ReportShell>
    </Box>
  )
}

function ProfileStats({ row }) {
  return (
    <Box sx={sx.rowStats}>
      <Chip size="sm" variant="soft" color={getScanStatusColor(row.status)}>
        {getScanStatusLabel(row.status)}
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        {row.leaguesCount || 0} ליגות
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        {row.scoutProfilesCount || 0} פרופילים
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        {row.loadedPlayersCount || 0} שחקנים נטענו
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        {row.loadedTeamsCount || 0}/{row.expectedTeamsCount || 0} קבוצות נטענו
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color={row.riskCount ? 'warning' : 'neutral'}
      >
        {row.riskCount || 0} בסיכון
      </Chip>
    </Box>
  )
}

function ProfileRow({
  row,
  selected,
  expanded,
  selectedProfileIds = [],
  result,
  onSelect,
  onToggle,
  onToggleProfile,
  onLoadDocuments,
  onEditLink,
}) {
  const profileBreakdown = getProfileBreakdownRows(row.profileCounts)
  const resultRows = result?.rows || []

  return (
    <Box sx={sx.collapseCard}>
    <Box
      className={selected ? 'isSelected' : ''}
      sx={sx.row}
      onClick={() => {
        onSelect(row.id)
        onToggle(row)
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography level="body-xs" sx={sx.rowMeta}>
          {scopeLabel[row.scope] || row.scope}
        </Typography>

        <Typography level="title-md" sx={sx.rowTitle}>
          {row.title}
        </Typography>

        <Typography level="body-sm" sx={sx.rowMeta}>
          {row.subtitle || '-'}
        </Typography>
      </Box>

      <Box sx={sx.rowStats}>
        <ProfileStats row={row} />

        <Button
          size="sm"
          variant="soft"
          color="primary"
          onClick={event => {
            event.stopPropagation()
            onToggle(row)
          }}
        >
          {expanded ? 'סגור' : 'בחר פרופילים'}
        </Button>
      </Box>
    </Box>

      {expanded ? (
        <Box sx={sx.collapseBody}>
          <Box sx={sx.profilePickerHeader}>
            <Typography level="title-sm" sx={sx.detailsTitle}>
              בחר פרופילים לטעינה
            </Typography>

            <Box sx={sx.profilePickerActions}>
              <Button
                size="sm"
                color="primary"
                loading={Boolean(result?.loading)}
                disabled={!selectedProfileIds.length}
                onClick={() => onLoadDocuments(row)}
              >
                טען מסמכי שחקנים
              </Button>

              <ReportPrintButton
                size="sm"
                variant="soft"
                color="neutral"
                startIcon="print"
                label="PDF"
                tooltip="שחקנים חיצוניים מומלצים"
                documentTitle="שחקנים חיצוניים מומלצים"
                disabled={!resultRows.length}
                renderContent={() => (
                  <ScanPlayersReport row={row} resultRows={resultRows} />
                )}
              />
            </Box>
          </Box>

          {profileBreakdown.length ? (
            <Box sx={sx.profilePicker}>
              {profileBreakdown.map(item => (
                <Checkbox
                  key={item.profileId}
                  size="sm"
                  label={`${item.label} (${item.count})`}
                  checked={selectedProfileIds.includes(item.profileId)}
                  onChange={() => onToggleProfile(row.id, item.profileId)}
                />
              ))}
            </Box>
          ) : (
            <Typography level="body-sm" sx={sx.rowMeta}>
              אין פרופילים זמינים לבחירה לפי התקציר הנוכחי.
            </Typography>
          )}

          {result?.error ? (
            <Typography sx={sx.error}>
              {result.error}
            </Typography>
          ) : null}

          {resultRows.length ? (
            <Box sx={sx.scanResults}>
              <Typography level="body-sm" sx={sx.rowMeta}>
                נטענו {resultRows.length} התאמות מתוך {result?.teamsCount || 0} קבוצות
              </Typography>

              {resultRows.map(player => (
                <ScanPlayerResult
                  key={`${player.searchDocId || player.id}-${player.profileId}-${player.teamSeasonKey}`}
                  player={player}
                  onEditLink={onEditLink}
                />
              ))}
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}

function Fact({ label, value }) {
  return (
    <Box sx={sx.fact}>
      <Typography sx={sx.factLabel}>
        {label}
      </Typography>

      <Typography sx={sx.factValue}>
        {value || '-'}
      </Typography>
    </Box>
  )
}

function DetailsPanel({ profile, onOpen }) {
  if (!profile) {
    return (
      <Box className="dpScrollThin" sx={sx.details}>
        <Typography level="body-sm">
          אין פרופיל נבחר.
        </Typography>
      </Box>
    )
  }

  const children = profile.children || []
  const profileBreakdown = getProfileBreakdownRows(profile.profileCounts)

  return (
    <Box className="dpScrollThin" sx={sx.details}>
      <Typography level="title-lg" sx={sx.detailsTitle}>
        {profile.title}
      </Typography>

      <Typography level="body-sm" sx={sx.rowMeta}>
        {profile.subtitle || scopeLabel[profile.scope]}
      </Typography>

      <Box sx={{ mt: 1 }}>
        <ProfileStats row={profile} />
      </Box>

      <Box sx={sx.facts}>
        <Fact label="ליגות" value={profile.leaguesCount} />
        <Fact
          label="קבוצות נטענו"
          value={`${profile.loadedTeamsCount || 0}/${profile.expectedTeamsCount || 0}`}
        />
        <Fact label="שחקנים נטענו" value={profile.loadedPlayersCount} />
        <Fact label="פרופילי סקאוט" value={profile.scoutProfilesCount} />
        <Fact label="בסיכון" value={profile.riskCount} />
        <Fact label="צילומים אחרונים" value={profile.snapshotsCount} />
        <Fact label="עדכון אחרון" value={profile.latestSnapshotAt} />
        <Fact label="סוג פרופיל" value={scopeLabel[profile.scope]} />
      </Box>

      {profile.scope === 'league' ? (
        <Button
          size="sm"
          color="primary"
          sx={{ mt: 1, width: '100%' }}
          onClick={() => onOpen(profile)}
        >
          פתח בחירת פרופילים
        </Button>
      ) : null}

      {profileBreakdown.length ? (
        <Box sx={sx.children}>
          <Typography level="title-sm" sx={sx.detailsTitle}>
            חלוקה לפי פרופיל
          </Typography>

          {profileBreakdown.map(item => (
            <Box key={item.profileId} sx={sx.profileBreakdownRow}>
              <Typography level="body-sm" sx={sx.rowTitle}>
                {item.label}
              </Typography>

              <Chip size="sm" variant="soft" color="neutral">
                {item.count} שחקנים
              </Chip>
            </Box>
          ))}
        </Box>
      ) : null}

      {children.length ? (
        <Box sx={sx.children}>
          <Typography level="title-sm" sx={sx.detailsTitle}>
            פרופילים כלולים
          </Typography>

          {children.slice(0, 10).map(child => (
            <Box key={child.id} sx={sx.childRow}>
              <Typography level="body-sm" sx={sx.rowTitle}>
                {child.title}
              </Typography>

              <Typography level="body-xs" sx={sx.rowMeta}>
                {child.subtitle}
              </Typography>
            </Box>
          ))}

          {children.length > 10 ? (
            <Typography level="body-xs" sx={sx.rowMeta}>
              מציג 10 מתוך {children.length}
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}

function PrintReport({ rows }) {
  return (
    <Box className="dpPrintSection" sx={sx.printSection}>
      <Typography level="h2">
        מרכז סריקה
      </Typography>

      <Typography level="body-sm">
        {rows.length} פרופילים בתצוגה המסוננת
      </Typography>

      <Box component="table" sx={sx.printTable}>
        <thead>
          <tr>
            <th>סוג</th>
            <th>פרופיל</th>
            <th>סטטוס</th>
            <th>ליגות</th>
            <th>שחקנים</th>
            <th>פרופילים</th>
            <th>בסיכון</th>
            <th>עדכון</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td>{scopeLabel[row.scope] || row.scope}</td>
              <td>{row.title}</td>
              <td>{getScanStatusLabel(row.status)}</td>
              <td>{row.leaguesCount || 0}</td>
              <td>{row.loadedPlayersCount || 0}</td>
              <td>{row.scoutProfilesCount || 0}</td>
              <td>{row.riskCount || 0}</td>
              <td>{row.latestSnapshotAt || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  )
}

export default function ScanCenterPage() {
  const navigate = useNavigate()
  const model = useScanCenter()
  const [teamLinkRow, setTeamLinkRow] = React.useState(null)
  const [teamLinkSaving, setTeamLinkSaving] = React.useState(false)
  const [teamLinkError, setTeamLinkError] = React.useState('')

  const openTeamLink = row => {
    setTeamLinkRow(row || null)
    setTeamLinkError('')
  }

  const closeTeamLink = () => {
    if (teamLinkSaving) return

    setTeamLinkRow(null)
    setTeamLinkError('')
  }

  const saveTeamLink = async value => {
    if (!teamLinkRow) return

    setTeamLinkSaving(true)
    setTeamLinkError('')

    try {
      await updateLeagueTeamLink({
        leagueId: teamLinkRow.leagueId,
        team: teamLinkRow,
        teamUrl: value,
      })

      markLeagueBoardCacheDirty()
      await model.loadSummaries({ force: true })
      setTeamLinkRow(null)
    } catch (err) {
      setTeamLinkError(err?.message || 'שמירת קישור הקבוצה נכשלה')
    } finally {
      setTeamLinkSaving(false)
    }
  }

  return (
    <Box sx={sx.root}>
      <Sheet sx={sx.shell}>
        <Box sx={sx.header}>
          <Box>
            <Typography level="h3" sx={sx.title}>
              מרכז סריקה
            </Typography>

            <Typography level="body-sm" sx={sx.meta}>
              פרופילי דאטה בייס, שנתונים וליגות. פירוט כבד נטען רק לפי פעולה.
            </Typography>
          </Box>

          <Box sx={sx.headerActions}>
            <Box sx={sx.kpis}>
              {model.kpis.map(item => (
                <Chip key={item.id} size="sm" variant="soft" color="neutral">
                  {item.value} {item.label}
                </Chip>
              ))}
            </Box>

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              startDecorator={iconUi({ id: 'back', size: 'small' })}
              onClick={() => navigate('/players-database')}
            >
              חזרה למאגר
            </Button>
          </Box>
        </Box>

        <Box sx={sx.toolbar}>
          <Select
            size="sm"
            value={model.scopeFilter}
            onChange={(_, value) => model.setScopeFilter(value || 'all')}
            sx={sx.field}
          >
            {SCAN_SCOPE_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>

          <Select
            size="sm"
            value={model.birthYearFilter}
            onChange={(_, value) => model.setBirthYearFilter(value || 'all')}
            sx={sx.field}
          >
            {model.yearOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>

          <Select
            size="sm"
            value={model.statusFilter}
            onChange={(_, value) => model.setStatusFilter(value || 'all')}
            sx={sx.field}
          >
            {SCAN_STATUS_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>

          <Select
            size="sm"
            value={model.profileFilter}
            onChange={(_, value) => model.setProfileFilter(value || 'all')}
            sx={sx.field}
          >
            {SCAN_PROFILE_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>

          <Input
            size="sm"
            value={model.search}
            placeholder="חיפוש פרופיל"
            onChange={event => model.setSearch(event.target.value)}
            sx={sx.field}
          />

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            loading={model.loading}
            onClick={() => model.loadSummaries({ force: true })}
          >
            רענן תקצירים
          </Button>

          <Button
            size="sm"
            color={model.indicatorsLoaded ? 'success' : 'primary'}
            loading={model.loadingIndicators}
            startDecorator={iconUi({ id: 'search', size: 'small' })}
            onClick={model.loadIndicators}
          >
            {model.indicatorsLoaded ? 'אינדיקציות נטענו' : 'טען אינדיקציות'}
          </Button>

          <ReportPrintButton
            size="sm"
            variant="soft"
            color="neutral"
            startIcon="print"
            label="הדפס"
            tooltip="הדפס מרכז סריקה"
            documentTitle="מרכז_סריקה"
            disabled={!model.filteredProfiles.length}
            renderContent={() => (
              <PrintReport rows={model.filteredProfiles} />
            )}
          />
        </Box>

        <Box sx={sx.body}>
          <Box sx={sx.listPanel}>
            <Box sx={sx.listHeader}>
              <Typography level="title-md" sx={sx.title}>
                פרופילים לסריקה
              </Typography>

              <Chip size="sm" variant="soft" color="neutral">
                {model.filteredProfiles.length} בתצוגה
              </Chip>
            </Box>

            <Box className="dpScrollThin" sx={sx.list}>
              {model.error ? (
                <Typography sx={sx.error}>
                  {model.error}
                </Typography>
              ) : null}

              {model.indicatorError ? (
                <Typography sx={sx.error}>
                  {model.indicatorError}
                </Typography>
              ) : null}

              {model.filteredProfiles.map(row => (
                <ProfileRow
                  key={row.id}
                  row={row}
                  selected={row.id === model.selectedProfile?.id}
                  expanded={Boolean(model.expandedIds[row.id])}
                  selectedProfileIds={model.selectedProfilesById[row.id] || []}
                  result={model.scanResultsById[row.id]}
                  onSelect={model.setSelectedId}
                  onToggle={model.openProfile}
                  onToggleProfile={model.toggleProfileForLoad}
                  onLoadDocuments={model.loadProfileDocuments}
                  onEditLink={openTeamLink}
                />
              ))}
            </Box>
          </Box>

          <DetailsPanel
            profile={model.selectedProfile}
            onOpen={model.openProfile}
          />
        </Box>

        <TeamLinkModal
          open={Boolean(teamLinkRow)}
          row={teamLinkRow}
          saving={teamLinkSaving}
          error={teamLinkError}
          onClose={closeTeamLink}
          onSave={saveTeamLink}
        />
      </Sheet>
    </Box>
  )
}
