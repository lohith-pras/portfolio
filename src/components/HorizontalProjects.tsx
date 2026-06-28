'use client'

import { useRef, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { X } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

// Radar Coordinates for the 6 projects (representing active signal blips)
const PROJECTS = [
  // Outer Ring (ENGINEERING): ~0.7 radius in WebGL space
  {
    key: 'can_decoder',
    id: 'OBJ_001',
    ring: 'outer',
    top: '15%',
    left: '35%',
    href: 'https://github.com/lohith-pras/can-bus-decoder',
  },
  {
    key: 'isac_drl',
    id: 'OBJ_002',
    ring: 'outer',
    top: '82%',
    left: '55%',
    href: null,
  },
  {
    key: 'modulation_classifier',
    id: 'OBJ_003',
    ring: 'outer',
    top: '50%',
    left: '85%',
    href: 'https://github.com/lohith-pras/rf-modulation-classifier',
  },
  // Inner Ring (FOR FUN): ~0.4 radius in WebGL space
  {
    key: 'sprachboot',
    id: 'OBJ_004',
    ring: 'inner',
    top: '40%',
    left: '40%',
    href: null,
  },
  {
    key: 'nest',
    id: 'OBJ_005',
    ring: 'inner',
    top: '60%',
    left: '60%',
    href: null,
  },
  {
    key: 'f1_dashboard',
    id: 'OBJ_006',
    ring: 'inner',
    top: '55%',
    left: '32%',
    href: null,
  },
] as const

export function HorizontalProjects() {
  const t = useTranslations('work')
  const tp = useTranslations('projects')
  const reduce = useReducedMotion()

  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const blipRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [reticleCoords, setReticleCoords] = useState({ bx: 0, by: 0, px: 0, py: 0 })

  // 1. WebGL Background Shader (Radar sweep & rings)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        float dist = length(uv);
        
        // Grid Lines (Radar Rings)
        float ring1 = abs(dist - 0.4) < 0.002 ? 1.0 : 0.0;
        float ring2 = abs(dist - 0.7) < 0.002 ? 1.0 : 0.0;
        float ring3 = abs(dist - 0.1) < 0.001 ? 0.3 : 0.0;
        
        // Crosshair Lines
        float axis = (abs(uv.x) < 0.0015 || abs(uv.y) < 0.0015) ? 1.0 : 0.0;
        
        // Radar Sweep
        float angle = atan(uv.y, uv.x);
        float sweep_angle = fract(u_time * 0.15) * 6.2831853 - 3.14159265;
        float diff = mod(angle - sweep_angle, 6.2831853);
        float sweep = exp(-diff * 3.0); 
        
        // Color Palette
        vec3 color_sweep = vec3(1.0, 0.118, 0.0); // #FF1E00
        vec3 color_grid = vec3(0.96, 0.9, 0.78); // Cream
        
        float grid_mask = ring1 + ring2 + ring3 + axis;
        float sweep_mask = sweep * (1.0 - smoothstep(0.98, 1.0, dist));
        
        // Grid is dim cream (alpha multiplier 0.15), sweep is solid accent red
        vec3 rgb = color_grid * grid_mask * 0.15 + color_sweep * sweep_mask;
        float alpha = max(grid_mask * 0.15, sweep_mask);
        
        // Fade out towards edges (smooth transition to transparent background)
        float edge_fade = smoothstep(1.0, 0.8, dist);
        alpha *= edge_fade;
        rgb *= edge_fade;
        
        gl_FragColor = vec4(rgb, alpha);
      }
    `

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)
      if (!s) return null
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(s))
        gl.deleteShader(s)
        return null
      }
      return s
    }

    const vertexShader = compile(gl.VERTEX_SHADER, vs)
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fs)
    if (!vertexShader || !fragmentShader) return

    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vertexShader)
    gl.attachShader(prog, fragmentShader)
    gl.linkProgram(prog)

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(prog))
      return
    }

    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const pos = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_resolution')

    let animationFrameId = 0
    let startTime = performance.now()
    let isVisible = true

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const render = (time: number) => {
      if (!isVisible) return
      
      // Pass static time (constant angle) if user prefers reduced motion
      const elapsed = reduce ? 2.5 : (time - startTime) * 0.001

      gl.uniform1f(uTime, elapsed)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      if (!reduce) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    // IntersectionObserver to pause rendering when section goes offscreen (saving GPU repaints)
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        isVisible = entry.isIntersecting
        setIsRevealed(isVisible)
        if (isVisible && !reduce) {
          startTime = performance.now() - (elapsedTimeRef.current || 0)
          animationFrameId = requestAnimationFrame(render)
        } else {
          cancelAnimationFrame(animationFrameId)
          if (!reduce) {
            elapsedTimeRef.current = performance.now() - startTime
          }
        }
      },
      { threshold: 0.05 }
    )

    const elapsedTimeRef = { current: 0 }
    observer.observe(canvas)

    // Render static frame immediately if reduced motion is requested
    if (reduce) {
      render(0)
    }

    return () => {
      window.removeEventListener('resize', resize)
      observer.disconnect()
      cancelAnimationFrame(animationFrameId)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      // Force-release the GPU context so it isn't left lingering on unmount.
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [reduce])

  // 2. Dynamic SVG Targeting Reticle Coordinate Calculation
  useEffect(() => {
    if (!hoveredKey) return

    const updateCoords = () => {
      const blipEl = blipRefs.current[hoveredKey]
      const sectionEl = sectionRef.current
      const panelEl = panelRef.current

      if (blipEl && sectionEl && panelEl) {
        const blipRect = blipEl.getBoundingClientRect()
        const sectionRect = sectionEl.getBoundingClientRect()
        const panelRect = panelEl.getBoundingClientRect()

        const bx = blipRect.left - sectionRect.left + blipRect.width / 2
        const by = blipRect.top - sectionRect.top + blipRect.height / 2

        const isMobile = window.innerWidth < 768
        let px = 0
        let py = 0

        if (isMobile) {
          // Mobile bottom sheet: vertical connection line directly to the sheet top edge
          px = bx
          py = panelRect.top - sectionRect.top
        } else {
          // Desktop sidebar: horizontal connection line to the left edge of sidebar
          px = panelRect.left - sectionRect.left
          py = panelRect.top - sectionRect.top + panelRect.height / 2
        }

        setReticleCoords({ bx, by, px, py })
      }
    }

    updateCoords()

    window.addEventListener('resize', updateCoords)
    return () => {
      window.removeEventListener('resize', updateCoords)
    }
  }, [hoveredKey])

  // Blip entrance pop-in stagger when container is revealed
  useGSAP(() => {
    const container = containerRef.current
    if (!container || reduce) return

    const blips = container.querySelectorAll('.group')

    if (isRevealed) {
      // Scale and fade container in
      gsap.to(container, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power3.out',
        overwrite: 'auto'
      })
      // Stagger blips in with a pop spring
      gsap.fromTo(blips,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'back.out(1.5)',
          delay: 0.2,
          overwrite: 'auto'
        }
      )
    } else {
      // Hold hidden in preparation for next reveal
      gsap.set(container, { opacity: 0, scale: 0.95 })
      gsap.set(blips, { scale: 0, opacity: 0 })
    }
  }, [isRevealed, reduce])

  // Slide details panel in/out and stagger contents
  useGSAP(() => {
    const panel = panelRef.current
    if (!panel) return

    const isMobile = window.innerWidth < 768

    // Set initial position and ensure it's visible (opacity: 1) when GSAP takes over
    if (!panelOpen) {
      gsap.set(panel, {
        xPercent: isMobile ? 0 : 100,
        yPercent: isMobile ? 100 : 0,
        opacity: 1
      })
    }

    const handleResize = () => {
      const isMob = window.innerWidth < 768
      if (!panelOpen) {
        gsap.set(panel, {
          xPercent: isMob ? 0 : 100,
          yPercent: isMob ? 100 : 0
        })
      } else {
        gsap.set(panel, {
          xPercent: 0,
          yPercent: 0
        })
      }
    }

    window.addEventListener('resize', handleResize)

    const contentElements = panel.querySelectorAll('.panel-animate')

    if (panelOpen) {
      const tl = gsap.timeline()
      
      // Animate panel container slide-in
      tl.to(panel, {
        xPercent: 0,
        yPercent: 0,
        opacity: 1,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto'
      })

      // Stagger internal items
      if (!reduce) {
        tl.fromTo(contentElements,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
            clearProps: 'transform,opacity',
            overwrite: 'auto'
          },
          '-=0.3'
        )
      }
    } else {
      // Animate panel slide-out
      gsap.to(panel, {
        xPercent: isMobile ? 0 : 100,
        yPercent: isMobile ? 100 : 0,
        duration: 0.5,
        ease: 'power3.inOut',
        overwrite: 'auto'
      })
    }

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [panelOpen, selectedKey, reduce])

  const activeProject = PROJECTS.find((p) => p.key === selectedKey)
  const year = new Date().getFullYear()

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background py-16 md:py-0"
    >
      {/* WebGL background shader (Radar Sweep) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      />

      {/* Dynamic Target Reticle Overlay (SVG) */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none z-20 transition-opacity duration-300 ${
          hoveredKey && panelOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Dotted target-locked connector line */}
        <line
          stroke="#FF1E00"
          strokeWidth="0.5"
          strokeDasharray="5,5"
          x1={reticleCoords.bx}
          y1={reticleCoords.by}
          x2={reticleCoords.px}
          y2={reticleCoords.py}
          className="transition-[x1,y1,x2,y2] duration-150 ease-out"
        />
        {/* Concentric rotating radar rings on blip */}
        <circle
          cx={reticleCoords.bx}
          cy={reticleCoords.by}
          r="18"
          fill="none"
          stroke="#FF1E00"
          strokeWidth="0.5"
          strokeDasharray="4"
          className="transition-[cx,cy] duration-150 ease-out origin-center animate-[spin_10s_linear_infinite]"
        />
        <circle
          cx={reticleCoords.bx}
          cy={reticleCoords.by}
          r="6"
          fill="none"
          stroke="#FF1E00"
          strokeWidth="0.75"
          className="transition-[cx,cy] duration-150 ease-out"
        />
      </svg>

      {/* Radar Interactive Container */}
      <div
        ref={containerRef}
        className={`relative w-full h-full max-w-[min(90vw,70vh)] aspect-square flex items-center justify-center z-10 transition-all duration-1000 ${
          isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Radar Ring Labels */}
        <div className="absolute font-mono text-[11px] font-bold tracking-[0.4em] text-foreground/15 uppercase select-none pointer-events-none top-[15%]">
          {t('radar_outer')}
        </div>
        <div className="absolute font-mono text-[10px] font-bold tracking-[0.3em] text-foreground/15 uppercase select-none pointer-events-none top-[32%]">
          {t('radar_inner')}
        </div>

        {/* Signal Blips (Interactive Projects) */}
        {PROJECTS.map((p) => {
          const isHovered = hoveredKey === p.key
          const isActive = selectedKey === p.key
          return (
            <button
              key={p.key}
              ref={(el) => {
                blipRefs.current[p.key] = el
              }}
              type="button"
              onMouseEnter={() => {
                setHoveredKey(p.key)
                setSelectedKey(p.key)
                setPanelOpen(true)
              }}
              onMouseLeave={() => setHoveredKey(null)}
              onFocus={() => {
                setHoveredKey(p.key)
                setSelectedKey(p.key)
                setPanelOpen(true)
              }}
              onBlur={() => setHoveredKey(null)}
              onClick={() => {
                setSelectedKey(p.key)
                setPanelOpen(true)
              }}
              aria-label={tp(`${p.key}.name`)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group focus-visible:outline-none z-30"
              style={{
                top: p.top,
                left: p.left,
                opacity: reduce ? 1 : 0,
                transform: reduce ? undefined : 'translate(-50%, -50%) scale(0)'
              }}
            >
              <div className="relative p-4">
                {/* Core Blip Dot */}
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-accent shadow-[0_0_15px_rgba(255,30,0,0.9)]'
                      : 'bg-beige shadow-[0_0_12px_rgba(245,221,182,0.7)] group-hover:bg-accent group-hover:shadow-[0_0_15px_rgba(255,30,0,0.9)]'
                  }`}
                />
                {/* Rippling Pulse Ring */}
                {!reduce && (
                  <div
                    className={`absolute inset-0 m-auto w-3 h-3 border rounded-full blip-pulse pointer-events-none ${
                      isActive ? 'border-accent' : 'border-beige group-hover:border-accent'
                    }`}
                  />
                )}
                {/* Blip Object Code Tag */}
                <span
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 font-mono text-[9px] text-beige bg-background px-2 py-0.5 border border-rule whitespace-nowrap z-40 pointer-events-none`}
                >
                  {p.id}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Responsive Detail Panel (Desktop Sidebar / Mobile Bottom Sheet) */}
      <aside
        ref={panelRef}
        style={{
          opacity: reduce ? 1 : 0,
        }}
        className="absolute z-40 bg-paper/95 border-rule flex flex-col justify-between select-none
          /* Mobile Bottom Sheet Styles */
          bottom-0 left-0 w-full h-[45vh] border-t p-6 md:p-8
          /* Desktop Sidebar Overrides */
          md:top-0 md:right-0 md:left-auto md:bottom-auto md:w-[400px] md:h-full md:border-l md:border-t-0 md:p-12"
      >
        <div className="space-y-6 md:space-y-8 mt-4 md:mt-16">
          {/* Header metadata */}
          <div className="space-y-1 panel-animate">
            <div className="font-mono text-[10px] text-accent uppercase tracking-[0.25em]">
              {selectedKey ? tp(`${selectedKey}.problem`) : t('system_idle')}
            </div>
            <h3 className="font-display text-[2rem] md:text-[2.75rem] font-bold leading-none uppercase tracking-tight text-beige mt-2">
              {selectedKey ? tp(`${selectedKey}.name`) : t('select_blip')}
            </h3>
          </div>

          {/* Close Panel Button */}
          {panelOpen && (
            <button
              type="button"
              onClick={() => {
                setPanelOpen(false)
                setSelectedKey(null)
              }}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-foreground/50 hover:text-accent transition-colors p-2 rounded-full hover:bg-white/[0.05]"
              aria-label="Close panel"
            >
              <X size={16} />
            </button>
          )}

          {/* Description Copy */}
          <p className="font-body text-foreground/75 leading-relaxed text-xs md:text-sm select-text max-h-[12vh] md:max-h-[35vh] overflow-y-auto pr-2 panel-animate">
            {selectedKey ? tp(`${selectedKey}.description`) : t('awaiting_target')}
          </p>

          {/* Tech stack tags */}
          {selectedKey && (
            <div className="flex flex-wrap gap-1.5 md:gap-2 panel-animate">
              {tp(`${selectedKey}.tech`)
                .split('·')
                .map((s) => s.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full border border-rule font-mono text-[10px] text-foreground/60 uppercase tracking-wider bg-white/[0.02]"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}

          {/* View Project Action */}
          {selectedKey && (
            <div className="pt-2 md:pt-4 panel-animate">
              {activeProject?.href ? (
                <a
                  href={activeProject.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full border border-rule px-5 py-2 md:px-6 md:py-2.5 font-mono text-xs uppercase tracking-widest text-beige hover:border-accent hover:text-accent transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {t('view_project')}
                  <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 rounded-full border border-rule/30 px-5 py-2 md:px-6 md:py-2.5 font-mono text-xs uppercase tracking-widest text-foreground/35 cursor-not-allowed"
                >
                  {t('view_project')}
                  <span className="text-[9px] text-muted tracking-normal font-normal lowercase">
                    (proprietary)
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Panel Telemetry Footer (Desktop only) */}
        <div className="hidden md:flex justify-between items-end border-t border-rule pt-6 panel-animate">
          <div className="font-mono text-[9px] text-foreground/30 space-y-0.5 leading-none">
            <div>LAT: 49.4521</div>
            <div>LNG: 11.0767</div>
          </div>
          <div className="font-mono text-[9px] text-accent font-bold uppercase tracking-wider">
            {t('status_tracking')}
          </div>
        </div>
      </aside>

      {/* System Status Footer (Desktop only) */}
      <div className="absolute bottom-6 left-12 right-12 hidden md:flex justify-between items-center z-10 pointer-events-none select-none">
        <div className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest">
          ©{year} SIGNAL/LABS. <span className="text-accent font-bold">SYSTEM_READY</span>
        </div>
        <div className="flex gap-6 font-mono text-[10px] pointer-events-auto">
          <a
            href="https://github.com/lohith-pras/portfolio_v2"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/45 hover:text-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t('repository')}
          </a>
          <span className="text-foreground/20">·</span>
          <span className="text-foreground/45">
            {t('telemetry')}
          </span>
          <span className="text-foreground/20">·</span>
          <span className="text-accent underline decoration-accent/30 underline-offset-4 font-bold">
            {t('status_optimal')}
          </span>
        </div>
      </div>
    </section>
  )
}
