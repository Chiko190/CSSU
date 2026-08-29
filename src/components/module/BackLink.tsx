import Link from "next/link";
import { IconChevronLeft } from "@/components/ui/Icon";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-text-muted hover:text-text transition-colors"
    >
      <IconChevronLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
