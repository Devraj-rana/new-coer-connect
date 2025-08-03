/** @type {import('next').NextConfig} */
const nextConfig = {
    // Firebase hosting configuration
    output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
    trailingSlash: true,
    distDir: 'out',
    
    images:{
        // Disable image optimization for static export
        unoptimized: process.env.NODE_ENV === 'production',
        remotePatterns:[
            {
                protocol:'https',
                hostname:'res.cloudinary.com'
            },
            {
                protocol:'https',
                hostname:'img.clerk.com'
            },
            {
                protocol:'https',
                hostname:'images.clerk.dev'
            },
            {
                protocol:'https',
                hostname:'images.clerk.com'
            },
            {
                protocol:'https',
                hostname:'lh3.googleusercontent.com'
            },
            {
                protocol:'https',
                hostname:'firebasestorage.googleapis.com'
            }
        ]
    },
    experimental:{
        serverActions: {
            bodySizeLimit: '20mb' // Set desired value here
        }
    }
};

export default nextConfig;
