// src/features/reports/dashboard/components/sidbar/ReportsSection.js

import Box from '@mui/joy/Box'
import Divider from '@mui/joy/Divider'
import Dropdown from '@mui/joy/Dropdown'
import IconButton from '@mui/joy/IconButton'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'
import Typography from '@mui/joy/Typography'

import { getFullDateIl } from '../../../../../shared/format/dateUtiles.js'
import { PUBLIC_REPORT_STATUS } from '../../../reports.constants.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'
import { reportsSx as sx } from './sx/reports.sx.js'

function formatPublicationDate(publication = {}) {
  const rawDate = publication.publishedAt || ''
  const dateValue = typeof rawDate?.toDate === 'function' ? rawDate.toDate() : rawDate
  const formattedDate = getFullDateIl(dateValue, false)

  return formattedDate || 'תאריך לא זמין'
}

export default function ReportsSection({
  reports = [],
  selectedReportId = '',
  selectedPublicationId = '',
  openReportIds = [],
  onPublicationSelect,
  onReportToggle,
  onPublicationShare,
  onPublicationStop,
  onPublicationDelete,
}) {
  return (
    <Box sx={sx.reportsSection}>
      <Box sx={sx.reportsSectionHeader}>
        <Typography level='body-xs' sx={sx.sectionTitle}>
          סוגי דוחות
        </Typography>

        <Typography level='body-xs' sx={sx.reportsCount(reports.length)}>
          {reports.length}
        </Typography>
      </Box>

      <Box sx={sx.reportList}>
        {reports.map(report => {
          const disabled = !report.exists
          const open = !disabled && openReportIds.includes(report.id)
          const activePublicationId = report.id === selectedReportId ? selectedPublicationId : ''

          return (
            <CollapseBox
              key={report.id}
              open={open}
              disabled={disabled}
              onToggle={() => onReportToggle(report.id)}
              title={(
                <Typography
                  level='body-sm'
                  startDecorator={iconUi({ id: report.categoryId || 'report', size: 'sm' })}
                  sx={sx.reportTitle(open, disabled)}
                >
                  {report.label}
                </Typography>
              )}
              subtitle={null}
              headerRight={(
                <Box sx={sx.reportCount(open, disabled, report.publications.length)}>
                  {report.publications.length}
                </Box>
              )}
              rootSx={sx.reportGroup(open, disabled)}
              headerSx={sx.reportHead(open, disabled)}
              contentSx={sx.reportContent}
              innerSx={sx.reportInner(open)}
            >
              <Box sx={sx.publicationList}>
                {report.publications.map(publication => {
                  const selected = publication.id === activePublicationId
                  const isPublished = publication.status === PUBLIC_REPORT_STATUS.PUBLISHED
                  const entityName = publication.entityName || publication.title || 'דוח'

                  return (
                    <Box
                      key={publication.id}
                      role='button'
                      tabIndex={0}
                      onClick={() => onPublicationSelect(publication.id)}
                      onKeyDown={event => {
                        if (event.key !== 'Enter' && event.key !== ' ') return

                        event.preventDefault()
                        onPublicationSelect(publication.id)
                      }}
                      sx={sx.publicationRow(selected)}
                    >
                      <Box sx={sx.publicationDot(selected)} />

                      <Box sx={sx.publicationText}>
                        <Typography level='body-sm' sx={sx.publicationLabel(selected)}>
                          {entityName}
                        </Typography>

                        <Typography level='body-xs' sx={sx.publicationDate(selected)}>
                          {formatPublicationDate(publication)}
                        </Typography>
                      </Box>

                      <Dropdown>
                        <MenuButton
                          slots={{ root: IconButton }}
                          slotProps={{
                            root: {
                              size: 'sm',
                              variant: 'plain',
                              color: 'neutral',
                              'aria-label': 'more',
                              onClick: event => {
                                event.stopPropagation()
                              },
                            },
                          }}
                        >
                          {iconUi({ id: 'more', size: 'sm' })}
                        </MenuButton>

                        <Menu size='sm' placement='bottom-end'>
                          <MenuItem
                            onClick={async event => {
                              event.stopPropagation()
                              await onPublicationShare(publication)
                            }}
                          >
                            <ListItemDecorator>
                              {iconUi({ id: 'share', size: 'sm' })}
                            </ListItemDecorator>
                            שיתוף
                          </MenuItem>

                          <MenuItem
                            disabled={!isPublished}
                            color={isPublished ? 'warning' : 'neutral'}
                            onClick={async event => {
                              event.stopPropagation()
                              await onPublicationStop(publication)
                            }}
                          >
                            <ListItemDecorator>
                              {iconUi({ id: 'archive', size: 'sm' })}
                            </ListItemDecorator>
                            עצירת פרסום
                          </MenuItem>

                          <MenuItem
                            color='danger'
                            onClick={async event => {
                              event.stopPropagation()
                              await onPublicationDelete(publication)
                            }}
                          >
                            <ListItemDecorator>
                              {iconUi({ id: 'delete', size: 'sm' })}
                            </ListItemDecorator>
                            מחיקת הדוח
                          </MenuItem>
                        </Menu>
                      </Dropdown>
                    </Box>
                  )
                })}

                {!report.publications.length ? (
                  <Box sx={sx.reportEmpty}>
                    <Box sx={sx.reportEmptyIcon}>
                      {iconUi({ id: 'report', size: 'sm' })}
                    </Box>

                    <Typography level='body-xs' sx={sx.reportEmptyText}>
                      עדיין לא פורסמו דוחות
                    </Typography>
                  </Box>
                ) : null}
              </Box>
            </CollapseBox>
          )
        })}
      </Box>
    </Box>
  )
}
