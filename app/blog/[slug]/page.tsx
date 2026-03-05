import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
    params: { slug: string };
};

// This is a dummy data fetcher for demonstration
async function getPost(slug: string) {
    const posts: Record<string, { title: string; description: string }> = {
        "how-to-rank-your-resume": {
            title: "How to Rank Your Resume: The Ultimate Guide",
            description: "Learn the secrets to climbing the resume rankings and landing your dream job with AI-powered insights.",
        },
        "ats-optimization-tips": {
            title: "10 ATS Optimization Tips for 2024",
            description: "Master the Applicant Tracking Systems with these essential optimization tips for your resume.",
        },
    };
    return posts[slug];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await getPost(params.slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: post.title,
        description: post.description,
        alternates: {
            canonical: `https://masterynexus.com/blog/${params.slug}`,
        },
        openGraph: {
            title: post.title,
            description: post.description,
            images: ["/opengraph-image.png"],
        },
    };
}

export default async function BlogPost({ params }: Props) {
    const post = await getPost(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen p-8 max-w-4xl mx-auto">
            <Link href="/" className="text-sky-500 hover:underline mb-8 block">
                ← Back to Skill Rank
            </Link>
            <article>
                <header className="mb-8">
                    <h1 className="text-4xl font-black text-slate-800 mb-4">{post.title}</h1>
                    <p className="text-slate-600 text-lg italic">{post.description}</p>
                </header>
                <div className="prose prose-slate max-w-none">
                    <p>
                        This is a placeholder for your SEO-optimized blog content. To rank first for
                        <strong> "rank your resume"</strong>, you should produce high-quality articles
                        using these keywords naturally.
                    </p>
                    {/* Main content would go here */}
                </div>
            </article>
        </main>
    );
}
