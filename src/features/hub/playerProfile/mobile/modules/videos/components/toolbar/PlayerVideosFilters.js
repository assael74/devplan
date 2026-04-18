// playerProfile/mobile/modules/videos/components/toolbar/PlayerVideosFilters.js

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
import ToolbarSelectValue from './ToolbarSelectValue.js'

import {
  buildToolbarState,
  getHomeOptionColor,
} from '../../../../../sharedLogic'

export default function PlayerVideosFilters({
  entityType = 'videoAnalysis',
  summary,
  filters,
  indicators = [],
  options = {},
  onChangeFilters,
  onResetFilters,
}) {
  const periodOptions = Array.isArray(options?.periodOptions) ? options.periodOptions : []
  const scopeOptions = Array.isArray(options?.scopeOptions) ? options.scopeOptions : []
  const categoryOptions = Array.isArray(options?.tagCategoryOptions) ? options.tagCategoryOptions : []
  const topicOptions = Array.isArray(options?.tagTopicOptions) ? options.tagTopicOptions : []

  const selectedScope =
    scopeOptions.find((x) => x.id === (filters?.scope || 'all')) ||
    scopeOptions.find((x) => x.id === 'all') ||
    null

  const selectedPeriod = periodOptions.find((x) => x.value === (filters?.periodKey || '')) || null
  const selectedCategory =
    categoryOptions.find((x) => x.value === (filters?.categoryKey || '')) || null
  const selectedTopic =
    topicOptions.find((x) => x.value === (filters?.topicKey || '')) || null

  const resultsText = useMemo(() => {
    return `מוצגים ${summary?.filteredVideos || 0} מתוך ${summary?.totalVideos || 0} קטעים`
  }, [summary?.filteredVideos, summary?.totalVideos])

  return (
    <Box sx={{ display: 'grid', gap: 1.1 }}>
      <Box sx={{ minWidth: 0, px: 2 }}>
        <FormControl>
          <FormLabel>חיפוש</FormLabel>
          <Input
            value={filters?.search || ''}
            onChange={(e) => onChangeFilters({ search: e.target.value })}
            startDecorator={iconUi({ id: 'search' })}
            placeholder="חיפוש לפי שם והערות"
            size="sm"
          />
          <FormHelperText>חיפוש חופשי ברשימת ניתוחי הוידאו</FormHelperText>
        </FormControl>
      </Box>

      <Box sx={sx.grid2}>
        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>סוג הוידאו</FormLabel>
            <Select
              size="sm"
              value={filters?.scope || 'all'}
              onChange={(_, v) => onChangeFilters({ scope: v || 'all' })}
              slotProps={{ listbox: { sx: sx.listbox } }}
              renderValue={() => (
                <ToolbarSelectValue
                  label={selectedScope?.label || 'כל הסוגים'}
                  iconId={selectedScope?.id === 'meeting' ? 'meeting' : 'videoAnalysis'}
                  count={selectedScope?.count ?? summary?.totalVideos ?? 0}
                />
              )}
            >
              {scopeOptions.map((item) => (
                <Option key={item.id} value={item.id}>
                  <ToolbarSelectValue
                    label={item.label}
                    iconId={item.id === 'meeting' ? 'meeting' : 'videoAnalysis'}
                    count={item.count}
                  />
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>חודש הוידאו</FormLabel>
            <Select
              size="sm"
              value={filters?.periodKey || ''}
              onChange={(_, v) => onChangeFilters({ periodKey: v || '' })}
              slotProps={{ listbox: { sx: sx.listbox } }}
              renderValue={() => (
                <ToolbarSelectValue
                  label={selectedPeriod?.label || 'כל החודשים'}
                  iconId="calendar"
                  count={selectedPeriod?.count ?? summary?.totalVideos ?? 0}
                />
              )}
            >
              <Option value="">
                <ToolbarSelectValue
                  label="כל החודשים"
                  iconId="calendar"
                  count={summary?.totalVideos || 0}
                />
              </Option>

              {periodOptions.map((item) => (
                <Option key={item.id} value={item.value}>
                  <ToolbarSelectValue
                    label={item.label}
                    iconId="calendar"
                    count={item.count}
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
            <FormLabel>קטגוריה</FormLabel>
            <Select
              size="sm"
              value={filters?.categoryKey || ''}
              onChange={(_, v) => onChangeFilters({ categoryKey: v || '', topicKey: '' })}
              slotProps={{ listbox: { sx: sx.listbox } }}
              renderValue={() => (
                <ToolbarSelectValue
                  label={selectedCategory?.label || 'כל הקטגוריות'}
                  iconId="parents"
                  count={selectedCategory?.count ?? summary?.totalVideos ?? 0}
                />
              )}
            >
              <Option value="">
                <ToolbarSelectValue
                  label="כל הקטגוריות"
                  iconId="parents"
                  count={summary?.totalVideos || 0}
                />
              </Option>

              {categoryOptions.map((item) => (
                <Option key={item.id} value={item.value}>
                  <ToolbarSelectValue
                    label={item.label}
                    iconId="parents"
                    count={item.count}
                  />
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <FormControl>
            <FormLabel>נושא הוידאו</FormLabel>
            <Select
              size="sm"
              value={filters?.topicKey || ''}
              onChange={(_, v) => onChangeFilters({ topicKey: v || '' })}
              disabled={!topicOptions.length}
              slotProps={{ listbox: { sx: sx.listbox } }}
              renderValue={() => (
                <ToolbarSelectValue
                  label={selectedTopic?.label || 'כל הנושאים'}
                  iconId="children"
                  count={selectedTopic?.count ?? topicOptions.length ?? 0}
                />
              )}
            >
              <Option value="">
                <ToolbarSelectValue
                  label="כל הנושאים"
                  iconId="children"
                  count={topicOptions.length || 0}
                />
              </Option>

              {topicOptions.map((item) => (
                <Option key={item.id} value={item.value}>
                  <ToolbarSelectValue
                    label={item.label}
                    iconId="children"
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
          כל שינוי מוחל מיידית על הרשימה
        </Typography>
      </Box>
    </Box>
  )
}
