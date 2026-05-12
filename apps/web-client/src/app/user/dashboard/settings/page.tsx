'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Phone, Lock, Bell, CreditCard, Shield, ArrowLeft, Save } from 'lucide-react';

function SettingsContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/user/dashboard/settings');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: 'Error al guardar los cambios' });
    } else {
      setMessage({ type: 'success', text: 'Cambios guardados correctamente' });
    }

    setIsSaving(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/user/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-[#112237]">Configuración</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información del perfil
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información personal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-6">
                    <Avatar src={user.avatar_url} alt={user.name || 'Usuario'} size="xl" />
                    <div>
                      <Button variant="outline" size="sm">
                        Cambiar foto
                      </Button>
                      <p className="text-xs text-[#64748b] mt-2">
                        JPG, PNG hasta 2MB
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Tu nombre"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-[#f8fafc]"
                      />
                      <p className="text-xs text-[#64748b]">
                        El email no se puede cambiar
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+51 999 999 999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografía</Label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Cuéntanos sobre ti..."
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm transition-colors placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#f25c05] focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {message && (
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        message.type === 'success'
                          ? 'bg-[#10b981]/10 text-[#10b981]'
                          : 'bg-[#ef4444]/10 text-[#ef4444]'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <Button type="submit" disabled={isSaving}>
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Iubizon PRO
                  </CardTitle>
                  <CardDescription>
                    Obtén beneficios adicionales como vendedor profesional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.is_pro ? (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#f25c05]/10 to-[#ff7b3a]/10 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="pro">PRO</Badge>
                          <span className="font-medium text-[#112237]">Cuenta activa</span>
                        </div>
                        <p className="text-sm text-[#64748b] mt-1">
                          Tienes acceso a todas las funcionalidades PRO
                        </p>
                      </div>
                      <Button variant="outline">Gestionar plan</Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-[#64748b] mb-4">
                        ¿Quieres destacar tus productos y obtener más ventas?
                      </p>
                      <Button>
                        Activar Iubizon PRO
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Configura cómo quieres recibir notificaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#112237]">Notificaciones push</p>
                        <p className="text-sm text-[#64748b]">Recibe notificaciones en tu dispositivo</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded border-[#e2e8f0] text-[#f25c05] focus:ring-[#f25c05]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#112237]">Notificaciones por email</p>
                        <p className="text-sm text-[#64748b]">Recibe actualizaciones por correo</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded border-[#e2e8f0] text-[#f25c05] focus:ring-[#f25c05]"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#112237]">Mensajes de compradores</p>
                        <p className="text-sm text-[#64748b]">Notificaciones de nuevos mensajes</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded border-[#e2e8f0] text-[#f25c05] focus:ring-[#f25c05]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#112237]">Contraseña</p>
                      <p className="text-sm text-[#64748b]">Último cambio: hace 30 días</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Cambiar contraseña
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#112237]">Autenticación en dos pasos</p>
                      <p className="text-sm text-[#64748b]">Añade una capa extra de seguridad</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Activar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}