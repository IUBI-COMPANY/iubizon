import type { NiubizCustomerData, NiubizServiceLocationData } from "./types";

/** merchantDefineData (MDDs) requeridos por el motor antifraude de Niubiz. */
export function buildMerchantDefineData(
  customer: NiubizCustomerData,
  registrationCount: number,
): Record<string, string | number> {
  const mdds: Record<string, string | number> = {
    MDD4: customer.email,
    MDD75: customer.registered ? "Registrado" : "Invitado",
    MDD77: registrationCount,
  };
  if (customer.documentNumber) {
    mdds.MDD32 = customer.documentNumber;
  }
  return mdds;
}

/** dataMap con la información del tarjetahabiente (API de sesión). */
export function buildCardholderDataMap(
  customer: NiubizCustomerData,
): Record<string, string> {
  return {
    cardholderCity: customer.city || "Lima",
    cardholderCountry: customer.country || "PE",
    cardholderAddress: customer.address || "",
    cardholderPostalCode: customer.postalCode || "00000",
    cardholderState: customer.state || "LIM",
    cardholderPhoneNumber: customer.phone || "",
  };
}

/** Payload completo de la API de sesión. */
export function buildSessionPayload(params: {
  amount: number;
  customerIp: string;
  customer: NiubizCustomerData;
  registrationCount: number;
}) {
  return {
    channel: "web",
    amount: Number(params.amount.toFixed(2)),
    antifraud: {
      clientIp: params.customerIp,
      merchantDefineData: buildMerchantDefineData(
        params.customer,
        params.registrationCount,
      ),
    },
    dataMap: buildCardholderDataMap(params.customer),
  };
}

/** dataMap con la información de la empresa (API de autorización). */
export function buildServiceLocationDataMap(
  location: NiubizServiceLocationData,
): Record<string, string> {
  return {
    urlAddress: location.urlAddress,
    partnerIdCode: "",
    serviceLocationCityName: location.cityName,
    serviceLocationCountrySubdivisionCode: location.countrySubdivisionCode,
    serviceLocationCountryCode: location.countryCode,
    serviceLocationPostalCode: location.postalCode,
  };
}

/** Payload completo de la API de autorización. */
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
      currency: params.currency,
    },
    dataMap: buildServiceLocationDataMap(params.serviceLocation),
  };
}
