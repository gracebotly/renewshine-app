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

const display: React.CSSProperties = { fontFamily: 'var(--font-display)' }
const sans: React.CSSProperties = { fontFamily: 'var(--font-sans)' }

const p = (text: React.ReactNode, extra?: React.CSSProperties) => (
  <p style={{ ...sans, fontSize: '1rem', lineHeight: 1.85, color: textSecondary, marginBottom: '1.4rem', ...extra }}>{text}</p>
)

const h2 = (id: string, text: string) => (
  <h2 id={id} style={{ ...display, fontSize: '1.4rem', fontWeight: 700, color: textPrimary, marginTop: '3rem', marginBottom: '0.9rem', paddingTop: '1rem', borderTop: `2px solid ${border}` }}>{text}</h2>
)

export function Post2Content() {
  const toc = [
    { id: 'standard-includes', label: 'What does standard cleaning include?' },
    { id: 'deep-adds', label: 'What does deep cleaning add?' },
    { id: 'comparison', label: 'Side-by-side comparison' },
    { id: 'when-standard', label: 'When is standard cleaning enough?' },
    { id: 'when-deep', label: 'When do you need a deep clean?' },
    { id: 'oven-fridge', label: 'Why inside the oven and fridge matter' },
    { id: 'faq', label: 'FAQ' },
  ]

  return (
    <div style={{ ...sans, color: textPrimary, lineHeight: 1.85 }}>

      {/* TOC */}
      <nav style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '1.25rem 1.5rem', margin: '1.5rem 0 2.5rem' }}>
        <p style={{ ...sans, fontSize: '0.78rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>In this article</p>
        <ol style={{ ...sans, fontSize: '0.88rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 2.1 }}>
          {toc.map(({ id, label }) => (
            <li key={id}><a href={`#${id}`} style={{ color: accent, textDecoration: 'none' }}>{label}</a></li>
          ))}
        </ol>
      </nav>

      {/* LEAD */}
      {p("Most people who book a cleaning service aren't sure which type they need. Standard and deep cleaning sound like obvious categories until you're actually looking at the checklist.", { fontSize: '1.05rem', color: textPrimary })}
      {p("Here's the simple way to think about it: standard cleaning is maintenance. Deep cleaning is a reset.")}

      {/* SECTION 1 */}
      {h2('standard-includes', 'What does standard cleaning include?')}
      {p("Standard cleaning covers the things that need regular attention — the surfaces and areas you actually use every week.")}

      {[
        { room: 'Kitchen', items: 'Counter surfaces, sink, cabinet fronts, exterior of oven and fridge, microwave inside and out, stovetop and knobs, floors swept and mopped.' },
        { room: 'Bathrooms', items: 'Sink and counter, mirror, cabinet exteriors, toilet, shower and tub, floors swept and mopped.' },
        { room: 'Living areas & bedrooms', items: 'Dust all surfaces and furniture, windowsills and frames, vacuum floors and upholstery, mop hard floors, make beds.' },
        { room: 'Highs & lows', items: 'Dust light fixtures, ceiling fans, blinds, and baseboards.' },
      ].map(({ room, items }) => (
        <div key={room} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
          <div style={{ ...display, fontSize: '0.82rem', fontWeight: 700, color: accent, minWidth: 140, flexShrink: 0, paddingTop: '0.15rem' }}>{room}</div>
          <div style={{ ...sans, fontSize: '0.9rem', color: textSecondary }}>{items}</div>
        </div>
      ))}

      {p("For a home that's kept up between visits, standard cleaning is all you need.")}

      {/* SECTION 2 */}
      {h2('deep-adds', 'What does deep cleaning add?')}
      {p("Deep cleaning goes after the things that don't get addressed in regular maintenance — the grease, buildup, and hard-to-reach areas that accumulate over months.")}

      {[
        { area: 'Kitchen', items: ['Inside the oven (baked-on grease — included, not an add-on)', 'Inside the refrigerator (drawers, shelves, door seals — included)', 'Grease buildup on vent hood and backsplash', 'Wipe accessible cabinet tops'] },
        { area: 'Bathrooms', items: ['Hard water stains, lime scale, rust, and soap scum removal', 'Mold and mildew treatment in grout and caulk lines'] },
        { area: 'Throughout', items: ['Under and behind accessible furniture', 'Vents dusted within reach', 'Cobwebs from corners', 'Doors and baseboards wet-wiped (not just dusted)', 'Light switches and outlet covers wet-wiped'] },
      ].map(({ area, items }) => (
        <div key={area} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, padding: '1.1rem 1.25rem', marginBottom: '0.75rem' }}>
          <p style={{ ...display, fontWeight: 700, fontSize: '0.9rem', color: textPrimary, marginBottom: '0.6rem' }}>{area}</p>
          {items.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ color: green, fontWeight: 700, flexShrink: 0 }}>+</span>
              <span style={{ ...sans, fontSize: '0.88rem', color: textSecondary }}>{item}</span>
            </div>
          ))}
        </div>
      ))}

      {/* SECTION 3 — COMPARISON TABLE */}
      {h2('comparison', 'Side-by-side comparison')}

      <div style={{ overflowX: 'auto', margin: '1.25rem 0 1.75rem', borderRadius: 10, border: `1px solid ${border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...sans, fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: accentLight }}>
              {['Task', 'Standard', 'Deep'].map((h) => (
                <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontWeight: 700, color: accent, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `2px solid ${accentBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([
              ['Kitchen counters, sink, cabinet fronts', true, true],
              ['Exterior of oven and fridge', true, true],
              ['Microwave inside and out', true, true],
              ['Stovetop, grates and knobs', true, true],
              ['Floors swept and mopped', true, true],
              ['Bathroom scrub (sink, toilet, shower, tub)', true, true],
              ['Dust all surfaces', true, true],
              ['Vacuum floors and upholstery', true, true],
              ['Dust ceiling fans, blinds, baseboards', true, true],
              ['Inside oven', false, true],
              ['Inside refrigerator', false, true],
              ['Grease buildup removal', false, true],
              ['Hard water stains and lime scale', false, true],
              ['Mold and mildew treatment', false, true],
              ['Under and behind accessible furniture', false, true],
              ['Vents dusted', false, true],
              ['Cobwebs removed', false, true],
              ['Baseboards and doors wet-wiped', false, true],
              ['Light switches and outlet covers wet-wiped', false, true],
            ] as [string, boolean, boolean][]).map(([task, std, deep], i) => (
              <tr key={i}>
                <td style={{ padding: '0.6rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg }}>{task}</td>
                <td style={{ padding: '0.6rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg, textAlign: 'center' }}>
                  {std ? <span style={{ color: green, fontWeight: 700 }}>✓</span> : <span style={{ color: '#cbd5e1' }}>—</span>}
                </td>
                <td style={{ padding: '0.6rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg, textAlign: 'center' }}>
                  {deep ? <span style={{ color: green, fontWeight: 700 }}>✓</span> : <span style={{ color: '#cbd5e1' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION 4 */}
      {h2('when-standard', 'When is standard cleaning enough?')}
      {p("Standard cleaning is the right call when your home is regularly maintained and you're booking a service to keep it that way.")}

      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '1.1rem 1.4rem', margin: '1rem 0 1.5rem' }}>
        {p(<><strong>Standard works well if:</strong></>, { marginBottom: '0.6rem' })}
        {[
          'You clean yourself between professional visits',
          "You've had a professional clean within the last 1–2 months",
          "There's no grease buildup, hard water staining, or mold",
          "You're maintaining — not resetting",
        ].map((item) => (
          <div key={item} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
            <span style={{ color: green, fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span style={{ ...sans, fontSize: '0.9rem', color: textSecondary }}>{item}</span>
          </div>
        ))}
      </div>

      {/* SECTION 5 */}
      {h2('when-deep', 'When do you need a deep clean?')}

      {[
        { title: 'First-time professional clean', body: "If your home hasn't had a professional service recently, there's likely buildup a standard clean won't fully address. A deep clean creates the baseline that makes every subsequent standard clean faster and more thorough." },
        { title: 'Moving in', body: "Even if the previous tenant cleaned, professional move-out cleans vary in quality. A deep clean on arrival gives you a home you know is actually clean — grout, inside appliances, behind things." },
        { title: 'Moving out', body: "A deep clean is the right level for vacant properties, especially if you need to pass a landlord inspection. Move-in/Move-out cleaning goes even further — adding inside all cabinets and closets." },
        { title: 'Seasonal reset', body: "Once or twice a year, most homes benefit from going back to a deep clean baseline — even with regular standard cleanings in between." },
        { title: 'After renovation or construction', body: "Fine dust from drywall and construction gets into vents, surfaces, and corners that a standard clean won't reach." },
        { title: 'Before selling your home', body: "Buyers notice the oven, the fridge, the grout lines. A deep clean before listing makes those invisible." },
      ].map(({ title, body }) => (
        <div key={title} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: `1px solid ${border}` }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: '0.55rem' }} />
          <div>
            <p style={{ ...display, fontWeight: 700, fontSize: '0.95rem', color: textPrimary, marginBottom: '0.25rem' }}>{title}</p>
            <p style={{ ...sans, fontSize: '0.88rem', color: textSecondary, marginBottom: 0 }}>{body}</p>
          </div>
        </div>
      ))}

      {/* SECTION 6 */}
      {h2('oven-fridge', 'A note on why inside the oven and fridge matter')}
      {p("Most cleaning services in the DMV list inside the oven and inside the refrigerator as paid add-ons — typically $45–$75 for the oven and $30–$50 for the fridge on top of the deep clean price.")}

      <blockquote style={{ borderLeft: `3px solid ${accent}`, margin: '1.5rem 0', padding: '0.75rem 0 0.75rem 1.5rem', color: textSecondary, fontStyle: 'italic', fontSize: '1.02rem' }}>
        RenewShine includes both as standard on every Deep Clean. When clients hear "deep clean," they expect the oven and fridge to be done. Services that don't include them get negative reviews because of it.
      </blockquote>

      {p("If you're comparing quotes and one service is cheaper, check whether the oven and fridge are included. That gap often explains the price difference.")}

      {p(<>Not sure which service you need? <Link href="/booking" style={{ color: accent, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>Send us photos and we'll tell you</Link> — that's part of our review process before we confirm any price.</>)}

      {/* FAQ */}
      {h2('faq', 'Frequently asked questions')}
      <div style={{ marginTop: '1rem' }}>
        {[
          ["What's the difference between a deep clean and a standard clean?", "Standard cleaning covers regular maintenance — surfaces, floors, kitchen exterior, bathrooms, dusting. Deep cleaning adds: inside the oven and refrigerator (included, not add-ons), grease removal, hard water stains, under and behind accessible furniture, vents, cobwebs, and wet-wiped baseboards and light switches."],
          ['How much does deep cleaning cost in Washington DC?', "Most DC homes range from $400–$600+ depending on size and condition. A 2BR/2BA in good condition typically runs $400–$480. RenewShine confirms your exact price after reviewing your photos — no guessing by bedroom count alone."],
          ['How often should you get a deep clean?', "Most households benefit from a deep clean once or twice a year, or whenever a significant life event happens — moving in, moving out, after a renovation, before selling."],
          ['Does deep cleaning include inside the oven and fridge?', "Yes. At RenewShine, inside the oven and inside the refrigerator are standard inclusions on every Deep Clean — not add-ons. Most services charge extra for these."],
          ['Should first-time clients get a deep clean?', "For most first-time clients, yes. A deep clean establishes a baseline that makes every subsequent standard clean faster and more thorough."],
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
