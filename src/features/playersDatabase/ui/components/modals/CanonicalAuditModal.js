// src/features/playersDatabase/ui/components/modals/CanonicalAuditModal.js

import * as React from 'react'
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
} from '@mui/joy'

import RegularModal from './RegularModal.js'
import AuditFindingsList from './audit/AuditFindingsList.js'
import AuditSummary from './audit/AuditSummary.js'
import { playerDatabaseAuditModalSx as sx } from './sx/playerDatabaseAuditModal.sx.js'

const PAGE_SIZE = 40
const clean = value => String(value === undefined || value === null ? '' : value).trim()

const downloadFindings = result => {
  if (!result || typeof window === 'undefined') return
  const url = window.URL.createObjectURL(new Blob([
    JSON.stringify({
      exportedAt: new Date().toISOString(),
      flowType: result.flowType,
      status: result.status || result.result,
      coverage: result.coverage,
      findings: result.findings,
    }, null, 2),
  ], { type: 'application/json;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `players-database-audit-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0)
}

export default function CanonicalAuditModal({
  open = false,
  busy = false,
  error = '',
  result = null,
  defaults = {},
  onRun,
  onScopeChange,
  onTeamOpen,
  onLeagueOpen,
  onClose,
}) {
  const [type, setType] = React.useState('league')
  const [leagueId, setLeagueId] = React.useState('')
  const [teamId, setTeamId] = React.useState('')
  const [seasonId, setSeasonId] = React.useState('')
  const [visible, setVisible] = React.useState(PAGE_SIZE)

  React.useEffect(() => {
    if (!open) return
    setLeagueId(clean(defaults.leagueId))
    setTeamId(clean(defaults.teamId))
    setSeasonId(clean(defaults.seasonId))
    setVisible(PAGE_SIZE)
  }, [open, defaults.leagueId, defaults.teamId, defaults.seasonId])

  const findings = Array.isArray(result?.findings) ? result.findings : []
  const canRun = type === 'system'
    ? true
    : Boolean(leagueId && seasonId && (type !== 'stats' || teamId))
  const change = setter => event => {
    setter(event.target.value)
    onScopeChange?.()
  }

  return (
    <RegularModal
      open={open}
      size='lg'
      busy={busy}
      disabled={!canRun}
      persistent={busy}
      title='בדיקת מסד השחקנים'
      description='הבדיקה קוראת ומשווה בלבד ואינה מתקנת או כותבת מידע.'
      iconId='search'
      confirmLabel='בדוק עכשיו'
      confirmIconId='search'
      cancelLabel='סגור'
      onConfirm={() => onRun?.({ type, leagueId, teamId, seasonId })}
      onClose={onClose}
    >
      <Stack spacing={2}>
        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          <Button
            size='sm'
            variant={type === 'league' ? 'solid' : 'outlined'}
            onClick={() => {
              setType('league')
              onScopeChange?.()
            }}
          >
            ליגה
          </Button>
          <Button
            size='sm'
            variant={type === 'stats' ? 'solid' : 'outlined'}
            onClick={() => {
              setType('stats')
              onScopeChange?.()
            }}
          >
            נתונים סטטיסטיים
          </Button>
          <Button
            size='sm'
            variant={type === 'system' ? 'solid' : 'outlined'}
            onClick={() => {
              setType('system')
              onScopeChange?.()
            }}
          >
            מערכת
          </Button>
        </Stack>

        {type === 'system' ? (
          <Typography level='body-sm'>
            הבדיקה סורקת את המסמכים הקנוניים ומדווחת על זהויות, קשרים ותוצרים חסרים.
          </Typography>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <FormControl sx={sx.flexField}>
              <FormLabel>מזהה ליגה</FormLabel>
              <Input value={leagueId} onChange={change(setLeagueId)} />
            </FormControl>
            {type === 'stats' ? (
              <FormControl sx={sx.flexField}>
                <FormLabel>מזהה קבוצה</FormLabel>
                <Input value={teamId} onChange={change(setTeamId)} />
              </FormControl>
            ) : null}
            <FormControl sx={sx.flexField}>
              <FormLabel>מזהה עונה</FormLabel>
              <Input
                value={seasonId}
                placeholder='YYYY_YYYY'
                onChange={change(setSeasonId)}
              />
            </FormControl>
          </Stack>
        )}

        {result ? (
          <>
            <AuditSummary result={result} onDownload={() => downloadFindings(result)} />
            {findings.length ? (
              <>
                <Divider />
                <AuditFindingsList
                  findings={findings.slice(0, visible)}
                  busy={busy}
                  actions={{ onTeamOpen, onLeagueOpen }}
                  canLoadMore={findings.length > visible}
                  onLoadMore={() => setVisible(value => value + PAGE_SIZE)}
                />
              </>
            ) : (
              <Typography level='body-sm'>לא נמצאו פערים בהיקף שנבדק.</Typography>
            )}
          </>
        ) : null}
        {error ? <Typography level='body-sm' color='danger'>{error}</Typography> : null}
      </Stack>
    </RegularModal>
  )
}
