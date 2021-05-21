import { apiRequest } from "@/api";
import { CheckoutSession, UserProfile } from "./interfaces";

export const createCheckoutSession = (
  tier_id: string
): Promise<CheckoutSession> =>
  apiRequest<CheckoutSession>("/billing/create-checkout-session", "POST", {
    tier_id,
  });

export const createUserProfile = (name: string): Promise<UserProfile> =>
  apiRequest<UserProfile>("/user/", "POST", { name });
