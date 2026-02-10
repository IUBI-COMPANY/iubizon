"use server";

import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export async function sendLead(
  lead: Lead,
): Promise<{ success: boolean; error?: string }> {
  const mapProductRequestData = (data: Lead) => ({
    // Core Fields - Transform camelCase to snake_case for API
    lead_type: data.leadType, // "sale"
    client_type: data.clientType, // "individual" | "organization"
    status: data.status, // "new"
    archived: data.archived, // false

    // Contact Information (Step 2)
    contact: {
      first_name: data.contact.firstName,
      last_name: data.contact.lastName,
      full_name: data.contact.fullName,
      social_reason: data.contact.socialReason,
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
    organization_info: data.organizationInfo
      ? {
          legal_name: data.organizationInfo.legalName,
          tax_id: data.organizationInfo.taxId,
        }
      : undefined,

    // Products (Step 1) - From productSaleDetails
    products: data.productSaleDetails?.products?.map((product) => ({
      id: product.id,
      quantity: product.quantity,
      brand: product.brand,
      model: product.model,
    })),

    // Additional product details (Step 1)
    description_more_details: data.productSaleDetails?.additionalInformation,

    // Delivery Information (Step 3)
    delivery: data.productSaleDetails?.delivery
      ? {
          type: data.productSaleDetails.delivery.type,
          local_delivery: data.productSaleDetails.delivery.localDelivery
            ? {
                preferred_date:
                  data.productSaleDetails.delivery.localDelivery.preferredDate,
                preferred_time:
                  data.productSaleDetails.delivery.localDelivery.preferredTime,
                address: {
                  area: data.productSaleDetails.delivery.localDelivery.address
                    .area,
                  street:
                    data.productSaleDetails.delivery.localDelivery.address
                      .street,
                },
              }
            : undefined,
          regional_delivery: data.productSaleDetails.delivery.regionalDelivery
            ? {
                address: {
                  state:
                    data.productSaleDetails.delivery.regionalDelivery.address
                      .state,
                  city: data.productSaleDetails.delivery.regionalDelivery
                    .address.city,
                  area: data.productSaleDetails.delivery.regionalDelivery
                    .address.area,
                  street:
                    data.productSaleDetails.delivery.regionalDelivery.address
                      .street,
                },
                estimated_delivery_days:
                  data.productSaleDetails.delivery.regionalDelivery
                    .estimatedDeliveryDays,
              }
            : undefined,
        }
      : undefined,

    // Communication
    hostname: "iubizon.com",
    terms_and_conditions: data.termsAndConditions,
    is_quote_request: data.isQuoteRequest,

    // Tracking
    tracking: {
      source: data.tracking.source,
      landing_page: data.tracking.landingPage,
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
