// teamProfile/sharedLogic/players/insightsLogic/structure/structure.model.js

import {
  clean,
  pct,
  pctText,
  safeArr,
  toNum,
  buildPlayerRef,
} from '../common/index.js'

import {
  buildTeamPlayersTargetsModel,
  evaluateCountTarget,
} from '../targets/index.js'

const PROJECT_APPROVED_STATUSES = [
  'approved',
]

const PROJECT_DECLINED_STATUSES = [
  'declined',
  'rejected',
]

const countBy = (rows, predicate) => {
  return safeArr(rows).filter(predicate).length
}

const getActiveRows = (rows = []) => {
  return safeArr(rows).filter((row) => row?.active === true)
}

const getPrimaryPosition = (row = {}) => {
  const positions = safeArr(row?.positions)
  const primary = clean(row?.primaryPosition || row?.generalPosition?.primaryPosition)

  if (primary && positions.includes(primary)) return primary

  return ''
}

const isKeyPlayer = (row = {}) => {
  return clean(row?.squadRole) === 'key'
}

const isProjectPlayer = (row = {}) => {
  const type = clean(row?.type)
  const status = clean(row?.projectStatus)
  const chipId = clean(row?.projectChipMeta?.id)

  return (
    type === 'project' ||
    chipId === 'project' ||
    PROJECT_APPROVED_STATUSES.includes(status)
  )
}

const isDeclinedProjectPlayer = (row = {}) => {
  const status = clean(row?.projectStatus)

  return PROJECT_DECLINED_STATUSES.includes(status)
}

const isCandidateProjectPlayer = (row = {}) => {
  const status = clean(row?.projectStatus)
  const chipId = clean(row?.projectChipMeta?.id)

  if (!status && chipId !== 'candidateFlow') return false
  if (isProjectPlayer(row)) return false
  if (isDeclinedProjectPlayer(row)) return false

  return chipId === 'candidateFlow' || !!status
}

const buildSquadStructure = ({
  rows = [],
  summary = {},
}) => {
  const total = rows.length
  const activeRows = getActiveRows(rows)

  const active = summary?.active ?? activeRows.length
  const nonActive = summary?.nonActive ?? countBy(rows, (row) => row?.active !== true)

  const withRole = countBy(activeRows, (row) => !!clean(row?.squadRole))
  const withoutRole = active - withRole

  const withPosition = countBy(activeRows, (row) => safeArr(row?.positions).length > 0)
  const withoutPosition = active - withPosition

  const withPrimaryPosition = countBy(activeRows, (row) => {
    return !!getPrimaryPosition(row)
  })

  const withoutPrimaryPosition = active - withPrimaryPosition

  const withGamesData = countBy(activeRows, (row) => {
    return row?.playerGamesStats?.hasGamesData === true
  })

  return {
    total,
    active,
    nonActive,

    withRole,
    withoutRole,

    withPosition,
    withoutPosition,

    withPrimaryPosition,
    withoutPrimaryPosition,

    withGamesData,

    activePct: pct(active, total),
    roleCoveragePct: pct(withRole, active),
    positionCoveragePct: pct(withPosition, active),
    primaryPositionCoveragePct: pct(withPrimaryPosition, active),
    gamesDataPct: pct(withGamesData, active),
  }
}

const buildRoleStructure = ({
  rows = [],
  targets,
}) => {
  const activeRows = getActiveRows(rows)
  const total = activeRows.length

  return targets.roleStructure.map((target) => {
    const roleId = target.id

    const players = activeRows
      .filter((row) => {
        const value = clean(row?.squadRole) || 'none'
        return value === roleId
      })
      .map((row) => buildPlayerRef(row))

    return {
      id: roleId,
      label: target.label,
      count: players.length,
      pct: pct(players.length, total),
      pctLabel: pctText(players.length, total),
      target,
      tone: target.tone,
      players,
    }
  })
}

const hasCoveragePosition = (row = {}, positionId) => {
  return safeArr(row?.positions).includes(positionId)
}

const hasPrimaryPosition = (row = {}, positionId) => {
  return getPrimaryPosition(row) === positionId
}

const resolvePositionTone = ({
  countEvaluation,
  keyEvaluation,
}) => {
  if (countEvaluation.status !== 'ok') return 'warning'
  if (keyEvaluation.status !== 'ok') return 'warning'

  return 'success'
}

const resolvePositionStatus = ({
  countEvaluation,
  keyEvaluation,
}) => {
  if (countEvaluation.status === 'under') return 'under'
  if (countEvaluation.status === 'over') return 'over'
  if (keyEvaluation.status === 'over') return 'keyOverload'

  return 'ok'
}

const buildPositionStructureItem = ({
  target,
  rows = [],
  mode = 'primary',
}) => {
  const players = rows.filter((row) => {
    if (mode === 'coverage') {
      return hasCoveragePosition(row, target.id)
    }

    return hasPrimaryPosition(row, target.id)
  })

  const keyPlayers = players.filter(isKeyPlayer)

  const countEvaluation = evaluateCountTarget({
    actual: players.length,
    min: target.target.min,
    max: target.target.max,
  })

  const keyEvaluation = evaluateCountTarget({
    actual: keyPlayers.length,
    min: 0,
    max: target.target.maxKey,
  })

  const tone = resolvePositionTone({
    countEvaluation,
    keyEvaluation,
  })

  const status = resolvePositionStatus({
    countEvaluation,
    keyEvaluation,
  })

  return {
    id: target.id,
    label: target.label,
    layerKey: target.layerKey,
    layerLabel: target.layerLabel,

    mode,
    count: players.length,
    keyCount: keyPlayers.length,

    target: target.target,
    minTarget: target.target.min,
    maxTarget: target.target.max,
    maxKeyTarget: target.target.maxKey,

    tone,
    status,

    countEvaluation,
    keyEvaluation,

    players: players.map((row) => buildPlayerRef(row)),
    keyPlayers: keyPlayers.map((row) => buildPlayerRef(row)),
  }
}

const buildExactPositionStructure = ({
  rows = [],
  targets,
  mode = 'primary',
}) => {
  const activeRows = getActiveRows(rows)

  return targets.exactPositions.map((target) => {
    return buildPositionStructureItem({
      target,
      rows: activeRows,
      mode,
    })
  })
}

const buildLayerStructure = ({
  rows = [],
}) => {
  const activeRows = getActiveRows(rows)
  const map = new Map()

  activeRows.forEach((row) => {
    const key = clean(row?.generalPositionKey) || 'none'
    const label = clean(row?.generalPositionLabel) || 'לא הוגדרה שכבה'

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        label,
        count: 0,
        players: [],
      })
    }

    const item = map.get(key)
    item.count += 1
    item.players.push(buildPlayerRef(row))
  })

  return Array.from(map.values()).sort((a, b) => {
    return toNum(b.count) - toNum(a.count)
  })
}

const buildProjectStructure = ({
  rows = [],
} = {}) => {
  const activeRows = getActiveRows(rows)
  const total = activeRows.length

  const projectRows = activeRows.filter(isProjectPlayer)
  const candidateRows = activeRows.filter(isCandidateProjectPlayer)
  const declinedRows = activeRows.filter(isDeclinedProjectPlayer)

  const generalRows = activeRows.filter((row) => {
    return (
      !isProjectPlayer(row) &&
      !isCandidateProjectPlayer(row) &&
      !isDeclinedProjectPlayer(row)
    )
  })

  return {
    total,

    totalProject: projectRows.length,
    totalCandidate: candidateRows.length,
    totalDeclined: declinedRows.length,
    totalGeneral: generalRows.length,

    projectPct: pct(projectRows.length, total),
    candidatePct: pct(candidateRows.length, total),
    declinedPct: pct(declinedRows.length, total),
    generalPct: pct(generalRows.length, total),

    projectPlayers: projectRows.map((row) => buildPlayerRef(row)),
    candidatePlayers: candidateRows.map((row) => buildPlayerRef(row)),
    declinedPlayers: declinedRows.map((row) => buildPlayerRef(row)),
    generalPlayers: generalRows.map((row) => buildPlayerRef(row)),
  }
}

export const buildStructureModel = ({
  rows = [],
  summary = {},
} = {}) => {
  const activeRows = getActiveRows(rows)

  const targets = buildTeamPlayersTargetsModel({
    rows: activeRows,
  })

  const primaryPositions = buildExactPositionStructure({
    rows,
    targets,
    mode: 'primary',
  })

  const coveragePositions = buildExactPositionStructure({
    rows,
    targets,
    mode: 'coverage',
  })

  return {
    squad: buildSquadStructure({
      rows,
      summary,
    }),

    roles: buildRoleStructure({
      rows,
      targets,
    }),

    positions: {
      layers: buildLayerStructure({
        rows,
      }),

      primary: primaryPositions,
      coverage: coveragePositions,

      // תאימות זמנית לשם הישן
      exact: primaryPositions,
    },

    project: buildProjectStructure({
      rows,
    }),

    targets,
  }
}
