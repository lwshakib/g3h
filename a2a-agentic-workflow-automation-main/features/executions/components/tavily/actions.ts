'use server'

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { tavilyChannel } from "@/inngest/channels/tavily";
import { inngest } from "@/inngest/client";

export type TavilyToken = Realtime.Token<
  typeof tavilyChannel,
  ["status"]
>;

export async function fetchTavilyRealtimeToken(): Promise<TavilyToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: tavilyChannel(),
    topics: ["status"],
  });

  return token;
}

