"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  catalogFrom,
  uniqueCatalogKey,
  type CatalogEntry,
  type ResolvedCatalog,
} from "@/lib/catalog";
import { DEFAULT_IMAGE_BG, normalizeHex, sampleImageBackground } from "@/lib/image-bg";
import {
  removeProduct,
  saveProductFromInput,
  getStoredSettings,
  saveStoredSettings,
  type SaveProductResult,
} from "@/lib/master-store";
import { parseImageBgPresets } from "@/lib/booking-slots";
import { withBasePath } from "@/lib/paths";
import { ImageBgPicker } from "./image-bg-picker";

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
  imageBg?: string;
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imageBg, setImageBg] = useState(product?.imageBg ?? DEFAULT_IMAGE_BG);
  const [catalog, setCatalog] = useState<ResolvedCatalog>(() => catalogFrom(getStoredSettings()));
  const imageBgPresets = parseImageBgPresets(getStoredSettings());
  const lineOptions = [...new Set([...catalog.lines, ...lines, product?.line].filter(Boolean) as string[])];

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
    if (!catalog.categories.some((c) => c.key === category)) {
      setState({ ok: false, message: "Выберите тип продукта." });
      setPending(false);
      return;
    }

    let image = product?.image ?? "";
    let nextImageBg = normalizeHex(imageBg);
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
      try {
        nextImageBg = await sampleImageBackground(image);
        setImageBg(nextImageBg);
      } catch {
        /* keep manual color */
      }
    } else if (removeImage) {
      image = "";
    } else if (imagePath) {
      image = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    }

    const concerns = catalog.concerns.map((c) => c.key).filter((c) => fd.get(`concern:${c}`) === "on");
    const hairTypes = catalog.hairTypes.map((h) => h.key).filter((h) => fd.get(`hair:${h}`) === "on");
    persistCatalog({
      ...catalog,
      lines: catalog.lines.some((l) => l.toLowerCase() === line.toLowerCase())
        ? catalog.lines
        : [...catalog.lines, line],
    });

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
      imageBg: normalizeHex(nextImageBg),
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

  function persistCatalog(next: ResolvedCatalog) {
    const settings = getStoredSettings();
    saveStoredSettings({ ...settings, catalog: next });
    setCatalog(next);
  }

  function addCatalogEntry(kind: "categories" | "concerns" | "hairTypes", label: string) {
    const trimmed = label.trim();
    if (trimmed.length < 2) return;
    const list = catalog[kind];
    if (list.some((e) => e.label.toLowerCase() === trimmed.toLowerCase())) return;
    const entry: CatalogEntry = { key: uniqueCatalogKey(trimmed, list), label: trimmed };
    persistCatalog({ ...catalog, [kind]: [...list, entry] });
  }

  function addLine(label: string) {
    const trimmed = label.trim();
    if (trimmed.length < 2) return;
    if (catalog.lines.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return;
    persistCatalog({ ...catalog, lines: [...catalog.lines, trimmed] });
  }

  function handleDelete() {
    if (!product) return;
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

          <div>
            <label>
              <span className="field-label">Линейка</span>
              <input
                name="line"
                defaultValue={product?.line ?? lineOptions[0] ?? "Davines"}
                list="lines-list"
                placeholder="MoMo"
                className="field"
              />
              <datalist id="lines-list">
                {lineOptions.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </label>
            <AddInline placeholder="Новая линейка" onAdd={(label) => addLine(label)} />
          </div>

          <div>
            <label>
              <span className="field-label">Тип продукта *</span>
              <select name="category" defaultValue={product?.category ?? catalog.categories[0]?.key} className="field">
                {catalog.categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <AddInline
              placeholder="Новый тип, например Несмываемый уход"
              onAdd={(label) => addCatalogEntry("categories", label)}
            />
          </div>

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
              {catalog.concerns.map((c) => (
                <CheckChip
                  key={c.key}
                  name={`concern:${c.key}`}
                  label={c.label}
                  defaultChecked={product?.concerns.includes(c.key)}
                />
              ))}
            </div>
            <AddInline placeholder="Новая задача" onAdd={(label) => addCatalogEntry("concerns", label)} />
          </div>

          <div className="mt-5">
            <p className="field-label">Для каких волос</p>
            <div className="flex flex-wrap gap-2">
              {catalog.hairTypes.map((h) => (
                <CheckChip
                  key={h.key}
                  name={`hair:${h.key}`}
                  label={h.label}
                  defaultChecked={product?.hairTypes.includes(h.key)}
                />
              ))}
            </div>
            <AddInline placeholder="Новый тип волос" onAdd={(label) => addCatalogEntry("hairTypes", label)} />
          </div>
        </Fieldset>

        <Fieldset title="Фотография" columns={1}>
          <div className="flex flex-wrap items-start gap-5">
            <div
              className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-card border border-line"
              style={{ backgroundColor: imageBg }}
            >
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
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    setPreview(null);
                    return;
                  }
                  const url = URL.createObjectURL(file);
                  setPreview(url);
                  setRemoveImage(false);
                  try {
                    const dataUrl = await new Promise<string>((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(String(reader.result));
                      reader.onerror = () => reject(new Error("read failed"));
                      reader.readAsDataURL(file);
                    });
                    setImageBg(await sampleImageBackground(dataUrl));
                  } catch {
                    /* ignore */
                  }
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

              {imageSrc && (
                <ImageBgPicker imageSrc={imageSrc} value={imageBg} onChange={setImageBg} presets={imageBgPresets} />
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
            label="Выбор Кристины"
            hint="Блок на главной, бейдж на карточке и верх каталога."
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
              Если товар просто не нужен на витрине — снимите «Показывать в каталоге». Удаление убирает его из кабинета
              этого браузера. Чтобы он пропал с опубликованного сайта, после удаления экспортируйте JSON и загрузите его
              в репозиторий.
            </p>
            {confirmDelete ? (
              <div className="mt-4 rounded-lg border border-line bg-sand p-4">
                <p className="text-[14px]">Удалить «{product.nameRu}» из кабинета?</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  Это не отменить из интерфейса. Скрыть товар безопаснее, чем удалять.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button type="button" onClick={handleDelete} className="btn btn-outline btn-sm w-full">
                    Да, удалить
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="btn btn-soft btn-sm w-full">
                    Оставить
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="btn btn-outline btn-sm mt-4 w-full">
                Удалить товар
              </button>
            )}
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

function AddInline({ placeholder, onAdd }: { placeholder: string; onAdd: (label: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <span className="mt-2 flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="field !py-2"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd(value);
            setValue("");
          }
        }}
      />
      <button
        type="button"
        className="btn btn-soft btn-sm shrink-0"
        onClick={() => {
          onAdd(value);
          setValue("");
        }}
      >
        Добавить
      </button>
    </span>
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
