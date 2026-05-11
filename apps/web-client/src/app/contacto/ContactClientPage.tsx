"use client";

import Image from "next/image";
import { ContactForm } from "@/components/ui/ContactForm";
import { sendContactEmail } from "@/app/contacto/actions";
import { Clock, Mail, MapPin, Phone, CheckCircle } from "lucide-react";

export default function ContactClientPage() {
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
        name: "Contacto",
        item: "https://www.iubizon.com/contacto",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="h-screen min-h-screen flex flex-col lg:flex-row w-full bg-gray-50 relative font-sfpro">
        <div className="w-full lg:w-1/2 h-full relative group overflow-hidden">
          <Image
            src="/images/contactClient.png"
            alt="Contacto iubizon - Especialistas en proyectores"
            width={700}
            height={1000}
            className="w-full h-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105"
            priority
          />

          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-gray-900">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-gray-900">
                Estamos Aquí Para Ayudarte
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
                Expertos en proyectores y tecnología audiovisual en Lima.
                Contáctanos y obtén asesoría personalizada.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3 border border-gray-200">
                  <div className="bg-primary/30 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Respuesta Rápida</p>
                    <p className="text-xs text-gray-600">
                      En menos de 24 horas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-3 border border-gray-200">
                  <div className="bg-primary/30 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Asesoría Experta</p>
                    <p className="text-xs text-gray-600">
                      5 años de experiencia
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-5 h-5 text-primary" />
                  <a
                    href="tel:+51972300301"
                    className="hover:text-primary transition-colors font-semibold"
                  >
                    972 300 301
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-primary" />
                  <a
                    href="mailto:iubizon.company@gmail.com"
                    className="hover:text-primary transition-colors"
                  >
                    iubizon.company@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Chorrillos, Lima - Perú</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-6 lg:p-8">
          <div className="w-full max-w-xl">
            <ContactForm serverActionSendContactEmail={sendContactEmail} />
          </div>
        </div>
      </div>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                Contáctanos
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Otras Formas de Contactarnos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Contáctanos por cualquiera de estos
              medios y te responderemos a la brevedad.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <a href="tel:+51972300301" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white p-6 rounded-3xl border border-gray-200 hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-primary/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Teléfono
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Llámanos directamente
                  </p>
                  <p className="text-primary font-semibold text-lg">
                    972 300 301
                  </p>
                </div>
              </div>
            </a>
            <a
              href="https://wa.me/51972300301"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white p-6 rounded-3xl border border-gray-200 hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-500/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-green-500/20">
                    <svg
                      className="w-8 h-8 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.18 1.6 6.01L0 24l6.09-1.59A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.62.95.97-3.52-.24-.37A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.03-7.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.03 2.82 1.18 3.02c.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.89-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    WhatsApp
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Chatea con nosotros
                  </p>
                  <p className="text-primary font-semibold text-lg">
                    972 300 301
                  </p>
                </div>
              </div>
            </a>

            <a href="mailto:ventas@iubizon.com" className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white p-6 rounded-3xl border border-gray-200 hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-purple-500/20 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-purple-500/20">
                    <Mail className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Email
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    Escríbenos un correo
                  </p>
                  <p className="text-primary font-semibold text-sm break-all">
                    iubizon.company@gmail.com
                  </p>
                </div>
              </div>
            </a>
            <div className="group relative">
              <div className="relative bg-white p-6 rounded-3xl border border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-orange-500/20 p-4 rounded-2xl mb-4 border border-orange-500/20">
                    <Clock className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Horario
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">Lun - Vie</p>
                  <p className="text-gray-900 font-semibold">
                    8:00 AM - 5:00 PM
                  </p>
                  <p className="text-gray-600 text-sm mt-2">Sábado</p>
                  <p className="text-gray-900 font-semibold">
                    9:00 AM - 12:00 PM
                  </p>
                  <p className="text-xs text-gray-500 mt-1">(Previa cita)</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md">
              <div className="flex items-start mb-6">
                <div className="bg-primary/20 p-3 rounded-2xl mr-4 border border-primary/20">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Nuestra Ubicación
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Visítanos en nuestro local y conoce nuestros productos
                  </p>
                  <a
                    href="https://maps.google.com/?q=Pje.+los+Jazmines+121,+Chorrillos,+Lima"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    <span>
                      Calle las acacias, Pje. los Jazmines 181, Chorrillos, Lima
                    </span>
                  </a>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg h-64 border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.989!2d-77.01401!3d-12.17536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105b7d0e0e0e0e1%3A0x1234567890abcdef!2sCalle%20las%20acacias%2C%20Pje.%20los%20Jazmines%20121%2C%20Chorrillos%2015067!5e0!3m2!1ses-419!2spe!4v1234567890123!5m2!1ses-419!2spe"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de iubizon en Google Maps"
                ></iframe>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md text-gray-900">
              <h3 className="text-2xl font-bold mb-4">
                Síguenos en Redes Sociales
              </h3>
              <p className="text-gray-600 mb-6">
                Mantente al día con nuestras últimas ofertas, productos y
                novedades
              </p>
              <div className="space-y-4 mb-8">
                <a
                  href="https://www.facebook.com/iubizon/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition-all duration-300 group"
                >
                  <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                    <img
                      src="/svg/facebook.svg"
                      alt="Facebook"
                      className="w-6 h-6"
                      style={{ filter: "invert(1)" }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Facebook</p>
                    <p className="text-sm text-gray-600">@iubizon</p>
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/iubizon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition-all duration-300 group"
                >
                  <div className="bg-pink-100 p-3 rounded-full group-hover:bg-pink-200 transition-colors">
                    <img
                      src="/svg/instagram.svg"
                      alt="Instagram"
                      className="w-6 h-6"
                      style={{ filter: "invert(1)" }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Instagram</p>
                    <p className="text-sm text-gray-600">@iubizon</p>
                  </div>
                </a>
                <a
                  href="https://www.tiktok.com/@iubizon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition-all duration-300 group"
                >
                  <div className="bg-gray-200 p-3 rounded-full group-hover:bg-gray-300 transition-colors">
                    <img
                      src="/svg/tiktok.svg"
                      alt="TikTok"
                      className="w-6 h-6"
                      style={{ filter: "invert(1)" }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">TikTok</p>
                    <p className="text-sm text-gray-600">@iubizon</p>
                  </div>
                </a>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-bold text-lg mb-3 text-gray-900">
                  ¿Por qué elegirnos?
                </h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span>
                      Especialistas en proyectores con 5 años de experiencia
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span>Distribuidores de Epson</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span>Garantía extendida hasta 12 meses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary text-lg">✓</span>
                    <span>Atención personalizada y asesoría técnica</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 bg-white p-8 rounded-xl shadow-lg text-center">
            <h3 className="text-2xl font-bold text-secondary mb-4">
              ¿Necesitas Ayuda Inmediata?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Nuestro equipo de expertos está listo para ayudarte con cualquier
              consulta sobre proyectores, reparaciones o servicios técnicos.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/51972300301"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.18 1.6 6.01L0 24l6.09-1.59A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.62.95.97-3.52-.24-.37A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.03-7.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.03 2.82 1.18 3.02c.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.89-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z" />
                </svg>
                Chatear por WhatsApp
              </a>
              <a
                href="tel:+51972300301"
                className="bg-primary hover:bg-primary/90 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
