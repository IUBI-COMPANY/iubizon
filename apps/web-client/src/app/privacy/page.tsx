'use client';

import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold text-[#112237] mb-8">
            Política de privacidad
          </h1>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  1. Información que recopilamos
                </h2>
                <p className="text-[#64748b] mb-4">
                  Recopilamos información que proporcionas al registrarte, publicar productos
                  o interactuar con otros usuarios, incluyendo:
                </p>
                <ul className="list-disc list-inside text-[#64748b] space-y-2">
                  <li>Nombre y correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Información de perfil y foto</li>
                  <li>Datos de productos que publicas</li>
                  <li>Historial de compras y ventas</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  2. Cómo usamos tu información
                </h2>
                <p className="text-[#64748b] mb-4">
                  Utilizamos tu información para:
                </p>
                <ul className="list-disc list-inside text-[#64748b] space-y-2">
                  <li>Proporcionar y mejorar nuestros servicios</li>
                  <li>Procesar transacciones y pagos</li>
                  <li>Comunicarte sobre tus pedidos y productos</li>
                  <li>Personalizar tu experiencia en la plataforma</li>
                  <li>Prevenir fraudes y garantizar la seguridad</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  3. Compartir información
                </h2>
                <p className="text-[#64748b] mb-4">
                  Tu información puede ser compartida con:
                </p>
                <ul className="list-disc list-inside text-[#64748b] space-y-2">
                  <li>Otros usuarios cuando realizas o recibes pagos</li>
                  <li>Proveedores de servicios de pago</li>
                  <li>Couriers para envíos</li>
                  <li>Autoridades cuando sea requerido por ley</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  4. Seguridad de tus datos
                </h2>
                <p className="text-[#64748b]">
                  Implementamos medidas de seguridad para proteger tu información personal.
                  Utilizamos encriptación y protocolos de seguridad estándar de la industria.
                  Sin embargo, no podemos garantizar la seguridad absoluta de los datos transmitidos por internet.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  5. Tus derechos
                </h2>
                <p className="text-[#64748b] mb-4">
                  Tienes derecho a:
                </p>
                <ul className="list-disc list-inside text-[#64748b] space-y-2">
                  <li>Acceder a tu información personal</li>
                  <li>Corregir datos incorrectos</li>
                  <li>Solicitar la eliminación de tu cuenta</li>
                  <li>Optar por no recibir comunicaciones</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  6. Cookies
                </h2>
                <p className="text-[#64748b]">
                  Utilizamos cookies para mejorar tu experiencia en la plataforma.
                  Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  7. Contacto
                </h2>
                <p className="text-[#64748b]">
                  Si tienes preguntas sobre esta política de privacidad, puedes contactarnos en:
                  <br />
                  <strong>Email:</strong> privacidad@iubizon.com
                  <br />
                  <strong>Teléfono:</strong> +51 972 300 301
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="text-sm text-[#64748b] mt-8">
            Última actualización: {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}