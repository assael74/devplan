# Club Intelligence V1

## Purpose

`ClubIntelligence` is a domain read model for a single club. It supplies the
Clubs Page summary and collapse views from `dbClubsMaster/all`, then enriches
the same conceptual object in the Club Page from `dbClubs/{clubId}`.

It is not a Firestore document and it is not a second source of truth.

## Sources of truth

- Club identity and club level originate in the club catalog and are projected
  into Club and Clubs Master documents.
- League performance and league level originate in `dbLeagues`.
- Future league path originates in the existing Club competition projection:
  League table plus competition rules, with an active manual override when one
  exists.
- Team task signals originate in `dbBirthTeamSeasons.teamBalance.teamTaskSignals`.
- Roster, player statistics, minutes, detailed profiles and transfers remain
  owned by Team Season / Player documents.

## Flow

```text
dbClubsMaster/all
  -> buildClubIntelligenceFromMaster(club)
  -> Summary / Collapse selectors

dbClubsMaster/all + dbClubs/{clubId}
  -> buildClubIntelligenceFromMaster(club)
  -> enrichClubIntelligenceFromClubDocument(...)
  -> Club Page selector
```

The flow does not read Team Seasons, Players or League documents per club.

## V1 spotlights

Only these families exist:

1. `FUTURE_LEAGUE_PATH_RISE`, `FUTURE_LEAGUE_PATH_DROP`
2. `LEAGUE_ABOVE_CLUB_LEVEL`, `LEAGUE_BELOW_CLUB_LEVEL`
3. `OFFENSE_SQUAD_TASK`, `DEFENSE_SQUAD_TASK`

The first family uses the persisted `competitionPaths` values. It does not
recalculate a competition forecast. When the projection is unavailable, it
preserves status and reason but emits no spotlight.

For a Future League Path, `sourceTeamId` and `sourceTeamSlot` travel from the
Competition Path source season through Clubs Master. The resulting Spotlight
uses that canonical `teamId`; it is not attached to a team by cohort, order,
name, league level, or an inferred ID suffix. A missing source identity emits
no Future League Path Spotlight.

The league-versus-club family uses the single canonical threshold
`CLUB_LEAGUE_LEVEL_GAP_THRESHOLD = 1` and preserves the numeric gap in
spotlight context.

The squad-task family only maps the persisted boolean task signals. An
explicitly unavailable Team Balance source creates no task spotlight.

## Not signals in V1

Profiles, transfers and performance are context only. There is no opportunity
engine, score, priority tier, pattern engine, profile signal, transfer signal,
performance signal, minutes signal or historical baseline in this version.

## Ordering and duplication rule

Selectors order future path first, league-vs-club second and squad task last.
Selectors only order, group and shape data; they do not recalculate business
logic.

Existing domain builders remain the only place for competition, team balance,
scouting performance, profile summaries and transfer summaries. Club
Intelligence consumes their persisted facts and derived source data only.
