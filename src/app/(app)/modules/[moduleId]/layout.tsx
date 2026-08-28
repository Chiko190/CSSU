import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getDataStore } from "@/core/data/store";
import { getModuleStatus } from "@/core/progress/unlock";

export default async function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const user = await getServerSession();
  if (!user) redirect("/login");

  const store = getDataStore();
  const moduleMeta = await store.getModule(moduleId);
  if (!moduleMeta) notFound();

  // Server-side enforcement: this can't be bypassed by typing the URL
  // directly or by disabling client-side JS, unlike a client-only guard.
  const status = await getModuleStatus(user.uid, moduleId);
  if (!status.unlocked) redirect("/lobby");

  return (
    <main className="max-w-3xl mx-auto w-full px-6 py-8 space-y-6 flex-1">
      {children}
    </main>
  );
}
