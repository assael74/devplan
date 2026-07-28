// features/playersDatabase/ui/pages/searchPage/admin/SearchIndexNormalizationModal.js

import * as React from 'react'
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormLabel,
  Option,
  Select,
  Sheet,
  Typography,
} from '@mui/joy'

import PlayersDatabaseModal from '../../../components/modals/PlayersDatabaseModal.js'
import {
  auditTeamPerformanceSearchIndexSchema,
  rebuildSearchIndexNormalization,
} from '../../../../services/write/searchIndex/index.js'
import { searchNormalizationAdminSx as sx } from '../sx/searchNormalizationAdmin.sx.js'

const ENTITY_OPTIONS = [
  { value: '', label: 'שחקנים וקבוצות' },
  { value: 'playerSeason', label: 'שחקנים בלבד' },
  { value: 'birthTeamSeason', label: 'קבוצות בלבד' },
]

const initialState = {
  loading: false,
  mode: '',
  result: null,
  error: '',
  auditResult: null,
}

export default function SearchIndexNormalizationModal({ open, onClose }) {
  const [entityType, setEntityType] = React.useState('')
  const [state, setState] = React.useState(initialState)

  React.useEffect(() => {
    if (!open) return

    setEntityType('')
    setState(initialState)
  }, [open])

  const runSchemaAudit = async () => {
    if (state.loading) return

    setState(previous => ({
      ...previous,
      loading: true,
      mode: 'audit',
      auditResult: null,
      error: '',
    }))

    try {
      const auditResult = await auditTeamPerformanceSearchIndexSchema()

      setState(previous => ({
        ...previous,
        loading: false,
        mode: 'audit',
        auditResult,
        error: '',
      }))
    } catch (error) {
      console.error('[playersDatabase/team-performance-schema-audit]', error)

      setState(previous => ({
        ...previous,
        loading: false,
        mode: 'audit',
        auditResult: null,
        error: error?.message || 'מיפוי מסמכי הביצוע הקבוצתי נכשל',
      }))
    }
  }

  const runBackfill = async dryRun => {
    if (state.loading) return

    setState({
      loading: true,
      mode: dryRun ? 'dryRun' : 'write',
      result: null,
      error: '',
    })

    try {
      const result = await rebuildSearchIndexNormalization({
        entityType,
        dryRun,
      })

      setState({
        loading: false,
        mode: dryRun ? 'dryRun' : 'write',
        result,
        error: '',
      })
    } catch (error) {
      console.error('[playersDatabase/search-normalization-backfill]', error)

      setState({
        loading: false,
        mode: dryRun ? 'dryRun' : 'write',
        result: null,
        error: error?.message || 'רענון אינדקס החיפוש נכשל',
      })
    }
  }

  const result = state.result
  const auditResult = state.auditResult
  const hasDryRunResult = state.mode === 'dryRun' && !!result

  return (
    <PlayersDatabaseModal
      open={open}
      title='רענון אינדקס החיפוש'
      description='רענון שחקנים קיימים ובנייה מחדש של קבוצות מתוך טבלאות הליגה'
      iconId='refresh'
      size='md'
      hideFooter
      persistent={state.loading}
      onClose={onClose}
    >
      <Alert color='warning' variant='soft'>
        מומלץ לבצע תחילה בדיקה ללא כתיבה. בקבוצות, הרצה בפועל תחשב מחדש את הביצועים מטבלאות הליגה ותעדכן את אינדקס החיפוש.
      </Alert>

      <FormControl sx={sx.field}>
        <FormLabel>סוג מסמכים</FormLabel>
        <Select
          value={entityType}
          disabled={state.loading}
          onChange={(event, value) => setEntityType(value || '')}
        >
          {ENTITY_OPTIONS.map(option => (
            <Option key={option.value || 'all'} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FormControl>

      {state.error ? (
        <Alert color='danger' variant='soft'>
          {state.error}
        </Alert>
      ) : null}

      {result ? (
        <Sheet variant='outlined' sx={sx.result}>
          <Typography level='title-sm'>תוצאת הרצה</Typography>

          <Box sx={sx.resultGrid}>
            <ResultItem label='נסרקו' value={result.scannedRowsCount} />
            <ResultItem label='שחקנים' value={result.playerRowsCount} />
            <ResultItem label='קבוצות' value={result.teamRowsCount} />
            <ResultItem label='דולגו' value={result.skippedRowsCount} />
            <ResultItem label='עודכנו' value={result.updatedRowsCount} />
            {Number(result.scannedLeaguesCount) > 0 ? (
              <ResultItem label='ליגות מקור' value={result.scannedLeaguesCount} />
            ) : null}
            {Number(result.scannedSeasonsCount) > 0 ? (
              <ResultItem label='עונות מקור' value={result.scannedSeasonsCount} />
            ) : null}
          </Box>

          <Typography level='body-xs' sx={sx.resultNote}>
            {result.dryRun
              ? 'זו הייתה בדיקה בלבד. לא בוצעה כתיבה ל־Firestore.'
              : 'הרענון הושלם והמסמכים עודכנו בפועל.'}
          </Typography>
        </Sheet>
      ) : null}


      {auditResult ? (
        <Sheet variant='outlined' sx={sx.result}>
          <Typography level='title-sm'>מיפוי מבנה הביצוע הקבוצתי</Typography>

          <Box sx={sx.resultGrid}>
            <ResultItem label='נסרקו' value={auditResult.scannedRowsCount} />
            <ResultItem label='מבנה חדש תקין' value={auditResult.currentRowsCount} />
            <ResultItem label='ניתנים להמרה' value={auditResult.legacyConvertibleRowsCount} />
            <ResultItem label='מבנה חלקי' value={auditResult.partialRowsCount} />
            <ResultItem label='ללא מדדים' value={auditResult.missingRowsCount} />
            <ResultItem
              label='דורשים חישוב מחדש'
              value={auditResult.requiresSourceRecalculationCount}
            />
          </Box>

          <Typography level='body-xs' sx={sx.resultNote}>
            המיפוי הוא קריאה בלבד. לא בוצעה כתיבה למסמכים.
          </Typography>
        </Sheet>
      ) : null}

      <Box sx={sx.actions}>
        <Button
          variant='outlined'
          color='primary'
          loading={state.loading && state.mode === 'audit'}
          disabled={state.loading}
          onClick={runSchemaAudit}
        >
          מיפוי ביצוע קבוצתי
        </Button>

        <Button
          variant='outlined'
          color='neutral'
          loading={state.loading && state.mode === 'dryRun'}
          disabled={state.loading}
          onClick={() => runBackfill(true)}
        >
          בדיקה ללא כתיבה
        </Button>

        <Button
          variant='solid'
          color='warning'
          loading={state.loading && state.mode === 'write'}
          disabled={state.loading || !hasDryRunResult}
          onClick={() => runBackfill(false)}
        >
          עדכון בפועל
        </Button>

        <Button
          variant='plain'
          color='neutral'
          disabled={state.loading}
          onClick={onClose}
        >
          סגירה
        </Button>
      </Box>
    </PlayersDatabaseModal>
  )
}

function ResultItem({ label, value }) {
  return (
    <Box sx={sx.resultItem}>
      <Typography level='body-xs' sx={sx.resultLabel}>
        {label}
      </Typography>
      <Typography level='title-md'>
        {Number(value) || 0}
      </Typography>
    </Box>
  )
}
