"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { setLocale } from "yup";
import yup from "@/config/yup.json";
import { Menu } from "lucide-react";
import { ContentWrapper } from "@/components/ui/layout/ContentWrapper";
import { Drawer } from "@/components/ui/layout/DrawerLayout";

interface Option {
  name: string;
  href: string;
}

export interface HeaderNavigation {
  name: string;
  href?: string;
  options?: Option[];
}

const navigation: HeaderNavigation[] = [
  { name: "Inicio", href: "/" },
  { name: "¿Quienes somos?", href: "/quienes-somos" },
  {
    name: "Productos",
    options: [
      { name: "Bundle Interactivo", href: "/productos/bundle-interactivo" },
      { name: "Duo interactivo", href: "/productos/duo-interactivo" },
      {
        name: "Otros productos (proyectores,accesorios,etc.)",
        href: "/productos/pedido",
      },
    ],
  },
  {
    name: "Servicio Técnico",
    href: "/servicios/tecnico",
    options: [
      { name: "Para Personas", href: "/servicios/tecnico/persona" },
      { name: "Para Organizaciónes", href: "/servicios/tecnico/organizacion" },
    ],
  },
  { name: "Contacto", href: "/contacto" },
];

export const HeaderLayout = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const onOpenDrawer = () => setIsOpen(!isOpen);

  useEffect(() => {
    setLocale(yup["es"]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
  }, [isOpen]);

  const isHomePage = pathname === "/";

  return (
    <header
      className={twMerge(
        "top-header top-2 left-0 w-full p-4 z-50",
        isHomePage
          ? "absolute top-0 z-50 w-full h-auto object-cover"
          : "static bg-gradient-to-r from-secondary/90 via-secondary/100 to-secondary/90",
      )}
    >
      <ContentWrapper>
        <div className="w-full text-black flex justify-between items-center">
          <div className="logo grid place-items-center">
            <Link href="/">
              <Image
                src="/images/logo.png"
                width={300}
                height={100}
                alt="iubizon logo"
                className="w-[9em] h-auto object-contain m-auto"
              />
            </Link>
          </div>
          <div className="hidden lg:flex items-center space-x-8">
            <nav className="flex items-center space-x-8">
              {navigation.map((item) =>
                item.options ? (
                  <div
                    key={item.name}
                    className="relative group"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      href={item.href || "#"}
                      className={
                        item.name.toUpperCase().includes("SERVICIO")
                          ? "flex justify-center items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded transition-colors duration-200"
                          : "flex justify-center items-center gap-2 text-white/87 hover:text-white transition-colors duration-200 font-medium"
                      }
                      onClick={() => setOpenDropdown(null)}
                    >
                      {item.name}
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </Link>
                    <div
                      className={`absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 z-[100] ${
                        openDropdown === item.name
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                      }`}
                    >
                      {item.options.map((option) => (
                        <Link
                          key={option.name}
                          href={option.href}
                          className="block px-4 py-3 text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {option.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className="text-white/87 hover:text-white transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </Link>
                ),
              )}
            </nav>
          </div>
          <button
            className="lg:hidden bg-primary rounded-md p-1"
            onClick={onOpenDrawer}
          >
            <Menu size={30} className="text-white" />
          </button>
          <Drawer
            navigation={navigation}
            isOpenDrawer={isOpen}
            onIsOpenDrawer={onOpenDrawer}
          />
        </div>
      </ContentWrapper>
    </header>
  );
};
