import { NextResponse } from "next/server";

const content = `# iubizon - Tecnología para educar y trabajar

> iubizon es la plataforma de tecnología para educar y trabajar. Compra directo a proveedores verificados con pagos protegidos, envíos coordinados y 7 días de protección al cliente. Tú compras con confianza: sin estafas, sin proveedores que no responden y con una comisión clara y transparente.

## Soluciones y Servicios

- [Comprar tecnología para tu empresa o colegio](/products): Encuentra laptops, proyectores, impresoras y accesorios para educar y trabajar mejor.
- [Publicar un producto](/products/new): Regístrate gratis con tu correo y conviértete en vendedor dentro de la plataforma para publicar tus productos con precio, stock y garantía.
- [Servicio de mantenimiento y reparación](/help): Alarga la vida de tus equipos con nuestro servicio técnico y deja que los profesionales lo arreglen por ti.
- [Cotización con RUC para empresas](/help?tab=comprar): Genera y descarga al instante una cotización oficial para aprobaciones en tu institución o empresa.
- [Envíos coordinados](/help?tab=comprar): Si compras más de un producto, iubizon gestiona el envío por ti, aunque vengan de proveedores distintos, sin costo adicional por ahora.

## Por qué elegirnos

- [Proveedores verificados](/help?tab=seguridad): Solo trabajamos con proveedores evaluados y con buena calificación, para que nunca te fallen ni te dejen de responder.
- [Pago protegido](/help?tab=seguridad): Tu pago queda guardado con iubizon y el proveedor solo lo recibe después de los 7 días de protección al cliente, contados desde que recibes tu producto. Si algo sale mal, recuperas tu dinero.
- [Protección de 7 días](/help?tab=seguridad): Si tu producto presenta alguna falla o inconveniente, tienes 7 días desde que lo recibes (se cuentan fines de semana y feriados) para devolverlo desde el módulo de reembolsos y te reembolsamos todo, incluida la comisión. iubizon hace seguimiento a tu caso; solo asumes el costo del envío de la devolución, que va directo al proveedor. Pasados los 7 días ya no hay opción a devolverlo.
- [Pagos seguros con Niubiz](/help?tab=seguridad): Paga con tarjeta de crédito o débito con total tranquilidad, con pagos gestionados por el servicio de pagos Niubiz.
- [Comisión transparente](/help?tab=vender): El 9% de cada venta se descuenta del precio del proveedor; en compras menores a S/ 40 pagadas con tarjeta, se añaden S/ 2.50 para proteger tu pago.

## Recursos para Clientes

- [Centro de información y ayuda](/help): Guías de compra, preguntas frecuentes y normas de la plataforma.
- [Cómo comprar paso a paso](/help?tab=comprar): Aprende a comprar y recibir tus productos de forma rápida y segura.
- [Cómo vender como proveedor](/help?tab=vender): Conoce los requisitos para vender y cómo se liquidan tus ventas de forma transparente.
`;

export async function GET() {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
