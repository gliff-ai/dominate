export interface Limits {
  has_billing: boolean;
  tier_name: string;
  tier_id: number;
  users_limit: number;
  projects_limit: number;
  collaborators_limit: number;
  users: number;
  projects: number;
  collaborators: number;
  storage: number;
  storage_included_limit: number;
}

export interface Invoice {
  id: string;
  amount_due: number;
  amount_paid: number;
  created: number;
  invoice_pdf: string;
  number: string;
  paid: boolean;
  status: string;
}

export interface Plan {
  tier_name: "PRO" | "TEAM" | "COMMUNITY";
  tier_id: number;
  current_period_end: number;
  current_period_start: number;
  trial_end: number;
  base_price: number;
  addons: {
    project: Addon;
    user: Addon;
    collaborator: Addon;
  };
  billed_usage: number;
  billed_usage_gb_price: number;
  is_custom: boolean;
  is_trial: boolean;
}

export interface Addon {
  quantity: number;
  name: string;
  price_per_unit: number;
}

export interface AddonPrices {
  project: number | null;
  user: number | null;
  collaborator: number | null;
}

export interface Payment {
  number: string;
  expiry: string;
  brand: string;
  name: string;
}

export interface CheckoutSession {
  id: string;
}
