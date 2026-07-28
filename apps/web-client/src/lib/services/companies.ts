import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function generateUniqueCompanySlug(
  name: string,
  excludeCompanyId?: string,
): Promise<string> {
  const baseSlug = slugify(name);
  if (!baseSlug) return `empresa-${Date.now().toString().slice(-4)}`;

  // 1. Verificar si el slug base está libre (ej: "iubizon")
  const existingBase = await prisma.company.findFirst({
    where: {
      slug: baseSlug,
      ...(excludeCompanyId ? { id: { not: excludeCompanyId } } : {}),
    },
    select: { id: true },
  });

  if (!existingBase) {
    return baseSlug; // Se usa directamente el nombre sin sufijos si no colisiona
  }

  // 2. Si ya existe, generar el siguiente sufijo numérico libre (ej: "iubizon-1", "iubizon-2")
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

export async function createCompany(
  data: {
    name: string;
    tax_id?: string;
    description?: string;
    phone?: string;
    email?: string;
    location?: string;
  },
  userId: string,
) {
  // Generar un slug único limpio (solo añade número si ya existe otra empresa con el mismo slug)
  const slug = await generateUniqueCompanySlug(data.name);

  return prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: data.name,
        slug,
        tax_id: data.tax_id,
        description: data.description,
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

    // Establecer como empresa activa por defecto en el perfil dentro de la misma transacción
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

  // Limpiar y normalizar slugs de empresas existentes si el slug base "iubizon" está libre
  for (const m of memberships) {
    const base = slugify(m.company.name);
    if (
      base &&
      m.company.slug &&
      m.company.slug !== base &&
      /-[0-9]+$/.test(m.company.slug)
    ) {
      const isTaken = await prisma.company.findFirst({
        where: { slug: base, id: { not: m.company.id } },
        select: { id: true },
      });
      if (!isTaken) {
        try {
          await prisma.company.update({
            where: { id: m.company.id },
            data: { slug: base },
          });
          m.company.slug = base;
        } catch (e) {
          console.error("Error al sanear slug de empresa:", e);
        }
      }
    }
  }

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
  // Intentar buscar por slug primero, luego por id
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
