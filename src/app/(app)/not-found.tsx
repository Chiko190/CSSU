import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { IconAlertTriangle } from "@/components/ui/Icon";

export default function AppNotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <IconAlertTriangle className="h-10 w-10 text-text-faint" />
      <div>
        <h1 className="text-xl font-bold text-text">Page not found</h1>
        <p className="mt-1 text-sm text-text-muted">
          That module, task, or page doesn&apos;t exist. It may have moved or been removed.
        </p>
      </div>
      <Link href="/lobby">
        <Button>Back to Lobby</Button>
      </Link>
    </div>
  );
}
