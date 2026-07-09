// WC Tracker — Web Push gönderen Edge Function.
// Gizli anahtar: Supabase panelinde Edge Function secret olarak VAPID_PRIVATE_KEY
// (ve isteğe bağlı VAPID_SUBJECT) tanımlanmalı. Public anahtar aşağıda gömülü.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC = "BMZq1t6PzDqB3cogS3oWvK4KI0HIhpdT_ZmEEG__HCwPWhFP_SBO7x-84ZW-srK71UCo3pgXp5jrBJ2NCt5LtgI";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:bekircankllolu@gmail.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  if (!VAPID_PRIVATE) {
    return new Response(JSON.stringify({ error: "VAPID_PRIVATE_KEY not set" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  let payload: { title?: string; body?: string; tag?: string; excludeEndpoint?: string; onlyMember?: string; excludeMember?: string } = {};
  try { payload = await req.json(); } catch { /* boş */ }
  const title = payload.title ?? "WC Tracker";
  const body = payload.body ?? "";
  const tag = payload.tag ?? "wc";

  let query = supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth, member_name");
  if (payload.onlyMember) query = query.eq("member_name", payload.onlyMember);
  const { data: subs, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const notification = JSON.stringify({ title, body, tag });
  let sent = 0;
  const stale: string[] = [];
  await Promise.all((subs ?? []).map(async (s) => {
    if (payload.excludeEndpoint && s.endpoint === payload.excludeEndpoint) return;
    if (payload.excludeMember && s.member_name === payload.excludeMember) return;
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        notification,
      );
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) stale.push(s.id);
    }
  }));

  if (stale.length) await supabase.from("push_subscriptions").delete().in("id", stale);

  return new Response(JSON.stringify({ sent, removed: stale.length }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
