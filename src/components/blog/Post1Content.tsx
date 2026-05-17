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
const red = '#dc2626'

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

export function Post1Content() {
  const toc = [
    { id: 'what-included', label: "What does a move-out clean include that a regular clean doesn't?" },
    { id: 'checklist', label: 'Room-by-room checklist' },
    { id: 'wear-and-tear', label: "What's protected as normal wear and tear?" },
    { id: 'top-three', label: 'The three things landlords check first' },
    { id: 'deposit-rules', label: 'DC vs. Virginia vs. Maryland deposit rules' },
    { id: 'faq', label: 'FAQ' },
  ]

  return (
    <div style={{ ...sans, color: textPrimary, lineHeight: 1.85 }}>

      {/* TABLE OF CONTENTS */}
      <nav style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '1.25rem 1.5rem', margin: '1.5rem 0 2.5rem' }}>
        <p style={{ ...sans, fontSize: '0.78rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>In this article</p>
        <ol style={{ ...sans, fontSize: '0.88rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 2.1 }}>
          {toc.map(({ id, label }) => (
            <li key={id}><a href={`#${id}`} style={{ color: accent, textDecoration: 'none' }}>{label}</a></li>
          ))}
        </ol>
      </nav>

      {/* LEAD */}
      {p("Your DC landlord isn't going to call after the walkthrough and say \"great job.\" They're going to look for reasons to keep your deposit. That's not cynicism — that's how the math works.", { fontSize: '1.05rem', color: textPrimary })}
      {p(<>A security deposit in DC is capped at one month's rent (<strong>DC Code § 42-3261</strong>), and landlords have 45 days to return it. If you leave the oven dirty and the baseboards dusty, they'll point at that. Your job is to give them nothing to point at.</>)}
      {p("This checklist covers what gets inspected, what gets missed, and what you can skip.")}

      {/* SECTION 1 */}
      {h2('what-included', "What does a move-out clean include that a regular clean doesn't?")}
      {p("Move-out cleaning goes further than standard maintenance cleaning. Landlords expect the unit returned close to move-in condition — which means areas that rarely get touched during regular cleaning have to be done.")}

      <div style={{ background: accentLight, border: `1px solid ${accentBorder}`, borderRadius: 10, padding: '1.25rem 1.5rem', margin: '1rem 0 1.5rem' }}>
        <p style={{ ...sans, fontSize: '0.8rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          What move-out adds that standard cleaning doesn't
        </p>
        {[
          'Inside all kitchen cabinets and drawers (crumbs, spills, liner residue)',
          'Inside the oven — baked-on grease and residue (most commonly missed item)',
          'Inside the refrigerator — drawers, shelves, door seals, rubber gasket',
          'Inside bathroom cabinets and medicine cabinets',
          'Tops of cabinets (dust and grease accumulation)',
          'Spot-cleaned walls in kitchen and bathrooms',
          'Vacuum edges of carpet along baseboards',
        ].map((item) => (
          <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ color: green, fontWeight: 700, flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
            <span style={{ ...sans, fontSize: '0.9rem', color: textSecondary }}>{item}</span>
          </div>
        ))}
      </div>

      {p("If your cleaning service doesn't include all of those, clarify before you book. \"Deep clean\" doesn't automatically mean move-out clean.")}

      {/* SECTION 2 — ROOM BY ROOM */}
      {h2('checklist', 'Room-by-room checklist')}
      {p("Use this before your walkthrough. Check each item yourself after the cleaning is done.")}

      {[
        {
          room: 'Kitchen',
          items: [
            'Counters wiped down, including under appliances',
            'Sink scrubbed — faucet base, drain, and basin',
            'Cabinet fronts wiped',
            'Inside all cabinets and drawers — crumbs, stains, spills',
            'Tops of cabinets (dust and grease)',
            'Stovetop, burner grates, and knob panels',
            'Inside oven — baked-on grease and residue',
            'Oven racks and door glass',
            'Inside microwave — ceiling, walls, turntable',
            'Exterior of fridge, stove, dishwasher',
            'Inside refrigerator — all drawers, shelves, door seals',
            'Vent hood exterior and filter',
            'Floors swept and mopped',
            'Walls near stove for grease splatter',
          ],
        },
        {
          room: 'Bathrooms',
          items: [
            'Toilet — bowl, tank, base, hinges, behind',
            'Sink and faucet — no soap scum, no hard water stains',
            'Mirror (streak-free)',
            'Inside vanity cabinet and drawers',
            'Shower or tub — tiles, grout lines, caulk, drain',
            'Shower door or curtain rod',
            'Floor including corners and grout lines',
            'Baseboards',
            'Light fixtures and exhaust fan cover',
            'Walls for soap scum and water stains',
          ],
        },
        {
          room: 'Bedrooms',
          items: [
            'All surfaces dusted — shelves, windowsills, furniture',
            'Inside closets and shelves — dust, debris, items left behind',
            'Ceiling fan blades',
            'Light switches and outlet covers',
            'Carpet vacuumed, including edges along baseboards',
            'Hard floors swept and mopped',
            'Behind and under accessible furniture',
            'Windows wiped inside',
          ],
        },
        {
          room: 'Living Areas',
          items: [
            'All surfaces dusted',
            'Blinds or window coverings — dust and wipe',
            'Windowsills — dust, grime, dead bugs',
            'Baseboards throughout',
            'Light fixtures and ceiling fans',
            'Floors vacuumed and mopped',
            'Walls — spot clean scuffs (no need to repaint for normal wear)',
          ],
        },
        {
          room: 'Throughout',
          items: [
            'All light switches and outlet covers wiped',
            'Door handles and plates wiped',
            'Doors themselves — top edge, both sides',
            'Vents dusted within reach',
            'Baseboards in every room',
            'Window tracks cleaned',
          ],
        },
      ].map(({ room, items }) => (
        <div key={room} style={{ marginBottom: '1.5rem' }}>
          <p style={{ ...display, fontWeight: 700, fontSize: '1rem', color: textPrimary, marginBottom: '0.6rem', paddingBottom: '0.4rem', borderBottom: `1px solid ${border}` }}>
            {room}
          </p>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            {items.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ ...mono, color: accent, fontSize: '0.85rem', flexShrink: 0, marginTop: '0.2rem' }}>□</span>
                <span style={{ ...sans, fontSize: '0.9rem', color: textSecondary }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* SECTION 3 — WEAR AND TEAR */}
      {h2('wear-and-tear', "What's protected as normal wear and tear?")}
      {p("Landlords across DC, Virginia, and Maryland cannot deduct for normal wear and tear — only for actual damage or serious neglect.")}

      <div style={{ overflowX: 'auto', margin: '1.25rem 0 1.75rem', borderRadius: 10, border: `1px solid ${border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...sans, fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ background: accentLight }}>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontWeight: 700, color: accent, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `2px solid ${accentBorder}` }}>
                Normal wear (NOT deductible)
              </th>
              <th style={{ padding: '0.7rem 1rem', textAlign: 'left', fontWeight: 700, color: red, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `2px solid ${accentBorder}` }}>
                Actual damage (deductible)
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Minor wall scuffs from furniture', 'Holes punched in drywall'],
              ['Faded paint from sunlight', 'Paint heavily stained or marked'],
              ['Worn carpet from foot traffic', 'Carpet stains or burns'],
              ['Small nail holes from pictures', 'Large anchor holes left unfilled'],
              ['Dusty blinds', 'Broken blind slats'],
              ['Worn finish on hardwood floors', 'Deep scratches from dragging furniture'],
            ].map(([good, bad], i) => (
              <tr key={i}>
                <td style={{ padding: '0.65rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg }}>
                  <span style={{ color: green, fontWeight: 700, marginRight: '0.4rem' }}>✓</span>{good}
                </td>
                <td style={{ padding: '0.65rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg }}>
                  <span style={{ color: red, fontWeight: 700, marginRight: '0.4rem' }}>✗</span>{bad}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {p("In DC specifically, the Office of the Tenant Advocate actively helps tenants dispute improper deductions. Document the condition at move-out with timestamped photos and you'll have a strong position.")}

      {/* SECTION 4 — TOP THREE */}
      {h2('top-three', 'The three things landlords check first')}
      {p("Based on what causes most deposit disputes in the DMV:")}

      {[
        {
          num: '1',
          title: 'Inside the oven',
          body: 'The single most commonly failed item in self-done move-out cleans. Baked-on grease takes specific cleaners and time. Landlords open the oven door within the first two minutes of any walkthrough.',
        },
        {
          num: '2',
          title: 'Bathroom grout',
          body: 'Mold and mildew in shower grout lines is a standard deduction item. It needs actual grout cleaner and a brush — not just a spray-and-wipe.',
        },
        {
          num: '3',
          title: 'Baseboards behind furniture',
          body: 'Dust accumulation behind couches and beds that were never moved. This is where people get caught on "general dirtiness" deductions.',
        },
      ].map(({ num, title, body }) => (
        <div key={num} style={{ display: 'flex', gap: '1rem', background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '1.1rem 1.25rem', marginBottom: '0.75rem', borderLeft: `4px solid ${accent}` }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.1rem' }}>
            <span style={{ ...display, fontSize: '0.8rem', fontWeight: 700, color: accent }}>{num}</span>
          </div>
          <div>
            <p style={{ ...display, fontWeight: 700, fontSize: '0.95rem', color: textPrimary, marginBottom: '0.25rem' }}>{title}</p>
            <p style={{ ...sans, fontSize: '0.88rem', color: textSecondary, marginBottom: 0 }}>{body}</p>
          </div>
        </div>
      ))}

      {/* SECTION 5 — DEPOSIT RULES TABLE */}
      {h2('deposit-rules', 'DC vs. Virginia vs. Maryland deposit rules')}
      {p("The rules vary by where you're renting. Here's what matters for move-out:")}

      <div style={{ overflowX: 'auto', margin: '1.25rem 0 1.75rem', borderRadius: 10, border: `1px solid ${border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...sans, fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: accentLight }}>
              {['', 'Washington DC', 'Virginia', 'Maryland'].map((h) => (
                <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontWeight: 700, color: accent, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `2px solid ${accentBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Max deposit", "1 month's rent", "2 months' rent", '1 month\'s rent*'],
              ['Return deadline', '45 days', '45 days', '45 days'],
              ['Late penalty', '3× deposit', 'Full deposit + fees', 'Full deposit + damages'],
              ['Receipts required', 'Yes', 'Yes (over $125)', 'Yes'],
              ['Interest on deposit', 'Yes (annually)', 'No', 'Yes (1.5%/yr)'],
            ].map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '0.65rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg, fontWeight: j === 0 ? 700 : 400, color: j === 0 ? textPrimary : textSecondary }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ ...sans, fontSize: '0.8rem', color: textMuted, marginBottom: '1.5rem' }}>
        * Maryland: leases signed on or after October 1, 2024 (Real Property § 8-203)
      </p>

      {p("DC tenants have the most to lose from deposit deductions — deposits are capped at one month's rent, so even a small cleaning deduction hurts proportionally. Get the cleaning right.")}

      {p(<>If you'd rather not manage this checklist yourself, <Link href="/booking" style={{ color: accent, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>get a confirmed quote from RenewShine</Link> — we review photos of your space and confirm the price before you pay anything.</>)}

      {/* FAQ */}
      {h2('faq', 'Frequently asked questions')}
      <div style={{ marginTop: '1rem' }}>
        {[
          ['How much does move-out cleaning cost in Washington DC?', 'Most DC apartments and homes range from $350–$600 depending on size and condition. Move-out cleaning always includes inside the oven, inside the refrigerator, inside all cabinets, and spot-cleaned walls. RenewShine confirms your exact price after reviewing your photos — no surprises.'],
          ["Does move-out cleaning include inside the oven and fridge?", "A proper move-out clean always includes both. These are the two items landlords check first. If your cleaning service doesn't include them as standard, ask explicitly before you book."],
          ['How far in advance should I book move-out cleaning in DC?', "Book at least 3–5 days before your move-out date. The day before your walkthrough is ideal — close enough that the space stays clean, late enough to fit after your belongings are out."],
          ["What can a DC landlord legally deduct from my security deposit?", "Landlords can deduct for damage beyond normal wear and tear, unpaid rent, and serious cleaning issues. They cannot deduct for minor scuffs, faded paint, or worn carpet. DC caps deposits at one month's rent (DC Code § 42-3261). Late return entitles tenants to 3× the deposit."],
          ['Can I do the move-out cleaning myself?', "You can, but the most commonly failed items — inside the oven, grout lines, baseboards behind furniture — take the longest and are easiest to miss during a move. A professional clean handles them and gives you documentation that the work was done."],
        ].map(([q, a]) => (
          <div key={q as string} style={{ borderBottom: `1px solid ${border}`, padding: '1.25rem 0' }}>
            <p style={{ ...display, fontWeight: 700, fontSize: '0.97rem', color: textPrimary, marginBottom: '0.5rem' }}>{q}</p>
            <p style={{ ...sans, fontSize: '0.92rem', lineHeight: 1.75, color: textSecondary, marginBottom: 0 }}>{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
