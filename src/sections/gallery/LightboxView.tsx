import Lightbox from 'yet-another-react-lightbox'
import Video from 'yet-another-react-lightbox/plugins/video'
import 'yet-another-react-lightbox/styles.css'
import type { GalleryItem } from '../../lib/galleryPlaceholders'

interface LightboxViewProps {
  items: GalleryItem[]
  open: boolean
  index: number
  onClose: () => void
  onView: (index: number) => void
}

// yet-another-react-lightbox slide shape for video:
//   { type: 'video', sources: [{ src, type }], poster, autoPlay, ... }
// We unify both photo and video into the lightbox's `slides` array.
function toSlide(item: GalleryItem) {
  if (item.type === 'video') {
    return {
      type: 'video' as const,
      sources: [{ src: item.src, type: 'video/mp4' }],
      poster: item.poster,
      width: 1280,
      height: 720,
      autoPlay: true,
      controls: true,
      playsInline: true,
      loop: false,
    }
  }
  return { src: item.src, alt: item.alt }
}

export default function LightboxView({
  items,
  open,
  index,
  onClose,
  onView,
}: LightboxViewProps) {
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      plugins={[Video]}
      on={{ view: ({ index: i }) => onView(i) }}
      slides={items.map(toSlide)}
      controller={{ closeOnBackdropClick: true }}
    />
  )
}
