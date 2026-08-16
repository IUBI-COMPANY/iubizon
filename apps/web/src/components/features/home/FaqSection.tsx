"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, MessageCircleQuestion } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/config/faq";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const toggle = (id: string) =>
    setOpenId((current) => (current === id ? null : id));

  return (
    <section className="py-8">
      <div className="container">
        <div className="border-b border-[#f1f5f9] pb-4 mb-6">
          <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#f25c05]" />
            Preguntas Frecuentes
          </h2>
          <p className="text-xs text-[#64748b] mt-1">
            Resolvemos las dudas más comunes sobre compras, ventas y seguridad
            en IUBIZON.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`bg-[#f8fafc] border rounded-2xl transition-colors duration-200 ${
                  isOpen ? "border-[#f25c05]/40" : "border-[#e2e8f0]"
                }`}
              >
                <button
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                >
                  <span className="font-extrabold text-sm text-[#112237]">
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`shrink-0 p-1 rounded-lg ${
                      isOpen
                        ? "bg-[#f25c05] text-white"
                        : "bg-white border border-[#e2e8f0] text-[#94a3b8]"
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
                      <p className="px-4 pb-4 text-sm text-[#475569] leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white border border-[#e2e8f0] rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-orange-100 text-[#f25c05] rounded-xl shrink-0">
              <MessageCircleQuestion className="w-5 h-5" />
            </span>
            <div>
              <p className="font-extrabold text-sm text-[#112237]">
                ¿Tienes más preguntas?
              </p>
              <p className="text-xs text-[#64748b]">
                Visita nuestro Centro de Información & Ayuda para conocer todo
                sobre la plataforma.
              </p>
            </div>
          </div>
          <Link
            href="/help"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium bg-[#f25c05] text-white hover:bg-[#d94d04] active:scale-[0.98] transition-all duration-200 h-10 px-4 py-2"
          >
            Ir al Centro de Ayuda
          </Link>
        </div>
      </div>
    </section>
  );
}
