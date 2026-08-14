export interface AdminNiubizConfig {
  environment: "sandbox" | "production";
  merchantId: string;
  user: string;
  password: string;
  baseUrl: string;
  securityUrl: string;
}
