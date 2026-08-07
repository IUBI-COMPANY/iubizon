import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function generateUniqueCompanySlug(
  name: string,
  excludeCompanyId?: string,
): Promise<string> {
  const baseSlug = slugify(name);
  if (!baseSlug) return `empresa-${Date.now().toString().slice(-4)}`;

  const existingBase = await prisma.company.findFirst({
    where: {
      slug: baseSlug,
      ...(excludeCompanyId ? { id: { not: excludeCompanyId } } : {}),
    },
    select: { id: true },
  });

  if (!existingBase) {
    return baseSlug;
  }

  let suffix = 1;
  while (true) {
    const candidate = `${baseSlug}-${suffix}`;
    const check = await prisma.company.findFirst({
      where: {
        slug: candidate,
        ...(excludeCompanyId ? { id: { not: excludeCompanyId } } : {}),
      },
      select: { id: true },
    });

    if (!check) {
      return candidate;
    }
    suffix++;
  }
}

export async function createPersonalCompany(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  const companyName =
    profile?.name || profile?.email?.split("@")[0] || "Usuario";
  const slug = await generateUniqueCompanySlug(companyName);

  const company = await prisma.$transaction(async (tx) => {
    const c = await tx.company.create({
      data: {
        name: companyName,
        slug,
        email: profile?.email || `usuario_${userId.slice(0, 8)}@iubizon.com`,
        legal_name: companyName,
        is_personal: true,
        location: null,
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

    await tx.profile.update({
      where: { id: userId },
      data: { last_active_company_id: c.id },
    });

    return c;
  });

  return company;
}

export async function ensurePersonalCompany(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { last_active_company_id: true },
  });

  if (profile?.last_active_company_id) {
    const company = await prisma.company.findUnique({
      where: { id: profile.last_active_company_id },
      select: { id: true },
    });
    if (company) return company;
  }

  const existingPersonal = await prisma.company.findFirst({
    where: {
      is_personal: true,
      companyMembers: { some: { user_id: userId } },
    },
    select: { id: true },
  });

  if (existingPersonal) {
    await prisma.profile.update({
      where: { id: userId },
      data: { last_active_company_id: existingPersonal.id },
    });
    return existingPersonal;
  }

  return createPersonalCompany(userId);
}

export async function createCompany(
  data: {
    name: string;
    email: string;
    legal_name: string;
    logo_url?: string;
    tax_id?: string;
    description?: string;
    bank_account?: string;
    phone?: string;
    location?: string;
    latitude?: number | null;
    longitude?: number | null;
  },
  userId: string,
) {
  const slug = await generateUniqueCompanySlug(data.name);

  return prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: data.name,
        slug,
        email: data.email || "",
        legal_name: data.legal_name || "",
        logo_url: data.logo_url || null,
        tax_id: data.tax_id || null,
        description: data.description || null,
        bank_account: data.bank_account || null,
        phone: data.phone || null,
        location: data.location || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        is_personal: false,
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

    await tx.profile.update({
      where: { id: userId },
      data: { last_active_company_id: company.id },
    });

    return company;
  });
}

export async function getUserCompanies(userId: string) {
  const [memberships, profile] = await Promise.all([
    prisma.companyMember.findMany({
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
    }),
    prisma.profile.findUnique({
      where: { id: userId },
      select: { last_active_company_id: true },
    }),
  ]);

  const companies = memberships.map((m) => ({
    ...m.company,
    role: m.role,
  }));

  return {
    companies,
    last_active_company_id: profile?.last_active_company_id ?? null,
  };
}

export async function updateUserActiveCompany(
  userId: string,
  companyId: string,
) {
  return prisma.profile.update({
    where: { id: userId },
    data: { last_active_company_id: companyId },
  });
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

export async function getPublicCompanyBySlugOrId(identifier: string) {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier,
    );

  const company = await prisma.company.findFirst({
    where: isUuid
      ? { OR: [{ id: identifier }, { slug: identifier }] }
      : { slug: identifier },
    include: {
      products: {
        where: { status: "active" },
        include: {
          images: { orderBy: { position: "asc" } },
          category: true,
        },
        orderBy: { created_at: "desc" },
      },
    },
  });

  return company;
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
