'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

type Status = 'idle' | 'sending' | 'sent' | 'error'

// Same wiring as before the redesign: formsubmit.co AJAX endpoint, fields
// _subject, name and message.
export function ContactForm() {
  const t = useTranslations('contact')
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    try {
      const response = await fetch('https://formsubmit.co/ajax/lnlohith3@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      const data = await response.json()
      if (data.success === 'true' || data.success === true) {
        setStatus('sent')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const sending = status === 'sending'

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input type="hidden" name="_subject" value="New Portfolio Message!" />
      <label htmlFor="cf-name">{t('form_name')}</label>
      <input id="cf-name" name="name" type="text" autoComplete="name" required />
      <label htmlFor="cf-message">{t('form_message')}</label>
      <textarea id="cf-message" name="message" rows={4} required />
      <div className="form__row">
        <button className="btn btn--light" type="submit" disabled={sending} aria-busy={sending}>
          {sending ? t('form_sending') : t('form_send')}
        </button>
        <p className="form__help" aria-live="polite">
          {status === 'sent' && t('form_sent')}
          {status === 'error' && t('form_error')}
        </p>
      </div>
    </form>
  )
}
