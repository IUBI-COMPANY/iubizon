import type { NiubizCustomerData, NiubizServiceLocationData } from "./types";

/**
 * Normaliza nombres de departamentos de Perú a códigos de 3 letras ISO/UBIGEO (ej. "Lima" -> "LIM").
 */
function normalizeStateCode(stateName?: string | null): string {
  if (!stateName) return "LIM";
  const clean = stateName.trim().toUpperCase();
  if (clean.length === 3) return clean;
  if (clean.startsWith("ARE")) return "ARE";
  if (clean.startsWith("CUS")) return "CUS";
  if (clean.startsWith("LA LIB") || clean.startsWith("LAL")) return "LAL";
  if (clean.startsWith("PIU")) return "PIU";
  if (clean.startsWith("LAM")) return "LAM";
  if (clean.startsWith("ICA")) return "ICA";
  if (clean.startsWith("TAC")) return "TAC";
  if (clean.startsWith("JUN")) return "JUN";
  if (clean.startsWith("ANC")) return "ANC";
  if (clean.startsWith("CAL")) return "CAL";
  return clean.slice(0, 3) || "LIM";
}

/**
 * merchantDefineData (MDDs) requeridos obligatoriamente por el motor antifraude de Niubiz.
 * Garantiza enviar siempre MDD4, MDD32, MDD75 y MDD77 con datos reales del checkout
 * o valores representativos (sin valores vacíos o nulos).
 */
export function buildMerchantDefineData(
  customer: NiubizCustomerData,
  registrationCount: number,
): Record<string, string | number> {
  const email = (customer.email || "").trim() || "cliente@iubizon.com";
  const docNum = (customer.documentNumber || "").trim();
  const mdd32 = docNum || email;
  const mdd75 = customer.registered ? "Registrado" : "Invitado";
  const mdd77 = Math.max(1, registrationCount || 1);

  return {
    MDD4: email,
    MDD32: mdd32,
    MDD75: mdd75,
    MDD77: mdd77,
  };
}

/**
 * dataMap con la información del tarjetahabiente (API de sesión Niubiz).
 * Utiliza la información completada en el formulario de envío del carrito,
 * aplicando datos representativos por defecto en caso de campos opcionales no ingresados.
 */
export function buildCardholderDataMap(
  customer: NiubizCustomerData,
): Record<string, string> {
  const city = (customer.city || customer.state || "Lima").trim() || "Lima";
  const address = (customer.address || "").trim() || "Av. Principal 123";
  const postalCode = (customer.postalCode || "").trim() || "15023";
  const phone = (customer.phone || "").trim() || "987654321";
  const stateCode = normalizeStateCode(customer.state || city);

  return {
    cardholderCity: city,
    cardholderCountry: "PE",
    cardholderAddress: address,
    cardholderPostalCode: postalCode,
    cardholderState: stateCode,
    cardholderPhoneNumber: phone,
  };
}

/** Payload completo para la API de sesión de Niubiz (Paso 2). */
export function buildSessionPayload(params: {
  amount: number;
  customerIp: string;
  customer: NiubizCustomerData;
  registrationCount: number;
}) {
  const safeIp = (params.customerIp || "127.0.0.1").trim() || "127.0.0.1";

  return {
    channel: "web",
    amount: Number(params.amount.toFixed(2)),
    antifraud: {
      clientIp: safeIp,
      merchantDefineData: buildMerchantDefineData(
        params.customer,
        params.registrationCount,
      ),
    },
    dataMap: buildCardholderDataMap(params.customer),
  };
}

/** dataMap con la información del comercio para la API de autorización de Niubiz (Paso 4). */
export function buildServiceLocationDataMap(
  location: NiubizServiceLocationData,
): Record<string, string> {
  const urlAddress = (location.urlAddress || "https://www.iubizon.com").trim();
  const cityName = (location.cityName || "Lima").trim() || "Lima";
  const stateCode = normalizeStateCode(location.countrySubdivisionCode || "LMA");
  const postalCode = (location.postalCode || "15023").trim() || "15023";

  return {
    urlAddress,
    partnerIdCode: "",
    serviceLocationCityName: cityName,
    serviceLocationCountrySubdivisionCode: stateCode,
    serviceLocationCountryCode: "PER",
    serviceLocationPostalCode: postalCode,
  };
}

/** Payload completo para la API de autorización de Niubiz (Paso 4). */
export function buildAuthorizationPayload(params: {
  transactionToken: string;
  purchaseNumber: string;
  amount: number;
  currency: string;
  serviceLocation: NiubizServiceLocationData;
}) {
  return {
    channel: "web",
    captureType: "manual",
    countable: true,
    order: {
      tokenId: params.transactionToken,
      purchaseNumber: Number(params.purchaseNumber),
      amount: Number(params.amount.toFixed(2)),
      currency: params.currency || "PEN",
    },
    dataMap: buildServiceLocationDataMap(params.serviceLocation),
  };
}
