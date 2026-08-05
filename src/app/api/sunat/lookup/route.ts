import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const docNumber =
      searchParams.get("docNumber")?.trim() || searchParams.get("ruc")?.trim();

    if (!docNumber) {
      return NextResponse.json(
        { error: "Número de RUC no proporcionado" },
        { status: 400 },
      );
    }

    const cleanDoc = docNumber.replace(/\D/g, "");

    if (cleanDoc.length !== 11) {
      return NextResponse.json(
        {
          error:
            "Se requiere un número de RUC de 11 dígitos (RUC 10 o RUC 20) para la facturación.",
        },
        { status: 400 },
      );
    }

    // Consulta de RUC (11 dígitos)
    const response = await fetch(
      `https://api.apis.net.pe/v1/ruc?numero=${cleanDoc}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "iubizon-web-client",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "RUC no encontrado en SUNAT" },
        { status: 404 },
      );
    }

    const data = await response.json();
    const status = data.estado || "ACTIVO";
    const condition = data.condicion || "HABIDO";

    const addressParts = [
      data.direccion,
      data.distrito,
      data.provincia,
      data.departamento,
    ].filter(Boolean);

    return NextResponse.json({
      success: true,
      type: "ruc",
      docNumber: cleanDoc,
      name: data.nombre || "",
      status,
      condition,
      address: addressParts.join(", "),
      district: data.distrito || "",
      province: data.provincia || "",
      department: data.departamento || "",
      isVerified: status === "ACTIVO" && condition === "HABIDO",
    });
  } catch (err: unknown) {
    console.error("Error en API /api/sunat/lookup:", err);
    return NextResponse.json(
      { error: "Error al consultar la base de datos de SUNAT" },
      { status: 500 },
    );
  }
}
