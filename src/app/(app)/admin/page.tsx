import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { isAdminEmail } from "@/core/auth/admin";
import { getDataStore } from "@/core/data/store";
import { Card } from "@/components/ui/Card";
import { AdminHeartsSettingsForm } from "@/components/admin/AdminHeartsSettingsForm";
import { HEARTS_MAX } from "@/core/progress/constants";

export default async function AdminPage() {
  const user = await getServerSession();
  if (!user || !isAdminEmail(user.email)) redirect("/lobby");

  const settings = await getDataStore().getSettings();
  const heartRefillIntervalSeconds = Math.round(settings.heartRefillIntervalMs / 1000);
  const heartsMax = settings.heartsMax ?? HEARTS_MAX;

  return (
    <main className="max-w-2xl mx-auto w-full px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Admin</h1>
        <p className="mt-1 text-sm text-text-muted">Signed in as {user.email}.</p>
      </div>

      <Card className="p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-text mb-1">Hearts</h2>
        <p className="text-sm text-text-muted mb-4">
          How many hearts every learner shares, and how long it takes one heart to regenerate
          once the pool is below max.
        </p>
        <AdminHeartsSettingsForm initialSeconds={heartRefillIntervalSeconds} initialHeartsMax={heartsMax} />
      </Card>
    </main>
  );
}
