"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  Phone,
  MapPin,
  Camera,
  Save,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Navbar } from "@/components/features/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
    location: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/user/profile/edit");
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, authLoading]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, phone, bio, avatar_url, location")
        .eq("id", user?.id)
        .single();

      if (data) {
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          location: data.location || "",
        });
        setAvatarPreview(data.avatar_url || null);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      let avatarUrl = avatarPreview;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          location: formData.location,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Perfil actualizado correctamente" });

      setTimeout(() => {
        router.push("/user/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error saving profile:", err);
      setMessage({
        type: "error",
        text: "Error al guardar el perfil. Intenta de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#64748b] hover:text-[#112237] mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <h1 className="text-2xl font-bold text-[#112237] mb-6">
            Editar mi perfil
          </h1>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-[#f8fafc] border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Avatar"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-[#94a3b8]">
                      {formData.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-[#f25c05] rounded-full cursor-pointer hover:bg-[#e55100] transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-[#64748b] mt-2">
                Cambiar foto de perfil
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nombre
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Tu nombre"
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+51 999 999 999"
                className="w-full"
              />
              <p className="text-xs text-[#94a3b8] mt-1">
                Este número se mostrará a los compradores interesados
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Ubicación
              </label>
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Lima, Perú"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#334155] mb-2">
                Descripción
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Cuéntanos sobre ti..."
                rows={4}
                className="w-full"
              />
              <p className="text-xs text-[#94a3b8] mt-1">
                {formData.bio.length}/500 caracteres
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#f25c05] hover:bg-[#e55100]"
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
                  Guardar cambios
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
