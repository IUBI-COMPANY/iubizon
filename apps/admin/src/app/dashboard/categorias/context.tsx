import { createContext, useContext, useState, type ReactNode } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  level: number;
  order?: number;
  imageUrl?: string;
  icon?: string;
  isActive: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Datos ficticios de categorías
const initialCategories: Category[] = [
  {
    id: "cat-1",
    name: "Proyectores",
    slug: "proyectores",
    description: "Proyectores para negocios, educación y uso personal",
    parentId: null,
    level: 0,
    order: 1,
    imageUrl: "/images/education-projectors.jpg",
    icon: "projector",
    isActive: true,
    seo: {
      title: "Proyectores - iubizon",
      description:
        "Encuentra los mejores proyectores para tu negocio o institución educativa",
      keywords: ["proyectores", "epson", "viewsonic", "multimedia"],
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-2",
    name: "Proyectores Educativos",
    slug: "proyectores-educativos",
    description: "Proyectores ideales para salones de clase y auditorios",
    parentId: "cat-1",
    level: 1,
    order: 1,
    imageUrl: "/images/education-projectors.jpg",
    icon: "school",
    isActive: true,
    seo: {
      title: "Proyectores Educativos - iubizon",
      description: "Proyectores especializados para instituciones educativas",
      keywords: ["proyectores educativos", "aula", "colegio", "universidad"],
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-3",
    name: "Proyectores Empresariales",
    slug: "proyectores-empresariales",
    description:
      "Proyectores para presentaciones corporativas y salas de reuniones",
    parentId: "cat-1",
    level: 1,
    order: 2,
    imageUrl: "/images/epson-banner.jpg",
    icon: "briefcase",
    isActive: true,
    seo: {
      title: "Proyectores Empresariales - iubizon",
      description: "Proyectores profesionales para tu empresa",
      keywords: [
        "proyectores empresariales",
        "negocios",
        "presentaciones",
        "oficina",
      ],
    },
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-4",
    name: "Accesorios",
    slug: "accesorios",
    description: "Accesorios y complementos para proyectores",
    parentId: null,
    level: 0,
    order: 2,
    imageUrl: "/images/accesorios.png",
    icon: "plug",
    isActive: true,
    seo: {
      title: "Accesorios para Proyectores - iubizon",
      description:
        "Cables, controles remotos y más accesorios para proyectores",
      keywords: ["accesorios", "cables", "controles", "soportes"],
    },
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-5",
    name: "Cables y Conectores",
    slug: "cables-conectores",
    description: "Cables HDMI, VGA y otros conectores",
    parentId: "cat-4",
    level: 1,
    order: 1,
    imageUrl: "/images/powerCable.png",
    icon: "cable",
    isActive: true,
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-6",
    name: "Controles Remotos",
    slug: "controles-remotos",
    description: "Controles remotos originales y universales",
    parentId: "cat-4",
    level: 1,
    order: 2,
    imageUrl: "/images/remoteControl.png",
    icon: "remote",
    isActive: false,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-7",
    name: "Proyectores de Corta Distancia",
    slug: "proyectores-corta-distancia",
    description: "Proyectores de corta distancia para aulas pequeñas",
    parentId: "cat-2",
    level: 2,
    order: 1,
    imageUrl: "/images/education-projectors.jpg",
    icon: "projector-short",
    isActive: true,
    seo: {
      title: "Proyectores de Corta Distancia - iubizon",
      description:
        "Proyectores de corta distancia ideales para espacios reducidos",
      keywords: ["proyectores corta distancia", "ultra corto", "educación"],
    },
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-8",
    name: "Proyectores Estándar",
    slug: "proyectores-estandar-educativos",
    description: "Proyectores estándar para aulas medianas y grandes",
    parentId: "cat-2",
    level: 2,
    order: 2,
    imageUrl: "/images/education-projectors.jpg",
    icon: "projector-standard",
    isActive: true,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-9",
    name: "Proyectores Portátiles",
    slug: "proyectores-portatiles-empresariales",
    description: "Proyectores compactos y ligeros para presentaciones móviles",
    parentId: "cat-3",
    level: 2,
    order: 1,
    imageUrl: "/images/epson-banner.jpg",
    icon: "briefcase-portable",
    isActive: true,
    seo: {
      title: "Proyectores Portátiles Empresariales - iubizon",
      description: "Proyectores ligeros y fáciles de transportar",
      keywords: ["proyectores portátiles", "móviles", "presentaciones"],
    },
    createdAt: new Date("2024-03-05"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-10",
    name: "Proyectores de Instalación Fija",
    slug: "proyectores-instalacion-fija",
    description: "Proyectores de alto rendimiento para salas de conferencias",
    parentId: "cat-3",
    level: 2,
    order: 2,
    imageUrl: "/images/epson-banner.jpg",
    icon: "projector-fixed",
    isActive: true,
    createdAt: new Date("2024-03-05"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-11",
    name: "Cables HDMI",
    slug: "cables-hdmi",
    description: "Cables HDMI de diferentes longitudes y versiones",
    parentId: "cat-5",
    level: 2,
    order: 1,
    imageUrl: "/images/powerCable.png",
    icon: "cable-hdmi",
    isActive: true,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "cat-12",
    name: "Cables VGA",
    slug: "cables-vga",
    description: "Cables VGA para equipos legacy",
    parentId: "cat-5",
    level: 2,
    order: 2,
    imageUrl: "/images/powerCable.png",
    icon: "cable-vga",
    isActive: true,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2025-01-10"),
  },
];

interface CategoryContextType {
  categories: Category[];
  addCategory: (
    category: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateCategory: (
    id: string,
    category: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ) => void;
  deleteCategory: (id: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined,
);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const addCategory = (
    category: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (
    id: string,
    category: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ) => {
    setCategories(
      categories.map((c) =>
        c.id === id
          ? {
              ...category,
              id: c.id,
              createdAt: c.createdAt,
              updatedAt: new Date(),
            }
          : c,
      ),
    );
  };

  const deleteCategory = (id: string) => {
    // Verificar si tiene subcategorías
    const hasChildren = categories.some((c) => c.parentId === id);
    if (hasChildren) {
      alert("No se puede eliminar una categoría que tiene subcategorías");
      return;
    }
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <CategoryContext.Provider
      value={{ categories, addCategory, updateCategory, deleteCategory }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryContext() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error(
      "useCategoryContext must be used within a CategoryProvider",
    );
  }
  return context;
}
