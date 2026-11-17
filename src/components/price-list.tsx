import { PRICE_GROUPS, type PriceItem } from "@/lib/services";

function Row({ item, compact }: { item: PriceItem; compact?: boolean }) {
  return (
    <li className={`flex items-baseline gap-3 ${compact ? "py-1.5 text-[13px]" : "py-3 text-[15px]"}`}>
      <span className="min-w-0">
        {item.title}
        {item.note && <span className="ml-2 text-[12px] text-muted">{item.note}</span>}
      </span>
      <span aria-hidden className="mb-1 min-w-4 flex-1 self-end border-b border-dotted border-line" />
      <span className="shrink-0 whitespace-nowrap text-olive-deep">{item.price}</span>
    </li>
  );
}

export function PriceList({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <div className={`${compact ? "space-y-6" : "grid gap-12 md:grid-cols-2 md:gap-x-16"} ${className}`}>
      {PRICE_GROUPS.map((g) => (
        <section key={g.id} className={!compact && g.id === "color" ? "md:row-span-2" : ""}>
          <h3 className={compact ? "eyebrow mb-2" : "mb-3 border-b border-line pb-3 text-[20px]"}>{g.title}</h3>

          {g.subgroups?.map((sg) => (
            <div key={sg.title} className="mb-3">
              <p className={`${compact ? "mt-2 text-[13px]" : "mt-4 text-[15px]"} font-medium`}>{sg.title}</p>
              {sg.note && <p className="text-[12px] text-muted">{sg.note}</p>}
              <ul>{sg.items.map((i) => <Row key={i.title} item={i} compact={compact} />)}</ul>
            </div>
          ))}

          <ul>{g.items.map((i) => <Row key={i.title} item={i} compact={compact} />)}</ul>
          {g.footnote && <p className="mt-3 text-[12px] leading-snug text-muted">* {g.footnote}</p>}
        </section>
      ))}
    </div>
  );
}
