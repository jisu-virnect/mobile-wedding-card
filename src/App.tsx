import {
  Account,
  Cover,
  Gallery,
  Greeting,
  Rsvp,
  Share,
  When,
  Where,
} from './sections'

function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto my-2 flex items-center justify-center gap-2 text-gray-200"
    >
      <span className="h-px w-8 bg-gray-200" />
      <svg className="h-1.5 w-1.5" viewBox="0 0 8 8" fill="currentColor">
        <circle cx="4" cy="4" r="2" />
      </svg>
      <span className="h-px w-8 bg-gray-200" />
    </div>
  )
}

function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[480px] flex-col bg-white shadow-sm">
      <Cover />
      <SectionDivider />
      <Greeting />
      <SectionDivider />
      <When />
      <SectionDivider />
      <Where />
      <SectionDivider />
      <Gallery />
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
