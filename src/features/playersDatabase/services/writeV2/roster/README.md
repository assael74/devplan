# Roster Write V2

Roster V2 starts only after the roster preview has produced user-approved business state.

## Final sync contract

1. Canonical roster: Team Root + Team Season, including the approved local movement state and Team Balance snapshot.
2. Counterpart movement state.
3. Player SearchIndex replace-scope for Team + Season.
4. Team SearchIndex + League roster metadata.
5. Leagues Master.
6. Club projections for the local and affected counterpart teams.
7. Clubs Master.

Every step is started explicitly by the user. No step starts another step.

Roster Load never creates Player Documents.

## Approved projection state

Before approval, the roster plan resolves the complete affected Club documents and the complete Clubs Master state. Final Sync writes those approved states only; it does not re-read Clubs to decide or rebuild projections after the Write Boundary.
