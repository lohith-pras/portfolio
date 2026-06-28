'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function ContactSection() {
  const t = useTranslations('contact')
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [formStatus, setFormStatus] = useState<'idle' | 'transmitting' | 'success' | 'error'>('idle')

  // Section reveal: opacity-only
  useGSAP(
    () => {
      if (reduce || !ref.current) return
      gsap.from(ref.current, {
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 85%', once: true },
      })
    },
    { scope: ref, dependencies: [reduce] },
  )

  // SplitText line-mask reveal on the closing heading
  useGSAP(
    () => {
      if (reduce || !headingRef.current) return
      let split: SplitText | undefined
      let tween: gsap.core.Tween | undefined
      let killed = false
      document.fonts.ready.then(() => {
        if (killed || !headingRef.current) return
        split = SplitText.create(headingRef.current, { type: 'lines', mask: 'lines' })
        tween = gsap.from(split.lines, {
          yPercent: 110,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%', once: true },
        })
      })
      return () => {
        killed = true
        tween?.kill()
        split?.revert()
      }
    },
    { dependencies: [reduce] },
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormStatus('transmitting')

    const formData = new FormData(e.currentTarget)
    try {
      const response = await fetch('https://formsubmit.co/ajax/lnlohith3@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })

      if (response.ok) {
        setFormStatus('success')
        e.currentTarget.reset()
      } else {
        setFormStatus('error')
      }
    } catch (err) {
      setFormStatus('error')
    }
  }

  const links = [
    { label: 'EMAIL', href: 'mailto:lnlohith3@gmail.com', external: false },
    { label: 'GITHUB', href: 'https://github.com/lohith-pras', external: true },
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/loh-pras', external: true },
    { label: 'CV', href: '/Lohith_Prasanna_Resume.pdf', external: true },
  ]

  return (
    <div id="contact-container" ref={ref} className="relative z-10 w-full border-t border-rule bg-background">
      {/* Contact Section */}
      <section
        id="contact"
        className="min-h-screen flex flex-col justify-center px-6 md:px-16 py-16 bg-background"
      >
        <div className="max-w-6xl w-full mx-auto space-y-16">
          {/* Heading Block */}
          <div className="space-y-6">
            <p className="font-mono text-xs text-accent uppercase tracking-[0.5em] mb-4">
              {t('eyebrow')}
            </p>
            <h2
              ref={headingRef}
              className="relative font-body font-extrabold text-[clamp(2.5rem,8vw,6rem)] leading-[0.9] tracking-tighter text-beige max-w-4xl"
            >
              {t('heading')}
            </h2>
          </div>

          {/* Body Text & Form */}
          <div className="pt-4 space-y-8">
            <p className="font-mono text-foreground/60 text-xl md:text-2xl leading-relaxed max-w-2xl">
              {t('availability_subtext')}
            </p>

            {/* Quick Contact Form */}
            <form onSubmit={handleSubmit} className="max-w-xl space-y-6 pt-2">
              <input type="hidden" name="_subject" value="New Portfolio Message!" />

              <div className="space-y-4">
                {/* Sender Contact */}
                <div className="relative border-b border-rule focus-within:border-accent transition-colors duration-300 py-2">
                  <label className="block font-mono text-[10px] text-foreground/45 uppercase tracking-widest mb-1">
                    SENDER_IDENTITY
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="your name or call sign"
                    className="w-full bg-transparent border-none outline-none font-mono text-sm text-foreground placeholder-foreground/20 focus:ring-0 p-0"
                  />
                </div>

                {/* Message Payload */}
                <div className="relative border-b border-rule focus-within:border-accent transition-colors duration-300 py-2">
                  <label className="block font-mono text-[10px] text-foreground/45 uppercase tracking-widest mb-1">
                    MESSAGE_PAYLOAD
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={2}
                    placeholder="Type your message here..."
                    className="w-full bg-transparent border-none outline-none font-mono text-sm text-foreground placeholder-foreground/20 focus:ring-0 p-0 resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={formStatus === 'transmitting'}
                  className="inline-flex items-center gap-2 min-h-[40px] rounded-full border border-accent bg-accent/10 px-6 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formStatus === 'transmitting' ? 'Broadcasting...' : 'Transmit Signal'}
                  <span aria-hidden="true">→</span>
                </button>

                {/* Status Indicator */}
                <div className="font-mono text-[10px] flex items-center gap-2">
                  {formStatus === 'transmitting' && (
                    <>
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
                      <span className="text-yellow-500 uppercase tracking-widest">STATUS: BROADCASTING...</span>
                    </>
                  )}
                  {formStatus === 'success' && (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-green-500 uppercase tracking-widest">STATUS: ACK_RECEIVED (OK)</span>
                    </>
                  )}
                  {formStatus === 'error' && (
                    <>
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                      <span className="text-accent uppercase tracking-widest">STATUS: ERR_FAILED_RETRY</span>
                    </>
                  )}
                  {formStatus === 'idle' && (
                    <>
                      <span className="w-2 h-2 bg-foreground/30 rounded-full"></span>
                      <span className="text-foreground/40 uppercase tracking-widest">STATUS: AWAITING_INPUT</span>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Signal Transmission Node Array */}
          <div className="relative pt-44 pb-16 w-full">
            {/* The Background Line (Baseline) */}
            <div className="signal-line absolute bottom-[84px] left-0"></div>

            {/* Antenna Grid */}
            <div className="w-full flex justify-between items-end gap-4">
              {links.map(({ label, href, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="antenna-transmitter group relative flex flex-col items-center cursor-pointer"
                >
                  <div className="w-20 h-20 mb-[-5px]">
                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 40 40"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ overflow: 'visible' }}
                    >
                      <path
                        d="M20 35V15M12 35L20 15L28 35"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      />
                      <g className="signal-arcs" fill="none" stroke="var(--color-accent)" strokeLinecap="round" strokeWidth="1.5">
                        <path className="arc-1" d="M16 11C18 9 22 9 24 11" />
                        <path className="arc-2" d="M12 8C16 5 24 5 28 8" />
                        <path className="arc-3" d="M8 5C14 0 26 0 32 5" />
                      </g>
                    </svg>
                  </div>
                  <span className="contact-label font-mono text-xs tracking-widest text-foreground/60 uppercase mt-8 opacity-60 transition-all duration-300">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Aesthetic Ledger Section */}
      <section className="px-6 md:px-16 py-8 border-t border-rule bg-background">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-mono text-xs text-foreground/45 uppercase tracking-widest">
              {t('system_status')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
              <span className="font-mono text-xs text-foreground uppercase tracking-wider">
                {t('status_listening')}
              </span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="font-mono text-xs text-foreground/60 max-w-sm md:ml-auto">
              {t('latency_note')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
