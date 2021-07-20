export interface CheckoutSession {
  id: string;
}

export interface User {
  username: string;
  authToken: string;
}

interface Team {
  id: number;
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
}

export interface Invite {
  email: string;
  team_id: number;
}
