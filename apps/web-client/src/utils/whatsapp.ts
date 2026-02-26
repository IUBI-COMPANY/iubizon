import { Product } from "@/data-list/products";

/**
 * Genera un mensaje estructurado de WhatsApp para realizar un pedido
 * @param product - Producto del cual se generará el mensaje
 * @returns Mensaje codificado para URL de WhatsApp
 */

export const getWhatsAppMessage = (product: Product): string => {
  const isPedido = product?.stock <= 0;
  const isNew = product?.condition === "new";
  const condition = isNew ? "Nuevo" : "Reacondicionado";

  // Mensaje específico para Bundle Interactivo Completo
  if (product?.id === "bundle-interactivo") {
    const message = `Hola 👋, quiero adquirir el *Bundle Interactivo Completo* de *iubizon* 🎓✨

📦 *BUNDLE COMPLETO INCLUYE:*
━━━━━━━━━━━━━━━━━━━━
🔸 Proyector Epson PowerLite 109W (4000 lúmenes)
🔸 Touch Interactivo (10 puntos táctiles)
🔸 Adaptador Inalámbrico WiFi (Android)
🔸 Instalación y configuración incluida
🔸 Garantía extendida de 1 año
🔸 Soporte técnico especializado

🆔 Id: ${product?.id}
🛍 Producto: ${product?.name} (${condition})
🔗 Link: https://iubizon.com/productos/${product?.id}
💰 *Total a Pagar: S/${product.totalPayment?.toFixed(2)}*

✅ *BENEFICIOS:*
• Solución completa lista para usar
• Moderniza aulas y salas de reuniones
• Instalación profesional incluida
• Asesoría personalizada

🚚 Envío en 24-72 horas hábiles
📞 Asesoría continua para clientes

¡Gracias por elegir *iubizon*! 💜`;

    return encodeURIComponent(
      message.replace(/#/g, "%23").replace(/&/g, "%26").replace(/\+/g, "%2B"),
    );
  }

  // Mensaje específico para Touch Interactivo
  if (product?.id === "touch") {
    const message = `Hola 👋, quiero adquirir el *Touch Interactivo* de *iubizon* 🖐️✨

📦 *TOUCH INTERACTIVO INCLUYE:*
━━━━━━━━━━━━━━━━━━━━
🔸 Hub Interactivo de alta precisión
🔸 10 puntos táctiles simultáneos
🔸 Tecnología infrarroja avanzada
🔸 Compatible: Windows, Mac, Android, Linux
🔸 Instalación Plug & Play
🔸 Multi-usuario simultáneo

🆔 Id: ${product?.id}
🛍 Producto: ${product?.name} (${condition})
🔗 Link: https://iubizon.com/productos/${product?.id}
💰 *Total a Pagar: S/${product.totalPayment?.toFixed(2)}*

✅ *BENEFICIOS:*
• Convierte cualquier proyección en táctil
• Sin calibración constante
• Baja latencia de respuesta
• Ideal para presentaciones interactivas

🚚 Envío en 24-72 horas hábiles
📞 Soporte técnico incluido

¡Gracias por elegir *iubizon*! 💜`;

    return encodeURIComponent(
      message.replace(/#/g, "%23").replace(/&/g, "%26").replace(/\+/g, "%2B"),
    );
  }

  // Mensaje específico para Adaptador Inalámbrico WiFi
  if (product?.id === "adaptador") {
    const message = `Hola 👋, quiero adquirir el *Adaptador Inalámbrico WiFi* de *iubizon* 📡✨

📦 *ADAPTADOR INALÁMBRICO INCLUYE:*
━━━━━━━━━━━━━━━━━━━━
🔸 Android integrado
🔸 Acceso a Google Play Store
🔸 WiFi de alta velocidad
🔸 Streaming HD inalámbrico
🔸 Compatibilidad universal
🔸 Configuración rápida y sencilla

🆔 Id: ${product?.id}
🛍 Producto: ${product?.name} (${condition})
🔗 Link: https://iubizon.com/productos/${product?.id}
💰 *Total a Pagar: S/${product.totalPayment?.toFixed(2)}*

✅ *BENEFICIOS:*
• Elimina cables en presentaciones
• Comparte desde smartphones y tablets
• Apps educativas y empresariales
• Actualizable vía OTA

🚚 Envío en 24-72 horas hábiles
📞 Asesoría de instalación incluida

¡Gracias por elegir *iubizon*! 💜`;

    return encodeURIComponent(
      message.replace(/#/g, "%23").replace(/&/g, "%26").replace(/\+/g, "%2B"),
    );
  }

  // Mensaje genérico para otros productos
  const message = `Hola 👋, acabo de completar mi pedido en *iubizon* 🤖 (dale "enviar" para confirmar tu orden)

🆔 Id producto: ${product?.id}
🛍 Producto: 1 x ${product?.type} ${product?.name} (${condition})${isPedido ? " - *A PEDIDO*" : ""}
🔗 Link producto: https://iubizon.com/productos/${product?.id}
💰 *Total a Pagar: S/${product.totalPayment?.toFixed(2)}*

${isPedido ? "⚠️ *Producto a pedido:* Consultaremos disponibilidad y tiempo de entrega." : ""}

🔴 El envío llega en 24-72 horas hábiles, y te contactarán cuando estén cerca 🚚
🔴 Recibirás asesorías por nuestro número personal para clientes fidelizados.
🔴 Si adquirió alguna promoción, será incluido dentro de su pedido y lo mandaremos en conjunto con su pedido!

¡Gracias por tu confianza! – Equipo de *iubizon company sac* 💜`;

  return encodeURIComponent(
    message.replace(/#/g, "%23").replace(/&/g, "%26").replace(/\+/g, "%2B"),
  );
};
