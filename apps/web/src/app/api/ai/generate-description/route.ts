import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, brand, categoryName, companyName } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        {
          error:
            "Ingresa al menos el título del producto para generar la descripción con AI.",
        },
        { status: 400 },
      );
    }

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      ""
    )
      .trim()
      .replace(/^["']|["']$/g, "");

    // Prompt enriquecido para extraer conocimiento técnico real del producto
    const prompt = `Eres un experto redactor técnico comercial especializado en e-commerce y tecnología corporativa para la plataforma iubizon en Perú.

TAREA: Genera una descripción de producto rica en información real, técnica, profesional y concisa para el siguiente producto: "${title.trim()}".
${brand ? `- Marca: ${brand.trim()}` : ""}
${categoryName ? `- Categoría: ${categoryName.trim()}` : ""}
${companyName ? `- Empresa vendedora: ${companyName.trim()}` : ""}

REGLAS DE CONTENIDO Y ESTRUCTURA OBLIGATORIAS:

1. **INVESTIGA Y EXTRAE INFORMACIÓN TÉCNICA REAL DE ESTE PRODUCTO ESPECÍFICO ("${title.trim()}"):**
   - Usa tu conocimiento detallado sobre este producto o modelo exacto para incluir características reales (ej: si es un AnyCast M12, menciona su procesador RK3036, resolución 1080p, soporte AirPlay/Miracast/DLNA, antena Wi-Fi, etc. Si es un proyector Epson 119W, menciona su tecnología 3LCD, 4000 lúmenes, WXGA, parlante 16W, etc.).
   - Si el título es genérico, infiere sus funciones técnicas estándar según su categoría ("${categoryName || "Tecnología"}").

2. **PROHIBICIÓN ESTRICTA DE DATOS REDUNDANTES:**
   - NO incluyas "Estado del producto", "Nuevo", "Usado", "Precio", "Valor comercial", "Garantía" ni "Stock". Estos datos ya existen en la ficha del producto y ES REDUNDANTE incluirlos.
   - NUNCA incluyas números de teléfono, correos, WhatsApp, redes sociales ni datos de contacto.

3. **FORMATO HTML REQUERIDO (SOLO UTILIZAR ETIQUETAS <p>, <strong>, <ul>, <li>):**

<p><strong>DESCRIPCIÓN:</strong></p>
<p>[Párrafo 1: Explicación concisa y profesional de qué es el producto, su tecnología principal y su propósito en oficinas, aulas o uso diario].</p>
<p>[Párrafo 2: Ventajas clave y facilidad de uso sin configuraciones complejas].</p>

<p><strong>CARACTERÍSTICAS DESTACADAS:</strong></p>
<ul>
  <li><strong>[Nombre Característica 1]:</strong> [Detalle técnico real en 1 línea]</li>
  <li><strong>[Nombre Característica 2]:</strong> [Detalle técnico real en 1 línea]</li>
  <li><strong>[Nombre Característica 3]:</strong> [Detalle técnico real en 1 línea]</li>
  <li><strong>[Nombre Característica 4]:</strong> [Detalle técnico real en 1 línea]</li>
</ul>

<p><strong>ESPECIFICACIONES TÉCNICAS Y COMPATIBILIDAD:</strong></p>
<ul>
  <li><strong>Compatibilidad:</strong> [Sistemas operativos y dispositivos soportados como Windows, Mac OS, Android, iOS]</li>
  <li><strong>Interfaz y Conexiones:</strong> [Puertos de entrada/salida como HDMI, USB, etc.]</li>
  <li><strong>Resolución / Rendimiento:</strong> [Capacidad técnica real de procesamiento o resolución]</li>
  <li><strong>Alimentación / Diseño:</strong> [Especificación física o de energía]</li>
</ul>

REGLAS DE FORMATO FINAL:
- Devuelve ÚNICAMENTE el código HTML (sin bloques \`\`\`html, sin comentarios externos).
- Sé conciso, profesional y directo al grano (longitud total aproximada entre 500 y 1100 caracteres).`;

    if (apiKey) {
      const models = [
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-1.5-flash",
        "gemini-pro-latest",
      ];

      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 1024,
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            let rawText =
              data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (rawText) {
              rawText = rawText
                .replace(/^```html\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/```$/i, "")
                .trim();

              return NextResponse.json({ descriptionHtml: rawText });
            }
          }
        } catch (err) {
          console.warn(`[Gemini AI] Fallo en modelo ${model}:`, err);
        }
      }
    }

    // Fallback pulcro sin datos redundantes (sin precio, sin estado, sin garantía)
    const fallbackHtml = `<p><strong>DESCRIPCIÓN:</strong></p>
<p>El <strong>${title.trim()}</strong> ${brand ? `de la marca <strong>${brand.trim()}</strong>` : ""} es una solución de alto rendimiento ${categoryName ? `en la categoría de <strong>${categoryName.trim()}</strong>` : ""}, diseñada para ofrecer máxima conectividad, eficiencia y calidad en entornos corporativos, educativos o uso personal.</p>
<p>Su diseño optimizado permite una fácil integración y funcionamiento continuo en todo tipo de actividades y proyectos.</p>

<p><strong>CARACTERÍSTICAS DESTACADAS:</strong></p>
<ul>
  <li><strong>Rendimiento Superior:</strong> Procesamiento eficiente para transmisión y ejecución de tareas exigentes.</li>
  <li><strong>Diseño Práctico:</strong> Estructura compacta y lista para uso directo sin configuraciones complejas.</li>
  <li><strong>Integración Multidispositivo:</strong> Optimizado para sincronizarse rápidamente con diversos equipos.</li>
</ul>

<p><strong>ESPECIFICACIONES Y COMPATIBILIDAD:</strong></p>
<ul>
  <li><strong>Compatibilidad:</strong> Compatible con PC, Mac OS, Android, iOS y sistemas estándares.</li>
  <li><strong>Conectividad:</strong> Puertos de alta velocidad para transmisión sin interrupciones.</li>
</ul>`;

    return NextResponse.json({ descriptionHtml: fallbackHtml });
  } catch (error) {
    console.error("Error al generar descripción con IA:", error);
    return NextResponse.json(
      { error: "No se pudo generar la descripción con IA." },
      { status: 500 },
    );
  }
}
