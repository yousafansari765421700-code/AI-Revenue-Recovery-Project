import Link from "next/link";
import { Button } from "@/components/ui/Button";
import ProductCard from "@/components/store/ProductCard";
import { getStoreProducts } from "@/lib/data/store/server";

export const dynamic = 'force-dynamic';

export default async function StoreHomePage() {
  const featuredProducts = await getStoreProducts({ sortBy: "newest" });
  const displayProducts = featuredProducts.slice(0, 4);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary text-white">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white_30%,transparent)]" />
        <div className="relative px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Recover Revenue. Grow Smarter.</h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8">
              Explore powerful products and solutions designed to help businesses reduce payment failures and recover lost revenue.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/store/products">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Browse Products
                </Button>
              </Link>
              <Link href="/store/cart">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-dark">Featured Products</h2>
            <p className="text-muted">Hand-picked products to help you recover revenue</p>
          </div>
          <Link href="/store/products">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>
        {displayProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <p className="text-muted text-lg">No products available yet</p>
            <p className="text-muted text-sm mt-2">Check back soon for new products</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
