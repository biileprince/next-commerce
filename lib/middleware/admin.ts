import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Admin middleware - Protects admin routes
 * Usage: Call this function at the top of admin pages/actions
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Cast session to include role property from database
  const userWithRole = session.user as typeof session.user & { role?: string };

  if (userWithRole.role !== "admin") {
    redirect("/"); // Redirect non-admins to home
  }

  return session;
}

/**
 * Check if current user is admin without redirecting
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return false;

  const userWithRole = session.user as typeof session.user & { role?: string };
  return userWithRole.role === "admin";
}
