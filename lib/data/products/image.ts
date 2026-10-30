import type { Product } from "./client";

const NAME_MAP: Record<string, string> = {
  "t-shirt": "tshirt-branded",
  "tshirt": "tshirt-branded",
  "t shirt": "tshirt-branded",
  "t-shirts": "tshirt-branded",
  "tshirts": "tshirt-branded",
  "tee": "tshirt-branded",
  "tees": "tshirt-branded",
  "jeans": "jeans",
  "denim": "jeans",
  "hoodie": "hoodie",
  "sweatshirt": "hoodie",
  "shoes": "shoes",
  "shoe": "shoes",
  "sneakers": "sneakers",
  "sneaker": "sneakers",
  "jacket": "jacket",
  "coat": "jacket",
  "laptop": "laptop",
  "notebook": "laptop",
  "smartphone": "smartphone",
  "phone": "smartphone",
  "mobile": "smartphone",
  "headphones": "headphones",
  "earphones": "headphones",
  "earbuds": "headphones",
  "smart watch": "smartwatch",
  "smartwatch": "smartwatch",
  "watch": "smartwatch",
  "keyboard": "keyboard",
  "mouse": "mouse",
  "chair": "chair",
  "table": "table",
  "lamp": "lamp",
  "plant": "plant",
  "football": "football",
  "soccer ball": "football",
  "basketball": "basketball",
  "tennis racket": "tennis-racket",
  "tennis": "tennis-racket",
  "sports shoes": "sneakers",
  "running shoes": "sneakers",
  "book": "book",
  "novel": "book",
  "kurti": "kurti",
  "lawn kurti": "lawn-kurti",
  "lawn kurti blue": "lawn-kurti",
  "lipstick": "lipstick",
  "matte lipstick": "matte-lipstick",
  "matte lipstick red": "matte-lipstick",
};

const CATEGORY_MAP: Record<string, string> = {
  "clothing": "placeholder-clothing",
  "apparel": "placeholder-clothing",
  "electronics": "placeholder-electronics",
  "tech": "placeholder-electronics",
  "gadgets": "placeholder-electronics",
  "home & garden": "placeholder-home",
  "home": "placeholder-home",
  "home and garden": "placeholder-home",
  "garden": "placeholder-home",
  "furniture": "placeholder-home",
  "sports": "placeholder-sports",
  "fitness": "placeholder-sports",
  "books": "placeholder-books",
  "reading": "placeholder-books",
  "beauty": "placeholder-beauty",
  "cosmetics": "placeholder-beauty",
  "other": "placeholder-beauty",
};

const DEFAULT_IMAGE = "/products/default-product.svg";

const PNG_SLUGS = new Set<string>(["tshirt-branded"]);

function extFor(slug: string): string {
  return PNG_SLUGS.has(slug) ? "png" : "svg";
}

function normalize(s: string | null | undefined): string {
  return (s || "").toLowerCase().trim().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function lookupName(name: string | null | undefined): string | null {
  const key = normalize(name);
  if (!key) return null;
  if (NAME_MAP[key]) return NAME_MAP[key];
  for (const needle of Object.keys(NAME_MAP)) {
    if (key.includes(needle)) return NAME_MAP[needle];
  }
  return null;
}

function lookupCategory(category: string | null | undefined): string | null {
  const key = normalize(category);
  if (!key) return null;
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  for (const needle of Object.keys(CATEGORY_MAP)) {
    if (key.includes(needle)) return CATEGORY_MAP[needle];
  }
  return null;
}

export function getProductImage(product: Partial<Product> | undefined | null): string {
  if (!product) return DEFAULT_IMAGE;

  if (product.image_url && product.image_url.trim() !== "") {
    return product.image_url.trim();
  }

  const nameSlug = lookupName(product.name);
  if (nameSlug) {
    return `/products/${nameSlug}.${extFor(nameSlug)}`;
  }

  const categorySlug = lookupCategory(product.category);
  if (categorySlug) {
    return `/products/${categorySlug}.${extFor(categorySlug)}`;
  }

  return DEFAULT_IMAGE;
}

export function getProductFallbackImage(product: Partial<Product> | undefined | null): string {
  const categorySlug = lookupCategory(product?.category) ?? "placeholder-beauty";
  return `/products/${categorySlug}.${extFor(categorySlug)}`;
}
