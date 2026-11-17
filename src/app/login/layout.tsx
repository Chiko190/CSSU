import { redirect } from "next/navigation";
import { getServerSession } from "@/core/auth/getServerSession";

/** Already signed in? Skip the sign-in form and go straight to the lobby. */
export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  if (await getServerSession()) redirect("/lobby");
  return children;
}
