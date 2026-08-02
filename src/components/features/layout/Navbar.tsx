"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Heart,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  ShoppingCart,
  User as UserIcon,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCompany } from "@/context/CompanyContext";
import { CompanySwitcher } from "@/components/features/companies/CompanySwitcher";

export const Navbar = () => {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const { itemCount } = useCart();
  const { coordinates } = useGeolocation();
  const { companies, activeCompany, setActiveCompanyId } = useCompany();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("keywords", searchQuery.trim());
      params.set("order_by", "most_relevance");
    } else {
      params.set("order_by", "nearest");
    }

    if (coordinates) {
      params.set("lat", coordinates.latitude.toString());
      params.set("lng", coordinates.longitude.toString());
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <header className="bg-[#112237] text-white sticky top-0 z-50 shadow-md">
      <div className="container px-3 sm:px-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-14 md:h-16 gap-2 sm:gap-3">
          {/* Left Block: Menu Toggle & Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Mobile Menu Toggle (Left) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white md:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            {/* Logo */}
            <Link href="/public" className="flex items-center shrink-0">
              <Image
                src="/images/logo.png"
                alt="iubizon"
                width={130}
                height={34}
                className="h-6 sm:h-7 md:h-9 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Search Bar - Desktop Inline */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-4"
          >
            <div className="relative w-full">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos en iubizon..."
                className="w-full pr-10 bg-white border-0 text-gray-900 focus-visible:ring-0 text-sm py-2 px-3 rounded-lg"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Actions (Cart, Publicar, CompanySwitcher, User Avatar - Right) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/favorites" className="hidden sm:flex">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 p-2"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </Link>

            {/* Shopping Cart Icon with Badge */}
            <Link href="/cart" className="relative">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 p-1.5 sm:p-2"
              >
                <ShoppingCart className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f25c05] text-white text-[10px] font-bold w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center border-2 border-[#112237]">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* BOTÓN "+ PUBLICAR" */}
            <Link href="/products/new">
              <Button className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-[11px] sm:text-xs font-semibold px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-md transition-all flex items-center gap-1 shrink-0">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Publicar</span>
              </Button>
            </Link>

            {/* BOTÓN SWITCHER DE EMPRESA (Solo Desktop) */}
            <div className="hidden md:block">{user && <CompanySwitcher />}</div>

            {/* AVATAR PROPIO DEL USUARIO (EXTREMO DERECHO) */}
            {isLoading ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 animate-pulse" />
            ) : user ? (
              <div className="relative shrink-0" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-white hover:bg-white/10 p-1 rounded-xl transition-colors"
                >
                  <Avatar
                    src={user.avatar_url}
                    fallback={user.name?.[0] || "U"}
                    className="w-7 h-7 sm:w-8 sm:h-8 border border-white/20"
                  />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-[#e2e8f0] py-2 z-50 text-[#112237]">
                    <div className="px-4 py-2 border-b border-[#e2e8f0]">
                      <p className="font-bold text-[#112237] text-sm truncate">
                        {user.name || "Usuario"}
                      </p>
                      <p className="text-xs text-[#64748b] truncate">
                        {user.email}
                      </p>
                      {!activeCompany && (
                        <Link
                          href="/user/companies/new"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f25c05] hover:underline mt-1"
                          onClick={() => setShowUserMenu(false)}
                        >
                          + Registrar mi Empresa / Marca
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href="/user/profile"
                        className="flex items-center gap-3 px-4 py-2 text-[#334155] hover:bg-[#f8fafc] text-xs font-medium"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <UserIcon className="w-4 h-4 text-[#f25c05]" />
                        Mi perfil
                      </Link>

                      <Link
                        href="/user/dashboard?view=personal"
                        className="flex items-center gap-3 px-4 py-2 text-[#334155] hover:bg-[#f8fafc] text-xs font-medium"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="w-4 h-4 text-[#112237]" />
                        Mi Dashboard (Mis Compras)
                      </Link>

                      <div className="border-t border-[#e2e8f0] mt-1 pt-1">
                        <button
                          onClick={async () => {
                            await signOut();
                            setShowUserMenu(false);
                            router.push("/");
                            router.refresh();
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-[#ef4444] hover:bg-red-50 w-full text-left text-xs font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="hidden sm:block">
                <Button
                  variant="secondary"
                  className="bg-[#f25c05] hover:bg-[#e55100] text-white text-xs px-3 py-1.5"
                >
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Row (Clean without Prefix - Tiendamia Mobile Style) */}
        <div className="pb-2.5 md:hidden">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en iubizon..."
                className="w-full pr-10 bg-white border-0 text-gray-900 focus-visible:ring-0 text-xs h-9 rounded-md shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#f25c05]"
                aria-label="Buscar"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative w-[85vw] max-w-sm bg-[#112237] text-white h-full p-6 flex flex-col z-10 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <Image
                src="/images/logo.png"
                alt="iubizon"
                width={130}
                height={34}
                className="h-7 w-auto object-contain"
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-5 space-y-4 flex-1">
              {/* Módulo de Empresa Activa (Mobile Sidebar) */}
              {user && activeCompany && (
                <div className="bg-white/10 rounded-2xl p-4 border border-white/15 shadow-md space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full bg-[#f25c05] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden shadow-md border border-white/30">
                      {activeCompany.logo_url ? (
                        <Image
                          src={activeCompany.logo_url}
                          alt={activeCompany.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>{activeCompany.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">
                        Empresa Activa
                      </p>
                      <p className="font-bold text-sm text-white truncate mt-0.5">
                        {activeCompany.name}
                      </p>
                    </div>
                  </div>

                  {companies.length > 1 && (
                    <div className="pt-2 border-t border-white/10">
                      <label className="text-[11px] text-slate-300 font-medium block mb-1.5">
                        Cambiar de Empresa:
                      </label>
                      <select
                        value={activeCompany.id}
                        onChange={(e) => {
                          setActiveCompanyId(e.target.value);
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-[#0d1b2d] text-white text-xs font-semibold p-2.5 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#f25c05]"
                      >
                        {companies.map((comp) => (
                          <option key={comp.id} value={comp.id}>
                            {comp.name} {comp.id === activeCompany.id ? "(Activa)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                    <Link
                      href={`/user/dashboard?view=company&company_id=${activeCompany.id}`}
                      className="text-[#f25c05] hover:bg-orange-500/10 p-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Building2 className="w-4 h-4 text-[#f25c05]" />
                      Panel de {activeCompany.name}
                    </Link>
                  </div>
                </div>
              )}

              {/* Sección Cuenta / Usuario */}
              <div className="pt-3 border-t border-white/10 space-y-1">
                {user ? (
                  <>
                    <Link
                      href="/user/dashboard?view=personal"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 font-semibold text-sm text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserIcon className="w-5 h-5 text-emerald-400" />
                      Mi Perfil (Mis Compras)
                    </Link>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 font-semibold text-sm text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="w-5 h-5 text-[#f25c05]" />
                      Mis Favoritos
                    </Link>
                    <Link
                      href="/user/companies/new"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 font-bold text-sm text-[#f25c05] transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Plus className="w-5 h-5" />
                      Registrar otra Empresa
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="block text-center bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold py-3 rounded-xl mt-4 text-sm shadow-md transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
