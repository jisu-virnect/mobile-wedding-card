import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Unit tests run in jsdom without the Kakao SDK script. Force the env
// var to empty so KakaoMap renders its placeholder fallback and
// kakao.ts treats the SDK as "not configured" (no script injection,
// no infinite Promise wait).
vi.stubEnv('VITE_KAKAO_JS_KEY', '')

// Supabase backend isn't reachable from jsdom; force the env vars empty so
// hasSupabase() returns false and components fall back to the "준비 중"
// path. Tests that need to exercise Supabase behavior should mock the
// module directly.
vi.stubEnv('VITE_SUPABASE_URL', '')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
vi.stubEnv('VITE_ADMIN_TOKEN', '')

// jsdom does not implement IntersectionObserver, which framer-motion's
// `whileInView` / `useInView` relies on. A permissive mock that synchronously
// reports the observed element as fully intersecting keeps visibility-gated
// content in the tree during unit tests.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = '0px'
  readonly thresholds: ReadonlyArray<number> = [0]

  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
          time: 0,
        } as IntersectionObserverEntry,
      ],
      this,
    )
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

;(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver
