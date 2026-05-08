import { useEffect, useMemo, useState } from 'react'
import { ThemeToggle } from '#/components/theme-toggle'

/* ============================================================
   DESIGN TOKENS
   ============================================================ */

const T = {
  cream: 'var(--ep-cream)',
  warmWhite: 'var(--ep-warm-white)',
  oat: 'var(--ep-oat)',
  sand: 'var(--ep-sand)',
  rose: 'var(--ep-rose)',
  roseDeep: 'var(--ep-rose-deep)',
  sage: 'var(--ep-sage)',
  sageDeep: 'var(--ep-sage-deep)',
  amber: 'var(--ep-amber)',
  amberDeep: 'var(--ep-amber-deep)',
  sky: 'var(--ep-sky)',
  ink: 'var(--ep-ink)',
  softInk: 'var(--ep-soft-ink)',
  muted: 'var(--ep-muted)',
  hairline: 'var(--ep-hairline)',
} as const

/* ── Dark palette used inside the timer overlay ── */
const D = {
  bg: 'linear-gradient(160deg, #0D141D 0%, #111A26 55%, #0A1018 100%)',
  text: '#F7F2EA',
  muted: 'rgba(247,242,234,0.56)',
  hairline: 'rgba(247,242,234,0.14)',
  glass: 'rgba(247,242,234,0.07)',
  subtle: 'rgba(247,242,234,0.15)',
} as const

/* ============================================================
   SESSION DATA
   ============================================================ */

const INTERVAL_MINUTES = 180 // 3-hour pumping interval
const SCHEDULE_START_HOUR = 6
const TOTAL_SESSIONS = 6

type SessionStatus = 'done' | 'overdue' | 'upcoming'
type PumpSide  = 'kiri' | 'kanan' | 'keduanya'

interface Session {
  id: number
  time: string
  status: SessionStatus
  volumeAmount: number | null
  volumeOz: number | null
  durationMin: number | null
  unit?: 'oz' | 'ml'
  side?: PumpSide
  startTime?: string
  endTime?: string
  overdueMin?: number
}

interface PumpLog {
  id: number
  time: string
  volumeAmount: number | null
  volumeOz: number | null
  durationMin: number
  unit: 'oz' | 'ml'
  side: PumpSide
  startTime: string
  endTime: string
}

interface DashboardSummary {
  totalOz: number
  targetOz: number
  sessionsDone: number
  totalSessions: number
  avgDurationMin: number
  streakDays: number
}

interface TimerSessionResult {
  startedAt: Date
  endedAt: Date
  elapsedSec: number
  side: PumpSide
  volume: string
  unit: 'oz' | 'ml'
}

const TARGET_OZ = 30

/* ============================================================
   HOOKS
   ============================================================ */

function useMount() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])
  return mounted
}

function useCurrentTime() {
  const [time, setTime] = useState<Date | null>(null)
  useEffect(() => {
    setTime(new Date())
    const id = setInterval(() => setTime(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return time
}

function useCountdown(targetHour: number, targetMinute: number) {
  const [state, setState] = useState({ display: '--:--:--', minutesLeft: INTERVAL_MINUTES })

  useEffect(() => {
    const compute = () => {
      const now = new Date()
      const target = new Date()
      target.setHours(targetHour, targetMinute, 0, 0)
      if (target <= now) target.setDate(target.getDate() + 1)

      const diffMs = target.getTime() - now.getTime()
      const totalSec = Math.floor(diffMs / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60

      setState({
        display: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        minutesLeft: Math.floor(totalSec / 60),
      })
    }
    compute()
    const id = setInterval(compute, 1000)
    return () => clearInterval(id)
  }, [targetHour, targetMinute])

  return state
}

/* ============================================================
   HELPERS
   ============================================================ */

function getGreeting(hour: number) {
  if (hour < 11) return { text: 'Selamat pagi', emoji: '🌤️' }
  if (hour < 15) return { text: 'Selamat siang', emoji: '☀️' }
  if (hour < 18) return { text: 'Selamat sore', emoji: '🌅' }
  return { text: 'Selamat malam', emoji: '🌙' }
}

function formatClock(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function scheduleTimes() {
  return Array.from({ length: TOTAL_SESSIONS }, (_, index) => {
    const hour = SCHEDULE_START_HOUR + (INTERVAL_MINUTES / 60) * index
    return `${String(hour).padStart(2, '0')}:00`
  })
}

function scheduleDate(time: string, base = new Date()) {
  const [hour, minute] = time.split(':').map(Number)
  const date = new Date(base)
  date.setHours(hour, minute, 0, 0)
  return date
}

function formatOz(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatSessionOz(value: number) {
  return formatOz(value).replace('.', ',')
}

function formatSessionVolume(session: Session) {
  if (session.volumeAmount === null) return 'Belum ada hasil'
  const unit = session.unit ?? 'oz'
  const value = unit === 'oz'
    ? formatSessionOz(session.volumeAmount)
    : String(Math.round(session.volumeAmount))
  return `${value} ${unit}`
}

function volumeToOz(volume: string, unit: 'oz' | 'ml') {
  const normalized = Number.parseFloat(volume.replace(',', '.'))
  if (!Number.isFinite(normalized)) return null
  return unit === 'ml' ? normalized / 29.5735 : normalized
}

function createSummary(sessions: Session[]): DashboardSummary {
  const done = sessions.filter((session) => session.status === 'done')
  const totalOz = done.reduce((sum, session) => sum + (session.volumeOz ?? 0), 0)
  const durations = done
    .map((session) => session.durationMin)
    .filter((duration): duration is number => duration !== null)
  const avgDurationMin = durations.length
    ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
    : 0

  return {
    totalOz: Math.round(totalOz * 10) / 10,
    targetOz: TARGET_OZ,
    sessionsDone: done.length,
    totalSessions: sessions.length,
    avgDurationMin,
    streakDays: done.length > 0 ? 1 : 0,
  }
}

function createSessions(logs: PumpLog[], now: Date): Session[] {
  return scheduleTimes().map((time, index) => {
    const log = logs.find((item) => item.time === time)
    if (log) {
      return {
        id: index + 1,
        time,
        status: 'done',
        volumeAmount: log.volumeAmount,
        volumeOz: log.volumeOz,
        durationMin: log.durationMin,
        unit: log.unit,
        side: log.side,
        startTime: log.startTime,
        endTime: log.endTime,
      }
    }

    const scheduledAt = scheduleDate(time, now)
    const overdueMin = Math.floor((now.getTime() - scheduledAt.getTime()) / 60_000)
    if (overdueMin > 0) {
      return {
        id: index + 1,
        time,
        status: 'overdue',
        volumeAmount: null,
        volumeOz: null,
        durationMin: null,
        overdueMin,
      }
    }

    return {
      id: index + 1,
      time,
      status: 'upcoming',
      volumeAmount: null,
      volumeOz: null,
      durationMin: null,
    }
  })
}

function nextActionableSession(sessions: Session[]) {
  return sessions.find((session) => session.status !== 'done') ?? sessions[sessions.length - 1]
}

/* ============================================================
   TIMER — TYPES & HELPERS
   ============================================================ */

type TimerPhase = 'running' | 'paused' | 'logging'

const SESSION_TARGET_SEC = 20 * 60  // 20-min expected session

function formatElapsed(s: number): string {
  const h  = Math.floor(s / 3600)
  const m  = Math.floor((s % 3600) / 60)
  const sc = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sc).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

const PUMP_SIDES: { id: PumpSide; label: string }[] = [
  { id: 'kiri',     label: '◀  Kiri'    },
  { id: 'kanan',    label: 'Kanan  ▶'   },
  { id: 'keduanya', label: 'Keduanya'   },
]

/* ============================================================
   DASHBOARD NAV
   ============================================================ */

function DashboardNav() {
  const [avatarHovered, setAvatarHovered] = useState(false)

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'color-mix(in srgb, var(--ep-cream) 93%, transparent)',
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${T.hairline}`,
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>🤱</span>
          <span
            style={{
              fontFamily: 'Kalam, cursive',
              fontWeight: 700,
              fontSize: 18,
              color: T.ink,
              lineHeight: 1,
            }}
          >
            EpingJourney
          </span>
        </a>

        {/* Page badge */}
        <span
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 11,
            fontWeight: 600,
            color: T.muted,
            background: T.oat,
            borderRadius: 100,
            padding: '3px 10px',
            letterSpacing: 0.3,
            flexShrink: 0,
          }}
        >
          Dashboard
        </span>

        <div style={{ flex: 1 }} />

        <ThemeToggle />

        {/* User */}
        <div
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            padding: '4px 8px 4px 4px',
            borderRadius: 100,
            background: avatarHovered ? T.oat : 'transparent',
            transition: 'background 200ms ease',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.sage}, ${T.sageDeep})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            🤱
          </div>
          <span
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: T.softInk,
            }}
          >
            Bunda
          </span>
        </div>
      </div>
    </nav>
  )
}

/* ============================================================
   COUNTDOWN RING
   ============================================================ */

function CountdownRing({
  minutesLeft,
  totalMinutes,
  display,
  label,
  visible,
}: {
  minutesLeft: number
  totalMinutes: number
  display: string
  label: string
  visible: boolean
}) {
  const SIZE = 156
  const STROKE = 9
  const R = (SIZE - STROKE) / 2         // 73.5
  const C = 2 * Math.PI * R             // ~461.8

  // Ring fills as session approaches
  const fillRatio = Math.max(0, Math.min(1, 1 - minutesLeft / totalMinutes))
  const dashOffset = C * (1 - fillRatio)

  // Color: sage → amber → rose based on urgency
  const ringColor =
    minutesLeft > 90 ? T.sage
    : minutesLeft > 30 ? T.amber
    : T.roseDeep

  const ringEmoji =
    minutesLeft > 90 ? '🍵'
    : minutesLeft > 30 ? '⏰'
    : '🔔'

  return (
    <div
      style={{
        position: 'relative',
        width: SIZE,
        height: SIZE,
        flexShrink: 0,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 0.5s ease 0.1s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={T.oat} strokeWidth={STROKE} />
        {/* Progress arc */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeDasharray={C}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.8s ease',
          }}
        />
      </svg>

      {/* Center */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <span style={{ fontSize: 26, lineHeight: 1 }}>{ringEmoji}</span>
        <span
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontWeight: 800,
            fontSize: 13,
            color: T.ink,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: 0.5,
          }}
        >
          {display}
        </span>
        <span
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 10,
            fontWeight: 600,
            color: T.muted,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          menuju {label}
        </span>
      </div>
    </div>
  )
}

/* ============================================================
   SECTION 1 — WELCOME HEADER
   ============================================================ */

function WelcomeSection({
  sessions,
  nextSession,
  onStartTimer,
}: {
  sessions: Session[]
  nextSession?: Session
  onStartTimer: () => void
}) {
  const mounted = useMount()
  const now = useCurrentTime()
  const [nextHour = SCHEDULE_START_HOUR, nextMinute = 0] = (nextSession?.time ?? '06:00').split(':').map(Number)
  const { display, minutesLeft } = useCountdown(nextHour, nextMinute)

  const greeting = now ? getGreeting(now.getHours()) : { text: 'Halo', emoji: '👋' }

  const dateStr = now
    ? now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '–'

  const hoursLeft = Math.floor(minutesLeft / 60)
  const minsLeft = minutesLeft % 60
  const nextLabel =
    hoursLeft > 0 ? `dalam ${hoursLeft}j ${minsLeft}m` : `dalam ${minsLeft} menit`

  const [primaryHover, setPrimaryHover] = useState(false)
  const [secondaryHover, setSecondaryHover] = useState(false)

  // Overdue session
  const overdueSession = sessions.find((s) => s.status === 'overdue')

  return (
    <section
      style={{
        background: T.cream,
        padding: '32px 24px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow — sage top-right */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-8%',
          width: '45%',
          height: '160%',
          background: 'radial-gradient(ellipse, rgba(156,200,183,0.2) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      {/* Ambient glow — rose bottom-left */}
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-5%',
          width: '35%',
          height: '130%',
          background: 'radial-gradient(ellipse, rgba(143,188,235,0.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
        {/* Main row: greeting + ring */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 36,
            flexWrap: 'wrap',
            marginBottom: 28,
          }}
        >
          {/* Left — greeting text */}
          <div
            style={{
              flex: '1 1 300px',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: T.sageDeep,
                letterSpacing: 0.4,
                marginBottom: 4,
              }}
            >
              {greeting.emoji} {greeting.text}
            </p>

            <h1
              style={{
                fontFamily: 'Kalam, cursive',
                fontWeight: 700,
                fontSize: 'clamp(28px, 4vw, 42px)',
                color: T.ink,
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              Bunda! 👋
            </h1>

            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 13,
                color: T.muted,
                marginBottom: 22,
                textTransform: 'capitalize',
              }}
            >
              {dateStr}
            </p>

            {/* Next session chip */}
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                gap: 5,
                background: T.warmWhite,
                border: `1px solid ${T.hairline}`,
                borderRadius: 16,
                padding: '14px 20px',
                boxShadow: '0 2px 12px rgba(45,42,38,0.05)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.muted,
                  letterSpacing: 1.8,
                  textTransform: 'uppercase',
                }}
              >
                Sesi Berikutnya
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span
                  style={{
                    fontFamily: 'Kalam, cursive',
                    fontWeight: 700,
                    fontSize: 30,
                    color: T.ink,
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {nextSession?.time ?? '06:00'}
                </span>
                <span
                  style={{
                    fontFamily: 'Nunito Sans, sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.sageDeep,
                  }}
                >
                  {mounted ? nextLabel : '–'}
                </span>
              </div>
            </div>
          </div>

          {/* Right — countdown ring */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <CountdownRing
              minutesLeft={minutesLeft}
              totalMinutes={INTERVAL_MINUTES}
              display={display}
              label={nextSession?.time ?? '06:00'}
              visible={mounted}
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: overdueSession ? 18 : 0,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s',
          }}
        >
          <button
            type="button"
            onMouseEnter={() => setPrimaryHover(true)}
            onMouseLeave={() => setPrimaryHover(false)}
            onClick={() => onStartTimer()}
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              padding: '13px 28px',
              borderRadius: 12,
              cursor: 'pointer',
              border: 'none',
              background: primaryHover ? T.roseDeep : T.rose,
              color: '#FFFFFF',
              boxShadow: primaryHover
                ? '0 8px 24px rgba(47,117,184,0.32)'
                : '0 4px 14px rgba(143,188,235,0.28)',
              transition: 'all 200ms ease',
              transform: primaryHover ? 'scale(1.02)' : 'scale(1)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            ▶&nbsp; Mulai Timer
          </button>

          <button
            type="button"
            onMouseEnter={() => setSecondaryHover(true)}
            onMouseLeave={() => setSecondaryHover(false)}
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              padding: '13px 24px',
              borderRadius: 12,
              cursor: 'pointer',
              background: 'transparent',
              color: secondaryHover ? T.roseDeep : T.softInk,
              border: `1.5px solid ${secondaryHover ? T.rose : T.hairline}`,
              transition: 'all 200ms ease',
            }}
          >
            + Catat Manual
          </button>
        </div>

        {/* Overdue alert banner */}
        {overdueSession && (
          <div
            style={{
              padding: '13px 16px',
              background: 'rgba(232,168,124,0.1)',
              border: '1px solid rgba(232,168,124,0.35)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 0.5s ease 0.25s',
            }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1, minWidth: 160 }}>
              <span
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  color: T.amberDeep,
                }}
              >
                Sesi {overdueSession.time} terlewat {overdueSession.overdueMin} menit.
              </span>
              <span
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontSize: 13,
                  color: T.muted,
                  marginLeft: 6,
                }}
              >
                Catat atau lewati?
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  padding: '6px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: 'none',
                  background: T.amber,
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                Catat
              </button>
              <button
                type="button"
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: 12,
                  padding: '6px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: 'transparent',
                  border: `1px solid ${T.hairline}`,
                  color: T.muted,
                  flexShrink: 0,
                }}
              >
                Lewati
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ============================================================
   SECTION 2 — STATS ROW
   ============================================================ */

interface StatCardProps {
  emoji: string
  value: string
  label: string
  sub: string
  progress?: number
  progressColor?: string
  accentColor?: string
  featured?: boolean
  visible: boolean
  delay: number
}

function StatCard({
  emoji,
  value,
  label,
  sub,
  progress,
  progressColor = T.sage,
  accentColor = T.sageDeep,
  featured = false,
  visible,
  delay,
}: StatCardProps) {
  const [hovered, setHovered] = useState(false)
  const progressValue = progress === undefined ? undefined : Math.max(0, Math.min(1, progress))

  return (
    <div
      role="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: featured
          ? 'var(--ep-summary-card-featured)'
          : 'var(--ep-summary-card)',
        border: `1px solid ${featured ? 'rgba(143,188,235,0.42)' : T.hairline}`,
        borderRadius: 18,
        padding: featured ? '24px 26px 22px' : '17px 18px',
        boxShadow: hovered ? 'var(--ep-summary-card-shadow-hover)' : 'var(--ep-summary-card-shadow)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'box-shadow 250ms ease, transform 250ms ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: featured ? 18 : 12,
        width: '100%',
        height: '100%',
        opacity: visible ? 1 : 0,
        // opacity transition uses the stagger delay
        // we keep it separate from the hover transitions above by not using 'all'
      }}
      // we drive opacity via a wrapping style tag approach using CSS vars — but for simplicity,
      // we handle the stagger via a wrapper div below
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            width: featured ? 42 : 34,
            height: featured ? 42 : 34,
            borderRadius: featured ? 14 : 12,
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}2E`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: featured ? 23 : 18,
            flexShrink: 0,
          }}
        >
          {emoji}
        </span>
        <span
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            color: T.muted,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div>
        <p
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontWeight: 800,
            fontSize: featured ? 'clamp(34px, 5vw, 50px)' : 'clamp(22px, 3vw, 29px)',
            color: T.ink,
            lineHeight: featured ? 0.98 : 1.05,
            marginBottom: featured ? 8 : 4,
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </p>
        <p
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: featured ? 13 : 12,
            fontWeight: featured ? 700 : 400,
            color: T.muted,
          }}
        >
          {sub}
        </p>
      </div>

      {/* Optional progress bar */}
      {progress !== undefined && (
        <div>
          <div
            style={{
              height: featured ? 8 : 6,
              background: T.oat,
              borderRadius: 100,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${progressColor}, ${progressColor}cc)`,
                borderRadius: 100,
                width: visible ? `${Math.round((progressValue ?? 0) * 100)}%` : '0%',
                transition: `width 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${delay + 300}ms`,
              }}
            />
          </div>
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 11,
              color: T.muted,
              marginTop: 6,
            }}
          >
            {Math.round((progressValue ?? 0) * 100)}% dari target
          </p>
        </div>
      )}
    </div>
  )
}

function StatsRow({ summary }: { summary: DashboardSummary }) {
  const visible = useMount()

  const cards: StatCardProps[] = [
    {
      emoji: '🥛',
      value: `${formatOz(summary.totalOz)} oz`,
      label: 'Total Output',
      sub: `Target: ${summary.targetOz} oz`,
      progress: summary.totalOz / summary.targetOz,
      progressColor: T.sage,
      accentColor: T.sageDeep,
      featured: true,
      visible,
      delay: 0,
    },
    {
      emoji: '✅',
      value: `${summary.sessionsDone} / ${summary.totalSessions}`,
      label: 'Sesi Selesai',
      sub: `${summary.totalSessions - summary.sessionsDone} sesi tersisa`,
      progress: summary.sessionsDone / summary.totalSessions,
      progressColor: T.rose,
      accentColor: T.roseDeep,
      visible,
      delay: 80,
    },
    {
      emoji: '⏱️',
      value: `${summary.avgDurationMin} mnt`,
      label: 'Rata-rata',
      sub: 'Durasi per sesi',
      accentColor: T.amber,
      visible,
      delay: 160,
    },
    {
      emoji: '🔥',
      value: `${summary.streakDays} hari`,
      label: 'Streak',
      sub: 'Terus semangat, Bunda!',
      accentColor: T.sky,
      visible,
      delay: 240,
    },
  ]
  const remainingOz = Math.max(0, summary.targetOz - summary.totalOz)

  return (
    <section
      style={{
        background: T.cream,
        padding: '0 24px 28px',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          background: 'var(--ep-summary-shell)',
          border: `1px solid ${T.hairline}`,
          borderRadius: 24,
          padding: '18px',
          boxShadow: 'var(--ep-summary-shadow)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            marginBottom: 14,
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: T.muted,
            }}
          >
            Ringkasan Hari Ini
          </p>
          <span
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 12,
              fontWeight: 700,
              color: T.sageDeep,
              background: 'rgba(71,126,112,0.1)',
              border: '1px solid rgba(71,126,112,0.16)',
              borderRadius: 999,
              padding: '5px 10px',
            }}
          >
            {formatOz(remainingOz)} oz lagi
          </span>
        </div>

        <div
          className="ep-summary-grid"
          style={{
            display: 'grid',
            gap: 12,
          }}
        >
          {cards.map((card) => (
            /* stagger wrapper */
            <div
              key={card.label}
              className={card.featured ? 'ep-summary-card-featured' : undefined}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(14px)',
                transition: `opacity 0.5s ease ${card.delay}ms, transform 0.5s ease ${card.delay}ms`,
                display: 'flex',
                height: '100%',
              }}
            >
              <StatCard {...card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   SECTION 3 — SESSION TIMELINE
   ============================================================ */

const STATUS_CFG = {
  done: {
    dot: T.sageDeep,
    dotBg: 'rgba(71,126,112,0.12)',
    icon: '✓',
    timeColor: T.ink,
    labelColor: T.softInk,
  },
  overdue: {
    dot: T.amber,
    dotBg: 'rgba(232,168,124,0.15)',
    icon: '!',
    timeColor: T.amber,
    labelColor: T.amberDeep,
  },
  upcoming: {
    dot: T.sky,
    dotBg: 'rgba(166,200,217,0.14)',
    icon: '◷',
    timeColor: T.muted,
    labelColor: T.muted,
  },
} as const

function SessionRow({ session, isLast }: { session: Session; isLast: boolean }) {
  const cfg = STATUS_CFG[session.status]
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 10px',
        borderBottom: isLast ? 'none' : `1px solid ${T.hairline}`,
        background: hovered
          ? session.status === 'overdue'
            ? 'rgba(232,168,124,0.06)'
            : 'rgba(45,42,38,0.018)'
          : 'transparent',
        borderRadius: 10,
        transition: 'background 200ms ease',
        gap: 12,
        margin: '0 -10px',
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: cfg.dotBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: session.status === 'done' ? 12 : 11,
          fontWeight: 800,
          color: cfg.dot,
          fontFamily: 'Nunito Sans, sans-serif',
        }}
      >
        {cfg.icon}
      </div>

      {/* Time */}
      <span
        style={{
          fontFamily: 'Nunito Sans, sans-serif',
          fontWeight: 700,
          fontSize: 14,
          color: cfg.timeColor,
          fontVariantNumeric: 'tabular-nums',
          width: 44,
          flexShrink: 0,
        }}
      >
        {session.time}
      </span>

      {/* Label / details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {session.status === 'done' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                color: T.ink,
              }}
            >
              {formatSessionVolume(session)}
            </span>
            <span
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 12,
                color: T.muted,
              }}
            >
              · {session.durationMin ?? 0} mnt
            </span>
          </div>
        )}
        {session.status === 'overdue' && (
          <span
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontWeight: 600,
              fontSize: 13,
              color: cfg.labelColor,
            }}
          >
            Terlewat {session.overdueMin} menit
          </span>
        )}
        {session.status === 'upcoming' && (
          <span
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 13,
              color: T.muted,
            }}
          >
            Akan datang
          </span>
        )}
      </div>

      {/* Action / badge */}
      {session.status === 'done' && (
        <span
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: T.sageDeep,
            background: 'rgba(71,126,112,0.1)',
            borderRadius: 20,
            padding: '3px 10px',
            flexShrink: 0,
          }}
        >
          Selesai
        </span>
      )}
      {session.status === 'overdue' && (
        <button
          type="button"
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            color: '#FFFFFF',
            background: T.amber,
            border: 'none',
            borderRadius: 8,
            padding: '5px 13px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Catat
        </button>
      )}
      {session.status === 'upcoming' && session.id === 5 && (
        <button
          type="button"
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            color: T.roseDeep,
            background: 'rgba(143,188,235,0.15)',
            border: `1px solid rgba(143,188,235,0.4)`,
            borderRadius: 8,
            padding: '5px 13px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Mulai
        </button>
      )}
    </div>
  )
}

function SessionTimeline({ sessions }: { sessions: Session[] }) {
  const visible = useMount()
  const [geserHover, setGeserHover] = useState(false)

  const doneSessions = sessions.filter((s) => s.status === 'done').length
  const overdueSessions = sessions.filter((s) => s.status === 'overdue').length
  const upcomingSessions = sessions.filter((s) => s.status === 'upcoming').length
  const lastSession = sessions[sessions.length - 1]

  const legend = [
    { label: `${doneSessions} selesai`, color: T.sageDeep },
    { label: `${overdueSessions} terlewat`, color: T.amber },
    { label: `${upcomingSessions} akan datang`, color: T.sky },
  ]

  return (
    <section
      style={{
        background: T.cream,
        padding: '0 24px 52px',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: T.muted,
            marginBottom: 14,
          }}
        >
          Jadwal Hari Ini
        </p>

        <div
          style={{
            background: T.warmWhite,
            border: `1px solid ${T.hairline}`,
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 2px 16px rgba(45,42,38,0.05)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.55s ease 0.1s, transform 0.55s ease 0.1s',
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: '15px 20px',
              borderBottom: `1px solid ${T.hairline}`,
              background: T.sand,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15 }}>📅</span>
              <span
                style={{
                  fontFamily: 'Kalam, cursive',
                  fontWeight: 700,
                  fontSize: 16,
                  color: T.ink,
                }}
              >
                {sessions.length} Sesi Hari Ini
              </span>
            </div>

            {/* Mini legend badges */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {legend.map(({ label, color }) => (
                <span
                  key={label}
                  style={{
                    fontFamily: 'Nunito Sans, sans-serif',
                    fontSize: 11,
                    fontWeight: 700,
                    color,
                    background: `${color}1A`,
                    borderRadius: 20,
                    padding: '3px 9px',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Session rows */}
          <div style={{ padding: '6px 20px 6px' }}>
            {sessions.map((session, i) => (
              <SessionRow
                key={session.id}
                session={session}
                isLast={i === sessions.length - 1}
              />
            ))}
          </div>

          {/* Card footer */}
          <div
            style={{
              padding: '14px 20px 16px',
              borderTop: `1px solid ${T.hairline}`,
              background: T.sand,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 12,
                color: T.muted,
              }}
            >
              Interval tiap 3 jam · Sesi terakhir {lastSession?.time ?? '-'}
            </p>

            <button
              type="button"
              onMouseEnter={() => setGeserHover(true)}
              onMouseLeave={() => setGeserHover(false)}
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: geserHover ? T.roseDeep : T.softInk,
                background: 'transparent',
                border: `1.5px solid ${geserHover ? T.rose : T.hairline}`,
                borderRadius: 9,
                padding: '7px 16px',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
            >
              Geser Jadwal →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   DASHBOARD PAGE ROOT
   ============================================================ */

/* ============================================================
   TIMER RING  (inside overlay)
   ============================================================ */

function TimerRing({ elapsed, visible }: { elapsed: number; visible: boolean }) {
  const SIZE   = 240
  const STROKE = 12
  const R      = (SIZE - STROKE) / 2       // 114
  const C      = 2 * Math.PI * R            // ≈ 716.3

  const progress   = Math.min(1, elapsed / SESSION_TARGET_SEC)
  const dashOffset = C * (1 - progress)
  const ringColor  =
    progress < 0.5  ? T.sage
    : progress < 0.85 ? T.amber
    : T.rose

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* track */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none" stroke={D.glass} strokeWidth={STROKE}
        />
        {/* progress arc */}
        <circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeDasharray={C}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.8s ease',
            filter: `drop-shadow(0 0 10px ${ringColor}88)`,
          }}
        />
      </svg>

      {/* Center digits */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <span style={{
          fontFamily: 'Nunito Sans, sans-serif',
          fontWeight: 800,
          fontSize: elapsed >= 3600 ? 38 : 54,
          color: D.text,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: 2, lineHeight: 1,
        }}>
          {visible ? formatElapsed(elapsed) : '00:00'}
        </span>
        <span style={{
          fontFamily: 'Nunito Sans, sans-serif',
          fontSize: 11, fontWeight: 600,
          color: D.muted, letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          {Math.floor(elapsed / 60)} / 20 mnt
        </span>
      </div>
    </div>
  )
}

/* ============================================================
   ACTIVE TIMER OVERLAY
   ============================================================ */

function ActiveTimerOverlay({
  completedCount,
  visible,
  onClose,
  onSave,
}: {
  completedCount: number
  visible: boolean
  onClose: () => void
  onSave: (result: TimerSessionResult) => void
}) {
  const [show,             setShow]             = useState(false)
  const [phase,            setPhase]            = useState<TimerPhase>('running')
  const [side,             setSide]             = useState<PumpSide>('keduanya')
  const [volume,           setVolume]           = useState('')
  const [unit,             setUnit]             = useState<'oz' | 'ml'>('oz')
  const [elapsed,          setElapsed]          = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  // Animate in + reset every open
  useEffect(() => {
    if (visible) {
      setPhase('running')
      setSide('keduanya')
      setVolume('')
      setUnit('oz')
      setElapsed(0)
      setSessionStartTime(new Date())
      const t = setTimeout(() => setShow(true), 20)
      return () => clearTimeout(t)
    }
    setShow(false)
  }, [visible])

  // Tick only when running
  useEffect(() => {
    if (!visible || phase !== 'running') return
    const id = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [visible, phase])

  const togglePause = () =>
    setPhase(p => (p === 'running' ? 'paused' : 'running'))
  const handleStop    = () => setPhase('logging')
  const handleSave    = () => {
    if (!sessionStartTime) return onClose()
    onSave({
      startedAt: sessionStartTime,
      endedAt: new Date(),
      elapsedSec: elapsed,
      side,
      volume,
      unit,
    })
    onClose()
  }
  const handleSkipLog = () => onClose()

  const startedAtStr = sessionStartTime
    ? `${String(sessionStartTime.getHours()).padStart(2, '0')}:${String(sessionStartTime.getMinutes()).padStart(2, '0')}`
    : '--:--'

  const statusLabel =
    phase === 'running' ? 'Sesi Berlangsung'
    : phase === 'paused'  ? 'Dijeda'
    : 'Catat Hasil'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      pointerEvents: visible ? 'all' : 'none',
    }}>
      {/* Dim backdrop */}
      <div
        onClick={phase === 'logging' ? handleSkipLog : undefined}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          opacity: show ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sheet — slides up */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        background: D.bg,
        borderRadius: '28px 28px 0 0',
        display: 'flex', flexDirection: 'column',
        maxHeight: '96vh', overflow: 'hidden',
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>

        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
          <div style={{ width: 36, height: 4, background: D.hairline, borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ padding: '12px 24px 0', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: phase === 'running' ? T.sage : D.muted,
              display: 'inline-block', flexShrink: 0,
              boxShadow: phase === 'running' ? `0 0 0 4px ${T.sage}28` : 'none',
              transition: 'all 0.4s ease',
            }} />
            <span style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 11, fontWeight: 700,
              color: D.muted, letterSpacing: 1.8,
              textTransform: 'uppercase',
            }}>
              {statusLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: D.glass, border: `1px solid ${D.hairline}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: D.muted, flexShrink: 0,
              fontFamily: 'Nunito Sans, sans-serif', fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        {/* Ring + session info */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '28px 24px 16px', gap: 16,
        }}>
          <TimerRing elapsed={elapsed} visible={visible} />
          <p style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 13, color: D.muted, textAlign: 'center',
          }}>
            Dimulai {startedAtStr} · Sesi ke-{completedCount + 1} hari ini
          </p>
        </div>

        {/* Side selector */}
        <div style={{ padding: '0 24px 20px' }}>
          <p style={{
            fontFamily: 'Nunito Sans, sans-serif',
            fontSize: 10, fontWeight: 700, color: D.muted,
            letterSpacing: 2, textTransform: 'uppercase',
            marginBottom: 10, textAlign: 'center',
          }}>
            Sisi Pumping
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {PUMP_SIDES.map(({ id, label }) => {
              const active = side === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSide(id)}
                  style={{
                    flex: 1,
                    fontFamily: 'Nunito Sans, sans-serif',
                    fontSize: 13, fontWeight: 700,
                    color: active ? '#1B2A3D' : D.muted,
                    background: active ? T.rose : D.glass,
                    border: `1px solid ${active ? T.rose : D.hairline}`,
                    borderRadius: 12, padding: '11px 4px',
                    cursor: 'pointer', transition: 'all 200ms ease',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Action area */}
        <div style={{
          borderTop: `1px solid ${D.hairline}`,
          padding: '20px 24px 32px',
        }}>
          {phase !== 'logging' ? (
            /* Running / Paused */
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={togglePause}
                style={{
                  flex: 1,
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontSize: 15, fontWeight: 700,
                  color: D.text,
                  background: D.glass, border: `1.5px solid ${D.subtle}`,
                  borderRadius: 14, padding: '15px 0',
                  cursor: 'pointer', transition: 'all 200ms ease',
                }}
              >
                {phase === 'paused' ? '▶ Lanjutkan' : '⏸ Jeda'}
              </button>
              <button
                type="button"
                onClick={handleStop}
                style={{
                  flex: 2,
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontSize: 15, fontWeight: 700,
                  color: '#1B2A3D',
                  background: T.rose, border: 'none',
                  borderRadius: 14, padding: '15px 0',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(143,188,235,0.28)',
                  transition: 'all 200ms ease',
                }}
              >
                ⏹ Stop & Catat
              </button>
            </div>
          ) : (
            /* Logging */
            <div>
              <p style={{
                fontFamily: 'Kalam, cursive', fontWeight: 700,
                fontSize: 18, color: D.text,
                textAlign: 'center', marginBottom: 16,
              }}>
                Berapa hasilnya, Bunda? 🥛
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <input
                  // biome-ignore lint/a11y/noAutofocus: intentional UX in a modal
                  autoFocus
                  type="number"
                  inputMode="decimal"
                  value={volume}
                  onChange={e => setVolume(e.target.value)}
                  placeholder="0.0"
                  style={{
                    flex: 1,
                    fontFamily: 'Kalam, cursive', fontWeight: 700, fontSize: 44,
                    color: volume ? D.text : D.muted,
                    background: D.glass,
                    border: `1.5px solid ${volume ? D.subtle : D.hairline}`,
                    borderRadius: 14, padding: '10px 16px',
                    outline: 'none', textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                    transition: 'border-color 200ms ease',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  {(['oz', 'ml'] as const).map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      style={{
                        fontFamily: 'Nunito Sans, sans-serif',
                        fontSize: 13, fontWeight: 700,
                        color: unit === u ? '#1B2A3D' : D.muted,
                        background: unit === u ? T.sage : D.glass,
                        border: `1px solid ${unit === u ? T.sage : D.hairline}`,
                        borderRadius: 8, padding: '7px 16px',
                        cursor: 'pointer', transition: 'all 150ms ease',
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleSkipLog}
                  style={{
                    flex: 1,
                    fontFamily: 'Nunito Sans, sans-serif',
                    fontSize: 14, fontWeight: 600,
                    color: D.muted, background: 'transparent',
                    border: `1.5px solid ${D.hairline}`,
                    borderRadius: 12, padding: '13px 0',
                    cursor: 'pointer',
                  }}
                >
                  Lewati
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    flex: 3,
                    fontFamily: 'Nunito Sans, sans-serif',
                    fontSize: 15, fontWeight: 700,
                    color: volume ? '#1B2A3D' : D.muted,
                    background: volume ? T.rose : D.glass,
                    border: `1.5px solid ${volume ? T.rose : D.hairline}`,
                    borderRadius: 12, padding: '13px 0',
                    cursor: 'pointer', transition: 'all 250ms ease',
                    boxShadow: volume ? '0 6px 20px rgba(143,188,235,0.28)' : 'none',
                  }}
                >
                  ✓ Simpan{volume ? ` ${volume} ${unit}` : ' Sesi'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   PUMP MODE TABS
   ============================================================ */

type PumpMode = 'normal' | 'power'

const MODE_STORAGE_KEY = 'epingjourney:pump-mode'

const PUMP_MODES: { id: PumpMode; label: string; emoji: string }[] = [
  { id: 'normal', label: 'Normal', emoji: '🍼' },
  { id: 'power',  label: 'Power',  emoji: '⚡' },
]

function PumpModeTabs({
  mode,
  onChange,
}: {
  mode: PumpMode
  onChange: (next: PumpMode) => void
}) {
  return (
    <div
      style={{
        background: T.cream,
        padding: '20px 24px 0',
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          gap: 6,
          background: 'rgba(255,255,255,0.7)',
          border: `1px solid ${T.hairline}`,
          borderRadius: 14,
          padding: 5,
          width: 'fit-content',
        }}
        role="tablist"
        aria-label="Mode pumping"
      >
        {PUMP_MODES.map(({ id, label, emoji }) => {
          const active = mode === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(id)}
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: active ? T.ink : T.muted,
                background: active ? T.warmWhite : 'transparent',
                border: active ? `1px solid ${T.hairline}` : '1px solid transparent',
                borderRadius: 10,
                padding: '8px 18px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: active ? '0 2px 6px rgba(45,42,38,0.06)' : 'none',
                transition: 'all 200ms ease',
              }}
            >
              <span style={{ fontSize: 14 }}>{emoji}</span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   NORMAL PUMP VIEW
   ============================================================ */

interface NormalSummary {
  totalOz: number
  sessionsDone: number
  avgDurationMin: number
}

function createNormalSummary(logs: PumpLog[]): NormalSummary {
  const totalOz = logs.reduce((sum, log) => sum + (log.volumeOz ?? 0), 0)
  const avgDurationMin = logs.length
    ? Math.round(logs.reduce((sum, log) => sum + log.durationMin, 0) / logs.length)
    : 0
  return {
    totalOz: Math.round(totalOz * 10) / 10,
    sessionsDone: logs.length,
    avgDurationMin,
  }
}

function sideLabel(side: PumpSide) {
  switch (side) {
    case 'kiri':     return 'Kiri'
    case 'kanan':    return 'Kanan'
    case 'keduanya': return 'Keduanya'
  }
}

function formatLogVolume(log: PumpLog) {
  if (log.volumeAmount === null) return 'Tidak dicatat'
  const value = log.unit === 'oz'
    ? formatSessionOz(log.volumeAmount)
    : String(Math.round(log.volumeAmount))
  return `${value} ${log.unit}`
}

function NormalPumpView({
  logs,
  onStartTimer,
}: {
  logs: PumpLog[]
  onStartTimer: () => void
}) {
  const mounted = useMount()
  const now = useCurrentTime()
  const [primaryHover, setPrimaryHover] = useState(false)
  const summary = useMemo(() => createNormalSummary(logs), [logs])

  const greeting = now ? getGreeting(now.getHours()) : { text: 'Halo', emoji: '👋' }
  const dateStr = now
    ? now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '–'

  // newest first
  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => b.startTime.localeCompare(a.startTime)),
    [logs],
  )

  return (
    <main style={{ background: T.cream, minHeight: '100vh' }}>
      {/* Greeting + Date */}
      <section style={{ padding: '28px 24px 8px' }}>
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: T.sageDeep,
              letterSpacing: 0.4,
              marginBottom: 4,
            }}
          >
            {greeting.emoji} {greeting.text}
          </p>
          <h1
            style={{
              fontFamily: 'Kalam, cursive',
              fontWeight: 700,
              fontSize: 'clamp(26px, 4vw, 36px)',
              color: T.ink,
              lineHeight: 1.2,
              marginBottom: 4,
            }}
          >
            Bunda 👋
          </h1>
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 13,
              color: T.muted,
              textTransform: 'capitalize',
            }}
          >
            {dateStr}
          </p>
        </div>
      </section>

      {/* Daily Total Card */}
      <section style={{ padding: '20px 24px 8px' }}>
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            background: `linear-gradient(145deg, ${T.warmWhite} 0%, ${T.sand} 100%)`,
            border: `1px solid ${T.hairline}`,
            borderRadius: 20,
            padding: '22px 24px',
            boxShadow: '0 10px 30px rgba(45,42,38,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s',
          }}
        >
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: `${T.sageDeep}18`,
              border: `1px solid ${T.sageDeep}2E`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            🥛
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 11,
                fontWeight: 700,
                color: T.muted,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Total Hari Ini
            </p>
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(28px, 4vw, 38px)',
                color: T.ink,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                marginBottom: 4,
              }}
            >
              {formatOz(summary.totalOz)} oz
            </p>
            <p
              style={{
                fontFamily: 'Nunito Sans, sans-serif',
                fontSize: 13,
                color: T.muted,
              }}
            >
              {summary.sessionsDone} sesi · rata-rata {summary.avgDurationMin} menit
            </p>
          </div>
        </div>
      </section>

      {/* Big Start Button */}
      <section style={{ padding: '20px 24px 8px' }}>
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.5s ease 0.18s, transform 0.5s ease 0.18s',
          }}
        >
          <button
            type="button"
            onMouseEnter={() => setPrimaryHover(true)}
            onMouseLeave={() => setPrimaryHover(false)}
            onClick={onStartTimer}
            style={{
              width: '100%',
              fontFamily: 'Nunito Sans, sans-serif',
              fontWeight: 700,
              fontSize: 17,
              padding: '20px 24px',
              borderRadius: 18,
              cursor: 'pointer',
              border: 'none',
              background: primaryHover ? T.roseDeep : T.rose,
              color: '#FFFFFF',
              boxShadow: primaryHover
                ? '0 14px 32px rgba(47,117,184,0.32)'
                : '0 8px 22px rgba(143,188,235,0.30)',
              transition: 'all 200ms ease',
              transform: primaryHover ? 'translateY(-1px)' : 'translateY(0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>▶</span>
            Mulai Pumping
          </button>
        </div>
      </section>

      {/* Today's Logs */}
      <section style={{ padding: '20px 24px 36px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'Nunito Sans, sans-serif',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: T.muted,
              marginBottom: 12,
            }}
          >
            Sesi Hari Ini
          </p>

          {sortedLogs.length === 0 ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.62)',
                border: `1px dashed ${T.hairline}`,
                borderRadius: 16,
                padding: '32px 20px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 28, marginBottom: 8 }}>🌿</p>
              <p
                style={{
                  fontFamily: 'Kalam, cursive',
                  fontWeight: 700,
                  fontSize: 16,
                  color: T.softInk,
                  marginBottom: 4,
                }}
              >
                Belum ada sesi hari ini
              </p>
              <p
                style={{
                  fontFamily: 'Nunito Sans, sans-serif',
                  fontSize: 13,
                  color: T.muted,
                }}
              >
                Tekan "Mulai Pumping" untuk memulai sesi pertama Bunda.
              </p>
            </div>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                background: 'rgba(255,255,255,0.7)',
                border: `1px solid ${T.hairline}`,
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {sortedLogs.map((log, index) => (
                <li
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    borderTop: index === 0 ? 'none' : `1px solid ${T.hairline}`,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${T.rose}28`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'Nunito Sans, sans-serif',
                      fontWeight: 800,
                      fontSize: 13,
                      color: T.roseDeep,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: 0.5,
                    }}
                  >
                    {log.time}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: 'Nunito Sans, sans-serif',
                        fontWeight: 700,
                        fontSize: 14,
                        color: T.ink,
                        marginBottom: 2,
                      }}
                    >
                      {formatLogVolume(log)}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Nunito Sans, sans-serif',
                        fontSize: 12,
                        color: T.muted,
                      }}
                    >
                      {log.durationMin} menit · {sideLabel(log.side)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}

/* ============================================================
   POWER PUMP VIEW (existing scheduled flow)
   ============================================================ */

function PowerPumpView({
  logs,
  onStartTimer,
}: {
  logs: PumpLog[]
  onStartTimer: () => void
}) {
  const now = useCurrentTime()
  const sessions = useMemo(() => createSessions(logs, now ?? new Date()), [logs, now])
  const summary = useMemo(() => createSummary(sessions), [sessions])
  const nextSession = nextActionableSession(sessions)

  return (
    <main style={{ background: T.cream, minHeight: '100vh' }}>
      <WelcomeSection
        sessions={sessions}
        nextSession={nextSession}
        onStartTimer={onStartTimer}
      />
      <StatsRow summary={summary} />
      <SessionTimeline sessions={sessions} />
    </main>
  )
}

/* ============================================================
   DASHBOARD PAGE ROOT
   ============================================================ */

function loadInitialMode(): PumpMode {
  if (typeof window === 'undefined') return 'normal'
  const stored = window.localStorage.getItem(MODE_STORAGE_KEY)
  return stored === 'power' ? 'power' : 'normal'
}

export function DashboardPage() {
  const [mode, setMode] = useState<PumpMode>(loadInitialMode)
  const [timerVisible, setTimerVisible] = useState(false)
  const [powerLogs, setPowerLogs] = useState<PumpLog[]>([])
  const [normalLogs, setNormalLogs] = useState<PumpLog[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(MODE_STORAGE_KEY, mode)
  }, [mode])

  const handleSaveTimerSession = (result: TimerSessionResult) => {
    const parsedVolume = Number.parseFloat(result.volume.replace(',', '.'))
    const volumeOz = volumeToOz(result.volume, result.unit)
    const durationMin = Math.max(1, Math.round(result.elapsedSec / 60))

    if (mode === 'power') {
      const powerSessions = createSessions(powerLogs, new Date())
      const nextSession = nextActionableSession(powerSessions)
      const scheduledTime = nextSession?.time ?? formatClock(result.startedAt)
      const completedLog: PumpLog = {
        id: Date.now(),
        time: scheduledTime,
        volumeAmount: Number.isFinite(parsedVolume) ? parsedVolume : null,
        volumeOz,
        durationMin,
        unit: result.unit,
        side: result.side,
        startTime: result.startedAt.toISOString(),
        endTime: result.endedAt.toISOString(),
      }
      setPowerLogs((current) => [
        ...current.filter((log) => log.time !== scheduledTime),
        completedLog,
      ])
      return
    }

    // Normal mode: each session is its own ad-hoc log
    const completedLog: PumpLog = {
      id: Date.now(),
      time: formatClock(result.startedAt),
      volumeAmount: Number.isFinite(parsedVolume) ? parsedVolume : null,
      volumeOz,
      durationMin,
      unit: result.unit,
      side: result.side,
      startTime: result.startedAt.toISOString(),
      endTime: result.endedAt.toISOString(),
    }
    setNormalLogs((current) => [...current, completedLog])
  }

  const overlayCompletedCount =
    mode === 'power'
      ? createSummary(createSessions(powerLogs, new Date())).sessionsDone
      : normalLogs.length

  return (
    <>
      <DashboardNav />
      <PumpModeTabs mode={mode} onChange={setMode} />
      {mode === 'normal' ? (
        <NormalPumpView
          logs={normalLogs}
          onStartTimer={() => setTimerVisible(true)}
        />
      ) : (
        <PowerPumpView
          logs={powerLogs}
          onStartTimer={() => setTimerVisible(true)}
        />
      )}
      <ActiveTimerOverlay
        completedCount={overlayCompletedCount}
        visible={timerVisible}
        onClose={() => setTimerVisible(false)}
        onSave={handleSaveTimerSession}
      />
    </>
  )
}
