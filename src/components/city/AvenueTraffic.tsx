'use client'
import { useMemo } from 'react'
import { buildCity, CITY_SEED } from './cityData'
import { buildAvenueRoutes } from './carRoutes'
import { useDeviceTier } from './useRenderProfile'
import { mulberry32, range } from '@/lib/rng'
import { Car } from './Car'

export function AvenueTraffic() {
  const tier = useDeviceTier()
  const count = tier === 'high' ? 18 : 6

  const layout = useMemo(() => buildCity(CITY_SEED), [])
  const routes = useMemo(() => buildAvenueRoutes(layout), [layout])

  const agents = useMemo(() => {
    const r = mulberry32(0xA4E0)
    return Array.from({ length: count }, (_, i) => ({
      routeIndex: i % 2,
      // Spread evenly around the loop, with a small random jitter
      offset: (i / count + range(r, -0.02, 0.02) + 1) % 1,
      speed: range(r, 8, 14),
    }))
  }, [count, routes])

  return (
    <>
      {agents.map((a, i) => (
        <Car key={i} route={routes[a.routeIndex]} speed={a.speed} offset={a.offset} />
      ))}
    </>
  )
}
