"use server";
import { redirect } from "next/navigation";
import { buildApiUrl, API_ENDPOINTS } from "@/config/api";

type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: Phone;
  message?: string;
  termsAndConditions: boolean;
};

export async function sendContactEmail(
  formContact: ContactFormData,
): Promise<{ success: boolean; error?: string }> {
  const mapFormContact = (formContact: ContactFormData): Partial<Email> => ({
    hostname: "iubizon.com",
    type: "contact",
    termsAndConditions: formContact.termsAndConditions,
    contactInfo: {
      firstName: formContact.firstName,
      lastName: formContact.lastName,
      fullName: `${formContact.firstName} ${formContact.lastName}`.trim(),
      email: formContact.email,
      phone: {
        prefix: formContact.phone.prefix,
        number: formContact.phone.number,
      },
    },
    contactDetails: {
      message: formContact?.message || "",
    },
  });

  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.EMAILS), {
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
