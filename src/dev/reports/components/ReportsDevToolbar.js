// src/dev/reports/components/ReportsDevToolbar.js

import { useState } from 'react'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import {
  REPORT_DEV_CATEGORY_OPTIONS,
  getReportStatus,
  getReportsByCategory,
} from '../reportsDev.catalog.js'
import { sx } from '../sx/reportsDev.sx.js'

function getInitialOpenCategories(reportId) {
  const selectedCategory = REPORT_DEV_CATEGORY_OPTIONS.find(category => {
    return getReportsByCategory(category.id).some(report => report.id === reportId)
  })

  return selectedCategory
    ? [selectedCategory.id]
    : [REPORT_DEV_CATEGORY_OPTIONS[0]?.id].filter(Boolean)
}

function ReportRow({ report, selected, onSelect }) {
  const status = getReportStatus(report)
  const disabled = !report.connected

  const handleSelect = () => {
    if (disabled) return
    onSelect(report.id)
  }

  const handleKeyDown = event => {
    if (disabled || !['Enter', ' '].includes(event.key)) return

    event.preventDefault()
    handleSelect()
  }

  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      sx={sx.reportRow(selected, disabled)}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <Box sx={sx.reportContent}>
        <Typography level="title-sm" sx={sx.reportTitle}>
          {report.label}
        </Typography>

        <Typography level="body-xs" textColor="text.tertiary">
          {report.scopeLabel}
        </Typography>
      </Box>

      <Chip size="sm" variant="soft" color={status.color} sx={sx.statusChip}>
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
    <Box sx={sx.category}>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        sx={sx.categoryHeader(open)}
        onClick={() => onToggle(category.id)}
        onKeyDown={handleKeyDown}
      >
        <Box sx={sx.categoryIcon}>
          {iconUi({ id: category.icon })}
        </Box>

        <Box sx={sx.categoryContent}>
          <Typography level="title-sm" sx={sx.categoryTitle}>
            {category.label}
          </Typography>

          <Typography level="body-xs" textColor="text.tertiary">
            {reports.length} דוחות
          </Typography>
        </Box>

        <Box sx={sx.categoryArrow(open)}>
          {iconUi({ id: 'expandMore' })}
        </Box>
      </Box>

      <Box sx={sx.categoryCollapse(open)}>
        <Stack spacing={0.75} sx={sx.reportsList}>
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
  )
}

export default function ReportsDevToolbar({
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
      component="aside"
      className="dpScrollThin"
      data-reports-dev-ui="true"
      sx={sx.toolbar}
    >
      <Box sx={sx.toolbarHeader}>
        <Typography level="title-sm">קטלוג דוחות</Typography>

        <Typography level="body-xs" textColor="text.tertiary">
          כל הדוחות הקיימים, המחוברים והמתוכננים
        </Typography>
      </Box>

      <Stack spacing={1}>
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

      <Box sx={sx.scenario}>
        <Typography level="title-sm">תרחיש בדיקה</Typography>

        <Select
          size="sm"
          value={scenario || null}
          placeholder="בחר תרחיש"
          onChange={(event, value) => {
            if (value) onScenarioChange(value)
          }}
          sx={sx.scenarioSelect}
        >
          {scenarioOptions.map(option => (
            <Option key={option.id} value={option.id}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Typography level="body-xs" textColor="text.tertiary">
          {selectedScenario?.description || 'בחר תרחיש בדיקה עבור הדוח הפעיל'}
        </Typography>
      </Box>
    </Stack>
  )
}
