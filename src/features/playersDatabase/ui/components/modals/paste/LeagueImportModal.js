// src/features/playersDatabase/ui/components/modals/paste/LeagueImportModal.js

import * as React from 'react'

import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
} from '@mui/joy'

import ImportActionArea from '../ImportActionArea.js'
import JsonViewerModal from '../JsonViewerModal.js'
import ModalStepper from '../ModalStepper.js'
import RegularModal from '../RegularModal.js'
import { downloadLeagueIdentityIndexJson } from '../../../pages/leaguePage/logic/leagueIdentityIndexJson.logic.js'
import PasteArea from './PasteArea.js'
import PreviewTable from './PreviewTable.js'
import { leagueImportModalSx as sx } from './sx/leagueImportModal.sx.js'
import { pasteModalSx as pasteSx } from './sx/pasteModal.sx.js'

const STEPS = ['מצב עונה', 'הדבקה וניתוח', 'זיהוי קבוצות ואישור']

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
  const [activeStep, setActiveStep] = React.useState(0)
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
  const seasonStatusReady = Boolean(leagueImport.seasonStatus)
  const getLeagueImportRowStatus = React.useCallback(row => ({
    valid: row?.valid !== false,
    message: Array.isArray(row?.errors) ? row.errors.filter(Boolean).join(' ') : '',
  }), [])
  React.useEffect(() => {
    if (leagueImport.open) setActiveStep(0)
  }, [leagueImport.open])

  const seasonStatusControl = (
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
  const confirmDisabled = activeStep === 0
    ? !seasonStatusReady
    : activeStep === 1
      ? !hasPreviewRows
      : !leagueImport.canConfirm
  const footerActions = activeStep === 1 ? (
    <ImportActionArea
      actions={[
        {
          id: 'back',
          label: 'חזרה',
          iconId: 'forward',
          presentationRole: 'back',
          disabled: leagueImport.busy,
          onClick: () => setActiveStep(0),
        },
        {
          id: 'clear',
          label: 'ניקוי מלא',
          iconId: 'delete',
          presentationRole: 'clear',
          disabled: !leagueImport.pasteValue,
          onClick: () => {
            if (leagueImport.busy) return

            leagueImport.handleClear()
            setActiveStep(0)
          },
        },
        {
          id: 'preview',
          label: 'הצג נתונים',
          iconId: 'addStats',
          presentationRole: 'primary',
          disabled: !leagueImport.pasteValue || !leagueImport.seasonStatus,
          onClick: leagueImport.handlePreview,
        },
      ]}
    />
  ) : activeStep === 2 ? (
    <ImportActionArea
      actions={[
        {
          id: 'back',
          label: 'חזרה',
          iconId: 'forward',
          presentationRole: 'back',
          disabled: leagueImport.busy,
          onClick: () => setActiveStep(1),
        },
        leagueImport.identityIndexDocument ? {
          id: 'identity-json',
          label: 'מסמך זיהוי',
          iconId: 'dataShow',
          presentationRole: 'secondary',
          onClick: () => setIdentityJsonOpen(true),
        } : null,
      ]}
    />
  ) : null
  const handleConfirm = () => {
    if (activeStep === 0) {
      setActiveStep(1)
      return
    }

    if (activeStep === 1) {
      setActiveStep(2)
      return
    }

    leagueImport.handleConfirm()
  }
  const handleClose = () => {
    if (leagueImport.busy) return

    leagueImport.handleClear()
    leagueImport.handleClose()
  }
  const confirmLabel = activeStep === 0
    ? 'המשך'
    : activeStep === 1
      ? 'המשך'
      : 'אישור טעינה'

  return (
    <>
      <RegularModal
        open={leagueImport.open}
        title='טעינת נתוני ליגה'
        description={leagueContext}
        iconId='upload'
        busy={leagueImport.busy}
        disabled={confirmDisabled}
        confirmLabel={confirmLabel}
        confirmIconId={activeStep === 2 ? 'upload' : 'next'}
        size='xl'
        contentSx={pasteSx.modalContent}
        footerActions={footerActions}
        onConfirm={handleConfirm}
        onClose={handleClose}
      >
        <Box sx={pasteSx.content}>
          <ModalStepper activeStep={activeStep} steps={STEPS} />

          {activeStep === 0 ? seasonStatusControl : null}

          {activeStep === 1 ? (
            <PasteArea
              value={leagueImport.pasteValue}
              placeholder={placeholder}
              compact={hasPreviewRows}
              onChange={leagueImport.setPasteValue}
            />
          ) : null}

          {activeStep === 2 ? (
            <PreviewTable
              columns={columns}
              rows={leagueImport.rows}
              onCellChange={leagueImport.handleCellChange}
              getRowStatus={getLeagueImportRowStatus}
            />
          ) : null}
        </Box>
      </RegularModal>
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
