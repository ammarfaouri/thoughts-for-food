import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../../api/client";

export const userKeys = {
  all: ["users"] as const,
  profile: (username: string) => [...userKeys.all, "profile", username] as const,
};

export function useUserProfileQuery(username: string) {
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => getUserProfile(username),
    enabled: Boolean(username),
  });
}
