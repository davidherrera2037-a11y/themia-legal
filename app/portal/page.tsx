import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/get-profile";
import { isStaff } from "@/lib/auth/require-role";

export default async function PortalRoot() {
  const profile = await getProfile();
  redirect(isStaff(profile.role) ? "/portal/equipo" : "/portal/cliente");
}
