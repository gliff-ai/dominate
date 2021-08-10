export interface Plan {
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
