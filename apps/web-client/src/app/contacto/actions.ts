"use server";
import { redirect } from "next/navigation";
import { buildApiUrl, API_ENDPOINTS } from "@/config/api";

export async function sendContactEmail(
  formContact: Omit<Contact, "hostname">,
): Promise<{ success: boolean; error?: string }> {
  const mapFormContact = (formContact: Omit<Contact, "hostname">) => ({
    contact: {
      firstName: formContact?.firstName,
      lastName: formContact?.lastName,
      email: formContact.email,
      phone: {
        number: formContact.phone?.number,
        countryCode: formContact.phone?.prefix,
      },
      message: formContact?.message,
      termsAndConditions: formContact.termsAndConditions,
      hostname: "iubizon.com",
    },
  });

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.CONTACT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mapFormContact(formContact)),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return {
        success: false,
        error: `Error al enviar el mensaje. Código: ${response.status}`,
      };
    }
  } catch (error) {
    console.error("Error sending email: ", error);
    return {
      success: false,
      error: "Error al enviar el mensaje. Por favor, intenta nuevamente.",
    };
  }

  // Redirect debe estar fuera del try/catch
  redirect("/contacto/exitoso");
}
