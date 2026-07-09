// src/features/reports/management/components/ReportsManagementToolbar.js

import { useState } from 'react'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  REPORT_DEV_CATEGORY_OPTIONS,
  getReportStatus,
  getReportsByCategory,
} from '../reportsManagement.catalog.js'

import {
  catalogSx,
  toolbarSx,
} from '../sx/index.js'

function getInitialOpenCategories(reportId) {
  const selectedCategory = REPORT_DEV_CATEGORY_OPTIONS.find(category => {
    return getReportsByCategory(category.id).some(report => report.id === reportId)
  })

  return selectedCategory
    ? [selectedCategory.id]
    : [REPORT_DEV_CATEGORY_OPTIONS[0]?.id].filter(Boolean)
}

function ReportRow({
  report,
  selected,
  onSelect,
}) {
  const status = getReportStatus(report)
  const disabled = !report.connected

  const handleSelect = () => {
    if (!disabled) onSelect(report.id)
  }

  const handleKeyDown = event => {
    if (disabled || !['Enter', ' '].includes(event.key)) return

    event.preventDefault()
    handleSelect()
  }

  return (
    <Box
      role='button'
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-current={selected ? 'page' : undefined}
      sx={catalogSx.reportRow(selected, disabled)}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <Box sx={catalogSx.reportIndicator(selected)} />

      <Box sx={catalogSx.reportContent}>
        <Typography level='title-sm' sx={catalogSx.reportTitle}>
          {report.label}
        </Typography>

        <Typography level='body-xs' sx={catalogSx.reportScope}>
          {report.scopeLabel}
        </Typography>
      </Box>

      <Chip
        size='sm'
        variant='soft'
        color={status.color}
        sx={catalogSx.statusChip}
      >
        {status.label}
      </Chip>
    </Box>
  )
}

function ReportCategory({
  category,
  open,
  selectedReportId,
  onToggle,
  onReportChange,
}) {
  const reports = getReportsByCategory(category.id)

  const handleKeyDown = event => {
    if (!['Enter', ' '].includes(event.key)) return

    event.preventDefault()
    onToggle(category.id)
  }

  return (
    <Box sx={catalogSx.category}>
      <Box
        role='button'
        tabIndex={0}
        aria-expanded={open}
        sx={catalogSx.categoryHeader(open)}
        onClick={() => onToggle(category.id)}
        onKeyDown={handleKeyDown}
      >
        <Box sx={catalogSx.categoryIcon}>
          {iconUi({ id: category.icon })}
        </Box>

        <Box sx={catalogSx.categoryContent}>
          <Box sx={catalogSx.categoryTitleRow}>
            <Typography level='title-sm' sx={catalogSx.categoryTitle}>
              {category.label}
            </Typography>

            <Typography component='span' sx={catalogSx.categoryCount}>
              {reports.length}
            </Typography>
          </Box>

          <Typography level='body-xs' sx={catalogSx.categoryDescription}>
            {category.description}
          </Typography>
        </Box>

        <Box sx={catalogSx.categoryArrow(open)}>
          {iconUi({ id: 'expandMore' })}
        </Box>
      </Box>

      <Box sx={catalogSx.categoryCollapse(open)}>
        <Box>
          <Stack spacing={0.25} sx={catalogSx.reportsList}>
            {reports.map(report => (
              <ReportRow
                key={report.id}
                report={report}
                selected={report.id === selectedReportId}
                onSelect={onReportChange}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

export default function ReportsManagementToolbar({
  reportId,
  scenario,
  scenarioOptions = [],
  selectedScenario,
  onReportChange,
  onScenarioChange,
}) {
  const [openCategories, setOpenCategories] = useState(() => {
    return getInitialOpenCategories(reportId)
  })

  const handleCategoryToggle = categoryId => {
    setOpenCategories(current => {
      return current.includes(categoryId)
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId]
    })
  }

  const handleReportChange = nextReportId => {
    const selectedCategory = REPORT_DEV_CATEGORY_OPTIONS.find(category => {
      return getReportsByCategory(category.id).some(report => report.id === nextReportId)
    })

    if (selectedCategory) {
      setOpenCategories(current => {
        return current.includes(selectedCategory.id)
          ? current
          : [...current, selectedCategory.id]
      })
    }

    onReportChange(nextReportId)
  }

  return (
    <Stack
      component='aside'
      className='dpScrollThin'
      data-reports-dev-ui='true'
      sx={toolbarSx.toolbar}
    >
      <Box sx={toolbarSx.toolbarHeader}>
        <Typography level='title-sm'>
          קטלוג דוחות
        </Typography>

        <Typography level='body-xs' textColor='text.tertiary'>
          כל הדוחות הקיימים, המחוברים והמתוכננים
        </Typography>
      </Box>

      <Stack spacing={1.25} sx={toolbarSx.categoriesList}>
        {REPORT_DEV_CATEGORY_OPTIONS.map(category => (
          <ReportCategory
            key={category.id}
            category={category}
            open={openCategories.includes(category.id)}
            selectedReportId={reportId}
            onToggle={handleCategoryToggle}
            onReportChange={handleReportChange}
          />
        ))}
      </Stack>

      <Box sx={toolbarSx.scenario}>
        <Typography level='title-sm'>
          תרחיש בדיקה
        </Typography>

        <Select
          size='sm'
          value={scenario || null}
          placeholder='בחר תרחיש'
          onChange={(event, value) => {
            if (value) onScenarioChange(value)
          }}
          sx={toolbarSx.scenarioSelect}
        >
          {scenarioOptions.map(option => (
            <Option key={option.id} value={option.id}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Typography level='body-xs' textColor='text.tertiary'>
          {selectedScenario?.description || 'בחר תרחיש בדיקה עבור הדוח הפעיל'}
        </Typography>
      </Box>
    </Stack>
  )
}
