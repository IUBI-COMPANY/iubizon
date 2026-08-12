export interface ExtractedCompanyData {
  tax_id: string | null;
  legal_name: string | null;
  name: string | null;
  location: string | null;
  department: string | null;
  province: string | null;
  district: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  status: string | null;
  condition: string | null;
  tax_type?: "ruc20" | "ruc10";
}

/**
 * Extrae un RUC de 11 dígitos de cualquier texto o nombre de archivo.
 */
export function findRucInText(text: string): string | null {
  if (!text) return null;

  // Busca secuencias de 11 dígitos que empiecen con 10 o 20
  const matches = text.match(/(?:^|[^0-9])((?:10|20)\d{9})(?:[^0-9]|$)/g);
  if (matches) {
    for (const m of matches) {
      const clean = m.replace(/\D/g, "");
      if (clean.length === 11 && (clean.startsWith("10") || clean.startsWith("20"))) {
        return clean;
      }
    }
  }

  // Fallback sin separadores
  const simple = text.match(/((?:10|20)\d{9})/g);
  if (simple) {
    for (const c of simple) {
      if (c.length === 11) return c;
    }
  }

  return null;
}

/**
 * Parser de texto directo del PDF para extraer campos que Gemini puede omitir.
 * Los PDFs de SUNAT contienen texto seleccionable en UTF-8.
 */
function parsePdfRawText(pdfBuffer: Buffer): { phone: string | null; email: string | null; name: string | null } {
  // Intentar leer el texto del PDF en múltiples codificaciones
  const texts = [
    pdfBuffer.toString("utf-8"),
    pdfBuffer.toString("latin1"),
    pdfBuffer.toString("binary"),
  ];

  let phone: string | null = null;
  let email: string | null = null;
  let name: string | null = null;

  for (const text of texts) {
    // Buscar teléfono móvil (formato: "1 - 972300301" o simplemente "972300301")
    if (!phone) {
      const phonePatterns = [
        // Formato con prefijo de fila: "1 - 972300301" o "1- 972300301"
        /Teléfono\s+Móvil\s+1[\s\S]{0,30}?\d\s*-\s*(9\d{8})/i,
        /T.*?l.*?fono\s+M.*?vil\s+1[\s\S]{0,50}?(9\d{8})/i,
        // Número directo de 9 dígitos que empieza en 9 (celular peruano)
        /Móvil\s+1[^\n]{0,30}?(9\d{8})/i,
        /Movil\s+1[^\n]{0,30}?(9\d{8})/i,
        // Teléfono fijo (7 dígitos)
        /Fijo\s+1[^\n]{0,30}?([2-9]\d{6})/i,
      ];

      for (const pattern of phonePatterns) {
        const m = text.match(pattern);
        if (m && m[1]) {
          const digits = m[1].replace(/\D/g, "");
          if (digits.length >= 7) {
            phone = digits.length > 9 ? digits.slice(-9) : digits;
            break;
          }
        }
      }

      // Fallback: buscar cualquier número peruano de 9 dígitos empezando con 9
      if (!phone) {
        const anyPhone = text.match(/(?:^|[^\d])(9\d{8})(?:[^\d]|$)/);
        if (anyPhone && anyPhone[1]) {
          phone = anyPhone[1];
        }
      }
    }

    // Buscar email
    if (!email) {
      const emailMatch = text.match(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i);
      if (emailMatch && emailMatch[1]) {
        const candidate = emailMatch[1].trim();
        // Filtrar emails genéricos de SUNAT
        if (!candidate.includes("sunat.gob.pe") && candidate.includes("@")) {
          email = candidate;
        }
      }
    }

    // Buscar Nombre Comercial
    if (!name) {
      const nameMatch = text.match(/Nombre\s+Comercial[\s\S]{0,30}?([A-Z][A-Z0-9\s\.]{1,50})(?:\n|\r|\t|\|)/i);
      if (nameMatch && nameMatch[1]) {
        const candidate = nameMatch[1].trim();
        if (candidate && candidate !== "-" && candidate.length >= 2) {
          name = candidate;
        }
      }
    }

    if (phone && email) break;
  }

  return { phone, email, name };
}

/**
 * Llama a la API de Gemini con el PDF en base64.
 * Retorna el texto de respuesta crudo o null si falla.
 */
async function callGeminiWithPdf(
  base64Pdf: string,
  apiKey: string,
): Promise<ExtractedCompanyData | null> {
  // Modelos en orden de preferencia
  const models = [
    // Modelos disponibles (verificados vía ListModels API - Agosto 2026)
    "gemini-flash-latest",      // Alias estable → siempre el Flash más reciente
    "gemini-3.6-flash",         // Gemini 3.6 Flash (último estable)
    "gemini-3.5-flash",         // Gemini 3.5 Flash (fallback)
    "gemini-2.5-flash",         // Gemini 2.5 Flash (amplio soporte PDF)
    "gemini-pro-latest",        // Alias Pro más reciente
  ];

  const prompt = `Eres un sistema de extracción de datos de documentos SUNAT del Perú.

El documento adjunto es un "Reporte de Ficha RUC" oficial de SUNAT. Tiene tablas con filas como "Etiqueta | Valor".

TAREA: Extrae los siguientes campos y devuelve ÚNICAMENTE un objeto JSON válido (sin markdown, sin backticks, sin explicaciones):

{
  "tax_id": "<El número RUC de 11 dígitos del encabezado del documento. Solo dígitos. Ej: 20614600374>",
  "legal_name": "<La Razón Social del encabezado. Ej: IUBIZON COMPANY S.A.C.>",
  "name": "<El Nombre Comercial de la tabla 'Datos del Contribuyente'. Si es guión (-) usa el valor de legal_name. Ej: IUBIZON>",
  "phone": "<El número de teléfono de los campos 'Teléfono Móvil 1' o 'Teléfono Fijo 1'. IMPORTANTE: el formato en el PDF puede ser '1 - 972300301' donde '1' NO es parte del número, el número real es '972300301'. Extrae SOLO los últimos 9 dígitos. Si todos los campos de teléfono son guión (-), devuelve null>",
  "email": "<El correo electrónico de 'Correo Electrónico 1' o 'Correo Electrónico 2'. Busca bien en la tabla 'Datos del Contribuyente'. Si ambos son guión (-), devuelve null. Ej: iubizon.company@gmail.com>",
  "department": "<Departamento de la tabla 'Domicilio Fiscal'. Ej: LIMA>",
  "province": "<Provincia de la tabla 'Domicilio Fiscal'. Ej: LIMA>",
  "district": "<Distrito de la tabla 'Domicilio Fiscal'. Ej: CHORRILLOS>",
  "location": "<Construye la dirección del Domicilio Fiscal combinando el Tipo y Nombre Vía, Nro y Tipo y Nombre Zona. Ej: CAL. LAS ACACIAS NRO 181 URB. LA VILLA>",
  "description": "<Redacta una descripción comercial, profesional y atractiva escrita en primera persona del plural ('Somos', 'Nos dedicamos a', 'Ofrecemos'). Inspírate en su 'Actividad Económica Principal' y secundarias para hacerla vendedora para los compradores de la plataforma. Ej: 'Somos una empresa líder dedicada a la importación y comercialización de equipos tecnológicos, partes y piezas electrónicas de la mejor calidad. Nos especializamos en brindar soporte técnico y soluciones a medida para particulares y empresas.'>",
  "status": "<Estado del Contribuyente de la tabla 'Información General'. Ej: ACTIVO>",
  "condition": "<Condición del Domicilio Fiscal. Ej: HABIDO>"
}

REGLAS CRÍTICAS:
1. tax_id: SOLO los 11 dígitos numéricos, sin espacios.
2. phone: Si ves "1 - 972300301", el número es "972300301" (ignora el "1 -" que es número de fila). Extrae los últimos 9 dígitos.
3. email: Busca TODAS las filas de "Correo Electrónico" y devuelve el primero que no sea guión.
4. name: Si el PDF dice guión (-) en Nombre Comercial, copia el valor de legal_name.
5. department/province/district: Extrae EXACTAMENTE como aparece en el PDF (en mayúsculas).
6. location: Debe formarse como '[Tipo y Nombre Vía] NRO [Nro] [Tipo y Nombre Zona]'. No incluyas distrito, provincia o departamento aquí. Ej: 'CAL. LAS ACACIAS NRO 181 URB. LA VILLA'.
7. description: Escribe en primera persona del plural ('Somos una marca comprometida con...'). Debe ser persuasivo, comercial, invitando a la compra y de máximo 3-4 líneas.
8. Devuelve SOLO el JSON, sin texto adicional.`;


  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      console.log(`[Gemini] Intentando modelo: ${model}`);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  // IMPORTANTE: La API REST de Gemini usa camelCase, no snake_case
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64Pdf,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 2048,
          },
        }),
      });

      const responseBody = await response.text();
      console.log(`[Gemini] Status ${response.status} para modelo ${model}`);

      if (!response.ok) {
        console.warn(`[Gemini] Error HTTP ${response.status} en ${model}:`, responseBody.slice(0, 500));
        continue;
      }

      const result = JSON.parse(responseBody);
      const rawText: string =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      console.log(`[Gemini] Respuesta cruda de ${model}:`, rawText.slice(0, 800));

      if (!rawText) {
        console.warn(`[Gemini] Respuesta vacía del modelo ${model}`);
        continue;
      }

      // Limpiar markdown si lo hay
      const cleaned = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      // Extraer el primer objeto JSON válido
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn(`[Gemini] No se encontró JSON en la respuesta de ${model}:`, cleaned.slice(0, 300));
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      console.log(`[Gemini] Datos parseados de ${model}:`, parsed);

      // Normalizar tax_id
      const rawTaxId = parsed.tax_id ? String(parsed.tax_id).replace(/\D/g, "") : null;
      const tax_id = rawTaxId && rawTaxId.length === 11 ? rawTaxId : null;

      // Normalizar phone (quitar prefijos como "1 - ")
      let phone: string | null = null;
      if (parsed.phone && parsed.phone !== null && String(parsed.phone).trim() !== "-") {
        const rawPhone = String(parsed.phone).replace(/\D/g, "");
        if (rawPhone.length >= 7) {
          // Tomar los últimos 9 dígitos (número peruano)
          phone = rawPhone.length > 9 ? rawPhone.slice(-9) : rawPhone;
        }
      }

      // Normalizar email
      const email =
        parsed.email && String(parsed.email).trim() !== "-"
          ? String(parsed.email).trim()
          : null;

      return {
        tax_id,
        legal_name: parsed.legal_name ? String(parsed.legal_name).trim() : null,
        name: parsed.name ? String(parsed.name).trim() : null,
        location: parsed.location ? String(parsed.location).trim() : null,
        department: parsed.department ? String(parsed.department).trim().toUpperCase() : null,
        province: parsed.province ? String(parsed.province).trim().toUpperCase() : null,
        district: parsed.district ? String(parsed.district).trim().toUpperCase() : null,
        description: parsed.description ? String(parsed.description).trim() : null,
        phone,
        email,
        status: parsed.status ? String(parsed.status).trim() : "ACTIVO",
        condition: parsed.condition ? String(parsed.condition).trim() : "HABIDO",
        tax_type: tax_id?.startsWith("20") ? "ruc20" : tax_id?.startsWith("10") ? "ruc10" : undefined,
      };
    } catch (err) {
      console.error(`[Gemini] Excepción con modelo ${model}:`, err);
    }
  }

  return null;
}

/**
 * Consulta APIs públicas de SUNAT como fallback.
 */
async function fetchSunatPublicData(ruc: string): Promise<Partial<ExtractedCompanyData> | null> {
  const endpoints = [
    `https://api.apis.net.pe/v2/sunat/ruc?numero=${ruc}`,
    `https://api.apis.net.pe/v1/ruc?numero=${ruc}`,
    `https://api.perudevs.com/api/v1/ruc?document=${ruc}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "iubizon-web/1.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) continue;

      const data = await res.json() as Record<string, unknown>;
      const nombre =
        (data.razonSocial as string) ||
        (data.nombre as string) ||
        ((data.resultado as Record<string, unknown>)?.nombre as string) ||
        "";

      if (!nombre) continue;

      const parts = [
        (data.direccion as string) || ((data.resultado as Record<string, unknown>)?.direccion as string),
        (data.distrito as string) || ((data.resultado as Record<string, unknown>)?.distrito as string),
        (data.provincia as string) || ((data.resultado as Record<string, unknown>)?.provincia as string),
        (data.departamento as string) || ((data.resultado as Record<string, unknown>)?.departamento as string),
      ].filter(Boolean);

      return {
        tax_id: ruc,
        legal_name: nombre,
        name: nombre,
        location: parts.length > 0 ? parts.join(", ") : null,
        status: (data.estado as string) || "ACTIVO",
        condition: (data.condicion as string) || "HABIDO",
        tax_type: ruc.startsWith("20") ? "ruc20" : "ruc10",
      };
    } catch (err) {
      console.warn(`[SUNAT Fallback] Error en ${url}:`, err);
    }
  }

  return null;
}

/**
 * Función principal de extracción de datos de Ficha RUC (PDF).
 *
 * Estrategia:
 * 1. Gemini IA multimodal — lee el PDF visualmente y extrae todos los campos
 * 2. Fallback SUNAT API — si Gemini falla, consulta por RUC (detectado del nombre de archivo)
 */
export async function extractCompanyDataFromPdf(
  pdfBuffer: Buffer,
  fileName?: string,
): Promise<ExtractedCompanyData | null> {
  console.log(`[DocumentExtractor] Iniciando extracción. Archivo: ${fileName}, Tamaño: ${pdfBuffer.length} bytes`);

  // Intentar detectar RUC del nombre de archivo como respaldo
  const rucFromFileName = fileName ? findRucInText(fileName) : null;
  if (rucFromFileName) {
    console.log(`[DocumentExtractor] RUC detectado en nombre de archivo: ${rucFromFileName}`);
  }

  // ── Capa 1: Google Gemini IA ──────────────────────────────────────────────
  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    ""
  ).trim().replace(/^["']|["']$/g, "");

  // Parsear texto del PDF como respaldo para campos que Gemini puede omitir
  const textParsed = parsePdfRawText(pdfBuffer);
  console.log(`[DocumentExtractor] Parser de texto directo:`, textParsed);

  if (apiKey) {
    console.log(`[DocumentExtractor] API Key de Gemini encontrada (${apiKey.length} chars). Llamando a Gemini...`);
    const base64Pdf = pdfBuffer.toString("base64");
    const geminiResult = await callGeminiWithPdf(base64Pdf, apiKey);

    if (geminiResult) {
      console.log(`[DocumentExtractor] ✅ Gemini extrajo datos exitosamente:`, geminiResult);

      // Si Gemini no devolvió RUC, usar el del nombre de archivo
      if (!geminiResult.tax_id && rucFromFileName) {
        geminiResult.tax_id = rucFromFileName;
        geminiResult.tax_type = rucFromFileName.startsWith("20") ? "ruc20" : "ruc10";
      }

      // Completar campos que Gemini devolvió como null usando el parser de texto
      if (!geminiResult.phone && textParsed.phone) {
        console.log(`[DocumentExtractor] Completando phone con parser de texto: ${textParsed.phone}`);
        geminiResult.phone = textParsed.phone;
      }
      if (!geminiResult.email && textParsed.email) {
        console.log(`[DocumentExtractor] Completando email con parser de texto: ${textParsed.email}`);
        geminiResult.email = textParsed.email;
      }
      if (!geminiResult.name && textParsed.name) {
        geminiResult.name = textParsed.name;
      }

      return geminiResult;
    }

    console.warn(`[DocumentExtractor] ⚠️ Gemini no retornó datos. Intentando fallback SUNAT...`);
  } else {
    console.warn(`[DocumentExtractor] ⚠️ No hay API Key de Gemini configurada. Usando fallback SUNAT...`);
  }

  // ── Capa 2: Fallback SUNAT API por RUC ───────────────────────────────────
  const rucToQuery = rucFromFileName;
  if (rucToQuery) {
    console.log(`[DocumentExtractor] Consultando SUNAT API con RUC: ${rucToQuery}`);
    const sunatData = await fetchSunatPublicData(rucToQuery);
    if (sunatData) {
      console.log(`[DocumentExtractor] ✅ SUNAT API retornó datos:`, sunatData);
      return {
        tax_id: rucToQuery,
        legal_name: sunatData.legal_name || null,
        name: sunatData.name || sunatData.legal_name || null,
        location: sunatData.location || null,
        department: null,
        province: null,
        district: null,
        description: null,
        phone: textParsed.phone || null,
        email: textParsed.email || null,
        status: sunatData.status || "ACTIVO",
        condition: sunatData.condition || "HABIDO",
        tax_type: sunatData.tax_type,
      };
    }
  }

  console.warn(`[DocumentExtractor] ❌ No se pudo extraer datos del PDF.`);
  return null;
}
