export interface Place {
  key: string
  city: string
  country: string
  years: string
  sprite: string
  placeholderColor: string
}

export const PLACES: Place[] = [
  {
    key: 'bengaluru',
    city: 'Bengaluru',
    country: 'India',
    years: '2001-2023',
    sprite: '/bengaluru.png',
    placeholderColor: '#1a3a1a',
  },
  {
    key: 'nurnberg',
    city: 'Nürnberg',
    country: 'Germany',
    years: '2024-now',
    sprite: '/nurnberg.png',
    placeholderColor: '#1a1a3a',
  },
  {
    key: 'dresden',
    city: 'Dresden',
    country: 'Germany',
    years: '2025-2026',
    sprite: '/dresden.png',
    placeholderColor: '#3a1a1a',
  },
]
