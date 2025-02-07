"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";

export const streamTokenProvider = async () => {
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");

  const client = new StreamClient(process.env.NEXT_PUBLIC_STREAM_API_KEY!, process.env.STREAM_SECRET_KEY!);
  const token = client.generateUserToken({user_id: user?.id || ""});
  
  return token;
};