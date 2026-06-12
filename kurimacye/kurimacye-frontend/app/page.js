import { headers } from "next/headers";
import { isBot } from "../lib/bot";
import SPAContainer from "./SPAContainer";
import Link from "next/link";
import { buildMetadata } from "../lib/seo";
import { fetchApi, getSiteUrl, safeFetchApi } from "../lib/api";

export const metadata = buildMetadata({
  title: "Premium Multivendor Marketplace",
  description:
    "Shop quality products from verified local sellers across Rwanda on Kuri Macye.",
  path: "/"
});

// Render the SSR homepage only when it is a bot/crawler
async function SSRHomePage() {
  const [featuredRes, categoriesRes, blogs] = await Promise.all([
    safeFetchApi("/products/featured/list?limit=8", { revalidate: 120 }),
    safeFetchApi("/categories", { revalidate: 120 }),
    safeFetchApi("/blogs", { revalidate: 300 })
  ]);

  const featured = Array.isArray(featuredRes)
    ? featuredRes
    : featuredRes?.data || featuredRes?.products || [];
  const categories = categoriesRes?.data || [];
  const latestBlogs = Array.isArray(blogs) ? blogs.slice(0, 3) : [];

  const siteUrl = getSiteUrl();
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kuri Macye",
    url: siteUrl,
    logo: `${siteUrl}/images/logo.png`,
    sameAs: [siteUrl]
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <section className="rounded-2xl bg-gradient-to-r from-charcoal-700 to-charcoal-900 px-6 py-10 text-white">
        <p className="mb-3 inline-block rounded-full bg-terracotta-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-terracotta-200">
          Rwanda marketplace
        </p>
        <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
          Kuri Macye
        </h1>
        <p className="mt-3 max-w-2xl text-cream-200">
          Discover trusted local sellers, premium products, and daily deals.
          This page is server-rendered for search engines and users.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-terracotta-50 px-5 py-2.5 text-sm font-bold hover:bg-terracotta-600"
          >
            Shop now
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold hover:bg-white/10"
          >
            Read blog
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Featured products</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug || product.id}`}
              className="rounded-xl border border-cream-300 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <h3 className="line-clamp-2 font-semibold">{product.name}</h3>
              <p className="mt-2 text-sm text-charcoal-500">
                {Number(product.price || 0).toLocaleString()} RWF
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Top categories</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.slice(0, 10).map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.slug || category.name || category.id)}`}
              className="rounded-full border border-cream-300 bg-white px-4 py-2 text-sm font-medium hover:bg-cream-50"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Latest stories</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {latestBlogs.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug || post.id}`}
              className="rounded-xl border border-cream-300 bg-white p-4 shadow-sm hover:shadow-md"
            >
              <h3 className="line-clamp-2 font-semibold">{post.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-charcoal-500">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default async function HomePage() {
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || "";
  
  if (isBot(userAgent)) {
    return <SSRHomePage />;
  }

  return <SPAContainer />;
}

