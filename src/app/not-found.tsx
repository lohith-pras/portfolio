import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="lost">
      <h1>Lost</h1>
      <p className="voice">The link is broken or the page moved</p>
      <Link className="pill pill--hot" href="/">Back to the start</Link>
    </main>
  )
}
