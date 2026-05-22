import { Link } from '@/i18n/navigation'

interface ProjectCardProps {
  id: string
  name: string
  problem: string
  status: string
  href: string
}

export function ProjectCard({ id, name, problem, status, href }: ProjectCardProps) {
  // Extract a status color dot based on the text
  const getStatusDotColor = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('active')) return '#FF1E00' // Accent orange/red
    if (s.includes('complete')) return '#10B981' // Green
    return '#F59E0B' // Amber/Yellow
  }

  return (
    <article className="project-card flex flex-col gap-4 pb-6 border-b border-white/20 hover:border-white/60 transition-colors group">
      <Link href={href} className="flex flex-col gap-4 cursor-pointer focus:outline-none">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-[clamp(1.5rem,3vw,2.5rem)] text-foreground group-hover:text-accent transition-colors leading-tight">
              {name}
            </h3>
          </div>
          <p className="font-body font-light text-white/70 text-[clamp(1rem,1.8vw,1.2rem)] leading-relaxed line-clamp-2">
            {problem}
          </p>
        </header>

        <footer className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 font-mono text-sm text-foreground/80 uppercase tracking-wider">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusDotColor(status) }}
            />
            {status}
          </div>
          <div className="font-mono text-xs text-foreground/50 uppercase tracking-widest border border-white/10 px-2 py-1 rounded-sm">
            {id}
          </div>
        </footer>
      </Link>
    </article>
  )
}
