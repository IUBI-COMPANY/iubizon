"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2, UserPlus, Users } from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Company } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CompanyMembersPage({ params }: Props) {
  const { id: companyId } = use(params);
  const [newEmail, setNewEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      const res = await fetch(`/api/companies`);
      const data = await res.json();
      const comp = data.companies?.find((c: Company) => c.id === companyId);
      setCompany(comp || null);
    } catch (err) {
      console.error("Error al cargar empresa:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/companies/${companyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, role }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al agregar miembro");

      setMessage({
        type: "success",
        text: "Colaborador añadido correctamente",
      });
      setNewEmail("");
      await loadCompanyData();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al agregar miembro",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (
      !confirm(
        "¿Seguro que deseas desvincular a este colaborador de la empresa?",
      )
    )
      return;

    try {
      const res = await fetch(
        `/api/companies/${companyId}/members?userId=${userId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Error al eliminar colaborador");
      await loadCompanyData();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Error al eliminar colaborador",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/user/profile"
          className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#112237] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Perfil
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#112237] text-white rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#112237]">
              Equipo de {company?.name || "la Empresa"}
            </h1>
            <p className="text-sm text-[#64748b]">
              Gestiona los colaboradores que pueden administrar productos de
              esta empresa.
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Formulario Agregar Miembro */}
          <Card className="border border-[#e2e8f0] bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#f25c05]" />
                Invitar Colaborador por Correo
              </CardTitle>
              <CardDescription>
                El usuario debe estar registrado previamente en iubizon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAddMember}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Input
                  type="email"
                  placeholder="correo@colaborador.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#112237]"
                >
                  <option value="member">Miembro</option>
                  <option value="admin">Administrador</option>
                </select>
                <Button
                  type="submit"
                  className="bg-[#f25c05] hover:bg-[#d94d04] text-white"
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Agregar"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Miembros Actuales */}
          <Card className="border border-[#e2e8f0] bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Miembros del Equipo ({company?.companyMembers?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-[#f1f5f9]">
              {company?.companyMembers?.map(
                (m: {
                  id?: string;
                  user_id: string;
                  role: string;
                  user?: { name?: string | null; email: string };
                }) => (
                  <div
                    key={m.id || m.user_id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-[#112237] text-sm">
                        {m.user?.name || m.user?.email}
                      </p>
                      <p className="text-xs text-[#64748b]">{m.user?.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${m.role === "owner" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}
                      >
                        {m.role === "owner" ? "Dueño" : m.role}
                      </span>
                      {m.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(m.user_id)}
                          className="text-red-500 hover:bg-red-50 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
