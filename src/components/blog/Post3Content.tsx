import Link from 'next/link'

const accent = '#4A7C59'
const accentLight = '#e8f3ec'
const accentBorder = '#a8d4b5'
const border = '#e2e8f0'
const bg = '#f8fafc'
const card = '#ffffff'
const textPrimary = '#0f172a'
const textSecondary = '#475569'
const textMuted = '#94a3b8'
const green = '#059669'
const amber = '#d97706'

const display: React.CSSProperties = { fontFamily: 'var(--font-display)' }
const sans: React.CSSProperties = { fontFamily: 'var(--font-sans)' }
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

const p = (text: React.ReactNode, extra?: React.CSSProperties) => (
  <p style={{ ...sans, fontSize: '1rem', lineHeight: 1.85, color: textSecondary, marginBottom: '1.4rem', ...extra }}>
    {text}
  </p>
)

const h2 = (id: string, text: string) => (
  <h2
    id={id}
    style={{
      ...display, fontSize: '1.4rem', fontWeight: 700, color: textPrimary,
      marginTop: '3rem', marginBottom: '0.9rem',
      paddingTop: '1rem', borderTop: `2px solid ${border}`,
    }}
  >
    {text}
  </h2>
)

export function Post3Content() {
  const toc = [
    { id: 'how-pricing-works', label: 'How house cleaning pricing actually works in DC' },
    { id: 'sq-ft', label: 'Square footage matters more than bedrooms' },
    { id: 'how-long', label: 'How long does house cleaning take?' },
    { id: 'last-cleaned', label: 'When your home was last cleaned changes everything' },
    { id: 'local-context', label: 'DC neighborhoods and what they mean for your quote' },
    { id: 'what-affects', label: 'What else affects the price' },
    { id: 'phone-quotes', label: 'Why phone quotes almost never hold' },
    { id: 'faq', label: 'FAQ' },
  ]

  return (
    <div style={{ ...sans, color: textPrimary, lineHeight: 1.85 }}>

      {/* TABLE OF CONTENTS */}
      <nav style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '1.25rem 1.5rem', margin: '1.5rem 0 2.5rem' }}>
        <p style={{ ...sans, fontSize: '0.78rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
          In this article
        </p>
        <ol style={{ ...sans, fontSize: '0.88rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 2.1 }}>
          {toc.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`} style={{ color: accent, textDecoration: 'none' }}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>

      {/* LEAD */}
      {p(
        "Most cleaning service websites give you a starting price and nothing else. You call, get a number over the phone, book it — and then the cleaner arrives and says something costs extra. That pattern is industry-standard. It's also the reason so many people feel burned.",
        { fontSize: '1.05rem', color: textPrimary }
      )}
      {p(
        "DC is one of the most expensive metro areas in the country for home services, running roughly 25–40% above the national average. But what you'll actually pay depends less on which city you're in and more on the specifics of your home — its size, condition, and when it was last professionally cleaned."
      )}
      {p(
        <>Here's how pricing actually works in the DMV, and why the quote you get matters more than the number you see advertised. If you want a confirmed price for your specific home rather than a range, you can <Link href="/booking" style={{ color: accent, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>submit your details and photos here</Link> — we review every job before confirming anything.</>
      )}

      {/* SECTION 1 */}
      {h2('how-pricing-works', 'How house cleaning pricing actually works in DC')}
      {p(
        "There are three common pricing models you'll encounter in the DMV: flat rate by bedroom and bathroom count, hourly rate, and per square foot. Each has tradeoffs."
      )}

      {[
        {
          model: 'Flat rate by bedroom/bathroom',
          body: 'The most common model. Simple to quote, but bedroom count is a rough proxy. A 2BR rowhouse in Capitol Hill across three floors is a very different job than a 2BR condo on one level in Navy Yard. Same bedroom count, meaningfully different scope.',
          tag: 'Most common',
          tagColor: accent,
        },
        {
          model: 'Hourly rate',
          body: 'You pay for actual time worked. Ranges widely by who you hire — solo independent cleaners typically charge $25–$45/hour; professional services with insurance and teams run higher. Hourly feels transparent but makes total cost unpredictable until the job is done.',
          tag: 'Common with indie cleaners',
          tagColor: amber,
        },
        {
          model: 'Per square foot',
          body: 'More accurate for larger homes. Industry benchmarks in 2026: roughly $0.10–$0.17 per sq ft for standard cleaning, $0.15–$0.30 for deep cleaning, $0.22–$0.33 for move-out. Uncommon for smaller apartments but standard for larger homes over 2,500 sq ft.',
          tag: 'Better for large homes',
          tagColor: textMuted,
        },
      ].map(({ model, body, tag, tagColor }) => (
        <div key={model} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '1.1rem 1.25rem', marginBottom: '0.75rem', borderLeft: `4px solid ${accent}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <p style={{ ...display, fontWeight: 700, fontSize: '0.95rem', color: textPrimary, margin: 0 }}>{model}</p>
            <span style={{ ...sans, fontSize: '0.72rem', fontWeight: 700, color: tagColor, background: `${tagColor}18`, padding: '0.15rem 0.5rem', borderRadius: 99, border: `1px solid ${tagColor}44` }}>
              {tag}
            </span>
          </div>
          <p style={{ ...sans, fontSize: '0.88rem', color: textSecondary, margin: 0 }}>{body}</p>
        </div>
      ))}

      {p("RenewShine reviews photos of your home before confirming any price. The number you receive reflects your actual space — not a bedroom count that could mean a 700 sq ft condo or a 2,200 sq ft rowhouse.")}

      {/* SECTION 2 */}
      {h2('sq-ft', 'Square footage matters more than bedrooms')}
      {p(
        "Bedroom count is how most services quote. Square footage is how long a job actually takes. In DC, that gap is wider than almost anywhere else in the country — DC has some of the smallest average apartments in the US, while Northern Virginia suburbs have some of the largest homes."
      )}

      <div style={{ overflowX: 'auto', margin: '1.25rem 0 1.75rem', borderRadius: 10, border: `1px solid ${border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...sans, fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: accentLight }}>
              {['Home type', 'Typical sq ft', 'Standard clean est.', 'Deep clean est.'].map((h) => (
                <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontWeight: 700, color: accent, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `2px solid ${accentBorder}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([
              ['Navy Yard / Dupont 1BR condo', '700–800 sq ft', '$120–$180', '$200–$320'],
              ['Capitol Hill / Logan 2BR apartment', '1,000–1,300 sq ft', '$180–$260', '$300–$440'],
              ['DC / Arlington 2BR rowhouse', '1,200–1,800 sq ft', '$220–$320', '$360–$520'],
              ['Bethesda / Alexandria 3BR home', '1,800–2,800 sq ft', '$300–$420', '$480–$650'],
              ['McLean / Potomac 4BR+ home', '3,500–6,000+ sq ft', 'Always custom quoted', 'Always custom quoted'],
            ] as [string, string, string, string][]).map((row, i) => (
              <tr key={i}>
                <td style={{ padding: '0.65rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg, fontWeight: 600, color: textPrimary }}>{row[0]}</td>
                <td style={{ padding: '0.65rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg, ...mono, color: textSecondary }}>{row[1]}</td>
                <td style={{ padding: '0.65rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg, ...mono, color: textPrimary, fontWeight: 600 }}>{row[2]}</td>
                <td style={{ padding: '0.65rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg, ...mono, color: textPrimary, fontWeight: 600 }}>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ ...sans, fontSize: '0.8rem', color: textMuted, marginBottom: '1.5rem' }}>
        Estimates based on 2026 DC metro market rates for homes in average condition. Actual prices confirmed after photo review.
      </p>

      {p(
        "The McLean and Potomac row is custom-quoted for a reason. A 5BR home in McLean with marble countertops, multiple bathrooms, and 4,500 sq ft of finished space is a fundamentally different job than a 5BR home anywhere else. Bedroom count captures none of that."
      )}

      {/* SECTION 3 */}
      {h2('how-long', 'How long does house cleaning actually take?')}
      {p(
        "This question comes up a lot — especially when people are trying to decide whether to be home, coordinate building access, or plan their day. Here are realistic estimates for a professional team."
      )}

      <div style={{ display: 'grid', gap: '0.6rem', margin: '1rem 0 1.75rem' }}>
        {[
          {
            label: 'Standard cleaning',
            rows: [
              ['1BR/1BA condo (~700 sq ft)', '1.5–2.5 hrs'],
              ['2BR/2BA condo (~1,100 sq ft)', '2.5–3.5 hrs'],
              ['3BR/2BA home (~1,800 sq ft)', '3.5–5 hrs'],
              ['4BR/3BA home (~2,800 sq ft)', '5–7 hrs'],
            ],
          },
          {
            label: 'Deep cleaning (add 50–100% to the above)',
            rows: [
              ['1BR/1BA condo (~700 sq ft)', '2.5–4 hrs'],
              ['2BR/2BA condo (~1,100 sq ft)', '4–6 hrs'],
              ['3BR/2BA home (~1,800 sq ft)', '6–8 hrs'],
              ['Move-out clean (any size)', 'Add 1–2 hrs to deep clean; large homes often full-day'],
            ],
          },
        ].map(({ label, rows }) => (
          <div key={label} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: accentLight, padding: '0.6rem 1rem', borderBottom: `1px solid ${accentBorder}` }}>
              <p style={{ ...display, fontWeight: 700, fontSize: '0.85rem', color: accent, margin: 0 }}>{label}</p>
            </div>
            {rows.map(([home, time]) => (
              <div key={home} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 1rem', borderBottom: `1px solid ${border}` }}>
                <span style={{ ...sans, fontSize: '0.88rem', color: textSecondary }}>{home}</span>
                <span style={{ ...mono, fontSize: '0.88rem', fontWeight: 700, color: textPrimary, flexShrink: 0, marginLeft: '1rem' }}>{time}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {p(
        "These are estimates for a professional team working at production pace — not a single person. If a service quotes you a 4-hour deep clean for a 2,800 sq ft home, that's a red flag. Either they're rushing, or the scope doesn't actually include what you think it does."
      )}

      {/* SECTION 4 */}
      {h2('last-cleaned', 'When your home was last cleaned changes everything')}
      {p(
        "This is the most underexplained factor in cleaning pricing — and the one that causes the most friction when the cleaner arrives."
      )}

      <blockquote style={{ borderLeft: `3px solid ${accent}`, margin: '1.5rem 0', padding: '0.75rem 0 0.75rem 1.5rem', color: textSecondary, fontStyle: 'italic', fontSize: '1.02rem' }}>
        A home cleaned every two weeks is a dramatically different job than a home that hasn't been professionally cleaned in 18 months. The scope, the time, and the price are all different.
      </blockquote>

      {p(
        "Many services charge a first-visit or initial deep clean premium — often 25–50% more than the ongoing rate — specifically to account for this. It's not a scam. It's how long the work actually takes when buildup has accumulated in ovens, grout lines, baseboards, and behind furniture that hasn't been moved."
      )}

      {p(
        "Once the home is at a clean baseline, every subsequent visit is faster. Recurring clients on a bi-weekly schedule consistently pay lower per-visit rates, and the work takes less time. That's the actual logic behind frequency discounts — not a loyalty reward, but a reflection of how much less work each visit requires."
      )}

      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '1.1rem 1.4rem', margin: '1rem 0 1.5rem' }}>
        <p style={{ ...display, fontWeight: 700, fontSize: '0.88rem', color: textPrimary, marginBottom: '0.75rem' }}>
          What to expect based on how long it's been
        </p>
        {[
          ['Cleaned within the last 4–6 weeks', 'Standard clean scope — fastest and most predictable', green],
          ['2–6 months since last clean', 'Standard clean may need extra time; deep clean recommended', amber],
          ['6+ months or first professional clean ever', 'Deep clean is the right starting point; expect first-visit pricing', '#dc2626'],
        ].map(([timeline, note, color]) => (
          <div key={timeline as string} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.65rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color as string, flexShrink: 0, marginTop: '0.5rem' }} />
            <div>
              <span style={{ ...sans, fontWeight: 700, fontSize: '0.88rem', color: textPrimary }}>{timeline as string}</span>
              <span style={{ ...sans, fontSize: '0.88rem', color: textSecondary }}> — {note as string}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 5 */}
      {h2('local-context', 'DC neighborhoods and what they mean for your quote')}
      {p(
        "The DMV is not one housing market. It's a dozen different ones within 30 miles of each other, and the type of home you live in has a real impact on what cleaning costs and how long it takes."
      )}

      {[
        {
          area: 'Capitol Hill and Georgetown rowhouses',
          body: "Historic DC rowhouses — many built in the 1800s — typically run 1,400–2,200 sq ft spread across 3 floors. Multiple staircases, narrow hallways, detailed woodwork, and older fixtures all add time. Don't quote these by bedroom count. A 3BR Capitol Hill rowhouse is not the same job as a 3BR Arlington condo.",
        },
        {
          area: 'Navy Yard, Dupont Circle, and Logan Circle condos',
          body: "Newer construction condos in these neighborhoods tend to run 700–1,300 sq ft on a single floor. Easier to navigate, fewer surprises, and faster to clean than a multi-floor rowhome. Building access (key fob, concierge sign-in, elevator) adds a few minutes but doesn't change scope.",
        },
        {
          area: 'Clarendon and Ballston apartments (Arlington)',
          body: "High-rise corridor along the Orange and Silver Lines. Units similar in size to DC condos — typically 700–1,200 sq ft. Strong military community here means seasonal move-out demand spikes. Book earlier than you think you need to if you're on PCS orders.",
        },
        {
          area: 'Old Town Alexandria townhouses',
          body: "18th and 19th-century townhomes with wood floors, detailed molding, and layouts that vary wildly unit to unit. Like DC rowhouses, square footage matters more than the bedroom count. Many Old Town homes have 4 floors including a basement.",
        },
        {
          area: 'Bethesda and McLean homes',
          body: "This is where pricing gets meaningfully different. Many homes in Bethesda run 2,500–4,000 sq ft; McLean commonly exceeds 4,500 sq ft. High-end finishes — marble, hardwood, custom cabinetry — require more careful handling and more time. These homes are always quoted after photo review, not over the phone.",
        },
      ].map(({ area, body }) => (
        <div key={area} style={{ borderBottom: `1px solid ${border}`, padding: '1rem 0' }}>
          <p style={{ ...display, fontWeight: 700, fontSize: '0.95rem', color: textPrimary, marginBottom: '0.3rem' }}>{area}</p>
          <p style={{ ...sans, fontSize: '0.88rem', color: textSecondary, margin: 0 }}>{body}</p>
        </div>
      ))}

      {/* SECTION 6 */}
      {h2('what-affects', 'What else affects the price')}
      {p("Beyond size and condition, a few other factors come up consistently in DC-area cleaning quotes.")}

      {[
        ['Pets', 'Dog and cat hair embeds in carpet and upholstery and requires additional vacuum passes. Most services factor this in — some charge explicitly, others build it into condition assessment.'],
        ['Add-on services', 'Interior windows, inside the oven or fridge on a standard clean, laundry, dishes, linen changes — these add to the base price. Get them itemized before you book so you know what\'s included.'],
        ['Building logistics', 'High-rise buildings with parking restrictions, elevator reservations, or strict move-in windows can affect scheduling. This rarely changes price, but it matters for timing.'],
        ['Condition relative to expectations', 'A standard clean quote assumes a maintained home. If there\'s significant grease buildup, soap scum, or embedded pet hair, the service may need to adjust scope on arrival — or may have asked the right questions in advance and quoted correctly.'],
      ].map(([label, body]) => (
        <div key={label as string} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', padding: '1rem 1.25rem', background: card, border: `1px solid ${border}`, borderRadius: 10 }}>
          <div style={{ ...display, fontSize: '0.82rem', fontWeight: 700, color: accent, minWidth: 110, flexShrink: 0, paddingTop: '0.15rem' }}>{label}</div>
          <div style={{ ...sans, fontSize: '0.9rem', color: textSecondary }}>{body}</div>
        </div>
      ))}

      {/* SECTION 7 */}
      {h2('phone-quotes', 'Why phone quotes almost never hold')}
      {p(
        "The cleaning industry's default process: tell them how many bedrooms you have, get a number over the phone, book. The cleaner arrives. The kitchen has grease behind the stove. The bathroom grout is visibly neglected. The home hasn't had a professional clean in two years. The quote was based on none of that."
      )}
      {p(
        "So either the cleaner rushes to hit the quoted time — and the clean is mediocre — or they ask for more money at the door. Neither outcome is good. This is the single biggest complaint pattern in DC-area cleaning reviews across Yelp and Google."
      )}

      <blockquote style={{ borderLeft: `3px solid ${accent}`, margin: '1.5rem 0', padding: '0.75rem 0 0.75rem 1.5rem', color: textSecondary, fontStyle: 'italic', fontSize: '1.02rem' }}>
        The fix is reviewing the home before confirming the price. That's the only way the number you're quoted is the number you actually pay.
      </blockquote>

      {p(
        <>RenewShine reviews photos of your space and confirms the price within 24 hours — before you pay anything. If you want a quote based on your actual home rather than your bedroom count, <Link href="/booking" style={{ color: accent, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>submit your details here</Link>. You can also <Link href="/pricing" style={{ color: accent, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>view our pricing page</Link> for a full service breakdown.</>
      )}

      {/* FAQ */}
      {h2('faq', 'Frequently asked questions')}
      <div style={{ marginTop: '1rem' }}>
        {([
          [
            'How much does house cleaning cost in Washington DC?',
            "DC runs 25–40% above national averages for home services. A 1BR condo might start around $120–$180 for standard cleaning; a 2BR condo runs $180–$260; larger homes and deep cleans go significantly higher. Condition, square footage, and when the home was last cleaned all affect the final number more than bedroom count alone.",
          ],
          [
            'How long does a house cleaning take in DC?',
            "A 1BR condo (~700 sq ft) typically takes 1.5–2.5 hours for a standard clean. A 2BR/2BA condo (~1,100 sq ft) runs 2.5–3.5 hours. Deep cleans take 50–100% longer than standard. Move-out cleans on larger homes are often full-day jobs.",
          ],
          [
            'Why is my first cleaning more expensive?',
            "Most services charge a first-visit premium — often 25–50% more than the recurring rate. This reflects how long it takes to get the home to a clean baseline when it hasn't been professionally cleaned recently. Once the baseline is set, each subsequent visit is faster and less expensive.",
          ],
          [
            'Does the type of home (condo vs. rowhouse) affect cleaning cost?',
            "Yes, significantly. A 2BR Capitol Hill rowhouse across three floors is a different job than a 2BR Navy Yard condo on one level — even if the bedroom count is identical. Multi-floor homes, older fixtures, and historic details all add time. Square footage is a more accurate guide than bedroom count.",
          ],
          [
            'Do cleaning services in DC bring their own supplies?',
            "Most professional services do. If you have preferences — unscented products, specific brands, eco-friendly cleaners — confirm before booking. Some services will accommodate; others work exclusively with their own supply kit.",
          ],
          [
            'How far in advance should I book a cleaning in DC?',
            "For a regular clean, 3–5 days is usually enough. For move-out cleaning, book at least a week out — especially if you're in a building with elevator reservation requirements or if you're on a military PCS timeline where dates are fixed.",
          ],
        ] as [string, string][]).map(([q, a]) => (
          <div key={q} style={{ borderBottom: `1px solid ${border}`, padding: '1.25rem 0' }}>
            <p style={{ ...display, fontWeight: 700, fontSize: '0.97rem', color: textPrimary, marginBottom: '0.5rem' }}>{q}</p>
            <p style={{ ...sans, fontSize: '0.92rem', lineHeight: 1.75, color: textSecondary, marginBottom: 0 }}>{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
