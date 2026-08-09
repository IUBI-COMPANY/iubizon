"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Activo", variant: "default" },
  pending: { label: "Pendiente", variant: "secondary" },
  sold: { label: "Vendido", variant: "outline" },
  reported: { label: "Reportado", variant: "destructive" },
};

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }, [status, search]);

  useEffect(() => { fetchProducts(); }, [status]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <p className="text-muted-foreground">Gestiona todos los productos del marketplace</p>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchProducts()} className="max-w-xs" />
        <Button variant="outline" onClick={() => fetchProducts()}>Buscar</Button>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="sold">Vendido</SelectItem>
            <SelectItem value="reported">Reportado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card>
        <CardHeader><CardTitle>Productos ({products.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24">Cargando...</TableCell></TableRow>
              ) : products.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center h-24">No hay productos</TableCell></TableRow>
              ) : (
                products.map((p: any) => {
                  const s = statusMap[p.status] || { label: p.status, variant: "outline" as const };
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.title} className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted" />}
                          <span className="font-medium truncate max-w-[200px]">{p.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.category?.name || "-"}</TableCell>
                      <TableCell className="text-sm">{p.company?.name || "Particular"}</TableCell>
                      <TableCell className="text-right">S/ {Number(p.price).toFixed(2)}</TableCell>
                      <TableCell className="text-center">{p.stock ?? 1}</TableCell>
                      <TableCell className="text-center"><Badge variant={s.variant}>{s.label}</Badge></TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
