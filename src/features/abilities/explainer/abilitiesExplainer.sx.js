//  features/abilities/explainer/abilitiesExplainer.sx.js

export const abilitiesExplainerSx = {
  page: {
    p: { xs: 1.5, md: 2 },
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },

  hero: {
    p: { xs: 1.5, md: 2 },
    borderRadius: 18,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: '#f7dec3',
    flexShrink: 0,
  },

  sectionCard: {
    p: { xs: 1.5, md: 2 },
    borderRadius: 18,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    boxShadow: '0 8px 22px rgba(247, 222, 195, 0.42), 0 2px 6px rgba(0, 0, 0, 0.04)',
  },

  sectionHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: '#f7dec3',
    flexShrink: 0,
  },

  domainsWrap: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1.25,
  },

  domainCard: {
    p: 1.5,
    borderRadius: 16,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  domainIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'background.surface',
    flexShrink: 0,
    bgcolor: '#d3dffb',
  },

  abilitiesList: {
    '--ListItem-minHeight': '34px',
    p: 0,
    m: 0,
    gap: 0.5,
  },

  abilityIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'background.surface',
    flexShrink: 0,
    bgcolor: '#96ede6',
  },

  simpleList: {
    '--ListItem-minHeight': '34px',
    p: 0,
    m: 0,
    gap: 0.5,
  },

  ruleCard: {
    p: 1.25,
    borderRadius: 14,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  developmentNoteBox: {
    p: 1.25,
    borderRadius: 14,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  exampleBox: {
    p: 1.25,
    borderRadius: 14,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },
}
