import { Product } from "@/types";

/**
 * Genera un mensaje estructurado de WhatsApp para realizar un pedido
 * @param product - Producto del cual se generará el mensaje
 * @returns Mensaje codificado para URL de WhatsApp
 */

export const getWhatsAppMessage = (product: Product): string => {
  const isPedido = (product?.stock ?? 1) <= 0;
  const isNew = product?.condition === "new";
  const condition = isNew ? "Nuevo" : "Reacondicionado";
  const title = product?.title || "Producto";
  const price = Number(product?.price || 0).toFixed(2);

  const message = `Hola 👋, acabo de completar mi pedido en *iubizon* 🤖 (dale "enviar" para confirmar tu orden)

🆔 Id producto: ${product?.id}
🛍 Producto: 1 x ${title} (${condition})${isPedido ? " - *A PEDIDO*" : ""}
🔗 Link producto: https://iubizon.com/products/${product?.id}
💰 *Total a Pagar: S/${price}*

${isPedido ? "⚠️ *Producto a pedido:* Consultaremos disponibilidad y tiempo de entrega." : ""}

🔴 El envío llega en 24-72 horas hábiles, y te contactarán cuando estén cerca 🚚
🔴 Recibirás asesorías por nuestro número personal para clientes fidelizados.

¡Gracias por tu confianza! – Equipo de *iubizon* 💜`;

  return encodeURIComponent(
    message.replace(/#/g, "%23").replace(/&/g, "%26").replace(/\+/g, "%2B"),
  );
};
