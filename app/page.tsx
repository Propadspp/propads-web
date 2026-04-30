import Image from "next/image";
import { client, urlFor } from "@/lib/sanity";
import BuyButton from "@/components/BuyButton";

type Product = {
  _id: string;
  name: string;
  price: number;
  slug: { current: string };
  images: { asset: object; alt?: string }[];
  category: string;
};

async function getProducts(): Promise<Product[]> {
  return client.fetch(`*[_type == "product"] | order(_createdAt asc) {
    _id, name, price, slug, images, category
  }`);
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight">PROPADS</h1>
      </header>

      <section className="px-8 py-12">
        <h2 className="text-xl font-semibold mb-8 text-zinc-200">Vörur</h2>

        {products.length === 0 ? (
          <p className="text-zinc-500">Engar vörur fundust. Bættu vörum inn í Sanity Studio.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div key={product._id} className="flex flex-col gap-3">
                <div className="relative aspect-square bg-zinc-900 rounded-lg overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      src={urlFor(product.images[0]).width(400).height(400).url()}
                      alt={product.images[0].alt ?? product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
                      Engin mynd
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-medium text-white">{product.name}</p>
                  <p className="text-zinc-400 text-sm">{product.price.toLocaleString("is-IS")} kr.</p>
                  <BuyButton
                    productId={product._id}
                    productName={product.name}
                    price={product.price}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
