import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Clock3, MapPin, Sparkles, Store } from 'lucide-react'
import hotpot from '@/assets/hotpot.jpg'
import { Button } from '@/components/ui/button'
import { WELCOME_COUNTDOWN_CONFIG } from '@/config/countdown'
import { tableAreas } from '@/data/menu'

interface WelcomeViewProps {
  table: string
  onEnter: () => void
}

type CountdownUnit = 'days' | 'hours' | 'minutes' | 'seconds'

interface CountdownState {
  isFinished: boolean
  values: Record<CountdownUnit, number>
}

const targetTimeMs = new Date(WELCOME_COUNTDOWN_CONFIG.targetTimeIso).getTime()
const countdownUnits: CountdownUnit[] = ['days', 'hours', 'minutes', 'seconds']

function getCountdownState(nowMs: number): CountdownState {
  if (nowMs >= targetTimeMs) {
    return {
      isFinished: true,
      values: { days: 0, hours: 0, minutes: 0, seconds: 0 },
    }
  }

  const totalSeconds = Math.ceil((targetTimeMs - nowMs) / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    isFinished: false,
    values: { days, hours, minutes, seconds },
  }
}

function useWelcomeCountdown() {
  const [countdown, setCountdown] = useState(() => getCountdownState(Date.now()))

  useEffect(() => {
    const updateCountdown = () => setCountdown(getCountdownState(Date.now()))

    updateCountdown()
    const timer = window.setInterval(updateCountdown, WELCOME_COUNTDOWN_CONFIG.refreshIntervalMs)

    return () => window.clearInterval(timer)
  }, [])

  return countdown
}

export function WelcomeView({ table, onEnter }: WelcomeViewProps) {
  const { t } = useTranslation()
  const areaKey = tableAreas[table]
  const tableLabel = areaKey ? `${table} · ${t(areaKey)}` : table
  const countdown = useWelcomeCountdown()

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-rice-100 paper-noise">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-chili-100 blur-3xl" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-amber-100 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md px-5 py-10">
        <section className="animate-rise overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-float backdrop-blur">
          {/* 门店图片 */}
          <div className="relative h-48 overflow-hidden sm:h-56">
            <img src={hotpot} alt={t('welcome.img_alt')} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
              <div className="flex items-center gap-2">
                <Store size={18} className="opacity-80" />
                <div>
                  <p className="text-xs opacity-80">{t('common.simulated_store')}</p>
                  <h2 className="text-lg font-bold">{t('common.store_name')}</h2>
                </div>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">{t('common.open')}</span>
            </div>
          </div>

          {/* 问候语 */}
          <div className="px-6 py-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-chili-500/20 bg-chili-50 px-3 py-1.5 text-xs font-bold text-chili-600">
              <Sparkles size={13} /> {t('welcome.badge')}
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-charcoal-900 sm:text-4xl">
              {t('welcome.title')}
            </h1>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-base font-semibold text-charcoal-500">
              <MapPin size={16} className="text-chili-500" />
              {t('welcome.you_at')} {tableLabel}
            </p>

            <div
              data-testid="welcome-countdown"
              className="mt-6 rounded-2xl border border-amber-400/30 bg-rice-50/95 p-4 text-left shadow-inner shadow-amber-100/60 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                  <Clock3 size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-500">
                    {t('welcome.countdown.badge')}
                  </p>
                  <h2 className="mt-1 text-base font-extrabold text-charcoal-900">
                    {t('welcome.countdown.title')}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-charcoal-500">
                    {t('welcome.countdown.desc')}
                  </p>
                </div>
              </div>

              {countdown.isFinished ? (
                <p
                  role="status"
                  className="mt-4 rounded-2xl bg-chili-50 px-4 py-3 text-center text-sm font-bold leading-relaxed text-chili-700"
                >
                  {t('welcome.countdown.ended')}
                </p>
              ) : (
                <div
                  role="timer"
                  aria-live="polite"
                  aria-label={t('welcome.countdown.remaining_label', countdown.values)}
                  className="mt-4 grid grid-cols-4 gap-2"
                >
                  {countdownUnits.map((unit) => (
                    <div
                      key={unit}
                      className="min-w-0 rounded-2xl border border-charcoal-900/5 bg-white/90 px-1.5 py-3 text-center shadow-sm"
                    >
                      <span
                        data-testid={`countdown-${unit}`}
                        className="block font-mono text-xl font-black leading-none text-charcoal-900 tabular-nums sm:text-2xl"
                      >
                        {String(countdown.values[unit]).padStart(2, '0')}
                      </span>
                      <span className="mt-1.5 block truncate text-[11px] font-bold text-charcoal-500">
                        {t(`welcome.countdown.${unit}`)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 进入点餐按钮 */}
          <div className="px-6 pb-7">
            <Button onClick={onEnter} className="w-full">
              {t('welcome.enter')}
              <ArrowRight size={17} />
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
