"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signIn, signInWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const redirectTarget = getSanitizedRedirect(searchParams.get("redirect"));

  const isPasswordValid = validatePasswordStrict(password);
  const doPasswordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid)
      return setError("La contraseña no cumple con los requisitos mínimos");
    if (!doPasswordsMatch) return setError("Las contraseñas no coinciden");
    if (!agreedToTerms)
      return setError("Debes aceptar los términos y condiciones");

    setIsLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const { error: signUpError } = await signUp(
      cleanEmail,
      password,
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
      setIsLoading(false);
      return;
    }

    const { error: signInError } = await signIn(cleanEmail, password);
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
    setIsLoading(true);
    setError(null);

    const { error: googleError } = await signInWithGoogle(redirectTarget);
    if (googleError) {
      setError("Error al conectar con Google. Intenta nuevamente.");
      setIsLoading(false);
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 text-sm"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 text-sm"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <PasswordInput
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showRequirements
            disabled={isLoading}
            required
          />

          <PasswordInput
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            confirmValue={password}
            disabled={isLoading}
            required
          />

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#e2e8f0] text-[#f25c05] focus:ring-[#f25c05]"
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className="text-xs text-[#64748b] leading-tight"
            >
              Acepto los{" "}
              <Link
                href="/terms"
                className="text-[#f25c05] hover:underline font-medium"
              >
                Términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacy"
                className="text-[#f25c05] hover:underline font-medium"
              >
                Política de privacidad
              </Link>
            </label>
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

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
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
