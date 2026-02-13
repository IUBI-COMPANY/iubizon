import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "iubizon - Bundle Interactivo",
  description: "Bundle interactivo con proyector, pantalla táctil y MiraCast",
};

export default function BundleInteractivoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
