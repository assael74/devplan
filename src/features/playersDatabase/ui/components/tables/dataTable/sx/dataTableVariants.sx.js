// features/playersDatabase/ui/components/tables/dataTable/sx/dataTableVariants.sx.js

export const dataTableVariantsSx = {
  borderlessWrap: {
    border: 0,
    borderRadius: 0,
  },

  ellipsisCells: {
    '& th, & td': {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}
