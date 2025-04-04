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
    if(!fallback){
        const width = props.width ? props.width : 200
        const height = props.height ? props.height : 300
        fallback = `https://via.placeholder.com/${width ? width : "200"}x${height ? height : "300"}`
    }

  
    useEffect(() => {
      setError(null)
    }, [src])
  
    return (
      <Image
        alt={alt}
        onError={setError}
        src={error ? fallback : src}
        priority={!!priority}
        {...props}
      />
    )
  }

export default ImageWithFallback