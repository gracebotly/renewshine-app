export interface CityData {
  slug: string
  name: string
  state: string
  stateFullName: string
  displayName: string
  metaTitle: string
  metaDescription: string
  h1: string
  intro: string
  neighborhoods: string[]
  housingNote: string
  testimonial: {
    quote: string
    name: string
    location: string
  }
  faqs: Array<{ question: string; answer: string }>
}

export const CITIES: CityData[] = [
  {
    slug: 'washington-dc',
    name: 'Washington',
    state: 'DC',
    stateFullName: 'Washington DC',
    displayName: 'Washington, DC',
    metaTitle: 'House Cleaning in Washington, DC | RenewShine',
    metaDescription:
      'Premium residential cleaning service in Washington DC. Photo-reviewed quotes, confirmed price before you pay. Serving Georgetown, Capitol Hill, Dupont Circle & more.',
    h1: 'House Cleaning in Washington, DC',
    intro:
      'RenewShine serves homeowners and renters across Washington DC — from the row houses of Capitol Hill to the townhomes of Georgetown and the condos of Dupont Circle. Every quote is reviewed from your photos before we confirm a price, so there are never any surprises at the door.',
    neighborhoods: ['Georgetown', 'Capitol Hill', 'Dupont Circle', 'Logan Circle', 'Chevy Chase DC', 'Cleveland Park'],
    housingNote: 'DC homes range from historic row houses and Capitol Hill townhomes to modern condos — we clean them all.',
    testimonial: {
      quote: "Finally a cleaning service that doesn't underquote. They reviewed my photos, gave me an exact price, and showed up fully prepared. No surprises at all.",
      name: 'Sarah M.',
      location: 'Washington, DC',
    },
    faqs: [
      {
        question: 'Do you serve all DC neighborhoods?',
        answer:
          'We serve all major DC neighborhoods including Georgetown, Capitol Hill, Dupont Circle, Logan Circle, Cleveland Park, Chevy Chase DC, and more. If you\'re unsure whether we cover your area, submit a booking request and we\'ll confirm.',
      },
      {
        question: 'Do you clean condos and apartments in DC?',
        answer:
          'Yes — condos, apartments, row houses, and townhomes. We\'re experienced with DC building access requirements including key fob entry, concierge check-in, and elevator buildings. Just include access instructions in your booking notes.',
      },
      {
        question: 'How does pricing work for DC homes?',
        answer:
          'You submit your details and photos. We review within 1–4 hours and confirm a price before you pay anything. A $100 deposit secures your booking — the remaining balance is due after the job is done.',
      },
    ],
  },
  {
    slug: 'arlington-va',
    name: 'Arlington',
    state: 'VA',
    stateFullName: 'Virginia',
    displayName: 'Arlington, VA',
    metaTitle: 'House Cleaning in Arlington, VA | RenewShine',
    metaDescription:
      'Premium residential cleaning in Arlington, Virginia. Photo-reviewed pricing — no surprises. Serving Clarendon, Ballston, Crystal City, Pentagon City & surrounding neighborhoods.',
    h1: 'House Cleaning in Arlington, VA',
    intro:
      'RenewShine brings premium, photo-reviewed cleaning to Arlington homeowners and renters. Whether you\'re in a Clarendon high-rise, a Ballston condo, or a single-family home in Lyon Village, we review your space before confirming your price — so you always know exactly what to expect.',
    neighborhoods: ['Clarendon', 'Ballston', 'Crystal City', 'Pentagon City', 'Lyon Village', 'Rosslyn'],
    housingNote: 'Arlington has a strong mix of high-rise condos along the Orange Line corridor and single-family homes in quieter neighborhoods — we clean both.',
    testimonial: {
      quote: "The photo review process is genius. I've been burned before by services that didn't know what they were walking into. RenewShine knew exactly what my place needed.",
      name: 'James T.',
      location: 'Arlington, VA',
    },
    faqs: [
      {
        question: 'Do you clean high-rise condos in Arlington?',
        answer:
          'Yes. We regularly clean high-rise condos along the Orange, Blue, and Silver Line corridors in Clarendon, Ballston, Rosslyn, and Crystal City. Include your building access instructions in the booking notes and we\'ll handle the rest.',
      },
      {
        question: 'Are you licensed and insured in Virginia?',
        answer:
          'Yes. RenewShine is fully insured and background-checked. All team members are vetted before their first job.',
      },
      {
        question: 'Do you offer recurring cleaning in Arlington?',
        answer:
          'Yes — weekly, bi-weekly, and monthly plans are available. Recurring clients receive a custom discounted rate on Standard Cleans. Select your preferred frequency when submitting your booking.',
      },
    ],
  },
  {
    slug: 'alexandria-va',
    name: 'Alexandria',
    state: 'VA',
    stateFullName: 'Virginia',
    displayName: 'Alexandria, VA',
    metaTitle: 'House Cleaning in Alexandria, VA | RenewShine',
    metaDescription:
      'Residential cleaning service in Alexandria, Virginia. Photo-reviewed quotes, no surprises. Serving Old Town, Del Ray, Seminary Hill, and surrounding neighborhoods.',
    h1: 'House Cleaning in Alexandria, VA',
    intro:
      'From the historic townhomes of Old Town to the bungalows of Del Ray, RenewShine serves Alexandria residents with a cleaning process built around transparency. We review your photos before confirming any price — so what you\'re quoted is what you pay.',
    neighborhoods: ['Old Town', 'Del Ray', 'Seminary Hill', 'Rosemont', 'West End', 'Landmark'],
    housingNote: 'Alexandria homes range from 18th-century townhomes in Old Town to mid-century bungalows in Del Ray — we adapt our process to each property.',
    testimonial: {
      quote: "I used them for a move-out clean and they were absolutely thorough. The confirmation process gave me peace of mind that the price wouldn't change last minute.",
      name: 'Priya K.',
      location: 'Alexandria, VA',
    },
    faqs: [
      {
        question: 'Do you clean historic homes in Old Town Alexandria?',
        answer:
          'Yes — we\'re experienced with the older homes, wood floors, and detailed millwork typical of Old Town. We treat historic properties with care and adapt our approach to the finishes in your home.',
      },
      {
        question: 'Do you offer move-out cleaning in Alexandria?',
        answer:
          'Yes. Our Move-In / Move-Out service is popular with Alexandria renters and homeowners due to the strong rental market and military PCS turnover in the area. Every move-out clean is quoted after photo review — no instant estimates for vacant properties.',
      },
      {
        question: 'How far in advance should I book?',
        answer:
          'We recommend submitting your request 5–7 days before your preferred window. After you submit, we review within 1–4 hours and confirm your date and price.',
      },
    ],
  },
  {
    slug: 'bethesda-md',
    name: 'Bethesda',
    state: 'MD',
    stateFullName: 'Maryland',
    displayName: 'Bethesda, MD',
    metaTitle: 'House Cleaning in Bethesda, MD | RenewShine',
    metaDescription:
      'Premium house cleaning in Bethesda, Maryland. Photo-reviewed pricing, confirmed before you pay. Serving Chevy Chase, Kenwood, Burning Tree, and surrounding neighborhoods.',
    h1: 'House Cleaning in Bethesda, MD',
    intro:
      'RenewShine offers Bethesda homeowners a cleaning experience that matches the standard of the community — premium, reliable, and fully transparent on price. We review your photos before confirming any quote, so there are no last-minute changes when we arrive.',
    neighborhoods: ['Chevy Chase', 'Kenwood', 'Burning Tree', 'Edgemoor', 'Battery Park', 'Downtown Bethesda'],
    housingNote: 'Bethesda is home to large single-family properties, luxury condos near Bethesda Row, and classic colonial homes — all requiring different levels of detail.',
    testimonial: {
      quote: "I've tried several cleaning services in Bethesda and RenewShine is the only one that got the pricing right the first time. The photo review made all the difference.",
      name: 'Michelle R.',
      location: 'Bethesda, MD',
    },
    faqs: [
      {
        question: 'Do you clean large homes in Bethesda?',
        answer:
          'Yes. Many Bethesda homes are 3,000–5,000+ square feet. Our photo review process is specifically designed for larger properties — it lets us assess the actual scope before confirming a price, rather than guessing by bedroom count alone.',
      },
      {
        question: "What's included in a Deep Clean?",
        answer:
          'Deep Clean covers everything in Standard, plus grease buildup removal, hard water stain treatment, cleaning under and behind accessible furniture, vent dusting, wet wipe of baseboards and light switches, and more. It\'s recommended for first-time clients.',
      },
      {
        question: 'Do you serve the Chevy Chase neighborhoods near Bethesda?',
        answer:
          'Yes — we serve Chevy Chase MD, Kenwood, and the neighborhoods along the DC/Maryland border near Bethesda. If you\'re unsure whether your address is in our service area, submit a request and we\'ll confirm.',
      },
    ],
  },
  {
    slug: 'silver-spring-md',
    name: 'Silver Spring',
    state: 'MD',
    stateFullName: 'Maryland',
    displayName: 'Silver Spring, MD',
    metaTitle: 'House Cleaning in Silver Spring, MD | RenewShine',
    metaDescription:
      'Residential cleaning service in Silver Spring, Maryland. Photo-reviewed quotes, no surprises. Serving Downtown Silver Spring, Woodside, Takoma Park border areas, and more.',
    h1: 'House Cleaning in Silver Spring, MD',
    intro:
      'Silver Spring is one of the most diverse and densely populated communities in Maryland — and one of our most active service areas. RenewShine reviews your photos before confirming any price, making it easy to get an accurate quote whether you\'re in a high-rise downtown or a colonial in Woodside.',
    neighborhoods: ['Downtown Silver Spring', 'Woodside', 'Four Corners', 'Colesville', 'Oakview', 'Hillandale'],
    housingNote: 'Silver Spring has everything from downtown apartments and condos to large single-family homes in Four Corners and Woodside — we serve all of them.',
    testimonial: {
      quote: "Super easy process. Sent photos, got a quote back the same day, and the team did a great job. Booked them for bi-weekly and haven't looked back.",
      name: 'Derek L.',
      location: 'Silver Spring, MD',
    },
    faqs: [
      {
        question: 'Do you serve all of Silver Spring?',
        answer:
          'Yes — we serve all Silver Spring zip codes including 20901, 20902, 20903, 20904, 20905, 20906, and 20910. Submit your address in the booking form and we\'ll confirm coverage.',
      },
      {
        question: "What's the difference between Standard and Deep Clean?",
        answer:
          'Standard Clean is maintenance cleaning for homes that are regularly kept up. Deep Clean goes further — double-scrub disinfection, grease removal, hard water stain treatment, and cleaning under accessible furniture. We recommend Detailed for first-time clients.',
      },
      {
        question: 'Do you offer recurring cleaning in Silver Spring?',
        answer:
          'Yes — weekly, bi-weekly, and monthly. Recurring clients receive a custom discounted rate on Standard Cleans. You select your frequency during booking.',
      },
    ],
  },
  {
    slug: 'mclean-va',
    name: 'McLean',
    state: 'VA',
    stateFullName: 'Virginia',
    displayName: 'McLean, VA',
    metaTitle: 'House Cleaning in McLean, VA | RenewShine',
    metaDescription:
      'Premium house cleaning in McLean, Virginia. Photo-reviewed pricing for large and luxury homes. Serving Langley, Chain Bridge Forest, Turkey Run, and surrounding neighborhoods.',
    h1: 'House Cleaning in McLean, VA',
    intro:
      'McLean is home to some of the largest and most detailed properties in the DMV. RenewShine\'s photo-reviewed quoting process was built for homes like these — where a quick bedroom count doesn\'t capture the actual scope. We review your space, confirm a realistic price, and deliver a clean that matches the standard of your home.',
    neighborhoods: ['Langley', 'Chain Bridge Forest', 'Tur key Run', 'Chesterbrook', 'Spring Hill', 'Lewinsville'],
    housingNote: 'McLean properties are often 4,000–8,000+ square feet, with high-end finishes, multiple living areas, and detailed millwork — all of which we account for in our photo review.',
    testimonial: {
      quote: "Other services would quote me a flat rate and show up underprepared. RenewShine reviewed photos of every room and gave me an accurate price. Worth every penny.",
      name: 'Catherine W.',
      location: 'McLean, VA',
    },
    faqs: [
      {
        question: 'Do you clean large luxury homes in McLean?',
        answer:
          'Yes. Our photo review process is specifically designed for large properties. Rather than quoting by bedroom count alone, we review the actual rooms, condition, and finishes before confirming any price. This protects you from surprises and ensures we arrive prepared.',
      },
      {
        question: 'What services are available for McLean homes?',
        answer:
          'Standard Clean, Deep Clean, and Move-In / Move-Out. All service tiers include the same thorough process — the difference is depth. For larger McLean homes, we typically recommend Deep Clean for first-time visits.',
      },
      {
        question: 'Are you insured for high-value homes in Virginia?',
        answer:
          'Yes. RenewShine is fully insured and all team members are background-checked before their first job. We treat every home with the care it deserves.',
      },
    ],
  },
  {
    slug: 'potomac-md',
    name: 'Potomac',
    state: 'MD',
    stateFullName: 'Maryland',
    displayName: 'Potomac, MD',
    metaTitle: 'House Cleaning in Potomac, MD | RenewShine',
    metaDescription:
      'Premium residential cleaning in Potomac, Maryland. Photo-reviewed quotes for large and luxury homes. Serving River Road corridor, Avenel, and surrounding neighborhoods.',
    h1: 'House Cleaning in Potomac, MD',
    intro:
      'Potomac is one of the most affluent communities in Maryland, with large estate properties and high standards for every service provider. RenewShine earns that trust through one rule: we review your photos before confirming any price. No guessing, no surprises — just a clean that meets the standard your home deserves.',
    neighborhoods: ['River Road Corridor', 'Avenel', 'Potomac Village', 'Inverness', 'Carderock', 'Kenwood Park'],
    housingNote: 'Potomac is defined by large estate homes along the river corridor — properties that require detailed planning before any cleaning appointment.',
    testimonial: {
      quote: "I appreciated that they didn't just give me a generic price over the phone. They asked for photos, reviewed them, and came back with a number that reflected my home's actual size.",
      name: 'Robert A.',
      location: 'Potomac, MD',
    },
    faqs: [
      {
        question: 'How does photo review work for large Potomac estates?',
        answer:
          'You submit a walkthrough video or room-by-room photos through our booking form. We review within 1–4 hours and send you a confirmed price range. Once you approve the quote, a $100 deposit secures your booking.',
      },
      {
        question: 'Do you clean estate-sized properties?',
        answer:
          'Yes. We regularly serve large Potomac properties. Our pricing accounts for actual square footage, condition, and number of rooms — not just a standard per-bedroom rate.',
      },
      {
        question: 'Is a Deep Clean recommended for first-time Potomac clients?',
        answer:
          'For most first-time clients — especially in larger homes that haven\'t had a recent professional clean — yes. Deep Clean covers everything in Standard plus grease removal, hard water stain treatment, cleaning under accessible furniture, and thorough high and low cleaning throughout.',
      },
    ],
  },
  {
    slug: 'rockville-md',
    name: 'Rockville',
    state: 'MD',
    stateFullName: 'Maryland',
    displayName: 'Rockville, MD',
    metaTitle: 'House Cleaning in Rockville, MD | RenewShine',
    metaDescription:
      'Residential cleaning service in Rockville, Maryland. Photo-reviewed pricing, no surprises. Serving King Farm, Fallsgrove, Twinbrook, and surrounding neighborhoods.',
    h1: 'House Cleaning in Rockville, MD',
    intro:
      "Rockville is one of Montgomery County's most established residential communities, with a wide range of home types from King Farm townhomes to large single-family properties in the older neighborhoods. RenewShine reviews your photos before confirming your price — ensuring accuracy no matter the size or style of your home.",
    neighborhoods: ['King Farm', 'Fallsgrove', 'Twinbrook', 'Hungerford', 'Rockcrest', 'Montrose'],
    housingNote: 'Rockville has a strong mix of newer townhomes in planned communities like King Farm and Fallsgrove, alongside older single-family homes — both well-suited to our review-based process.',
    testimonial: {
      quote: 'Reliable, thorough, and transparent. They gave me a confirmed price before the appointment and stuck to it. Finally a service worth recommending.',
      name: 'Amanda P.',
      location: 'Rockville, MD',
    },
    faqs: [
      {
        question: 'Do you serve all of Rockville?',
        answer:
          'Yes — we serve all Rockville neighborhoods including King Farm, Fallsgrove, Twinbrook, Hungerford, and the older neighborhoods near Downtown Rockville. Submit your address and we\'ll confirm coverage.',
      },
      {
        question: 'Do you clean townhomes in Rockville?',
        answer:
          'Yes. Townhomes are one of our most common job types. Multi-level homes are accounted for in our pricing — we review the photos of all floors before confirming your estimate.',
      },
      {
        question: 'How quickly can I get a quote?',
        answer:
          'Submit your booking form with photos or a short video and we\'ll review within 1–4 hours. Most clients hear back the same day.',
      },
    ],
  },
  {
    slug: 'gaithersburg-md',
    name: 'Gaithersburg',
    state: 'MD',
    stateFullName: 'Maryland',
    displayName: 'Gaithersburg, MD',
    metaTitle: 'House Cleaning in Gaithersburg, MD | RenewShine',
    metaDescription:
      'House cleaning service in Gaithersburg, Maryland. Photo-reviewed quotes, confirmed before you pay. Serving Kentlands, Rio, Lakelands, Quince Orchard, and more.',
    h1: 'House Cleaning in Gaithersburg, MD',
    intro:
      'Gaithersburg is one of the largest cities in Montgomery County and home to a broad range of residential communities — from the planned neighborhoods of Kentlands and Lakelands to established single-family homes in Quince Orchard. RenewShine serves all of them with the same photo-reviewed, no-surprise pricing process.',
    neighborhoods: ['Kentlands', 'Lakelands', 'Rio', 'Quince Orchard', 'Montgomery Village', 'Shady Grove'],
    housingNote: 'Gaithersburg has a large inventory of townhomes, colonials, and single-family homes across well-planned communities — pricing is always reviewed per property.',
    testimonial: {
      quote: 'Booked for a deep clean before putting my house on the market. They were thorough, professional, and the price was exactly what they quoted. Great experience.',
      name: 'Tony M.',
      location: 'Gaithersburg, MD',
    },
    faqs: [
      {
        question: 'Do you serve all Gaithersburg neighborhoods?',
        answer:
          'Yes — Kentlands, Lakelands, Rio, Quince Orchard, Montgomery Village, Shady Grove, and surrounding areas. If you\'re unsure, submit a request and we\'ll confirm your address is in our service area.',
      },
      {
        question: 'Do you offer move-out cleaning in Gaithersburg?',
        answer:
          'Yes. Our Move-In / Move-Out service covers vacant properties thoroughly — inside cabinets, appliances, and all surfaces. Every move-out clean is quoted after photo review.',
      },
      {
        question: 'What add-on services are available?',
        answer:
          'Inside refrigerator, inside oven, dishes, linen changes, laundry, interior windows, home organization, spot clean walls, and basement cleaning. All add-ons are selected during booking and priced after photo review.',
      },
    ],
  },
  {
    slug: 'reston-va',
    name: 'Reston',
    state: 'VA',
    stateFullName: 'Virginia',
    displayName: 'Reston, VA',
    metaTitle: 'House Cleaning in Reston, VA | RenewShine',
    metaDescription:
      'Residential cleaning service in Reston, Virginia. Photo-reviewed pricing, no surprises. Serving Lake Anne, South Lakes, North Point, Hunters Woods, and surrounding areas.',
    h1: 'House Cleaning in Reston, VA',
    intro:
      'Reston\'s tech corridor and planned community design make it one of Northern Virginia\'s most desirable places to live — and one of our growing service areas. RenewShine brings photo-reviewed, transparent pricing to Reston homeowners and renters, whether you\'re in a Lake Anne condo, a South Lakes townhome, or a single-family home near the Silver Line.',
    neighborhoods: ['Lake Anne', 'South Lakes', 'North Point', 'Hunters Woods', 'Tall Oaks', 'Sunrise Valley'],
    housingNote: 'Reston has a strong mix of planned community townhomes, lakeside condos, and single-family homes built across several decades — all handled through our review-based quoting process.',
    testimonial: {
      quote: "I work long hours and needed a service I could trust to handle things without me hovering. RenewShine's process — photos upfront, confirmed price, done — is exactly that.",
      name: 'Kayla S.',
      location: 'Reston, VA',
    },
    faqs: [
      {
        question: 'Do you serve all Reston neighborhoods?',
        answer:
          'Yes — Lake Anne, South Lakes, North Point, Hunters Woods, Tall Oaks, and surrounding areas near the Reston Town Center and Silver Line corridor.',
      },
      {
        question: 'Do you clean condos in Reston?',
        answer:
          'Yes. Reston has a large condo inventory, particularly around Lake Anne and the Town Center. Include building access instructions in your booking notes — key fob, concierge, or lockbox details.',
      },
      {
        question: 'Are you licensed and insured in Virginia?',
        answer:
          'Yes. RenewShine is fully insured and all cleaners are background-checked. You\'ll receive confirmation of your assigned cleaner before your appointment.',
      },
    ],
  },
]

export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug === slug)
}
