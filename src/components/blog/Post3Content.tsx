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
const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)' }

const p = (text: React.ReactNode, extra?: React.CSSProperties) => (
  <p style={{ ...sans, fontSize: '1rem', lineHeight: 1.85, color: textSecondary, marginBottom: '1.4rem', ...extra }}>{text}</p>
)

const h2 = (id: string, text: string) => (
  <h2 id={id} style={{ ...display, fontSize: '1.4rem', fontWeight: 700, color: textPrimary, marginTop: '3rem', marginBottom: '0.9rem', paddingTop: '1rem', borderTop: `2px solid ${border}` }}>{text}</h2>
)

const PriceTable = ({ title, rows, note }: { title: string; rows: [string, string][]; note?: string }) => (
  <div style={{ marginBottom: '1.75rem' }}>
    <p style={{ ...display, fontWeight: 700, fontSize: '0.9rem', color: textPrimary, marginBottom: '0.6rem' }}>{title}</p>
    <div style={{ borderRadius: 10, border: `1px solid ${border}`, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...sans, fontSize: '0.88rem' }}>
        <thead>
          <tr style={{ background: accentLight }}>
            <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 700, color: accent, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `2px solid ${accentBorder}` }}>Home size</th>
            <th style={{ padding: '0.6rem 1rem', textAlign: 'left', fontWeight: 700, color: accent, fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `2px solid ${accentBorder}` }}>Estimated range</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([size, price], i) => (
            <tr key={i}>
              <td style={{ padding: '0.6rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg }}>{size}</td>
              <td style={{ padding: '0.6rem 1rem', borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? card : bg, ...mono, color: textPrimary, fontWeight: 600 }}>{price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {note && <p style={{ ...sans, fontSize: '0.8rem', color: textMuted, marginTop: '0.5rem', marginBottom: 0 }}>{note}</p>}
  </div>
)

export function Post3Content() {
  const toc = [
    { id: 'standard-cost', label: 'What does standard cleaning cost in Washington DC?' },
    { id: 'deep-cost', label: 'What does deep cleaning cost?' },
    { id: 'move-out-cost', label: 'What does move-out cleaning cost?' },
    { id: 'phone-quotes', label: "Why phone quotes don't work" },
    { id: 'what-affects', label: 'What affects price the most?' },
    { id: 'by-city', label: 'DC vs. Arlington vs. Bethesda vs. McLean' },
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
      {p("Most cleaning service websites show a starting price and nothing else. You call, get a quote, and then the cleaner arrives and says something costs extra. That's how the industry has worked forever.", { fontSize: '1.05rem', color: textPrimary })}
      {p("Here's what cleaning actually costs in the DC metro area in 2026 — real ranges, what drives the variation, and how to get a price that doesn't change at the door.")}

      {/* SECTION 1 */}
      {h2('standard-cost', 'What does standard cleaning cost in Washington DC?')}
      {p("Standard cleaning is maintenance cleaning — the ongoing service for a home that's regularly kept up.")}

      <PriceTable
        title="Standard cleaning — estimated price ranges"
        rows={[
          ['Studio or 1BR/1BA', '$150–$200'],
          ['2BR/1BA', '$200–$250'],
          ['2BR/2BA', '$240–$300'],
          ['3BR/2BA', '$300–$380'],
          ['4BR/3BA', '$380–$480'],
          ['Large homes (5BR+)', '$480+ (quoted per property)'],
        ]}
        note="Estimates for homes in reasonable condition with standard layouts. Add-ons like laundry ($43), dishes ($25), linen changes ($15/bed), or interior windows ($20) add to the base."
      />

      {/* SECTION 2 */}
      {h2('deep-cost', 'What does deep cleaning cost?')}
      {p("Deep cleaning covers everything in a standard clean plus inside the oven, inside the refrigerator, grease removal, hard water stain treatment, under and behind accessible furniture, vents, cobwebs, and wet-wiped baseboards and light switches.")}

      <PriceTable
        title="Deep cleaning — estimated price ranges"
        rows={[
          ['1BR/1BA', '$400'],
          ['2BR/1BA', '$400'],
          ['2BR/2BA', '$400–$480'],
          ['3BR/2BA', '$490–$580'],
          ['4BR/3BA', '$580–$700'],
          ['Large homes', '$700+'],
        ]}
        note="The $400 floor reflects what the work actually costs to do properly. Services quoting deep cleans for $200 typically don't include the oven and fridge, or plan to adjust the price at the door."
      />

      {/* SECTION 3 */}
      {h2('move-out-cost', 'What does move-out cleaning cost?')}
      {p("Move-out cleaning includes everything in a deep clean plus inside all cabinets, cupboards, and closets, tops of cabinets, spot-cleaned walls in kitchen and bathrooms, and edge vacuuming of carpet.")}

      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '1.1rem 1.4rem', margin: '1rem 0 1.25rem' }}>
        <p style={{ ...sans, fontSize: '0.8rem', fontWeight: 700, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Starting points</p>
        {[
          ['1BR/1BA apartment', '$350–$450'],
          ['2BR/2BA condo', '$450–$580'],
          ['3BR/2BA townhouse', '$550–$700'],
          ['4BR+ home', '$700+'],
        ].map(([size, price]) => (
          <div key={size} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: `1px solid ${border}` }}>
            <span style={{ ...sans, fontSize: '0.9rem', color: textSecondary }}>{size}</span>
            <span style={{ ...mono, fontSize: '0.9rem', fontWeight: 700, color: textPrimary }}>{price}</span>
          </div>
        ))}
      </div>

      {p("Move-out cleaning is always quoted after reviewing the property. Every vacant unit is different — condition, how recently it was professionally cleaned, and what the previous tenant left behind all affect the scope.")}

      {/* SECTION 4 */}
      {h2('phone-quotes', "Why phone quotes don't work")}
      {p("The cleaning industry's standard model: tell them your bedroom count, get a phone quote, book it. This creates a predictable problem.")}
      {p("The cleaner arrives. The kitchen has three years of oven buildup. The bathroom has heavy hard water staining. There's pet hair everywhere. The quote based on \"2 bedrooms, 2 bathrooms\" no longer reflects the actual job. So either the cleaner underperforms to hit the quoted time, or they ask for more money at the door.")}

      <blockquote style={{ borderLeft: `3px solid ${accent}`, margin: '1.5rem 0', padding: '0.75rem 0 0.75rem 1.5rem', color: textSecondary, fontStyle: 'italic', fontSize: '1.02rem' }}>
        The alternative: review photos before confirming a price. You submit your details and photos, we review within 24 hours, and we send you a confirmed price before you pay anything. The price you receive is the price you pay.
      </blockquote>

      {/* SECTION 5 */}
      {h2('what-affects', 'What affects price the most?')}

      {[
        { label: 'Condition', body: "A home that hasn't been professionally cleaned in 12 months takes significantly more time than one cleaned monthly. Heavy grease buildup, soap scum, hard water staining, and embedded pet hair all add time." },
        { label: 'Layout complexity', body: "Three-floor townhouses, finished basements, properties with many rooms or irregular layouts take longer than single-floor condos with similar bedroom counts." },
        { label: 'Add-on services', body: "Interior windows, laundry, dishes, linen changes, organization — these add meaningfully. A $240 standard clean can become $340 once add-ons are factored in." },
        { label: 'Access logistics', body: "Buildings with elevator restrictions or limited parking windows can affect scheduling. Less so price, but worth noting when booking." },
      ].map(({ label, body }) => (
        <div key={label} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', padding: '1rem 1.25rem', background: card, border: `1px solid ${border}`, borderRadius: 10 }}>
          <div style={{ ...display, fontSize: '0.82rem', fontWeight: 700, color: accent, minWidth: 130, flexShrink: 0, paddingTop: '0.15rem' }}>{label}</div>
          <div style={{ ...sans, fontSize: '0.9rem', color: textSecondary }}>{body}</div>
        </div>
      ))}

      {/* SECTION 6 */}
      {h2('by-city', 'DC vs. Arlington vs. Bethesda vs. McLean')}
      {p("Prices don't vary dramatically by city within the DMV, but home types do — and home type affects scope.")}
      {p("A 4BR/3BA in McLean is often 4,000–6,000 sq ft with high-end finishes and multiple living areas. A 4BR/3BA in Silver Spring is often a colonial on a standard lot. Same bedroom count, very different jobs. This is exactly why photo review matters more than a bedroom-based quote for larger properties.")}
      {p("The market price for cleaning services across DC, Arlington, Alexandria, Bethesda, and Northern Virginia is reasonably consistent. Premium markets like McLean and Potomac don't cost more because the market expects it — they cost more because the jobs actually take longer.")}

      {p(<>If you want a confirmed price for your specific home, <Link href="/booking" style={{ color: accent, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>submit your details and photos</Link> — we'll review and send you an exact number within 24 hours.</>)}

      {/* FAQ */}
      {h2('faq', 'Frequently asked questions')}
      <div style={{ marginTop: '1rem' }}>
        {[
          ['How much does house cleaning cost in Washington DC?', "Standard cleaning typically runs $200–$380 for a 2–3 bedroom home. Deep cleaning starts at $400 and runs $500–$700 for larger homes. Move-out cleaning is $350–$700+ depending on size and condition. Final prices are confirmed after reviewing the space."],
          ['Why do cleaning service prices vary so much?', "Bedroom count is a rough proxy, not an accurate measure of scope. A 2BR condo in Dupont Circle is a very different job than a 2BR townhouse in Old Town with three floors. Condition, layout, add-ons, and when the home was last cleaned all affect the actual price."],
          ['Is it cheaper to hire a service or an individual cleaner?', "Individual cleaners typically charge $20–$35 per hour. A service charging $200–$280 for the same job often includes insurance, supplies, and a two-person team. The hourly rate looks cheaper with an individual, but the total and the risk profile are different."],
          ['How much does recurring cleaning cost in DC?', "Recurring clients typically pay 10–20% less than one-time rates. A $240 standard clean might run $195–$215 bi-weekly. Ask about frequency discounts upfront — they're not always applied automatically."],
          ['Do cleaning services in DC bring their own supplies?', "Most professional services bring their own supplies. If you have specific product preferences — unscented, eco-friendly, a brand you trust — ask before booking whether they'll accommodate."],
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
