import type { FieldErrors } from "@/lib/validation";

/** Сообщение об ошибке под полем формы. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={`${id}-error`} role="alert" className="mt-1.5 block text-[12px] leading-snug text-[#a1432f]">
      {message}
    </span>
  );
}

/** aria-атрибуты поля с ошибкой: экранный диктор прочитает сообщение, рамка подсветится. */
export function fieldProps(name: string, errors: FieldErrors) {
  const message = errors[name];
  return message
    ? { "aria-invalid": true as const, "aria-describedby": `${name}-error`, "data-invalid": "true" }
    : { "aria-invalid": false as const };
}
