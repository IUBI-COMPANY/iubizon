import { prisma } from "@/lib/prisma";

export async function createCompany(
  data: {
    name: string;
    tax_id?: string;
    description?: string;
    website?: string;
    phone?: string;
    email?: string;
    location?: string;
  },
  userId: string,
) {
  // Generar un slug único basado en el nombre (ej: "mi-empresa-123")
  const baseSlug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  return prisma.company.create({
    data: {
      name: data.name,
      slug,
      tax_id: data.tax_id,
      description: data.description,
      website: data.website,
      phone: data.phone,
      email: data.email,
      location: data.location,
      companyMembers: {
        create: {
          user_id: userId,
          role: "owner",
        },
      },
    },
    include: {
      companyMembers: {
        include: { user: true },
      },
    },
  });
}

export async function getUserCompanies(userId: string) {
  const memberships = await prisma.companyMember.findMany({
    where: { user_id: userId },
    include: {
      company: {
        include: {
          companyMembers: {
            include: { user: true },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return memberships.map((m) => ({
    ...m,
    role: m.role,
  }));
}

export async function getCompanyById(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      companyMembers: {
        include: { user: true },
      },
      products: {
        where: { status: "active" },
        include: { images: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export async function addCompanyMember(
  companyId: string,
  targetEmail: string,
  role: string = "member",
) {
  const user = await prisma.profile.findFirst({
    where: { email: targetEmail.trim().toLowerCase() },
  });

  if (!user) {
    throw new Error(
      "No se encontró ningún usuario registrado con ese correo electrónico.",
    );
  }

  return prisma.companyMember.create({
    data: {
      company_id: companyId,
      user_id: user.id,
      role,
    },
    include: { user: true },
  });
}

export async function removeCompanyMember(
  companyId: string,
  targetUserId: string,
) {
  return prisma.companyMember.delete({
    where: {
      company_id_user_id: {
        company_id: companyId,
        user_id: targetUserId,
      },
    },
  });
}
