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
  /** Поля из карточки davines.ru */
  lineTagline?: string;
  series?: string[];
  sku?: string;
  suitability?: string;
  keyIngredient?: string;
  pairing?: string;
  composition?: string;
  specs?: { name: string; value: string }[];
  variants?: { volume: string; slug: string }[];
  /** «Сопутствующие товары» с davines.ru — slug наших товаров. */
  related?: string[];
  gallery?: string[];
  sourceUrl?: string;
};

export const products = productsJson as ProductRow[];
export const settings = settingsJson as Settings;
