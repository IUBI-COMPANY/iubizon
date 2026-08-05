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
import type { SellerEmailData } from "../types";

export function SellerSaleEmail(data: SellerEmailData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iubizon.com";
  const dispatchUrl = `${baseUrl}/user/dashboard/orders/${data.packageCode}`;

  const formattedSubtotal = `S/ ${data.packageSubtotal.toFixed(2)}`;
  const formattedCommission = `S/ ${data.commissionAmount.toFixed(2)}`;
  const formattedNetPayout = `S/ ${data.netPayoutEstimate.toFixed(2)}`;

  return (
    <BaseLayout
      previewText={`¡Nueva venta por despachar! Paquete ${data.packageCode}`}
    >
      {/* Banner de Nueva Venta */}
      <Section style={saleBannerStyle}>
        <Text style={saleBadgeStyle}>¡NUEVA VENTA REGISTRADA!</Text>
        <Heading style={mainHeadingStyle}>
          {data.isCompanyRecipient
            ? `¡Hola equipo de ${data.recipientName}! Tienen productos por despachar`
            : `¡Hola ${data.recipientName}! Tienes productos por despachar`}
        </Heading>
        <Text style={subtitleStyle}>
          Un cliente ha realizado un pago exitoso por productos de tu catálogo.
          Prepara los ítems y confirma el despacho desde tu panel.
        </Text>
      </Section>

      {/* Tarjeta de Código de Paquete */}
      <Section style={packageCardStyle}>
        <Row>
          <Column style={{ padding: "8px 12px" }}>
            <Text style={metaLabelStyle}>CÓDIGO DE PAQUETE VENDEDOR</Text>
            <Text style={packageCodeValueStyle}>{data.packageCode}</Text>
          </Column>
          <Column style={{ padding: "8px 12px", textAlign: "right" }}>
            <Text style={metaLabelStyle}>PEDIDO ASOCIADO</Text>
            <Text style={metaValueStyle}>{data.orderCode}</Text>
            <Text style={metaDateStyle}>{data.createdAt}</Text>
          </Column>
        </Row>
      </Section>

      {/* Datos del Cliente y Dirección para el Despacho */}
      <Section style={buyerBoxStyle}>
        <Text style={sectionTitleStyle}>
          DATOS DEL COMPRADOR Y DIRECCIÓN DE ENVÍO
        </Text>
        <Text style={buyerTextStyle}>
          <strong>Cliente:</strong> {data.buyerInfo.name}
        </Text>
        <Text style={buyerTextStyle}>
          <strong>Dirección de Entrega:</strong> {data.buyerInfo.address},{" "}
          {data.buyerInfo.city}
        </Text>
        <Text style={buyerTextStyle}>
          <strong>Teléfono de Contacto:</strong> {data.buyerInfo.phone}
        </Text>
        <Text style={buyerTextStyle}>
          <strong>Email:</strong> {data.buyerInfo.email}
        </Text>
        {data.buyerInfo.notes && (
          <Text style={buyerTextStyle}>
            <strong>Notas especiales de entrega:</strong> {data.buyerInfo.notes}
          </Text>
        )}
      </Section>

      {/* Lista de Productos a Despachar */}
      <Section style={{ marginTop: "24px" }}>
        <Text style={sectionTitleStyle}>ÍTEMS A PREPARAR Y DESPACHAR</Text>
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
                    Cantidad a enviar: <strong>{item.quantity} un.</strong> (S/{" "}
                    {item.price.toFixed(2)} c/u)
                  </Text>
                  {data.isCompanyRecipient && item.sellerName && (
                    <Text style={itemSellerStyle}>
                      Publicado por: {item.sellerName}
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

      {/* Desglose Financiero para el Vendedor */}
      <Section style={totalsBoxStyle}>
        <Row style={totalRowStyle}>
          <Column>
            <Text style={totalLabelStyle}>Subtotal de tus productos:</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={totalValueStyle}>{formattedSubtotal}</Text>
          </Column>
        </Row>
        <Row style={totalRowStyle}>
          <Column>
            <Text style={totalLabelStyle}>Comisión iubizon:</Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={commissionTextStyle}>- {formattedCommission}</Text>
          </Column>
        </Row>
        <Hr style={lightHrStyle} />
        <Row style={{ marginTop: "8px" }}>
          <Column>
            <Text style={grandTotalLabelStyle}>
              ABONO NETO ESTIMADO A TU CUENTA:
            </Text>
          </Column>
          <Column style={{ textAlign: "right" }}>
            <Text style={grandTotalValueStyle}>{formattedNetPayout}</Text>
          </Column>
        </Row>
      </Section>

      {/* Botón de Acción Principal para el Vendedor */}
      <Section style={{ textAlign: "center", marginTop: "32px" }}>
        <Button href={dispatchUrl} style={primaryButtonStyle}>
          Confirmar Despacho en Panel
        </Button>
      </Section>
    </BaseLayout>
  );
}

// Estilos Inline Específicos para Vendedor
const saleBannerStyle: React.CSSProperties = {
  backgroundColor: "#fff7ed",
  border: "1px solid #ffedd5",
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center",
  marginBottom: "20px",
};

const saleBadgeStyle: React.CSSProperties = {
  color: "#f25c05",
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

const packageCardStyle: React.CSSProperties = {
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

const packageCodeValueStyle: React.CSSProperties = {
  color: "#f25c05",
  fontSize: "14px",
  fontWeight: "800",
  margin: "2px 0 0 0",
};

const metaValueStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "12px",
  fontWeight: "700",
  margin: "2px 0 0 0",
};

const metaDateStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  margin: "2px 0 0 0",
};

const buyerBoxStyle: React.CSSProperties = {
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

const buyerTextStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "12px",
  margin: "0 0 6px 0",
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
  margin: "0",
};

const itemSellerStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "11px",
  fontStyle: "italic",
  margin: "2px 0 0 0",
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

const commissionTextStyle: React.CSSProperties = {
  color: "#ef4444",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0",
};

const grandTotalLabelStyle: React.CSSProperties = {
  color: "#112237",
  fontSize: "13px",
  fontWeight: "800",
  margin: "0",
};

const grandTotalValueStyle: React.CSSProperties = {
  color: "#16a34a",
  fontSize: "16px",
  fontWeight: "800",
  margin: "0",
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#112237",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700",
  borderRadius: "12px",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};
