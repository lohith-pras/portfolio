'use client'
import { useMemo } from 'react'
import { buildCity, CITY_SEED } from './cityData'
import { buildAvenueRoutes, buildCarRoutes } from './carRoutes'
import { useDeviceTier } from './useRenderProfile'
import { mulberry32, range } from '@/lib/rng'
import { Car } from './Car'

export function AvenueTraffic() {
  const tier = useDeviceTier()
  const layout = useMemo(() => buildCity(CITY_SEED), [])

  // Avenue: dense slow stream down the four lanes. Grid: ambient cars looping
  // the side streets so traffic fills the whole city, not just the avenue.
  const avenueRoutes = useMemo(() => buildAvenueRoutes(layout), [layout])
  const gridRoutes = useMemo(() => buildCarRoutes(layout, tier === 'high' ? 8 : 3), [layout, tier])

  const avenueCount = tier === 'high' ? 16 : 6
  const gridCount = tier === 'high' ? 10 : 4

  const avenueAgents = useMemo(() => {
    const r = mulberry32(0xA4E0)
    return Array.from({ length: avenueCount }, (_, i) => ({
      route: avenueRoutes[i % avenueRoutes.length],
      offset: (i / avenueCount + range(r, -0.02, 0.02) + 1) % 1, // spread along the loop
      speed: range(r, 3, 6), // slow cruise
    }))
  }, [avenueCount, avenueRoutes])

  const gridAgents = useMemo(() => {
    const r = mulberry32(0x6D17)
    return Array.from({ length: gridCount }, () => ({
      route: gridRoutes[Math.floor(range(r, 0, gridRoutes.length))],
      offset: r(),
      speed: range(r, 4, 7),
    }))
  }, [gridCount, gridRoutes])

  return (
    <>
      {avenueAgents.map((a, i) => (
        <Car key={`av${i}`} route={a.route} speed={a.speed} offset={a.offset} />
      ))}
      {gridAgents.map((a, i) => (
        <Car key={`gr${i}`} route={a.route} speed={a.speed} offset={a.offset} />
      ))}
    </>
  )
}
