"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, User, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
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
import { useAuth } from "@/hooks/useAuth";

export const dynamic = "force-dynamic";

function getSanitizedRedirect(redirectParam: string | null): string {
  if (
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//") &&
    !redirectParam.includes("\\")
  ) {
    return redirectParam;
  }
  return "/user/dashboard";
}

const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres."),
    email: z
      .string()
      .min(1, "El email es obligatorio.")
      .email("Ingresa un email válido."),
    password: z.string().refine(validatePasswordStrict, {
      message: "La contraseña no cumple con los requisitos mínimos.",
    }),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
    agreedToTerms: z.boolean().refine((v) => v === true, {
      message: "Debes aceptar los términos y condiciones.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signIn, signInWithGoogle } = useAuth();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreedToTerms: false,
    },
  });

  const passwordValue = watch("password");
  const isLoading = isSubmitting || isGoogleLoading;

  const redirectTarget = getSanitizedRedirect(searchParams.get("redirect"));

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);

    const cleanEmail = values.email.trim().toLowerCase();
    const cleanName = values.name.trim();

    const { error: signUpError } = await signUp(
      cleanEmail,
      values.password,
      cleanName,
    );

    if (signUpError) {
      if (signUpError.message.includes("rate limit")) {
        setError("Límite de intentos alcanzado. Intenta más tarde.");
      } else if (
        signUpError.message.includes("already registered") ||
        signUpError.message.includes("already exists")
      ) {
        setError("Este email ya está registrado.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    const { error: signInError } = await signIn(cleanEmail, values.password);
    if (signInError) {
      const loginRedirect = searchParams.get("redirect")
        ? `/auth/login?registered=true&redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
        : "/auth/login?registered=true";
      router.push(loginRedirect);
    } else {
      router.push(redirectTarget);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    setIsGoogleLoading(true);
    setError(null);

    const handleFocus = () => {
      setTimeout(() => {
        setIsGoogleLoading(false);
        window.removeEventListener("focus", handleFocus);
      }, 1000);
    };
    window.addEventListener("focus", handleFocus);

    const { error: googleError } = await signInWithGoogle(redirectTarget);
    if (googleError) {
      setError("Error al conectar con Google. Intenta nuevamente.");
      setIsGoogleLoading(false);
      window.removeEventListener("focus", handleFocus);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border border-[#e2e8f0]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-[#112237]">
          Crear cuenta
        </CardTitle>
        <CardDescription>
          Únete a iubizon y empieza a comprar o vender
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-medium rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                className="pl-10 text-sm"
                disabled={isLoading}
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10 text-sm"
                disabled={isLoading}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <PasswordInput
              label="Contraseña"
              showRequirements
              disabled={isLoading}
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
              label="Confirmar contraseña"
              confirmValue={passwordValue}
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="pt-1">
            <Controller
              name="agreedToTerms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  name="agreedToTerms"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                  error={!!errors.agreedToTerms}
                  helperText={errors.agreedToTerms?.message}
                >
                  <span className="text-xs text-[#64748b] leading-tight font-normal">
                    Acepto los{" "}
                    <Link
                      href="/help?tab=terminos"
                      target="_blank"
                      className="text-[#f25c05] hover:underline font-medium"
                    >
                      Términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link
                      href="/help?tab=privacidad"
                      target="_blank"
                      className="text-[#f25c05] hover:underline font-medium"
                    >
                      Política de privacidad
                    </Link>
                  </span>
                </Checkbox>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-semibold py-2.5 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando cuenta...
              </span>
            ) : (
              "Crear cuenta"
            )}
          </Button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-[#94a3b8] font-medium">
                O
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-[#e2e8f0] text-[#112237] hover:bg-gray-50 py-2.5 rounded-lg"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
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
            Continuar con Google
          </Button>
        </form>

        <p className="text-center text-xs text-[#64748b] mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            className="text-[#f25c05] font-semibold hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

import { AuthBackButton } from "@/components/features/auth/AuthBackButton";

export default function RegisterPage() {
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

      <Suspense
        fallback={
          <Card className="w-full max-w-md p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#f25c05] mx-auto" />
          </Card>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
