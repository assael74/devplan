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
import { rebuildSearchIndexNormalization } from '../../../../services/write/searchIndex/index.js'
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
}

export default function SearchIndexNormalizationModal({ open, onClose }) {
  const [entityType, setEntityType] = React.useState('')
  const [state, setState] = React.useState(initialState)

  React.useEffect(() => {
    if (!open) return

    setEntityType('')
    setState(initialState)
  }, [open])

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
  const hasDryRunResult = state.mode === 'dryRun' && !!result

  return (
    <PlayersDatabaseModal
      open={open}
      title='רענון שדות נרמול'
      description='פעולה חד־פעמית למסמכי אינדקס החיפוש הקיימים'
      iconId='refresh'
      size='md'
      hideFooter
      persistent={state.loading}
      onClose={onClose}
    >
      <Alert color='warning' variant='soft'>
        מומלץ לבצע תחילה בדיקה ללא כתיבה. הרצה בפועל תעדכן את כל המסמכים שנבחרו.
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
          </Box>

          <Typography level='body-xs' sx={sx.resultNote}>
            {result.dryRun
              ? 'זו הייתה בדיקה בלבד. לא בוצעה כתיבה ל־Firestore.'
              : 'הרענון הושלם והמסמכים עודכנו בפועל.'}
          </Typography>
        </Sheet>
      ) : null}

      <Box sx={sx.actions}>
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
