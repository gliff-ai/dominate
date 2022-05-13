import { apiRequest } from "@/api";
import { Team, Profile } from "./interfaces";

export const getTeam = (): Promise<Team> => apiRequest<Team>("/team/", "GET");
export type { Profile, Team };
