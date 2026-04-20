import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | RenewShine',
  description: 'How RenewShine collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--color-brand)">Legal</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-3 text-slate-600">Last updated: April 2026</p>
        </div>

        <div className="space-y-8">

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">1. Who We Are</h2>
            <p className="text-slate-600 leading-relaxed">
              RenewShine is a premium residential cleaning service based in Maryland, serving
              the DC, Maryland, and Virginia (DMV) area. We operate at{' '}
              <a href="https://renewshine.co" className="text-(--color-brand) underline underline-offset-2">renewshine.co</a>
              {' '}and can be reached at{' '}
              <a href="mailto:renewshinedmv@gmail.com" className="text-(--color-brand) underline underline-offset-2">renewshinedmv@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">2. What We Collect</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              When you submit a booking request, we collect:
            </p>
            <ul className="space-y-2 text-slate-600 text-sm">
              {[
                ['Contact information', 'your name, email address, and phone number.'],
                ['Service address', 'the address of the property to be cleaned.'],
                ['Property details', 'number of bedrooms, bathrooms, property type, and condition.'],
                ['Photos and videos', 'media of your property interior that you choose to upload to support your quote request.'],
                ['Scheduling preferences', 'your preferred dates, times, and service frequency.'],
                ['Payment information', 'deposit payments are processed by Stripe. We do not store your card number or banking details.'],
              ].map(([label, desc]) => (
                <li key={label} className="flex gap-2">
                  <span className="text-(--color-brand) font-bold shrink-0">·</span>
                  <span><strong className="text-slate-900">{label}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We collect only the information necessary to review your booking request,
              confirm a price, schedule your cleaning, and communicate with you about
              your appointment.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed mb-3">We use your information to:</p>
            <ul className="space-y-2 text-slate-600 text-sm">
              {[
                'Review your booking request and prepare an accurate price quote.',
                'Send you booking confirmations, quotes, deposit links, and appointment reminders via email.',
                'Contact you by phone or email to coordinate scheduling details.',
                'Process your deposit payment through Stripe.',
                'Maintain records of completed services for our internal business operations.',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-(--color-brand) font-bold shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We do not use your information for targeted advertising, automated profiling,
              or any purpose beyond providing and improving our cleaning service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">4. How We Store and Protect Your Information</h2>
            <p className="text-slate-600 leading-relaxed">
              Your booking data is stored in a secure cloud database. Photos and videos
              you upload are stored in a private, access-controlled storage bucket —
              they are not publicly accessible via URL. Payment processing is handled
              entirely by Stripe, which is PCI-DSS compliant. We implement reasonable
              administrative and technical security measures to protect your personal
              information from unauthorized access, consistent with Maryland&apos;s Personal
              Information Protection Act (PIPA).
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              In the event of a data breach affecting your personal information, we will
              notify affected Maryland residents within 45 days and report to the Maryland
              Attorney General as required by law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">5. Who We Share Your Information With</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We share your information only as necessary to provide our service:
            </p>
            <ul className="space-y-2 text-slate-600 text-sm">
              {[
                ['Stripe', "processes your deposit payment. Stripe's privacy policy governs their use of payment data."],
                ['Resend', 'delivers transactional emails (booking confirmations, quotes, appointment reminders) on our behalf.'],
                ['Cleaning staff', 'assigned cleaners receive your first name, service address, service details, and access instructions only. They do not receive your full name, email, phone number, or payment information.'],
              ].map(([label, desc]) => (
                <li key={label} className="flex gap-2">
                  <span className="text-(--color-brand) font-bold shrink-0">·</span>
                  <span><strong className="text-slate-900">{label}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We do not sell, rent, or share your personal information with third parties
              for marketing or advertising purposes. We do not sell your personal data
              under any circumstances.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">6. Photos and Videos</h2>
            <p className="text-slate-600 leading-relaxed">
              The photos and videos you upload of your property are used solely to review
              your booking request and prepare an accurate price quote. They are stored
              in a private storage bucket accessible only to RenewShine staff. They are
              not shared with third parties, used for marketing, or published in any form
              without your explicit written consent. You may request deletion of your
              uploaded media at any time by emailing{' '}
              <a href="mailto:renewshinedmv@gmail.com" className="text-(--color-brand) underline underline-offset-2">
                renewshinedmv@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">7. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">
              We retain your booking information and associated media for as long as
              necessary to provide our services and fulfill any legal or business record
              obligations. If you request deletion of your personal information, we will
              remove it from our active systems within a reasonable time, except where
              retention is required by law or necessary to resolve a dispute.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">8. Your Rights (Maryland Residents)</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              As a Maryland resident, you have the right to:
            </p>
            <ul className="space-y-2 text-slate-600 text-sm">
              {[
                'Confirm whether we are processing your personal data.',
                'Access a copy of the personal data we hold about you.',
                'Correct inaccuracies in your personal data.',
                'Request deletion of your personal data.',
                'Request a portable copy of your data.',
                'Opt out of the sale of your personal data (we do not sell data).',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-(--color-brand) font-bold shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              To exercise any of these rights, email{' '}
              <a href="mailto:renewshinedmv@gmail.com" className="text-(--color-brand) underline underline-offset-2">
                renewshinedmv@gmail.com
              </a>. We will respond within 45 days.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">9. Email Communications</h2>
            <p className="text-slate-600 leading-relaxed">
              The emails we send you — including booking confirmations, quote links,
              deposit receipts, and appointment reminders — are transactional messages
              related to services you have requested. If you have questions about any
              email from us, contact renewshinedmv@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">10. SMS Communications</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              By providing your phone number through our booking form, you consent to
              receive SMS (text) messages from RenewShine related to your service request.
              These messages may include:
            </p>
            <ul className="space-y-2 text-slate-600 text-sm mb-4">
              {[
                'Appointment confirmations and reminders',
                'Quote follow-ups',
                'Service updates and notifications',
                'Payment and billing messages',
                'Customer satisfaction and review requests',
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-(--color-brand) font-bold shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-slate-600 leading-relaxed mb-3">
              Message frequency varies depending on your interaction with our services.
              Message and data rates may apply.
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">
              You can opt out at any time by replying <strong className="text-slate-900">STOP</strong>.
              For assistance, reply <strong className="text-slate-900">HELP</strong>.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We do not share, sell, or disclose your phone number or SMS consent
              information to third parties or affiliates for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">11. Children&apos;s Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              Our services are intended for adults. We do not knowingly collect personal
              information from anyone under 18. If you believe we have inadvertently
              collected information from a minor, contact us immediately and we will
              delete it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">12. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. When we do, we will
              update the &quot;Last updated&quot; date at the top of this page. Continued use of
              our services after a change constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-slate-900 mb-3">13. Contact Us</h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">RenewShine</p>
              <p className="mt-1">Email: <a href="mailto:renewshinedmv@gmail.com" className="text-(--color-brand) underline underline-offset-2">renewshinedmv@gmail.com</a></p>
              <p className="mt-1">Website: <a href="https://renewshine.co" className="text-(--color-brand) underline underline-offset-2">renewshine.co</a></p>
              <p className="mt-1">State of operation: Maryland, USA</p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            For questions about your rights under Maryland law, you may also contact the{' '}
            <a
              href="https://oag.maryland.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--color-brand) underline underline-offset-2"
            >
              Maryland Attorney General&apos;s Office
            </a>.
          </p>
        </div>

      </div>
    </div>
  )
}
