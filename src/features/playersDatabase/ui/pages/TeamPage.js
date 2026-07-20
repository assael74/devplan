// features/playersDatabase/ui/pages/TeamPage.js

import * as React from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Option,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import PlayersDatabaseLayout from '../layout/PlayersDatabaseLayout.js'
import Breadcrumbs from '../layout/Breadcrumbs.js'
import DataTable from '../components/tables/DataTable.js'
import ScoutProfileChip from '../components/scout/ScoutProfileChip.js'
import ScoutPriority from '../components/scout/ScoutPriority.js'
import ActivityStatusChip from '../components/status/ActivityStatusChip.js'
import {
  DataImportModal,
  PlayersDatabaseModal,
} from '../components/modals/index.js'

import { useTeamPage } from '../hooks/useTeamPage.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../logic/routeBuilders.js'
import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../services/write/index.js'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../ui/core/images/playerImage.jpg'
import { useSnackbar } from '../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { POSITION_LAYERS } from '../../../../shared/players/players.constants.js'
import { teamSx as sx } from './sx/team.sx.js'


const PLAYER_ROSTER_PLACEHOLDER = [
  'אינדקס\tשם השחקן\tמזהה שחקן חיצוני\tקישור שחקן\tמספר חולצה',
  '1\tישראל ישראלי\t123456\t/players/player/?player_id=123456&season_id=27\t7',
].join('\n')

const PLAYER_ROSTER_COLUMNS = [
  {
    key: 'index',
    label: 'אינדקס',
    readOnly: true,
  },
  {
    key: 'fullName',
    label: 'שם השחקן',
    required: true,
  },
  {
    key: 'externalPlayerId',
    label: 'מזהה שחקן חיצוני',
  },
  {
    key: 'playerUrl',
    label: 'קישור שחקן',
  },
  {
    key: 'numShirt',
    label: 'מספר חולצה',
  },
]

const PLAYER_STATS_PLACEHOLDER = [
  'אינדקס\tשם השחקן\tמס. משחקים\tשערים\tכ. צהובים\tטוטו\tכ. אדומים\tהרכב פותח\tנכנס כמחליף\tהוחלף\tדקות משחק',
  '1\tישראל ישראלי\t29\t3\t0\t0\t0\t28\t1\t1\t2458',
].join('\n')

const PLAYER_STATS_BASE_COLUMNS = [
  { key: 'index', label: 'אינדקס', readOnly: true, sx: { width: 58, minWidth: 58 } },
  {
    key: 'fullName',
    label: 'שם השחקן',
    required: true,
    sx: {
      minWidth: 150,
      textAlign: 'left !important',
    },
  },
  { key: 'games', label: 'משחקים', sx: { width: 78 } },
  { key: 'goals', label: 'שערים', sx: { width: 78 } },
  { key: 'starts', label: 'הרכב פותח', sx: { width: 92 } },
  { key: 'minutes', label: 'דקות משחק', sx: { width: 92 } },
]

const STATS_ROSTER_STATUS_OPTIONS = [
  { value: 'transferredOut', label: 'עבר קבוצה' },
  { value: 'transferredIn', label: 'הגיע מקבוצה אחרת' },
  { value: 'retired', label: 'פרש' },
  { value: 'youngerAgeGroup', label: 'שנתון צעיר' },
]

const clean = value => String(value ?? '').trim()
const toNumber = value => Number(clean(value).replace(/,/g, '')) || 0

const POSITION_LAYER_LABELS = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קישור אחורי',
  midfield: 'קישור',
  atMidfield: 'קישור התקפי',
  attack: 'התקפה',
}

const POSITION_LABELS = {
  S: 'חלוץ',
  AR: 'כנף ימין',
  AC: 'קשר התקפי',
  AL: 'כנף שמאל',
  MCR: 'קשר אמצע ימין',
  MCL: 'קשר אמצע שמאל',
  DMR: 'מגן / כנף ימין',
  DM: 'קשר אחורי',
  DML: 'מגן / כנף שמאל',
  DR: 'מגן ימין',
  DCR: 'בלם ימני',
  DCL: 'בלם שמאלי',
  DL: 'מגן שמאל',
  GK: 'שוער',
}

const POSITION_LAYER_OPTIONS = Object.keys(POSITION_LAYERS).map(key => ({
  value: key,
  label: POSITION_LAYER_LABELS[key] || key,
}))

const POSITION_OPTIONS = Object.values(POSITION_LAYERS)
  .flat()
  .map(position => ({
    value: position.code,
    label: POSITION_LABELS[position.code] || position.code,
  }))

const getOptionLabel = (options, value) => {
  const cleanValue = clean(value)
  if (!cleanValue) return 'ללא'

  return options.find(option => option.value === cleanValue)?.label || cleanValue
}

const hasOptionValue = (options, value) =>
  options.some(option => option.value === clean(value))

const formatRate = value => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '-'

  return `${Math.round(numberValue)}%`
}

const formatValue = value => {
  if (value === null || value === undefined || value === '') return '-'

  return value
}

const isSmallIndex = value => {
  const nextValue = Number(clean(value))
  return Number.isInteger(nextValue) && nextValue > 0 && nextValue <= 200
}

const isPlayerUrl = value => {
  const nextValue = clean(value).toLowerCase()

  return (
    nextValue.includes('/players/player') ||
    nextValue.includes('player_id=') ||
    /^https?:\/\//.test(nextValue)
  )
}

const isExternalPlayerId = value =>
  /^\d{4,}$/.test(clean(value))

const resolveRosterDataCells = (cells, rowIndex) => {
  const hasIndexCell = isSmallIndex(cells[0]) && (
    clean(cells[0]) === `${rowIndex + 1}` ||
    !isExternalPlayerId(cells[1])
  )

  return hasIndexCell ? cells.slice(1) : cells
}

const parsePlayerRosterRows = value => {
  const rows = clean(value)
    .split(/\r?\n/)
    .map(row => row.trim())
    .filter(Boolean)

  return rows
    .filter((row, index) => {
      if (index !== 0) return true
      return !row.includes('שם השחקן')
    })
    .map((row, index) => {
      const cells = row.split('\t').map(clean)
      const dataCells = resolveRosterDataCells(cells, index)
      const playerUrl = dataCells.find(isPlayerUrl) || ''
      const externalPlayerId = dataCells.find(cell => (
        cell !== playerUrl && isExternalPlayerId(cell)
      )) || ''
      const fullName = dataCells.find(cell => (
        cell &&
        cell !== playerUrl &&
        cell !== externalPlayerId
      )) || ''
      const numShirt = dataCells.find(cell => (
        cell !== externalPlayerId &&
        isSmallIndex(cell)
      )) || ''

      return {
        id: `${index + 1}_${externalPlayerId || fullName || 'player'}`,
        index: `${index + 1}`,
        fullName,
        externalPlayerId,
        playerUrl,
        numShirt,
      }
    })
}

const normalizeImportHeader = value => clean(value)
  .replace(/[.״"׳']/g, '')
  .replace(/\s+/g, ' ')

const buildHeaderMap = headers => headers.reduce((map, header, index) => {
  const normalizedHeader = normalizeImportHeader(header)

  if (normalizedHeader.includes('אינדקס')) map.index = index
  if (
    normalizedHeader.includes('שם השחקן') ||
    normalizedHeader.includes('שם שחקן')
  ) map.fullName = index
  if (
    normalizedHeader.includes('משחקי ליגה') ||
    (
      normalizedHeader.includes('משחקים') &&
      !normalizedHeader.includes('דקות')
    )
  ) map.games = index
  if (
    normalizedHeader === 'שערים' ||
    normalizedHeader.includes('שערי ליגה') ||
    normalizedHeader.endsWith(' שערים')
  ) map.goals = index
  if (
    normalizedHeader.includes('צהובים ליגה') ||
    normalizedHeader.includes('כ צהובים') ||
    normalizedHeader.includes('צהובים')
  ) map.yellowCards = index
  if (normalizedHeader.includes('הרכב פותח')) map.starts = index
  if (normalizedHeader.includes('נכנס כמחליף')) map.substituteIn = index
  if (normalizedHeader.includes('הוחלף')) map.substitutedOut = index
  if (
    normalizedHeader.includes('דקות ליגה') ||
    normalizedHeader.includes('דקות משחק')
  ) map.minutes = index

  return map
}, {})

const hasPlayerStatsHeader = row => {
  const normalizedRow = normalizeImportHeader(row)

  return (
    (
      normalizedRow.includes('שם השחקן') ||
      normalizedRow.includes('שם שחקן')
    ) &&
    (
      normalizedRow.includes('דקות ליגה') ||
      normalizedRow.includes('דקות משחק') ||
      normalizedRow.includes('משחקי ליגה') ||
      normalizedRow.includes('משחקים')
    )
  )
}

const getMappedCell = ({ cells, headerMap, key, fallbackIndex }) => {
  const mappedIndex = headerMap[key]

  if (Number.isInteger(mappedIndex)) return cells[mappedIndex] || ''

  return cells[fallbackIndex] || ''
}

const hasMappedStatsHeader = headerMap => (
  Number.isInteger(headerMap.fullName) ||
  Number.isInteger(headerMap.games) ||
  Number.isInteger(headerMap.minutes)
)

const hasTextValue = value => /[^\d\s,.-]/.test(clean(value))

const isReversedStatsRow = cells => {
  if (cells.length < 9) return false

  const lastCell = cells[cells.length - 1]
  const beforeLastCell = cells[cells.length - 2]

  return (
    toNumber(cells[0]) > 0 &&
    (
      hasTextValue(beforeLastCell) ||
      hasTextValue(cells[cells.length - 1])
    ) &&
    (
      isSmallIndex(lastCell) ||
      hasTextValue(lastCell)
    )
  )
}

const buildStatsFallbackMap = cells => {
  if (isReversedStatsRow(cells)) {
    const hasTrailingIndex = isSmallIndex(cells[cells.length - 1])
    const indexPosition = hasTrailingIndex ? cells.length - 1 : null
    const namePosition = hasTrailingIndex ? cells.length - 2 : cells.length - 1
    const gamesPosition = namePosition - 1
    const goalsPosition = gamesPosition - 1

    return {
      index: indexPosition,
      fullName: namePosition,
      games: gamesPosition,
      goals: goalsPosition,
      yellowCards: goalsPosition - 1,
      starts: 3,
      substituteIn: 2,
      substitutedOut: 1,
      minutes: 0,
    }
  }

  if (cells.length >= 11) {
    return {
      index: 0,
      fullName: 1,
      games: 2,
      goals: 3,
      yellowCards: 4,
      starts: 7,
      substituteIn: 8,
      substitutedOut: 9,
      minutes: 10,
    }
  }

  if (cells.length >= 10 && hasTextValue(cells[0])) {
    return {
      index: null,
      fullName: 0,
      games: 1,
      goals: 2,
      yellowCards: 3,
      starts: 6,
      substituteIn: 7,
      substitutedOut: 8,
      minutes: 9,
    }
  }

  return {
    index: 0,
    fullName: 1,
    games: 2,
    goals: 3,
    yellowCards: 4,
    starts: 5,
    substituteIn: 6,
    substitutedOut: 7,
    minutes: 8,
  }
}

const isNumberToken = value => /^-?\d+(?:[,.]\d+)?$/.test(clean(value))

const splitStatsCells = row => {
  if (row.includes('\t')) return row.split('\t').map(clean)

  const spacedCells = row
    .split(/\s{2,}/)
    .map(clean)
    .filter(Boolean)

  return spacedCells.length > 1 ? spacedCells : [clean(row)]
}

const buildLooseStatsRow = (row, rowIndex) => {
  const tokens = clean(row).split(/\s+/).filter(Boolean)
  if (tokens.length < 9) return null

  const firstTokenIsIndex = isSmallIndex(tokens[0])
  const lastTokenIsIndex = isSmallIndex(tokens[tokens.length - 1])
  const firstTokenLooksMinutes = isNumberToken(tokens[0]) && toNumber(tokens[0]) > 200

  if (firstTokenIsIndex) {
    const index = tokens[0]
    const trailingNumbers = []
    let pointer = tokens.length - 1

    while (pointer > 0 && isNumberToken(tokens[pointer])) {
      trailingNumbers.unshift(tokens[pointer])
      pointer -= 1
    }

    const name = tokens.slice(1, pointer + 1).join(' ')
    if (!name || trailingNumbers.length < 7) return null

    const hasRedCards = trailingNumbers.length >= 8
    const statsStart = Math.max(0, trailingNumbers.length - (hasRedCards ? 8 : 7))
    const stats = trailingNumbers.slice(statsStart)

    return {
      id: `${rowIndex + 1}_${name || 'player'}`,
      index,
      fullName: name,
      games: toNumber(stats[0]),
      goals: toNumber(stats[1]),
      yellowCards: toNumber(stats[2]),
      starts: toNumber(stats[hasRedCards ? 4 : 3]),
      substituteIn: toNumber(stats[hasRedCards ? 5 : 4]),
      substitutedOut: toNumber(stats[hasRedCards ? 6 : 5]),
      minutes: toNumber(stats[hasRedCards ? 7 : 6]),
    }
  }

  if (firstTokenLooksMinutes && lastTokenIsIndex) {
    const index = tokens[tokens.length - 1]
    const nameEnd = tokens.length - 2
    let nameStart = nameEnd

    while (nameStart > 0 && !isNumberToken(tokens[nameStart - 1])) {
      nameStart -= 1
    }

    const name = tokens.slice(nameStart, nameEnd + 1).join(' ')
    const numbers = tokens.slice(0, nameStart)
    if (!name || numbers.length < 7) return null

    return {
      id: `${rowIndex + 1}_${name || 'player'}`,
      index,
      fullName: name,
      games: toNumber(numbers[numbers.length - 1]),
      goals: toNumber(numbers[numbers.length - 2]),
      yellowCards: toNumber(numbers[numbers.length - 3]),
      starts: toNumber(numbers[3]),
      substituteIn: toNumber(numbers[2]),
      substitutedOut: toNumber(numbers[1]),
      minutes: toNumber(numbers[0]),
    }
  }

  return null
}
const getStatsCell = ({ cells, headerMap, fallback, key }) => {
  if (hasMappedStatsHeader(headerMap)) {
    return getMappedCell({
      cells,
      headerMap,
      key,
      fallbackIndex: fallback[key],
    })
  }

  const fallbackIndex = fallback[key]

  if (!Number.isInteger(fallbackIndex)) return ''

  return cells[fallbackIndex] || ''
}

const normalizePlayerNameValue = value => clean(value)
  .replace(/[.״"׳']/g, '')
  .replace(/\s+/g, ' ')
  .toLowerCase()

const buildPlayerNameVariants = value => {
  const normalizedName = normalizePlayerNameValue(value)
  const parts = normalizedName.split(' ').filter(Boolean)
  const variants = new Set()

  if (normalizedName) variants.add(normalizedName)
  if (parts.length === 2) variants.add(`${parts[1]} ${parts[0]}`)

  return variants
}

const getRosterPlayerOptionValue = player => clean(
  player?.playerDocumentId ||
  player?.playerId ||
  player?.externalPlayerId ||
  player?.fullName
)

const buildRosterLookup = players => {
  const names = new Set()
  const ids = new Set()
  const byName = new Map()
  const byOptionValue = new Map()

  players.forEach(player => {
    buildPlayerNameVariants(player.fullName).forEach(name => {
      names.add(name)
      if (!byName.has(name)) byName.set(name, player)
    })
    buildPlayerNameVariants(player.normalizedName).forEach(name => {
      names.add(name)
      if (!byName.has(name)) byName.set(name, player)
    })

    if (player.externalPlayerId) ids.add(clean(player.externalPlayerId))
    if (player.playerId) ids.add(clean(player.playerId))

    const optionValue = getRosterPlayerOptionValue(player)
    if (optionValue) byOptionValue.set(optionValue, player)
  })

  return {
    names,
    ids,
    byName,
    byOptionValue,
    players,
  }
}

const findRosterPlayerByValue = (players, value) => {
  const optionValue = clean(value)
  if (!optionValue) return null

  return players.find(player => getRosterPlayerOptionValue(player) === optionValue) || null
}

const findStatsRosterMatch = (row, rosterLookup) => {
  if (!row || !rosterLookup) return null

  const selectedPlayer = rosterLookup.byOptionValue?.get(clean(row.matchedPlayerId))
  if (selectedPlayer) return selectedPlayer

  const nameVariants = buildPlayerNameVariants(row.fullName)
  for (const name of nameVariants) {
    const matchedPlayer = rosterLookup.byName?.get(name)
    if (matchedPlayer) return matchedPlayer
  }

  return null
}

const enrichStatsRowForPreview = (row, rosterLookup) => {
  const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
  const matchedName = matchedPlayer?.fullName || row.fullName || ''
  const pastedName = row.fullName || ''
  const isAlias = matchedPlayer
    && pastedName
    && normalizePlayerNameValue(pastedName) !== normalizePlayerNameValue(matchedName)

  return {
    ...row,
    fullName: matchedName,
    originalFullName: pastedName,
    aliases: isAlias ? [pastedName] : [],
    matchedPlayerId: matchedPlayer ? getRosterPlayerOptionValue(matchedPlayer) : '',
    matchedPlayerName: matchedPlayer?.fullName || '',
    rosterStatus: matchedPlayer ? 'regular' : 'unresolved',
    isYoungerAgeGroup: false,
  }
}

const parsePlayerStatsRows = value => {
  const rows = clean(value)
    .split(/\r?\n/)
    .map(row => row.trim())
    .filter(Boolean)
  const headerRowIndex = rows.findIndex(hasPlayerStatsHeader)
  const headerCells = headerRowIndex >= 0
    ? splitStatsCells(rows[headerRowIndex])
    : []
  const headerMap = headerCells.length ? buildHeaderMap(headerCells) : {}
  const dataRows = headerCells.length ? rows.slice(headerRowIndex + 1) : rows

  return dataRows.map((row, index) => {
    const cells = splitStatsCells(row)
    const looseRow = !hasMappedStatsHeader(headerMap) && cells.length === 1
      ? buildLooseStatsRow(row, index)
      : null

    if (looseRow) return looseRow

    const fallback = buildStatsFallbackMap(cells)
    const fullName = getStatsCell({ cells, headerMap, fallback, key: 'fullName' })
    const rowIndex = getStatsCell({ cells, headerMap, fallback, key: 'index' })

    return {
      id: `${index + 1}_${fullName || cells[0] || 'player'}`,
      index: rowIndex || `${index + 1}`,
      fullName,
      games: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'games' })),
      goals: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'goals' })),
      yellowCards: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'yellowCards' })),
      starts: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'starts' })),
      substituteIn: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'substituteIn' })),
      substitutedOut: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'substitutedOut' })),
      minutes: toNumber(getStatsCell({ cells, headerMap, fallback, key: 'minutes' })),
    }
  })
}
const buildActions = ({ hasTeamPlayers }) => [
  {
    id: 'players',
    label: hasTeamPlayers ? 'טעינת שחקן בודד' : 'טעינת סגל',
    iconId: 'upload',
    primary: true,
    disabled: false,
  },
  {
    id: 'stats',
    label: 'טעינת סטטיסטיקות',
    iconId: 'addStats',
    disabled: !hasTeamPlayers,
  },
  {
    id: 'deletePlayers',
    label: 'מחיקת שחקנים',
    iconId: 'delete',
    danger: true,
    disabled: !hasTeamPlayers,
  },
  {
    id: 'link',
    label: 'עריכת קישור שנתון',
    iconId: 'addLink',
    disabled: false,
  },
]

function TeamKpiCard({
  title,
  value,
  iconId,
  priorityLevel,
  details = [],
}) {
  return (
    <Card sx={sx.teamKpiCard}>
      <Box sx={sx.teamKpiMain}>
        <Box sx={sx.teamKpiText}>
          <Typography
            level='body-sm'
            sx={sx.teamKpiTitle}
          >
            {title}
          </Typography>

          <Box sx={sx.teamKpiValueRow}>
            <Typography
              level='h2'
              sx={sx.teamKpiValue}
            >
              {value}
            </Typography>

            {priorityLevel ? (
              <ScoutPriority
                value={priorityLevel}
                fontSize={12}
              />
            ) : null}
          </Box>
        </Box>

        {iconId ? (
          <Box sx={sx.teamKpiIcon}>
            {iconUi({
              id: iconId,
              size: 'md',
            })}
          </Box>
        ) : null}
      </Box>

      <Box sx={sx.teamKpiDetails}>
        {details.map(detail => {
          const content = (
            <Box
              key={detail.label}
              sx={sx.teamKpiDetail}
            >
              <Typography
                level='body-xs'
                sx={sx.teamKpiDetailLabel}
              >
                {detail.label}
              </Typography>

              <Typography
                level='body-sm'
                sx={sx.teamKpiDetailValue}
              >
                {detail.value}
              </Typography>
            </Box>
          )

          if (!detail.tooltip) return content

          return (
            <Tooltip
              key={detail.label}
              title={detail.tooltip}
              arrow
            >
              {content}
            </Tooltip>
          )
        })}
      </Box>
    </Card>
  )
}

function TeamActionsPanel({
  selectedSeasonKey,
  seasonOptions,
  hasTeamPlayers,
  profileOnly,
  onSeasonChange,
  onProfileOnlyChange,
  onPlayersImport,
  onStatsImport,
}) {
  const actions = buildActions({ hasTeamPlayers })

  const handleAction = actionId => {
    if (actionId === 'players') {
      onPlayersImport()
      return
    }

    if (actionId === 'stats') {
      onStatsImport()
    }
  }

  return (
    <Card sx={sx.actionsPanel}>
      <Typography
        level='title-lg'
        sx={sx.panelTitle}
      >
        פעולות אפשריות
      </Typography>

      <Box sx={sx.actionSeasonBox}>
        <Typography
          level='body-xs'
          sx={sx.actionSeasonLabel}
        >
          עונת משחקים
        </Typography>

        <Select
          size='sm'
          value={selectedSeasonKey || ''}
          onChange={(_, value) => onSeasonChange(value || '')}
          sx={sx.actionSeasonSelect}
        >
          {seasonOptions.length ? (
            seasonOptions.map(option => (
              <Option
                key={`${option.target}-${option.seasonKey}`}
                value={option.seasonKey}
              >
                {option.seasonKey}
              </Option>
            ))
          ) : (
            <Option value=''>אין עונות</Option>
          )}
        </Select>
      </Box>

      <Box sx={sx.actionFiltersRow}>
        <Chip
          variant={profileOnly ? 'solid' : 'soft'}
          startDecorator={iconUi({
            id: 'profile',
            size: 'sm',
          })}
          onClick={() => onProfileOnlyChange(!profileOnly)}
          sx={profileOnly ? sx.actionFilterChipActive : sx.actionFilterChip}
        >
          רק שחקנים עם פרופיל
        </Chip>
      </Box>

      <Divider sx={sx.actionDivider} />

      <Stack
        spacing={1}
        className='dpScrollThin'
        sx={sx.actionsList}
      >
        {actions.map(action => (
          <Button
            key={action.id}
            disabled={action.disabled}
            variant={action.primary ? 'solid' : 'outlined'}
            startDecorator={iconUi({
              id: action.iconId,
              size: 'sm',
            })}
            sx={
              action.primary
                ? sx.primaryActionButton
                : action.danger
                  ? sx.dangerActionButton
                  : sx.secondaryActionButton
            }
            onClick={() => handleAction(action.id)}
          >
            {action.label}
          </Button>
        ))}
      </Stack>
    </Card>
  )
}

export default function TeamPage() {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const [roleModalRow, setRoleModalRow] = React.useState(null)
  const [roleDraft, setRoleDraft] = React.useState({
    positionLayer: '',
    primaryPosition: '',
  })
  const [roleBusy, setRoleBusy] = React.useState(false)
  const [rosterModalOpen, setRosterModalOpen] = React.useState(false)
  const [rosterPasteValue, setRosterPasteValue] = React.useState('')
  const [rosterRows, setRosterRows] = React.useState([])
  const [rosterBusy, setRosterBusy] = React.useState(false)
  const [statsModalOpen, setStatsModalOpen] = React.useState(false)
  const [statsPasteValue, setStatsPasteValue] = React.useState('')
  const [statsRows, setStatsRows] = React.useState([])
  const [statsBusy, setStatsBusy] = React.useState(false)
  const [profileOnly, setProfileOnly] = React.useState(false)
  const {
    leagueId,
    leagueDoc,
    team,
    players,
    hasTeamPlayers,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    reload,
  } = useTeamPage()

  const rosterLookup = React.useMemo(() => buildRosterLookup(players), [players])
  const rosterPlayerOptions = React.useMemo(() => [
    { value: '', label: 'ללא התאמה' },
    ...players.map(player => ({
      value: getRosterPlayerOptionValue(player),
      label: player.fullName || player.normalizedName || player.playerId || 'שחקן ללא שם',
    })).filter(option => option.value),
  ], [players])
  const statsNameColumn = React.useMemo(() => ({
    ...PLAYER_STATS_BASE_COLUMNS[1],
    render: ({ row, rowIndex, column, value, onCellChange }) => {
      const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
      const isException = STATS_ROSTER_STATUS_OPTIONS.some(option => (
        option.value === row.rosterStatus
      ))

      if ((matchedPlayer && row.rosterStatus === 'regular') || isException) {
        return (
          <Typography level='body-sm' sx={{ fontWeight: 600, textAlign: 'left' }}>
            {value || '-'}
          </Typography>
        )
      }

      return (
        <Select
          size='sm'
          value={row.matchedPlayerId || null}
          placeholder={value || 'בחר שחקן מהסגל'}
          sx={{ minWidth: 190, textAlign: 'left' }}
          onChange={(event, nextValue) => {
            if (typeof onCellChange === 'function') {
              onCellChange({
                row,
                rowIndex,
                column: { ...column, key: 'fullNameRosterMatch' },
                value: nextValue || '',
              })
            }
          }}
        >
          {rosterPlayerOptions.filter(option => option.value).map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      )
    },
  }), [rosterLookup, rosterPlayerOptions])

  const statsExceptionColumn = React.useMemo(() => ({
    key: 'rosterStatus',
    label: 'סיווג חריג',
    sx: { minWidth: 150 },
    render: ({ row, rowIndex, column, onCellChange }) => {
      const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
      const isException = STATS_ROSTER_STATUS_OPTIONS.some(option => (
        option.value === row.rosterStatus
      ))

      if (matchedPlayer && !isException) {
        return null
      }

      return (
        <Select
          size='sm'
          value={isException ? row.rosterStatus : null}
          placeholder='בחר חריג'
          sx={{ minWidth: 150 }}
          onChange={(event, nextValue) => {
            if (typeof onCellChange === 'function') {
              onCellChange({
                row,
                rowIndex,
                column,
                value: nextValue || 'unresolved',
              })
            }
          }}
        >
          {STATS_ROSTER_STATUS_OPTIONS.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      )
    },
  }), [rosterLookup])

  const statsColumns = React.useMemo(() => [
    PLAYER_STATS_BASE_COLUMNS[0],
    statsNameColumn,
    statsExceptionColumn,
    ...PLAYER_STATS_BASE_COLUMNS.slice(2),
  ], [statsExceptionColumn, statsNameColumn])

  const getStatsRowStatus = React.useCallback(row => {
    const status = clean(row.rosterStatus || 'unresolved')
    const matchedPlayer = findStatsRosterMatch(row, rosterLookup)
    const isException = STATS_ROSTER_STATUS_OPTIONS.some(option => (
      option.value === status
    ))

    if (!clean(row.fullName)) {
      return { valid: false, message: 'חסר שם שחקן' }
    }

    if (matchedPlayer && status === 'regular') {
      return { valid: true, message: 'השורה תקינה' }
    }

    if (isException) {
      return { valid: true, message: 'חריג סווג' }
    }

    return { valid: false, message: 'יש לבחור שחקן מהסגל או לסווג חריג' }
  }, [rosterLookup])
  const hasInvalidStatsRows = React.useMemo(() => (
    statsRows.some(row => !getStatsRowStatus(row).valid)
  ), [statsRows, getStatsRowStatus])

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'מרכז ליגות',
      to: PLAYERS_DATABASE_UI_ROUTES.leagues,
    },
    {
      label: team.leagueName,
      to: PLAYERS_DATABASE_UI_ROUTES.league(leagueId),
    },
    {
      label: team.name,
    },
  ])
  const visiblePlayers = React.useMemo(() => {
    if (!profileOnly) return players

    return players.filter(player => (
      Array.isArray(player.scoutProfiles) &&
      player.scoutProfiles.length > 0
    ))
  }, [players, profileOnly])

  const columns = [
    {
      key: 'number',
      label: '#',
      sx: sx.indexColumn,
    },
    {
      key: 'avatar',
      label: '',
      sx: sx.avatarColumn,
      render: row => (
        <Box
          component='img'
          src={row.avatarUrl || playerImage}
          alt=''
          sx={sx.playerAvatar}
        />
      ),
    },
    {
      key: 'fullName',
      label: 'שם שחקן',
      sx: sx.playerNameColumn,
      headerSx: sx.playerNameHeader,
      cellSx: sx.playerNameCell,
    },
    {
      key: 'positionLayer',
      label: 'חוליה',
      sx: sx.layerColumn,
      render: row => (
        <Chip
          variant='soft'
          onClick={() => handleRoleModalOpen(row)}
          sx={sx.roleChip}
        >
          {getOptionLabel(POSITION_LAYER_OPTIONS, row.positionLayer)}
        </Chip>
      ),
    },
    {
      key: 'primaryPosition',
      label: 'עמדה',
      sx: sx.positionColumn,
      render: row => (
        <Chip
          variant='soft'
          onClick={() => handleRoleModalOpen(row)}
          sx={sx.roleChip}
        >
          {getOptionLabel(POSITION_OPTIONS, row.primaryPosition)}
        </Chip>
      ),
    },
    {
      key: 'games',
      label: 'משחקים',
      sx: sx.statColumn,
    },
    {
      key: 'goals',
      label: 'שערים',
      sx: sx.statColumn,
    },
    {
      key: 'starts',
      label: 'הרכב',
      sx: sx.statColumn,
    },
    {
      key: 'yellowCards',
      label: 'צהובים',
      sx: sx.statColumn,
    },
    {
      key: 'minutes',
      label: 'דקות',
      sx: sx.minutesColumn,
    },
    {
      key: 'profile',
      label: 'פרופיל סקאוט',
      sx: sx.profileColumn,
      render: row => (
        row.profile && row.profile !== '-'
          ? (
              <ScoutProfileChip
                label={
                  row.reliability && row.reliability !== '-'
                    ? `${row.profile} · ${row.reliability}`
                    : row.profile
                }
                fontSize={11}
              />
            )
          : '-'
      ),
    },
    {
      key: 'actions',
      label: '',
      sx: sx.actionsColumn,
      render: row => (
        <Box sx={sx.rowActions}>
          <Tooltip title='כניסה לשחקן'>
            <IconButton
              size='sm'
              variant='outlined'
              aria-label='כניסה לשחקן'
              sx={sx.tableIconButton}
              onClick={() => {
                navigate(
                  PLAYERS_DATABASE_UI_ROUTES.player(row.id)
                )
              }}
            >
              {iconUi({ id: 'view', size: 'sm' })}
            </IconButton>
          </Tooltip>

          <Tooltip title='פעולות נוספות'>
            <IconButton
              size='sm'
              variant='outlined'
              aria-label='פעולות נוספות'
              sx={sx.tableIconButton}
              onClick={event => event.stopPropagation()}
            >
              {iconUi({ id: 'more', size: 'sm' })}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  const handleNavigateToSearch = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.search)
  }

  const handleNavigateToLeague = () => {
    navigate(PLAYERS_DATABASE_UI_ROUTES.league(leagueId))
  }

  const handleRoleModalOpen = row => {
    setRoleModalRow(row)
    setRoleDraft({
      positionLayer: row.positionLayer || '',
      primaryPosition: row.primaryPosition || '',
    })
  }

  const handleRoleModalClose = () => {
    if (roleBusy) return

    setRoleModalRow(null)
    setRoleDraft({
      positionLayer: '',
      primaryPosition: '',
    })
  }

  const handlePlayerRoleConfirm = async () => {
    if (!selectedSeasonOption) return
    if (!roleModalRow) return

    setRoleBusy(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_ROLE,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId,
            ageGroupId: team.ageGroupId,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
          team,
          player: roleModalRow,
          primaryPosition: roleDraft.primaryPosition,
          positionLayer: roleDraft.positionLayer,
          numShirt: roleModalRow.numShirt || roleModalRow.number || '',
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'השינוי נשמר',
        message: roleModalRow.fullName,
      })

      setRoleModalRow(null)
      setRoleDraft({
        positionLayer: '',
        primaryPosition: '',
      })
      reload()
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'שמירת השינוי נכשלה',
        message: error?.message || 'שגיאה בעדכון עמדה או חוליה',
      })
    } finally {
      setRoleBusy(false)
    }
  }

  const handleRosterPaste = () => {
    setRosterRows(parsePlayerRosterRows(rosterPasteValue))
  }

  const handleRosterCellChange = ({ rowIndex, column, value }) => {
    setRosterRows(rows => rows.map((row, index) => (
      index === rowIndex
        ? { ...row, [column.key]: value }
        : row
    )))
  }

  const handleRosterConfirm = async () => {
    if (!selectedSeasonOption) return

    setRosterBusy(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYERS,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId,
            ageGroupId: team.ageGroupId,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
          team,
          players: rosterRows,
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'טעינת סגל הושלמה',
        message: `${rosterRows.length} שורות עודכנו`,
      })

      setRosterModalOpen(false)
      setRosterPasteValue('')
      setRosterRows([])
      reload()
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת סגל נכשלה',
        message: error?.message || 'שגיאה בעדכון סגל השנתון',
      })
    } finally {
      setRosterBusy(false)
    }
  }

  const handleStatsPaste = () => {
    setStatsRows(parsePlayerStatsRows(statsPasteValue).map(row => enrichStatsRowForPreview(row, rosterLookup)))
  }

  const handleStatsCellChange = ({ rowIndex, column, value }) => {
    setStatsRows(rows => rows.map((row, index) => {
      if (index !== rowIndex) {
        return row
      }

      if (column.key === 'fullNameRosterMatch') {
        const matchedPlayer = findRosterPlayerByValue(players, value)

        if (!matchedPlayer) {
          return {
            ...row,
            matchedPlayerId: '',
            matchedPlayerName: '',
            rosterStatus: 'unresolved',
          }
        }

        const pastedName = row.originalFullName || row.fullName || ''
        const matchedName = matchedPlayer.fullName || row.fullName || ''
        const aliases = normalizePlayerNameValue(pastedName) !== normalizePlayerNameValue(matchedName)
          ? Array.from(new Set([...(row.aliases || []), pastedName].filter(Boolean)))
          : row.aliases || []

        return {
          ...row,
          fullName: matchedName,
          originalFullName: pastedName,
          aliases,
          matchedPlayerId: value,
          matchedPlayerName: matchedName,
          rosterStatus: 'regular',
          isNameAlias: aliases.length > 0,
        }
      }

      const nextRow = { ...row, [column.key]: value }

      if (column.key === 'rosterStatus') {
        nextRow.rosterStatus = value || 'unresolved'
        nextRow.isYoungerAgeGroup = value === 'youngerAgeGroup'
      }

      return nextRow
    }))
  }

  const handleStatsConfirm = async () => {
    if (!selectedSeasonOption || !hasTeamPlayers) return

    setStatsBusy(true)

    try {
      await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.PASTE_TEAM_PLAYER_STATS,
        payload: {
          target: selectedSeasonOption.target,
          league: leagueDoc || { id: leagueId },
          season: {
            ...(selectedSeasonOption.season || {}),
            leagueId,
            ageGroupId: team.ageGroupId,
            seasonId: selectedSeasonOption.seasonId,
            seasonKey: selectedSeasonOption.seasonKey,
          },
          team,
          players: statsRows.filter(row => getStatsRowStatus(row).valid),
        },
      })

      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'טעינת סטטיסטיקות הושלמה',
        message: `${statsRows.length} שורות עודכנו`,
      })

      setStatsModalOpen(false)
      setStatsPasteValue('')
      setStatsRows([])
      reload()
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'טעינת סטטיסטיקות נכשלה',
        message: error?.message || 'שגיאה בעדכון נתוני השחקנים',
      })
    } finally {
      setStatsBusy(false)
    }
  }

  const isActiveSeason = selectedSeasonOption?.target === 'current'
  const roleModalChanged = Boolean(
    roleModalRow &&
      (
        roleDraft.positionLayer !== (roleModalRow.positionLayer || '') ||
        roleDraft.primaryPosition !== (roleModalRow.primaryPosition || '')
      )
  )
  const successPercent = team.successPercent === null
    ? '-'
    : `${team.successPercent}%`
  const offense = team.offense || {}
  const defense = team.defense || {}

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <Box sx={sx.header}>
          <Stack sx={sx.headerCopy}>
            <Breadcrumbs items={breadcrumbs} />

            <Box sx={sx.titleRow}>
              <Typography
                level='h1'
                sx={sx.pageTitle}
              >
                {team.name}
              </Typography>

              <Box sx={sx.birthYearChip}>
                שנתון {team.birthYear}
              </Box>
            </Box>
          </Stack>

          <Stack sx={sx.headerActionsPanel}>
            <ActivityStatusChip active={isActiveSeason} />

            <Stack
              direction='row'
              spacing={1}
              sx={sx.headerActions}
            >
              <Button
                sx={sx.primaryButton}
                startDecorator={iconUi({
                  id: 'playerDatabase',
                  size: 'sm',
                })}
                onClick={handleNavigateToSearch}
              >
                מעבר לעמוד חיפוש
              </Button>

              <Button
                variant='outlined'
                sx={sx.secondaryButton}
                startDecorator={iconUi({
                  id: 'back',
                  size: 'sm',
                })}
                onClick={handleNavigateToLeague}
              >
                חזרה לליגה
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box sx={sx.statsSection}>
          <Box sx={sx.statsGrid}>
            <TeamKpiCard
              title='מצב בטבלה'
              value={team.tableRank}
              iconId='points'
              details={[
                { label: 'נקודות', value: formatValue(team.points) },
                { label: 'הצלחה', value: successPercent },
                { label: 'משחקים', value: formatValue(team.games) },
              ]}
            />

            <TeamKpiCard
              title='ביצוע התקפי'
              value={formatRate(offense.priorityRate)}
              iconId='stats'
              priorityLevel={offense.priorityLevel}
              details={[
                {
                  label: 'איכות',
                  value: formatRate(offense.qualityRate),
                  tooltip: 'ציון איכות התקפית לפי דירוג שערי הזכות בליגה.',
                },
                {
                  label: 'חריגות',
                  value: formatRate(offense.anomalyRate),
                  tooltip: 'ציון חריגות התקפית ביחס למיקום בטבלה ולנתון הייחוס.',
                },
                { label: 'שערים', value: formatValue(team.goalsFor) },
                { label: 'למשחק', value: team.attackPerGame },
              ]}
            />

            <TeamKpiCard
              title='ביצוע הגנתי'
              value={formatRate(defense.priorityRate)}
              iconId='defensive'
              priorityLevel={defense.priorityLevel}
              details={[
                {
                  label: 'איכות',
                  value: formatRate(defense.qualityRate),
                  tooltip: 'ציון איכות הגנתית לפי דירוג שערי הספיגה בליגה.',
                },
                {
                  label: 'חריגות',
                  value: formatRate(defense.anomalyRate),
                  tooltip: 'ציון חריגות הגנתית ביחס למיקום בטבלה ולנתון הייחוס.',
                },
                { label: 'ספיגות', value: formatValue(team.goalsAgainst) },
                { label: 'למשחק', value: team.defensePerGame },
              ]}
            />
          </Box>
        </Box>

        <Box sx={sx.contentGrid}>
          <Card sx={sx.playersPanel}>
            <Box sx={sx.playersHeader}>
              <Typography
                level='title-lg'
                sx={sx.panelTitle}
              >
                סגל שנתון
              </Typography>

              <Typography
                level='body-sm'
                sx={sx.playersCount}
              >
                {visiblePlayers.length} שחקנים
              </Typography>
            </Box>

            <DataTable
              className='dpScrollThin'
              columns={columns}
              rows={visiblePlayers}
              getRowKey={row => row.id}
              wrapSx={sx.tableWrap}
              tableSx={sx.playersTable}
            />
          </Card>

          <TeamActionsPanel
            selectedSeasonKey={selectedSeasonKey}
            seasonOptions={seasonOptions}
            hasTeamPlayers={hasTeamPlayers}
            profileOnly={profileOnly}
            onSeasonChange={setSelectedSeasonKey}
            onProfileOnlyChange={setProfileOnly}
            onPlayersImport={() => setRosterModalOpen(true)}
            onStatsImport={() => setStatsModalOpen(true)}
          />
        </Box>
      </Box>

      <PlayersDatabaseModal
        open={Boolean(roleModalRow)}
        title='עריכת חוליה ועמדה'
        description={roleModalRow?.fullName || ''}
        iconId='playersDatabase'
        confirmLabel='אישור שינוי'
        confirmIconId='save'
        size='sm'
        busy={roleBusy}
        disabled={!roleModalChanged}
        onConfirm={handlePlayerRoleConfirm}
        onClose={handleRoleModalClose}
      >
        <Stack
          spacing={1.25}
          sx={sx.roleModalContent}
        >
          <Box sx={sx.roleModalField}>
            <Typography
              level='body-sm'
              sx={sx.roleModalLabel}
            >
              חוליה
            </Typography>

            <Select
              size='sm'
              value={roleDraft.positionLayer}
              disabled={roleBusy}
              onChange={(_, value) => setRoleDraft(current => ({
                ...current,
                positionLayer: value || '',
              }))}
              sx={sx.roleModalSelect}
            >
              <Option value=''>ללא</Option>

              {roleDraft.positionLayer && !hasOptionValue(POSITION_LAYER_OPTIONS, roleDraft.positionLayer) ? (
                <Option value={roleDraft.positionLayer}>
                  {roleDraft.positionLayer}
                </Option>
              ) : null}

              {POSITION_LAYER_OPTIONS.map(option => (
                <Option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </Option>
              ))}
            </Select>
          </Box>

          <Box sx={sx.roleModalField}>
            <Typography
              level='body-sm'
              sx={sx.roleModalLabel}
            >
              עמדה
            </Typography>

            <Select
              size='sm'
              value={roleDraft.primaryPosition}
              disabled={roleBusy}
              onChange={(_, value) => setRoleDraft(current => ({
                ...current,
                primaryPosition: value || '',
              }))}
              sx={sx.roleModalSelect}
            >
              <Option value=''>ללא</Option>

              {roleDraft.primaryPosition && !hasOptionValue(POSITION_OPTIONS, roleDraft.primaryPosition) ? (
                <Option value={roleDraft.primaryPosition}>
                  {roleDraft.primaryPosition}
                </Option>
              ) : null}

              {POSITION_OPTIONS.map(option => (
                <Option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </Option>
              ))}
            </Select>
          </Box>
        </Stack>
      </PlayersDatabaseModal>

      <DataImportModal
        open={rosterModalOpen}
        title={hasTeamPlayers ? 'טעינת שחקן בודד' : 'טעינת סגל'}
        description={`${team.name} · עונה ${selectedSeasonKey || '-'}`}
        iconId='upload'
        confirmLabel='אישור טעינת סגל'
        columns={PLAYER_ROSTER_COLUMNS}
        rows={rosterRows}
        pasteValue={rosterPasteValue}
        pastePlaceholder={PLAYER_ROSTER_PLACEHOLDER}
        busy={rosterBusy}
        disabled={!rosterRows.length}
        onPasteChange={setRosterPasteValue}
        onPaste={handleRosterPaste}
        onCellChange={handleRosterCellChange}
        onConfirm={handleRosterConfirm}
        onClose={() => setRosterModalOpen(false)}
      />

      <DataImportModal
        open={statsModalOpen}
        title={`טעינת סטטיסטיקות - ${team.name}`}
        description={[
          team.ageGroupLabel || team.ageGroupId,
          team.birthYear ? `שנתון ${team.birthYear}` : '',
          selectedSeasonKey ? `עונה ${selectedSeasonKey}` : '',
        ].filter(Boolean).join(' · ')}
        iconId='addStats'
        confirmLabel='אישור טעינת סטטיסטיקות'
        columns={statsColumns}
        rows={statsRows}
        pasteValue={statsPasteValue}
        pastePlaceholder={PLAYER_STATS_PLACEHOLDER}
        busy={statsBusy}
        disabled={!hasTeamPlayers || !statsRows.length || hasInvalidStatsRows}
        onPasteChange={setStatsPasteValue}
        onPaste={handleStatsPaste}
        onCellChange={handleStatsCellChange}
        getRowStatus={getStatsRowStatus}
        onConfirm={handleStatsConfirm}
        onClose={() => setStatsModalOpen(false)}
      />
    </PlayersDatabaseLayout>
  )
}










