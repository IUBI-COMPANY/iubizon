"use client";

import { CheckCircle, ChevronDown } from "lucide-react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { StepsGroup } from "@/app/productos/organizaciones/StepsGroup";
import { useState } from "react";
import Brands from "@/components/ui/Brands";

const breadcrumbData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Inicio",
      item: "https://www.iubizon.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Productos",
      item: "https://www.iubizon.com/productos",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Organizaciones",
      item: "https://www.iubizon.com/productos/organizaciones",
    },
  ],
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function PageSalesService() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "iubizon",
              image: "https://www.iubizon.com/images/logo.png",
              "@id": "https://www.iubizon.com/productos/organizaciones",
              url: "https://www.iubizon.com/productos/organizaciones",
              telephone: "+51 972 300 301",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Pje. los Jazmines 181",
                addressLocality: "Chorrillos",
                addressRegion: "Lima",
                addressCountry: "PE",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: -12.186,
                longitude: -77.014,
              },
              openingHours: "Mo-Fr 09:00-18:00, Sa 09:00-13:00",
              sameAs: [
                "https://www.facebook.com/iubizon/",
                "https://www.instagram.com/iubizon",
                "https://www.tiktok.com/@iubizon",
              ],
              description:
                "Solicita proyectores y equipos audiovisuales para tu empresa, institución u organización en Lima, Perú.",
            }),
          }}
        />
      </Head>
      <header
        className="relative h-[33rem] bg-gradient-to-br from-secondary/10 via-secondary to-secondary/0 overflow-hidden"
        role="banner"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/education-projectors.jpg"
            alt="Productos para organizaciones, empresas e instituciones"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-blue-900/50"></div>
        </div>
      </header>
      <section
        className="relative -mt-[33rem] sm:-mt-[32rem] z-20 px-4"
        id="contact-form"
        aria-label="Formulario de solicitud de productos para organizaciones"
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative z-10 h-auto px-[2em] pt-[3em] 2xl:pt-[5em] flex flex-col justify-center items-center text-center">
            <div className="max-w-4xl mx-auto mb-8">
              <div className="w-full flex justify-center">
                <span className="inline-block bg-primary/13 text-primary font-semibold px-4 py-1 rounded-full mb-4">
                  Solicita o Cotiza
                </span>
              </div>
              <h1 className="text-3xl md:text-[2.5em] font-bold text-white mb-4 leading-tight">
                Productos para Instituciones y Empresas
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
                Proyectores, accesorios y soluciones audiovisuales a medida para{" "}
                <strong className="text-primary">
                  empresas, colegios y organizaciones
                </strong>
                . Recibe asesoría especializada y una propuesta adaptada a tus
                necesidades.
              </p>
            </div>
          </div>
          <StepsGroup />
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Brands title="Marcas Líderes que Ofrecemos" />
        </div>
      </section>

      {/* Use Cases Section with Images */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-secondary">
            Soluciones para Cada Sector
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Equipamos organizaciones de todos los sectores con la mejor
            tecnología audiovisual
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Educación */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64">
                <Image
                  src="/images/servicios/sjlDocentes.webp"
                  alt="Proyectores para educación"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Sector Educativo</h3>
                <p className="text-sm text-gray-200">
                  Colegios, universidades e institutos. Equipamiento para aulas,
                  auditorios y laboratorios.
                </p>
              </div>
            </div>

            {/* Empresas */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64">
                <Image
                  src="/images/proyector-coorporativo.png"
                  alt="Proyectores para empresas"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Sector Empresarial</h3>
                <p className="text-sm text-gray-200">
                  Salas de reuniones, capacitaciones y presentaciones
                  corporativas profesionales.
                </p>
              </div>
            </div>

            {/* Gobierno */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64">
                <Image
                  src="/images/servicios/sjlRack.webp"
                  alt="Proyectores para instituciones públicas"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  Instituciones Públicas
                </h3>
                <p className="text-sm text-gray-200">
                  Gobiernos locales, ministerios y entidades estatales con
                  equipamiento certificado.
                </p>
              </div>
            </div>

            {/* Eventos */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-64">
                <Image
                  src="/images/education-projectors.jpg"
                  alt="Proyectores para eventos"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Eventos y Talleres</h3>
                <p className="text-sm text-gray-200">
                  Centros de capacitación, espacios culturales y organizadores
                  de eventos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Gallery */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-secondary">
            Catálogo de Productos
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Amplia variedad de proyectores, pantallas y accesorios
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Proyectores */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="relative h-48">
                <Image
                  src="/images/proyector-tiro-corto.jpg"
                  alt="Proyectores profesionales"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-secondary">
                  Proyectores
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm mb-4">
                  <li>✓ Corta distancia y ultra corta</li>
                  <li>✓ Alta luminosidad (3000-8000 lúmenes)</li>
                  <li>✓ Full HD y 4K</li>
                  <li>✓ Interactivos y láser</li>
                </ul>
              </div>
            </div>

            {/* Pantallas */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="relative h-48">
                <Image
                  src="/images/servicios/ecran.png"
                  alt="Ecrans de proyección"
                  fill
                  className="object-cover position-top"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-secondary">
                  Ecrans corporativos
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm mb-4">
                  <li>✓ Manuales y eléctricas</li>
                  <li>✓ Trípode y montaje en pared</li>
                  <li>✓ Diversos tamaños (60&quot; - 300&quot;)</li>
                  <li>✓ Alta ganancia y calidad</li>
                </ul>
              </div>
            </div>

            {/* Accesorios */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="relative h-48">
                <Image
                  src="/images/accesorios.png"
                  alt="Accesorios para proyectores"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-secondary">
                  Accesorios
                </h3>
                <ul className="space-y-2 text-gray-600 text-sm mb-4">
                  <li>✓ Soportes de techo y pared</li>
                  <li>✓ Cables HDMI y VGA</li>
                  <li>✓ Lámparas de repuesto</li>
                  <li>✓ Controles remotos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-secondary">
            Nuestros Clientes Confían en Nosotros
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Casos de éxito en instituciones y empresas de todo el Perú
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="/images/servicios/sjlEstudiantes.webp"
                  alt="Proyecto educativo San Juan de Lurigancho"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-gray-600 italic mb-4">
                &quot;Equipamos 20 aulas con proyectores Epson. Excelente
                calidad y soporte post-venta. Los estudiantes ahora tienen
                clases más interactivas.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  IE
                </div>
                <div>
                  <p className="font-semibold text-secondary">
                    I.E. Tupac Amaru II
                  </p>
                  <p className="text-sm text-gray-500">
                    San Juan de Lurigancho
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="/images/servicios/baltamar.webp"
                  alt="Proyecto corporativo Baltamar"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-gray-600 italic mb-4">
                &quot;Instalación profesional de proyectores en nuestras salas
                de capacitación. El equipo técnico fue muy eficiente y
                profesional.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  BM
                </div>
                <div>
                  <p className="font-semibold text-secondary">
                    Edificio Baltamar
                  </p>
                  <p className="text-sm text-gray-500">
                    Centro de conferencias Miraflores
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                <Image
                  src="/images/servicios/lurin.webp"
                  alt="Proyecto instalación Lurín"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-gray-600 italic mb-4">
                &quot;Solución completa para nuestro auditorio. Desde la
                cotización hasta la instalación, todo fue impecable. Muy
                recomendados.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  ML
                </div>
                <div>
                  <p className="font-semibold text-secondary">
                    I.E. Jose Antonio Dapelio
                  </p>
                  <p className="text-sm text-gray-500">Lurín</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-secondary">
            ¿Por qué elegirnos?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Atención Personalizada
              </h3>
              <p className="text-gray-600">
                Asesoría especializada para encontrar la solución perfecta para
                tu organización
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Mejores Marcas</h3>
              <p className="text-gray-600">
                Trabajamos con Epson, BenQ, Optoma, Sony y más marcas líderes
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Entrega y Soporte</h3>
              <p className="text-gray-600">
                Opciones de entrega flexibles y soporte técnico post-venta
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-secondary">
            ¿Cómo Funciona el Proceso?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Simple, rápido y personalizado para tu organización
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary">1</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-secondary">
                Solicita Cotización
              </h3>
              <p className="text-gray-600 text-sm">
                Completa el formulario con los productos que necesitas y los
                detalles de tu organización
              </p>
            </div>

            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary">2</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-secondary">
                Recibe Propuesta
              </h3>
              <p className="text-gray-600 text-sm">
                En menos de 24 horas recibirás una cotización personalizada con
                las mejores opciones
              </p>
            </div>

            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary">3</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-secondary">
                Confirma tu Pedido
              </h3>
              <p className="text-gray-600 text-sm">
                Revisa la propuesta, ajusta detalles si es necesario y confirma
                tu orden de compra
              </p>
            </div>

            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary">4</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-secondary">
                Recibe e Instala
              </h3>
              <p className="text-gray-600 text-sm">
                Entrega coordinada y opcional instalación profesional con
                capacitación incluida
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-block bg-primary/5 rounded-2xl p-8">
              <p className="text-lg font-semibold text-secondary mb-2">
                ⚡ Tiempo promedio de entrega: 7-15 días hábiles
              </p>
              <p className="text-gray-600">
                Dependiendo de la disponibilidad de stock y ubicación
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-secondary">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="¿Qué tipos de organizaciones pueden solicitar productos?"
              answer="Atendemos a todo tipo de organizaciones: empresas, colegios, universidades, instituciones públicas, ONG's, centros de capacitación, iglesias y más."
            />
            <FAQItem
              question="¿Cómo funciona el proceso de cotización?"
              answer="Completa el formulario con los productos que necesitas. Nuestro equipo revisará tu solicitud y te enviará una cotización personalizada en un plazo máximo de 24 horas hábiles."
            />
            <FAQItem
              question="¿Ofrecen descuentos por volumen?"
              answer="Sí, ofrecemos precios especiales para compras por volumen. La cotización que recibirás incluirá los mejores precios según la cantidad solicitada."
            />
            <FAQItem
              question="¿Qué opciones de entrega tienen?"
              answer="Ofrecemos entrega a nivel nacional. Puedes coordinar recojo en tienda, envío a tu domicilio o instalación completa según tus necesidades."
            />
            <FAQItem
              question="¿Incluyen garantía los productos?"
              answer="Todos nuestros productos cuentan con garantía del fabricante. Además, ofrecemos soporte técnico y servicio post-venta."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Necesitas asesoría personalizada?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Nuestro equipo está listo para ayudarte a encontrar la mejor
            solución para tu organización
          </p>
          <Link
            href="https://wa.me/51972300301?text=Hola, necesito asesoría sobre productos para mi organización"
            target="_blank"
            className="inline-block px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Contactar por WhatsApp
          </Link>
        </div>
      </section>
    </>
  );
}
