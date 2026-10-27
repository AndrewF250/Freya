"use client";

import { useEffect, useRef, useState } from "react";

export function AddChip({
  placeholder,
  onAdd,
  label = "+ Добавить",
}: {
  placeholder: string;
  onAdd: (label: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function commit() {
    const next = value.trim();
    if (next) onAdd(next);
    setValue("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button type="button" className="chip border-dashed !min-h-9 !px-3 !text-[12px]" onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }

  return (
    <span className="flex min-w-0 items-center gap-1">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="field !h-9 !min-h-9 !w-[min(100%,168px)] !py-1 !text-[13px]"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setValue("");
            setOpen(false);
          }
        }}
        onBlur={() => {
          if (!value.trim()) setOpen(false);
        }}
      />
      <button type="button" className="chip !min-h-9 !px-3" onMouseDown={(e) => e.preventDefault()} onClick={commit}>
        ОК
      </button>
    </span>
  );
}

export function FilterChip({
  label,
  count,
  active,
  onSelect,
  onRemove,
}: {
  label: string;
  count?: number;
  active: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}) {
  return (
    <span className="chip !pr-1.5" data-active={active}>
      <button type="button" className="inline-flex items-center gap-1.5" onClick={onSelect}>
        {label}
        {typeof count === "number" && (
          <span className={active ? "text-white/70" : "text-muted"}>{count}</span>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-[15px] leading-none opacity-70 hover:opacity-100"
          aria-label={`Удалить ярлык «${label}»`}
          onClick={onRemove}
        >
          ×
        </button>
      )}
    </span>
  );
}
