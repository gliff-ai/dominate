import { apiRequest } from "@/api";
import { UserFeedback } from "./interfaces";

const createUserFeedback = (feedback: UserFeedback): Promise<number> =>
  apiRequest<number>("/feedback/", "POST", { ...feedback });

export { createUserFeedback };
export type { UserFeedback };
