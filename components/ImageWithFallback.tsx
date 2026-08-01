import Image from "next/image"
import { useEffect, useState } from "react"

// Check if src is valid: not null/undefined, no 'null'/'undefined'
// baked into the URL, and no empty image path (e.g. ".../w500/")
const resolveSrc = (src: string, fallback: string) =>
    (!src ||
        src === 'null' ||
        src === 'undefined' ||
        src.includes('/null') ||
        src.includes('/undefined') ||
        src.endsWith('/'))
        ? fallback
        : src

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
    const [errored, setErrored] = useState(false)

    // Local placeholder — remote placeholder services (via.placeholder.com) are
    // dead and hammer the image optimizer with failed fetches.
    if(!fallback){
        fallback = '/no-image.svg'
    }

    useEffect(() => {
        setErrored(false)
    }, [src])

    // Resolve synchronously so the first paint already has the real URL
    // (the old effect-driven state left src="" until after hydration).
    return (
        <Image
            alt={alt}
            onError={() => setErrored(true)}
            src={errored ? fallback : resolveSrc(src, fallback)}
            priority={!!priority}
            {...props}
        />
    )
}

export default ImageWithFallback
