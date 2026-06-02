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
    years: '2000–2018',
    sprite: '/bengaluru.png',
    placeholderColor: '#1a3a1a',
  },
  {
    key: 'nurnberg',
    city: 'Nürnberg',
    country: 'Germany',
    years: '2022–2024',
    sprite: '/nurnberg.png',
    placeholderColor: '#1a1a3a',
  },
  {
    key: 'dresden',
    city: 'Dresden',
    country: 'Germany',
    years: '2024–now',
    sprite: '/dresden.png',
    placeholderColor: '#3a1a1a',
  },
]
