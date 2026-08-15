"use client";

import { useEffect, useState, Fragment } from "react";
import {
  IconCheck,
  IconX,
  IconFileText,
  IconExternalLink,
  IconChevronDown,
  IconChevronUp,
  IconPhone,
  IconMapPin,
  IconInfoCircle,
  IconPercentage,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { toast } from "sonner";

function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch {
    return "";
  }
}

function CompanyCommissionForm({
  company,
  onUpdated,
}: {
  company: any;
  onUpdated: () => void;
}) {
  const [rate, setRate] = useState<string>(() => {
    if (
      company.custom_commission_rate !== null &&
      company.custom_commission_rate !== undefined
    ) {
      const raw = Number(company.custom_commission_rate);
      const dec = raw > 1 ? raw / 100 : raw;
      return dec.toFixed(4);
    }
    return "";
  });

  const [untilDate, setUntilDate] = useState<string>(() =>
    formatDateForInput(company.custom_commission_until),
  );

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      const finalUntil =
        untilDate.trim() !== "" ? `${untilDate.trim()}T23:59:59` : null;

      const res = await fetch("/api/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: company.id,
          update_commission_only: true,
          custom_commission_rate: rate.trim() === "" ? null : Number(rate),
          custom_commission_until: finalUntil,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Error en respuesta del servidor (${res.status}): ${text || "Respuesta vacía"}`,
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar la comisión");
      }
      toast.success(`Comisión de "${company.name}" actualizada con éxito.`);
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar comisión.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setRate("");
    setUntilDate("");
    try {
      setLoading(true);
      const res = await fetch("/api/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: company.id,
          update_commission_only: true,
          custom_commission_rate: null,
          custom_commission_until: null,
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `Error en respuesta del servidor (${res.status}): ${text || "Respuesta vacía"}`,
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Error al restablecer la comisión");
      }
      toast.info(
        `Comisión de "${company.name}" restablecida a tarifa estándar global.`,
      );
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Error al restablecer comisión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3.5 w-full max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <IconPercentage className="w-4 h-4 text-indigo-600 shrink-0" />
          Comisión Preferencial
        </h4>
        <span className="text-[10px] text-slate-400 font-medium">
          Vacío = Estándar global
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 block">
            Tasa Preferencial
          </label>
          <Input
            type="text"
            placeholder="Ej: 0.0500 o 5"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="text-xs font-mono font-bold text-slate-800 w-full"
          />
          <p className="text-[10px] text-slate-400">
            Formato: 0.0500 (5%), 0.0000 (0%)
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 block">
            Válido Hasta
          </label>
          <Input
            type="date"
            value={untilDate}
            onChange={(e) => setUntilDate(e.target.value)}
            className="text-xs text-slate-700 font-medium w-full"
          />
          <p className="text-[10px] text-slate-400">
            Vacío = Indefinido / Permanente
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={loading}
          className="text-xs font-medium"
        >
          Usar Estándar
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
        >
          {loading ? "Guardando..." : "Guardar Comisión"}
        </Button>
      </div>
    </div>
  );
}

function renderCommissionBadge(c: any) {
  const isIubizon =
    c.tax_id === "20614600374" || c.name?.toLowerCase().includes("iubizon");

  if (
    c.custom_commission_rate !== null &&
    c.custom_commission_rate !== undefined
  ) {
    const rawRate = Number(c.custom_commission_rate);
    const dec = rawRate > 1 ? rawRate / 100 : rawRate;
    const formatted = dec.toFixed(4);
    const pct = (dec * 100).toFixed(0);

    const until = c.custom_commission_until
      ? new Date(c.custom_commission_until)
      : null;
    const isExpired = until && until < new Date();

    if (isExpired) {
      return (
        <Badge
          variant="outline"
          className="bg-slate-50 text-slate-600 border-slate-300"
        >
          Estándar (Vencido)
        </Badge>
      );
    }

    if (dec === 0) {
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-300">
          {until
            ? `Preferencial 0.0000 (${until.toLocaleDateString()})`
            : "Preferencial 0.0000 (Indefinido)"}
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300">
        {until
          ? `Preferencial ${formatted} (${pct}%)`
          : `Preferencial ${formatted} (${pct}%)`}
      </Badge>
    );
  }

  if (isIubizon) {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-300">
        Exento 0.0000 (IUBIZON)
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-slate-50 text-slate-600 border-slate-200"
    >
      Estándar Global
    </Badge>
  );
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(
    null,
  );

  // Confirm Modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{
    id: string;
    name: string;
    verified: boolean;
  } | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/companies?${params}`);
    const data = await res.json();
    setCompanies(data.companies || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerVerificationConfirm = (
    id: string,
    name: string,
    verified: boolean,
  ) => {
    setSelectedCompany({ id, name, verified });
    setConfirmOpen(true);
  };

  const handleConfirmVerification = async () => {
    if (!selectedCompany) return;
    const { id, name, verified } = selectedCompany;

    try {
      const res = await fetch("/api/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_verified: !verified }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al actualizar.");
      }

      if (!verified) {
        // Se aprobó la empresa
        if (data.wasSuspendedLongTime) {
          toast.warning(
            `"${name}" aprobada. Debido a que estuvo inactiva por más de 1 mes, todos sus productos se configuraron como inactivos y con stock 0 para evitar inconsistencias.`,
          );
        } else if (data.activatedCount > 0) {
          toast.success(
            `"${name}" aprobada con éxito. Se activaron ${data.activatedCount} productos que cumplieron con los requisitos de fotos, stock y precio.`,
          );
        } else {
          toast.success(
            `"${name}" aprobada. Ningún producto inactivo cumplió con los requisitos de publicación (fotos, stock y precio).`,
          );
        }
      } else {
        // Se desmarcó la verificación
        toast.info(
          `Se retiró la verificación de "${name}". Todos sus productos pasaron a estado inactivo.`,
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Error al procesar la solicitud.");
    } finally {
      fetchCompanies();
      setSelectedCompany(null);
    }
  };

  const handleRowClick = (id: string) => {
    setExpandedCompanyId(expandedCompanyId === id ? null : id);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <p className="text-muted-foreground">
          Evaluación y aprobación de Ficha RUC de comercios vendedores
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Buscar por nombre, RUC o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchCompanies()}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={fetchCompanies}>
          Buscar
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Empresas Registradas ({companies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Empresa / Marca</TableHead>
                <TableHead>Razón Social / RUC</TableHead>
                <TableHead className="text-center">Productos</TableHead>
                <TableHead className="text-center">Comisión</TableHead>
                <TableHead className="text-center">
                  Estado Verificación
                </TableHead>
                <TableHead className="text-right">Evaluación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Cargando empresas...
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No se encontraron empresas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((c: any) => {
                  const isExpanded = expandedCompanyId === c.id;
                  return (
                    <Fragment key={c.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                        onClick={() => handleRowClick(c.id)}
                      >
                        <TableCell
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(c.id);
                          }}
                        >
                          {isExpanded ? (
                            <IconChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <IconChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </TableCell>
                        <TableCell className="font-semibold">
                          <div>{c.name}</div>
                          <div className="text-xs text-muted-foreground font-normal">
                            {c.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium text-slate-800">
                            {c.legal_name || "-"}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {c.tax_id || "Sin RUC"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {c._count?.products ?? 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {renderCommissionBadge(c)}
                        </TableCell>
                        <TableCell className="text-center">
                          {c.is_verified ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-300">
                              <IconCheck className="h-3.5 w-3.5 mr-1 text-emerald-600 inline" />
                              Verificada / Aprobada
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-800 border-amber-300"
                            >
                              <IconX className="h-3.5 w-3.5 mr-1 text-amber-600 inline" />
                              Pendiente de Evaluación
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant={c.is_verified ? "outline" : "default"}
                            size="sm"
                            className={
                              c.is_verified
                                ? ""
                                : "bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            }
                            onClick={() =>
                              triggerVerificationConfirm(
                                c.id,
                                c.name,
                                c.is_verified,
                              )
                            }
                          >
                            {c.is_verified ? "Desmarcar" : "Aprobar Empresa"}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableCell
                            colSpan={7}
                            className="p-0 border-t border-slate-100"
                          >
                            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                              {/* Tarjeta de Datos Detallados */}
                              <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <IconInfoCircle className="w-4 h-4 text-[#f25c05]" />
                                  Información del Comercio
                                </h3>

                                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3.5">
                                  <div className="flex items-start gap-2.5">
                                    <IconPhone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                                        Teléfono de Contacto
                                      </p>
                                      <p className="text-sm font-medium text-slate-700">
                                        {c.phone || "No registrado"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-start gap-2.5">
                                    <IconMapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                                        Domicilio Fiscal / Ubicación
                                      </p>
                                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                        {c.location || "No registrado"}
                                      </p>
                                    </div>
                                  </div>

                                  {c.description && (
                                    <div className="pt-2 border-t border-slate-100">
                                      <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                                        Descripción
                                      </p>
                                      <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-wrap">
                                        &ldquo;{c.description}&rdquo;
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Formulario para configurar comisión preferencial */}
                                <CompanyCommissionForm
                                  company={c}
                                  onUpdated={fetchCompanies}
                                />

                                <div className="flex gap-3">
                                  {c.tax_id_document_url && (
                                    <a
                                      href={c.tax_id_document_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-300 shadow-xs"
                                    >
                                      <IconExternalLink className="w-4 h-4" />
                                      Abrir PDF en pestaña nueva
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Visor PDF Integrado */}
                              <div className="flex flex-col gap-2">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <IconFileText className="w-4 h-4 text-purple-600" />
                                  Documento Adjuntado (Ficha RUC)
                                </h3>

                                {c.tax_id_document_url ? (
                                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[320px] bg-white relative">
                                    <iframe
                                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(c.tax_id_document_url)}&embedded=true`}
                                      className="w-full h-full"
                                      title={`Ficha RUC - ${c.name}`}
                                    />
                                    {/* Enlace alternativo directo por si falla el visor de google */}
                                    <div className="absolute bottom-3 right-3">
                                      <a
                                        href={c.tax_id_document_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-white/95 hover:bg-white text-slate-800 border border-slate-350 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm transition-colors flex items-center gap-1"
                                      >
                                        Visor directo
                                        <IconExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-slate-200 rounded-2xl h-[320px] flex flex-col items-center justify-center text-center p-6 bg-slate-100/50">
                                    <IconFileText className="w-10 h-10 text-slate-300 mb-2" />
                                    <p className="text-sm font-bold text-slate-500">
                                      Sin Documento
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                                      Este comercio no ha subido su Ficha RUC
                                      (PDF) para validación.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Confirmación para Aprobación / Desmarcado */}
      {selectedCompany && (
        <ConfirmModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={
            selectedCompany.verified
              ? "¿Desmarcar Verificación?"
              : "¿Aprobar Empresa?"
          }
          description={
            selectedCompany.verified
              ? `¿Estás seguro de que deseas quitar la verificación de "${selectedCompany.name}"? Todos sus productos asociados dejarán de estar publicados en la tienda de iubizon inmediatamente.`
              : `¿Estás seguro de que deseas aprobar y verificar a "${selectedCompany.name}"? Esto habilitará todos sus productos para que estén visibles y listos para la venta en iubizon.`
          }
          confirmLabel={
            selectedCompany.verified ? "Sí, Desmarcar" : "Sí, Aprobar Empresa"
          }
          variant={selectedCompany.verified ? "destructive" : "default"}
          onConfirm={handleConfirmVerification}
        />
      )}
    </div>
  );
}
