"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  Check,
  Crown,
  Loader2,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
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

interface Member {
  id: string;
  company_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
  };
}

interface CompanyInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function CompanyMembersPage({ params }: Props) {
  const { id: companyId } = use(params);

  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"member" | "admin">("member");
  const [isAdding, setIsAdding] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadTeamData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/companies/${companyId}/members`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al cargar miembros del equipo.");
      }

      setCompany(data.company);
      setMembers(data.members || []);
      setCurrentUserRole(data.currentUserRole);
      setCurrentUserId(data.currentUserId);
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al cargar miembros.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsAdding(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/companies/${companyId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al agregar colaborador.");
      }

      setMessage({
        type: "success",
        text: `✓ ${data.member.user.email} se agregó como colaborador.`,
      });
      setNewEmail("");
      await loadTeamData();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al agregar miembro.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRoleChange = async (
    targetUserId: string,
    selectedRole: string,
  ) => {
    if (selectedRole === "owner") {
      const confirmTransfer = confirm(
        "⚠️ ADVERTENCIA: Al asignar el rol de Dueño (owner), transferirás la propiedad total de la empresa a este usuario. Tú pasarás a ser Administrador. ¿Deseas continuar?",
      );
      if (!confirmTransfer) return;
    }

    try {
      setUpdatingUserId(targetUserId);
      setMessage(null);

      const res = await fetch(`/api/companies/${companyId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, newRole: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al cambiar el rol.");
      }

      setMessage({
        type: "success",
        text: "✓ Rol actualizado correctamente.",
      });
      await loadTeamData();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al actualizar rol.",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRemoveMember = async (
    targetUserId: string,
    targetName: string,
  ) => {
    const confirmDelete = confirm(
      `¿Seguro que deseas desvincular a "${targetName}" de la empresa?`,
    );
    if (!confirmDelete) return;

    try {
      setUpdatingUserId(targetUserId);
      setMessage(null);

      const res = await fetch(
        `/api/companies/${companyId}/members?userId=${targetUserId}`,
        { method: "DELETE" },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al desvincular colaborador.");
      }

      setMessage({
        type: "success",
        text: "✓ Colaborador desvinculado de la empresa.",
      });
      await loadTeamData();
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Error al desvincular colaborador.",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const canManageTeam =
    currentUserRole === "owner" || currentUserRole === "admin";
  const isOwner = currentUserRole === "owner";

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

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#112237] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Link>

        {/* Header de la Empresa */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative w-14 h-14 rounded-2xl bg-[#f25c05] text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 shadow-md border border-white">
            {company?.logo_url ? (
              <Image
                src={company.logo_url}
                alt={company.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span>
                {company?.name?.[0]?.toUpperCase() || (
                  <Building2 className="w-7 h-7" />
                )}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#112237]">
                Gestión de Equipo de {company?.name}
              </h1>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Administra colaboradores y asigna permisos comerciales
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs font-semibold ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Formulario Agregar Miembro */}
          {canManageTeam && (
            <Card className="border border-[#e2e8f0] bg-white shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-[#f1f5f9]">
                <CardTitle className="text-base flex items-center gap-2 text-[#112237]">
                  <UserPlus className="w-4 h-4 text-[#f25c05]" />
                  Invitar Nuevo Colaborador
                </CardTitle>
                <CardDescription className="text-xs">
                  Ingresa el correo electrónico de un usuario previamente
                  registrado en iubizon.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form
                  onSubmit={handleAddMember}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <Input
                    type="email"
                    placeholder="correo@colaborador.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="flex-1 text-xs"
                    required
                  />
                  <select
                    value={newRole}
                    onChange={(e) =>
                      setNewRole(e.target.value as "member" | "admin")
                    }
                    className="h-10 px-3 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]"
                  >
                    <option value="member">Miembro</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <Button
                    type="submit"
                    className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-5 rounded-xl shadow-sm"
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Agregar al equipo"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de Miembros Actuales */}
          <Card className="border border-[#e2e8f0] bg-white shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-[#112237] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#f25c05]" />
                  Miembros de la Empresa ({members.length})
                </CardTitle>
                <span className="text-xs text-[#64748b]">
                  Tu rol:{" "}
                  <strong className="text-[#112237] uppercase">
                    {currentUserRole}
                  </strong>
                </span>
              </div>
            </CardHeader>

            <CardContent className="divide-y divide-[#f1f5f9] p-0">
              {members.map((m) => {
                const isMemberOwner = m.role === "owner";
                const isSelf = m.user_id === currentUserId;
                const isUpdating = updatingUserId === m.user_id;

                return (
                  <div
                    key={m.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full bg-[#112237] text-white flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden shadow-sm">
                        {m.user?.avatar_url ? (
                          <Image
                            src={m.user.avatar_url}
                            alt={m.user.name || m.user.email}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span>
                            {(m.user?.name ||
                              m.user?.email)?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-[#112237]">
                            {m.user?.name || m.user?.email}
                          </p>
                          {isSelf && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                              Tú
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748b]">
                          {m.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Selector de Rol para Owner o Admin */}
                      {canManageTeam && !isMemberOwner ? (
                        <div className="flex items-center gap-2">
                          {isUpdating && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#f25c05]" />
                          )}
                          <select
                            value={m.role}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleRoleChange(m.user_id, e.target.value)
                            }
                            className="h-9 px-3 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]"
                          >
                            <option value="member">Miembro</option>
                            <option value="admin">Administrador</option>
                            {isOwner && (
                              <option value="owner">
                                Dueño (Transferir propiedad)
                              </option>
                            )}
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Crown className="w-3.5 h-3.5 text-amber-600" />
                          <span>Dueño</span>
                        </div>
                      )}

                      {/* Botón Eliminar Colaborador */}
                      {canManageTeam && !isMemberOwner && (
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isUpdating}
                          onClick={() =>
                            handleRemoveMember(
                              m.user_id,
                              m.user?.name || m.user?.email,
                            )
                          }
                          className="text-red-500 hover:bg-red-50 hover:text-red-700 h-9 w-9 rounded-xl transition-colors"
                          title="Desvincular colaborador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
