# Players Database — Clean Reset Runbook

## Goal

Rebuild Players Database from source Excel files through the normal application flows.
Audit validates the result; Audit must not create the canonical state required by the reset.

## Source files to preserve

### League

Keep the exact fields accepted by League Import, including the IFA team link / external team identity available in the source file.
League rules that are not present in the file are restored manually after League Import when required.

### Roster

Keep the exact fields accepted by Roster Import:

- player name;
- IFA player URL and/or external player id;
- position when available;
- shirt number when available;
- `sourceSnapshotKey` when the source provides a stable snapshot/revision identity;
- `effectiveAt` when the source provides a reliable effective date.

`transferCheck` may be kept for QA comparison only. It is not canonical input and must never be used by Movement Domain, writers or projections.

### Stats

Keep the exact statistical source columns accepted by Stats Import. Stats Import must resolve identity and Movement through the same canonical flow used by the application; historical transfer labels are not Stats source data.

## Reset order

1. Freeze writes.
2. Validate League, Roster and Stats Excel files.
3. Delete the Players Database data selected for the clean reset.
4. Import one League.
5. Validate the League write and run Audit.
6. Import one Team Roster.
7. Validate Team Season, Movement and SearchIndex projections and run Audit.
8. Import Team Stats.
9. Validate scouting, balance and projections and run Audit.
10. Continue team by team / league by league only after the previous step is clean.
11. Run a full-system Audit at the end.

## Acceptance rules

- no legacy `transferredIn`, `transferredOut` or `manualTransferDirection` source is required;
- Movement is created only from the new Team Season Movement flow;
- `pendingPlayers` contains open absences only;
- missing counterpart Team Season is legal and must not be created by repair;
- if counterpart Team Season exists, Audit may report a missing counterpart as reconciliation work without invalidating the local canonical fact;
- SearchIndex, Club, Clubs Master, Player computed state, Balance and Scout summaries are projections and are rebuilt from canonical sources;
- Audit is validation/recovery support, never the importer or migration mechanism.
