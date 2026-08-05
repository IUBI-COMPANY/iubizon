import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
  Preview,
} from "@react-email/components";

interface BaseLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export function BaseLayout({ previewText, children }: BaseLayoutProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iubizon.com";

  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainBodyStyle}>
        <Container style={containerStyle}>
          {/* Header Bar con Logo de iubizon */}
          <Section style={headerSectionStyle}>
            <Link href={baseUrl} style={logoTextStyle}>
              iubizon<span style={orangeDotStyle}>.com</span>
            </Link>
            <Text style={taglineStyle}>
              Marketplace para Colegios y Empresas
            </Text>
          </Section>

          {/* Contenido Principal */}
          <Section style={contentSectionStyle}>{children}</Section>

          <Hr style={hrStyle} />

          {/* Footer Legal */}
          <Section style={footerSectionStyle}>
            <Text style={footerTextStyle}>
              © {new Date().getFullYear()} iubizon Company S.A.C. (RUC
              20614600374). Todos los derechos reservados.
            </Text>
            <Text style={footerSubTextStyle}>
              Lima, Perú • Soporte:{" "}
              <Link
                href="mailto:iubizon.company@gmail.com"
                style={footerLinkStyle}
              >
                iubizon.company@gmail.com
              </Link>
            </Text>
            <Text style={footerSubTextStyle}>
              <Link href={`${baseUrl}/terms`} style={footerLinkStyle}>
                Términos y Condiciones
              </Link>{" "}
              |{" "}
              <Link href={`${baseUrl}/privacy`} style={footerLinkStyle}>
                Política de Privacidad
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos Inline Responsivos
const mainBodyStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: "0 auto",
  padding: "20px 10px",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  maxWidth: "600px",
  margin: "0 auto",
  overflow: "hidden",
};

const headerSectionStyle: React.CSSProperties = {
  backgroundColor: "#112237",
  padding: "24px 32px",
  textAlign: "center",
};

const logoTextStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "800",
  textDecoration: "none",
  letterSpacing: "-0.5px",
};

const orangeDotStyle: React.CSSProperties = {
  color: "#f25c05",
};

const taglineStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "4px 0 0 0",
  fontWeight: "500",
};

const contentSectionStyle: React.CSSProperties = {
  padding: "32px 28px",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "0",
};

const footerSectionStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  padding: "24px 28px",
  textAlign: "center",
};

const footerTextStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "12px",
  fontWeight: "600",
  margin: "0 0 4px 0",
};

const footerSubTextStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "11px",
  margin: "2px 0",
};

const footerLinkStyle: React.CSSProperties = {
  color: "#f25c05",
  textDecoration: "none",
  fontWeight: "600",
};
