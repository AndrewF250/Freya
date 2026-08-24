import productsJson from "@/data/products.json";
import settingsJson from "@/data/settings.json";
import type { Settings } from "./settings";

export type ProductRow = {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  line: string;
  category: string;
  volume: string;
  price: number;
  oldPrice: number | null;
  description: string;
  usage: string;
  image: string;
  concerns: string[];
  hairTypes: string[];
  visible: boolean;
  featured: boolean;
  sortOrder: number;
};

export const products = productsJson as ProductRow[];
export const settings = settingsJson as Settings;
