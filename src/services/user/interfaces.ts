interface User {
  username: string | null;
  authToken: string | null;
}

enum UserAccess {
  Owner = "owner",
  Member = "member",
  Collaborator = "collaborator",
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
interface UserProfile {
  id: number;
  name: string;
  team: Team;
  email_verified: boolean;
  email: string;
  is_collaborator: boolean;
}
interface Invite {
  email: string;
  team_id: number;
}

export { UserAccess };
export type { User, Team, UserProfile, Invite };
