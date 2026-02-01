"use server";

const API_URL = "https://api-iubisales.web.app/iubizon/claims";

const mapFormClaim = (formClaim: ClaimForIubizon) => ({
  client_id: "gYn8QUB8g35wEAZcZz7D",
  contact: {
    first_name: formClaim.contact.first_name,
    last_name: formClaim.contact.last_name,
    full_name: formClaim.contact.full_name,
    social_reason: formClaim.contact.social_reason,
    email: formClaim.contact.email,
    phone: formClaim.contact.phone,
    document: formClaim.document,
    details: {
      incident_date: formClaim.details.incident_date,
      incident_time: formClaim.details.incident_time,
      purchase_date: formClaim.details.purchase_date,
      invoice_number: formClaim.details.invoice_number,
      claim_motive: formClaim.details.claim_motive,
      product_service_description:
        formClaim.details.product_service_description,
      problem_description: formClaim.details.problem_description,
      claimed_amount: formClaim.details.claimed_amount,
      requested_solution: formClaim.details.requested_solution,
    },
  },
});

export async function sendReclamation(
  formClaim: ClaimForIubizon,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapFormClaim(formClaim)),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}`, errorText);
      return {
        success: false,
        error:
          errorText ||
          `Error al registrar el reclamo. Código: ${response.status}`,
      };
    }

    // Si la respuesta es OK, leemos el contenido exitoso
    const responseText = await response.text();
    console.log("Reclamo enviado exitosamente:", responseText);
    return { success: true };
  } catch (error) {
    console.error("Error sending reclamation: ", error);
    return {
      success: false,
      error:
        "Ocurrió un problema al enviar el reclamo. Por favor, intenta nuevamente.",
    };
  }
}
