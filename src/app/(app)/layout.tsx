import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getTotalXp, computeLevel } from "@/core/progress/xp";
import { isAdminEmail } from "@/core/auth/admin";
import { AppHeader } from "@/components/layout/AppHeader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (!user) redirect("/login");

  const totalXp = await getTotalXp(user.uid);
  const level = computeLevel(totalXp);

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader user={user} level={level} isAdmin={isAdminEmail(user.email)} />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
