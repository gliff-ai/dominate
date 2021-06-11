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
}

export interface UserProfile {
  id: number;
  name: string;
  team: Team;
}

export interface Invite {
  email: string;
  team_id: number;
}
