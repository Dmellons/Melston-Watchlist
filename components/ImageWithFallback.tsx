import Image from "next/image"
import { useEffect, useState } from "react"

const ImageWithFallback = ({
    src,
    alt,
    fallback,
    priority,
    ...props
}:{
    src: string,
    alt: string,
    fallback?: string,
    priority?: boolean
    [key: string]: any
}) => {
    
    const [error, setError] = useState<boolean | null>(null)
    const [imageSrc, setImageSrc] = useState<string>("")

    // Local placeholder — remote placeholder services (via.placeholder.com) are
    // dead and hammer the image optimizer with failed fetches.
    if(!fallback){
        fallback = '/no-image.svg'
    }

    useEffect(() => {
        setError(null)

        // Check if src is valid: not null/undefined, no 'null'/'undefined'
        // baked into the URL, and no empty image path (e.g. ".../w500/")
        if (
            !src ||
            src === 'null' ||
            src === 'undefined' ||
            src.includes('/null') ||
            src.includes('/undefined') ||
            src.endsWith('/')
        ) {
            setImageSrc(fallback)
        } else {
            setImageSrc(src)
        }
    }, [src, fallback])
  
    return (
        <Image
            alt={alt}
            onError={() => {
                setError(true)
                setImageSrc(fallback)
            }}
            src={imageSrc}
            priority={!!priority}
            {...props}
        />
    )
}

export default ImageWithFallback