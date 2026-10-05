// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsNavigation.js

import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { DATA_OPS_SUMMARY, DATA_OPS_TABS } from './dataOps.mock.js'
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'

export function DataOpsTabs({ activeTab, onChange, receiptCount = 0 }) {
  return (
    <Box sx={sx.tabsShell}>
      <Box
        role='tablist'
        aria-label='תחומי ניהול הדאטה'
        sx={sx.tabs}
      >
        {DATA_OPS_TABS.map(tab => {
          const selected = activeTab === tab.id

          return (
            <Button
              key={tab.id}
              role='tab'
              type='button'
              aria-selected={selected}
              variant='plain'
              color='neutral'
              startDecorator={iconUi({ id: tab.iconId, size: 'sm' })}
              endDecorator={tab.id === 'receipts' && receiptCount > 0 ? (
                <Box component='span' sx={sx.tabCount}>{receiptCount}</Box>
              ) : null}
              onClick={() => onChange(tab.id)}
              sx={[sx.tab, selected && sx.activeTab]}
            >
              {tab.label}
            </Button>
          )
        })}
      </Box>
    </Box>
  )
}

export function DataOpsSummary({ openReceipts = 0 }) {
  return (
    <Box aria-label='מצב המערכת' sx={sx.summaryGrid}>
      {DATA_OPS_SUMMARY.map((item, index) => {
        const value = item.id === 'openReceipts' ? String(openReceipts) : item.value

        return (
          <Box key={item.id} sx={sx.summaryItem(item.tone)}>
            <Box sx={sx.summaryCopy}>
              <Typography sx={sx.summaryLabel}>{item.label}</Typography>
              <Typography sx={sx.summaryValue}>{value}</Typography>
            </Box>

            {index === 0 ? (
              <Chip
                size='sm'
                variant='soft'
                color='success'
                startDecorator={iconUi({ id: 'check', size: 'sm' })}
              >
                כיסוי מלא
              </Chip>
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
}
