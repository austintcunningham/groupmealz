import { redirect } from "next/navigation";
import { getSessionProfile, getRoleHomePath } from "@/lib/auth/guards";

export default async function HomePage() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }
  redirect(getRoleHomePath(profile.role));
}
