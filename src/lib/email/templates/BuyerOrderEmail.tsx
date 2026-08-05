import * as React from "react";
import {
  Section,
  Text,
  Heading,
  Button,
  Row,
  Column,
  Img,
  Hr,
} from "@react-email/components";
import { BaseLayout } from "./BaseLayout";
import type { BuyerEmailData } from "../types";

export function BuyerOrderEmail(data: BuyerEmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iubizon.com";
  const orderUrl = `${baseUrl}/user/orders/${data.orderCode}`;

  const formattedSubtotal = `S/ ${data.subtotal.toFixed(2)}`;
  const formattedShipping =
    data.shippingCost === 0
      ? "GRATIS (Promoción)"
      : `S/ ${data.shippingCost.toFixed(2)}`;
  const formattedTotal = `S/ ${data.total.toFixed(2)}`;

  return (
    <BaseLayout
      previewText={`Confirmación de tu compra ${data.orderCode} en iubizon`}
    >
      {/* Banner de Confirmación */}
      <Section style={successBannerStyle}>
        <Text style={successBadgeStyle}>¡PAGO CONFIRMADO!</Text>
        <Heading style={mainHeadingStyle}>
          ¡Gracias por tu compra, {data.buyerName}!
        </Heading>
        <Text style={subtitleStyle}>
          Hemos recibido tu pago y tu pedido ya está siendo preparado por los
          vendedores.
        </Text>
      </Section>

      {/* Tarjeta de Código de Pedido */}
      <Section style={orderInfoCardStyle}>
        <Row>
          <Column style={{ padding: "8px 12px" }}>
            <Text style={metaLabelStyle}>N° DE PEDIDO</Text>
            <Text style={metaValueStyle}>{data.orderCode}</Text>
          </Column>
          <Column style={{ padding: "8px 12px", textAlign: "right" }}>
            <Text style={metaLabelStyle}>FECHA DE COMPRA</Text>
            <Text style={metaValueStyle}>{data.createdAt}</Text>
          </Column>
        </Row>
      </Section>

      {/* Lista de Productos Comprados */}
      <Section style={{ marginTop: "24px" }}>
        <Text style={sectionTitleStyle}>PRODUCTOS EN TU COMPRA</Text>
        {data.items.map((item, index) => {
          const itemSubtotal = `S/ ${(item.price * item.quantity).toFixed(2)}`;
          return (
            <React.Fragment key={item.id || index}>
              <Row style={itemRowStyle}>
                <Column style={{ width: "64px", verticalAlign: "top" }}>
                  {item.imageUrl ? (
                    <Img
                      src={item.imageUrl}
                      alt={item.title}
                      width="54"
                      height="54"
                      style={productImgStyle}
                    />
                  ) : (
                    <div style={productImgPlaceholderStyle}>📦</div>
                  )}
                </Column>
                <Column style={{ paddingLeft: "12px", verticalAlign: "top" }}>
                  <Text style={itemTitleStyle}>{item.title}</Text>
                  <Text style={itemMetaStyle}>
                    Cant: {item.quantity} × S/ {item.price.toFixed(2)} c/u
                  </Text>
                  {(item.companyName || item.sellerName) && (
                    <Text style={sellerTagStyle}>
                      Despachado por: {item.companyName || item.sellerName}
                    </Text>
                  )}
                </Column>
                <Column
                  style={{
                    width: "90px",
                    textAlign: "right",
                    verticalAlign: "top",
                  }}
                >
                  <Text style={itemSubtotalStyle}>{itemSubtotal}</Text>
                </Column>
              </Row>
              {index < data.items.length - 1 && <Hr style={lightHrStyle} />}
            </React.Fragment>
          );
        })}
      </Section>

      {/* Desglose de Totales */}
      <Section style={totalsBoxStyle}>
        <Row style={totalRowStyle}>
          <Column>
            <Text style={totalLabelStyle}>Subtotal de productos:</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={totalValueStyle}>{formattedSubtotal}</Text>
          </Column>
        </Row>
        <Row style={totalRowStyle}>
          <Column>
            <Text style={totalLabelStyle}>Costo de envío:</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text
              style={
                data.shippingCost === 0
                  ? freeShippingTextStyle
                  : totalValueStyle
              }
            >
              {formattedShipping}
            </Text>
          </Column>
        </Row>
        <Hr style={lightHrStyle} />
        <Row style={{ marginTop: "8px" }}>
          <Column>
            <Text style={grandTotalLabelStyle}>TOTAL PAGADO:</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={grandTotalValueStyle}>{formattedTotal}</Text>
          </Column>
        </Row>
      </Section>

      {/* Información de Envío y Comprobante */}
      <Section style={shippingBoxStyle}>
        <Text style={sectionTitleStyle}>DIRECCIÓN Y DATOS DE ENTREGA</Text>
        <Text style={shippingTextStyle}>
          <strong>Destinatario:</strong> {data.shippingForm.name}
        </Text>
        <Text style={shippingTextStyle}>
          <strong>Dirección:</strong> {data.shippingForm.address},{" "}
          {data.shippingForm.city}
        </Text>
        {(data.shippingForm.department ||
          data.shippingForm.province ||
          data.shippingForm.district) && (
          <Text style={shippingTextStyle}>
            <strong>Ubigeo:</strong>{" "}
            {[
              data.shippingForm.district,
              data.shippingForm.province,
              data.shippingForm.department,
            ]
              .filter(Boolean)
              .join(", ")}
          </Text>
        )}
        <Text style={shippingTextStyle}>
          <strong>Teléfono:</strong> {data.shippingForm.phone}
        </Text>
        {data.shippingForm.documentType && data.shippingForm.documentNumber && (
          <Text style={shippingTextStyle}>
            <strong>Documento del destinatario:</strong>{" "}
            {data.shippingForm.documentType.toUpperCase()}{" "}
            {data.shippingForm.documentNumber}
          </Text>
        )}
        {data.deliveryType && (
          <Text style={shippingTextStyle}>
            <strong>Modalidad:</strong>{" "}
            {data.deliveryType === "progressive"
              ? "Entrega Progresiva (recibe cada producto conforme esté listo)"
              : "Entrega Completa (recibe todo en un solo envío)"}
          </Text>
        )}
        {data.invoiceType && (
          <Text style={shippingTextStyle}>
            <strong>Comprobante solicitado:</strong>{" "}
            {data.invoiceType.toUpperCase()}{" "}
            {data.invoiceNumber ? `(${data.invoiceNumber})` : ""}
          </Text>
        )}
        {data.shippingForm.notes && (
          <Text style={shippingTextStyle}>
            <strong>Notas del cliente:</strong> {data.shippingForm.notes}
          </Text>
        )}
      </Section>

      {/* Botón de Acción Principal */}
      <Section style={{ textAlign: "center", marginTop: "32px" }}>
        <Button href={orderUrl} style={primaryButtonStyle}>
          Ver Estado de mi Pedido en iubizon
        </Button>
      </Section>
    </BaseLayout>
  );
}

// Estilos Inline Específicos
const successBannerStyle: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  marginBottom: "20px",
};

const successBadgeStyle: React.CSSProperties = {
  color: "#16a34a",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "1px",
  margin: "0 0 6px 0",
};

const mainHeadingStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "20px",
  fontWeight: "800",
  margin: "0 0 6px 0",
};

const subtitleStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "13px",
  margin: "0",
};

const orderInfoCardStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  marginTop: "16px",
};

const metaLabelStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.5px",
  margin: "0",
};

const metaValueStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "13px",
  fontWeight: "700",
  margin: "2px 0 0 0",
};

const sectionTitleStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.5px",
  marginBottom: "12px",
};

const itemRowStyle: React.CSSProperties = {
  padding: "10px 0",
};

const productImgStyle: React.CSSProperties = {
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  objectFit: "cover",
};

const productImgPlaceholderStyle: React.CSSProperties = {
  width: "54px",
  height: "54px",
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
};

const itemTitleStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "13px",
  fontWeight: "700",
  margin: "0 0 2px 0",
};

const itemMetaStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0 0 2px 0",
};

const sellerTagStyle: React.CSSProperties = {
  color: "#f25c05",
  fontSize: "11px",
  fontWeight: "600",
  margin: "0",
};

const itemSubtotalStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "13px",
  fontWeight: "700",
  margin: "0",
};

const lightHrStyle: React.CSSProperties = {
  borderColor: "#f1f5f9",
  margin: "8px 0",
};

const totalsBoxStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "16px",
  marginTop: "20px",
};

const totalRowStyle: React.CSSProperties = {
  marginBottom: "6px",
};

const totalLabelStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0",
};

const totalValueStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0",
};

const freeShippingTextStyle: React.CSSProperties = {
  color: "#16a34a",
  fontSize: "12px",
  fontWeight: "700",
  margin: "0",
};

const grandTotalLabelStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "14px",
  fontWeight: "800",
  margin: "0",
};

const grandTotalValueStyle: React.CSSProperties = {
  color: "#f25c05",
  fontSize: "16px",
  fontWeight: "800",
  margin: "0",
};

const shippingBoxStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "16px",
  marginTop: "20px",
};

const shippingTextStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "12px",
  margin: "0 0 6px 0",
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#f25c05",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700",
  borderRadius: "12px",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};
