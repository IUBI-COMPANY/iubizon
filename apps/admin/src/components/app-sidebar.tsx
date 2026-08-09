"use client";

import * as React from "react";
import { IconDashboard, IconPackage, IconFolders, IconShoppingCart, IconBuildingStore, IconSettings } from "@tabler/icons-react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme-provider.tsx";

const data = {
  user: { name: "Admin", email: "admin@iubizon.com", avatar: "/avatars/shadcn.jpg" },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
    { title: "Productos", url: "/dashboard/productos", icon: IconPackage },
    { title: "Categorías", url: "/dashboard/categorias", icon: IconFolders },
    { title: "Órdenes", url: "/dashboard/ordenes", icon: IconShoppingCart },
    { title: "Empresas", url: "/dashboard/empresas", icon: IconBuildingStore },
  ],
  navSecondary: [
    { title: "Configuración", url: "/dashboard/configuracion", icon: IconSettings },
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
              <a href="dashboard">
                <img
                  src={
                    isDarkTheme ? "/images/logo-light.png" : "/images/logo.png"
                  }
                  width={100}
                  height={10}
                  className="w-[7em] h-auto"
                  alt="iubizon logo"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
