"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/config/faq";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const toggle = (id: string) =>
    setOpenId((current) => (current === id ? null : id));

  return (
    <section className="py-8">
      <div className="container">
        {/* Card Contenedor Principal de Preguntas Frecuentes */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-8 shadow-sm">
          {/* Header del Card */}
          <div className="border-b border-[#f1f5f9] pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#112237] flex items-center gap-2.5">
                <span className="p-2 bg-orange-50 text-[#f25c05] rounded-xl">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <span>Preguntas Frecuentes</span>
              </h2>
              <p className="text-xs text-[#64748b] mt-1.5 leading-relaxed">
                Resolvemos las dudas más comunes sobre compras, ventas y
                seguridad en IUBIZON.
              </p>
            </div>
          </div>

          {/* Lista de Acordeón */}
          <div className="space-y-3.5">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className={`bg-[#f8fafc] border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-[#f25c05]/50 bg-white ring-2 ring-[#f25c05]/10 shadow-sm"
                      : "border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-slate-50/80"
                  }`}
                >
                  <button
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                  >
                    <span
                      className={`font-extrabold text-sm transition-colors ${
                        isOpen ? "text-[#f25c05]" : "text-[#112237]"
                      }`}
                    >
                      {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`shrink-0 p-1.5 rounded-xl transition-colors ${
                        isOpen
                          ? "bg-[#f25c05] text-white shadow-xs"
                          : "bg-white border border-[#e2e8f0] text-[#64748b]"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 text-sm text-[#475569] leading-relaxed border-t border-[#f1f5f9]/80 mt-1">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
