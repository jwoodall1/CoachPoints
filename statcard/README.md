This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Equipment

Equipment is available at `/equipment` to accounts with an existing `coachprofiles` record.
The list, add, and detail routes share a coach access guard and the app's existing styles.

- `equipment_items.team_id` references `sports.id`: the existing institution-specific sports program is the current team boundary.
- Approved coach sport memberships grant access to their teams. Legacy program admins retain access where no institution membership applies; super admins with coach profiles can access all teams. Pending or removed members cannot use legacy assignments to bypass approval.
- The database enforces access with RLS. Clients can create equipment and edit its basic fields; ownership, team transfers, player assignments, and deletion are not exposed.
- `assigned_player_id` references the existing athlete `profiles` table. New items are unassigned. Future roster work must validate team membership before enabling assignment.
- Apply `supabase/migrations/20260915171603_add_equipment_items.sql` through the normal migration process for other environments. It is already applied to the connected CoachPoints project.

Validation: `npm run lint`, `npm run build`, and `supabase/tests/equipment_access.sql`.
Run the SQL test with a database-owner connection (for example `psql -v ON_ERROR_STOP=1 -f supabase/tests/equipment_access.sql`); it creates temporary fixtures, tests role/team isolation and field validation, and rolls back all test data.

## Coach institution membership

- Coach signup searches all published institutions and their existing sports. The signup database trigger creates a pending membership atomically with the account, with email confirmation enabled or disabled.
- Pending coaches retain ordinary account access. The selected institution and sport populate existing profile cards; approval status appears in the coach dashboard.
- Institution admins use **Institution coaches** (`/institution-coaches`) to accept/decline requests, change assigned sports, or remove membership. This uses existing `institution_admins` permissions; super admins can manage all institutions.
- Approved `coach_sport_memberships` grant Equipment access without making coaches institution or program administrators. Removing a sport revokes its access; removing institution membership clears the profile affiliation and preserves the account.
- A coach has one institution membership and may have multiple sports. The requested sport is the initial profile sport; when removed, the first remaining assigned sport becomes primary. Existing coaches can request membership from their dashboard. Free-text affiliations are not automatically approved.
- Migration: `supabase/migrations/20260915174723_add_coach_institution_memberships.sql` (applied to the connected database). Run `supabase/tests/coach_memberships.sql` with a database-owner connection to verify signup, approval, isolation, removal, and profile synchronization. The test rolls back all fixtures.

## Next.js Resources

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
