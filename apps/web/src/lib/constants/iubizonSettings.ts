export interface IubizonWarehouseSettings {
  company_name: string;
  ruc: string;
  department: string;
  province: string;
  district: string;
  address: string;
  google_maps_url: string;
  phone: string;
}

export const DEFAULT_IUBIZON_SETTINGS: IubizonWarehouseSettings = {
  company_name: "IUBIZON COMPANY S.A.C.",
  ruc: "20614600374",
  department: "Lima",
  province: "Lima",
  district: "Chorrillos",
  address: "Calle las acacias, Pje. los Jazmines 181",
  google_maps_url: "https://maps.app.goo.gl/fd4ujCZW7B7WQc5X9",
  phone: "972300301",
};
