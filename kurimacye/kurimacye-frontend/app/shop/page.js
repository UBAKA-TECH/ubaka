import { headers } from "next/headers";
import { isBot } from "../../lib/bot";
import SPAContainer from "../SPAContainer";
import Link from "next/link";
import { buildMetadata } from "../../lib/seo";
import { safeFetchApi } from "../../lib/api";

export async function generateMetadata({ searchParams }) {
  const category = searchParams?.category;
  const title = category ? `${category} products` : "Shop";
  const query = category ? `?category=${encodeURIComponent(category)}` : "";

  return buildMetadata({
    title,
    description:
      "Browse premium products and services from verified Kuri Macye sellers.",
    path: `/shop${query}`
  });
}

async function SSRShopPage({ searchParams }) {
  const query = new URLSearchParams();
  if (searchParams?.category) query.set("category", searchParams.category);
  if (searchParams?.search) query.set("search", searchParams.search);
  if (searchParams?.sort) query.set("sort", searchParams.sort);

  const [productsRes, categoriesRes] = await Promise.all([
    safeFetchApi(`/products${query.toString() ? `?${query}` : ""}`, { revalidate: 60 }),
    safeFetchApi("/categories", { revalidate: 120 })
  ]);

  const products = productsRes?.data || productsRes?.products || [];
  const categories = categoriesRes?.data || [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Shop</h1>
      <p className="mt-2 text-charcoal-500">
        Server-rendered catalog pages for better crawlability and indexing.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className="rounded-full border border-cream-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-cream-50"
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${encodeURIComponent(category.slug || category.name || category.id)}`}
            className="rounded-full border border-cream-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-cream-50"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.slug || product.id}`}
            className="rounded-xl border border-cream-300 bg-white p-4 shadow-sm hover:shadow-md"
          >
            <h2 className="line-clamp-2 font-semibold">{product.name}</h2>
            <p className="mt-2 text-sm text-charcoal-500">
              {Number(product.price || 0).toLocaleString()} RWF
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}

export default async function ShopPage(props) {
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || "";
  
  if (isBot(userAgent)) {
    return <SSRShopPage {...props} />;
  }

  return <SPAContainer />;
}

