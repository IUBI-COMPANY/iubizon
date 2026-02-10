"use server";

import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export async function sendLead(
  formTechnicalService: Lead,
): Promise<{ success: boolean; error?: string }> {
  const mapTechnicalServiceData = (data: Lead) => ({
    // Core Fields
    leadType: data.leadType,
    clientType: data.clientType,
    status: data.status,
    archived: data.archived,

    // Contact Information
    contact: {
      firstName: data.contact.firstName,
      lastName: data.contact.lastName,
      fullName: data.contact.fullName,
      email: data.contact.email,
      phone: {
        prefix: data.contact.phone.prefix,
        number: data.contact.phone.number,
      },
    },

    // Document Information
    document: data.document
      ? {
          type: data.document.type,
          number: data.document.number,
        }
      : undefined,

    // Address (at Lead level)
    address: data.address
      ? {
          street: data.address.street,
          state: data.address.state,
          city: data.address.city,
          area: data.address.area,
        }
      : undefined,

    // Service Details
    serviceDetails: data.serviceDetails
      ? {
          products: data?.serviceDetails?.products || [],
          serviceType: data.serviceDetails.serviceType,
          additionalInformation: data.serviceDetails.additionalInformation,
          attendanceType: data.serviceDetails.attendanceType,
          visitSchedule: data.serviceDetails.visitSchedule
            ? {
                preferredDate: data.serviceDetails.visitSchedule.preferredDate,
                preferredTime: data.serviceDetails.visitSchedule.preferredTime,
              }
            : undefined,
        }
      : undefined,

    // Communication
    hostname: "iubizon.com",
    termsAndConditions: data.termsAndConditions,

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
      body: JSON.stringify(mapTechnicalServiceData(formTechnicalService)),
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
    console.error("Error sending Technical Service email: ", error);
    throw error;
  }
}
