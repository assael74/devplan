// playerProfile/mobile/modules/payments/components/PaymentsTabsBar.js

import React from 'react'
import { Box, Chip, Sheet } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { toolbarSx as sx } from '../sx/toolbar.sx.js'

function TabButton({ active, label, iconId, onClick }) {
  return (
    <Chip
      size="md"
      variant={active ? 'solid' : 'soft'}
      color={active ? 'primary' : 'neutral'}
      startDecorator={iconUi({ id: iconId, size: 'sm' })}
      onClick={onClick}
      sx={sx.chip}
    >
      {label}
    </Chip>
  )
}

export default function PaymentsTabsBar({
  activeTab = 'payments',
  onChangeTab,
}) {
  return (
    <Sheet variant="plain" sx={sx.tabs}>
      <Box sx={sx.tabsWrap}>
        <TabButton
          active={activeTab === 'payments'}
          label="תשלומים"
          iconId="payments"
          onClick={() => onChangeTab('payments')}
        />

        <TabButton
          active={activeTab === 'parents'}
          label="הורים"
          iconId="playerParents"
          onClick={() => onChangeTab('parents')}
        />
      </Box>
    </Sheet>
  )
}
