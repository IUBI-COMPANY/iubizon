"use server";

import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export async function sendLead(
  formTechnicalService: LeadForIubizon,
): Promise<{ success: boolean; error?: string }> {
  const mapTechnicalServiceData = (data: LeadForIubizon) => ({
    // Core Fields
    lead_type: data.lead_type, // "sale"
    client_type: data.client_type, // "individual" | "organization"
    status: data.status, // "new"
    archived: data.archived, // false

    // Contact Information
    contact: {
      first_name: data.contact.first_name,
      last_name: data.contact.last_name,
      full_name: data.contact.full_name,
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

    // Products (equipment) - ya incluye service_type
    products: data.products?.map((product) => ({
      id: product.id,
      quantity: product.quantity,
      brand: product.brand,
      model: product.model,
      service_type: product.service_type,
    })),

    // Service Details
    service_details: data.service_details
      ? {
          service_type: data.service_details.service_type,
          description: data.service_details.description,
        }
      : undefined,

    description_more_details: data.description_more_details,

    // Visit Schedule
    visit_schedule: data.visit_schedule
      ? {
          preferred_date: data.visit_schedule.preferred_date,
          preferred_time: data.visit_schedule.preferred_time,
        }
      : undefined,

    // Address
    address: data.address
      ? {
          street: data.address.street,
          department: data.address.department,
          province: data.address.province,
          district: data.address.district,
        }
      : undefined,

    // Attendance Type (REQUIRED)
    attendance_type: data.attendance_type,

    // Communication
    hostname: "iubizon.com",
    terms_and_conditions: data.terms_and_conditions,

    // Tracking
    tracking: {
      source: data.tracking.source,
      landing_page: data.tracking.landing_page,
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
