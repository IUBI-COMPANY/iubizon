import { useNavigate } from "react-router-dom";
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconFolders,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { useCategoryContext } from "./context.tsx";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { categories, deleteCategory } = useCategoryContext();

  // Obtener nombre de la categoría padre
  const getParentName = (parentId: string | null | undefined) => {
    if (!parentId) return "Ninguna (Raíz)";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "Desconocida";
  };

  // Obtener categorías ordenadas jerárquicamente
  const getHierarchicalCategories = () => {
    const result: Category[] = [];

    // Primero agregar categorías raíz ordenadas
    const rootCategories = categories
      .filter((c) => c.level === 0)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Función recursiva para agregar subcategorías
    const addChildren = (parentId: string, level: number) => {
      const children = categories
        .filter((c) => c.parentId === parentId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      children.forEach((child) => {
        result.push(child);
        // Recursivamente, agregar hijos de este hijo
        addChildren(child.id, level + 1);
      });
    };

    // Para cada categoría raíz, agregar sus hijos
    rootCategories.forEach((root) => {
      result.push(root);
      addChildren(root.id, 1);
    });

    return result;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">
            Organiza y gestiona las categorías de productos
          </p>
        </div>
        <Button onClick={() => navigate("/categorias/nuevo")}>
          <IconPlus className="mr-2 h-4 w-4" />
          Agregar Categoría
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categorías
            </CardTitle>
            <IconFolders className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categorías Raíz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter((c) => c.level === 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subcategorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter((c) => c.level > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter((c) => c.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
          <CardDescription>
            {categories.length} categorías en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Categoría Padre</TableHead>
                  <TableHead className="text-center">Nivel</TableHead>
                  <TableHead className="text-center">Orden</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      No hay categorías disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  getHierarchicalCategories().map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {category.imageUrl ? (
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <IconFolders className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div
                            style={{ marginLeft: `${category.level * 24}px` }}
                            className="flex items-center gap-2"
                          >
                            {category.level > 0 && (
                              <span className="text-muted-foreground">
                                {"└─"}
                              </span>
                            )}
                            <div>
                              <p className="font-medium">{category.name}</p>
                              {category.description && (
                                <p className="text-xs text-muted-foreground">
                                  {category.description.slice(0, 50)}
                                  {category.description.length > 50
                                    ? "..."
                                    : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {category.slug}
                      </TableCell>
                      <TableCell>{getParentName(category.parentId)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{category.level}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {category.order}
                      </TableCell>
                      <TableCell className="text-center">
                        {category.isActive ? (
                          <Badge variant="default" className="gap-1">
                            <IconEye className="h-3 w-3" />
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <IconEyeOff className="h-3 w-3" />
                            Inactiva
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/categorias/nuevo?edit=${category.id}`)
                            }
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <IconTrash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
