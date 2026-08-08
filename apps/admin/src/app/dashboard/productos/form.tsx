import { useState, useEffect } from "react";
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
import { useProductContext } from "./context.tsx";

// Tipo de producto
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "disponible" | "agotado" | "descontinuado";
  image: string;
}

export default function ProductForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { products, addProduct, updateProduct } = useProductContext();

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    sku: "",
    category: "Proyectores",
    price: 0,
    stock: 0,
    status: "disponible",
    image: "",
  });

  useEffect(() => {
    if (editId) {
      const product = products.find((p) => p.id === editId);
      if (product) {
        setFormData({
          name: product.name,
          sku: product.sku,
          category: product.category,
          price: product.price,
          stock: product.stock,
          status: product.status,
          image: product.image,
        });
      }
    }
  }, [editId, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editId) {
      updateProduct(editId, formData);
    } else {
      addProduct(formData);
    }

    navigate("/productos");
  };

  const handleCancel = () => {
    navigate("/productos");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <IconArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {editId ? "Editar Producto" : "Nuevo Producto"}
          </h1>
          <p className="text-muted-foreground">
            {editId
              ? "Actualiza la información del producto"
              : "Completa los datos para crear un nuevo producto"}
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
                <CardDescription>Datos básicos del producto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Proyector Epson PowerLite"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="Ej: EPSON-980W"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proyectores">Proyectores</SelectItem>
                      <SelectItem value="Accesorios">Accesorios</SelectItem>
                      <SelectItem value="Pantallas">Pantallas</SelectItem>
                      <SelectItem value="Soportes">Soportes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precio e Inventario</CardTitle>
                <CardDescription>
                  Información comercial del producto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio (S/) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado</CardTitle>
                <CardDescription>Estado del producto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Product["status"]) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="agotado">Agotado</SelectItem>
                      <SelectItem value="descontinuado">
                        Descontinuado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Imagen</CardTitle>
                <CardDescription>Imagen del producto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="image">URL de Imagen</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="/productos/ejemplo/1.jpg"
                  />
                </div>
                {formData.image && (
                  <div className="rounded-md border p-4">
                    <img
                      src={formData.image}
                      alt="Vista previa"
                      className="w-full h-auto rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = "/images/product-not-found.png";
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">
                <IconCheck className="mr-2 h-4 w-4" />
                {editId ? "Actualizar Producto" : "Crear Producto"}
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
