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
      {/* Bottom padding on phones so the fixed tab bar never covers the end of a page. */}
      <div className="flex-1 flex flex-col pb-20 sm:pb-0">{children}</div>
    </div>
  );
}
