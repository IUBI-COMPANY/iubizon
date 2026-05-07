'use client';

import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold text-[#112237] mb-8">
            Términos y condiciones
          </h1>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  1. Aceptación de términos
                </h2>
                <p className="text-[#64748b]">
                  Al acceder y utilizar Iubizon, aceptas estos términos y condiciones en su totalidad.
                  Si no estás de acuerdo con alguno de estos términos, no debes usar la plataforma.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  2. Uso de la plataforma
                </h2>
                <p className="text-[#64748b] mb-4">
                  Iubizon es una plataforma de compra y venta de productos entre usuarios.
                  Te comprometes a:
                </p>
                <ul className="list-disc list-inside text-[#64748b] space-y-2">
                  <li>No publicar contenido ilegal o inappropriado</li>
                  <li>No realizar actividades fraudulentas</li>
                  <li>Respetar a otros usuarios y vendedores</li>
                  <li>Cumplir con todas las leyes aplicables</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  3. Publicación de productos
                </h2>
                <p className="text-[#64748b]">
                  Los vendedores son responsables de la veracidad de la información de sus productos.
                  Está prohibido publicar productos prohibidos, falsificados o que violen derechos de terceros.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  4. Transacciones y pagos
                </h2>
                <p className="text-[#64748b]">
                  Las transacciones se realizan directamente entre compradores y vendedores.
                  Iubizon puede cobrar una comisión por cada venta realizada.
                  Los pagos se procesan a través de métodos seguros.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  5. Protección al comprador
                </h2>
                <p className="text-[#64748b]">
                  Ofecemos protección al comprador para transacciones que cumplan con nuestras políticas.
                  Si tienes problemas con una compra, puedes reportar el incidente dentro de los 7 días posteriores a la compra.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  6. Limitación de responsabilidad
                </h2>
                <p className="text-[#64748b]">
                  Iubizon no garantiza la calidad, seguridad o legalidad de los productos publicados.
                  Los usuarios son responsables de verificar la información antes de realizar una compra.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">
                  7. Modificaciones
                </h2>
                <p className="text-[#64748b]">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento.
                  Los cambios entrarán en vigor desde su publicación en la plataforma.
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