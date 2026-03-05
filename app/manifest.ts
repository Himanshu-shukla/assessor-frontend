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
                src: "/favicon.png",
                sizes: "any",
                type: "image/png",
            },
            {
                src: "/favicon.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/favicon.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
