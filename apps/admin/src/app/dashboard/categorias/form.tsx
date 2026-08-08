import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { useCategoryContext } from "./context.tsx";

export default function CategoryForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { categories, addCategory, updateCategory } = useCategoryContext();

  const [formData, setFormData] = useState<
    Omit<Category, "id" | "createdAt" | "updatedAt">
  >({
    name: "",
    slug: "",
    description: "",
    parentId: null,
    level: 0,
    order: 1,
    imageUrl: "",
    icon: "",
    isActive: true,
    seo: {
      title: "",
      description: "",
      keywords: [],
    },
  });

  useEffect(() => {
    if (editId) {
      const category = categories.find((c) => c.id === editId);
      if (category) {
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description,
          parentId: category.parentId,
          level: category.level,
          order: category.order || 1,
          imageUrl: category.imageUrl,
          icon: category.icon,
          isActive: category.isActive,
          seo: category.seo || { title: "", description: "", keywords: [] },
        });
      }
    }
  }, [editId, categories]);

  // Generar slug automáticamente del nombre
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Actualizar slug cuando cambia el nombre
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  // Obtener categorías disponibles para padre (excluyendo la actual si está editando)
  const getAvailableParentCategories = () => {
    if (editId) {
      // No puede ser su propio padre ni puede ser hijo de sus hijos
      return categories.filter(
        (c) => c.id !== editId && c.parentId !== editId && c.level === 0,
      );
    }
    return categories.filter((c) => c.level === 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editId) {
      updateCategory(editId, formData);
    } else {
      addCategory(formData);
    }

    navigate("/categorias");
  };

  const handleCancel = () => {
    navigate("/categorias");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {editId ? "Editar Categoría" : "Nueva Categoría"}
          </h1>
          <p className="text-muted-foreground">
            {editId
              ? "Actualiza la información de la categoría"
              : "Completa los datos para crear una nueva categoría"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Columna principal */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>Datos básicos de la categoría</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre de la Categoría *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Proyectores Educativos"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Slug (URL amigable) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="proyectores-educativos"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Se genera automáticamente del nombre
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descripción breve de la categoría"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>
                  Optimización para motores de búsqueda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="seo-title">Título SEO</Label>
                  <Input
                    id="seo-title"
                    value={formData.seo?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, title: e.target.value },
                      })
                    }
                    placeholder="Título para buscadores"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seo-description">Descripción SEO</Label>
                  <Input
                    id="seo-description"
                    value={formData.seo?.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: {
                          ...formData.seo,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder="Descripción para buscadores"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seo-keywords">
                    Palabras clave (separadas por coma)
                  </Label>
                  <Input
                    id="seo-keywords"
                    value={formData.seo?.keywords?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: {
                          ...formData.seo,
                          keywords: e.target.value
                            .split(",")
                            .map((k) => k.trim())
                            .filter((k) => k.length > 0),
                        },
                      })
                    }
                    placeholder="proyector, educación, multimedia"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Jerarquía</CardTitle>
                <CardDescription>Organización de categorías</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="parentId">Categoría Padre</Label>
                  <Select
                    value={formData.parentId || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        parentId: value === "none" ? null : value,
                        level: value === "none" ? 0 : 1,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría padre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna (Raíz)</SelectItem>
                      {getAvailableParentCategories().map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Orden de visualización en la lista
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multimedia</CardTitle>
                <CardDescription>Imagen e icono</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">URL de Imagen</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="/images/categoria.jpg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icono</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="projector"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: !!checked })
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Categoría activa
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">
                <IconCheck className="mr-2 h-4 w-4" />
                {editId ? "Actualizar Categoría" : "Crear Categoría"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
