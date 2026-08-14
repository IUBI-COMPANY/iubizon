"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IconLock, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const { signIn, signInWithGoogle } = useAuth();
  const [serverError, setServerError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const isNotAdminError =
    errorParam === "not_admin" || errorParam === "access_denied";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError("");
    const { error } = await signIn(values.email, values.password);
    if (error) {
      setServerError(error);
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <IconLock className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl">iubizon Admin</CardTitle>
        <CardDescription>Acceso exclusivo para administradores</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isNotAdminError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3.5 flex items-start gap-3 text-xs text-destructive text-left">
            <IconAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Acceso Denegado</p>
              <p className="mt-0.5 leading-relaxed text-destructive/90">
                Tu cuenta no cuenta con permisos de administrador. Por favor,
                solicita el acceso a un administrador del sistema.
              </p>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continuar con Google
        </Button>

        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">o con email</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="email"
            label="Email"
            required
            error={errors.email?.message}
          >
            <Input
              id="field_email"
              type="email"
              placeholder="correo@ejemplo.com"
              {...register("email")}
            />
          </FormField>

          <FormField
            name="password"
            label="Contraseña"
            required
            error={errors.password?.message}
          >
            <Input
              id="field_password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
          </FormField>

          {serverError && (
            <p className="text-xs text-destructive">{serverError}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                Ingresando...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-sm p-8 text-center">
            <IconLoader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </Card>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
