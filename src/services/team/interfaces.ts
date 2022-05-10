import { UserAccess } from "../user";

// NOTE: Profile and Team are taken from MANAGE
interface Profile {
  id: number;
  email: string;
  name: string;
  access: UserAccess;
  is_collaborator: boolean;
  is_trusted_service: boolean;
}

interface Team {
  owner: { id: number; email: string };
  profiles: Profile[];
  pending_invites: Array<{
    email: string;
    sent_date: string;
    is_collaborator: boolean;
  }>;
}

export type { Profile, Team };
