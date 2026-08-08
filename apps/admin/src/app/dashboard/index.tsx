import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar.tsx";
import { SiteHeader } from "@/components/site-header.tsx";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar.tsx";

export default function BaseLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
