"use client";

import {
  HelpCircle,
  ShoppingBag,
  Store,
  ShieldCheck,
  FileText,
  Lock,
  ChevronRight,
} from "lucide-react";

export const navItems = [
  { id: "comprar", label: "Cómo Comprar", icon: ShoppingBag },
  { id: "vender", label: "Cómo Vender", icon: Store },
  { id: "seguridad", label: "Seguridad & Garantía", icon: ShieldCheck },
  { id: "terminos", label: "Términos y Condiciones", icon: FileText },
  { id: "privacidad", label: "Política de Privacidad", icon: Lock },
];

interface HelpSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function HelpSidebar({ activeTab, setActiveTab }: HelpSidebarProps) {
  return (
    <div className="md:col-span-1 space-y-1">
      <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider px-3 mb-2">
        Secciones
      </p>
      {navItems.map((item) => {
        const IconComp = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
              isActive
                ? "bg-[#112237] text-white shadow-sm"
                : "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#f25c05] hover:text-[#112237]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <IconComp
                className={`w-4 h-4 ${
                  isActive ? "text-[#f25c05]" : "text-[#94a3b8]"
                }`}
              />
              <span>{item.label}</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 ${
                isActive ? "text-white" : "text-[#cbd5e1]"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
