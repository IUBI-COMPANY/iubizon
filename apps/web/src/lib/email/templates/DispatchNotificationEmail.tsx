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
import type { DispatchEmailData } from "../types";

export function DispatchNotificationEmail(data: DispatchEmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iubizon.com";
  const orderUrl = `${baseUrl}/user/orders/${data.orderCode}`;

  return (
    <BaseLayout previewText={`¡Tu pedido #${data.orderCode} está en camino!`}>
      <Section style={bannerStyle}>
        <Text style={badgeStyle}>¡TU PEDIDO ESTÁ EN CAMINO!</Text>
        <Heading style={mainHeadingStyle}>
          ¡Buenas noticias, {data.buyerName}!
        </Heading>
        <Text style={subtitleStyle}>
          {data.companyName} ha despachado tu pedido y está en camino a tu
          domicilio. Revisa los datos de seguimiento para estar atento a la
          entrega.
        </Text>
      </Section>

      {/* Datos de Tracking */}
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
            <Text style={metaLabelStyle}>FECHA ESTIMADA DE ENTREGA</Text>
            <Text style={metaValueStyle}>{data.estimatedDelivery}</Text>
          </Column>
        </Row>
        {data.trackingUrl && (
          <>
            <Hr style={lightHrStyle} />
            <Section style={{ textAlign: "center", padding: "8px 0" }}>
              <Button href={data.trackingUrl} style={trackingButtonStyle}>
                Seguir mi envío en línea
              </Button>
            </Section>
          </>
        )}
      </Section>

      {/* Dirección de entrega */}
      <Section style={addressBoxStyle}>
        <Text style={sectionTitleStyle}>DIRECCIÓN DE ENTREGA</Text>
        <Text style={addressTextStyle}>{data.shippingAddress}</Text>
        <Text style={addressTextStyle}>{data.shippingCity}</Text>
      </Section>

      {/* Productos enviados */}
      <Section style={{ marginTop: "24px" }}>
        <Text style={sectionTitleStyle}>PRODUCTOS ENVIADOS</Text>
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
                  Despachado por: {item.companyName || item.sellerName}
                </Text>
              </Column>
            </Row>
            {index < data.items.length - 1 && <Hr style={lightHrStyle} />}
          </React.Fragment>
        ))}
      </Section>

      {/* Botón de acción */}
      <Section style={{ textAlign: "center", marginTop: "32px" }}>
        <Button href={orderUrl} style={primaryButtonStyle}>
          Ver Estado de mi Pedido
        </Button>
      </Section>
    </BaseLayout>
  );
}

const bannerStyle: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  marginBottom: "20px",
};
const badgeStyle: React.CSSProperties = {
  color: "#2563eb",
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
const trackingCardStyle: React.CSSProperties = {
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
const trackingCodeStyle: React.CSSProperties = {
  color: "#f25c05",
  fontSize: "18px",
  fontWeight: "800",
  margin: "2px 0 0 0",
  letterSpacing: "1px",
};
const lightHrStyle: React.CSSProperties = {
  borderColor: "#f1f5f9",
  margin: "8px 0",
};
const trackingButtonStyle: React.CSSProperties = {
  backgroundColor: "#2563eb",
  color: "#fff",
  fontSize: "13px",
  fontWeight: "700",
  borderRadius: "12px",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
};
const addressBoxStyle: React.CSSProperties = {
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
const sellerTagStyle: React.CSSProperties = {
  color: "#f25c05",
  fontSize: "11px",
  fontWeight: "600",
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
