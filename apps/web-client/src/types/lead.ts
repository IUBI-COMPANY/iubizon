// Tipos compartidos para productos y servicios
export type ServiceType =
  | "maintenance"
  | "repair"
  | "installation"
  | "calibration"
  | "cleaning"
  | "diagnosis"
  | "warranty"
  | "training"
  | "other";

export interface ProductItemList {
  id: string;
  quantity: number;
  brand: string;
  model: string;
  serviceType: ServiceType;
  type?: "sale" | "technical_service";
}
