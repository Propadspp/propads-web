import { client } from "@/lib/sanity";
import PropadsPage from "@/components/PropadsPage";

export type Product = {
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
  return <PropadsPage products={products} />;
}
