// src/features/playersDatabase/ui/pages/teamPage/notes/sx/teamNotebook.sx.js

import { devPlanColors as c } from '../../../../../../../ui/core/theme/Colors.js'

const border = `1px solid ${c.border}`
const fieldFocus = {
  '--Input-focusedHighlight': c.tertiary,
  '--Textarea-focusedHighlight': c.tertiary,
  borderColor: c.border,
  bgcolor: c.surface,
}

export const teamNotebookSx = {
  shell: {
    root: {
      '--Drawer-horizontalSize': { xs: '100vw', sm: '600px' },
      maxWidth: '100vw',
      direction: 'rtl',
      p: { xs: 0, md: 1.5 },
      boxSizing: 'border-box',
    },
    sheet: {
      bgcolor: c.surface,
      border,
      borderRadius: { xs: 0, sm: '14px' },
      boxShadow: '0 18px 64px rgba(16, 43, 64, 0.20)',
      overflow: 'hidden',
      gap: 0,
      minHeight: 0,
    },
    dialogContent: {
      display: 'flex',
      flex: 1,
      p: 0,
      m: 0,
      minHeight: 0,
      minWidth: 0,
      overflow: 'hidden',
    },
    content: {
      display: 'flex',
      flex: 1,
      p: 0,
      pl: 0,
      minHeight: 0,
      minWidth: 0,
      overflow: 'hidden',
    },
    footer: { flexShrink: 0, mt: 0, py: 1.25, px: 2, bgcolor: c.surface, borderTop: border },
    status: { fontSize: 11, maxWidth: '100%', overflowWrap: 'anywhere' },
  },
  header: {
    header: {
      position: 'relative', bgcolor: c.primary, color: c.surface,
      px: 2, py: 1.75, paddingInlineEnd: 6, borderBottom: 'none',
    },
    icon: {
      display: 'grid', placeItems: 'center', width: 36, height: 36,
      borderRadius: '10px', mt: 0.5, flexShrink: 0,
      bgcolor: 'rgba(255,255,255,0.12)', color: c.surface,
    },
    title: { color: c.surface, fontWeight: 700, fontSize: 21, lineHeight: 1.3 },
    subline: { color: 'rgba(255,255,255,0.87)', fontSize: 13, mt: 0.25 },
    meta: { color: 'rgba(255,255,255,0.62)', fontSize: 11, mt: 0.5 },
    chip: { color: '#D7ECFA', bgcolor: 'rgba(255,255,255,0.10)', fontSize: 10, mb: 0.5 },
    close: {
      color: c.surface, top: 14, insetInlineEnd: 12,
      '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
    },
  },
  workspace: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 },
  previewNotice: { px: 2, py: 0.85, bgcolor: c.primaryLight, borderBottom: border, flexShrink: 0 },
  tabs: { flex: 1, minHeight: 0, bgcolor: c.surface, display: 'flex', flexDirection: 'column' },
  tabList: {
    px: 2, pt: 0.75, pb: 0, gap: 2, flexShrink: 0, borderBottom: border,
    '--Tabs-indicatorColor': c.petrol,
    '& [role="tab"]': { px: 0.25, py: 1, fontWeight: 600, fontSize: 14, gap: 0.75 },
  },
  tabPanel: {
    p: 0, minHeight: 0, minWidth: 0,
    '&:not([hidden])': { display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' },
  },
  pane: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0 },
  rowBetween: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap',
  },
  listTools: { display: 'grid', gap: 1, px: 2, py: 1.5, flexShrink: 0, borderBottom: border },
  filterRow: { display: 'flex', gap: 1, alignItems: 'flex-end', minWidth: 0 },
  filterGrid: { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 },
  listPane: { flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto', bgcolor: c.body },
  listScroll: { p: 1.5, bgcolor: c.body },
  findingCard: {
    display: 'flex', flexDirection: 'column', gap: 0.85, width: '100%', p: 1.5, mb: 1,
    border, borderRadius: '10px', bgcolor: c.surface, font: 'inherit', textAlign: 'start',
    cursor: 'pointer', transition: 'border-color 140ms ease, background-color 140ms ease',
    '&:hover': { borderColor: c.tertiary, bgcolor: c.tertiaryLight },
    '&:focus-visible': { outline: `2px solid ${c.tertiary}`, outlineOffset: 2 },
    '&:last-child': { mb: 0 },
  },
  findingExcerpt: {
    color: c.primaryDark, fontSize: 14, lineHeight: 1.7, textAlign: 'start',
    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
    overflow: 'hidden', overflowWrap: 'anywhere', whiteSpace: 'pre-line',
  },
  chipRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, minWidth: 0 },
  routeChip: { bgcolor: c.primaryLight, color: c.primary, fontWeight: 500, fontSize: 11 },
  breakText: { overflowWrap: 'anywhere', whiteSpace: 'normal', minWidth: 0 },
  emptyState: {
    minHeight: 200, p: 2.5, display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 1.5,
  },
  browseBar: {
    display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
    gap: 1, px: 1.5, py: 1, borderBottom: border, bgcolor: c.surface, flexShrink: 0,
  },
  browseControls: { display: 'flex', alignItems: 'center', gap: 1 },
  editorScroll: {
    flex: 1, minHeight: 0, minWidth: 0, overflowY: 'auto', px: 2, py: 1.75,
    display: 'flex', flexDirection: 'column', gap: 1.75,
    '& > *': { flexShrink: 0 },
  },
  fields: { display: 'grid', gap: 1.5, pt: 1, minWidth: 0 },
  formControl: {
    minWidth: 0, gap: 0.5,
    '& label': { color: c.primary, fontWeight: 600, fontSize: 13 },
    '& [class*="FormHelperText"]': { fontSize: 11, lineHeight: 1.5 },
  },
  textarea: { ...fieldFocus, fontSize: 14, lineHeight: 1.8, '& textarea': { textAlign: 'start' } },
  autocomplete: {
    ...fieldFocus, minWidth: 0, fontSize: 13,
    '& .MuiChip-root': { maxWidth: '100%' },
    '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
  },
  linksAccordion: {
    border, borderRadius: '10px', bgcolor: c.surface,
    '--AccordionSummary-padding': '10px 12px',
    '--AccordionDetails-padding': '0 12px 12px',
  },
  pdfPlaceholder: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
    gap: 1.25, p: 1.5, border: `1px dashed ${c.border}`, borderRadius: '10px', bgcolor: c.body,
  },
  primaryButton: {
    bgcolor: c.primary, color: c.surface, flexShrink: 0,
    '&:hover': { bgcolor: c.primaryDark },
  },
  saveButton: { '&:disabled': { bgcolor: c.primaryLight, color: c.secondary, borderColor: c.border } },
  cancelButton: { color: c.primary, bgcolor: c.surface, borderColor: c.border },
}
