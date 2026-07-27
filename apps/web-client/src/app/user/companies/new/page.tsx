"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft, Loader2, Save } from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";

export default function NewCompanyPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    tax_id: "",
    phone: "",
    email: "",
    location: "",
    website: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear empresa");

      router.push("/user/profile");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear empresa');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/user/profile"
          className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#112237] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Perfil
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#112237] text-white rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#112237]">
              Registrar mi Empresa
            </h1>
            <p className="text-sm text-[#64748b]">
              Crea una empresa para vincular tus productos y colaborar en
              equipo.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg">
            {error}
          </div>
        )}

        <Card className="border border-[#e2e8f0] bg-white shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">
                  Nombre de la Empresa *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ej: TecnoAulas SAC"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-1">
                    RUC / ID Fiscal
                  </label>
                  <Input
                    value={formData.tax_id}
                    onChange={(e) =>
                      setFormData({ ...formData, tax_id: e.target.value })
                    }
                    placeholder="ej: 20123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-1">
                    Teléfono de Contacto
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+51 999 999 999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-1">
                    Correo Corporativo
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="contacto@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-1">
                    Ubicación / Ciudad
                  </label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Lima, Perú"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">
                  Sitio Web
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://miempresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#334155] mb-1">
                  Descripción
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Resumen de tus productos y servicios para colegios y empresas..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-semibold py-2.5"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Empresa
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
