"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  User as UserIcon,
  ShoppingCart,
  X,
  Building2,
  ChevronDown,
  Store,
  Plus,
  Users,
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
  const { activeCompany } = useCompany();

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
      <div className="container">
        {/* Top Header Row (Tiendamia Style) */}
        <div className="flex items-center justify-between h-14 md:h-16 gap-3">
          {/* Mobile Menu Toggle (Left) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo (Center on mobile, Left on desktop) */}
          <Link href="/" className="flex items-center shrink-0 mx-auto md:mx-0">
            <Image
              src="/images/logo.png"
              alt="iubizon"
              width={140}
              height={36}
              className="h-7 md:h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search Bar - Desktop Inline */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
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

          {/* Actions (Cart, Favorites, Auth - Right) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/favorites" className="hidden sm:flex">
              <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>

            {/* Shopping Cart Icon with Badge */}
            <Link href="/user/dashboard" className="relative">
              <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
                <ShoppingCart className="w-5.5 h-5.5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#f25c05] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#112237]">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* BOTÓN "+ PUBLICAR" */}
            <Link href="/products/new">
              <Button className="bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-md transition-all flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span>Publicar</span>
              </Button>
            </Link>

            {/* BOTÓN SWITCHER DE EMPRESA */}
            {user && <CompanySwitcher />}

            {/* AVATAR PROPIO DEL USUARIO (EXTREMO DERECHO) */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors"
                >
                  <Avatar
                    src={user.avatar_url}
                    fallback={user.name?.[0] || "U"}
                    className="w-8 h-8 border border-white/20"
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
                        href="/user/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-[#334155] hover:bg-[#f8fafc] text-xs font-medium"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="w-4 h-4 text-[#112237]" />
                        Panel (dashboard)
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#112237] text-white h-full p-5 flex flex-col z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <Image
                src="/images/logo.png"
                alt="iubizon"
                width={120}
                height={30}
                className="h-7 w-auto object-contain"
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4 space-y-3 flex-1 overflow-y-auto">
              <Link
                href="/products"
                className="block px-3 py-2 rounded-lg hover:bg-white/10 font-medium text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Todas las Categorías
              </Link>
              <Link
                href="/favorites"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 font-medium text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <Heart className="w-4.5 h-4.5 text-[#f25c05]" />
                Mis Favoritos
              </Link>

              {user ? (
                <>
                  <Link
                    href="/user/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 font-medium text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="w-4.5 h-4.5 text-gray-300" />
                    Mi Perfil
                  </Link>
                  <Link
                    href="/user/dashboard/products"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 font-medium text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="w-4.5 h-4.5 text-gray-300" />
                    Mis Productos
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block text-center bg-[#f25c05] hover:bg-[#e55100] text-white font-semibold py-2.5 rounded-lg mt-4 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
