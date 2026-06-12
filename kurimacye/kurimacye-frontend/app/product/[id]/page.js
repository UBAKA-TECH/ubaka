import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata } from "../../../lib/seo";
import { getSiteUrl, safeFetchApi, toAbsoluteAssetUrl } from "../../../lib/api";
import { headers } from "next/headers";
import { isBot } from "../../../lib/bot";
import SPAContainer from "../../SPAContainer";


export async function generateMetadata({ params }) {
  const product = await safeFetchApi(`/products/${params.id}`, { revalidate: 60 });
  if (!product) {
    return buildMetadata({
      title: "Product not found",
      path: `/product/${params.id}`,
      noIndex: true
    });
  }

  return buildMetadata({
    title: product.name,
    description:
      product.description || `Buy ${product.name} from trusted sellers on Kuri Macye.`,
    path: `/product/${product.slug || product.id}`,
    image: toAbsoluteAssetUrl(product.image) || "/images/logo.png"
  });
}

async function SSRProductDetailPage({ params }) {
  const resolvedParams = await params;
  const product = await safeFetchApi(`/products/${resolvedParams.id}`, { revalidate: 60 });
  if (!product) notFound();

  const related = (await safeFetchApi(`/products/${product.id}/related`, { revalidate: 60 })) || [];
  const siteUrl = getSiteUrl();

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: toAbsoluteAssetUrl(product.image),
    brand: { "@type": "Brand", name: "Kuri Macye" },
    offers: {
      "@type": "Offer",
      priceCurrency: "RWF",
      price: Number(product.price || 0),
      availability:
        Number(product.stock || 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}/product/${product.slug || product.id}`
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <p className="text-xs uppercase tracking-wide text-charcoal-400">Product detail</p>
      <h1 className="mt-2 text-4xl font-extrabold">{product.name}</h1>
      <p className="mt-3 text-lg text-charcoal-500">
        {Number(product.price || 0).toLocaleString()} RWF
      </p>

      <div className="mt-6 rounded-xl border border-cream-300 bg-white p-6">
        <p className="whitespace-pre-wrap">{product.description || "No description available."}</p>
      </div>

      {Array.isArray(related) && related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold">Related products</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.slice(0, 8).map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug || item.id}`}
                className="rounded-xl border border-cream-300 bg-white p-4 shadow-sm hover:shadow-md"
              >
                <h3 className="line-clamp-2 font-semibold">{item.name}</h3>
                <p className="mt-2 text-sm text-charcoal-500">
                  {Number(item.price || 0).toLocaleString()} RWF
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default async function ProductDetailPage(props) {
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || "";
  
  if (isBot(userAgent)) {
    return <SSRProductDetailPage {...props} />;
  }

  return <SPAContainer />;
}

