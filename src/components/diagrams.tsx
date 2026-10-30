// Schematic diagrams of each project's real mechanism. No data is plotted:
// every shape stands for a part of the system, never for a measured value.
// Lines with class "draw" trace in once on load (CSS, stilled by reduced motion).

type Labels = Record<string, string>

// Four nodes on a ring; the Tx node fires a sensing beam at a plate target,
// the echo reaches one other node strongly and another weakly, and two nodes
// serve users. Node positions sit on the ring at 45° steps.
export function IsacDiagram({ l }: { l: Labels }) {
  const nodes = [
    { x: 89, y: 59, tx: true },
    { x: 231, y: 59 },
    { x: 89, y: 201 },
    { x: 231, y: 201 },
  ]
  return (
    <svg className="diagram diagram--isac" viewBox="0 0 320 260" role="img" aria-label={l.diagram}>
      <circle className="d-ring" cx="160" cy="130" r="100" />
      <path className="d-track" d="M 112 214 Q 140 160 176 120" />
      <polygon className="d-beam" points="89,59 168,134 190,104" />
      <line className="d-echo draw" pathLength={1} x1="179" y1="119" x2="231" y2="59" style={{ '--i': 1 } as React.CSSProperties} />
      <line className="d-echo d-echo--weak" x1="179" y1="119" x2="231" y2="201" />
      <line className="d-comm draw" pathLength={1} x1="89" y1="201" x2="128" y2="168" style={{ '--i': 2 } as React.CSSProperties} />
      <line className="d-comm draw" pathLength={1} x1="231" y1="201" x2="250" y2="146" style={{ '--i': 3 } as React.CSSProperties} />
      <rect className="d-plate" x="-20" y="-4" width="40" height="8" transform="translate(179 119) rotate(-35)" />
      {nodes.map((n) => (
        <rect key={`${n.x}-${n.y}`} className={n.tx ? 'd-node d-node--tx' : 'd-node'} x={n.x - 7} y={n.y - 7} width="14" height="14" />
      ))}
      <circle className="d-user" cx="128" cy="168" r="6" />
      <circle className="d-user" cx="250" cy="146" r="6" />
      <text className="d-label" x="64" y="44">{l.tx}</text>
      <text className="d-label" x="196" y="132">{l.target}</text>
      <text className="d-label d-label--comm" x="138" y="182">{l.user}</text>
      <text className="d-label d-label--comm" x="260" y="160">{l.user}</text>
      <text className="d-label d-label--muted" x="56" y="236">{l.track}</text>
    </svg>
  )
}

// Lock state machine: fingerprint moves Locked to Unlocked; side stand down forces Locked.
export function LockDiagram({ l }: { l: Labels }) {
  return (
    <svg className="diagram diagram--lock" viewBox="0 0 300 96" role="img" aria-label={l.diagram}>
      <rect className="d-state d-state--locked" x="4" y="30" width="96" height="36" />
      <rect className="d-state" x="200" y="30" width="96" height="36" />
      <text className="d-label d-label--strong" x="52" y="53" textAnchor="middle">{l.locked}</text>
      <text className="d-label d-label--strong" x="248" y="53" textAnchor="middle">{l.unlocked}</text>
      <path className="d-edge draw" pathLength={1} d="M 100 38 Q 150 10 196 38" />
      <polygon className="d-head" points="200,40 190,40 196,32" />
      <path className="d-edge d-edge--back draw" pathLength={1} d="M 200 58 Q 150 86 104 58" style={{ '--i': 1 } as React.CSSProperties} />
      <polygon className="d-head d-head--back" points="100,56 110,56 104,64" />
      <text className="d-label" x="150" y="14" textAnchor="middle">{l.finger}</text>
      <text className="d-label d-label--accent" x="150" y="94" textAnchor="middle">{l.stand}</text>
    </svg>
  )
}

// QPSK and 16-QAM constellations on I/Q axes.
export function ConstellationDiagram({ l }: { l: Labels }) {
  const qpsk = [-1, 1].flatMap((i) => [-1, 1].map((q) => [i, q]))
  const qam = [-3, -1, 1, 3].flatMap((i) => [-3, -1, 1, 3].map((q) => [i, q]))
  return (
    <svg className="diagram diagram--iq" viewBox="0 0 200 80" role="img" aria-label={l.diagram}>
      <g transform="translate(40 40)">
        <line className="d-axis" x1="-34" y1="0" x2="34" y2="0" />
        <line className="d-axis" x1="0" y1="-34" x2="0" y2="34" />
        {qpsk.map(([i, q]) => <circle key={`${i}${q}`} className="d-sym d-sym--qpsk" cx={i * 16} cy={q * 16} r="4" />)}
      </g>
      <g transform="translate(140 40)">
        <line className="d-axis" x1="-34" y1="0" x2="34" y2="0" />
        <line className="d-axis" x1="0" y1="-34" x2="0" y2="34" />
        {qam.map(([i, q]) => <circle key={`${i}${q}`} className="d-sym" cx={i * 9} cy={q * 9} r="2.6" />)}
      </g>
    </svg>
  )
}
