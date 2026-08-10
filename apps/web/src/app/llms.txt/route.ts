import { NextResponse } from "next/server";

const content = `# iubizon - Tecnología para educar y trabajar

> iubizon es el marketplace peruano que conecta empresas y compradores con productos y servicios tecnológicos y multimedia, pensados para colegios, instituciones educativas y negocios. Encuentra todo en un solo lugar, compra con proveedores verificados y recibe cada pedido con garantía oficial y protección al comprador.

## Soluciones y Servicios

Una plataforma diseñada para transformar la educación y el trabajo con proyección, interacción y participación: di adiós a los cuadernos, la regla y la pizarra, y da paso a soluciones tecnológicas que hacen más dinámica la enseñanza y la operación de tu empresa.

- [Comprar productos y servicios](/products): Descubre tecnología, equipos multimedia y servicios para tu empresa, colegio u hogar, en un solo lugar y al mejor precio.
- [Vender en iubizon](/products/new): Conecta tu catálogo con miles de compradores institucionales y personas en todo el Perú, con cobros transparentes y transferencias directas.
- [Explorar el catálogo completo](/search): Busca por categorías y encuentra exactamente lo que necesitas para educar, trabajar y crecer.
- [Tiendas oficiales y empresas verificadas](/companies): Compra con la confianza de marcas y distribuidores verificados.
- [Armar kits y paquetes tecnológicos](/help?tab=comprar): Combina laptops, proyectores, impresoras y accesorios en un solo pago para equipar tus aulas o tu oficina.
- [Cotización oficial con RUC para empresas](/help?tab=comprar): Genera y descarga al instante una cotización con RUC para la aprobación en tu institución o empresa.
- [Pagos 100% seguros con garantía](/help?tab=seguridad): Paga con tarjeta de crédito o débito a través de una pasarela bancaria con encriptación de alta seguridad.
- [Protección iubizon en cada compra](/help?tab=seguridad): Todos los productos cuentan con garantía oficial y cobertura de 7 días para verificar tu entrega.

## Por qué elegirnos

- [Cómo comprar con total tranquilidad](/help?tab=comprar): Recibe cada pedido respaldado por garantía oficial, seguimiento de despacho y protección al comprador.
- [Cómo vender y hacer crecer tu negocio](/help?tab=vender): Gestiona pedidos y despachos desde tu panel, recibe notificaciones al instante y mantén alta la reputación de tu tienda.
- [Seguridad y garantía de iubizon](/help?tab=seguridad): Prevención contra transacciones fraudulentas y mediación directa para que siempre recibas el producto exacto prometido.

## Recursos para Clientes

- [Centro de Información y Ayuda](/help): Guías de compra, beneficios para empresas vendedoras, seguridad y normas legales.
- [Términos y Condiciones](/help?tab=terminos): Conoce las reglas transparentes que protegen cada transacción.
- [Política de Privacidad](/help?tab=privacidad): Tus datos personales están protegidos conforme a la Ley N° 29733 del Perú.
`;

export async function GET() {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
