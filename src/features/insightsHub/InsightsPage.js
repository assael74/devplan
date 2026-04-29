// features/insightsHub/InsightsPage.js

import React from 'react'
import { Box } from '@mui/joy'
import { useSearchParams } from 'react-router-dom'

import OverviewHeader from './overview/components/OverviewHeader.js'
import OverviewBlocks from './overview/components/OverviewBlocks.js'
import DomainCards from './overview/components/DomainCards.js'
import IntroCard from './overview/components/IntroCard.js'
import GamesPage from './games/GamesPage.js'
import VideosPage from './videos/VideosPage.js'

export default function InsightsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const activeDomain = searchParams.get('domain') || ''
  const isDomainOpen = Boolean(activeDomain)

  const handleSelectDomain = (domainId) => {
    const next = new URLSearchParams(searchParams)

    if (!domainId) {
      next.delete('domain')
    } else {
      next.set('domain', domainId)
    }

    setSearchParams(next)
  }

  const handleBack = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('domain')
    setSearchParams(next)
  }

  const renderDomainPage = () => {
    if (activeDomain === 'games') {
      return <GamesPage onBack={handleBack} />
    }

    if (activeDomain === 'videos') {
      return <VideosPage onBack={handleBack} />
    }

    return <IntroCard />
  }

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: isDomainOpen
          ? 'minmax(0, 1fr)'
          : 'auto auto auto minmax(0, 1fr)',
        gap: 1.25,
        p: { xs: 1, md: 1.5 },
      }}
    >
      {!isDomainOpen ? (
        <>
          <OverviewHeader />

          <OverviewBlocks />

          <DomainCards
            activeDomain={activeDomain}
            onSelectDomain={handleSelectDomain}
          />
        </>
      ) : null}

      <Box
        sx={{
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          display: 'grid',
        }}
      >
        {renderDomainPage()}
      </Box>
    </Box>
  )
}
