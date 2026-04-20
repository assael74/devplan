// playerProfile/mobile/modules/payments/components/toolbar/PaymentsToolbar.js

import React from 'react'
import { Box, Chip, IconButton, Sheet, Typography, Button } from '@mui/joy'

import { FiltersTrigger } from '../../../../../../../../ui/patterns/filters/index.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import ToolbarFilterChip from './ToolbarFilterChip.js'
import PaymentsSummaryCards from './PaymentsSummaryCards'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

const safeArray = (value) => (Array.isArray(value) ? value : [])

export default function PaymentsToolbar({
  summary,
  totalCount = 0,
  indicators = [],
  onOpenFilters,
  onOpenNewParent,
  onClearIndicator,
  mode = 'payments',
  filteredCount = 0,
  hasActiveFilters = false,
}) {
  const list = safeArray(indicators)

  return (
    <Sheet variant="plain" sx={sx.toolbar}>
      {mode === 'payments' ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FiltersTrigger
              hasActive={hasActiveFilters}
              onClick={onOpenFilters}
              label="פילטרים"
            />

            <Chip
              size="sm"
              variant="soft"
              color="primary"
              startDecorator={iconUi({ id: 'payments', size: 'sm' })}
            >
              {filteredCount} / {totalCount} תשלומים
            </Chip>
          </Box>
          <PaymentsSummaryCards summary={summary} />
        </>

      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography level="title-sm" sx={{ fontWeight: 600 }} startDecorator={iconUi({ id: 'playerParents' })}>
            אזור הורים
          </Typography>

          <IconButton
            size="sm"
            variant="soft"
            onClick={onOpenNewParent}
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            {iconUi({id: 'addParent'})}
          </IconButton>
        </Box>
      )}

      {mode === 'payments' && list.length ? (
        <Box sx={sx.indicatorsRow}>
          {list.map((item) => (
            <ToolbarFilterChip
              key={item.id || item.label}
              item={item}
              onClear={onClearIndicator}
            />
          ))}
        </Box>
      ) : null}
    </Sheet>
  )
}
