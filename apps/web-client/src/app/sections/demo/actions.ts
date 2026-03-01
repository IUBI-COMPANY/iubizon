"use server";

import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export async function sendDemoLead(
  leadDemo: Lead,
): Promise<{ success: boolean; error?: string }> {
  const mapDemoLeadData = (data: Lead) => {
    const serviceDetails = data?.serviceDetails || {};
    const products =
      serviceDetails?.products && serviceDetails.products.length > 0
        ? serviceDetails.products
        : [
            {
              id: "bundle-interactivo",
              name: "Solicita una Demo del Bundle",
              quantity: 1,
              brand: "iubizon",
              model: "Bundle Interactivo",
            },
          ];

    // Validar que contact existe y tiene campos requeridos
    if (!data?.contact) {
      throw new Error("Contact information is required");
    }

    const { contact } = data;
    if (!contact.firstName || !contact.email) {
      throw new Error(
        "Contact must have firstName and email: " + JSON.stringify(contact),
      );
    }

    return {
      // Core Fields
      leadType: data.leadType || "DEMO",
      clientType: data.clientType || "individual",
      status: data.status || "new",
      archived: data.archived || false,
      // Contact Information
      contact: data?.contact || undefined,
      // Document Information
      document: data?.document || undefined,
      // Service Details
      serviceDetails: {
        ...serviceDetails,
        products,
      },
      // Communication
      hostname: "iubizon.com",
      termsAndConditions: data.termsAndConditions || true,
      isQuoteRequest: data.isQuoteRequest || false,
      // Tracking
      tracking: {
        source: data.tracking?.source || "website",
        landingPage: data.tracking?.landingPage || "",
      },
    };
  };

  try {
    const mappedData = mapDemoLeadData(leadDemo);

    const apiUrl = buildApiUrl(API_ENDPOINTS.LEADS);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mappedData),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const errorMsg = responseText || `HTTP error! status: ${response.status}`;
      console.error("[sendDemoLead] Error response:", errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[sendDemoLead] Exception:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
