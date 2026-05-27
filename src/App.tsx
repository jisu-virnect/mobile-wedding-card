import {
  Account,
  AdminRsvp,
  BGMToggle,
  Cover,
  Films,
  Gallery,
  Greeting,
  PreEvent,
  Rsvp,
  ScrollToTop,
  Share,
  ToastContainer,
  When,
  Where,
} from './sections'
import { wedding } from './data/wedding'

/**
 * Admin mode detection — reads `?admin=<token>` from the URL once on
 * load and matches against VITE_ADMIN_TOKEN. Anything else falls through
 * to the regular invitation. Done outside React render so the admin page
 * never flashes the guest UI first.
 */
function isAdminRoute(): boolean {
  if (typeof window === 'undefined') return false
  const expected = import.meta.env.VITE_ADMIN_TOKEN as string | undefined
  if (!expected) return false
  const params = new URLSearchParams(window.location.search)
  return params.get('admin') === expected
}

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
  if (isAdminRoute()) {
    return <AdminRsvp />
  }
  return (
    <main className="mx-auto flex min-h-svh max-w-[480px] flex-col bg-ivory shadow-[0_0_60px_rgba(0,0,0,0.04)]">
      {wedding.bgm && <BGMToggle config={wedding.bgm} />}
      <ScrollToTop />
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
      {wedding.preEvent && <SectionDivider />}
      <PreEvent />
      <SectionDivider />
      <Share />
      <ToastContainer />
    </main>
  )
}

export default App
