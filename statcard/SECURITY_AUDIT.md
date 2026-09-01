# CoachPoints Security Audit

Audit date: 2026-09-01  
Scope: Next.js application in `statcard/`, Supabase project `lntgnxrsmelbcslffohq`, public schema, Storage policies, and dependency/configuration surface.  
Method: read-only source review, live Supabase schema/RLS/policy inspection, Supabase security advisors, and dependency audit attempt.

This is an engineering review, not a formal penetration test. No destructive tests or attempts to access another user’s data were performed.

## Executive summary

The application has RLS enabled on all inspected public tables and the most important relationship/messaging policies are generally scoped to the authenticated user. The institution-admin model is also scoped by `institution_id`.

The highest-priority remediation is to stop exposing personal contact fields through the same public profile rows used by discovery. The next priorities are tightening public Storage and validating user-controlled external URLs. The live Supabase project also has security-advisor findings that should be cleaned up, especially mutable function search paths and unnecessary exposure of `SECURITY DEFINER` routines.

## Findings

### CP-001 — Public profile rows expose personal contact information

Severity: High  
Status: Confirmed

Evidence:

- `profiles` has a public `SELECT` policy with `qual = true`.
- `coachprofiles` has a public `SELECT` policy with `qual = true`.
- Both tables contain `phone_number` and `contact_email`.
- The public profile page explicitly selects and renders those fields in `src/app/[username]/page.tsx:30-40,152`.
- Discovery and other signed-in pages can query broad profile rows as well.

Impact: Anyone with the public Supabase endpoint can enumerate published profile data, including phone numbers and email addresses, without needing the application UI. This may create privacy, spam, scraping, and youth-athlete safety concerns.

Recommended fix:

1. Create public-safe views or RPCs that omit phone/email and sensitive fields.
2. Keep contact fields in a private table or expose them only to an accepted connection.
3. Use a server-side contact/messaging workflow instead of publishing raw contact details.
4. Review whether GPA, measurements, detailed stats, and recruiting notes should be public.
5. Add explicit privacy settings per field/profile.

### CP-002 — Public Storage bucket has unlimited file size and MIME types

Severity: High  
Status: Confirmed

Evidence: live `storage.buckets` reports bucket `avatars` as public with `file_size_limit = null` and `allowed_mime_types = null`.

Impact: A signed-in user can bypass the UI’s client-side image checks and upload arbitrary file types and unbounded file sizes under an allowed path. This enables storage exhaustion, unexpected content hosting, and possible unsafe-file delivery.

Recommended fix:

1. Set a strict bucket size limit, for example 5–10 MB.
2. Restrict MIME types to `image/jpeg`, `image/png`, and `image/webp`.
3. Enforce extension/content validation server-side; client validation is not a security boundary.
4. Use separate buckets or path policies for profile photos and institution logos.
5. Consider processing images in an Edge Function and storing only normalized PNG/WebP output.
6. Add quotas/rate limits per user and an orphaned-object cleanup job.

### CP-003 — User-controlled external URLs are not allowlisted

Severity: Medium  
Status: Confirmed

Evidence:

- Social URLs are saved without server/database validation in the dashboard and coach dashboard.
- `src/components/SocialLinks.tsx:90` renders stored URLs directly as links.
- Institution and sports URLs are also user/admin-provided and rendered as external links.
- `src/components/HudlHighlight.tsx:31` renders an iframe based on stored URL data. Hudl validation occurs in the UI, but can be bypassed through direct API calls.

Impact: Malicious or compromised accounts can publish phishing links. Arbitrary iframe URLs could display a deceptive external page inside the application. URL schemes such as `javascript:` or unusual protocols should never be accepted as user content.

Recommended fix:

1. Validate URLs on the server/database boundary, not only in React.
2. Permit only `https:` for social, school, athletics, admissions, and sport links.
3. Allowlist hosts for Hudl embeds and construct the embed URL from a validated identifier.
4. Add `rel="noopener noreferrer"` to every new-tab external link.
5. Add a Content Security Policy limiting `frame-src` to approved embed hosts.

### CP-004 — Exposed SECURITY DEFINER RPC surface is broader than necessary

Severity: Medium  
Status: Confirmed; partly intentional

Evidence: Supabase advisors report multiple authenticated-callable `SECURITY DEFINER` functions, including `is_super_admin`, institution-admin functions, friendship functions, messaging functions, and `list_assignable_accounts`. Some older functions also appear callable by `anon`, including `review_sport_profile_request`.

Impact: `SECURITY DEFINER` bypasses normal caller table privileges. A function bug can therefore become a privilege-escalation or data-disclosure bug. The current functions contain useful caller checks, but the exposed surface is larger than needed.

Recommended fix:

1. Revoke `EXECUTE` from `anon` on every application RPC; grant it only where anonymous access is deliberate.
2. Revoke `EXECUTE` from `authenticated` for internal/trigger-only functions.
3. Keep only user-facing RPCs exposed through `public`, or move sensitive functions to a private schema.
4. For every remaining definer function, use a fixed `search_path` and fully-qualified object names.
5. Add negative tests proving non-admins cannot invoke admin functions and users cannot query another user’s messages/lists.

### CP-005 — Mutable search path on location trigger function

Severity: Medium  
Status: Confirmed by Supabase advisor

Evidence: `public.set_institution_location_point` has no `SET search_path` configuration.

Impact: Functions that resolve unqualified names using a mutable search path are vulnerable to object-shadowing risks and are harder to reason about during privilege changes.

Recommended fix:

```sql
alter function public.set_institution_location_point()
  set search_path = pg_catalog, public, extensions;
```

Also schema-qualify PostGIS functions and keep the function `SECURITY INVOKER` unless definer behavior is specifically required.

### CP-006 — `platform_roles` has RLS enabled but no policy

Severity: Low / informational  
Status: Confirmed by Supabase advisor

Impact: Direct API reads are denied, which is safe, but the configuration is implicit and may cause future administrators to add an unsafe policy or bypass the intended role-check design.

Recommended fix: Document that role checks must go through a tightly scoped function, or add an explicit deny-by-default policy if the project’s policy conventions require one. Do not expose role rows to ordinary users.

### CP-007 — Public profile data is broader than the discovery UI needs

Severity: Medium  
Status: Confirmed

Evidence: Discovery selects broad profile fields, while `profiles` contains JSONB stats, measurables, bio, contact fields, and social URLs. The public profile page also selects detailed data.

Impact: Even if contact fields are later hidden in the UI, direct PostgREST queries can continue returning any column allowed by the public policy.

Recommended fix: Replace broad table reads with a `public_profile_cards` view containing only fields needed for the directory, and a separate authenticated/connection-scoped detail view. Do not rely on frontend field selection for confidentiality.

### CP-008 — No visible application-level abuse controls

Severity: Medium  
Status: Likely / requires production telemetry confirmation

Evidence: No rate limiting, CAPTCHA/turnstile, upload quota, message quota, or explicit abuse-report workflow was found in the inspected application. The database functions validate ownership but do not appear to enforce request frequency.

Impact: Attackers can automate account creation, friend-request spam, message spam, profile scraping, and Storage usage.

Recommended fix: Add edge/WAF rate limits by IP and user ID, email verification requirements, signup abuse protection, per-user messaging/request quotas, upload quotas, and monitoring/alerts for spikes.

### CP-009 — Missing defense-in-depth browser security headers

Severity: Low / Medium  
Status: Confirmed

Evidence: `next.config.ts` does not configure CSP, HSTS, frame-ancestors, Referrer-Policy, Permissions-Policy, or X-Content-Type-Options.

Impact: The application has less protection against clickjacking, unsafe framing, content-type confusion, and browser-side injection impact.

Recommended fix: Add headers at the hosting/proxy layer or in Next.js. Start with HSTS on HTTPS production, `frame-ancestors 'self'`, `object-src 'none'`, `base-uri 'self'`, `X-Content-Type-Options: nosniff`, a restrictive Referrer-Policy, and a CSP compatible with Supabase, analytics, and approved Hudl embeds.

### CP-010 — Dependency vulnerability scan could not complete

Severity: Unassigned  
Status: Needs follow-up

`npm audit --omit=dev` could not reach the npm audit endpoint in this environment and returned a network error. It did not produce a vulnerability result. Run it in CI or a networked environment and review the lockfile regularly.

## Positive controls observed

- RLS is enabled on all inspected public application tables.
- Direct messages are limited to participants, and message inserts require a mutual friendship through a checked function.
- Coach lists and pipeline records are scoped to the owning coach.
- Institution-admin updates are scoped by `institution_id`; an institution admin does not automatically gain access to other institutions.
- Anonymous execution was already revoked for the newer institution-admin assignment functions.
- Authenticated session state is kept in Supabase Auth rather than a custom password/session implementation.
- React rendering is used instead of `dangerouslySetInnerHTML`; no direct `eval`/`new Function` use was found.
- Analytics code intentionally avoids sending names, emails, message text, handles, or database IDs.

## Priority remediation plan

### P0 — Before broader launch

1. Remove public phone/email exposure and decide which athlete fields are public.
2. Lock down Storage size/MIME limits and add server-side upload processing.
3. Revoke anonymous execution on all non-public RPCs.
4. Validate all external URLs at the database/server boundary.

### P1 — Next security sprint

1. Reduce `SECURITY DEFINER` RPC exposure and add fixed search paths.
2. Add CSP and other browser security headers.
3. Add abuse controls and monitoring.
4. Add automated RLS authorization tests and dependency scanning in CI.

### P2 — Hardening

1. Replace broad public table reads with safe views/RPCs.
2. Add privacy controls and account deletion/data-retention workflows.
3. Add audit logging for super-admin and institution-admin changes.
4. Add backup/restore and incident-response runbooks.

## Verification checklist

- Anonymous request cannot read phone/email or private profile fields.
- User A cannot read or mutate User B’s messages, lists, pipeline records, or admin assignments.
- Institution admin A cannot update institution B, sports outside their scope, or platform roles.
- Anonymous and ordinary authenticated users cannot invoke admin-only RPCs.
- Invalid URL schemes and unapproved iframe hosts are rejected server-side.
- Oversized and non-image Storage uploads are rejected even when sent directly to Supabase.
- CSP blocks unapproved frames/scripts and production uses HTTPS/HSTS.
- CI runs lint, build, `npm audit`, and RLS authorization tests.
