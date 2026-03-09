import React, { useMemo } from 'react'
import HomePageView from './HomePageView'
import { useCoreData } from '../coreData/CoreDataProvider'

export default function HomePageContainer(props) {
  const { loading, clubs, teams, players, scouting } = useCoreData()

  const data = useMemo(
    () => ({
      clubs: clubs || [],
      teams: teams || [],
      players: players || [],
      scouting: scouting || [],
      videos: [],
      notes: [],
    }),
    [clubs, teams, players, scouting]
  )

  if (loading) {
    return <HomePageView data={{ clubs: [], teams: [], players: [], scouting: [], videos: [], notes: [] }} {...props} />
  }

  return <HomePageView data={data} {...props} />
}
