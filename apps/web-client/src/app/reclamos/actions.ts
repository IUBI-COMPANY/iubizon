"use server";

import { buildApiUrl, API_ENDPOINTS } from "@/config/api";

export async function sendReclamation(
  formClaim: ClaimForIubizon,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.CLAIMS), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formClaim),
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
