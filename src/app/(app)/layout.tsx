import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";
import { getTotalXp, computeLevel } from "@/core/progress/xp";
import { getHearts } from "@/core/progress/hearts";
import { isAdminEmail } from "@/core/auth/admin";
import { AppHeader } from "@/components/layout/AppHeader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (!user) redirect("/login");

  const [totalXp, hearts] = await Promise.all([getTotalXp(user.uid), getHearts(user.uid)]);
  const level = computeLevel(totalXp);

  return (
    <div className="flex-1 flex flex-col">
      <AppHeader user={user} level={level} hearts={hearts} isAdmin={isAdminEmail(user.email)} />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
