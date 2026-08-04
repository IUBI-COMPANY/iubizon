import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Resend } from "resend";

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "iubizon <onboarding@resend.dev>";

  console.log("=== PRUEBA DE ENVÍO DIRECTO CON RESEND ===");
  console.log("RESEND_API_KEY:", apiKey);
  console.log("EMAIL_FROM:", fromEmail);

  if (!apiKey) {
    console.error("Falta RESEND_API_KEY");
    return;
  }

  const resend = new Resend(apiKey);

  console.log("\n1. Probando envío a email de prueba...");
  const result = await resend.emails.send({
    from: fromEmail,
    to: ["iubizon.company@gmail.com"],
    subject: "Prueba de Integración iubizon - Resend",
    html: "<h1>¡Hola!</h1><p>Esta es una prueba de envío desde iubizon.</p>",
  });

  console.log("Respuesta de Resend:", JSON.stringify(result, null, 2));
}

main().catch(console.error);
