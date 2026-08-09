"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground">Categorías oficiales del marketplace</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Categorías ({categories.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Productos</TableHead>
                <TableHead className="text-center">Orden</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{c.slug}</TableCell>
                  <TableCell className="text-center"><Badge variant="secondary">{c._count?.products ?? 0}</Badge></TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">{c.sort_order}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
