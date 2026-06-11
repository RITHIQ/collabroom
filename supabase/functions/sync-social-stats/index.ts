// Supabase Edge Function (Deno) — scheduled social stats sync
// - YouTube: uses public YouTube Data API v3 with an API key (free quota)
// - Instagram: requires Instagram Graph API + Business/Creator accounts; this function stores placeholders unless tokens exist

import { createClient } from "jsr:@supabase/supabase-js@2";

type SocialConnection = {
  user_id: string;
  provider: string;
  provider_user_id: string | null;
  handle: string | null;
  access_token: string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: connections, error } = await supabase
    .from("social_connections")
    .select("user_id,provider,provider_user_id,handle,access_token");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");

  const results: Array<{ user_id: string; provider: string; ok: boolean; reason?: string }> = [];

  for (const c of (connections ?? []) as SocialConnection[]) {
    if (c.provider === "youtube") {
      if (!youtubeApiKey) {
        results.push({ user_id: c.user_id, provider: c.provider, ok: false, reason: "Missing YOUTUBE_API_KEY" });
        continue;
      }

      const channelIdOrHandle = c.provider_user_id ?? c.handle;
      if (!channelIdOrHandle) {
        results.push({ user_id: c.user_id, provider: c.provider, ok: false, reason: "Missing channel id/handle" });
        continue;
      }

      // Accept either channel ID (UC...) or handle (@foo). For handle, try "forHandle".
      const url = channelIdOrHandle.startsWith("@")
        ? `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${encodeURIComponent(channelIdOrHandle.slice(1))}&key=${youtubeApiKey}`
        : `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${encodeURIComponent(channelIdOrHandle)}&key=${youtubeApiKey}`;

      const res = await fetch(url);
      if (!res.ok) {
        results.push({ user_id: c.user_id, provider: c.provider, ok: false, reason: `YouTube API ${res.status}` });
        continue;
      }
      const json = await res.json();
      const item = json?.items?.[0];
      const stats = item?.statistics;
      if (!stats) {
        results.push({ user_id: c.user_id, provider: c.provider, ok: false, reason: "No stats returned" });
        continue;
      }

      const followers = stats.subscriberCount ? Number(stats.subscriberCount) : null;
      const views = stats.viewCount ? Number(stats.viewCount) : null;
      const posts = stats.videoCount ? Number(stats.videoCount) : null;

      const { error: insertErr } = await supabase.from("social_stats_snapshots").insert({
        user_id: c.user_id,
        provider: "youtube",
        followers,
        views,
        posts,
        raw: json,
      });

      if (insertErr) {
        results.push({ user_id: c.user_id, provider: c.provider, ok: false, reason: insertErr.message });
        continue;
      }

      results.push({ user_id: c.user_id, provider: c.provider, ok: true });
      continue;
    }

    if (c.provider === "instagram") {
      // Instagram insights require Graph API + OAuth tokens; store a placeholder snapshot if token exists later.
      // For now, insert a snapshot with raw metadata so the app can show "connected but pending sync".
      const { error: insertErr } = await supabase.from("social_stats_snapshots").insert({
        user_id: c.user_id,
        provider: "instagram",
        followers: null,
        views: null,
        posts: null,
        raw: { note: "Instagram insights require Graph API + Business/Creator account; configure tokens to sync." },
      });

      if (insertErr) {
        results.push({ user_id: c.user_id, provider: c.provider, ok: false, reason: insertErr.message });
        continue;
      }

      results.push({ user_id: c.user_id, provider: c.provider, ok: true });
      continue;
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

