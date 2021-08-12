import { apiRequest } from "@/api";
import {
  AddonPrices,
  Invoice,
  Limits,
  Plan,
} from "@/services/billing/interfaces";

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
