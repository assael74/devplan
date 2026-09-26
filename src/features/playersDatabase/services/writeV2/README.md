# Players Database Write V2

> Work in progress. This directory is the clean replacement for the legacy Players Database write layer.

## Boundary

V2 starts after the existing import flow has produced a validated and user-approved payload.

## Allowed dependencies

- `playersDatabase/domain`
- `playersDatabase/model`
- `playersDatabase/catalog`
- stable constants and definitions
- stable shared business/domain modules
- Firebase primitives and stable Firestore usage infrastructure

## Forbidden dependencies

- `services/write/**`
- `services/audit/**`
- `services/dataRepair/**`
- legacy jobs / projection jobs
- legacy write actions
- legacy retry / recovery orchestration
- legacy leases / attempt tokens

## V1 execution rules

1. Every sync action is explicitly started by the user.
2. No automatic next step.
3. No background processing.
4. No automatic retry.
5. No hidden cross-flow orchestration.
6. Each flow has one explicit responsibility.
7. Sync actions must be safe to repeat.
8. Client state may be used while the modal session is alive.
9. Firestore canonical data is the recovery source after transient client state is lost.
10. V2 must remain functional when the complete legacy write layer is removed.

After migration, `writeV2` will replace the legacy write layer and be renamed to `write`.
