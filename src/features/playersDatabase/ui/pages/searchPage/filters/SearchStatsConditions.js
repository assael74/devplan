// features/playersDatabase/ui/pages/searchPage/filters/SearchStatsConditions.js

import { Box, Button, IconButton, Input, Option, Select } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { SEARCH_OPERATORS, SEARCH_STAT_FIELDS } from '../logic/search.constants.js'
import SearchFilterSection from './SearchFilterSection.js'
import { searchFiltersSx as sx } from '../sx/searchFilters.sx.js'

export default function SearchStatsConditions({ conditions, onAdd, onUpdate, onRemove }) {
  return (
    <SearchFilterSection title='תנאי סטטיסטיקה' description='הוסף כמה תנאים שיידרשו במקביל.'>
      <Box sx={sx.conditionsList}>
        {conditions.map(condition => (
          <Box key={condition.id} sx={sx.conditionRow}>
            <Select size='sm' value={condition.field} onChange={(event, value) => onUpdate(condition.id, 'field', value)}>
              {SEARCH_STAT_FIELDS.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
            </Select>

            <Select size='sm' value={condition.operator} onChange={(event, value) => onUpdate(condition.id, 'operator', value)}>
              {SEARCH_OPERATORS.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
            </Select>

            <Input
              size='sm'
              type='number'
              value={condition.value}
              placeholder='ערך'
              onChange={event => onUpdate(condition.id, 'value', event.target.value)}
            />

            <IconButton size='sm' variant='plain' sx={sx.removeConditionButton} onClick={() => onRemove(condition.id)}>
              {iconUi({ id: 'delete', size: 'sm' })}
            </IconButton>
          </Box>
        ))}
      </Box>

      <Button size='sm' variant='outlined' sx={sx.addConditionButton} onClick={onAdd}>
        הוספת תנאי
      </Button>
    </SearchFilterSection>
  )
}
