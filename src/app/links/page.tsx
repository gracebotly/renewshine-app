import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RenewShine — Premium Cleaning · DMV',
  description: 'Premium residential cleaning serving the DMV area.',
}

export default function LinksPage() {
  const links = [
    {
      href: 'https://renewshine.co/booking',
      name: 'Book Your Clean',
      description: 'Free quote · Confirmed within 24 hours',
      iconBg: '#eef5f0',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a7c59" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
      ),
    },
    {
      href: 'https://www.facebook.com/share/1Gt1kFx7Di/?mibextid=wwXIfr',
      name: 'Facebook',
      description: 'Updates · Before & afters',
      iconBg: '#e8f0fe',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877f2">
          <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      ),
    },
    {
      href: 'https://www.tiktok.com/@renewshinedmv?_r=1&_t=ZT-965hIF0ti86',
      name: 'TikTok',
      description: 'Cleaning videos · Behind the scenes',
      iconBg: '#f0f0f0',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#010101">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z" />
        </svg>
      ),
    },
  ]

  return (
    <main style={{ backgroundColor: '#f5f3ef', minHeight: '100vh' }} className="flex flex-col items-center">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#2d4a2d', padding: '28px 20px 24px' }} className="flex flex-col items-center">
          {/* Wordmark row */}
          <div className="mb-1 flex items-center gap-2">
            <img src="/logo-white.svg" alt="RenewShine" style={{ height: '36px', width: 'auto' }} />
          </div>

          {/* Tagline */}
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Premium Cleaning · DMV Area
          </span>
        </div>

        {/* Link cards */}
        <div style={{ padding: '20px 16px 24px' }} className="flex flex-col gap-3">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'white',
                borderRadius: '14px',
                padding: '14px 16px',
                border: '0.5px solid #e8e4de',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              {/* Icon container */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: link.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {link.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>{link.name}</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{link.description}</div>
              </div>

              {/* Arrow */}
              <span style={{ fontSize: '18px', color: '#c8c4be', lineHeight: 1 }}>›</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
