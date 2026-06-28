import Link from 'next/link'

/**
 * Localized 404. Renders inside [locale]/layout, so it inherits the brand shell.
 * On-brand: paper bg, mono voice, ghost-numeral motif, CTA pill (see design.md).
 * Static English copy — no translation context required for a dead-end page.
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-paper px-6 text-foreground">
      {/* ghost numeral — editorial depth layer, matches About/Contact */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono font-bold leading-none text-foreground/[0.035] text-[clamp(10rem,40vw,28rem)]"
      >
        404
      </span>

      <div className="relative z-10 flex max-w-xl flex-col gap-6 text-center">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
          Signal lost
        </span>
        <h1 className="font-display font-bold leading-[1.1] tracking-tight text-foreground text-[clamp(1.8rem,5vw,3rem)] [text-wrap:balance]">
          This page isn&rsquo;t on the map.
        </h1>
        <p className="font-body text-foreground/70 leading-relaxed mx-auto max-w-prose">
          The link is broken or the page moved. Head back to the start.
        </p>

        <div className="mt-2">
          <Link
            href="/"
            className="link-wipe inline-flex items-center gap-2 rounded-full border border-rule px-6 py-3 font-mono text-sm uppercase tracking-widest text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent"
          >
            Back home
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
