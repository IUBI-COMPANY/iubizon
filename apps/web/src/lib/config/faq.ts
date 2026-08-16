export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "como-comprar",
    question: "¿Cómo empiezo a comprar en IUBIZON?",
    answer:
      "Es muy fácil. Explora el catálogo, elige los productos que necesitas y agrúpalos en un solo paquete para pagarlos juntos. Completa tu compra con tarjeta de crédito o débito y recibe la confirmación por correo al instante. Todo se gestiona desde tu panel de usuario.",
  },
  {
    id: "cotizacion-oficial",
    question: "¿Puedo solicitar una cotización antes de comprar?",
    answer:
      "Sí. Al armar tu paquete podrás generar y descargar una cotización oficial en PDF con RUC, emitida por IUBIZON COMPANY S.A.C. Así puedes revisar los montos, compartirla con tu área de compras o llevarla como sustento antes de concretar el pago.",
  },
  {
    id: "metodos-de-pago",
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos tarjetas de crédito y débito de todas las marcas, procesadas de forma segura a través de la pasarela Niubiz. Puedes pagar el total de tu paquete en un solo pago y en algunos casos en cuotas, según las condiciones de tu banco.",
  },
  {
    id: "seguimiento-pedido",
    question: "¿Cómo sé cuándo llega mi pedido?",
    answer:
      "Cuando el vendedor despacha tu paquete recibirás un correo con el nombre del courier y tu número de seguimiento. También puedes consultar el estado de cada producto en tiempo real desde tu panel de usuario hasta que confirmes la entrega.",
  },
  {
    id: "producto-con-fallas",
    question: "¿Qué pasa si mi producto llega con fallas o defectos?",
    answer:
      "Tienes una protección de 7 días calendario desde la confirmación de entrega. Si tu producto presenta fallas o defectos distintos a los descritos en la ficha, puedes solicitar la devolución o reemplazo desde el módulo de reembolsos adjuntando las evidencias del problema.",
  },
  {
    id: "seguridad-de-pagos",
    question: "¿Es seguro pagar con mi tarjeta?",
    answer:
      "Totalmente. Todos los pagos se procesan a través de la pasarela Niubiz, certificada bajo los estándares PCI DSS Level 1 con encriptación SSL de 256 bits. IUBIZON no almacena ni tiene acceso a los datos de tu tarjeta en ningún momento.",
  },
];
