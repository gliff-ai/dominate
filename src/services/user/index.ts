import { apiRequest } from "@/api";
import { CheckoutSession, UserProfile, Invite } from "./interfaces";

export const createCheckoutSession = (
  tier_id: string
): Promise<CheckoutSession> =>
  apiRequest<CheckoutSession>("/billing/create-checkout-session", "POST", {
    tier_id,
  });

export const createUserProfile = (
  name: string,
  teamId: number = null,
  inviteId: string = null,
  recovery: string
): Promise<UserProfile> =>
  apiRequest<UserProfile>("/user/", "POST", {
    name,
    team_id: teamId,
    invite_id: inviteId,
    recovery_key: recovery,
  });

export const inviteNewUser = (email: string): Promise<unknown> =>
  apiRequest<unknown>("/user/invite", "POST", { email });

export const getInvite = (inviteId: string): Promise<Invite> =>
  apiRequest<Invite>(`/user/invite?invite_id=${inviteId}`, "GET");
