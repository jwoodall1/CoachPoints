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
- Access mirrors sports management: an assigned `sport_admins` user or super admin must also have a coach profile. A coach with no authorized program sees the no-teams state.
- The database enforces access with RLS. Clients can create equipment and edit its basic fields; ownership, team transfers, player assignments, and deletion are not exposed.
- `assigned_player_id` references the existing athlete `profiles` table. New items are unassigned. Future roster work must validate team membership before enabling assignment.
- Apply `supabase/migrations/20260915171603_add_equipment_items.sql` through the normal migration process for other environments. It is already applied to the connected CoachPoints project.

Validation: `npm run lint`, `npm run build`, and `supabase/tests/equipment_access.sql`.
Run the SQL test with a database-owner connection (for example `psql -v ON_ERROR_STOP=1 -f supabase/tests/equipment_access.sql`); it creates temporary fixtures, tests role/team isolation and field validation, and rolls back all test data.

## Next.js Resources

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
