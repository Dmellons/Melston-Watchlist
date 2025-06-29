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
    
    const [error, setError] = useState(null)
    const [imageSrc, setImageSrc] = useState<string>("")
    
    // Create fallback URL if not provided
    if(!fallback){
        const width = props.width ? props.width : 200
        const height = props.height ? props.height : 300
        fallback = `https://via.placeholder.com/${width}x${height}?text=No+Image`
    }

    useEffect(() => {
        setError(null)
        
        // Check if src is valid (not null, undefined, or contains 'null')
        if (!src || src === 'null' || src.includes('/null') || src === 'undefined') {
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