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
  acceptedTermsAndConditions = false,
  recovery: string
): Promise<UserProfile> =>
  apiRequest<UserProfile>("/user/", "POST", {
    name,
    team_id: teamId,
    invite_id: inviteId,
    accepted_terms_and_conditions: acceptedTermsAndConditions,
    recovery_key: recovery,
  });

export const getUserProfile = (): Promise<UserProfile> =>
  apiRequest<UserProfile>("/user/", "GET");

export const inviteNewUser = (email: string): Promise<unknown> =>
  apiRequest<unknown>("/user/invite", "POST", { email });

export const inviteNewCollaborator = (email: string): Promise<unknown> =>
  apiRequest<unknown>("/user/invite/collaborator", "POST", { email });

export const getInvite = (inviteId: string): Promise<Invite> =>
  apiRequest<Invite>(`/user/invite?invite_id=${inviteId}`, "GET");

export const getRecoverySession = (
  uid: string
): Promise<{ recovery_key: string }> =>
  apiRequest<{ recovery_key: string }>(`/user/recover/${uid}`, "GET");
