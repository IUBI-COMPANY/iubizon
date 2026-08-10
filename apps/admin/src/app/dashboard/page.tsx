"use client";

import { useEffect, useState } from "react";
import {
  IconPackage,
  IconShoppingCart,
  IconBuildingStore,
  IconCoin,
  IconShield,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.text())
      .then((text) => {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
      .then(setStats)
      .catch(() => {});
  }, []);

  const kpis = [
    {
      title: "Productos Activos",
      value: stats?.products?.active ?? "-",
      icon: IconPackage,
      color: "text-blue-600",
    },
    {
      title: "Órdenes Pendientes",
      value: stats?.orders?.pending ?? "-",
      icon: IconShoppingCart,
      color: "text-amber-600",
    },
    {
      title: "Empresas",
      value: stats?.companies?.total ?? "-",
      icon: IconBuildingStore,
      color: "text-emerald-600",
    },
    {
      title: "Ingresos Totales",
      value: stats?.revenue?.total
        ? `S/ ${stats.revenue.total.toLocaleString("es-PE")}`
        : "-",
      icon: IconCoin,
      color: "text-violet-600",
    },
    {
      title: "Reembolsos Pendientes",
      value: stats?.refunds?.pending ?? "-",
      icon: IconShield,
      color: "text-red-600",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Panel de administración de iubizon
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
