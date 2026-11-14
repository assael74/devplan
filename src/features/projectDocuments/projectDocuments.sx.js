// src/features/projectDocuments/projectDocuments.sx.js
import { devPlanColors as colors } from '../../ui/core/theme/Colors.js'

const panel = {
  minWidth: 0,
  minHeight: 0,
  border: '1px solid',
  borderColor: colors.border,
  borderRadius: 'lg',
  bgcolor: colors.surface,
}

const focus = { outline: `2px solid ${colors.tertiaryDark}`, outlineOffset: -2 }

export const projectDocumentsSx = {
  page: {
    flex: 1,
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: { xs: 1, md: 1.5 },
    p: { xs: 1, md: 0.5 },
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    px: { xs: 1.25, md: 2 },
    py: { xs: 1.25, md: 1.5 },
    borderRadius: 'lg',
    background: `linear-gradient(115deg, ${colors.primaryDark}, ${colors.primary} 65%, ${colors.petrolDark})`,
    '& h1': { color: colors.surface },
    '& p': { color: colors.primaryLight },
  },

  headerIcon: {
    display: 'grid', placeItems: 'center', width: 44, height: 44, flexShrink: 0,
    color: colors.primaryDark, bgcolor: colors.primaryLight, borderRadius: 'md',
  },

  workspace: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(235px, 29%) minmax(0, 1fr)', xl: '320px minmax(0, 1fr)' },
    gap: 1.5,
  },

  catalog: { ...panel, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' },
  desktopCatalog: { display: { xs: 'none', md: 'grid' } },
  search: { display: 'grid', gap: 0.75, p: 1.25 },
  topics: { minHeight: 0, overflowY: 'auto', px: 1, pb: 1 },
  topic: { borderTop: '1px solid', borderColor: colors.border, py: 0.35 },
  topicHeading: { m: 0, fontSize: 'inherit' },

  topicButton: {
    width: '100%', minHeight: 43, display: 'flex', alignItems: 'center', gap: 0.75,
    px: 0.5, py: 0.4, border: 0, borderRadius: 'sm', bgcolor: 'transparent',
    color: colors.primaryDark, fontFamily: 'inherit', textAlign: 'start', cursor: 'pointer',
    '&:hover:not(:disabled)': { bgcolor: colors.body },
    '&:focus-visible': focus,
    '&:disabled': { cursor: 'default' },
  },

  topicIcon: {
    width: 30, height: 30, display: 'grid', placeItems: 'center', flexShrink: 0,
    borderRadius: 'sm', bgcolor: colors.petrolLight, color: colors.petrolDark,
  },

  topicTitle: { flex: 1, fontSize: 14, fontWeight: 700 },
  count: { fontSize: 12, px: 0.75, borderRadius: 'sm', bgcolor: colors.secondaryLight, color: colors.secondary },
  topicArrow: open => ({ display: 'grid', transform: open ? 'rotate(180deg)' : undefined }),
  documentLinks: { m: 0, py: 0, paddingInlineStart: 1, paddingInlineEnd: 0, listStyle: 'none' },

  documentLink: {
    display: 'flex', alignItems: 'center', gap: 0.75, minHeight: 41, my: 0.2, px: 1, py: 0.4,
    borderInlineStart: '3px solid transparent', borderRadius: 'sm', color: colors.text,
    fontSize: 14, textDecoration: 'none',
    '& > bdi': { minWidth: 0, overflowWrap: 'anywhere' },
    '& svg': { flexShrink: 0, color: colors.tertiaryDark },
    '&:hover': { bgcolor: colors.body },
    '&:focus-visible': focus,
    '&[aria-current="page"]': { bgcolor: colors.tertiaryLight, borderColor: colors.tertiary, fontWeight: 700 },
  },

  reader: { minWidth: 0, minHeight: 0 },
  desktopReader: { display: { xs: 'none', md: 'block' } },
  status: {
    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, minHeight: 56, p: 1.5,
    color: colors.subText,
  },
}

export const readerSx = {
  welcome: {
    ...panel,
    height: '100%', display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 0.75, p: 2,
    color: colors.tertiaryDark,
    background: `linear-gradient(155deg, ${colors.surface} 55%, ${colors.tertiaryLight})`,
  },

  panel: { ...panel, height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' },
  header: { display: 'grid', justifyItems: 'start', gap: 0.75, p: { xs: 1.25, md: 2 }, borderBottom: '1px solid', borderColor: colors.border },
  mobileBack: { display: { xs: 'inline-flex', md: 'none' } },
  meta: { minWidth: 0, maxWidth: '100%', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, overflowWrap: 'anywhere' },
  body: { minWidth: 0, minHeight: 0, overflowY: 'auto' },

  markdown: {
    px: { xs: 1.5, md: 2.5 }, py: 1.5, mx: 'auto', maxWidth: 1040,
    color: colors.text, fontSize: 14, lineHeight: 1.72, overflowWrap: 'anywhere',
    '& > :first-child': { mt: 0 },
    '& .documentSourceTitle': { display: 'none' },
    '& h1, & h2, & h3, & h4, & h5, & h6': { color: colors.primaryDark, mt: 2.5, mb: 0.75, lineHeight: 1.35 },
    '& h1, & h2': { fontSize: 20 },
    '& h3': { fontSize: 17 },
    '& h4, & h5, & h6': { fontSize: 15 },
    '& p, & ul, & ol': { my: 0.9 },
    '& ul, & ol': { paddingInlineStart: 3 },
    '& blockquote': {
      mx: 0, my: 1, px: 1.25, py: 0.5,
      borderInlineStart: `3px solid ${colors.petrol}`, bgcolor: colors.petrolLight, borderRadius: 'sm',
    },
    '& hr': { border: 0, borderTop: '1px solid', borderColor: colors.border, my: 2 },
    '& a': { color: colors.tertiaryDark, textUnderlineOffset: '0.16em' },
    '& a:focus-visible, & .documentTable:focus-visible': focus,
    '& code': { unicodeBidi: 'isolate', fontSize: '0.92em', px: 0.45, borderRadius: 'sm', bgcolor: colors.secondaryLight },
    '& pre': { overflowX: 'auto', bgcolor: colors.secondaryLight, borderRadius: 'sm', p: 1.25 },
    '& pre code': { px: 0 },
    '& .documentTable': { overflowX: 'auto', my: 1.35 },
    '& table': { width: '100%', minWidth: 370, borderCollapse: 'collapse', fontSize: 13 },
    '& th, & td': { border: '1px solid', borderColor: colors.border, px: 1, py: 0.65, textAlign: 'start', verticalAlign: 'top' },
    '& th': { bgcolor: colors.primaryLight, color: colors.primaryDark, fontWeight: 700 },
    '& tbody tr:nth-of-type(even)': { bgcolor: colors.body },
  },
}
