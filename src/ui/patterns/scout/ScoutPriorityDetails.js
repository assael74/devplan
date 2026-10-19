// src/ui/patterns/scout/ScoutPriorityDetails.js

import * as React from 'react'
import { Box, Drawer, IconButton, Typography } from '@mui/joy'
import { useTheme } from '@mui/joy/styles'
import Popover from '@mui/material/Popover'
import { createTheme, ThemeProvider, THEME_ID } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { iconUi } from '../../core/icons/iconUi.js'
import { CollapseBox } from '../collapseBox/index.js'
import { scoutPriorityDetailsSx as sx } from './scoutPriorityDetails.sx.js'
import { readScoutPriorityPlacement } from './scoutPriorityPlacement.js'

const popoverTheme = createTheme()

export default function ScoutPriorityDetails({
  id,
  anchorEl,
  onClose,
  details,
  meta,
  renderContent,
}) {
  const isMobile = useMediaQuery('(max-width: 599px)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const theme = useTheme()
  const [paper, setPaper] = React.useState(null)
  const [placement, setPlacement] = React.useState(null)
  const [expandedItems, setExpandedItems] = React.useState({})
  // Material transitions require a scoped theme while Joy keeps the app theme.
  const scopedTheme = React.useMemo(() => ({
    [THEME_ID]: { ...popoverTheme, direction: theme.direction },
  }), [theme.direction])
  const open = Boolean(anchorEl)
  const useDrawer = isMobile || Boolean(placement?.drawer)
  const titleId = `${id}-title`
  const summaryId = `${id}-summary`
  React.useLayoutEffect(() => {
    if (anchorEl) setExpandedItems({})
  }, [anchorEl])

  React.useEffect(() => {
    if (!anchorEl || !details.sourceColumn) return undefined

    const value = anchorEl.closest('tr')?.querySelector(`[data-column="${details.sourceColumn}"] [data-cell-value]`)
    if (!value) return undefined

    value.setAttribute('data-scout-source', 'true')
    value.style.setProperty('--scout-source-bg', meta.colors.light)
    value.style.setProperty('--scout-source-color', meta.colors.text)
    value.style.setProperty('--scout-source-border', meta.colors.main)

    return () => {
      value.removeAttribute('data-scout-source')
      value.style.removeProperty('--scout-source-bg')
      value.style.removeProperty('--scout-source-color')
      value.style.removeProperty('--scout-source-border')
    }
  }, [anchorEl, details.sourceColumn, meta.colors])

  React.useLayoutEffect(() => {
    if (!anchorEl || isMobile) return undefined

    const updatePlacement = () => {
      setPlacement(readScoutPriorityPlacement(
        anchorEl,
        paper?.offsetHeight || 300,
        details.sourceColumn,
      ))
    }
    const windowView = anchorEl.ownerDocument.defaultView
    updatePlacement()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(updatePlacement) : null
    if (observer && paper) observer.observe(paper)
    windowView.addEventListener('resize', updatePlacement)
    windowView.addEventListener('scroll', updatePlacement, true)

    return () => {
      if (observer) observer.disconnect()
      windowView.removeEventListener('resize', updatePlacement)
      windowView.removeEventListener('scroll', updatePlacement, true)
    }
  }, [anchorEl, isMobile, renderContent, placement?.drawer, details.sourceColumn, paper])

  const content = (
    <Box className='dpScrollThin' sx={sx.content}>
      <Box sx={sx.header}>
        <Box sx={sx.heading}>
          <Typography id={titleId} level='title-md'>{details.title}</Typography>
          {details.context ? <Typography level='body-xs' sx={sx.context}>{details.context}</Typography> : null}
        </Box>
        <IconButton size='sm' variant='plain' aria-label='סגירת הסבר העדיפות' onClick={onClose}>
          {iconUi({ id: 'close', size: 'sm' })}
        </IconButton>
      </Box>

      <Box sx={sx.summary(meta.colors)}>
        <Box sx={sx.summaryTop}>
          <Typography level='title-sm' sx={{ color: meta.colors.text }}>{meta.label}</Typography>
          {details.score !== null ? (
            <Typography sx={sx.score}>{`ציון ${Math.round(details.score)} מתוך 100`}</Typography>
          ) : null}
        </Box>
        <Typography id={summaryId} sx={sx.summaryText}>{details.summary}</Typography>
      </Box>

      <Box sx={sx.items}>
        {details.items.map((item, index) => {
          const calculationId = `${id}-${item.id}-calculation`
          const toggleLabel = expandedItems[item.id] ? 'פחות' : 'עוד'
          return (
            <Box key={item.id} component='section' aria-label={item.title} sx={sx.item}>
              <Box sx={sx.itemHeading}>
                <Typography level='title-sm' sx={sx.itemTitle}>{item.title}</Typography>
                {item.impact ? <Typography sx={sx.impact(item.impact.level)}>{item.impact.label}</Typography> : null}
              </Box>
              <Typography level='body-sm' sx={sx.actual}>{item.evidence || 'לא זמין'}</Typography>
              <Box sx={sx.meaningLine}>
                <Typography level='body-sm' sx={sx.meaningText}>{item.text}</Typography>
                <Box
                  component='button'
                  type='button'
                  aria-label={`${toggleLabel}: ${item.title}`}
                  aria-expanded={Boolean(expandedItems[item.id])}
                  aria-controls={calculationId}
                  onClick={() => setExpandedItems(values => ({ ...values, [item.id]: !values[item.id] }))}
                  sx={sx.more}
                >{toggleLabel}</Box>
              </Box>
              <CollapseBox
                open={Boolean(expandedItems[item.id])}
                rootSx={sx.calculationRoot}
                headerSx={sx.calculationHeader}
                contentSx={sx.calculationCollapse(reduceMotion)}
              >
                <Box
                  role='region'
                  id={calculationId}
                  aria-label={`פירוט חישוב הציון: ${item.title}`}
                  aria-hidden={!expandedItems[item.id]}
                  sx={sx.calculationBody}
                >
                  <Typography sx={sx.text}>{item.text}</Typography>
                  {item.periodEvidence ? <Typography sx={sx.evidence}>{item.periodEvidence}</Typography> : null}
                  {item.seasonEvidence ? <Typography sx={sx.evidence}>{item.seasonEvidence}</Typography> : null}
                  {item.benchmarkUnavailable ? <Typography sx={sx.evidence}>{item.benchmarkUnavailable}</Typography> : null}
                  {item.calculationNote ? <Typography sx={sx.evidence}>{item.calculationNote}</Typography> : null}
                  {item.contribution ? (
                    <Typography sx={sx.contribution}>
                      <bdi>{item.contribution.formula}</bdi>{' נק׳ לציון'}
                    </Typography>
                  ) : null}
                  {!item.contribution ? <Typography sx={sx.evidence}>{details.calculationUnavailable || 'פירוט החישוב לא זמין לנתונים הקיימים.'}</Typography> : null}
                  {index === details.items.length - 1 && details.calculation ? (
                    <Box sx={sx.calculation}>
                      <Typography level='title-sm' sx={sx.itemTitle}>חיבור שלושת הרכיבים</Typography>
                      <Typography sx={sx.contribution}><bdi>{details.calculation.formula}</bdi></Typography>
                      <Typography sx={sx.evidence}>{details.calculation.result}</Typography>
                    </Box>
                  ) : null}
                </Box>
              </CollapseBox>
            </Box>
          )
        })}
      </Box>
    </Box>
  )

  const anchorPosition = placement && !placement.drawer ? {
    left: placement.side === 'left' ? placement.left + placement.width : placement.left,
    top: placement.top + placement.arrowTop,
  } : { top: 0, left: 0 }

  return (
    <>
      <Drawer
        anchor='bottom'
        open={open && useDrawer}
        onClose={onClose}
        onClick={event => event.stopPropagation()}
        onKeyDown={event => event.stopPropagation()}
        sx={sx.drawer}
        slotProps={{
          content: {
            id: useDrawer ? id : undefined,
            'aria-labelledby': titleId,
            'aria-describedby': summaryId,
            sx: sx.drawerContent,
          },
        }}
      >
        {renderContent && useDrawer ? content : null}
      </Drawer>

      <ThemeProvider theme={scopedTheme}>
        <Popover
          open={open && !useDrawer && Boolean(placement)}
          anchorEl={anchorEl}
          anchorReference='anchorPosition'
          anchorPosition={anchorPosition}
          onClose={onClose}
          onClick={event => event.stopPropagation()}
          onKeyDown={event => event.stopPropagation()}
          transformOrigin={{
            vertical: placement?.arrowTop || 0,
            horizontal: placement?.side === 'left' ? 'right' : 'left',
          }}
          transitionDuration={reduceMotion ? 0 : { enter: 220, exit: 180 }}
          slotProps={{
            root: {
              slotProps: {
                backdrop: {
                  invisible: false,
                  transitionDuration: reduceMotion ? 0 : { enter: 220, exit: 180 },
                  sx: sx.backdrop,
                },
              },
            },
            paper: {
              id: useDrawer ? undefined : id,
              ref: setPaper,
              role: 'dialog',
              'aria-modal': true,
              'aria-labelledby': titleId,
              'aria-describedby': summaryId,
              sx: { ...sx.popover, width: placement?.width || 352 },
            },
          }}
        >
          {placement && !placement.drawer ? (
            <Box
              aria-hidden='true'
              sx={sx.arrow}
              style={{
                top: placement.arrowTop,
                left: placement.side === 'left' ? placement.width - 4 : -4,
              }}
            />
          ) : null}
          {renderContent && !useDrawer ? content : null}
        </Popover>
      </ThemeProvider>
    </>
  )
}
