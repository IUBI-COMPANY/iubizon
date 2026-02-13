export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  image?: string;
}

export interface ProjectorOption {
  id: string;
  name: string;
  tier: "Gama Baja" | "Gama Media" | "Gama Alta";
  description: string;
  image: string;
  price: number;
  specs: string[];
}

export interface TechnicalSpec {
  label: string;
  value: string;
  iconName?: string;
}

export interface UsageStep {
  step: number;
  title: string;
  description: string;
  icon: string;
}
