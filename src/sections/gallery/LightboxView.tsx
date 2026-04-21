import Lightbox from 'yet-another-react-lightbox'
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
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      on={{ view: ({ index: i }) => onView(i) }}
      slides={images.map((img) => ({ src: img.src, alt: img.alt }))}
      controller={{ closeOnBackdropClick: true }}
    />
  )
}
