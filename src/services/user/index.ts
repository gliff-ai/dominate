import { apiRequest } from "@/api";
import { UserProfile, Invite, UserAccess } from "./interfaces";

export const createUserProfile = (
  name: string,
  teamId: number | null = null,
  inviteId: string | null = null,
  acceptedTermsAndConditions = false,
  recovery: string,
  tierId: number | null = null
): Promise<UserProfile> =>
  apiRequest<UserProfile>("/user/", "POST", {
    name,
    team_id: teamId,
    invite_id: inviteId,
    accepted_terms_and_conditions: acceptedTermsAndConditions,
    recovery_key: recovery,
    tier_id: tierId,
  });

export const getUserProfile = (): Promise<UserProfile> =>
  apiRequest<UserProfile>("/user/", "GET");

export const inviteNewUser = (email: string): Promise<unknown> =>
  apiRequest<unknown>("/user/invite/", "POST", { email });

export const inviteNewCollaborator = (email: string): Promise<unknown> =>
  apiRequest<unknown>("/user/invite/collaborator/", "POST", { email });

export const getInvite = (inviteId: string): Promise<Invite> =>
  apiRequest<Invite>(`/user/invite?invite_id=${inviteId}`, "GET");

export const getRecoverySession = (
  uid: string
): Promise<{ recovery_key: string }> =>
  apiRequest<{ recovery_key: string }>(`/user/recover/${uid}`, "GET");

export { UserAccess };
