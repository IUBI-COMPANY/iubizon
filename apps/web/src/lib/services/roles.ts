import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["nmoriano26@gmail.com", "ingasergio99@gmail.com"];

export function getRoleByEmail(email: string): "admin" | "user" {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim()) ? "admin" : "user";
}

export async function ensureProfileRole(profileId: string, email: string) {
  const role = getRoleByEmail(email);
  await prisma.profile.update({
    where: { id: profileId },
    data: { role },
  });
}
