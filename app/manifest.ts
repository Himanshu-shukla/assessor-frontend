import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Skill Rank | Professional Resume Ranking",
        short_name: "Skill Rank",
        description: "AI-powered resume ranking and skill analysis tool.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0ea5e9",
        icons: [
            {
                src: "/favicon-16x16.png",
                sizes: "16x16",
                type: "image/png",
            },
            {
                src: "/favicon-32x32.png",
                sizes: "32x32",
                type: "image/png",
            },
            {
                src: "/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
