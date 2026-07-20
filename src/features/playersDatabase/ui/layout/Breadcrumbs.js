// features/playersDatabase/ui/layout/Breadcrumbs.js

import * as React from 'react'
import { Box, Link, Typography } from '@mui/joy'
import { Link as RouterLink } from 'react-router-dom'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

export default function Breadcrumbs({ items = [] }) {
  const [homeItem, ...restItems] = items

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 0.75,
        color: '#42526e',
      }}
    >
      {homeItem ? (
        <Link
          component={RouterLink}
          to={homeItem.to}
          underline='none'
          sx={{ display: 'inline-flex', alignItems: 'center', color: '#42526e' }}
        >
          {iconUi({ id: 'home', size: 'sm' })}
        </Link>
      ) : null}

      {restItems.map((item, index) => {
        const offsetIndex = index + 1
        const isLast = offsetIndex === items.length - 1
        return (
          <React.Fragment key={`${item.label}-${offsetIndex}`}>
            <Typography level='body-sm' sx={{ color: '#8a98ad' }}>/</Typography>
            {isLast || !item.to ? (
              <Typography level='body-sm' sx={{ color: '#0b1f4d', fontWeight: 700 }}>{item.label}</Typography>
            ) : (
              <Link component={RouterLink} to={item.to} underline='none' sx={{ color: '#42526e' }}>{item.label}</Link>
            )}
          </React.Fragment>
        )
      })}
    </Box>
  )
}
