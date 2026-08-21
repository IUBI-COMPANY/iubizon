"use client";

import * as React from "react";
import {
  IconBuildingStore,
  IconDashboard,
  IconFolders,
  IconMail,
  IconPackage,
  IconSettings,
  IconShield,
  IconShoppingCart,
  IconWallet,
} from "@tabler/icons-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider.tsx";
import Link from "next/link";

const data = {
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Órdenes", url: "/dashboard/ordenes", icon: IconShoppingCart },
    { title: "Reembolsos", url: "/dashboard/reembolsos", icon: IconShield },
    { title: "Pagos", url: "/dashboard/pagos", icon: IconWallet },
    { title: "Empresas", url: "/dashboard/empresas", icon: IconBuildingStore },
    { title: "Productos", url: "/dashboard/productos", icon: IconPackage },
    { title: "Categorías", url: "/dashboard/categorias", icon: IconFolders },
  ],
  navSecondary: [
    {
      title: "Correos",
      url: "/dashboard/correos",
      icon: IconMail,
    },
    {
      title: "Configuración",
      url: "/dashboard/configuracion",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <img
                  src={
                    isDarkTheme ? "/images/logo-light.png" : "/images/logo.png"
                  }
                  width={100}
                  height={10}
                  className="w-[7em] h-auto"
                  alt="iubizon logo"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
