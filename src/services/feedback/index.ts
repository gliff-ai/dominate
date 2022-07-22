import { apiRequest } from "@/api";
import { UserFeedback } from "./interfaces";

const createUserFeedback = (feedback: UserFeedback): Promise<number> =>
  apiRequest<number>("/feedback/", "POST", { ...feedback });

const canRequestFeedback = (): Promise<boolean> =>
  apiRequest<boolean>("/feedback/", "GET");

export { createUserFeedback, canRequestFeedback };
export type { UserFeedback };
