/**
 * Векторный логотип FREYA — геометрический гротеск, широкий трекинг (как на бренд-мокапе).
 * Пути не зависят от загрузки шрифта.
 */
export function SalonLogo({ className = "h-[17px] w-auto sm:h-[19px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 86 24"
      fill="currentColor"
      role="img"
      aria-label="FREYA"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 2h12.8v2.6H3.1v5.4h7.3v2.6H3.1v9.4H0V2z" />
      <path d="M18.2 2h3.4v9.8c0 3.4 2.3 5.6 6 5.6 3.4 0 5.6-2.1 5.6-5.4V2h3.4v9.9c0 5.1-3.4 8.1-8.9 8.1-5.7 0-9.5-3.2-9.5-8.3V2zm8.8 5.4l6.1 11.2h-3.3l-5.1-9.4v9.4h-3V2h3v5.4z" />
      <path d="M42.8 2h3.4v17.4h-3.4V12.4h-8.2V22h-3.4V2h3.4v8.4h8.2V2z" />
      <path d="M56.4 2h10.6l-7.5 20h-4.1l-1.6-4.5H49.3L47.7 22h-4.1l7.5-20zm-6.7 12.6l-2.5-7.1-2.5 7.1h5z" />
      <path d="M72.8 2h11.2L76.6 22h-4l-6.2-20h3.9l3.8 13.8L78.9 2h3.9z" />
    </svg>
  );
}
