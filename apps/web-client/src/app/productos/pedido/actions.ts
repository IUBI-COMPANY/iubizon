"use server";

import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export async function sendLead(
  lead: LeadForIubizon,
): Promise<{ success: boolean; error?: string }> {
  const mapProductRequestData = (data: LeadForIubizon) => ({
    // Core Fields
    lead_type: data.lead_type, // "sale"
    client_type: data.client_type, // "individual" | "organization"
    status: data.status, // "new"
    archived: data.archived, // false

    // Contact Information (Step 2)
    contact: {
      first_name: data.contact.first_name,
      last_name: data.contact.last_name,
      full_name: data.contact.full_name,
      social_reason: data.contact.social_reason,
      email: data.contact.email,
      phone: {
        prefix: data.contact.phone.prefix,
        number: data.contact.phone.number,
      },
    },

    // Document Information (Step 2)
    document: data.document
      ? {
          type: data.document.type,
          number: data.document.number,
        }
      : undefined,

    // Organization Info (Step 2 - only if RUC)
    organization_info: data.organization_info
      ? {
          company_name: data.organization_info.company_name,
          tax_id: data.organization_info.tax_id,
        }
      : undefined,

    // Products (Step 1)
    products: data.products?.map((product) => ({
      id: product.id,
      quantity: product.quantity,
      brand: product.brand,
      model: product.model,
    })),

    // Additional product details (Step 1)
    description_more_details: data.description_more_details,

    // Delivery Information (Step 3 - NUEVA ESTRUCTURA)
    delivery: data.delivery
      ? {
          type: data.delivery.type,
          home_delivery: data.delivery.home_delivery
            ? {
                preferred_date: data.delivery.home_delivery.preferred_date,
                preferred_time: data.delivery.home_delivery.preferred_time,
                address: {
                  district: data.delivery.home_delivery.address.district,
                  street: data.delivery.home_delivery.address.street,
                },
              }
            : undefined,
          province_shipping: data.delivery.province_shipping
            ? {
                address: {
                  department:
                    data.delivery.province_shipping.address.department,
                  province: data.delivery.province_shipping.address.province,
                  district: data.delivery.province_shipping.address.district,
                  street: data.delivery.province_shipping.address.street,
                },
                estimated_delivery_days:
                  data.delivery.province_shipping.estimated_delivery_days,
              }
            : undefined,
        }
      : undefined,

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
