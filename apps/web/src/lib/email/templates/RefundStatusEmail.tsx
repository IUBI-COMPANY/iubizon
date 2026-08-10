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
import type { RefundStatusEmailData } from "../types";

export function RefundStatusEmail(data: RefundStatusEmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iubizon.com";
  const orderUrl = `${baseUrl}/user/orders/${data.orderCode}`;
  const isApproved = data.status === "approved";

  return (
    <BaseLayout
      previewText={`${isApproved ? "Actualización" : "Respuesta"} de reembolso — Pedido #${data.orderCode}`}
    >
      <Section style={bannerStyle(isApproved)}>
        <Text style={badgeStyle(isApproved)}>
          {isApproved ? "REEMBOLSO APROBADO" : "REEMBOLSO RECHAZADO"}
        </Text>
        <Heading style={mainHeadingStyle}>Hola, {data.buyerName}</Heading>
        <Text style={subtitleStyle}>
          {isApproved
            ? `Tu solicitud de reembolso para la orden #${data.orderCode} ha sido aprobada. Revisa las instrucciones de devolución en la plataforma.`
            : `Lamentamos informarte que tu solicitud de reembolso para la orden #${data.orderCode} no ha sido aprobada.`}
        </Text>
      </Section>

      <Section style={infoCardStyle}>
        <Row>
          <Column style={{ padding: "8px 12px" }}>
            <Text style={metaLabelStyle}>N° DE PEDIDO</Text>
            <Text style={metaValueStyle}>{data.orderCode}</Text>
          </Column>
          <Column style={{ padding: "8px 12px", textAlign: "right" }}>
            <Text style={metaLabelStyle}>TIPO</Text>
            <Text style={metaValueStyle}>
              {data.refundType === "full"
                ? "Reembolso Total"
                : "Reembolso Parcial"}
            </Text>
          </Column>
        </Row>
        <Hr style={lightHrStyle} />
        <Row>
          <Column style={{ padding: "8px 12px" }}>
            <Text style={metaLabelStyle}>MONTO</Text>
            <Text style={amountValueStyle}>
              S/ {data.refundAmount.toFixed(2)}
            </Text>
          </Column>
          <Column style={{ padding: "8px 12px", textAlign: "right" }}>
            <Text style={metaLabelStyle}>ESTADO</Text>
            <Text
              style={{
                ...metaValueStyle,
                color: isApproved ? "#059669" : "#dc2626",
              }}
            >
              {isApproved ? "Aprobado" : "Rechazado"}
            </Text>
          </Column>
        </Row>
      </Section>

      {data.adminNotes && (
        <Section style={notesBoxStyle}>
          <Text style={sectionTitleStyle}>NOTAS DEL EQUIPO</Text>
          <Text style={notesTextStyle}>{data.adminNotes}</Text>
        </Section>
      )}

      {isApproved && data.returnAddress && (
        <Section style={addressBoxStyle}>
          <Text style={sectionTitleStyle}>DIRECCIÓN DE DEVOLUCIÓN</Text>
          <Text style={addressTextStyle}>{data.returnAddress}</Text>
        </Section>
      )}

      <Section style={{ marginTop: "24px" }}>
        <Text style={sectionTitleStyle}>PRODUCTOS EN REEMBOLSO</Text>
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
              </Column>
            </Row>
            {index < data.items.length - 1 && <Hr style={lightHrStyle} />}
          </React.Fragment>
        ))}
      </Section>

      <Section style={{ textAlign: "center", marginTop: "32px" }}>
        <Button href={orderUrl} style={primaryButtonStyle}>
          Ver Estado de mi Reembolso
        </Button>
      </Section>
    </BaseLayout>
  );
}

const bannerStyle = (approved: boolean): React.CSSProperties => ({
  backgroundColor: approved ? "#ecfdf5" : "#fef2f2",
  border: `1px solid ${approved ? "#a7f3d0" : "#fecaca"}`,
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  marginBottom: "20px",
});
const badgeStyle = (approved: boolean): React.CSSProperties => ({
  color: approved ? "#059669" : "#dc2626",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "1px",
  margin: "0 0 6px 0",
});
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
const amountValueStyle: React.CSSProperties = {
  color: "#f25c05",
  fontSize: "18px",
  fontWeight: "800",
  margin: "2px 0 0 0",
};
const lightHrStyle: React.CSSProperties = {
  borderColor: "#f1f5f9",
  margin: "8px 0",
};
const notesBoxStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "16px",
  marginTop: "20px",
};
const sectionTitleStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.5px",
  marginBottom: "12px",
};
const notesTextStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "12px",
  margin: "0",
  lineHeight: "1.5",
};
const addressBoxStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  padding: "16px",
  marginTop: "20px",
};
const addressTextStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "12px",
  margin: "0 0 2px 0",
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
