// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsAuditWorkspace.js

import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  LinearProgress,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import DrawerHeaderShell from '../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import InfoPanel from '../../components/page/InfoPanel.js'
import { ENTITY_FINDINGS } from './dataOps.mock.js'
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'

const ENTITY_OPTIONS = [
  { id: 'team', label: 'קבוצה', iconId: 'teams' },
  { id: 'club', label: 'מועדון', iconId: 'clubs' },
  { id: 'player', label: 'שחקן', iconId: 'players' },
]

function ScopePanel({ entityType, onEntityTypeChange, onRun }) {
  return (
    <InfoPanel title='הגדרת הבדיקה' sx={sx.panel}>
      <Stack spacing={1.5}>
        <Box sx={sx.entityButtons}>
          {ENTITY_OPTIONS.map(option => {
            const selected = option.id === entityType

            return (
              <Button
                key={option.id}
                type='button'
                size='sm'
                variant={selected ? 'solid' : 'outlined'}
                color={selected ? 'primary' : 'neutral'}
                startDecorator={iconUi({ id: option.iconId, size: 'sm' })}
                onClick={() => onEntityTypeChange(option.id)}
                sx={sx.entityButton}
              >
                {option.label}
              </Button>
            )
          })}
        </Box>

        <Box sx={sx.field}>
          <Typography component='label' htmlFor='data-ops-entity' sx={sx.fieldLabel}>
            ישות לבדיקה
          </Typography>
          <Select id='data-ops-entity' defaultValue='netanya-u19'>
            <Option value='netanya-u19'>מכבי נתניה נערים א׳</Option>
            <Option value='haifa-u19'>הפועל חיפה נערים א׳</Option>
            <Option value='maccabi-haifa-u18'>מכבי חיפה נערים ב׳</Option>
          </Select>
        </Box>

        <Box sx={sx.field}>
          <Typography component='label' htmlFor='data-ops-season' sx={sx.fieldLabel}>
            עונה
          </Typography>
          <Select id='data-ops-season' defaultValue='2026'>
            <Option value='2026'>2026/27 · פעילה</Option>
            <Option value='2025'>2025/26 · היסטוריה</Option>
          </Select>
        </Box>

        <Divider />

        <Box sx={sx.checks}>
          <Typography sx={sx.fieldLabel}>היקף הבדיקה</Typography>
          <Checkbox defaultChecked label='מקור קנוני' size='sm' />
          <Checkbox defaultChecked label='מסמכי שחקנים ועונות' size='sm' />
          <Checkbox defaultChecked label='אינדקסים ותוצרים נגזרים' size='sm' />
          <Checkbox defaultChecked label='קשרים לליגה ולמועדון' size='sm' />
        </Box>

        <Button
          type='button'
          startDecorator={iconUi({ id: 'search', size: 'sm' })}
          onClick={onRun}
          sx={sx.primaryAction}
        >
          הרץ בדיקה
        </Button>

        <Typography sx={sx.readOnlyNote}>
          {iconUi({ id: 'view', size: 'sm' })}
          הבדיקה קוראת ומשווה בלבד
        </Typography>
      </Stack>
    </InfoPanel>
  )
}

function ResultsPanel({ auditRevision, onOpenRepair }) {
  return (
    <InfoPanel
      title='תוצאות הבדיקה'
      actions={(
        <Chip
          size='sm'
          color='warning'
          variant='soft'
          startDecorator={iconUi({ id: 'warning', size: 'sm' })}
        >
          נמצאו 4 פערים
        </Chip>
      )}
      sx={sx.panel}
    >
      <Stack spacing={1.5}>
        <Box sx={sx.coverage}>
          <Box sx={sx.coverageCopy}>
            <Typography level='title-sm'>כיסוי מלא</Typography>
            <Typography level='body-xs'>8 מתוך 8 תחומים נבדקו</Typography>
          </Box>
          <LinearProgress
            determinate
            value={100}
            color='success'
            aria-label='כיסוי הבדיקה'
          />
        </Box>

        <Box sx={sx.panelHeader}>
          <Box>
            <Typography sx={sx.sectionTitle}>ממצאים לפי מקור הבעיה</Typography>
            <Typography sx={sx.sectionDescription}>
              {auditRevision > 0 ? 'עודכן עכשיו · תצוגת UI מקומית' : 'עודכן לפני 12 דקות'}
            </Typography>
          </Box>
          <Button
            type='button'
            size='sm'
            variant='plain'
            color='neutral'
            startDecorator={iconUi({ id: 'download', size: 'sm' })}
          >
            ייצוא
          </Button>
        </Box>

        <Box sx={sx.findings}>
          {ENTITY_FINDINGS.map(finding => (
            <Box key={finding.id} sx={sx.finding(finding.severity)}>
              <Box sx={sx.findingTop}>
                <Box sx={sx.findingCopy}>
                  <Typography level='title-sm'>{finding.title}</Typography>
                  <Typography sx={sx.findingDetail}>{finding.detail}</Typography>
                </Box>
                <Chip
                  size='sm'
                  variant='soft'
                  color={finding.severity === 'danger' ? 'danger' : 'warning'}
                >
                  {finding.severityLabel}
                </Chip>
              </Box>

              <Box sx={sx.findingFooter}>
                <Typography sx={sx.sourceLabel}>{finding.source}</Typography>
                <Button
                  type='button'
                  size='sm'
                  variant='outlined'
                  color={finding.severity === 'danger' ? 'danger' : 'neutral'}
                  onClick={() => onOpenRepair(finding)}
                >
                  הצג דרך תיקון
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Stack>
    </InfoPanel>
  )
}

function EntityContextPanel() {
  const rows = [
    ['מועדון', 'מכבי נתניה'],
    ['ליגה', 'נערים א׳ על'],
    ['עונה', '2026/27'],
    ['שחקנים', '24'],
    ['מסמכים קשורים', '46'],
  ]

  return (
    <InfoPanel
      title='הקשר הבדיקה'
      sx={sx.panel}
    >
      <Stack spacing={1.5}>
        <Box sx={sx.previewIntro}>
          {iconUi({ id: 'teams', size: 'md' })}
          <Box>
            <Typography level='title-sm'>מכבי נתניה נערים א׳</Typography>
            <Typography level='body-xs'>ישות פעילה · מקור קנוני נמצא</Typography>
          </Box>
        </Box>

        <Box component='dl' sx={sx.previewList}>
          {rows.map(([label, value]) => (
            <Box key={label} component='div' sx={sx.previewListItem}>
              <Typography component='dt' level='body-xs'>{label}</Typography>
              <Typography component='dd' level='body-sm' fontWeight={800}>{value}</Typography>
            </Box>
          ))}
        </Box>

        <Chip
          size='sm'
          variant='soft'
          color='success'
          startDecorator={iconUi({ id: 'check', size: 'sm' })}
        >
          הקשרים המרכזיים נמצאו
        </Chip>
      </Stack>
    </InfoPanel>
  )
}

function RepairDrawer({ finding, open, onClose }) {
  if (!finding) return null

  const header = (
    <DrawerHeaderShell
      title='תצוגה מקדימה לתיקון'
      subline={finding.title}
      titleIconId='reset'
      meta='פעולת כתיבה · טרם חוברה'
      metaIconId='warning'
      chipLabel='DataOps'
      chipIconId='playersDatabase'
    />
  )

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      header={header}
      canSave={false}
      actions={{ onSave: () => {} }}
      texts={{ save: 'בצע תיקון', cancel: 'סגירה' }}
      status={{ text: 'תצוגת UI בלבד · אין חיבור לנתונים', color: 'neutral' }}
      saveIconId='reset'
    >
      <Stack spacing={2}>
        <Box sx={sx.previewIntro}>
          {iconUi({ id: 'info', size: 'md' })}
          <Box>
            <Typography level='title-sm'>{finding.action}</Typography>
            <Typography level='body-sm'>לפני ביצוע תוצג למשתמש רשימת המסמכים והשדות שיושפעו.</Typography>
          </Box>
        </Box>

        <Box>
          <Typography level='title-sm'>מסמכים צפויים להשתנות</Typography>
          <Box component='ul' sx={sx.previewList}>
            {finding.documents.map(documentName => (
              <Box key={documentName} component='li' sx={sx.previewListItem}>
                <Typography component='code' level='body-sm'>{documentName}</Typography>
                <Chip size='sm' variant='soft' color='warning'>תכנון</Chip>
              </Box>
            ))}
          </Box>
        </Box>

        <Checkbox label='בדקתי את ההשפעה ואני מאשר את הפעולה' disabled />
        <Typography sx={sx.disabledHelp}>
          האישור והביצוע יופעלו רק לאחר חיבור התהליך העסקי.
        </Typography>
      </Stack>
    </DrawerShell>
  )
}

export default function DataOpsAuditWorkspace() {
  const [entityType, setEntityType] = useState('team')
  const [auditRevision, setAuditRevision] = useState(0)
  const [repairFinding, setRepairFinding] = useState(null)

  return (
    <>
      <Box sx={sx.workspace}>
        <Box className='dpScrollThin' sx={sx.workspacePanelScroll}>
          <ScopePanel
            entityType={entityType}
            onEntityTypeChange={setEntityType}
            onRun={() => setAuditRevision(value => value + 1)}
          />
        </Box>

        <Box className='dpScrollThin' sx={sx.workspacePanelScroll}>
          <ResultsPanel
            auditRevision={auditRevision}
            onOpenRepair={setRepairFinding}
          />
        </Box>

        <Box
          className='dpScrollThin'
          sx={[sx.workspacePanelScroll, sx.fullWidthOnMedium]}
        >
          <EntityContextPanel />
        </Box>
      </Box>

      <RepairDrawer
        finding={repairFinding}
        open={Boolean(repairFinding)}
        onClose={() => setRepairFinding(null)}
      />
    </>
  )
}
