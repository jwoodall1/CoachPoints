/* eslint-disable react/no-unescaped-entities -- agreement text intentionally uses quoted defined terms. */
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Agreement | CoachPoints',
  description: 'The terms that apply when using CoachPoints.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <article className="page-shell max-w-3xl">
        <div className="surface-card p-6 sm:p-10">
          <p className="eyebrow text-brand-700">Legal</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
            Terms of Agreement
          </h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: August 28, 2026</p>
          <p className="mt-8 leading-7 text-slate-600">
            These Terms of Agreement ("Terms") govern your access to and use of CoachPoints. By
            creating an account or using CoachPoints, you agree to these Terms and our{' '}
            <Link href="/privacy" className="font-semibold text-brand-700 hover:text-brand-800">
              Privacy Policy
            </Link>
            . If you do not agree, do not create an account or use the service.
          </p>
          <Section title="Eligibility and accounts">
            <p>
              You must provide accurate information and keep it current. You are responsible for
              protecting your login credentials and for activity that occurs through your account.
              You may not create an account for someone else without authorization, impersonate
              another person, or use CoachPoints if you are not legally able to agree to these
              Terms.
            </p>
            <p>
              If you are under the age of majority where you live, you should use CoachPoints only
              with the involvement and permission of a parent or legal guardian.
            </p>
          </Section>
          <Section title="Profiles and user content">
            <p>
              You retain ownership of the content you submit, including profile information, photos,
              statistics, links, and messages. You grant CoachPoints a limited, non-exclusive
              license to host, store, reproduce, and display that content as needed to operate and
              improve the service.
            </p>
            <p>
              You are responsible for having the right to submit your content and for ensuring that
              public profile information is accurate, lawful, and appropriate to share. Public
              profile content may be viewed, copied, or shared by others.
            </p>
          </Section>
          <Section title="Acceptable use">
            <p>
              You may use CoachPoints only for lawful professional, recruiting, networking, and
              communication purposes. You may not:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>harass, threaten, exploit, or discriminate against another person;</li>
              <li>publish false, deceptive, defamatory, invasive, or unlawful content;</li>
              <li>share another person’s private information without permission;</li>
              <li>scrape, copy, reverse engineer, disrupt, or attack the service;</li>
              <li>send spam, scams, malware, or unauthorized promotions; or</li>
              <li>
                use CoachPoints to make decisions about a person based on protected characteristics.
              </li>
            </ul>
          </Section>
          <Section title="Connections and communication">
            <p>
              CoachPoints provides tools for discovery and communication but does not verify every
              user, profile, claim, coach, athlete, school, or program. You are responsible for
              evaluating people and information independently. Use appropriate caution before
              sharing personal information, meeting anyone, or making recruiting or career
              decisions.
            </p>
            <p>
              We may review, restrict, or remove content and accounts that violate these Terms,
              create risk, or interfere with the service.
            </p>
          </Section>
          <Section title="Third-party services">
            <p>
              CoachPoints may link to or rely on third-party services, including Supabase, Vercel,
              Hudl, and social platforms. Those services are governed by their own terms and
              policies. CoachPoints is not responsible for third-party content, availability, or
              practices.
            </p>
          </Section>
          <Section title="Disclaimers">
            <p>
              CoachPoints is provided on an “as available” basis. We do not promise that the service
              will always be uninterrupted, error-free, secure, or suitable for a particular
              recruiting outcome. CoachPoints does not guarantee scholarships, roster spots,
              employment, admissions, contacts, or any particular result.
            </p>
          </Section>
          <Section title="Limitation of liability">
            <p>
              To the maximum extent permitted by law, CoachPoints and its operators will not be
              liable for indirect, incidental, special, consequential, exemplary, or loss-of-profit
              damages arising from or related to your use of the service. Nothing in these Terms
              limits liability that cannot legally be limited.
            </p>
          </Section>
          <Section title="Termination">
            <p>
              You may stop using CoachPoints at any time. We may suspend or terminate access when
              reasonably necessary to protect users, the service, or our legal rights, including
              when these Terms are violated. Provisions that by their nature should survive
              termination will continue to apply.
            </p>
          </Section>
          <Section title="Changes and contact">
            <p>
              We may update these Terms as the service changes. The updated date above indicates
              when changes were made. Questions about these Terms can be sent to{' '}
              <a
                className="font-semibold text-brand-700 hover:text-brand-800"
                href="mailto:support@coachpoints.com"
              >
                support@coachpoints.com
              </a>
              .
            </p>
          </Section>
          <div className="mt-10 border-t border-slate-200 pt-6 text-sm font-semibold text-slate-500">
            See also{' '}
            <Link href="/privacy" className="text-brand-700 hover:text-brand-800">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3 leading-7 text-slate-600">{children}</div>
    </section>
  );
}
