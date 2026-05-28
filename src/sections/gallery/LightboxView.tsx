import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import type { GalleryImage } from '../../lib/galleryPlaceholders'

interface LightboxViewProps {
  images: GalleryImage[]
  open: boolean
  index: number
  onClose: () => void
  onView: (index: number) => void
}

export default function LightboxView({
  images,
  open,
  index,
  onClose,
  onView,
}: LightboxViewProps) {
  // Single-tap on the slide toggles the chrome (close button, arrows,
  // toolbar). Gestures (pinch zoom, drag pan, swipe to next, pull-down
  // to close) keep working regardless — the chrome is just a visual
  // layer whose pointer-events are disabled when hidden.
  const [chromeHidden, setChromeHidden] = useState(false)

  // Reset chrome state on close so a fresh viewing session always opens
  // with the controls visible.
  const handleClose = () => {
    setChromeHidden(false)
    onClose()
  }

  const hiddenStyle = chromeHidden
    ? {
        opacity: 0,
        pointerEvents: 'none' as const,
        transition: 'opacity 200ms ease',
      }
    : {
        opacity: 1,
        transition: 'opacity 200ms ease',
      }

  return (
    <Lightbox
      open={open}
      close={handleClose}
      index={index}
      on={{
        view: ({ index: i }) => onView(i),
        click: () => setChromeHidden((prev) => !prev),
      }}
      slides={images.map((img) => ({ src: img.src, alt: img.alt }))}
      controller={{
        closeOnBackdropClick: true,
        // Both vertical swipes close the lightbox — pull-down matches
        // the iOS photo app, pull-up adds an extra mid-thumb fallback.
        closeOnPullDown: true,
        closeOnPullUp: true,
      }}
      plugins={[Zoom]}
      styles={{
        toolbar: hiddenStyle,
        navigationPrev: hiddenStyle,
        navigationNext: hiddenStyle,
      }}
      zoom={{
        maxZoomPixelRatio: 5,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        doubleClickMaxStops: 2,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
        pinchZoomDistanceFactor: 100,
        scrollToZoom: false,
      }}
    />
  )
}
