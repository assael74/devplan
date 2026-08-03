import { useEffect, useMemo, useState } from 'react'

import {
  createInitialTeamVideosFilters,
  resolveTeamVideosFiltersDomain,
  sortTeamVideosRows,
} from '../../sharedLogic/videos'

import { resolveContextTags } from './teamVideosModule.helpers.js'

export default function useTeamVideosModuleModel({
  entity,
  context,
  videoInsightsRequest = 0,
  seasonStartYear = 2025,
}) {
  const liveTeam = useMemo(() => {
    const teams = Array.isArray(context?.teams) ? context.teams : []
    return teams.find(team => team?.id === entity?.id) || entity || null
  }, [context?.teams, entity])

  const initialFilters = useMemo(() => createInitialTeamVideosFilters(), [])

  const [filters, setFilters] = useState(initialFilters)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [attachingVideo, setAttachingVideo] = useState(null)
  const [editingVideo, setEditingVideo] = useState(null)
  const [watchVideo, setWatchVideo] = useState(null)

  const [sort, setSort] = useState({ by: 'date', direction: 'desc' })

  const tags = useMemo(() => resolveContextTags(context), [context?.tags, context?.tagsArr])

  const domain = useMemo(() => {
    return resolveTeamVideosFiltersDomain(liveTeam, filters, {
      tags,
      seasonStartYear,
    })
  }, [liveTeam, filters, tags, seasonStartYear])

  useEffect(() => {
    if (videoInsightsRequest > 0) setInsightsOpen(true)
  }, [videoInsightsRequest])

  const { summary, videos, allVideos, options, indicators } = domain || {}

  const sortedVideos = useMemo(() => sortTeamVideosRows(videos, sort), [videos, sort])

  const handleChangeFilters = patch => setFilters(prev => ({ ...prev, ...(patch || {}) }))
  const handleResetFilters = () => setFilters(createInitialTeamVideosFilters())
  const handleChangeSortBy = value => setSort(prev => ({ ...prev, by: value }))
  const handleChangeSortDirection = value => setSort(prev => ({ ...prev, direction: value }))
  const handleWatch = video => {
    if (video) setWatchVideo(video)
  }

  return {
    liveTeam,
    tags,
    summary,
    videos: videos || [],
    allVideos: allVideos || [],
    options,
    indicators,
    sortedVideos,
    filters,
    sort,
    insightsOpen,
    attachingVideo,
    editingVideo,
    watchVideo,
    setInsightsOpen,
    setAttachingVideo,
    setEditingVideo,
    setWatchVideo,
    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleWatch,
  }
}
