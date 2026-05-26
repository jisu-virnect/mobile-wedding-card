import {
  Account,
  BGMToggle,
  Cover,
  Films,
  Gallery,
  Greeting,
  Rsvp,
  Share,
  When,
  Where,
} from './sections'
import { wedding } from './data/wedding'

function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex items-center justify-center gap-2 py-1 text-sage/40"
    >
      <span className="h-px w-10 bg-line" />
      <svg className="h-2 w-2" viewBox="0 0 8 8" fill="currentColor">
        <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" />
      </svg>
      <span className="h-px w-10 bg-line" />
    </div>
  )
}

function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[480px] flex-col bg-ivory shadow-[0_0_60px_rgba(0,0,0,0.04)]">
      {wedding.bgm && <BGMToggle config={wedding.bgm} />}
      <Cover />
      <Greeting />
      <SectionDivider />
      <When />
      <SectionDivider />
      <Where />
      <SectionDivider />
      <Gallery />
      <SectionDivider />
      <Films />
      <SectionDivider />
      <Rsvp />
      <SectionDivider />
      <Account />
      <SectionDivider />
      <Share />
    </main>
  )
}

export default App
