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

function App() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[480px] flex-col bg-white shadow-sm">
      <Cover />
      <Greeting />
      <When />
      <Where />
      <Gallery />
      <Rsvp />
      <Account />
      <Share />
    </main>
  )
}

export default App
