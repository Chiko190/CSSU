import Link from "next/link";
import { IconChevronRight } from "@/components/ui/Icon";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function ModuleBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1 text-xs font-semibold uppercase tracking-wide text-text-faint"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <IconChevronRight className="h-3 w-3 text-text-faint/60" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-text transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-text" : ""}>{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
