//  features/abilitiesPublic/components/sx/domainsAccordion.sx.js

import { accordionClasses, accordionSummaryClasses } from '@mui/joy';

export const domainsAccordionSx = {
  group: (theme) => ({
    maxWidth: 400,
    [`& .${accordionClasses.root}`]: {
      marginTop: '0.5rem',
      transition: '0.2s ease',
      '& button:not([aria-expanded="true"])': {
        transition: '0.2s ease',
        paddingBottom: '0.625rem',
      },
    },
    [`& .${accordionClasses.root}.${accordionClasses.expanded}`]: {
      bgcolor: 'background.level1',
      borderRadius: 'md',
      borderBottom: '1px solid',
      borderColor: 'background.level2',
    },
    '& [aria-expanded="true"]': {
      boxShadow: `inset 0 -1px 0 ${theme.vars.palette.divider}`,
      borderRadius: 'md'
    },
    '& [aria-expanded="false"]': {
      borderRadius: 'md'
    },
  }),

  accordion: (tone, canOpenDomains) => ({
    borderRadius: 'md',
    overflow: 'hidden',
    boxShadow: 'xs',
    border: '1px solid',
    borderColor: tone.summaryBorder,
    opacity: canOpenDomains ? 1 : 0.82,
    bgcolor: !canOpenDomains ? 'background.level3' : ''
  }),

  summaryTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    p: 0.5,
  },

  detailsFrame: {
    height: 200,
    minHeight: 200,
    maxHeight: 200,
    overflow: 'hidden',
    pb: 1,
  },

  itemCard: (tone) => ({
    p: 1,
    mr: 0.5,
    my: 0.8,
    boxShadow: 'sm',
    borderRadius: 'lg',
    bgcolor: tone.bg,
    borderColor: tone.borderColor,
    transition: '0.2s ease',
  }),

  itemTopRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  itemMetaRow: {
    display: 'flex',
    gap: 0.5,
    alignItems: 'center',
    flexShrink: 0
  },

  scoreChip: {
    minWidth: 30,
    height: 30,
    px: 0,
    fontWeight: 700,
    borderRadius: 'sm',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    lineHeight: 1,
  },

  textEmptyBox: {
    mt: 0.5,
    px: 1,
    py: 0.25,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
    border: '1px dashed',
    borderColor: 'divider',
  }
}
