"use server";

import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export async function sendLead(
  lead: Lead,
): Promise<{ success: boolean; error?: string }> {
  const mapProductRequestData = (data: Lead) => ({
    // Core Fields - Transform camelCase to camelCase for API
    leadType: data.leadType, // "sale"
    clientType: data.clientType, // "individual" | "organization"
    status: data.status, // "new"
    archived: data.archived, // false
    // Contact Information (Step 2)
    contact: data?.contact || undefined,
    // Document Information (Step 2)
    document: data?.document || undefined,
    // Organization Info (Step 2 - only if RUC)
    organizationInfo: data?.organizationInfo || undefined,
    // productSaleDetails
    productSaleDetails: data?.productSaleDetails || undefined,
    // Communication
    hostname: "iubizon.com",
    termsAndConditions: data.termsAndConditions,
    isQuoteRequest: data.isQuoteRequest,
    // Tracking
    tracking: {
      source: data.tracking.source,
      landingPage: data.tracking.landingPage,
    },
  });

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.LEADS), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapProductRequestData(lead)),
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
    console.error("Error sending product request email: ", error);
    throw error;
  }
}
