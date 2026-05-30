// playerProfile/sharedModules/videos/usePlayerVideosModuleModel.js

import { useEffect, useMemo, useState } from 'react'

import {
  createInitialPlayerVideosFilters,
  resolvePlayerVideosFiltersDomain,
  sortPlayerVideosRows,
} from '../../sharedLogic'

import { resolveContextTags } from './playerVideosModule.helpers.js'

export default function usePlayerVideosModuleModel({
  entity,
  context,
  videoInsightsRequest = 0,
  seasonStartYear = 2025,
}) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []

    return players.find(player => player?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const initialFilters = useMemo(() => createInitialPlayerVideosFilters(), [])

  const [filters, setFilters] = useState(initialFilters)
  const [insightsOpen, setInsightsOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [watchVideo, setWatchVideo] = useState(null)

  const [sort, setSort] = useState({
    by: 'date',
    direction: 'desc',
  })

  const tags = useMemo(() => {
    return resolveContextTags(context)
  }, [context?.tags, context?.tagsArr])

  const domain = useMemo(() => {
    return resolvePlayerVideosFiltersDomain(livePlayer, filters, {
      tags,
      seasonStartYear,
    })
  }, [livePlayer, filters, tags, seasonStartYear])

  useEffect(() => {
    if (videoInsightsRequest > 0) {
      setInsightsOpen(true)
    }
  }, [videoInsightsRequest])

  const {
    summary,
    videos,
    allVideos,
    options,
    indicators,
  } = domain || {}

  const sortedVideos = useMemo(() => {
    return sortPlayerVideosRows(videos, sort)
  }, [videos, sort])

  const handleChangeFilters = patch => {
    setFilters(prev => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(createInitialPlayerVideosFilters())
  }

  const handleChangeSortBy = value => {
    setSort(prev => ({
      ...prev,
      by: value,
    }))
  }

  const handleChangeSortDirection = value => {
    setSort(prev => ({
      ...prev,
      direction: value,
    }))
  }

  const handleWatch = video => {
    if (!video) return
    setWatchVideo(video)
  }

  return {
    livePlayer,
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
    editingVideo,
    watchVideo,

    setInsightsOpen,
    setEditingVideo,
    setWatchVideo,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleWatch,
  }
}
