// clubProfile/sharedModules/players/ClubPlayersModuleBase.js

import React from 'react'
import { Box } from '@mui/joy'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'

import useClubPlayersModuleModel from './useClubPlayersModuleModel.js'
import { clubPlayersModuleSx } from './clubPlayersModule.sx.js'

export default function ClubPlayersModuleBase({
  entity,
  onOpenPlayer,
  context,
  profileData,
  playersInsightsRequest = 0,

  Section,
  isMobile = false,
  toolbarWrapSx,

  ToolbarComponent,
  ListComponent,
  InsightsDrawerComponent,
}) {
  const model = useClubPlayersModuleModel({
    entity,
    context,
    profileData,
    playersInsightsRequest,
  })

  const {
    liveClub,

    rows,
    summary,
    filteredRows,

    filters,
    sort,

    insightsOpen,
    imgRow,
    openImg,
    rowPhoto,
    uploadImageOnly,

    setInsightsOpen,
    setOpenImg,

    handleChangeFilters,
    handleResetFilters,
    handleChangeSortBy,
    handleChangeSortDirection,
    handleAvatarClick,
    handleAfterImageSave,
  } = model

  const Wrap = Section
  const finalToolbarWrapSx =
    toolbarWrapSx || clubPlayersModuleSx.desktopToolbarWrap

  return (
    <>
      <Wrap>
        <Box sx={finalToolbarWrapSx}>
          <ToolbarComponent
            summary={summary}
            filters={filters}
            totalCount={rows.length}
            filteredCount={filteredRows.length}
            onChangeSearch={value => handleChangeFilters({ search: value || '' })}
            onToggleOnlyActive={() =>
              handleChangeFilters({ onlyActive: !filters.onlyActive })
            }
            onChangeSquadRole={value =>
              handleChangeFilters({ squadRole: value || '' })
            }
            onChangeProjectStatus={value =>
              handleChangeFilters({ projectStatus: value || '' })
            }
            onChangePositionCode={value =>
              handleChangeFilters({ positionCode: value || '' })
            }
            onChangeGeneralPositionKey={value =>
              handleChangeFilters({ generalPositionKey: value || '' })
            }
            onChangeTeamId={value =>
              handleChangeFilters({ teamId: value || '' })
            }
            onChangeEfficiencyFilter={value =>
              handleChangeFilters({ efficiency: value || '' })
            }
            onChangeImpactFilter={value =>
              handleChangeFilters({ impact: value || '' })
            }
            onChangeProfileInsightFilter={value =>
              handleChangeFilters({ profileInsight: value || '' })
            }
            onResetFilters={handleResetFilters}
            sortBy={sort.by}
            sortDirection={sort.direction}
            onChangeSortBy={handleChangeSortBy}
            onChangeSortDirection={handleChangeSortDirection}
          />
        </Box>

        {!filteredRows.length ? (
          <EmptyState
            title="אין שחקנים להצגה"
            subtitle={
              isMobile
                ? 'בדוק את הפילטרים או אפס את הסינון'
                : 'נסה לשנות פילטרים או לאפס את החיפוש'
            }
          />
        ) : (
          <ListComponent
            rows={filteredRows}
            profileData={profileData}
            onOpenPlayer={onOpenPlayer}
            onAvatarClick={handleAvatarClick}
          />
        )}
      </Wrap>

      <InsightsDrawerComponent
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        rows={filteredRows}
        summary={summary}
        entity={liveClub}
      />

      {isMobile ? (
        <EntityImageModal
          open={openImg}
          onClose={() => setOpenImg(false)}
          entityType="players"
          id={imgRow?.id}
          entityName={imgRow?.fullName}
          currentPhotoUrl={rowPhoto}
          uploadImageOnly={uploadImageOnly}
          onAfterSave={handleAfterImageSave}
        />
      ) : null}
    </>
  )
}
