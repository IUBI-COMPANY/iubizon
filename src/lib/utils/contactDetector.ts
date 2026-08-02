/**
 * Utilidad para detectar intentos de contacto externo (antidesintermediación)
 * en la descripción de productos.
 *
 * Evita falsos positivos en especificaciones técnicas (ej: 1080p, 5000 lumens, 512GB).
 */

export interface ContactDetectionResult {
  hasViolation: boolean;
  reason?: string;
  matchedText?: string;
}

export function detectForbiddenContactInfo(rawText: string): ContactDetectionResult {
  if (!rawText || !rawText.trim()) {
    return { hasViolation: false };
  }

  // Eliminar etiquetas HTML para analizar texto limpio
  const text = rawText.replace(/<[^>]*>/g, ' ');

  // 1. Detectar correos electrónicos (ej. usuario@ejemplo.com)
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    return {
      hasViolation: true,
      reason: 'Por políticas de seguridad, no se permiten correos electrónicos en la descripción.',
      matchedText: emailMatch[0],
    };
  }

  // 2. Detectar enlaces web y URLs de mensajería (ej. wa.me, t.me, http://, www., instagram.com)
  const urlRegex = /\b(?:https?:\/\/|www\.|wa\.me\/|t\.me\/|instagram\.com\/|facebook\.com\/)[^\s]+/i;
  const urlMatch = text.match(urlRegex);
  if (urlMatch) {
    return {
      hasViolation: true,
      reason: 'Por seguridad, no se permiten enlaces ni páginas web externas en la descripción.',
      matchedText: urlMatch[0],
    };
  }

  // 3. Detectar palabras clave explícitas de contacto asociadas a números
  const keywordPhoneRegex = /\b(?:wsp|whatsapp|celular|cel|llamar|telefono|tlf|contacto|escribir)\b[\s:=.-]*\+?(?:51)?\s*9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b/i;
  const keywordPhoneMatch = text.match(keywordPhoneRegex);
  if (keywordPhoneMatch) {
    return {
      hasViolation: true,
      reason: 'Por favor no solicites contacto directo ni WhatsApp en la descripción.',
      matchedText: keywordPhoneMatch[0],
    };
  }

  // 4. Detectar números de teléfono celular (9 dígitos comenzando en 9, formato peruano)
  // Se usa lookbehind/lookahead negativo para evitar coincidencias con códigos de parte o medidas (ej. 1920x1080)
  const standAloneMobileRegex = /(?<![\d\w])(?:\+?51[\s.-]?)?9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}(?![\d\w])/;
  const mobileMatch = text.match(standAloneMobileRegex);
  if (mobileMatch) {
    return {
      hasViolation: true,
      reason: 'Por tu seguridad y la del comprador, no incluyas números telefónicos en la descripción.',
      matchedText: mobileMatch[0],
    };
  }

  return { hasViolation: false };
}
