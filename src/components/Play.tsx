'use client'

import { useEffect } from 'react'

// All the interactive bits: the kinetic name and the five exhibits.
// ponytail: plain DOM against the ids in page.tsx, one effect, one cleanup. Split into components if a stage grows state React needs to see.
export default function Play() {
  useEffect(() => {
    const ac = new AbortController(), signal = ac.signal
    const on = (el: EventTarget, type: string, fn: (e: never) => void) => el.addEventListener(type, fn as EventListener, { signal })
    const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T
    const timers: number[] = [], observers: IntersectionObserver[] = []
    let alive = true
    const frame = (fn: FrameRequestCallback) => requestAnimationFrame(t => alive && fn(t))

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    // canvases read the same tokens as the CSS: ON = hot, OFF = cold
    const cs = getComputedStyle(document.documentElement)
    const rgb = (k: string) => cs.getPropertyValue(k).trim().split(/\s+/).join(',')
    const C = { ink: rgb('--ink-rgb'), hot: rgb('--hot-rgb'), cold: rgb('--cold-rgb') }
    const HOT = `rgb(${C.hot})`, INK = `rgb(${C.ink})`, COLD = `rgb(${C.cold})`
    const DISPLAY = cs.getPropertyValue('--display').trim(), MONO = cs.getPropertyValue('--mono').trim()
    const fitCanvas = (c: HTMLCanvasElement): [CanvasRenderingContext2D, number, number] => {
      const r = c.getBoundingClientRect(), d = devicePixelRatio || 1
      c.width = r.width * d; c.height = r.height * d
      const x = c.getContext('2d')!; x.setTransform(d, 0, 0, d, 0, 0)
      return [x, r.width, r.height]
    }
    const observe = (el: Element, fn: (visible: boolean) => void, threshold = 0) => {
      const io = new IntersectionObserver(es => es.forEach(e => fn(e.isIntersecting)), { threshold })
      io.observe(el); observers.push(io)
    }

    // ── hero: each letter is light at rest and swells to full weight as the cursor comes near ──
    {
      const top = $('top'), letters = [...top.querySelectorAll<HTMLElement>('.name i')]
      let mouse: { x: number; y: number } | null = null
      const weights = (t: number) => letters.forEach((el, i) => {
        let wt
        if (mouse) {
          const r = el.getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - mouse.x, r.top + r.height / 2 - mouse.y)
          wt = 900 - 760 * Math.min(1, d / 520)
        } else wt = 520 + 380 * Math.sin(t * 1.1 - i * .7) // at rest a slow wave runs through the name
        el.style.fontVariationSettings = `'wght' ${wt.toFixed(0)}`
      })
      const loop = (now: number) => { weights(now / 1000); frame(loop) }
      on(top, 'pointermove', (e: PointerEvent) => { mouse = { x: e.clientX, y: e.clientY }; if (reduce) weights(0) })
      on(top, 'pointerleave', () => { mouse = null; if (reduce) weights(0) })
      if (reduce) weights(0); else frame(loop)
    }

    // ── 01 hold to unlock; let go and it falls back to locked ──
    {
      const btn = $('finger'), ring = $('ring'), lock = $('lock'), st = $('lockState'), note = $('lockNote')
      const LEN = 327, NEED = 1100
      // locked --press--> holding --1.1 s--> open --3 s--> locked; letting go while holding goes back to locked
      let state: 'locked' | 'holding' | 'open' = 'locked', t0 = 0, raf = 0
      const set = (k: number) => { ring.style.strokeDashoffset = String(LEN * (1 - k)) }
      const go = (next: typeof state) => {
        state = next
        lock.classList.toggle('open', next === 'open')
        st.textContent = next === 'open' ? 'Unlocked' : 'Locked'
        note.textContent = next === 'open' ? 'Motor allowed. Locks again in 3 s' : 'Let go and it locks again'
        if (next === 'locked') set(0)
        if (next === 'open') timers.push(window.setTimeout(() => go('locked'), 3000))
      }
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / NEED); set(k)
        if (k < 1) raf = frame(tick); else go('open')
      }
      const down = () => { if (state !== 'locked') return; state = 'holding'; t0 = performance.now(); raf = frame(tick) }
      const up = () => { if (state !== 'holding') return; cancelAnimationFrame(raf); go('locked') }
      on(btn, 'pointerdown', down); on(window, 'pointerup', up); on(btn, 'pointerleave', up)
      on(btn, 'keydown', (e: KeyboardEvent) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); down() } })
      on(btn, 'keyup', (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') up() })
    }

    // ── 02 the race: ten minutes against under one, at 30× speed ──
    {
      const fB = $('fBefore'), fA = $('fAfter'), tB = $('tBefore'), tA = $('tAfter')
      const SPEED = 30, BEFORE = 600, AFTER = 55 // seconds; "after" is under a minute
      const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
      let raf = 0
      const run = () => {
        cancelAnimationFrame(raf); const t0 = performance.now()
        const step = (now: number) => {
          const s = reduce ? BEFORE : (now - t0) / 1000 * SPEED
          const b = Math.min(s, BEFORE), a = Math.min(s, AFTER)
          fB.style.width = (b / BEFORE * 100) + '%'; fA.style.width = (a / AFTER * 100) + '%'
          tB.textContent = fmt(b); tA.textContent = a >= AFTER ? '< 1:00' : fmt(a)
          if (s < BEFORE) raf = frame(step)
        }
        raf = frame(step)
      }
      on($('raceBtn'), 'click', run)
      let ran = false
      observe($('race'), v => { if (v && !ran) { ran = true; run() } }, .4)
    }

    // ── 03 constellation: pick a modulation, slide the noise ──
    {
      const cv = $<HTMLCanvasElement>('iq'), snr = $<HTMLInputElement>('snr'), ro = $('snrRo')
      const SETS: Record<string, number[][]> = {
        bpsk: [[-1, 0], [1, 0]],
        qpsk: [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([i, q]) => [i / Math.SQRT2, q / Math.SQRT2]),
        qam16: [],
      }
      for (const i of [-3, -1, 1, 3]) for (const q of [-3, -1, 1, 3]) SETS.qam16.push([i / Math.sqrt(10), q / Math.sqrt(10)])
      let mod = 'qpsk'
      const gauss = () => Math.sqrt(-2 * Math.log(Math.random() || 1e-9)) * Math.cos(2 * Math.PI * Math.random())
      const draw = () => {
        const [ctx, w, h] = fitCanvas(cv)
        const cx = w / 2, cy = h / 2 - 16, sc = Math.min(w, h) * .3, db = +snr.value, sig = Math.sqrt(.5 / Math.pow(10, db / 10))
        ro.textContent = `${db} dB`
        ctx.strokeStyle = `rgba(${C.ink},.25)`; ctx.lineWidth = 1; ctx.beginPath()
        ctx.moveTo(cx - sc * 1.6, cy); ctx.lineTo(cx + sc * 1.6, cy); ctx.moveTo(cx, cy - sc * 1.6); ctx.lineTo(cx, cy + sc * 1.6); ctx.stroke()
        const S = SETS[mod]
        ctx.fillStyle = `rgba(${C.cold},.6)`
        for (let k = 0; k < 900; k++) { const [i, q] = S[k % S.length]; ctx.fillRect(cx + (i + gauss() * sig) * sc - 1.5, cy - (q + gauss() * sig) * sc - 1.5, 3, 3) }
        ctx.fillStyle = HOT; for (const [i, q] of S) ctx.fillRect(cx + i * sc - 5, cy - q * sc - 5, 10, 10)
      }
      const btns = document.querySelectorAll<HTMLButtonElement>('[data-m]')
      btns.forEach(b => on(b, 'click', () => { mod = b.dataset.m!; btns.forEach(x => x.setAttribute('aria-pressed', String(x === b))); draw() }))
      on(snr, 'input', draw); on(window, 'resize', draw)
      draw()
    }

    // ── 04 ISAC: four nodes, two users, one target you drag ──
    {
      const cv = $<HTMLCanvasElement>('isac')
      let w = 0, h = 0, T: number[] | null = null, drag = false
      const draw = () => {
        let ctx; [ctx, w, h] = fitCanvas(cv); if (!T) T = [w * .56, h * .42]
        const N = [[.18, .78], [.82, .78], [.18, .22], [.82, .22]].map(([x, y]) => [x * w, y * h])
        const U = [[.5, .86], [.08, .5]].map(([x, y]) => [x * w, y * h])
        // communication: each user served by its nearest node
        ctx.strokeStyle = COLD; ctx.lineWidth = 2
        for (const u of U) {
          const n = N.reduce((a, b) => Math.hypot(b[0] - u[0], b[1] - u[1]) < Math.hypot(a[0] - u[0], a[1] - u[1]) ? b : a)
          ctx.beginPath(); ctx.moveTo(n[0], n[1]); ctx.lineTo(u[0], u[1]); ctx.stroke()
        }
        // sensing: every node points a beam at the target
        for (const n of N) {
          const a = Math.atan2(T[1] - n[1], T[0] - n[0]), d = Math.hypot(T[0] - n[0], T[1] - n[1])
          ctx.fillStyle = `rgba(${C.hot},.14)`; ctx.beginPath(); ctx.moveTo(n[0], n[1]); ctx.arc(n[0], n[1], d + 18, a - .09, a + .09); ctx.closePath(); ctx.fill()
          ctx.strokeStyle = HOT; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(n[0], n[1]); ctx.lineTo(T[0], T[1]); ctx.stroke(); ctx.setLineDash([])
        }
        ctx.fillStyle = INK; ctx.font = `500 11px ${MONO}`
        N.forEach(([x, y], i) => { ctx.fillRect(x - 7, y - 7, 14, 14); ctx.fillText(`node ${i + 1}`, x + 12, y + 4) })
        U.forEach(([x, y], i) => { ctx.fillStyle = COLD; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = INK; ctx.fillText(`user ${i + 1}`, x + 12, y + 4) })
        ctx.fillStyle = HOT; ctx.save(); ctx.translate(T[0], T[1]); ctx.rotate(Math.PI / 4); ctx.fillRect(-10, -10, 20, 20); ctx.restore()
        ctx.fillStyle = INK; ctx.fillText('target', T[0] + 16, T[1] + 4)
      }
      const pos = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect()
        return [Math.max(12, Math.min(w - 12, e.clientX - r.left)), Math.max(12, Math.min(h - 12, e.clientY - r.top))]
      }
      cv.style.touchAction = 'none'; cv.style.cursor = 'grab'
      on(cv, 'pointerdown', (e: PointerEvent) => { drag = true; cv.setPointerCapture(e.pointerId); T = pos(e); draw() })
      on(cv, 'pointermove', (e: PointerEvent) => { if (drag) { T = pos(e); draw() } })
      on(cv, 'pointerup', () => { drag = false })
      on(window, 'resize', draw); draw()
    }

    // ── 05 frame vs spikes: the same shape, drawn whole or only where it changes ──
    {
      const cv = $<HTMLCanvasElement>('spk')
      let ctx: CanvasRenderingContext2D, w = 0, h = 0, edges: number[][] = [], mode = 'spikes', heat = new Float32Array(0), pol: boolean[] = []
      let off: HTMLCanvasElement
      const setup = () => {
        [ctx, w, h] = fitCanvas(cv)
        if (w < 1 || h < 1) return // not laid out yet; the next resize sets it up
        off = document.createElement('canvas'); off.width = Math.round(w); off.height = Math.round(h)
        const o = off.getContext('2d', { willReadFrequently: true })!
        o.fillStyle = '#000'; o.font = `900 ${Math.round(Math.min(h * .62, w / 1.6))}px ${DISPLAY}`
        o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillText('SEE', w / 2, h / 2)
        const d = o.getImageData(0, 0, off.width, off.height).data, W = off.width, at = (x: number, y: number) => d[(y * W + x) * 4 + 3] > 128
        edges = []
        for (let y = 2; y < off.height - 2; y += 3) for (let x = 2; x < W - 2; x += 3)
          if (at(x, y) && (!at(x - 3, y) || !at(x + 3, y) || !at(x, y - 3) || !at(x, y + 3) || Math.random() < .06)) edges.push([x, y])
        heat = new Float32Array(edges.length); pol = edges.map(() => Math.random() < .5)
      }
      const draw = () => {
        ctx.clearRect(0, 0, w, h)
        if (mode === 'frame') { ctx.globalAlpha = .9; ctx.drawImage(off, 0, 0, w, h); ctx.globalAlpha = 1; return }
        // spikes: edge pixels fire at random, then decay; a faint ghost keeps the shape legible
        ctx.fillStyle = `rgba(${C.ink},.08)`; for (const [x, y] of edges) ctx.fillRect(x - 1, y - 1, 2, 2)
        for (let i = 0; i < edges.length; i++) {
          if (Math.random() < .03) heat[i] = 1
          heat[i] *= .94
          if (heat[i] > .05) { ctx.fillStyle = `rgba(${pol[i] ? C.hot : C.cold},${heat[i].toFixed(2)})`; ctx.fillRect(edges[i][0] - 2, edges[i][1] - 2, 4, 4) }
        }
      }
      const btns = document.querySelectorAll<HTMLButtonElement>('[data-v]')
      btns.forEach(b => on(b, 'click', () => { mode = b.dataset.v!; btns.forEach(x => x.setAttribute('aria-pressed', String(x === b))); if (reduce) draw() }))
      let visible = false
      observe(cv, v => { visible = v })
      document.fonts.ready.then(() => { if (!alive) return; setup(); if (reduce) { heat.fill(.6); draw() } })
      on(window, 'resize', setup)
      const loop = () => { if (visible && edges.length) draw(); frame(loop) }
      if (!reduce) frame(loop)
    }

    return () => { alive = false; ac.abort(); timers.forEach(clearTimeout); observers.forEach(o => o.disconnect()) }
  }, [])

  return null
}
