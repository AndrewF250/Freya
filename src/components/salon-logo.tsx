/** Векторный логотип студии — Montserrat, широкий трекинг. */
export function SalonLogo({ className = "h-[18px] w-auto sm:h-[20px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 108 22"
      fill="currentColor"
      role="img"
      aria-label="ФРЕЯ"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="17.5"
        fontFamily="Montserrat, ui-sans-serif, sans-serif"
        fontSize="17"
        fontWeight="300"
        letterSpacing="5.5"
      >
        ФРЕЯ
      </text>
    </svg>
  );
}
