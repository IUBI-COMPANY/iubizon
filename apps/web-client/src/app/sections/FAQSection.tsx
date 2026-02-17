"use client";
import React from "react";
import { FAQ, FAQItem } from "@/components/ui/FAQ";

const faqItems: FAQItem[] = [
  {
    question: "¿Qué incluye el Bundle Interactivo?",
    answer:
      "El Bundle Interactivo incluye un proyector de alta calidad, el Touch Hub 2 para convertir cualquier superficie en táctil, y el adaptador MiraCast para compartir contenido de forma inalámbrica. Todo lo necesario para transformar tus espacios en entornos interactivos.",
  },
  {
    question: "¿Puedo comprar los productos por separado?",
    answer:
      "Sí, ofrecemos la opción de adquirir el Touch Hub 2 y el adaptador MiraCast como dúo, sin incluir el proyector. Esta opción es ideal si ya cuentas con un proyector compatible.",
  },
  {
    question:
      "¿En qué se diferencia un proyector interactivo de uno tradicional?",
    answer:
      "Un proyector tradicional solo proyecta imágenes estáticas. Con nuestro Bundle Interactivo, puedes interactuar directamente con el contenido proyectado mediante el Touch Hub 2, permitiendo anotar, dibujar, y colaborar en tiempo real sobre cualquier superficie.",
  },
  {
    question: "¿Ofrecen instalación y soporte técnico?",
    answer:
      "Sí, brindamos servicio de instalación profesional y soporte técnico especializado. Nuestro equipo tiene más de 5 años de experiencia garantizando que tu inversión funcione perfectamente desde el primer día.",
  },
  {
    question: "¿Puedo agendar una demostración antes de comprar?",
    answer:
      "Absolutamente. Puedes agendar una demo en nuestras instalaciones, solicitar una visita a tu empresa o institución, o incluso agendar una demostración virtual. Completa el formulario de demo y nos pondremos en contacto contigo.",
  },
  {
    question: "¿Realizan envíos a todo el Perú?",
    answer:
      "Sí, realizamos envíos a nivel nacional. El tiempo de entrega varía según la ubicación. Al momento de realizar tu pedido, te informaremos sobre los plazos de entrega específicos para tu zona.",
  },
  {
    question: "¿Qué garantía tienen los productos?",
    answer:
      "Todos nuestros productos cuentan con garantía del fabricante. Además, ofrecemos servicio técnico especializado para mantener tus equipos funcionando óptimamente a largo plazo.",
  },
  {
    question: "¿Es compatible con cualquier sistema operativo?",
    answer:
      "Sí, nuestro Bundle Interactivo es compatible con Windows, macOS, Android e iOS. El adaptador MiraCast permite compartir contenido desde cualquier dispositivo compatible con Miracast o AirPlay.",
  },
];

export const FAQSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#060e1e]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Resolvemos tus dudas sobre el Bundle Interactivo y nuestros
            productos
          </p>
        </div>
        <FAQ items={faqItems} theme="dark" />
      </div>
    </section>
  );
};
