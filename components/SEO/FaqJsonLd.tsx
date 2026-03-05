export default function FaqJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is Skill Rank?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Skill Rank is an AI-powered resume analysis tool that helps you rank your resume against industry standards and optimize it for ATS (Applicant Tracking Systems)."
                }
            },
            {
                "@type": "Question",
                "name": "How does the resume ranking work?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our advanced AI analyzes your skills, experience, and keywords to provide a detailed score and actionable feedback based on current market trends."
                }
            },
            {
                "@type": "Question",
                "name": "Is my resume data secure?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we use bank-grade encryption to ensure your personal data is protected. Resumes are processed securely and never shared with third parties."
                }
            },
            {
                "@type": "Question",
                "name": "How can I improve my resume rank?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Skill Rank provides specific recommendations on keywords, formatting, and skill gaps to help you climb the rankings and land more interviews."
                }
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schema)
            }}
        />
    );
}
