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
              model: "Bundle Interactivo 2025",
            },
          ];

    return {
    // Core Fields
    leadType: data.leadType,
    clientType: data.clientType,
    status: data.status,
    archived: data.archived,
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
      source: data.tracking.source,
      landingPage: data.tracking.landingPage,
    },
    };
  };

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.LEADS), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapDemoLeadData(leadDemo)),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        `HTTP error! status: ${response.status}, message: ${responseText}`,
      );
      throw new Error(`Error ${response.status}: ${responseText}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Error sending Demo Lead: ", error);
    throw error;
  }
}
