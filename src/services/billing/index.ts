import { apiRequest } from "@/api";

import type { AddonPrices, Invoice, Limits, Plan, Payment } from "./interfaces";

export const getLimits = (): Promise<Limits> =>
  apiRequest<Limits>("/billing/limits", "GET");

export const getInvoices = (): Promise<Invoice[]> =>
  apiRequest<{ invoices: Invoice[] }>("/billing/invoices", "GET").then(
    ({ invoices }) => invoices
  );

export const getPlan = (): Promise<Plan> =>
  apiRequest<Plan>("/billing/plan", "GET");

export const getAddonPrices = (): Promise<AddonPrices> =>
  apiRequest<AddonPrices>("/billing/addon-prices", "GET");

export const getPayment = (): Promise<Payment> =>
  apiRequest<Payment>("/billing/payment-method", "GET");

export const addAddons = (
  users: number,
  projects: number,
  collaborators: number
): Promise<boolean> =>
  apiRequest<boolean>("/billing/addon", "POST", {
    users,
    projects,
    collaborators,
  });

export { AddonPrices, Invoice, Limits, Plan, Payment };
