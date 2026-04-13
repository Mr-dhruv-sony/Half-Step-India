import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { hasRoleAccess, MANAGEMENT_ROLES } from "@/lib/access";

export default async function AlertsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasRoleAccess(session.user.role, MANAGEMENT_ROLES)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar user={session.user} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
