"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { IconAlertTriangle } from "@/components/ui/Icon";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <IconAlertTriangle className="h-10 w-10 text-danger" />
      <div>
        <h1 className="text-xl font-bold text-text">Something went wrong</h1>
        <p className="mt-1 text-sm text-text-muted">
          This page hit an unexpected error. Your progress is saved -- try again or head back to the lobby.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/lobby">
          <Button variant="secondary">Back to Lobby</Button>
        </Link>
      </div>
    </div>
  );
}
