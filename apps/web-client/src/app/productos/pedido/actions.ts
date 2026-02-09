"use server";

import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export async function sendLead(
  lead: Lead,
): Promise<{ success: boolean; error?: string }> {
  const mapProductRequestData = (data: Lead) => ({
    // Core Fields
    leadType: data.leadType,
    clientType: data.clientType,
    status: data.status,
    archived: data.archived,

    // Contact Information (Step 2)
    contact: {
      firstName: data.contact.firstName,
      lastName: data.contact.lastName,
      fullName: data.contact.fullName,
      socialReason: data.contact.socialReason,
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
    organizationInfo: data.organizationInfo
      ? {
          legalName: data.organizationInfo.legalName,
          taxId: data.organizationInfo.taxId,
        }
      : undefined,

    // Product Sale Details (Step 1 + Step 3)
    productSaleDetails: data.productSaleDetails
      ? {
          products: data.productSaleDetails.products?.map((product) => ({
            id: product.id,
            quantity: product.quantity,
            brand: product.brand,
            model: product.model,
          })),
          delivery: data.productSaleDetails.delivery
            ? {
                type: data.productSaleDetails.delivery.type,
                localDelivery: data.productSaleDetails.delivery.localDelivery
                  ? {
                      preferredDate:
                        data.productSaleDetails.delivery.localDelivery
                          .preferredDate,
                      preferredTime:
                        data.productSaleDetails.delivery.localDelivery
                          .preferredTime,
                      address: {
                        area: data.productSaleDetails.delivery.localDelivery
                          .address.area,
                        street:
                          data.productSaleDetails.delivery.localDelivery.address
                            .street,
                      },
                    }
                  : undefined,
                regionalDelivery: data.productSaleDetails.delivery
                  .regionalDelivery
                  ? {
                      address: {
                        state:
                          data.productSaleDetails.delivery.regionalDelivery
                            .address.state,
                        city: data.productSaleDetails.delivery.regionalDelivery
                          .address.city,
                        area: data.productSaleDetails.delivery.regionalDelivery
                          .address.area,
                        street:
                          data.productSaleDetails.delivery.regionalDelivery
                            .address.street,
                      },
                      estimatedDeliveryDays:
                        data.productSaleDetails.delivery.regionalDelivery
                          .estimatedDeliveryDays,
                    }
                  : undefined,
              }
            : undefined,
          additionalInformation: data.productSaleDetails.additionalInformation,
        }
      : undefined,

    // Quote request flag
    isQuoteRequest: data.isQuoteRequest,

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
