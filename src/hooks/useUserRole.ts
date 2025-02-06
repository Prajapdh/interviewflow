import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export function useUserRole() {
    const user = useUser();

    const userData = useQuery(api.users.getUserByClerkId, {clerkId: user.user?.id || ""});
    const isLoading = userData === undefined;
    const userRole = userData?.role;
    return{
        isLoading,
        isInterviewer: userRole === "interviewer",
        isCandidate: userRole === "candidate",
    };
}