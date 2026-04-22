// teamProfile/mobile/modules/games/components/toolbar/GamesFiltersContent.js

import React, { useMemo } from 'react'
import {
  Box,
  Input,
  Option,
  Select,
  Typography,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'
import SelectValue from './SelectValue.js'

import {
  buildToolbarState,
  getHomeOptionColor,
} from '../../../../../sharedLogic'

export default function GamesFiltersContent({
  summary,
  filters,
  options = {},
  onChangeFilters,
}) {
  const {
    typeOptions,
    resultOptions,
    homeOptions,
    difficultyOptions,
    totalGames,
    selectedType,
    selectedResult,
    selectedHome,
    selectedDifficulty,
  } = useMemo(() => {
    return buildToolbarState({ summary, filters, options })
  }, [summary, filters, options])

  return (
    <Box sx={{ display: 'grid', gap: 1.1 }}>
      <Box sx={{ minWidth: 0, px: 2 }}>
        <FormControl>
          <FormLabel>חיפוש</FormLabel>

          <Input
            value={filters?.search || ''}
            onChange={(e) => onChangeFilters({ search: e.target.value })}
            startDecorator={iconUi({ id: 'search' })}
            placeholder="יריבה, תוצאה, סוג משחק"
            size="sm"
          />

          <FormHelperText>חיפוש חופשי ברשימת משחקי הקבוצה</FormHelperText>
        </FormControl>
      </Box>

      <Box sx={sx.grid2}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>סוג משחק</FormLabel>

            <Select
              size="sm"
              value={filters?.typeKey || ''}
              onChange={(_, v) => onChangeFilters({ typeKey: v || '' })}
              slotProps={{ listbox: { sx: sx.listboxSx } }}
              renderValue={() => (
                <SelectValue
                  label={selectedType?.label || 'כל סוגי המשחקים'}
                  icon={selectedType?.idIcon || 'game'}
                  count={selectedType?.count ?? totalGames}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל סוגי המשחקים"
                  icon="game"
                  count={totalGames}
                />
              </Option>

              {typeOptions.map((item) => (
                <Option key={item.id || item.value} value={item.value || item.id}>
                  <SelectValue
                    label={item.label}
                    icon={item.idIcon || 'game'}
                    count={item.count}
                  />
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>בית / חוץ</FormLabel>

            <Select
              size="sm"
              value={filters?.homeKey || ''}
              onChange={(_, v) => onChangeFilters({ homeKey: v || '' })}
              slotProps={{ listbox: { sx: sx.listboxSx } }}
              renderValue={() => (
                <SelectValue
                  label={selectedHome?.label || 'בית / חוץ'}
                  icon={selectedHome?.idIcon || 'home'}
                  count={selectedHome?.count ?? totalGames}
                  color={getHomeOptionColor(selectedHome)}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="בית / חוץ"
                  icon="home"
                  count={totalGames}
                />
              </Option>

              {homeOptions.map((item) => (
                <Option
                  key={item.id || item.value}
                  value={item.value || item.id}
                  color={getHomeOptionColor(item)}
                >
                  <SelectValue
                    label={item.label}
                    icon={item.idIcon || 'home'}
                    count={item.count}
                    color={getHomeOptionColor(item)}
                  />
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={sx.grid2}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>תוצאה</FormLabel>

            <Select
              size="sm"
              value={filters?.resultKey || ''}
              onChange={(_, v) => onChangeFilters({ resultKey: v || '' })}
              slotProps={{ listbox: { sx: sx.listboxSx } }}
              renderValue={() => (
                <SelectValue
                  label={selectedResult?.label || 'כל התוצאות'}
                  icon={selectedResult?.idIcon || 'result'}
                  count={selectedResult?.count ?? totalGames}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל התוצאות"
                  icon="result"
                  count={totalGames}
                />
              </Option>

              {resultOptions.map((item) => (
                <Option key={item.id || item.value} value={item.value || item.id}>
                  <SelectValue
                    label={item.label}
                    icon={item.idIcon || 'result'}
                    count={item.count}
                  />
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>רמת קושי</FormLabel>

            <Select
              size="sm"
              value={filters?.difficultyKey || ''}
              onChange={(_, v) => onChangeFilters({ difficultyKey: v || '' })}
              slotProps={{ listbox: { sx: sx.listboxSx } }}
              renderValue={() => (
                <SelectValue
                  label={selectedDifficulty?.label || 'כל רמות הקושי'}
                  icon={selectedDifficulty?.idIcon || 'difficulty'}
                  count={selectedDifficulty?.count ?? totalGames}
                />
              )}
            >
              <Option value="">
                <SelectValue
                  label="כל רמות הקושי"
                  icon="difficulty"
                  count={totalGames}
                />
              </Option>

              {difficultyOptions.map((item) => (
                <Option key={item.id || item.value} value={item.value || item.id}>
                  <SelectValue
                    label={item.label}
                    icon={item.idIcon || 'difficulty'}
                    count={item.count}
                  />
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ pt: 1 }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          כל שינוי מוחל מיידית על רשימת משחקי הקבוצה
        </Typography>
      </Box>
    </Box>
  )
}
