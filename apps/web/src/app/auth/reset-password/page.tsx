"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import {
  PasswordInput,
  validatePasswordStrict,
} from "@/components/ui/PasswordInput";
import { createClient } from "@/lib/supabase/client";

const resetPasswordSchema = z
  .object({
    password: z.string().refine(validatePasswordStrict, {
      message:
        "La contraseña no cumple con los requisitos mínimos de seguridad.",
    }),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password");

  useEffect(() => {
    // detectSessionInUrl auto-processes the access_token from the hash
    // Then we check if a session was established
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setHasSession(true);
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [supabase]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <Card className="w-full max-w-md border border-[#e2e8f0]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#112237]">
            {success
              ? "¡Contraseña actualizada!"
              : checkingSession
                ? "Verificando..."
                : hasSession
                  ? "Nueva contraseña"
                  : "Enlace inválido"}
          </CardTitle>
          <CardDescription>
            {success
              ? "Redirigiendo al inicio de sesión..."
              : checkingSession
                ? "Verificando tu sesión..."
                : hasSession
                  ? "Ingresa tu nueva contraseña"
                  : "El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {checkingSession ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full" />
            </div>
          ) : success ? (
            <div className="text-center space-y-4">
              <div className="p-3 bg-[#10b981]/10 text-[#10b981] text-sm font-medium rounded-lg">
                Tu contraseña ha sido actualizada correctamente.
              </div>
            </div>
          ) : hasSession ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 bg-[#ef4444]/10 text-[#ef4444] text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <PasswordInput
                  label="Nueva contraseña"
                  showRequirements
                  disabled={isSubmitting}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <PasswordInput
                  label="Confirmar nueva contraseña"
                  confirmValue={passwordValue}
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-semibold py-2.5 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-3 bg-[#fef2f2] text-[#ef4444] text-sm rounded-lg">
                No se pudo verificar tu sesión. El enlace puede haber expirado.
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-[#f25c05] hover:underline text-sm"
              >
                Solicitar un nuevo enlace
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
