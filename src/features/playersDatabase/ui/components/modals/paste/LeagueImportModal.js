// src/features/playersDatabase/ui/components/modals/paste/LeagueImportModal.js

import * as React from 'react'

import {
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
} from '@mui/joy'

import PasteModal from './PasteModal.js'
import JsonViewerModal from '../JsonViewerModal.js'
import { downloadLeagueIdentityIndexJson } from '../../../pages/leaguePage/logic/leagueIdentityIndexJson.logic.js'
import { leagueImportModalSx as sx } from './sx/leagueImportModal.sx.js'

const SEASON_STATUS_OPTIONS = [
  {
    value: 'not_started',
    label: 'עונה לא החלה',
    description: 'טעינת מסגרת הליגה בלבד. אפסים אינם נחשבים לנתוני ביצוע או סטטיסטיקת שחקנים.',
  },
  {
    value: 'active',
    label: 'עונה פעילה',
    description: 'טעינת טבלת ליגה עם נתוני ביצוע עדכניים.',
  },
  {
    value: 'completed',
    label: 'עונה הסתיימה',
    description: 'טעינת עונה היסטורית סגורה. אם העונה נמצאת ב-current, כל אובייקט העונה מועבר ל-history; אם היא כבר ב-history, היא נשארת שם ומתעדכנת שם בלבד.',
  },
]

export default function LeagueImportModal({
  league = {},
  columns = [],
  leagueImport,
  placeholder = '',
}) {
  const [identityJsonOpen, setIdentityJsonOpen] = React.useState(false)
  const leagueContext = [
    league.name,
    league.seasonKey ? `עונה ${league.seasonKey}` : '',
    league.birthYear && league.birthYear !== '-' ? `שנתון ${league.birthYear}` : '',
    league.ageGroup && league.ageGroup !== '-' ? league.ageGroup : '',
  ].filter(Boolean).join(' · ')
  const selectedStatus = SEASON_STATUS_OPTIONS.find(option => (
    option.value === leagueImport.seasonStatus
  ))
  const hasPreviewRows = Array.isArray(leagueImport.rows) && leagueImport.rows.length > 0
  const getLeagueImportRowStatus = React.useCallback(row => ({
    valid: row?.valid !== false,
    message: Array.isArray(row?.errors) ? row.errors.filter(Boolean).join(' ') : '',
  }), [])
  const beforePaste = (
    <FormControl size='sm' required sx={sx.seasonStatusField}>
      <FormLabel>מצב העונה</FormLabel>
      <Select
        value={leagueImport.seasonStatus || null}
        placeholder='הכול — בחר מצב עונה'
        onChange={(event, value) => leagueImport.setSeasonStatus(value || '')}
      >
        {SEASON_STATUS_OPTIONS.map(option => (
          <Option
            key={option.value}
            value={option.value}
            disabled={option.value === 'not_started' && leagueImport.hasStartedData}
          >
            {option.label}
          </Option>
        ))}
      </Select>
      {!hasPreviewRows ? <FormHelperText>
        {selectedStatus?.description || 'בחירה חובה לפני הדבקה ושמירה.'}
      </FormHelperText> : null}
    </FormControl>
  )

  return (
    <>
    <PasteModal
      open={leagueImport.open}
      title='טעינת נתוני ליגה'
      description={leagueContext}
      columns={columns}
      rows={leagueImport.rows}
      value={leagueImport.pasteValue}
      placeholder={placeholder}
      busy={leagueImport.busy}
      disabled={!leagueImport.canConfirm}
      beforePaste={beforePaste}
      pasteDisabled={!leagueImport.seasonStatus}
      confirmLabel='אישור טעינה'
      onValueChange={leagueImport.setPasteValue}
      onPaste={leagueImport.handlePreview}
      onClear={leagueImport.handleClear}
      onViewSourceJson={leagueImport.identityIndexDocument
        ? () => setIdentityJsonOpen(true)
        : null}
      onCellChange={leagueImport.handleCellChange}
      getRowStatus={getLeagueImportRowStatus}
      onConfirm={leagueImport.handleConfirm}
      onClose={leagueImport.handleClose}
    />
    <JsonViewerModal
      open={identityJsonOpen}
      title='אינדקס זיהוי קבוצות · JSON'
      description='זהו מסמך ה־JSON שנקרא בפועל לצורך זיהוי הופעת מועדון בליגה אחרת באותה עונה ושנתון.'
      data={leagueImport.identityIndexDocument || {}}
      onClose={() => setIdentityJsonOpen(false)}
      onDownload={() => downloadLeagueIdentityIndexJson(leagueImport.identityIndexDocument || {})}
    />
    </>
  )
}
