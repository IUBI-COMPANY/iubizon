import React from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string | React.ReactNode;
};

const faqs: FAQItem[] = [
  {
    question: "¿Qué marcas de proyectores reparan?",
    answer:
      "Trabajamos principalmente con proyectores Epson como nuestra especialidad principal. También reparamos otras marcas reconocidas como Aldo, BenQ, Sony y ViewSonic. Nuestros técnicos están especializados en proyectores para educación, empresas y uso doméstico.",
  },
  {
    question: "¿Cuánto tiempo toma la reparación?",
    answer:
      "Primero realizamos un diagnóstico técnico completo para identificar el problema exacto. Posterior al diagnóstico, las reparaciones toman mínimo 2 días hábiles. Para casos más complejos que requieren repuestos especiales, el tiempo puede extenderse. Siempre informamos el tiempo estimado después del diagnóstico.",
  },
  {
    question: "¿Tienen servicio a domicilio en Lima?",
    answer:
      "Sí, brindamos servicio técnico a domicilio en toda Lima y distritos aledaños. El servicio a domicilio es solo para diagnóstico; la reparación se realiza en nuestro taller especializado.",
  },
  {
    question: "¿Atienden proyectores de provincia?",
    answer: (
      <>
        Sí, ofrecemos atención especializada para clientes de provincia a través
        de nuestro servicio de envío. El cliente envía su proyector a nuestro
        local ubicado en{" "}
        <strong>Pje. los Jazmines 181, Chorrillos, Lima</strong>, realizamos el
        servicio técnico completo con diagnóstico, reparación y pruebas de
        calidad, y una vez culminado el servicio, lo reenviamos a su dirección.
        Este es un servicio especial que garantiza la misma calidad técnica para
        todo el Perú.
      </>
    ),
  },
];

export default function FAQAccordion() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <section
      className="py-16 bg-secondary"
      itemScope
      itemType="https://schema.org/FAQPage"
      aria-labelledby="faq-heading"
      aria-label="Preguntas frecuentes sobre reparación de proyectores"
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-400">
            Resolvemos las dudas más comunes sobre nuestro servicio técnico de
            proyectores Epson, BenQ, Sony y más en Lima.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, index) => {
            const isOpen = openItems.has(index);

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
                itemScope
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-color-secondary/30 transition-all"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3
                    itemProp="name"
                    className="text-lg font-bold text-color-secondary pr-8"
                  >
                    {item.question}
                  </h3>

                  <ChevronDown
                    className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5 pt-4">
                    <div
                      itemScope
                      itemType="https://schema.org/Answer"
                      itemProp="acceptedAnswer"
                    >
                      <p itemProp="text" className="text-gray-700">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
