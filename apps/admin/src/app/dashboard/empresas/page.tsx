"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCompanies = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/companies?${params}`);
    const data = await res.json();
    setCompanies(data.companies || []);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  const toggleVerification = async (id: string, verified: boolean) => {
    await fetch("/api/companies", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_verified: !verified }) });
    fetchCompanies();
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <p className="text-muted-foreground">Gestiona las empresas registradas</p>
      </div>
      <div className="flex gap-2">
        <Input placeholder="Buscar empresa..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchCompanies()} className="max-w-xs" />
        <Button variant="outline" onClick={fetchCompanies}>Buscar</Button>
      </div>
      <Card>
        <CardHeader><CardTitle>Empresas ({companies.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Razón Social</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Productos</TableHead>
                <TableHead className="text-center">Miembros</TableHead>
                <TableHead className="text-center">Verificada</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center h-24">Cargando...</TableCell></TableRow>
              ) : companies.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.legal_name || "-"}</TableCell>
                  <TableCell className="text-sm">{c.email}</TableCell>
                  <TableCell className="text-center"><Badge variant="secondary">{c._count?.products ?? 0}</Badge></TableCell>
                  <TableCell className="text-center"><Badge variant="outline">{c._count?.companyMembers ?? 0}</Badge></TableCell>
                  <TableCell className="text-center">
                    {c.is_verified ? <IconCheck className="h-4 w-4 text-emerald-600 inline" /> : <IconX className="h-4 w-4 text-red-500 inline" />}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => toggleVerification(c.id, c.is_verified)}>
                      {c.is_verified ? "Desmarcar" : "Verificar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
