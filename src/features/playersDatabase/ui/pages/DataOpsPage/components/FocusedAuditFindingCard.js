// src/features/playersDatabase/ui/pages/DataOpsPage/components/FocusedAuditFindingCard.js

import { Box, Button, Chip, Typography } from '@mui/joy'
import { Link as RouterLink } from 'react-router-dom'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { inspectFocusedAuditRepair } from '../../../../services/audit/repair/index.js'
import { getFocusedAuditSourceReload } from '../logic/focusedAuditSourceReload.js'
import {
  formatFocusedAuditValue,
  presentFocusedAuditFinding,
} from '../logic/focusedAuditFindings.presentation.js'
import { dataOpsPageSx as sx } from '../sx/dataOpsPage.sx.js'
import { focusedAuditFindingsSx as findingSx } from '../sx/focusedAuditFindings.sx.js'

export default function FocusedAuditFindingCard({
  finding,
  scope,
  disabled,
  repairing,
  onRepair,
  onOpenContext,
}) {
  const display = presentFocusedAuditFinding(finding)
  const action = inspectFocusedAuditRepair({ scope: scope || {}, finding })
  const reload = getFocusedAuditSourceReload({ scope: scope || {}, finding })
  const hasComparison = Object.prototype.hasOwnProperty.call(finding, 'expected')
    || Object.prototype.hasOwnProperty.call(finding, 'actual')

  return (
    <Box component='article' sx={sx.finding(display.tone)}>
      <Box sx={sx.findingTop}>
        <Box sx={sx.findingCopy}>
          <Typography level='title-sm'>{display.title}</Typography>
          <Typography level='body-sm'>{display.description}</Typography>
          <Typography component='code' level='body-xs' sx={sx.findingDocumentId}>
            {finding.documentId || finding.relatedDocumentId || 'מסמך המקור חסר'}
          </Typography>
        </Box>
        <Box sx={findingSx.tags}>
          <Chip size='sm' variant='soft' color={display.tone === 'danger' ? 'danger' : 'warning'}>
            {display.label}
          </Chip>
          <Chip size='sm' variant='outlined'>{display.target}</Chip>
        </Box>
      </Box>

      {hasComparison ? (
        <Box component='details' sx={findingSx.details}>
          <Box component='summary'>השוואת הנתונים</Box>
          {finding.field ? (
            <Typography component='code' level='body-xs' sx={sx.findingDocumentId}>
              {finding.field}
            </Typography>
          ) : null}
          <Box sx={findingSx.comparison}>
            {[
              ['הערך הצפוי לפי המקור', finding.expected],
              ['הערך השמור בפועל', finding.actual],
            ].map(([label, value]) => (
              <Box key={label} sx={{ minWidth: 0 }}>
                <Typography level='body-xs' fontWeight={700}>{label}</Typography>
                <Box component='pre' className='dpScrollThin' sx={findingSx.value}>
                  {formatFocusedAuditValue(value)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      <Box sx={sx.findingFooter}>
        <Typography level='body-xs' sx={findingSx.actionCopy}>
          {reload ? reload.description : action.allowed ? action.description : action.reason || 'לא זמין תיקון לממצא זה.'}
        </Typography>
        <Box sx={findingSx.actions}>
          <Button type='button' size='sm' variant='outlined' disabled={disabled} onClick={onOpenContext}>
            פתח הקשר עסקי
          </Button>
          {reload ? (
            <Button
              component={RouterLink}
              to={reload.route}
              state={reload.context}
              size='sm'
              disabled={disabled}
              startDecorator={iconUi({ id: 'edit', size: 'sm' })}
            >
              {reload.label}
            </Button>
          ) : <Button
            type='button'
            size='sm'
            loading={repairing}
            disabled={disabled || !action.allowed}
            startDecorator={iconUi({ id: 'edit', size: 'sm' })}
            onClick={onRepair}
          >
            {action.label || 'תקן ממצא'}
          </Button>}
        </Box>
      </Box>
    </Box>
  )
}
