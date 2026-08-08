"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Edit3,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
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
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function UserProfileHubPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [isUpgradingVendor, setIsUpgradingVendor] = useState(false);
  const [vendorSuccess, setVendorSuccess] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/user/profile");
    }
  }, [user, authLoading, router]);

  const handleUpgradeToVendor = async () => {
    if (!user || isUpgradingVendor) return;
    setIsUpgradingVendor(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_pro: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      setVendorSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error("Error al actualizar a vendedor:", err);
    } finally {
      setIsUpgradingVendor(false);
    }
  };

  if (authLoading) {
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

  if (!user) return null;

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("es-PE", {
        month: "long",
        year: "numeric",
      })
    : "2026";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#112237]">Mi Perfil</h1>
          <p className="text-sm text-[#64748b]">
            Gestiona tus datos personales, estado de vendedor y preferencias de
            configuración.
          </p>
        </div>

        <div className="space-y-6">
          {/* ========================================== */}
          {/* 1. SECCIÓN: DATOS DEL USUARIO & EDICIÓN     */}
          {/* ========================================== */}
          <Card className="border border-[#e2e8f0] shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#f1f5f9] border-2 border-[#e2e8f0] shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.name || "Usuario"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#64748b]">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[#112237]">
                        {user.name || "Usuario sin nombre"}
                      </h2>
                      {user.is_pro && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Vendedor Verificado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#64748b] flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-[#94a3b8]" />
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-sm text-[#64748b] flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[#94a3b8]" />
                        {user.phone}
                      </p>
                    )}
                    {user.location && (
                      <p className="text-sm text-[#64748b] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#94a3b8]" />
                        {user.location}
                      </p>
                    )}
                    <p className="text-xs text-[#94a3b8] pt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Miembro desde {formattedDate}
                    </p>
                  </div>
                </div>

                <Link href="/user/profile/edit" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-[#e2e8f0] text-[#112237] hover:bg-[#f8fafc] flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4 text-[#f25c05]" />
                    Editar perfil
                  </Button>
                </Link>
              </div>

              {user.bio && (
                <div className="mt-5 pt-4 border-t border-[#e2e8f0]">
                  <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-1">
                    Sobre mí
                  </p>
                  <p className="text-sm text-[#334155] leading-relaxed">
                    {user.bio}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ========================================== */}
          {/* 2. SECCIÓN: PASARSE A VENDEDOR / ESTADO    */}
          {/* ========================================== */}
          {user.is_pro ? (
            <Card className="border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-lg">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    ¡Tu Cuenta de Vendedor B2B está Activa!
                  </div>
                  <p className="text-sm text-emerald-800">
                    Tienes acceso a publicar productos ilimitados, bundles de
                    tecnología/educación y tarifa reducida de comisión
                    (&lt;10%).
                  </p>
                </div>
                <Link href="/user/dashboard/products">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
                    Ir a mis productos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-[#112237]/10 bg-gradient-to-br from-[#112237] to-[#1e3a5f] text-white shadow-md overflow-hidden relative">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 bg-[#f25c05] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      Plan Vendedor iubizon
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold">
                      ¿Quieres vender equipos multimedia y tecnológicos?
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Conviértete en Vendedor Verificado y publica tus
                      proyectores, pantallas, audio, impresoras y servicios para
                      colegios y empresas con comisiones reducidas (&lt;10%).
                    </p>
                  </div>

                  <div className="shrink-0">
                    {vendorSuccess ? (
                      <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-lg font-semibold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        ¡Activado con Éxito!
                      </div>
                    ) : (
                      <Button
                        onClick={handleUpgradeToVendor}
                        disabled={isUpgradingVendor}
                        className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                      >
                        {isUpgradingVendor ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Activando...
                          </>
                        ) : (
                          <>
                            <Store className="w-4 h-4" />
                            Pasarme a Vendedor
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ========================================== */}
          {/* 3. SECCIÓN: CONFIGURACIÓN INTEGRADA       */}
          {/* ========================================== */}
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-bold text-[#112237]">
              Configuración de la Cuenta
            </h2>

            {/* Notificaciones */}
            <Card className="border border-[#e2e8f0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="w-4 h-4 text-[#f25c05]" />
                  Notificaciones
                </CardTitle>
                <CardDescription>
                  Personaliza la frecuencia con la que te notificamos ventas y
                  novedades.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="font-medium text-sm text-[#112237]">
                      Notificaciones Push
                    </p>
                    <p className="text-xs text-[#64748b]">
                      Recibe alertas instantáneas en tu navegador
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="w-5 h-5 rounded border-[#e2e8f0] text-[#f25c05] focus:ring-[#f25c05] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                  <div>
                    <p className="font-medium text-sm text-[#112237]">
                      Notificaciones por Correo
                    </p>
                    <p className="text-xs text-[#64748b]">
                      Recibe estados de pedidos y facturas por email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-5 h-5 rounded border-[#e2e8f0] text-[#f25c05] focus:ring-[#f25c05] cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seguridad */}
            <Card className="border border-[#e2e8f0] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="w-4 h-4 text-[#112237]" />
                  Seguridad
                </CardTitle>
                <CardDescription>
                  Administra la contraseña y el acceso seguro a tu cuenta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-[#112237]">
                      Contraseña de Acceso
                    </p>
                    <p className="text-xs text-[#64748b]">
                      Actualiza tu contraseña de ingreso periódicamente
                    </p>
                  </div>
                  <Link href="/auth/forgot-password">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold"
                    >
                      Cambiar contraseña
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
