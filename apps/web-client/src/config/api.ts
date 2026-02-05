/**
 * Configuración centralizada de URLs de API
 *
 * Este archivo gestiona todas las URLs de la API de forma centralizada.
 * Solo necesitas cambiar la variable de entorno en .env para cambiar
 * entre DEV y PROD en toda la aplicación.
 */

/**
 * Obtiene la URL base de la API desde las variables de entorno
 * Si no está definida, usa la URL de desarrollo por defecto
 */
export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_IUBICRM_APIURL;

  if (!apiUrl) {
    console.warn(
      "NEXT_PUBLIC_IUBICRM_APIURL no está definida en las variables de entorno. Usando URL de desarrollo por defecto.",
    );
    return "https://api-iubicrm-dev.web.app";
  }

  return apiUrl;
};

/**
 * URLs de endpoints específicos
 */
export const API_ENDPOINTS = {
  LEADS: "/leads",
  EMAILS: "/emails",
} as const;

/**
 * Construye una URL completa para un endpoint específico
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  return `${baseUrl}${endpoint}`;
};
