export interface CheckoutSession {
  id: string;
}

export interface User {
  username: string | null;
  authToken: string | null;
}

interface Team {
  id: number;
  name: string;
  owner_id: number;
  tier: {
    id: number;
    name: string;
  };
  usage: number;
}

export interface UserProfile {
  id: number;
  name: string;
  team: Team;
  email_verified: boolean;
  email: string;
  is_collaborator: boolean;
}

export interface Invite {
  email: string;
  team_id: number;
}
