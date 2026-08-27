import type { LucideIcon } from "lucide-react";

export type PracticeArea = {
  title: string;
  icon: LucideIcon;
  items: string[];
};

export function PracticeAreaCard({ title, icon: Icon, items }: PracticeArea) {
  return (
    <div className="reveal group">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-gold-pale transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </div>

      <h3 className="mt-4 font-display text-sm font-semibold tracking-wide text-ink">
        {title}
      </h3>

      <ul className="mt-2.5 space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-2 text-sm leading-snug text-ink/80"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
