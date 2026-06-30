import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";

export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile | null;
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

export async function requireRole(allowed: UserRole[]): Promise<Profile> {
  const profile = await requireAuth();
  if (!allowed.includes(profile.role)) {
    redirect("/");
  }
  return profile;
}

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "restaurant_manager":
      return "/restaurant";
    case "office_admin":
      return "/office";
    case "employee":
      return "/app";
    default:
      return "/login";
  }
}

export async function requireAdmin(): Promise<Profile> {
  return requireRole(["admin"]);
}

export async function requireRestaurantManager(): Promise<Profile> {
  return requireRole(["restaurant_manager", "admin"]);
}

export async function requireOfficeAdmin(): Promise<Profile> {
  return requireRole(["office_admin", "admin"]);
}

export async function requireEmployee(): Promise<Profile> {
  return requireRole(["employee", "admin"]);
}
