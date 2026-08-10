import * as React from "react";
import { Section, Text, Heading, Button, Row, Column, Img, Hr } from "@react-email/components";
import { BaseLayout } from "./BaseLayout";
import type { ReturnShippedEmailData } from "../types";

export function ReturnShippedEmail(data: ReturnShippedEmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iubizon.com";

  return (
    <BaseLayout previewText={`El comprador envió el producto de vuelta — Pedido #${data.orderCode}`}>
      <Section style={bannerStyle}>
        <Text style={badgeStyle}>PRODUCTO EN CAMINO DE VUELTA</Text>
        <Heading style={mainHeadingStyle}>{data.companyName}</Heading>
        <Text style={subtitleStyle}>
          El comprador <strong>{data.buyerName}</strong> ha enviado el producto de vuelta
          por el reembolso solicitado en la orden <strong>#{data.orderCode}</strong>.
          Revisa los datos de seguimiento y prepárate para recibirlo.
        </Text>
      </Section>

      <Section style={trackingCardStyle}>
        <Row>
          <Column style={{ padding: "8px 12px" }}>
            <Text style={metaLabelStyle}>N° DE PEDIDO</Text>
            <Text style={metaValueStyle}>{data.orderCode}</Text>
          </Column>
          <Column style={{ padding: "8px 12px", textAlign: "right" }}>
            <Text style={metaLabelStyle}>EMPRESA DE TRANSPORTE</Text>
            <Text style={metaValueStyle}>{data.courier}</Text>
          </Column>
        </Row>
        <Hr style={lightHrStyle} />
        <Row>
          <Column style={{ padding: "8px 12px" }}>
            <Text style={metaLabelStyle}>CÓDIGO DE SEGUIMIENTO</Text>
            <Text style={trackingCodeStyle}>{data.trackingNumber}</Text>
          </Column>
          <Column style={{ padding: "8px 12px", textAlign: "right" }}>
            <Text style={metaLabelStyle}>FECHA ESTIMADA DE LLEGADA</Text>
            <Text style={metaValueStyle}>{data.estimatedDelivery}</Text>
          </Column>
        </Row>
        {data.trackingUrl && (
          <>
            <Hr style={lightHrStyle} />
            <Section style={{ textAlign: "center", padding: "8px 0" }}>
              <Button href={data.trackingUrl} style={trackingButtonStyle}>
                Rastrear envío en línea
              </Button>
            </Section>
          </>
        )}
      </Section>

      <Section style={addressBoxStyle}>
        <Text style={sectionTitleStyle}>DIRECCIÓN DE ENTREGA (DEVOLUCIÓN)</Text>
        <Text style={addressTextStyle}>{data.returnAddress}</Text>
      </Section>

      <Section style={{ marginTop: "24px" }}>
        <Text style={sectionTitleStyle}>PRODUCTOS DEVUELTOS</Text>
        {data.items.map((item, index) => (
          <React.Fragment key={item.id || index}>
            <Row style={itemRowStyle}>
              <Column style={{ width: "64px", verticalAlign: "top" }}>
                {item.imageUrl ? (
                  <Img src={item.imageUrl} alt={item.title} width="54" height="54" style={productImgStyle} />
                ) : (
                  <div style={productImgPlaceholderStyle}>📦</div>
                )}
              </Column>
              <Column style={{ paddingLeft: "12px", verticalAlign: "top" }}>
                <Text style={itemTitleStyle}>{item.title}</Text>
                <Text style={itemMetaStyle}>
                  Cant: {item.quantity} × S/ {item.price.toFixed(2)} c/u
                </Text>
              </Column>
            </Row>
            {index < data.items.length - 1 && <Hr style={lightHrStyle} />}
          </React.Fragment>
        ))}
      </Section>

      <Section style={amountBoxStyle}>
        <Row>
          <Column>
            <Text style={amountLabelStyle}>MONTO A REEMBOLSAR</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={amountValueStyle}>S/ {data.refundAmount.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ textAlign: "center", marginTop: "32px" }}>
        <Button href={`${baseUrl}/user/dashboard/orders`} style={primaryButtonStyle}>
          Ir a Gestión de Ventas
        </Button>
      </Section>
    </BaseLayout>
  );
}

const bannerStyle: React.CSSProperties = { backgroundColor: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", padding: "20px", textAlign: "center", marginBottom: "20px" };
const badgeStyle: React.CSSProperties = { color: "#d97706", fontSize: "11px", fontWeight: "800", letterSpacing: "1px", margin: "0 0 6px 0" };
const mainHeadingStyle: React.CSSProperties = { color: "#112237", fontSize: "20px", fontWeight: "800", margin: "0 0 6px 0" };
const subtitleStyle: React.CSSProperties = { color: "#475569", fontSize: "13px", margin: "0", lineHeight: "1.5" };
const trackingCardStyle: React.CSSProperties = { backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", marginTop: "16px" };
const metaLabelStyle: React.CSSProperties = { color: "#94a3b8", fontSize: "10px", fontWeight: "700", letterSpacing: "0.5px", margin: "0" };
const metaValueStyle: React.CSSProperties = { color: "#112237", fontSize: "13px", fontWeight: "700", margin: "2px 0 0 0" };
const trackingCodeStyle: React.CSSProperties = { color: "#f25c05", fontSize: "18px", fontWeight: "800", margin: "2px 0 0 0", letterSpacing: "1px" };
const lightHrStyle: React.CSSProperties = { borderColor: "#f1f5f9", margin: "8px 0" };
const trackingButtonStyle: React.CSSProperties = { backgroundColor: "#2563eb", color: "#fff", fontSize: "13px", fontWeight: "700", borderRadius: "12px", padding: "12px 24px", textDecoration: "none", display: "inline-block" };
const addressBoxStyle: React.CSSProperties = { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginTop: "20px" };
const sectionTitleStyle: React.CSSProperties = { color: "#112237", fontSize: "12px", fontWeight: "800", letterSpacing: "0.5px", marginBottom: "12px" };
const addressTextStyle: React.CSSProperties = { color: "#475569", fontSize: "12px", margin: "0 0 2px 0" };
const itemRowStyle: React.CSSProperties = { padding: "10px 0" };
const productImgStyle: React.CSSProperties = { borderRadius: "8px", border: "1px solid #e2e8f0", objectFit: "cover" };
const productImgPlaceholderStyle: React.CSSProperties = { width: "54px", height: "54px", backgroundColor: "#f1f5f9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" };
const itemTitleStyle: React.CSSProperties = { color: "#112237", fontSize: "13px", fontWeight: "700", margin: "0 0 2px 0" };
const itemMetaStyle: React.CSSProperties = { color: "#64748b", fontSize: "12px", margin: "0 0 2px 0" };
const amountBoxStyle: React.CSSProperties = { backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "16px", marginTop: "20px" };
const amountLabelStyle: React.CSSProperties = { color: "#64748b", fontSize: "12px", fontWeight: "700", margin: "0" };
const amountValueStyle: React.CSSProperties = { color: "#f25c05", fontSize: "18px", fontWeight: "800", margin: "0" };
const primaryButtonStyle: React.CSSProperties = { backgroundColor: "#f25c05", color: "#ffffff", fontSize: "14px", fontWeight: "700", borderRadius: "12px", padding: "14px 28px", textDecoration: "none", display: "inline-block" };
