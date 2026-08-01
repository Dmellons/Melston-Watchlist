/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "image.tmdb.org", // For TMDB images and posters
            },
            {
                protocol: "https",
                hostname: "cdn.watchmode.com", // for watchmode movie posters
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com", // for google profile images
            },
            {
                protocol: "https",
                hostname: "images.igdb.com", // For IGDB game images
            },
            {
                protocol: "https",
                hostname: "img.youtube.com", // YouTube video thumbnails
            },
            {
                protocol: "https",
                hostname: "i.ytimg.com", // YouTube video thumbnails (alt host)
            },
        ],
    },
};

export default nextConfig;
