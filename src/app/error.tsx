"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { IconAlertTriangle } from "@/components/ui/Icon";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <IconAlertTriangle className="h-10 w-10 text-danger" />
      <div>
        <h1 className="text-xl font-bold text-text">Something went wrong</h1>
        <p className="mt-1 text-sm text-text-muted">
          An unexpected error interrupted this page. You can try again, or head back and pick up where you left off.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
