# Equipment registration and testing

Implemented in the native PASSport app. The Supabase migrations have been applied to CoachPoints (`lntgnxrsmelbcslffohq`). The web changes are local and need your normal web deployment to reach the hosted site.

## Install a fresh native build

NFC is a native module: Expo Go, browser previews, simulators, and an old installed PASSport binary cannot test scanning. Use an NFC-capable physical Android phone or iPhone and a stable-UID tag, preferably an NTAG213/215/216 for the first test. The app reads the chip UID without writing data to the chip. Not all NFC chip technologies are supported.

From PowerShell:

```powershell
cd C:\Dev\StatCard\CoachPointsPASSport
npm.cmd ci
npx.cmd eas-cli build --platform android --profile development
# Or, for a registered physical iPhone:
npx.cmd eas-cli build --platform ios --profile development
```

Install the resulting internal development build. iOS requires Apple signing credentials, a registered device, and the NFC Tag Reading capability for `com.coachpoints.passport`. The Expo NFC plugin supplies the TAG entitlement and permission description. Android users must enable NFC in phone settings.

Then start Metro and open its development server in the installed build:

```powershell
npx.cmd expo start --dev-client
```

The pinned NFC manager v3 uses the legacy React Native architecture, so `newArchEnabled` is explicitly false for this Expo SDK 54 project. Revisit the NFC dependency when upgrading Expo beyond SDK 54. See the [NFC manager documentation](https://github.com/revtel/react-native-nfc-manager).

## Acceptance test

1. Sign in as a coach with an **approved** institution membership and an admin-assigned sport. On the profile dashboard tap **Equipment: Scan and manage**, then select an administrator-approved institution/sport. Coaches without approved membership cannot register or view equipment.
2. Tap **Scan equipment NFC tag** and hold a blank tag near the phone's NFC antenna. The form should say “New equipment · tag scanned”; no raw chip ID should appear.
3. Choose Helmet, a model, and a size. Optionally search an athlete by username, select the athlete, and add notes. Save. An `EQ-…` code appears in the inventory. Repeat with Shoulder pads and a different tag.
4. Rescan the first tag. Its existing code and details must load. Assign a player if initially unassigned; save. Rescan once more and confirm the assignment persists and no duplicate item exists.
5. Open an item from the native inventory without scanning. Change notes/status, or choose **Clear assignment / return** and save. Search by code/model and filter by status.
6. Start the web app with `cd C:\Dev\StatCard\statcard` then `npm.cmd run dev`. Sign in with the same coach, open **Coach dashboard → Equipment**, and verify the same item/code/player. Search, filter, edit, and return it. **Add Equipment** explains how to register through native PASSport.
7. Try another coach who has no membership in that institution, an athlete, and a signed-out session. Equipment must not be visible or writable. Revoking the original coach's approved membership must also remove access, even if that coach created the equipment.
8. Test cancellation, NFC disabled, unsupported chip, and loss of internet during saving. Retry by rescanning after an uncertain save; an existing registration must reopen rather than duplicate.

## Database behavior

### Sport approval test

1. On the web coach dashboard, request membership for an institution and a specific sport. While the request is pending, that sport's equipment must be unavailable.
2. An institution administrator opens **Institution coaches** and accepts the request. Reopen Equipment in PASSport or reload the web equipment page: only admin-assigned sports should appear.
3. Register an item in the approved sport. Another coach at the same institution who is assigned only a different sport must not be able to view, scan, or edit that item.
4. The administrator changes **Sports access** and saves. Reopen Equipment to refresh the selector. Removing a sport immediately blocks subsequent database reads, scans, and saves for that sport, even for equipment the coach created.
5. Removing institution membership blocks all its sports. Existing equipment stays with its original institution and sport.

`statcard/supabase/tests/equipment_sport_access.sql` verifies the actual request, admin approval, sport assignment, and revocation RPCs in a rollback-only transaction. This test passed against CoachPoints. The existing `team_id` field is the sport ID; no equipment records need moving or renaming.

- `equipment_items.institution_id` is required and cannot be changed. `team_id` references an institution sport; the database prevents the sport and institution from diverging.
- Approved coaches can manage inventory only for sports assigned to them by their institution administrator. There is no personal-inventory fallback or creator-based access exception.
- `equipment_nfc_tags.original_id` retains the chip UID. Client roles cannot read or write this table. Authenticated RPCs validate institution membership before accessing private implementations; their responses contain equipment fields only.
- Equipment registration and tag binding occur in one transaction. A unique tag constraint prevents duplicate registrations. Codes are database-generated and immutable.
- Player assignment uses an existing athlete profile. There is no athlete institution-roster table in the current schema, so player lookup searches existing athlete profiles; the **equipment ownership** remains institution-locked.
- NFC UIDs identify items; they are not authentication credentials and can be cloned on some chips.

## Checks completed

- Native and web TypeScript checks passed.
- Equipment web ESLint checks passed; Next.js production build passed.
- Android Metro/Hermes bundle export passed; Expo config inspection confirms Android NFC permission and iOS TAG entitlement.
- `statcard/supabase/tests/equipment_access.sql` passed against the live database with all test writes rolled back: registration with assignment, rescan, return, duplicate rejection, denied raw UID access, denied direct mutation, unauthorized read/write/lookup, and anonymous RPC rejection.
- Physical NFC reading and signed native builds require device testing; they were not performed in this workspace.

For repeatable database checks, run the test SQL in a privileged SQL session. It requires an existing approved coach, sport, and athlete and ends with ROLLBACK. Do not remove the transaction wrapper.
