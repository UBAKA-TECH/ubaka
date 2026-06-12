import { notFound } from "next/navigation";
import { buildMetadata } from "../../../lib/seo";
import { getSiteUrl, safeFetchApi } from "../../../lib/api";
import { headers } from "next/headers";
import { isBot } from "../../../lib/bot";
import SPAContainer from "../../SPAContainer";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await safeFetchApi(`/blogs/${resolvedParams.id}`, { revalidate: 300 });
  if (!post) {
    return buildMetadata({
      title: "Blog post not found",
      path: `/blog/${resolvedParams.id}`,
      noIndex: true
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt || "Read this Kuri Macye article.",
    path: `/blog/${post.slug || post.id}`
  });
}

async function SSRBlogPostPage({ params }) {
  const resolvedParams = await params;
  const post = await safeFetchApi(`/blogs/${resolvedParams.id}`, { revalidate: 300 });
  if (!post) notFound();

  const siteUrl = getSiteUrl();
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      "@type": "Person",
      name: post.author || "Kuri Macye Team"
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug || post.id}`
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <p className="text-xs uppercase tracking-wide text-charcoal-400">
        {post.category || "Marketplace"} · {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <h1 className="mt-2 text-4xl font-extrabold">{post.title}</h1>
      {post.excerpt && <p className="mt-4 text-lg text-charcoal-500">{post.excerpt}</p>}
      <article className="prose mt-8 max-w-none whitespace-pre-wrap rounded-xl border border-cream-300 bg-white p-6">
        {post.content}
      </article>
    </main>
  );
}

export default async function BlogPostPage(props) {
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || "";
  
  if (isBot(userAgent)) {
    return <SSRBlogPostPage {...props} />;
  }

  return <SPAContainer />;
}

