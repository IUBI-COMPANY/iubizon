"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { AuthBackButton } from "@/components/features/auth/AuthBackButton";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio.")
    .email("Ingresa un email válido."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      values.email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      },
    );

    if (error) {
      if (error.message.includes("rate limit")) {
        setError(
          "Has excedido el límite de intentos. Espera al menos 1 hora antes de volver a intentarlo.",
        );
      } else {
        setError(error.message);
      }
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-4">
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Suspense
          fallback={
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#475569] bg-white border border-[#e2e8f0] px-3.5 py-2 rounded-2xl shadow-sm opacity-60">
              <ArrowLeft className="w-4 h-4 text-[#f25c05]" />
              <span>Volver al Inicio</span>
            </div>
          }
        >
          <AuthBackButton />
        </Suspense>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
          <CardDescription>
            {sent
              ? "Revisa tu email para restablecer tu contraseña"
              : "Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="p-3 bg-[#10b981]/10 text-[#10b981] text-sm rounded-lg">
                Te hemos enviado un email con instrucciones para restablecer tu
                contraseña. Si no lo encuentras, revisa tu carpeta de spam.
              </div>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 bg-[#ef4444]/10 text-[#ef4444] text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm text-[#f25c05] hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
