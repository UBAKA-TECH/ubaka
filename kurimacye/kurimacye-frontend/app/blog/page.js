import Link from "next/link";
import { buildMetadata } from "../../lib/seo";
import { safeFetchApi } from "../../lib/api";
import { headers } from "next/headers";
import { isBot } from "../../lib/bot";
import SPAContainer from "../SPAContainer";

export const metadata = buildMetadata({
  title: "Blog",
  description: "Seller guides, marketplace updates, and e-commerce tips from Kuri Macye.",
  path: "/blog"
});


async function SSRBlogPage() {
  const blogs = await safeFetchApi("/blogs", { revalidate: 300 });
  const posts = Array.isArray(blogs) ? blogs : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Kuri Macye Blog</h1>
      <p className="mt-2 text-charcoal-500">
        Insights for sellers and shoppers in Rwanda.
      </p>

      <section className="mt-8 space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-xl border border-cream-300 bg-white p-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-charcoal-400">
              {post.category || "Marketplace"} ·{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <h2 className="mt-2 text-xl font-bold">
              <Link href={`/blog/${post.slug || post.id}`} className="hover:text-terracotta-600">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-charcoal-500">{post.excerpt}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default async function BlogPage() {
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || "";
  
  if (isBot(userAgent)) {
    return <SSRBlogPage />;
  }

  return <SPAContainer />;
}

