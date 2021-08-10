import { apiRequest } from "@/api";
import { Invoice, Plan } from "@/services/billing/interfaces";

export const getPlan = (): Promise<Plan> =>
  apiRequest<Plan>("/billing/plan", "GET");

export const getInvoices = (): Promise<Invoice[]> =>
  apiRequest<{ invoices: Invoice[] }>("/billing/invoices", "GET").then(
    ({ invoices }) => invoices
  );
