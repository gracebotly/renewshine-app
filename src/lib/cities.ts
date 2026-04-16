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
        question: 'How much does house cleaning cost in Washington, DC?',
        answer:
          'Most DC homes range from $200–$500 depending on size, condition, and service type. We provide an exact confirmed price after reviewing your photos — no guessing and no surprise charges at the door.',
      },
      {
        question: 'What does a deep cleaning service include in Washington, DC?',
        answer:
          'A Deep Clean covers everything in a Standard Clean plus grease removal, hard water stain treatment, cleaning under and behind accessible furniture, vent dusting, and wet wiping of baseboards and light switches. It\'s recommended for first-time clients and homes that haven\'t been professionally cleaned recently.',
      },
      {
        question: 'Do you offer recurring cleaning services in Washington, DC?',
        answer:
          'Yes. Many DC clients choose weekly, bi-weekly, or monthly plans to maintain their homes consistently. Recurring clients receive a custom discounted rate on Standard Cleans. Select your preferred frequency when submitting your booking.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Most clients provide access instructions — a lockbox code, key drop, or concierge check-in — and return to a fully cleaned home. Just include your access details in the booking notes.',
      },
      {
        question: 'Do you bring your own cleaning supplies?',
        answer:
          'Yes. Our team arrives fully equipped with professional-grade supplies and tools. You don\'t need to provide anything.',
      },
      {
        question: 'Do you clean condos and apartments in Washington, DC?',
        answer:
          'Yes — condos, apartments, row houses, and townhomes throughout DC. We\'re experienced with building access requirements including key fob entry, concierge check-in, and elevator buildings.',
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
        question: 'How much does house cleaning cost in Arlington, VA?',
        answer:
          'Most Arlington homes range from $200–$450 depending on size, condition, and service type. We confirm your exact price after reviewing your photos — before you pay anything.',
      },
      {
        question: 'Do you offer move-out cleaning services in Arlington, VA?',
        answer:
          'Yes. Our Move-In / Move-Out service is popular with Arlington renters and homeowners, especially with the strong turnover near the Metro corridors. Every move-out clean is quoted after photo review.',
      },
      {
        question: 'Do you offer weekly or bi-weekly cleaning in Arlington, VA?',
        answer:
          'Yes. We offer weekly, bi-weekly, and monthly recurring plans. Recurring Arlington clients receive a custom discounted rate on Standard Cleans. Select your frequency during booking.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Most clients provide a lockbox code or building access instructions and return to a fully cleaned home. Include your access details in the booking notes.',
      },
      {
        question: 'Are you licensed and insured in Virginia?',
        answer:
          'Yes. RenewShine is fully insured and all team members are background-checked before their first job.',
      },
      {
        question: 'Do you clean high-rise condos in Arlington?',
        answer:
          'Yes. We regularly clean high-rise condos along the Orange, Blue, and Silver Line corridors in Clarendon, Ballston, Rosslyn, and Crystal City. Include your building access instructions in the booking notes.',
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
        question: 'How much does house cleaning cost in Alexandria, VA?',
        answer:
          'Most Alexandria homes range from $200–$450 depending on size, condition, and service type. We provide an exact confirmed price after reviewing your photos — no surprises at the door.',
      },
      {
        question: 'Do you offer move-out cleaning in Alexandria, VA?',
        answer:
          'Yes. Move-out cleaning is one of our most requested services in Alexandria, driven by the strong rental market and military PCS turnover in the area. Every move-out clean is quoted after photo review — no instant estimates for vacant properties.',
      },
      {
        question: 'Do you offer recurring cleaning services in Alexandria?',
        answer:
          'Yes — weekly, bi-weekly, and monthly. Recurring clients receive a custom discounted rate on Standard Cleans. Select your preferred frequency when submitting your booking.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Many clients provide a lockbox code or key and return to a fully cleaned home. Just include your access details in the booking notes.',
      },
      {
        question: 'Do you bring your own cleaning supplies?',
        answer:
          'Yes. Our team arrives fully equipped with professional-grade supplies and tools. You don\'t need to provide anything.',
      },
      {
        question: 'Do you clean historic homes in Old Town Alexandria?',
        answer:
          'Yes. We\'re experienced with the older homes, wood floors, and detailed millwork typical of Old Town. We treat historic properties with care and adapt our approach to the finishes in your home.',
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
        question: 'How much does house cleaning cost in Bethesda, MD?',
        answer:
          'Most Bethesda homes range from $200–$500 depending on size, condition, and service type. We provide an exact confirmed price after reviewing your photos — so you always know what you\'re paying before we arrive.',
      },
      {
        question: 'What does a deep cleaning service include in Bethesda, MD?',
        answer:
          'A Deep Clean covers everything in a Standard Clean plus grease removal, hard water stain treatment, cleaning under and behind accessible furniture, vent dusting, and wet wiping of baseboards and light switches. It\'s recommended for first-time clients and larger Bethesda homes.',
      },
      {
        question: 'Do you offer weekly or bi-weekly cleaning services in Bethesda?',
        answer:
          'Yes. Many Bethesda clients choose recurring cleanings to maintain their homes consistently. We offer flexible weekly, bi-weekly, and monthly plans with a custom discounted rate for recurring bookings.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Most clients provide a lockbox code or key and return to a fully cleaned home. Include your access details in the booking notes.',
      },
      {
        question: 'Do you bring your own cleaning supplies?',
        answer:
          'Yes. Our team arrives fully equipped with professional-grade supplies and tools. You don\'t need to provide anything.',
      },
      {
        question: 'Do you clean large homes in Bethesda, MD?',
        answer:
          'Yes. We regularly clean larger multi-level homes in Bethesda. Our photo review process is specifically designed for larger properties — it lets us assess the actual scope before confirming a price, rather than guessing by bedroom count alone.',
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
        question: 'How much does house cleaning cost in Silver Spring, MD?',
        answer:
          'Most Silver Spring homes range from $200–$420 depending on size, condition, and service type. We provide an exact confirmed price after reviewing your photos — before you pay anything.',
      },
      {
        question: 'What is the difference between a standard and deep cleaning in Silver Spring?',
        answer:
          'Standard Clean is maintenance cleaning for homes that are regularly kept up. Deep Clean goes further — removing grease buildup, treating hard water stains, cleaning under accessible furniture, and wet wiping baseboards and light switches. We recommend Deep Clean for first-time clients.',
      },
      {
        question: 'Do you offer recurring cleaning services in Silver Spring, MD?',
        answer:
          'Yes — weekly, bi-weekly, and monthly plans available. Recurring clients receive a custom discounted rate on Standard Cleans. Select your frequency during booking.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Most clients provide a lockbox code or key and return to a fully cleaned home. Just include your access details in the booking notes.',
      },
      {
        question: 'Do you bring your own cleaning supplies?',
        answer:
          'Yes. Our team arrives fully equipped. You don\'t need to provide anything.',
      },
      {
        question: 'Do you serve all Silver Spring zip codes?',
        answer:
          'Yes — we serve all Silver Spring zip codes including 20901, 20902, 20903, 20904, 20905, 20906, and 20910. Submit your address in the booking form and we\'ll confirm coverage.',
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
    neighborhoods: ['Langley', 'Chain Bridge Forest', 'Turkey Run', 'Chesterbrook', 'Spring Hill', 'Lewinsville'],
    housingNote: 'McLean properties are often 4,000–8,000+ square feet, with high-end finishes, multiple living areas, and detailed millwork — all of which we account for in our photo review.',
    testimonial: {
      quote: "Other services would quote me a flat rate and show up underprepared. RenewShine reviewed photos of every room and gave me an accurate price. Worth every penny.",
      name: 'Catherine W.',
      location: 'McLean, VA',
    },
    faqs: [
      {
        question: 'How much does house cleaning cost in McLean, VA?',
        answer:
          'McLean homes vary significantly in size. Most range from $300–$700+ depending on square footage, condition, and service type. We confirm your exact price after reviewing your photos — bedroom count alone doesn\'t capture the scope of most McLean properties.',
      },
      {
        question: 'Do you clean large luxury homes in McLean, VA?',
        answer:
          'Yes. Our photo review process was built for large properties. We review the actual rooms, condition, and finishes before confirming any price — so we arrive fully prepared and you never get a surprise charge.',
      },
      {
        question: 'Do you offer recurring cleaning services in McLean, VA?',
        answer:
          'Yes. Many McLean clients use weekly or bi-weekly recurring service to maintain their homes consistently. Recurring clients receive a custom discounted rate. Select your frequency during booking.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Most clients provide a lockbox code or gate access instructions and return to a fully cleaned home.',
      },
      {
        question: 'Are you insured for high-value homes in Virginia?',
        answer:
          'Yes. RenewShine is fully insured and all team members are background-checked before their first job. We treat every home — including high-value finishes and luxury fixtures — with the care it deserves.',
      },
      {
        question: 'What services are available for McLean homes?',
        answer:
          'Standard Clean, Deep Clean, and Move-In / Move-Out. For larger McLean homes, we typically recommend Deep Clean for first-time visits to ensure a thorough baseline before any recurring schedule.',
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
        question: 'How much does house cleaning cost in Potomac, MD?',
        answer:
          'Potomac homes are among the largest in Maryland. Most range from $350–$800+ depending on square footage, condition, and service type. We confirm your exact price after reviewing your photos — no flat-rate guessing for estate properties.',
      },
      {
        question: 'Do you clean large estate homes in Potomac, MD?',
        answer:
          'Yes. We regularly serve large Potomac properties along the River Road corridor and surrounding neighborhoods. Our pricing accounts for actual square footage, condition, and number of rooms — not just a standard per-bedroom rate.',
      },
      {
        question: 'Do you offer recurring cleaning services in Potomac, MD?',
        answer:
          'Yes. Many Potomac clients maintain a consistent bi-weekly or monthly schedule. Recurring clients receive a custom discounted rate. Select your frequency when submitting your booking.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Most clients provide gate codes or lockbox details and return to a fully cleaned home. Include your access instructions in the booking notes.',
      },
      {
        question: 'Do you bring your own cleaning supplies?',
        answer:
          'Yes. Our team arrives fully equipped with professional-grade supplies and tools. You don\'t need to provide anything.',
      },
      {
        question: 'Is a Deep Clean recommended for first-time Potomac clients?',
        answer:
          'For most first-time clients — especially in larger homes that haven\'t had a recent professional clean — yes. Deep Clean covers everything in a Standard Clean plus grease removal, hard water stain treatment, cleaning under accessible furniture, and thorough high and low cleaning throughout.',
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
        question: 'How much does house cleaning cost in Rockville, MD?',
        answer:
          'Most Rockville homes range from $200–$450 depending on size, condition, and service type. We confirm your exact price after reviewing your photos — before you pay anything.',
      },
      {
        question: 'Do you offer move-out cleaning services in Rockville, MD?',
        answer:
          'Yes. Our Move-In / Move-Out service covers vacant properties thoroughly — inside all cabinets, appliances, and all surfaces. Every move-out clean is quoted after photo review.',
      },
      {
        question: 'Do you offer recurring cleaning in Rockville, MD?',
        answer:
          'Yes — weekly, bi-weekly, and monthly plans. Recurring clients receive a custom discounted rate on Standard Cleans. Select your frequency during booking.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Most clients provide a lockbox code or key and return to a fully cleaned home. Include your access details in the booking notes.',
      },
      {
        question: 'Do you bring your own cleaning supplies?',
        answer:
          'Yes. Our team arrives fully equipped. You don\'t need to provide anything.',
      },
      {
        question: 'Do you clean townhomes in Rockville, MD?',
        answer:
          'Yes. Townhomes are one of our most common job types in Rockville. Multi-level homes are accounted for in our pricing — we review photos of all floors before confirming your estimate.',
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
        question: 'How much does house cleaning cost in Gaithersburg, MD?',
        answer:
          'Most Gaithersburg homes range from $200–$450 depending on size, condition, and service type. We confirm your exact price after reviewing your photos — before you pay anything.',
      },
      {
        question: 'Do you offer move-out cleaning in Gaithersburg, MD?',
        answer:
          'Yes. Our Move-In / Move-Out service covers vacant properties thoroughly — inside cabinets, inside appliances, and all surfaces. Every move-out clean is quoted after photo review.',
      },
      {
        question: 'Do you offer recurring cleaning services in Gaithersburg, MD?',
        answer:
          'Yes — weekly, bi-weekly, and monthly plans. Recurring clients receive a custom discounted rate on Standard Cleans. Select your preferred frequency during booking.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Most clients provide a lockbox code or key and return to a fully cleaned home. Include your access details in the booking notes.',
      },
      {
        question: 'Do you bring your own cleaning supplies?',
        answer:
          'Yes. Our team arrives fully equipped with professional-grade supplies. You don\'t need to provide anything.',
      },
      {
        question: 'Do you serve all Gaithersburg neighborhoods?',
        answer:
          'Yes — Kentlands, Lakelands, Rio, Quince Orchard, Montgomery Village, Shady Grove, and surrounding areas. Submit your address in the booking form and we\'ll confirm coverage.',
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
        question: 'How much does house cleaning cost in Reston, VA?',
        answer:
          'Most Reston homes range from $200–$420 depending on size, condition, and service type. We confirm your exact price after reviewing your photos — before you pay anything.',
      },
      {
        question: 'Do you offer recurring cleaning services in Reston, VA?',
        answer:
          'Yes. Many Reston clients — especially those with demanding work schedules — use bi-weekly or monthly recurring service to maintain their homes. Recurring clients receive a custom discounted rate. Select your frequency during booking.',
      },
      {
        question: 'Do you clean condos and townhomes in Reston, VA?',
        answer:
          'Yes. Reston has a large condo inventory, particularly around Lake Anne and the Town Center. Include building access instructions in your booking notes — key fob, concierge, or lockbox details.',
      },
      {
        question: 'Do I need to be home during the cleaning?',
        answer:
          'No. Most clients provide a lockbox code or building access details and return to a fully cleaned home.',
      },
      {
        question: 'Are you licensed and insured in Virginia?',
        answer:
          'Yes. RenewShine is fully insured and all cleaners are background-checked before their first job.',
      },
      {
        question: 'Do you bring your own cleaning supplies?',
        answer:
          'Yes. Our team arrives fully equipped with professional-grade supplies and tools. You don\'t need to provide anything.',
      },
    ],
  },
]

export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug === slug)
}
