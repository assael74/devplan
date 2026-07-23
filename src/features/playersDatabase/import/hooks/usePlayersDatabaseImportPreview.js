import { useMemo, useState } from 'react'

import { PLAYERS_DATABASE_IMPORT_FLOW } from '../../constants/pdb.constants.js'
import { buildPlayersDatabaseLeagueTableImportPlan } from '../logic/buildPlayersDatabaseLeagueTableImportPlan.js'
import { buildPlayersDatabaseLeagueTableWritePlan } from '../logic/buildPlayersDatabaseLeagueTableWritePlan.js'
import { buildPlayersDatabaseImportPlan } from '../logic/buildPlayersDatabaseImportPlan.js'
import { buildPlayersDatabaseWritePlan } from '../logic/buildPlayersDatabaseWritePlan.js'
import { readLeagueXlsx } from '../logic/leagueXlsx.js'
import { normalizePlayersDatabaseImportRows } from '../logic/normalizePlayersDatabaseImportRows.js'
import { parsePlayersDatabasePastedTable } from '../logic/parsePlayersDatabasePastedTable.js'

const SAMPLE_TEXT = `׳¢׳•׳ ׳”\t׳׳™׳’׳”\t׳׳¡׳₪׳¨ ׳׳™׳’׳”\t׳׳¡׳₪׳¨ ׳§׳‘׳•׳¦׳•׳×\t׳©׳ ׳×׳•׳\t׳׳•׳¢׳“׳•׳\t׳§׳‘׳•׳¦׳”\t׳׳™׳§׳•׳\t׳׳©׳—׳§׳™׳\t׳ ׳™׳¦׳—׳•׳ ׳•׳×\t׳×׳™׳§׳•\t׳”׳₪׳¡׳“׳™׳\t׳©׳¢׳¨׳™ ׳–׳›׳•׳×\t׳©׳¢׳¨׳™ ׳—׳•׳‘׳”\t׳ ׳§׳•׳“׳•׳×\t׳×׳׳¨׳™׳ ׳¦׳™׳׳•׳
2025-2026\t׳׳™׳’׳× ׳”׳¢׳\t1\t16\t2009\t׳׳›׳‘׳™ ׳×׳ ׳׳‘׳™׳‘\t׳ ׳¢׳¨׳™׳ ׳\t1\t12\t9\t2\t1\t31\t10\t29\t2026-01-05
2025-2026\t׳׳™׳’׳× ׳”׳¢׳\t1\t16\t2009\t׳׳›׳‘׳™ ׳—׳™׳₪׳”\t׳ ׳¢׳¨׳™׳ ׳\t2\t12\t8\t2\t2\t28\t12\t26\t2026-01-05
2025-2026\t׳׳™׳’׳× ׳”׳¢׳\t1\t16\t2009\t׳‘׳ ׳™ ׳¡׳›׳ ׳™׳\t׳ ׳¢׳¨׳™׳ ׳\t3\t12\t7\t3\t2\t23\t14\t24\t2026-01-05`

const buildPlanByFlow = (flowType, rows) => {
  if (flowType === PLAYERS_DATABASE_IMPORT_FLOW.LEAGUE_TABLE) {
    return buildPlayersDatabaseLeagueTableImportPlan(rows)
  }

  return buildPlayersDatabaseImportPlan(rows)
}

const buildWritePlanByFlow = (flowType, plan) => {
  if (flowType === PLAYERS_DATABASE_IMPORT_FLOW.LEAGUE_TABLE) {
    return buildPlayersDatabaseLeagueTableWritePlan(plan)
  }

  return buildPlayersDatabaseWritePlan(plan)
}

const createInitialContext = () => ({
  seasonId: '2025-2026',
  leagueName: '׳׳™׳’׳× ׳”׳¢׳',
  leagueNum: 1,
  teamsCount: 19,
  birthYear: 2009,
  roundNumber: '',
  capturedAt: new Date().toISOString().slice(0, 10),
})

export function usePlayersDatabaseImportPreview() {
  const [flowType, setFlowType] = useState(PLAYERS_DATABASE_IMPORT_FLOW.LEAGUE_TABLE)
  const [text, setText] = useState(SAMPLE_TEXT)
  const [fileName, setFileName] = useState('')
  const [fileError, setFileError] = useState('')
  const [context, setContext] = useState(createInitialContext)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveResult, setSaveResult] = useState(null)

  const parsed = useMemo(() => parsePlayersDatabasePastedTable(text), [text])

  const normalized = useMemo(() => {
    if (!parsed.ok) {
      return {
        rows: [],
        unknownHeaders: [],
        mappedHeaders: [],
      }
    }

    const normalizedRows = normalizePlayersDatabaseImportRows({
      headers: parsed.headers,
      rows: parsed.rows,
    })

    return {
      ...normalizedRows,
      rows: normalizedRows.rows.map(row => ({
        ...context,
        ...row,
        seasonId: row.seasonId || context.seasonId,
        leagueName: row.leagueName || context.leagueName,
        leagueNum: row.leagueNum || context.leagueNum,
        teamsCount: row.teamsCount || context.teamsCount,
        birthYear: row.birthYear || context.birthYear,
        roundNumber: row.roundNumber || context.roundNumber,
        capturedAt: row.capturedAt || context.capturedAt,
      })),
    }
  }, [context, parsed])

  const plan = useMemo(() => buildPlanByFlow(flowType, normalized.rows), [flowType, normalized.rows])
  const writePlan = useMemo(() => buildWritePlanByFlow(flowType, plan), [flowType, plan])

  const canSave = flowType === PLAYERS_DATABASE_IMPORT_FLOW.LEAGUE_TABLE
    && (writePlan.summary?.leaguesToUpsert || 0) > 0
    && (writePlan.summary?.blockedRows || 0) === 0
    && !saving

  const resetSample = () => {
    setText(SAMPLE_TEXT)
    setFileName('')
    setFileError('')
    setSaveError('')
    setSaveResult(null)
  }

  const clear = () => {
    setText('')
    setFileName('')
    setFileError('')
    setSaveError('')
    setSaveResult(null)
  }

  const updateContext = (field, value) => {
    setContext(prev => ({
      ...prev,
      [field]: value,
    }))
    setSaveError('')
    setSaveResult(null)
  }

  const loadXlsx = async (file) => {
    if (!file) return

    setFileError('')
    setSaveError('')
    setSaveResult(null)

    try {
      const result = await readLeagueXlsx(file)
      setText(result.text)
      setFileName(`${file.name} | ${result.sheetName} | ${result.rowsCount} שורות`)
    } catch (err) {
      setFileError(err?.message || 'טעינת קובץ Excel נכשלה')
    }
  }

  const saveSnapshot = async () => {
    setSaveError('תהליך הסנאפשוט הוסר')
    return null
  }

  return {
    flowType,
    setFlowType,
    context,
    updateContext,
    text,
    setText,
    fileName,
    fileError,
    parsed,
    normalized,
    plan,
    writePlan,
    canSave,
    saving,
    saveError,
    saveResult,
    saveSnapshot,
    loadXlsx,
    resetSample,
    clear,
  }
}
