import { wedding } from '../data/wedding'

export function Cover() {
  return (
    <section
      id="cover"
      aria-labelledby="cover-heading"
      className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 py-16 text-center"
    >
      <p className="text-sm tracking-widest text-gray-500 uppercase">Wedding Invitation</p>
      <h1 id="cover-heading" className="text-3xl font-semibold text-gray-900">
        {wedding.groom.name}
        <span className="mx-3 text-gray-400">&amp;</span>
        {wedding.bride.name}
      </h1>
      <p className="text-gray-600">{new Date(wedding.dateTime).toLocaleDateString('ko-KR')}</p>
    </section>
  )
}
