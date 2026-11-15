import Play from '@/components/Play'

const EMAIL = 'lnlohith3@gmail.com'
const CV = '/Lohith_Prasanna_Resume.pdf'
const ext = { target: '_blank', rel: 'noopener noreferrer' } as const

export default function Home() {
  return (
    <>
      <section id="top" aria-label="Intro">
        <div className="bar meta">
          <span>Lohith Tarikere Prasanna</span>
          <span className="mid">Nürnberg · 49.45° N 11.08° E</span>
          <nav><a href="#work">Work</a><a href="#hello">Contact</a><a href={CV}>CV</a></nav>
        </div>
        <h1 className="name" aria-label="Lohith">
          <span aria-hidden="true">{[...'Lohith'].map((c, i) => <i key={i}>{c}</i>)}</span>
        </h1>
        <div className="foot meta">
          <span className="now">Now at Fraunhofer, putting vision models on neuromorphic chips</span>
          <span className="actions">
            <a className="pill pill--hot" href={`mailto:${EMAIL}`}>Say hello</a>
            <a className="pill" href="https://www.linkedin.com/in/loh-pras" {...ext}>LinkedIn</a>
          </span>
        </div>
      </section>

      <main>
        <section className="intro" id="work">
          <h2>Five things I made signals do</h2>
          <p className="voice">Each one takes ten seconds. Press, drag, slide</p>
        </section>

        {/* 01 · Delta X: the lock that falls back to locked */}
        <article className="ex">
          <span className="ex__no">01</span>
          <div className="ex__text">
            <h3>Always locked</h3>
            <p className="voice">An electric scooter that only wakes for your fingerprint, and goes back to locked on its own</p>
            <dl className="meta"><dt>Where</dt><dd>Delta X Automotive, Bengaluru</dd><dt>When</dt><dd>2022–23</dd><dt>On</dt><dd>ESP32, 2 prototype vehicles</dd></dl>
          </div>
          <div className="ex__stage">
            <span className="hint meta">Hold the print</span>
            <div className="lock" id="lock">
              <span className="lock__state" id="lockState">Locked</span>
              <button className="finger" id="finger" aria-label="Hold to unlock">
                <svg viewBox="0 0 112 112" aria-hidden="true">
                  <circle className="ring" id="ring" cx="56" cy="56" r="52" />
                  <g className="print">
                    <path d="M36 70c0-14 9-26 20-26s20 12 20 26" /><path d="M42 74c0-12 6-22 14-22s14 10 14 22" />
                    <path d="M48 78c0-10 3-18 8-18s8 8 8 18" /><path d="M56 68v16" /><path d="M30 62c3-18 14-28 26-28s23 10 26 28" />
                    <path d="M38 40c5-5 11-8 18-8s13 3 18 8" />
                  </g>
                </svg>
              </button>
            </div>
            <span className="ctrl meta" id="lockNote">Let go and it locks again</span>
          </div>
        </article>

        {/* 02 · NI: ten minutes down to under one */}
        <article className="ex">
          <span className="ex__no">02</span>
          <div className="ex__text">
            <h3>Ten minutes to one</h3>
            <p className="voice">RF test data at NI that engineers can just ask questions of, fast enough to stay in the conversation</p>
            <dl className="meta"><dt>Where</dt><dd>NI, Dresden</dd><dt>When</dt><dd>Oct 2025 – Mar 2026</dd><dt>Did</dt><dd>Faster queries, statistics, an AI layer</dd></dl>
          </div>
          <div className="ex__stage">
            <span className="hint meta">One failure lookup, sped up 30×</span>
            <div className="race" id="race">
              <div className="lane"><div className="lane__top"><span className="meta">Before</span><b id="tBefore">0:00</b></div><div className="track"><div className="fill" id="fBefore" /></div></div>
              <div className="lane fast"><div className="lane__top"><span className="meta">After</span><b id="tAfter">0:00</b></div><div className="track"><div className="fill" id="fAfter" /></div></div>
            </div>
            <div className="ctrl"><button className="pill" id="raceBtn">Run it again</button></div>
          </div>
        </article>

        {/* 03 · side project: modulation classifier */}
        <article className="ex">
          <span className="ex__no">03</span>
          <div className="ex__text">
            <h3>Name that signal</h3>
            <p className="voice">A model that hears a raw waveform and says how it was modulated. Turn the noise up to see why that’s hard</p>
            <dl className="meta"><dt>What</dt><dd>Side project, open source</dd><dt>Score</dt><dd>83.6% right on clean signals</dd><dt>Code</dt><dd><a href="https://github.com/lohith-pras/modulation-classifier" {...ext}>github.com/lohith-pras</a></dd></dl>
          </div>
          <div className="ex__stage">
            <canvas className="play" id="iq" aria-label="Constellation diagram" />
            <span className="hint meta">I/Q constellation</span>
            <span className="big-ro" id="snrRo">20 dB</span>
            <div className="ctrl">
              <span className="seg" role="group" aria-label="Modulation">
                <button aria-pressed="true" data-m="qpsk">QPSK</button><button aria-pressed="false" data-m="bpsk">BPSK</button><button aria-pressed="false" data-m="qam16">16-QAM</button>
              </span>
              <label className="meta snr">Noisy<input id="snr" type="range" min="0" max="20" defaultValue="20" aria-label="Signal to noise ratio" />Clean</label>
            </div>
          </div>
        </article>

        {/* 04 · FAU research: sense and talk at once */}
        <article className="ex">
          <span className="ex__no">04</span>
          <div className="ex__text">
            <h3>Sense and talk at once</h3>
            <p className="voice">Radio nodes that track a moving target and serve their users with the same signal</p>
            <dl className="meta"><dt>Where</dt><dd>FAU research project</dd><dt>When</dt><dd>2026</dd><dt>Next</dt><dd>The problem is non-convex, so a deep RL agent</dd></dl>
          </div>
          <div className="ex__stage">
            <canvas className="play" id="isac" aria-label="Radio nodes sensing a target while serving two users" />
            <span className="hint meta">Drag the target</span>
            <span className="cap meta">4 nodes sensing · 2 users served</span>
          </div>
        </article>

        {/* 05 · Fraunhofer: frames into spikes */}
        <article className="ex">
          <span className="ex__no">05</span>
          <div className="ex__text">
            <h3>Frames into spikes</h3>
            <p className="voice">Vision models rebuilt as spiking networks, so a tiny chip only reacts to what changes</p>
            <dl className="meta"><dt>Where</dt><dd>Fraunhofer, now</dd><dt>On</dt><dd>AKD1500, Nicla Vision, Brainboard</dd></dl>
          </div>
          <div className="ex__stage">
            <canvas className="play" id="spk" aria-label="A shape shown as a full frame or as spikes" />
            <span className="hint meta">Same picture, two ways to see it</span>
            <div className="ctrl">
              <span className="seg" role="group" aria-label="View"><button aria-pressed="false" data-v="frame">Frame</button><button aria-pressed="true" data-v="spikes">Spikes</button></span>
            </div>
          </div>
        </article>

        <section className="next">
          <h3>Next: radar on neuromorphic chips</h3>
          <div className="side">
            <p className="meta">Where 04 and 05 meet. If you work on radar, spiking networks or both, I’d like to hear what you’re building</p>
            <a className="pill" href={`mailto:${EMAIL}?subject=Radar%20on%20neuromorphic%20chips`}>Ping me</a>
          </div>
        </section>

        <section className="also">
          <span className="meta">Also built, for fun</span>
          <p>
            <a href="https://github.com/lohith-pras/can_decoder" {...ext}>a CAN bus decoder</a><small>Rust</small>,{' '}
            <a href="https://github.com/lohith-pras/sprachboot" {...ext}>a German tutor</a><small>FastAPI</small>,{' '}
            <a href="https://github.com/lohith-pras/nest" {...ext}>an app my flat runs on</a><small>React</small>,{' '}
            <a href="https://github.com/lohith-pras/f1-dashboard" {...ext}>my own F1 pit wall</a><small>FastF1</small>{' '}
            and <a href="https://github.com/lohith-pras/prompt_analysis" {...ext}>a mirror for my prompting habits</a><small>DuckDB</small>
          </p>
        </section>
      </main>

      <footer id="hello">
        <a className="hello" href={`mailto:${EMAIL}`}>Say hello</a>
        <div className="row meta">
          <span>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <a href="https://www.linkedin.com/in/loh-pras" {...ext}>LinkedIn</a>
            <a href="https://github.com/lohith-pras" {...ext}>GitHub</a>
            <a href={CV}>CV</a>
          </span>
          <span>Open to Werkstudent roles in signal processing, ML and embedded</span>
        </div>
      </footer>

      <Play />
    </>
  )
}
