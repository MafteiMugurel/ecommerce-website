import { useState, type ImgHTMLAttributes } from 'react'
import { GENERIC_PRODUCT_IMAGE } from '../utils/productImage'

interface ProductImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src: string
  /** imaginea afișată dacă `src` nu se poate încărca (ex. ilustrația categoriei) */
  fallbackSrc?: string
}

/**
 * Imagine de produs găzduită extern (URL), cu rezervă locală:
 * dacă site-ul sursă nu răspunde sau imaginea a fost ștearsă, se afișează `fallbackSrc`.
 */
export default function ProductImage({ src, fallbackSrc = GENERIC_PRODUCT_IMAGE, alt = '', ...rest }: ProductImageProps) {
  // Memorăm sursa care a eșuat; dacă produsul primește alt URL, se încearcă din nou
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const current = src && failedSrc !== src ? src : fallbackSrc

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (current !== fallbackSrc) setFailedSrc(src)
      }}
    />
  )
}
