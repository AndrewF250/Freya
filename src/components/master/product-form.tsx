"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { CATEGORIES, CATEGORY_KEYS, CONCERNS, CONCERN_KEYS, HAIR_TYPES, HAIR_TYPE_KEYS } from "@/lib/catalog";
import { removeProduct, saveProductFromInput, type SaveProductResult } from "@/lib/master-store";
import { withBasePath } from "@/lib/paths";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type EditableProduct = {
  id: string;
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
};

export function ProductForm({
  product,
  lines,
  justCreated = false,
}: {
  product?: EditableProduct;
  lines: string[];
  justCreated?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<SaveProductResult | null>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [visible, setVisible] = useState(product?.visible ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const currentImage = removeImage ? "" : preview ?? product?.image ?? "";
  const imageSrc = currentImage.startsWith("data:") || currentImage.startsWith("blob:")
    ? currentImage
    : currentImage
      ? withBasePath(currentImage)
      : "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setState(null);

    const fd = new FormData(e.currentTarget);
    const nameRu = String(fd.get("nameRu") ?? "").trim();
    const nameEn = String(fd.get("nameEn") ?? "").trim();
    const line = String(fd.get("line") ?? "").trim() || "Davines";
    const category = String(fd.get("category") ?? "other");
    const volume = String(fd.get("volume") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const usage = String(fd.get("usage") ?? "").trim();
    const price = Math.round(Number(fd.get("price")));
    const oldPriceRaw = String(fd.get("oldPrice") ?? "").trim();
    const oldPrice = oldPriceRaw ? Math.round(Number(oldPriceRaw)) : null;
    const imagePath = String(fd.get("imagePath") ?? "").trim();
    const file = fd.get("imageFile");

    if (nameRu.length < 2) {
      setState({ ok: false, message: "Укажите название товара." });
      setPending(false);
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setState({ ok: false, message: "Укажите цену — целое число больше нуля." });
      setPending(false);
      return;
    }
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= price)) {
      setState({ ok: false, message: "Старая цена должна быть больше текущей — или оставьте поле пустым." });
      setPending(false);
      return;
    }
    if (!CATEGORY_KEYS.includes(category as (typeof CATEGORY_KEYS)[number])) {
      setState({ ok: false, message: "Выберите тип продукта." });
      setPending(false);
      return;
    }

    let image = product?.image ?? "";
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_IMAGE_BYTES) {
        setState({ ok: false, message: "Файл слишком большой — максимум 5 МБ." });
        setPending(false);
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setState({ ok: false, message: "Изображение должно быть в формате JPG, PNG или WEBP." });
        setPending(false);
        return;
      }
      image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Не удалось прочитать файл."));
        reader.readAsDataURL(file);
      });
    } else if (removeImage) {
      image = "";
    } else if (imagePath) {
      image = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    }

    const concerns = CONCERN_KEYS.filter((c) => fd.get(`concern:${c}`) === "on");
    const hairTypes = HAIR_TYPE_KEYS.filter((h) => fd.get(`hair:${h}`) === "on");

    const result = saveProductFromInput(product?.id ?? null, {
      nameRu,
      nameEn,
      line,
      category,
      volume,
      price,
      oldPrice,
      description,
      usage,
      image,
      concerns,
      hairTypes,
      visible,
      featured,
    });

    setPending(false);
    setState(result);

    if (result.ok && !product) {
      router.push(`/master/products/edit?id=${result.id}&created=1`);
    }
  }

  function handleDelete() {
    if (!product) return;
    if (!confirm(`Удалить «${product.nameRu}»? Это необратимо.`)) return;
    removeProduct(product.id);
    router.push("/master/products?deleted=1");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-10">
      <form id="product-form" onSubmit={handleSubmit} className="card p-6 md:p-8">
        <Fieldset title="Основное">
          <label className="sm:col-span-2">
            <span className="field-label">Название по-русски *</span>
            <input
              name="nameRu"
              required
              minLength={2}
              defaultValue={product?.nameRu}
              placeholder="Шампунь для глубокого увлажнения волос"
              className="field"
            />
          </label>

          <label>
            <span className="field-label">Название на латинице</span>
            <input name="nameEn" defaultValue={product?.nameEn} placeholder="MoMo Shampoo" className="field" />
            <span className="mt-1.5 block text-[12px] text-muted">Показывается крупно в карточке товара.</span>
          </label>

          <label>
            <span className="field-label">Линейка</span>
            <input
              name="line"
              defaultValue={product?.line ?? "Davines"}
              list="lines-list"
              placeholder="MoMo"
              className="field"
            />
            <datalist id="lines-list">
              {lines.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </label>

          <label>
            <span className="field-label">Тип продукта *</span>
            <select name="category" defaultValue={product?.category ?? "shampoo"} className="field">
              {CATEGORY_KEYS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIES[c]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="field-label">Объём</span>
            <input name="volume" defaultValue={product?.volume} placeholder="250 мл" className="field" />
          </label>
        </Fieldset>

        <Fieldset title="Цена">
          <label>
            <span className="field-label">Ваша цена, ₽ *</span>
            <input
              name="price"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={product?.price}
              placeholder="3200"
              className="field"
            />
          </label>

          <label>
            <span className="field-label">Старая цена, ₽</span>
            <input
              name="oldPrice"
              type="number"
              min={1}
              step={1}
              defaultValue={product?.oldPrice ?? ""}
              placeholder="—"
              className="field"
            />
            <span className="mt-1.5 block text-[12px] text-muted">Заполните, чтобы показать скидку зачёркнутой.</span>
          </label>
        </Fieldset>

        <Fieldset title="Описание">
          <label className="sm:col-span-2">
            <span className="field-label">Что это и для кого</span>
            <textarea
              name="description"
              rows={5}
              defaultValue={product?.description}
              placeholder="Шампунь для сухих волос на экстракте жёлтой дыни…"
              className="field resize-y"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="field-label">Как применять</span>
            <textarea
              name="usage"
              rows={3}
              defaultValue={product?.usage}
              placeholder="Нанести на влажные волосы, вспенить, смыть."
              className="field resize-y"
            />
          </label>
        </Fieldset>

        <Fieldset title="Теги для подбора" columns={1}>
          <p className="-mt-1 text-[13px] leading-relaxed text-muted">
            По этим тегам квиз подбирает уход. Чем точнее отметите, тем лучше попадание.
          </p>

          <div>
            <p className="field-label">Какие задачи решает</p>
            <div className="flex flex-wrap gap-2">
              {CONCERN_KEYS.map((c) => (
                <CheckChip key={c} name={`concern:${c}`} label={CONCERNS[c]} defaultChecked={product?.concerns.includes(c)} />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="field-label">Для каких волос</p>
            <div className="flex flex-wrap gap-2">
              {HAIR_TYPE_KEYS.map((h) => (
                <CheckChip key={h} name={`hair:${h}`} label={HAIR_TYPES[h]} defaultChecked={product?.hairTypes.includes(h)} />
              ))}
            </div>
          </div>
        </Fieldset>

        <Fieldset title="Фотография" columns={1}>
          <div className="flex flex-wrap items-start gap-5">
            <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-card border border-line bg-paper">
              {imageSrc ? (
                <Image src={imageSrc} alt="" fill sizes="120px" className="object-contain p-2" unoptimized />
              ) : (
                <span className="flex h-full items-center justify-center px-2 text-center text-[11px] text-muted">
                  Фото пока нет
                </span>
              )}
            </div>

            <div className="min-w-[220px] flex-1">
              <label>
                <span className="field-label">Путь к файлу на сайте</span>
                <input
                  name="imagePath"
                  defaultValue={product?.image && !product.image.startsWith("data:") ? product.image : ""}
                  placeholder="/products/momo-shampoo.jpg"
                  className="field"
                />
              </label>

              <input
                name="imageFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setPreview(file ? URL.createObjectURL(file) : null);
                  if (file) setRemoveImage(false);
                }}
                className="field mt-3 !py-2.5 file:mr-3 file:rounded-pill file:border-0 file:bg-sand file:px-3 file:py-1.5 file:text-[13px]"
              />
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                JPG, PNG или WEBP до 5 МБ. Для публикации на сайте положите файл в public/products/ и укажите путь выше.
              </p>

              {product?.image && !preview && (
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => setRemoveImage(e.target.checked)}
                    className="h-4 w-4 accent-[#1b2430]"
                  />
                  Удалить текущее фото
                </label>
              )}
            </div>
          </div>
        </Fieldset>

        {state && (
          <p
            role="alert"
            className={`mt-6 rounded-lg border px-4 py-3 text-[14px] ${
              state.ok ? "border-olive bg-olive-soft text-olive-deep" : "border-line bg-sand text-ink"
            }`}
          >
            {state.message}
          </p>
        )}

        {justCreated && !state && (
          <p className="mt-6 rounded-lg border border-olive bg-olive-soft px-4 py-3 text-[14px] text-olive-deep">
            Товар создан. Проверьте описание и фото — и он появится в каталоге после экспорта JSON.
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-3 border-t border-line pt-6">
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Сохраняю…" : product ? "Сохранить изменения" : "Добавить товар"}
          </button>
          <Link href="/master/products" className="btn btn-soft">
            К списку
          </Link>
        </div>
      </form>

      <aside className="lg:sticky lg:top-[86px]">
        <div className="card p-5">
          <p className="eyebrow mb-4">Публикация</p>

          <Toggle
            label="Показывать в каталоге"
            hint="Снимите галочку, чтобы временно спрятать товар."
            checked={visible}
            onChange={setVisible}
          />
          <Toggle
            label="Выводить на главной"
            hint="Блок «Выбор Кристины»."
            checked={featured}
            onChange={setFeatured}
          />

          <p className="mt-5 text-[12px] leading-relaxed text-muted">
            Галочки сохраняются вместе с формой — нажмите «Сохранить».
          </p>
        </div>

        {product && (
          <div className="card mt-5 p-5">
            <p className="eyebrow mb-3">Удаление</p>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Товар исчезнет из каталога. Если нужно временно убрать — снимите галочку «Показывать в каталоге».
            </p>
            <button type="button" onClick={handleDelete} className="btn btn-outline btn-sm mt-4 w-full">
              Удалить товар
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="mt-3 flex cursor-pointer items-start gap-3 first:mt-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#1b2430]"
      />
      <span>
        <span className="block text-[14px]">{label}</span>
        <span className="mt-0.5 block text-[12px] leading-relaxed text-muted">{hint}</span>
      </span>
    </label>
  );
}

function Fieldset({
  title,
  children,
  columns = 2,
}: {
  title: string;
  children: React.ReactNode;
  columns?: 1 | 2;
}) {
  return (
    <fieldset className="mt-8 first:mt-0">
      <legend className="eyebrow mb-4">{title}</legend>
      <div className={columns === 2 ? "grid gap-5 sm:grid-cols-2" : "grid gap-5"}>{children}</div>
    </fieldset>
  );
}

function CheckChip({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <label className="chip !cursor-pointer" data-active={checked}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  );
}
