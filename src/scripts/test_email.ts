import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Resend } from "resend";

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "iubizon <onboarding@resend.dev>";

  console.log("=== TESTING RESEND SEND TO BUYER EMAIL ===");
  console.log("RESEND_API_KEY:", apiKey);
  console.log("EMAIL_FROM:", fromEmail);

  if (!apiKey) {
    console.error("Falta RESEND_API_KEY");
    return;
  }

  const resend = new Resend(apiKey);

  console.log("\nEnviando a nmoriano26@gmail.com...");
  const resBuyer = await resend.emails.send({
    from: fromEmail,
    to: ["nmoriano26@gmail.com"],
    subject: "Prueba de Compra - iubizon",
    html: "<h1>Prueba a nmoriano26@gmail.com</h1>",
  });
  console.log(
    "Respuesta para nmoriano26@gmail.com:",
    JSON.stringify(resBuyer, null, 2),
  );
}

main().catch(console.error);
