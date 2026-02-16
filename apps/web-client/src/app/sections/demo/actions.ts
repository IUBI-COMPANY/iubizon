"use server";

import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export async function sendDemoLead(
  leadDemo: Lead,
): Promise<{ success: boolean; error?: string }> {
  const mapDemoLeadData = (data: Lead) => ({
    // Core Fields
    leadType: data.leadType,
    clientType: data.clientType,
    status: data.status,
    archived: data.archived,
    // Contact Information
    contact: data?.contact || undefined,
    // Service Details
    serviceDetails: data?.serviceDetails || undefined,
    // Communication
    hostname: "iubizon.com",
    termsAndConditions: data.termsAndConditions || true,
    isQuoteRequest: data.isQuoteRequest || false,
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
