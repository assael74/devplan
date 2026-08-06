// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterTableFilters.js

import { Button, Input, Option, Select, Stack } from '@mui/joy'

import { leagueCenterContentSx as sx } from './sx/leagueCenterContent.sx.js'

export default function LeagueCenterTableFilters({ model }) {
  const reset = () => {
    model.setQuery('')
    model.setDataStatus('all')
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={sx.tableFilters}>
      <Input
        placeholder='חיפוש לפי שם ליגה...'
        value={model.query}
        sx={sx.tableSearch}
        onChange={event => model.setQuery(event.target.value)}
      />

      <Select
        value={model.dataStatus}
        sx={sx.tableStatusSelect}
        onChange={(event, value) => model.setDataStatus(value || 'all')}
      >
        <Option value='all'>כל מצבי הנתונים</Option>
        <Option value='full'>מלא</Option>
        <Option value='partial'>חלקי</Option>
        <Option value='missing'>חסר</Option>
      </Select>

      <Button variant='outlined' sx={sx.resetButton} onClick={reset}>
        איפוס
      </Button>
    </Stack>
  )
}
