'use client'
import { useMemo } from 'react'
import { buildCity, CITY_SEED } from './cityData'
import { buildAvenueRoutes, buildRingRoute } from './carRoutes'
import { useDeviceTier } from './useRenderProfile'
import { mulberry32, range } from '@/lib/rng'
import { Car } from './Car'

export function AvenueTraffic() {
  const tier = useDeviceTier()
  const layout = useMemo(() => buildCity(CITY_SEED), [])

  // Two non-intersecting flows: the central avenue (parallel lanes) and a single
  // perimeter highway loop around the city edge. No shared intersections, so
  // traffic stays clean.
  const avenueRoutes = useMemo(() => buildAvenueRoutes(layout), [layout])
  const ringRoute = useMemo(() => buildRingRoute(layout), [layout])

  const avenueCount = tier === 'high' ? 7 : 3
  const ringCount = tier === 'high' ? 4 : 2

  const avenueAgents = useMemo(() => {
    const r = mulberry32(0xA4E0)
    return Array.from({ length: avenueCount }, (_, i) => ({
      route: avenueRoutes[i % avenueRoutes.length],
      offset: (i / avenueCount + range(r, -0.02, 0.02) + 1) % 1, // spread along the loop
      speed: range(r, 3, 6), // slow cruise
    }))
  }, [avenueCount, avenueRoutes])

  const ringAgents = useMemo(() => {
    const r = mulberry32(0x6D17)
    return Array.from({ length: ringCount }, (_, i) => ({
      offset: (i / ringCount + range(r, -0.03, 0.03) + 1) % 1, // spread around the perimeter
      speed: range(r, 5, 8),
    }))
  }, [ringCount])

  return (
    <>
      {avenueAgents.map((a, i) => (
        <Car key={`av${i}`} route={a.route} speed={a.speed} offset={a.offset} />
      ))}
      {ringAgents.map((a, i) => (
        <Car key={`rg${i}`} route={ringRoute} speed={a.speed} offset={a.offset} />
      ))}
    </>
  )
}
