import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'
import { ThemeToggle } from '#/components/theme-toggle'

/* ============================================================
   HOOKS
   ============================================================ */

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold },
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/* ============================================================
   PRIMITIVE COMPONENTS
   ============================================================ */

function Reveal({
  children,
  delay = 0,
  className = '',
  style,
}: {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
}) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={`ep-reveal ${inView ? 'in-view' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  )
}

function CTAButton({
  children,
  variant = 'primary',
  size = 'md',
  style: extraStyle,
}: {
  children: ReactNode
  variant?: 'primary' | 'outline' | 'white'
  size?: 'md' | 'lg'
  style?: CSSProperties
}) {
  const [hovered, setHovered] = useState(false)

  const base: CSSProperties = {
    fontFamily: 'Nunito Sans, sans-serif',
    fontWeight: 700,
    fontSize: size === 'lg' ? 18 : 16,
    padding: size === 'lg' ? '16px 36px' : '13px 26px',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'all 200ms ease',
    transform: hovered ? 'scale(1.02)' : 'scale(1)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    letterSpacing: 0.2,
    ...extraStyle,
  }

  const variants: Record<typeof variant, CSSProperties> = {
    primary: {
      background: hovered ? 'var(--ep-rose-deep)' : 'var(--ep-rose)',
      color: 'var(--ep-warm-white)',
      border: 'none',
      boxShadow: hovered
        ? '0 8px 24px rgba(47,117,184,0.35)'
        : '0 4px 16px rgba(143,188,235,0.3)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--ep-rose-deep)',
      border: '1.5px solid var(--ep-rose)',
      boxShadow: 'none',
    },
    white: {
      background: 'var(--ep-warm-white)',
      color: 'var(--ep-rose-deep)',
      border: 'none',
      boxShadow: hovered
        ? '0 8px 24px rgba(255,255,255,0.4)'
        : '0 4px 16px rgba(255,255,255,0.25)',
    },
  }

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'Nunito Sans, sans-serif',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'var(--ep-sage)',
        marginBottom: 12,
      }}
    >
      {children}
    </p>
  )
}

function FeatureNumber({ n }: { n: string }) {
  return (
    <div
      style={{
        fontFamily: 'Kalam, cursive',
        fontWeight: 700,
        fontSize: 13,
        color: 'var(--ep-rose)',
        background: 'var(--ep-cream)',
        border: '1.5px solid var(--ep-hairline)',
        borderRadius: 8,
        padding: '3px 10px',
        display: 'inline-block',
        marginBottom: 14,
        letterSpacing: 1,
      }}
    >
      {n}
    </div>
  )
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'rgba(156,200,183,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="var(--ep-sage-deep)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span
        style={{
          fontFamily: 'Nunito Sans, sans-serif',
          fontSize: 15,
          color: 'var(--ep-soft-ink)',
          lineHeight: 1.5,
        }}
      >
        {children}
      </span>
    </div>
  )
}

/* ============================================================
   PHONE MOCKUP WRAPPER
   ============================================================ */

function PhoneFrame({ children, dark = false, float = false }: { children: ReactNode; dark?: boolean; float?: boolean }) {
  return (
    <div
      style={{
        animation: float ? 'float 4s ease-in-out infinite' : undefined,
        display: 'inline-block',
      }}
    >
      <div
        style={{
          width: 260,
          background: dark ? '#3a3530' : 'var(--ep-oat)',
          borderRadius: 44,
          padding: 4,
          boxShadow: dark
            ? '0 40px 80px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2)'
            : '0 40px 80px rgba(45,42,38,0.14), 0 8px 24px rgba(45,42,38,0.07)',
        }}
      >
        <div
          style={{
            background: dark ? '#1a1714' : 'var(--ep-warm-white)',
            borderRadius: 40,
            overflow: 'hidden',
          }}
        >
          {/* Notch */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
            <div
              style={{
                width: 80,
                height: 20,
                background: dark ? '#3a3530' : 'var(--ep-oat)',
                borderRadius: '0 0 12px 12px',
              }}
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   NAVBAR
   ============================================================ */

function Navbar() {
  const scrolled = useScrolled()

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled
          ? 'color-mix(in srgb, var(--ep-cream) 93%, transparent)'
          : 'var(--ep-cream)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--ep-hairline)' : 'transparent'}`,
        transition: 'all 300ms ease',
      }}
    >
      <div
        className="ep-navbar-inner"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          height: 64,
          gap: 8,
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 22 }}>🤱</span>
          <span
            style={{
              fontFamily: 'Kalam, cursive',
              fontWeight: 700,
              fontSize: 20,
              color: 'var(--ep-ink)',
              lineHeight: 1,
            }}
          >
            EpingJourney
          </span>
        </a>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Desktop nav */}
        <div
          className="ep-navbar-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
        >
          {[
            ['Fitur', '#fitur'],
            ['Kenapa Kami', '#kenapa-kami'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <NavLink key={label} href={href}>
              {label}
            </NavLink>
          ))}

          <ThemeToggle />
          <SignInButton />
        </div>
      </div>
    </nav>
  )
}

function NavLink({ children, href }: { children: ReactNode; href: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'Nunito Sans, sans-serif',
        fontSize: 15,
        fontWeight: 500,
        color: hovered ? 'var(--ep-rose-deep)' : 'var(--ep-soft-ink)',
        textDecoration: 'none',
        transition: 'color 200ms ease',
      }}
    >
      {children}
    </a>
  )
}

function SignInButton() {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="/dashboard"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'Nunito Sans, sans-serif',
        fontSize: 14,
        fontWeight: 600,
        color: hovered ? 'var(--ep-rose-deep)' : 'var(--ep-ink)',
        background: 'transparent',
        border: `1.5px solid ${hovered ? 'var(--ep-rose-deep)' : 'var(--ep-hairline)'}`,
        borderRadius: 10,
        padding: '7px 18px',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        textDecoration: 'none',
        display: 'inline-block',
      }}
    >
      Masuk
    </a>
  )
}

/* ============================================================
   HERO SECTION
   ============================================================ */

function HeroPhoneMockup() {
  return (
    <PhoneFrame float>
      {/* Timer UI */}
      <div
        style={{
          padding: '20px 22px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'Nunito Sans',
            fontSize: 10,
            letterSpacing: 2,
            color: 'var(--ep-muted)',
            marginBottom: 14,
            textTransform: 'uppercase',
          }}
        >
          Sesi Pumping
        </p>

        {/* SVG Ring + emoji */}
        <div
          style={{
            position: 'relative',
            width: 100,
            height: 100,
            margin: '0 auto 14px',
          }}
        >
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--ep-oat)" strokeWidth="7" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--ep-sage)"
              strokeWidth="7"
              strokeDasharray={`${2 * Math.PI * 42 * 0.68} ${2 * Math.PI * 42}`}
              strokeLinecap="round"
              style={{ animation: 'pulse-sage 2s ease-in-out infinite' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            🤱
          </div>
        </div>

        <p
          style={{
            fontFamily: 'Nunito Sans',
            fontWeight: 800,
            fontSize: 34,
            color: 'var(--ep-ink)',
            letterSpacing: 2,
            fontVariantNumeric: 'tabular-nums',
            marginBottom: 14,
          }}
        >
          02:14:32
        </p>

        <button
          type="button"
          style={{
            width: '100%',
            background: 'var(--ep-rose)',
            border: 'none',
            borderRadius: 11,
            padding: '10px 0',
            cursor: 'pointer',
            fontFamily: 'Nunito Sans',
            fontWeight: 700,
            fontSize: 12,
            color: 'var(--ep-warm-white)',
            letterSpacing: 0.8,
          }}
        >
          STOP TIMER
        </button>
      </div>

      {/* Bottom stat */}
      <div style={{ padding: '0 16px 20px' }}>
        <div
          style={{
            background: 'var(--ep-sand)',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'Kalam',
                fontSize: 13,
                color: 'var(--ep-sage-deep)',
              }}
            >
              Total Hari Ini
            </span>
            <span
              style={{
                fontFamily: 'Nunito Sans',
                fontWeight: 800,
                fontSize: 15,
                color: 'var(--ep-ink)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              18 oz
            </span>
          </div>
          <div
            style={{
              background: 'var(--ep-oat)',
              borderRadius: 4,
              height: 5,
            }}
          >
            <div
              style={{
                background: 'var(--ep-sage)',
                borderRadius: 4,
                height: 5,
                width: '60%',
              }}
            />
          </div>
          <p
            style={{
              fontFamily: 'Nunito Sans',
              fontSize: 10,
              color: 'var(--ep-muted)',
              marginTop: 5,
            }}
          >
            Target: 30 oz
          </p>
        </div>
      </div>
    </PhoneFrame>
  )
}

function HeroSection() {
  return (
    <section
      className="ep-hero ep-section"
      style={{
        background: 'var(--ep-cream)',
        padding: '80px 24px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sage radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-8%',
          width: '55%',
          height: '80%',
          background: 'radial-gradient(ellipse, rgba(156,200,183,0.2) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-8%',
          width: '40%',
          height: '55%',
          background: 'radial-gradient(ellipse, rgba(143,188,235,0.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="ep-hero-row"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 64,
          flexWrap: 'wrap',
        }}
      >
        {/* LEFT: copy */}
        <div style={{ flex: '1 1 400px', maxWidth: 560 }}>
          <Reveal>
            <p
              style={{
                fontFamily: 'Kalam, cursive',
                fontSize: 16,
                fontWeight: 400,
                color: 'var(--ep-sage-deep)',
                marginBottom: 14,
                letterSpacing: 0.3,
              }}
            >
              Untuk Bunda yang Eping
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1
              style={{
                fontFamily: 'Kalam, cursive',
                fontWeight: 700,
                fontSize: 'clamp(38px, 5.5vw, 62px)',
                color: 'var(--ep-ink)',
                lineHeight: 1.2,
                marginBottom: 20,
                letterSpacing: -0.5,
              }}
            >
              Catat setiap tetes.
              <br />
              Lupakan hitungannya.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 18,
                fontWeight: 400,
                color: 'var(--ep-soft-ink)',
                lineHeight: 1.65,
                marginBottom: 32,
                maxWidth: 460,
              }}
            >
              Dibuat untuk pumping jam 3 pagi, kemenangan 2 oz, dan setiap pergeseran di antaranya.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <CTAButton size="lg">Mulai Pumping Sekarang →</CTAButton>
              <p
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontSize: 13,
                  color: 'var(--ep-muted)',
                  marginLeft: 4,
                }}
              >
                Gratis · Tanpa daftar untuk mencoba
              </p>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginTop: 36,
                padding: '16px 20px',
                background: 'var(--ep-warm-white)',
                borderRadius: 14,
                border: '1px solid var(--ep-hairline)',
                maxWidth: 440,
              }}
            >
              <span style={{ color: 'var(--ep-amber)', fontSize: 14, lineHeight: 1.6, flexShrink: 0 }}>★★★★★</span>
              <p
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontSize: 14,
                  color: 'var(--ep-soft-ink)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}
              >
                "Penyelamat warasku jam 3 pagi"
                <span
                  style={{
                    fontStyle: 'normal',
                    fontWeight: 600,
                    color: 'var(--ep-sage-deep)',
                    display: 'block',
                    marginTop: 2,
                    fontSize: 12,
                  }}
                >
                  — Maya, Bunda Eping si kembar
                </span>
              </p>
            </div>
          </Reveal>
        </div>

        {/* RIGHT: phone */}
        <div
          style={{
            flex: '1 1 280px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Reveal delay={100}>
            <HeroPhoneMockup />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   PROBLEM SECTION
   ============================================================ */

function ProblemSection() {
  const problems = [
    { emoji: '🕐', quote: '"Tadi pumping terakhir jam berapa, ya?"' },
    { emoji: '📋', quote: '"Sesi jam 4 pagi udah dicatat belum, ya?"' },
    { emoji: '💧', quote: '"Hari ini udah berapa banyak, ya?"' },
  ]

  return (
    <section
      id="kenapa-kami"
      className="ep-section"
      style={{
        background: 'var(--ep-warm-white)',
        padding: '100px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              color: 'var(--ep-ink)',
              marginBottom: 16,
            }}
          >
            Bunda nggak pelupa. Bunda cuma kelelahan.
          </h2>
          <div
            style={{
              width: 60,
              height: 3,
              background: 'var(--ep-rose)',
              borderRadius: 2,
              margin: '0 auto',
            }}
          />
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            marginBottom: 56,
          }}
        >
          {problems.map(({ emoji, quote }, i) => (
            <Reveal key={emoji} delay={i * 100}>
              <div
                style={{
                  background: 'var(--ep-cream)',
                  border: '1px solid var(--ep-hairline)',
                  borderRadius: 20,
                  padding: '36px 28px',
                  boxShadow: '0 2px 12px rgba(45,42,38,0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Large quote mark */}
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 20,
                    fontFamily: 'Georgia, serif',
                    fontSize: 80,
                    color: 'rgba(143,188,235,0.25)',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  "
                </span>
                <div style={{ fontSize: 36, marginBottom: 20, position: 'relative' }}>{emoji}</div>
                <p
                  style={{
                    fontFamily: 'Kalam, cursive',
                    fontSize: 20,
                    color: 'var(--ep-ink)',
                    lineHeight: 1.45,
                    position: 'relative',
                  }}
                >
                  {quote}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 17,
              color: 'var(--ep-soft-ink)',
              lineHeight: 1.7,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Eping itu kerja logistik 24 jam. EpingJourney dibuat untuk ikut menanggung beban di
            kepalamu — biar Bunda fokus yang lain.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ============================================================
   FEATURE 1 — TIMER
   ============================================================ */

function TimerMockup() {
  return (
    <PhoneFrame>
      <div style={{ padding: '24px 20px 20px', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Nunito Sans',
            fontSize: 10,
            letterSpacing: 2,
            color: 'var(--ep-muted)',
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          Sesi Aktif
        </p>

        {/* Big timer */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--ep-sand) 0%, var(--ep-oat) 100%)',
            borderRadius: 20,
            padding: '28px 16px',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: 'Nunito Sans',
              fontWeight: 800,
              fontSize: 44,
              color: 'var(--ep-ink)',
              letterSpacing: 3,
              fontVariantNumeric: 'tabular-nums',
              marginBottom: 8,
            }}
          >
            00:14:23
          </div>
          <p
            style={{
              fontFamily: 'Nunito Sans',
              fontSize: 11,
              color: 'var(--ep-muted)',
              letterSpacing: 1,
            }}
          >
            SESI SEDANG BERJALAN
          </p>
        </div>

        {/* Stop button with pulse */}
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            width: '100%',
          }}
        >
          <button
            type="button"
            style={{
              width: '100%',
              background: 'var(--ep-rose)',
              border: 'none',
              borderRadius: 14,
              padding: '14px 0',
              cursor: 'pointer',
              fontFamily: 'Nunito Sans',
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--ep-warm-white)',
              letterSpacing: 0.8,
              animation: 'pulse-sage 2s ease-in-out infinite',
              boxShadow: '0 0 0 0 rgba(156,200,183,0.5)',
            }}
          >
            ⏹ STOP TIMER
          </button>
        </div>

        <p
          style={{
            fontFamily: 'Nunito Sans',
            fontSize: 11,
            color: 'var(--ep-sage)',
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--ep-sage)',
              display: 'inline-block',
            }}
          />
          Live · Berjalan di background
        </p>
      </div>

      {/* Mini history */}
      <div
        style={{
          margin: '0 16px 20px',
          background: 'var(--ep-sand)',
          borderRadius: 14,
          padding: '12px 14px',
        }}
      >
        <p
          style={{
            fontFamily: 'Nunito Sans',
            fontSize: 10,
            color: 'var(--ep-muted)',
            letterSpacing: 1.5,
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          Sesi Hari Ini
        </p>
        {[
          { time: '06:00', vol: '3,2 oz', done: true },
          { time: '09:00', vol: '3,5 oz', done: true },
          { time: '12:00', vol: 'Sedang...', done: false },
        ].map((row) => (
          <div
            key={row.time}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '5px 0',
              borderBottom: '1px solid var(--ep-hairline)',
            }}
          >
            <span
              style={{
                fontFamily: 'Nunito Sans',
                fontSize: 12,
                color: row.done ? 'var(--ep-sage-deep)' : 'var(--ep-amber)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {row.time}
            </span>
            <span
              style={{
                fontFamily: 'Nunito Sans',
                fontWeight: 600,
                fontSize: 12,
                color: row.done ? 'var(--ep-ink)' : 'var(--ep-amber)',
              }}
            >
              {row.done ? '✓' : '⏱'} {row.vol}
            </span>
          </div>
        ))}
      </div>
    </PhoneFrame>
  )
}

function Feature1Section() {
  return (
    <section
      id="fitur"
      className="ep-section"
      style={{
        background: 'var(--ep-cream)',
        padding: '100px 24px',
      }}
    >
      <div
        className="ep-feature-row"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 80,
          flexWrap: 'wrap',
        }}
      >
        {/* LEFT: mockup */}
        <Reveal style={{ flex: '1 1 260px', display: 'flex', justifyContent: 'center' }}>
          <TimerMockup />
        </Reveal>

        {/* RIGHT: copy */}
        <div style={{ flex: '1 1 360px', maxWidth: 480 }}>
          <Reveal>
            <FeatureNumber n="01" />
          </Reveal>
          <Reveal delay={60}>
            <h2
              style={{
                fontFamily: 'Kalam, cursive',
                fontWeight: 700,
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                color: 'var(--ep-ink)',
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Satu sentuh. Selesai.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 17,
                color: 'var(--ep-soft-ink)',
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Mulai timer waktu duduk. Stop waktu beres. Lupa nyalain? Catat manual cuma 3 detik.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Bullet>Tetap jalan walau tab ditutup</Bullet>
              <Bullet>Bisa dipakai tanpa internet</Bullet>
              <Bullet>Catat manual untuk sesi yang terlewat</Bullet>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FEATURE 2 — SCHEDULER
   ============================================================ */

function SchedulerMockup() {
  const sessions = [
    { time: '06:00', status: 'done', label: '3,2 oz' },
    { time: '09:00', status: 'done', label: '3,5 oz' },
    { time: '12:00', status: 'overdue', label: 'Terlewat 14 menit' },
    { time: '15:00', status: 'upcoming', label: 'Akan datang' },
    { time: '18:00', status: 'upcoming', label: 'Akan datang' },
    { time: '21:00', status: 'upcoming', label: 'Akan datang' },
  ]

  const statusColor = {
    done: 'var(--ep-sage-deep)',
    overdue: 'var(--ep-amber)',
    upcoming: 'var(--ep-sky)',
  }

  const statusIcon = { done: '✓', overdue: '⚠', upcoming: '◷' }

  return (
    <div
      style={{
        background: 'var(--ep-warm-white)',
        border: '1px solid var(--ep-hairline)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(45,42,38,0.07)',
        minWidth: 280,
        maxWidth: 320,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px',
          background: 'var(--ep-cream)',
          borderBottom: '1px solid var(--ep-hairline)',
        }}
      >
        <p
          style={{
            fontFamily: 'Nunito Sans',
            fontWeight: 700,
            fontSize: 12,
            color: 'var(--ep-muted)',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          HARI INI
        </p>
      </div>

      {/* Schedule rows */}
      <div>
        {sessions.map((s) => (
          <div
            key={s.time}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              borderBottom: '1px solid var(--ep-hairline)',
              background: s.status === 'overdue' ? 'rgba(232,168,124,0.07)' : 'transparent',
            }}
          >
            <span
              style={{
                fontFamily: 'Nunito Sans',
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--ep-ink)',
                width: 48,
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}
            >
              {s.time}
            </span>
            <span
              style={{
                fontFamily: 'Nunito Sans',
                fontWeight: 600,
                fontSize: 12,
                color: statusColor[s.status as keyof typeof statusColor],
                width: 20,
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              {statusIcon[s.status as keyof typeof statusIcon]}
            </span>
            <span
              style={{
                fontFamily: 'Nunito Sans',
                fontSize: 13,
                color: statusColor[s.status as keyof typeof statusColor],
                fontWeight: s.status === 'overdue' ? 600 : 400,
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Shift CTA */}
      <div style={{ padding: '14px 20px' }}>
        <button
          type="button"
          style={{
            width: '100%',
            background: 'transparent',
            border: '1.5px solid var(--ep-rose)',
            borderRadius: 10,
            padding: '9px 0',
            cursor: 'pointer',
            fontFamily: 'Nunito Sans',
            fontWeight: 600,
            fontSize: 13,
            color: 'var(--ep-rose-deep)',
          }}
        >
          Geser sisa jadwal →
        </button>
      </div>
    </div>
  )
}

function Feature2Section() {
  return (
    <section
      className="ep-section"
      style={{
        background: 'var(--ep-warm-white)',
        padding: '100px 24px',
      }}
    >
      <div
        className="ep-feature-row ep-feature-row-reverse"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 80,
          flexWrap: 'wrap',
        }}
      >
        {/* LEFT: copy */}
        <div style={{ flex: '1 1 360px', maxWidth: 480, order: 0 }}>
          <Reveal>
            <FeatureNumber n="02" />
          </Reveal>
          <Reveal delay={60}>
            <h2
              style={{
                fontFamily: 'Kalam, cursive',
                fontWeight: 700,
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                color: 'var(--ep-ink)',
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Jadwal yang ikut alurmu.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 17,
                color: 'var(--ep-soft-ink)',
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              Atur jeda (mis. tiap 3 jam). Kami susun seharian dan besoknya.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div
              style={{
                background: 'var(--ep-cream)',
                border: '1px solid var(--ep-hairline)',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 24,
              }}
            >
              <p
                style={{
                  fontFamily: 'Kalam, cursive',
                  fontSize: 17,
                  color: 'var(--ep-ink)',
                  lineHeight: 1.5,
                  marginBottom: 8,
                }}
              >
                "Mau geser sisa jadwal hari ini?"
              </p>
              <p
                style={{
                  fontFamily: 'Nunito Sans',
                  fontSize: 13,
                  color: 'var(--ep-muted)',
                }}
              >
                Kami tanya dulu — Bunda yang putuskan.
              </p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 16,
                color: 'var(--ep-soft-ink)',
                lineHeight: 1.65,
              }}
            >
              Telat? Kami tanyakan: geser atau biarkan. Bunda yang pegang kendali.
            </p>
          </Reveal>
        </div>

        {/* RIGHT: mockup */}
        <Reveal
          delay={80}
          style={{
            flex: '1 1 280px',
            display: 'flex',
            justifyContent: 'center',
            order: 1,
          }}
        >
          <SchedulerMockup />
        </Reveal>
      </div>
    </section>
  )
}

/* ============================================================
   FEATURE 3 — OUTPUT TRACKING
   ============================================================ */

function OutputMockup() {
  const { ref, inView } = useInView(0.3)

  return (
    <PhoneFrame>
      <div style={{ padding: '24px 20px 20px' }}>
        <p
          style={{
            fontFamily: 'Kalam',
            fontSize: 14,
            color: 'var(--ep-sage-deep)',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          Total Hari Ini
        </p>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            ref={ref}
            style={{
              fontFamily: 'Nunito Sans',
              fontWeight: 800,
              fontSize: 52,
              color: 'var(--ep-ink)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              animation: inView ? 'count-up 0.5s ease forwards' : 'none',
              opacity: inView ? 1 : 0,
            }}
          >
            24,5
          </div>
          <span
            style={{
              fontFamily: 'Nunito Sans',
              fontWeight: 600,
              fontSize: 18,
              color: 'var(--ep-soft-ink)',
            }}
          >
            oz
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              background: 'var(--ep-oat)',
              borderRadius: 8,
              height: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(90deg, var(--ep-sage), var(--ep-sage-deep))',
                borderRadius: 8,
                height: '100%',
                width: inView ? '81.7%' : '0%',
                transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: inView ? '0.3s' : '0s',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontFamily: 'Nunito Sans',
              fontSize: 11,
              color: 'var(--ep-sage-deep)',
              fontWeight: 600,
            }}
          >
            81,7% dari target
          </span>
          <span
            style={{
              fontFamily: 'Nunito Sans',
              fontSize: 11,
              color: 'var(--ep-muted)',
            }}
          >
            Target: 30 oz
          </span>
        </div>

        {/* Last session */}
        <div
          style={{
            background: 'var(--ep-sand)',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontFamily: 'Nunito Sans',
              fontSize: 11,
              color: 'var(--ep-muted)',
              marginBottom: 4,
            }}
          >
            Sesi terakhir
          </p>
          <p
            style={{
              fontFamily: 'Nunito Sans',
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--ep-ink)',
            }}
          >
            3,5 oz · 06:00
          </p>
        </div>

        {/* 7-day mini chart */}
        <div>
          <p
            style={{
              fontFamily: 'Nunito Sans',
              fontSize: 10,
              color: 'var(--ep-muted)',
              letterSpacing: 1.5,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            7 Hari Terakhir
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 4,
              height: 40,
            }}
          >
            {[60, 75, 55, 80, 70, 90, 82].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: i === 6 ? 'var(--ep-sage)' : 'var(--ep-oat)',
                  borderRadius: '3px 3px 0 0',
                  height: inView ? `${h}%` : '0%',
                  transition: `height 0.6s ease`,
                  transitionDelay: inView ? `${0.5 + i * 0.05}s` : '0s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </PhoneFrame>
  )
}

function Feature3Section() {
  return (
    <section
      className="ep-section"
      style={{
        background: 'var(--ep-cream)',
        padding: '100px 24px',
      }}
    >
      <div
        className="ep-feature-row"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 80,
          flexWrap: 'wrap',
        }}
      >
        {/* LEFT: mockup */}
        <Reveal style={{ flex: '1 1 260px', display: 'flex', justifyContent: 'center' }}>
          <OutputMockup />
        </Reveal>

        {/* RIGHT: copy */}
        <div style={{ flex: '1 1 360px', maxWidth: 480 }}>
          <Reveal>
            <FeatureNumber n="03" />
          </Reveal>
          <Reveal delay={60}>
            <h2
              style={{
                fontFamily: 'Kalam, cursive',
                fontWeight: 700,
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                color: 'var(--ep-ink)',
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Lihat totalnya bertumbuh.
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 17,
                color: 'var(--ep-soft-ink)',
                lineHeight: 1.7,
                marginBottom: 28,
              }}
            >
              Catat hasil setiap selesai pumping — oz atau ml, bebas pilih. Lihat total harianmu
              naik real-time. Setiap tetes berarti.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Bullet>Ganti satuan oz/ml kapan saja</Bullet>
              <Bullet>Tren 7 hari sekali lihat</Bullet>
              <Bullet>Tanpa target pun nggak masalah</Bullet>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   NIGHT MODE SHOWCASE
   ============================================================ */

function NightModeSection() {
  return (
    <section
      className="ep-section"
      style={{
        background: 'linear-gradient(135deg, var(--ep-cream) 0%, rgba(201,184,217,0.15) 100%)',
        padding: '100px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 64 }}>
          <SectionLabel>Jam 3 Pagi</SectionLabel>
          <h2
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              color: 'var(--ep-ink)',
              marginBottom: 16,
              lineHeight: 1.3,
            }}
          >
            Kami sudah memikirkan jam 3 pagi <br />
            biar Bunda nggak perlu.
          </h2>
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 17,
              color: 'var(--ep-soft-ink)',
              lineHeight: 1.7,
              maxWidth: 560,
              margin: '0 auto',
            }}
          >
            Satu tangan. Tombol di area jempol. Mode gelap yang otomatis meredup untuk sesi malam.
            Dibuat oleh orang yang pernah ada di posisimu.
          </p>
        </Reveal>

        {/* Two phone mockups */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            justifyContent: 'center',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          {/* Light mode */}
          <Reveal delay={0}>
            <div style={{ textAlign: 'center' }}>
              <PhoneFrame>
                <div style={{ padding: '24px 20px 28px' }}>
                  <p
                    style={{
                      fontFamily: 'Nunito Sans',
                      fontSize: 10,
                      letterSpacing: 2,
                      color: 'var(--ep-muted)',
                      marginBottom: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    Mode Siang
                  </p>
                  <div
                    style={{
                      background: 'var(--ep-cream)',
                      borderRadius: 14,
                      padding: '20px 16px',
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'Nunito Sans',
                        fontWeight: 800,
                        fontSize: 40,
                        color: 'var(--ep-ink)',
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'center',
                        marginBottom: 6,
                      }}
                    >
                      09:00
                    </p>
                    <p
                      style={{
                        fontFamily: 'Kalam',
                        fontSize: 13,
                        color: 'var(--ep-sage-deep)',
                        textAlign: 'center',
                      }}
                    >
                      Sesi berikutnya
                    </p>
                  </div>
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      background: 'var(--ep-rose)',
                      border: 'none',
                      borderRadius: 12,
                      padding: '12px 0',
                      fontFamily: 'Nunito Sans',
                      fontWeight: 700,
                      fontSize: 13,
                      color: 'var(--ep-warm-white)',
                      cursor: 'pointer',
                    }}
                  >
                    Mulai Timer
                  </button>
                </div>
              </PhoneFrame>
              <p
                style={{
                  fontFamily: 'Nunito Sans',
                  fontSize: 13,
                  color: 'var(--ep-muted)',
                  marginTop: 16,
                }}
              >
                Mode Siang · cream + rose
              </p>
            </div>
          </Reveal>

          {/* Dark mode */}
          <Reveal delay={120}>
            <div style={{ textAlign: 'center' }}>
              <PhoneFrame dark>
                <div style={{ padding: '24px 20px 28px' }}>
                  <p
                    style={{
                      fontFamily: 'Nunito Sans',
                      fontSize: 10,
                      letterSpacing: 2,
                      color: 'rgba(247,242,234,0.56)',
                      marginBottom: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    Mode Malam
                  </p>
                  <div
                    style={{
                      background: 'linear-gradient(145deg, #111A26 0%, #0F1822 100%)',
                      border: '1px solid rgba(247,242,234,0.14)',
                      borderRadius: 14,
                      padding: '20px 16px',
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'Nunito Sans',
                        fontWeight: 800,
                        fontSize: 40,
                        color: '#A5C9EF',
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'center',
                        marginBottom: 6,
                      }}
                    >
                      03:00
                    </p>
                    <p
                      style={{
                        fontFamily: 'Kalam',
                        fontSize: 13,
                        color: '#A8CFC0',
                        textAlign: 'center',
                      }}
                    >
                      Sesi berikutnya
                    </p>
                  </div>
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      background: 'rgba(47,117,184,0.24)',
                      border: '1px solid rgba(165,201,239,0.32)',
                      borderRadius: 12,
                      padding: '12px 0',
                      fontFamily: 'Nunito Sans',
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#A5C9EF',
                      cursor: 'pointer',
                    }}
                  >
                    Mulai Timer
                  </button>
                </div>
              </PhoneFrame>
              <p
                style={{
                  fontFamily: 'Nunito Sans',
                  fontSize: 13,
                  color: 'var(--ep-muted)',
                  marginTop: 16,
                }}
              >
                Mode Jam 3 Pagi · bluebell dark
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   SOCIAL PROOF
   ============================================================ */

function SocialProofSection() {
  const testimonials = [
    {
      quote: 'Aplikasi pertama yang nggak bikin aku merasa bersalah karena telat pumping.',
      author: 'Sarah',
      desc: 'Eping 6 bulan',
    },
    {
      quote: 'Fitur geser jadwal itu jenius. Beneran ngerti realita parenting.',
      author: 'Priya',
      desc: 'Bunda newborn',
    },
    {
      quote: 'Aku berhenti hitung-hitung jam 4 pagi. Hidup berubah.',
      author: 'Amelia',
      desc: 'Bunda kembar Eping',
    },
  ]

  return (
    <section
      className="ep-section"
      style={{
        background: 'var(--ep-warm-white)',
        padding: '100px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: 56 }}>
          <SectionLabel>Testimoni</SectionLabel>
          <h2
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              color: 'var(--ep-ink)',
            }}
          >
            Disayangi Bunda di garis depan
          </h2>
        </Reveal>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            marginBottom: 48,
          }}
        >
          {testimonials.map(({ quote, author, desc }, i) => (
            <Reveal key={author} delay={i * 100}>
              <div
                style={{
                  background: 'var(--ep-cream)',
                  border: '1px solid var(--ep-hairline)',
                  borderRadius: 20,
                  padding: '32px 28px 28px',
                  position: 'relative',
                  boxShadow: '0 2px 16px rgba(45,42,38,0.05)',
                  height: '100%',
                }}
              >
                {/* Decorative quote */}
                <span
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: 72,
                    color: 'rgba(143,188,235,0.3)',
                    position: 'absolute',
                    top: 8,
                    left: 20,
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  "
                </span>

                <div style={{ display: 'flex', gap: 4, marginBottom: 16, position: 'relative' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ color: 'var(--ep-amber)', fontSize: 13 }}>
                      ★
                    </span>
                  ))}
                </div>

                <p
                  style={{
                    fontFamily: 'Kalam, cursive',
                    fontSize: 18,
                    color: 'var(--ep-ink)',
                    lineHeight: 1.55,
                    marginBottom: 20,
                    position: 'relative',
                  }}
                >
                  "{quote}"
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    borderTop: '1px solid var(--ep-hairline)',
                    paddingTop: 16,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--ep-sage), var(--ep-sage-deep))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    🤱
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: 'Nunito Sans',
                        fontWeight: 700,
                        fontSize: 14,
                        color: 'var(--ep-sage-deep)',
                        lineHeight: 1.2,
                      }}
                    >
                      — {author}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Nunito Sans',
                        fontSize: 12,
                        color: 'var(--ep-muted)',
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Stats */}
        <Reveal style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 24,
              padding: '16px 32px',
              background: 'var(--ep-cream)',
              border: '1px solid var(--ep-hairline)',
              borderRadius: 100,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: 'var(--ep-amber)', fontSize: 16 }}>
                  ★
                </span>
              ))}
            </div>
            <span
              style={{
                fontFamily: 'Nunito Sans',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--ep-ink)',
              }}
            >
              4,9 / 5
            </span>
            <span
              style={{
                width: 1,
                height: 20,
                background: 'var(--ep-hairline)',
              }}
            />
            <span
              style={{
                fontFamily: 'Nunito Sans',
                fontSize: 15,
                color: 'var(--ep-soft-ink)',
              }}
            >
              1.200+ Bunda mencatat tiap hari
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ============================================================
   FINAL CTA
   ============================================================ */

function FinalCTASection() {
  return (
    <section
      className="ep-section"
      style={{
        background: 'var(--ep-rose)',
        padding: '100px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grain texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '50%',
          height: '160%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 700,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Reveal>
          <div
            style={{
              fontSize: 40,
              marginBottom: 24,
            }}
          >
            🤱
          </div>
          <h2
            style={{
              fontFamily: 'Kalam, cursive',
              fontWeight: 700,
              fontSize: 'clamp(30px, 4.5vw, 48px)',
              color: 'var(--ep-warm-white)',
              lineHeight: 1.25,
              marginBottom: 32,
            }}
          >
            Pumping berikutnya 2 jam lagi.
            <br />
            Biar kami yang hitung mundur.
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <CTAButton variant="white" size="lg">
            Mulai Pumping Sekarang →
          </CTAButton>
        </Reveal>

        <Reveal delay={180}>
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 14,
              color: 'rgba(255,255,255,0.75)',
              marginTop: 20,
            }}
          >
            Gratis selamanya · Tanpa kartu kredit · Bisa offline
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ============================================================
   FOOTER
   ============================================================ */

function FooterLink({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'Nunito Sans, sans-serif',
        fontSize: 14,
        color: hovered ? 'var(--ep-rose-deep)' : 'var(--ep-soft-ink)',
        textDecoration: 'none',
        transition: 'color 200ms ease',
        display: 'block',
        marginBottom: 10,
      }}
    >
      {children}
    </a>
  )
}

function FooterSection() {
  const columns = [
    {
      title: 'Produk',
      links: ['Fitur', 'Harga', 'Changelog', 'Roadmap'],
    },
    {
      title: 'Sumber Belajar',
      links: ['Panduan Eping 101', 'FAQ Laktasi', 'Blog', 'Pusat Bantuan'],
    },
    {
      title: 'Perusahaan',
      links: ['Tentang', 'Kontak', 'Privasi', 'Syarat'],
    },
  ]

  return (
    <footer
      className="ep-footer"
      style={{
        background: 'var(--ep-oat)',
        padding: '64px 24px 40px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 22 }}>🤱</span>
              <span
                style={{
                  fontFamily: 'Kalam, cursive',
                  fontWeight: 700,
                  fontSize: 18,
                  color: 'var(--ep-ink)',
                }}
              >
                EpingJourney
              </span>
            </div>
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 14,
                color: 'var(--ep-soft-ink)',
                lineHeight: 1.6,
                maxWidth: 220,
              }}
            >
              Dibuat dengan cinta untuk Bunda yang pumping.
            </p>
          </div>

          {/* Link columns */}
          {columns.map(({ title, links }) => (
            <div key={title}>
              <p
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 13,
                  color: 'var(--ep-ink)',
                  letterSpacing: 0.5,
                  marginBottom: 16,
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </p>
              {links.map((link) => (
                <FooterLink key={link}>{link}</FooterLink>
              ))}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: 'var(--ep-hairline)',
            marginBottom: 24,
          }}
        />

        {/* Legal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 13,
              color: 'var(--ep-muted)',
            }}
          >
            © 2026 EpingJourney · Dibuat di 🇮🇩 · Bukan saran medis
          </p>
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 13,
              color: 'var(--ep-muted)',
            }}
          >
            Made with 💗 for pumping moms
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ============================================================
   MOBILE STICKY CTA
   ============================================================ */

function MobileStickyBar() {
  const scrolled = useScrolled(400)
  return (
    <div className={`ep-sticky-cta ${scrolled ? 'visible' : ''}`}>
      <CTAButton style={{ width: '100%', justifyContent: 'center' }}>
        Mulai Pumping Sekarang →
      </CTAButton>
    </div>
  )
}

/* ============================================================
   LANDING PAGE ROOT
   ============================================================ */

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <Feature1Section />
        <Feature2Section />
        <Feature3Section />
        <NightModeSection />
        <SocialProofSection />
        <FinalCTASection />
      </main>
      <FooterSection />
      <MobileStickyBar />
    </>
  )
}
