n/** @type {import('next').NextConfig} */
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
        ],
    },
};

export default nextConfig;
