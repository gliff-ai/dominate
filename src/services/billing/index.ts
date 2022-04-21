import { apiRequest } from "@/api";

import type {
  AddonPrices,
  Invoice,
  Limits,
  Plan,
  Plans,
  Payment,
  CheckoutSession,
} from "./interfaces";

export const getLimits = (): Promise<Limits> =>
  apiRequest<Limits>("/billing/limits", "GET");

export const getInvoices = (): Promise<Invoice[]> =>
  apiRequest<{ invoices: Invoice[] }>("/billing/invoices", "GET").then(
    ({ invoices }) => invoices
  );

export const getPlan = (): Promise<Plan> =>
  apiRequest<Plan>("/billing/plan", "GET");

export const getAllPlans = (): Promise<Plans> =>
  apiRequest<Plans>("/billing/plans", "GET");

export const getAddonPrices = (): Promise<AddonPrices> =>
  apiRequest<AddonPrices>("/billing/addon-prices", "GET");

export const getPayment = (): Promise<Payment | null> =>
  apiRequest<Payment | null>("/billing/payment-method", "GET");

export const addAddons = (
  users: number,
  projects: number,
  collaborators: number
): Promise<boolean> =>
  apiRequest<boolean>("/billing/addon/", "POST", {
    users,
    projects,
    collaborators,
  });

export const upgradePlan = (tier_id: number): Promise<Plan> =>
  apiRequest<Plan>("/billing/plan/", "POST", {
    tier_id,
  });

export const createCheckoutSession = (): Promise<CheckoutSession | null> =>
  apiRequest<CheckoutSession | null>(
    "/billing/create-checkout-session/",
    "POST"
  );

export const cancelPlan = (): Promise<null> =>
  apiRequest<null>("/billing/cancel/", "POST");

export { AddonPrices, Invoice, Limits, Plan, Payment, Plans };
