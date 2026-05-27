import { useEffect, useRef, useState } from 'react'

// Minimal type surface for the bits of Kakao Maps SDK we actually call.
// Keeping it loose so we don't have to ship @types/kakao-maps.
interface KakaoLatLng {
  __brand: 'kakaoLatLng'
}
interface KakaoMapInstance {
  setCenter(latlng: KakaoLatLng): void
}
interface KakaoMarker {
  __brand: 'marker'
}

declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void
        LatLng: new (lat: number, lng: number) => KakaoLatLng
        Map: new (
          el: HTMLElement,
          options: { center: KakaoLatLng; level: number; draggable?: boolean },
        ) => KakaoMapInstance
        Marker: new (options: {
          position: KakaoLatLng
          map?: KakaoMapInstance
        }) => KakaoMarker
        services: {
          Geocoder: new () => {
            addressSearch: (
              addr: string,
              cb: (
                result: Array<{ x: string; y: string }>,
                status: string,
              ) => void,
            ) => void
          }
          Status: { OK: string }
        }
      }
    }
  }
}

const SDK_URL_BASE = '//dapi.kakao.com/v2/maps/sdk.js'

let sdkLoadPromise: Promise<boolean> | null = null

function loadSdk(key: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (window.kakao?.maps) return Promise.resolve(true)
  if (sdkLoadPromise) return sdkLoadPromise

  sdkLoadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `${SDK_URL_BASE}?appkey=${key}&libraries=services&autoload=false`
    script.async = true
    script.onload = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => resolve(true))
      } else {
        resolve(false)
      }
    }
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
  return sdkLoadPromise
}

interface KakaoMapProps {
  /** Address to geocode + center the map on. */
  address: string
  /** Display name used in the aria-label. */
  venueName: string
  /** Fallback rendered when the SDK key is missing or the map fails. */
  fallback: React.ReactNode
}

/**
 * Embedded Kakao Map preview centered on the venue. Loads the SDK once
 * per session, geocodes the address, drops a marker.
 *
 * Renders `fallback` (the existing SVG placeholder) when no
 * VITE_KAKAO_JS_KEY is configured or anything else goes wrong.
 */
export function KakaoMap({ address, venueName, fallback }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  const key = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined

  useEffect(() => {
    if (!key) return
    let cancelled = false

    loadSdk(key).then((ok) => {
      if (cancelled) return
      if (!ok || !window.kakao?.maps || !containerRef.current) {
        setFailed(true)
        return
      }
      const kakao = window.kakao.maps
      // Initial fallback center — 수원시청 근방. Replaced once geocoding resolves.
      const initialCenter = new kakao.LatLng(37.2632, 127.0286)
      const map = new kakao.Map(containerRef.current, {
        center: initialCenter,
        level: 3,
        draggable: false,
      })

      const geocoder = new kakao.services.Geocoder()
      geocoder.addressSearch(address, (result, status) => {
        if (cancelled) return
        if (status === kakao.services.Status.OK && result[0]) {
          const coords = new kakao.LatLng(
            Number(result[0].y),
            Number(result[0].x),
          )
          map.setCenter(coords)
          new kakao.Marker({ position: coords, map })
        }
      })
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [address, key])

  // No key configured at build time → render the static fallback. Done
  // outside the effect (no setState-in-effect lint warning).
  if (!key || failed) return <>{fallback}</>

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`${venueName} 카카오맵 미리보기`}
      className={
        'mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-sm bg-paper ring-1 ring-line transition-opacity duration-500 ' +
        (ready ? 'opacity-100' : 'opacity-60')
      }
    />
  )
}
