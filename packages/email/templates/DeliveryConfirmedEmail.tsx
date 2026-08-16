import * as React from "react";
import {
  Button,
  Column,
  Heading,
  Hr,
  Img,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { BaseLayout } from "./BaseLayout";
import type { DeliveryConfirmedEmailData } from "../types";

export function DeliveryConfirmedEmail(data: DeliveryConfirmedEmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iubizon.com";
  const orderUrl = `${baseUrl}/user/dashboard/orders/${data.packageCode}`;

  const formattedSubtotal = `S/ ${data.packageSubtotal.toFixed(2)}`;
  const formattedNet = `S/ ${data.netEarnings.toFixed(2)}`;

  return (
    <BaseLayout
      previewText={`Entrega confirmada — Pedido #${data.orderCode}`}
    >
      <Section style={confirmedBannerStyle}>
        <Text style={badgeStyle}>PRODUCTO RECIBIDO CONFORME</Text>
        <Heading style={mainHeadingStyle}>
          ¡El cliente confirmó la recepción!
        </Heading>
        <Text style={subtitleStyle}>
          <strong>{data.buyerName}</strong> ha confirmado la recepción
          conforme de los productos de{" "}
          <strong>{data.companyName}</strong> en la orden{" "}
          <strong>#{data.orderCode}</strong>. La entrega quedó registrada en tu
          panel.
        </Text>
      </Section>

      <Section style={infoCardStyle}>
        <Row>
          <Column style={{ padding: "8px 12px" }}>
            <Text style={metaLabelStyle}>N° DE PEDIDO</Text>
            <Text style={metaValueStyle}>{data.orderCode}</Text>
          </Column>
          <Column style={{ padding: "8px 12px", textAlign: "right" }}>
            <Text style={metaLabelStyle}>FECHA Y HORA DE CONFIRMACIÓN</Text>
            <Text style={metaValueStyle}>{data.confirmedAt}</Text>
          </Column>
        </Row>
        <Hr style={lightHrStyle} />
        <Row>
          <Column style={{ padding: "8px 12px" }}>
            <Text style={metaLabelStyle}>VENDEDOR</Text>
            <Text style={metaValueStyle}>{data.companyName}</Text>
          </Column>
          <Column style={{ padding: "8px 12px", textAlign: "right" }}>
            <Text style={metaLabelStyle}>COMPRADOR</Text>
            <Text style={metaValueStyle}>{data.buyerName}</Text>
          </Column>
        </Row>
      </Section>

      {(data.companyLegalName || data.companyTaxId || data.companyPhone) && (
        <Section style={companyInfoBoxStyle}>
          <Text style={metaLabelStyle}>DATOS DE LA EMPRESA</Text>
          <Text style={companyDetailStyle}>
            {[
              data.companyLegalName,
              data.companyTaxId ? `RUC: ${data.companyTaxId}` : null,
              data.companyPhone ? `Tel: ${data.companyPhone}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </Section>
      )}

      <Section style={{ marginTop: "24px" }}>
        <Text style={sectionTitleStyle}>PRODUCTOS ENTREGADOS</Text>
        {data.items.map((item, index) => (
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
                <Text style={sellerTagStyle}>
                  Vendido por: {item.companyName || item.sellerName}
                </Text>
              </Column>
            </Row>
            {index < data.items.length - 1 && <Hr style={lightHrStyle} />}
          </React.Fragment>
        ))}
      </Section>

      <Section style={amountBoxStyle}>
        <Row style={totalRowStyle}>
          <Column>
            <Text style={amountLabelStyle}>MONTO DEL PAQUETE</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={amountValueStyle}>{formattedSubtotal}</Text>
          </Column>
        </Row>
        <Hr style={lightHrStyle} />
        <Row>
          <Column>
            <Text style={netLabelStyle}>MONTO NETO A RECIBIR</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={netValueStyle}>{formattedNet}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ textAlign: "center", marginTop: "32px" }}>
        <Button href={orderUrl} style={primaryButtonStyle}>
          Ver Pedido en tu Panel
        </Button>
      </Section>
    </BaseLayout>
  );
}

const confirmedBannerStyle: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  border: "1px solid #a7f3d0",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  marginBottom: "20px",
};
const badgeStyle: React.CSSProperties = {
  color: "#059669",
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
  lineHeight: "1.5",
};
const infoCardStyle: React.CSSProperties = {
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
const lightHrStyle: React.CSSProperties = {
  borderColor: "#f1f5f9",
  margin: "8px 0",
};
const sectionTitleStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.5px",
  marginBottom: "12px",
};
const companyInfoBoxStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  padding: "16px",
  marginTop: "16px",
};
const companyDetailStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "12px",
  margin: "4px 0 0 0",
};
const itemRowStyle: React.CSSProperties = { padding: "10px 0" };
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
const amountBoxStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  padding: "16px",
  marginTop: "20px",
};
const totalRowStyle: React.CSSProperties = {
  marginBottom: "6px",
};
const amountLabelStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "700",
  margin: "0",
};
const amountValueStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "14px",
  fontWeight: "800",
  margin: "0",
};
const netLabelStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "13px",
  fontWeight: "800",
  margin: "0",
};
const netValueStyle: React.CSSProperties = {
  color: "#16a34a",
  fontSize: "16px",
  fontWeight: "800",
  margin: "0",
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