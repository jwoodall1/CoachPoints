/* eslint-disable react/no-unescaped-entities -- policy text intentionally uses quoted defined terms. */
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | CoachPoints',
  description: 'How CoachPoints collects, uses, and protects information.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 sm:py-16">
      <article className="page-shell max-w-3xl">
        <div className="surface-card p-6 sm:p-10">
          <p className="eyebrow text-brand-700">Legal</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Privacy Policy</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: August 28, 2026</p>
          <p className="mt-8 leading-7 text-slate-600">
            CoachPoints ("CoachPoints," "we," "us," or "our") helps athletes and coaches create
            professional profiles, discover one another, connect, and communicate. This Privacy
            Policy explains what information we collect, how we use it, and the choices available to
            you when you use CoachPoints.
          </p>
          <Section title="Information we collect">
            <p>
              We collect information you provide when you create or maintain an account, including
              your name, email address, username, account type, profile details, athletic or
              coaching information, contact details, social links, statistics, measurables,
              highlight links, and profile photo.
            </p>
            <p>
              We also collect information you create through the service, such as friend or
              connection requests, recruiting-list memberships, and direct messages. Please do not
              include sensitive personal information in public profiles or messages.
            </p>
            <p>
              When you use CoachPoints, we receive technical information such as device type,
              browser, approximate location, referring page, requested pages, and timestamps. We use
              Vercel Web Analytics to receive aggregated, privacy-focused information about site
              visits and feature usage. Our custom analytics events are designed not to include
              names, emails, message content, usernames, or database IDs.
            </p>
          </Section>
          <Section title="How we use information">
            <p>
              We use information to provide, secure, maintain, and improve CoachPoints; authenticate
              accounts; display profiles and content you choose to publish; enable connections,
              recruiting lists, and messaging; respond to support requests; prevent abuse and
              security incidents; understand product usage; and comply with legal obligations.
            </p>
          </Section>
          <Section title="What is public">
            <p>
              Information placed on your public profile may be visible to anyone with access to your
              profile link, including your name, username, sport, school or program, profile photo,
              biography, performance details, highlight links, and any contact or social links you
              choose to publish. Do not publish information you do not want publicly available.
            </p>
            <p>
              Direct messages and private recruiting lists are intended to be available only to the
              participants and authorized account holders involved, subject to our security controls
              and applicable law.
            </p>
          </Section>
          <Section title="Service providers">
            <p>
              We use third-party providers to operate CoachPoints. Supabase provides authentication,
              database, storage, and related infrastructure. Vercel provides hosting and
              privacy-focused web analytics. Hudl links and other social links may take you to
              third-party websites that have their own privacy practices. We do not control those
              third parties.
            </p>
          </Section>
          <Section title="Data retention and deletion">
            <p>
              We retain information while your account is active or as reasonably necessary to
              provide the service, maintain security, resolve disputes, and meet legal obligations.
              To request account or data deletion, contact us at{' '}
              <a
                className="font-semibold text-brand-700 hover:text-brand-800"
                href="mailto:support@coachpoints.com"
              >
                support@coachpoints.com
              </a>
              . We may need to verify your request and may retain limited information where required
              or permitted by law.
            </p>
          </Section>
          <Section title="Security">
            <p>
              We use reasonable administrative, technical, and organizational safeguards, including
              authenticated access controls. No internet service is completely secure, and we cannot
              guarantee absolute security.
            </p>
          </Section>
          <Section title="Children">
            <p>
              CoachPoints is not intended for children under 13. If you are under the age required
              to consent to online services where you live, use CoachPoints only with permission and
              involvement from a parent or legal guardian.
            </p>
          </Section>
          <Section title="Your choices and rights">
            <p>
              You may review and update many profile details through your dashboard, remove optional
              public information, and request access, correction, or deletion by contacting us.
              Depending on where you live, you may have additional privacy rights. We will handle
              verified requests as required by applicable law.
            </p>
          </Section>
          <Section title="Changes to this policy">
            <p>
              We may update this policy as CoachPoints changes. We will update the date above and
              provide any notice required by law. Your continued use after an update means the
              revised policy applies to your use of the service.
            </p>
          </Section>
          <Section title="Contact">
            <p>
              Questions about privacy can be sent to{' '}
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
            <Link href="/terms" className="text-brand-700 hover:text-brand-800">
              Terms of Agreement
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
