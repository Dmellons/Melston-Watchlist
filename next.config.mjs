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
                hostname: "via.placeholder.com", // for placeholder images
            },
            {
                protocol: "https",
                hostname: "picsum.photos", // for placeholder images
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com", // for google profile images
            },
        ],
    },
};

export default nextConfig;
