import { NextResponse } from "next/server";

const content = `# iubizon - Tecnología para educar y trabajar

> iubizon es el marketplace peruano que conecta empresas y compradores con productos y servicios tecnológicos y multimedia, pensados para colegios, instituciones educativas y negocios. Encuentra todo en un solo lugar, compra con proveedores verificados y recibe cada pedido con garantía oficial y protección al comprador. Nuestra misión es transformar la forma de educar y trabajar: pasamos de los cuadernos, la regla y la pizarra a soluciones basadas en proyección, interacción y participación activa.

---

## ¿Qué es iubizon?

iubizon es un marketplace que une en una sola plataforma la educación y la tecnología multimedial. Brinda soluciones tanto a empresas como a clientes finales: aquí se compran y se publican pedidos, con la facilidad de armar kits y paquetes tecnológicos a la medida de cada necesidad.

iubizon opera como una plataforma tecnológica conector entre empresas comercializadoras, marcas y compradores. Los precios están expresados en Soles (S/) e incluyen los impuestos de ley (IGV) salvo que se especifique lo contrario, y las transacciones se procesan a través de pasarelas de pago reguladas.

---

## Para compradores: encuentra todo en un solo lugar

La plataforma de productos y servicios para empresas y colegios. Encuentra equipamiento tecnológico y multimedia y arma tus combos ideales para tu empresa u hogar.

### Cómo comprar

1. **Arma tu set o paquete tecnológico**: Selecciona productos complementarios (laptops, proyectores, impresoras o accesorios) y agrégalos a tu paquete en un solo pago unificado.
2. **Cotización oficial en PDF**: ¿Necesitas aprobación en tu institución o empresa? Genera y descarga al instante una cotización con RUC emitida por IUBIZON COMPANY S.A.C.
3. **Pasarela de pagos 100% segura**: Paga mediante tarjetas de crédito o débito con encriptación bancaria de alta seguridad (Visa, Mastercard, American Express).
4. **Despacho y seguimiento**: Monitorea el estado de tu pedido desde tu panel de usuario hasta recibirlo con garantía oficial de marca.

Además, puedes comprar como invitado: no necesitas registrarte ni crear contraseña para completar tu compra.

### Opciones de entrega

- **Envío directo del proveedor**: Cada proveedor te envía directo a tu domicilio, más rápido.
- **Envío consolidado por iubizon**: Los proveedores envían a iubizon y nosotros te entregamos todo junto en una sola entrega.

---

## Para vendedores: hacer crecer tu negocio

Conecta tus productos tecnológicos con miles de compradores institucionales y personas en todo el Perú.

1. **Crea tu perfil de empresa**: Registra tu marca o empresa con RUC, personaliza tu catálogo comercial y gestiona tu equipo de trabajo de forma independiente.
2. **Cobros y transferencias bancarias directas**: Registra tu cuenta de ahorros o corriente (BCP, Interbank, BBVA, etc.) en tu panel de finanzas. iubizon liquida y transfiere tus ventas de forma transparente.
3. **Gestión de pedidos y despachos**: Recibe notificaciones inmediatas ante cada venta, actualiza el código de seguimiento del envío y mantén la reputación de tu tienda alta.

---

## Seguridad y garantía

### Protección en compras y garantía de fábrica

Todos los productos comercializados cuentan con respaldo y garantía oficial contra fallas de fabricación. iubizon facilita la mediación directa para que recibas el producto exacto prometido. La **protección al comprador iubizon** ofrece una cobertura de 7 días para verificar la entrega e idoneidad del producto.

### Prevención contra transacciones fraudulentas

Auditamos las solicitudes de venta y las empresas asociadas para garantizar que los pagos procesados sean legítimos, protegiendo tanto los fondos del comprador como las retribuciones del vendedor.

### Proveedores y distribuidores verificados

Conecta con proveedores confiables y encuentra los productos que necesitas, con la tranquilidad de comprar en tiendas oficiales y perfiles verificados.

---

## Nuestro compromiso con la educación y la innovación

En iubizon creemos que la forma de enseñar y trabajar puede (y debe) mejorar. Nuestra promesa es simple: entender la tecnología como un puente hacia una educación más dinámica, interactiva y participativa. Por eso ofrecemos kits y paquetes tecnológicos diseñados para transformar aulas y espacios de trabajo con proyección, interacción y participación real.

---

## Información de contacto y ubicación

- **Centro de información y ayuda**: /help
- **Correo**: iubizon.company@gmail.com
- **Teléfono / WhatsApp**: +51 972 300 301
- **Ubicación**: Lima, Perú
- **Empresa**: IUBIZON COMPANY S.A.C.

Síguenos en nuestras redes: Facebook, Instagram y TikTok (@iubizon).

---

## Términos y condiciones

**Aceptación del servicio**: Al acceder, explorar o realizar compras a través de iubizon.com, el usuario acepta de manera íntegra los Términos y Condiciones administrados por IUBIZON COMPANY S.A.C.

**Transparencia de precios**: Todos los precios están expresados en Soles (S/) e incluyen los impuestos de ley (IGV) salvo que se especifique lo contrario. El cobro por servicio o comisión por uso de plataforma es retenido automáticamente según las condiciones pactadas con cada vendedor.

**Confianza y calidad**: iubizon se reserva el derecho de retirar cualquier publicación que no cumpla los estándares de calidad, y de suspender cuentas que intenten maniobras fraudulentas, suplantación de identidad o incumplimiento reiterado en las entregas.

**Privacidad de datos**: tus datos personales están protegidos conforme a la Ley N° 29733 del Perú y no son comercializados con terceros. La información financiera o de tarjetas es procesada directamente por pasarelas certificadas con cifrado SSL sin ser almacenada en nuestros servidores.
`;

export async function GET() {
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
